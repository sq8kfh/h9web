import json
import logging
import struct
import weakref
import tornado.web
import pty
import fcntl
import os
import termios
from tornado.ioloop import IOLoop
from json.decoder import JSONDecodeError
from h9web.worker import Worker
from h9web.handler import CommonHandler


class CliWSHandler(tornado.websocket.WebSocketHandler, CommonHandler):
    def initialize(self, loop):
        self.loop = loop
        self.worker_ref = None
        self.cli = self.settings['cli']

    def check_origin(self, origin):
        return True


    def get_current_user(self):
        return "kfh" #self.get_secure_cookie("authenticated")

    def prepare(self):
        pass
        #return True
        #if not self.get_current_user():
        #    raise tornado.web.HTTPError(401)

    def spawn_cli(self):
        (child_pid, fd) = pty.fork()
        if child_pid == 0:
            # this is the child process fork.
            # anything printed here will show up in the pty, including the output
            # of this subprocess
            os.execv(self.cli, [self.cli.split('/')[-1]])

        flag = fcntl.fcntl(fd, fcntl.F_GETFD)
        fcntl.fcntl(fd, fcntl.F_SETFL, flag | os.O_NONBLOCK)

        worker = Worker(self.loop, child_pid, fd)
        worker.encoding = 'utf-8'
        return worker

    def open(self):
        self.src_addr = self.get_client_addr()
        logging.info('Connected from {}:{}'.format(*self.src_addr))

        worker = self.spawn_cli()
        if worker:
            self.set_nodelay(True)
            worker.set_handler(self)
            self.worker_ref = weakref.ref(worker)
            self.loop.add_handler(worker.fd, worker, IOLoop.READ)
        else:
            self.close(reason='Websocket authentication failed.')

    def on_message(self, message):
        logging.debug('{!r} from {}:{}'.format(message, *self.src_addr))
        worker = self.worker_ref()
        try:
            msg = json.loads(message)
        except JSONDecodeError:
            return

        if not isinstance(msg, dict):
            return

        resize = msg.get('resize')
        if resize and len(resize) == 2:
            winsize = struct.pack("HHHH", resize[1], resize[0], 0, 0)
            fcntl.ioctl(worker.fd, termios.TIOCSWINSZ, winsize)

        data = msg.get('data')
        if data and isinstance(data, str):
            worker.data_to_dst.append(data)
            worker.on_write()

    def on_close(self):
        logging.info('Disconnected from {}:{}'.format(*self.src_addr))
        if not self.close_reason:
            self.close_reason = 'client disconnected'

        worker = self.worker_ref() if self.worker_ref else None
        if worker:
            worker.close(reason=self.close_reason)
