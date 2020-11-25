import logging
import tornado.web
import json
import traceback
from h9web.handler import BaseHandler
from h9.msg import H9SendFrame, H9ExecuteMethod


class BaseAPIHandler(BaseHandler):
    def set_default_headers(self):
        self.set_header('Content-Type', 'application/json')

    def write_error(self, status_code, **kwargs):
        self.set_header('Content-Type', 'application/json')
        if self.settings.get("serve_traceback") and "exc_info" in kwargs:
            lines = []
            for line in traceback.format_exception(*kwargs["exc_info"]):
                lines.append(line)
            self.finish(json.dumps({
                    'code': status_code,
                    'message': self._reason,
                    'traceback': lines,
            }))
        else:
            self.finish(json.dumps({
                'error': {
                    'code': status_code,
                    'message': self._reason,
                }
            }))

    def prepare(self):
        super(BaseAPIHandler, self).prepare()
        if not self.get_current_user():
            raise tornado.web.HTTPError(401)


class H9webAPI(BaseAPIHandler):
    def initialize(self, h9bus_int):
        super(H9webAPI, self).initialize()
        self.debug = self.settings.get('debug', False)
        self.h9bus = h9bus_int

    @tornado.web.authenticated
    def post(self):
        try:
            msg = json.loads(self.request.body)
            frame = H9SendFrame(priority=H9SendFrame.Priority[msg['priority']], frametype=H9SendFrame.FrameType(int(msg['type'])), seqnum=int(msg['seqnum']), source=int(msg['source']),
                            destination=int(msg['destination']), data=msg['data'])
        except json.JSONDecodeError:
            raise tornado.web.HTTPError(400, reason='Invalid JSON')
        except ValueError:
            raise tornado.web.HTTPError(400, reason='Invalid frame parameters')
        logging.debug('Send frame: ' + str(frame))
        self.h9bus.send_frame(frame)

class DevAPI(BaseAPIHandler):
    def initialize(self, h9d_int):
        super(DevAPI, self).initialize()
        self.debug = self.settings.get('debug', False)
        self.h9d = h9d_int

    @tornado.web.authenticated
    def post(self):
        try:
            req = json.loads(self.request.body)
            msg = H9ExecuteMethod('dev')
            msg.value = {'object': req['object'], 'id': int(req['id']), 'method': req['method'], 'variable_antenna': int(req['variable']['antenna'])}
        except json.JSONDecodeError:
            raise tornado.web.HTTPError(400, reason='Invalid JSON')
        except ValueError:
            raise tornado.web.HTTPError(400, reason='Invalid frame parameters')

        self.h9d.send_msg(msg)