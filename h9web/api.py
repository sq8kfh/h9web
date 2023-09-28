import logging
import tornado.web
import json
import traceback
from dateutil import parser
from dateutil import tz
from asyncio import IncompleteReadError
from tornado.queues import Queue
from h9web.handler import BaseHandler
from h9.msg import H9SendFrame, H9ExecuteMethod, H9MethodResponse, H9ExecuteDeviceMethod, H9DeviceMethodResponse, H9Error
from h9.asyncmsgstream import H9msgStream


class BaseAPIHandler(BaseHandler):
    h9d_connection_pool = None

    async def get_h9d_connection(self):
        if BaseAPIHandler.h9d_connection_pool is None:
            BaseAPIHandler.h9d_connection_pool = Queue()
            for i in range(5):
                h9d_stream = H9msgStream(self.settings.get('h9d_address'), self.settings.get('h9d_port'))
                await h9d_stream.connect("h9web_cp")
                await BaseAPIHandler.h9d_connection_pool.put(h9d_stream)
        return await BaseAPIHandler.h9d_connection_pool.get()

    def return_h9d_connection(self, connection):
        BaseAPIHandler.h9d_connection_pool.put_nowait(connection)

    async def h9d_connection_send_msg_get_response(self, msg):
        h9d_connection = await self.get_h9d_connection()
        h9d_connection.writemsg(msg)
        try:
            msg = await h9d_connection.readmsg()
        except IncompleteReadError as e:
            logging.warning("Restoring h9d connection...")
            h9d_connection = H9msgStream(self.settings.get('h9d_address'), self.settings.get('h9d_port'))
            await h9d_connection.connect("h9web_cp")
            h9d_connection.writemsg(msg)
            msg = await h9d_connection.readmsg()
        self.return_h9d_connection(h9d_connection)
        return msg


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

    #@tornado.web.authenticated
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


class ExecuteMethodAPI(BaseAPIHandler):
    def initialize(self, h9d_int):
        super().initialize()
        self.debug = self.settings.get('debug', False)
        self.h9d = h9d_int

    #@tornado.web.authenticated
    async def post(self, method_name):
        logging.debug("Execute method '" + method_name + "'")
        msg = H9ExecuteMethod(method_name)
        if self.request.body:
            msg.value = json.loads(self.request.body)

        msg = await self.h9d_connection_send_msg_get_response(msg)

        #h9d_connection = await self.get_h9d_connection()
        #h9d_connection.writemsg(msg)
        #msg = await h9d_connection.readmsg()
        #self.return_h9d_connection(h9d_connection)

        if isinstance(msg, H9MethodResponse):
            r = json.dumps(msg.to_dict())
            if msg.error_code != 0:
                self.set_status(400)
                r = json.dumps({
                    'error': {
                        'code': msg.error_code,
                        # 'name': msg.name,
                        'message': msg.error_message,
                    }
                })
            self.write(r)
        elif isinstance(msg, H9Error):
            self.set_status(400)
            r = json.dumps({
                'error': {
                    'code': msg.code,
                    'name': msg.name,
                    'message': msg.message,
                }
            })
            self.write(r)

    #@tornado.web.authenticated
    async def get(self, method_name):
        await self.post(method_name)


class ExecuteDeviceMethodAPI(BaseAPIHandler):
    def initialize(self, h9d_int):
        super().initialize()
        self.debug = self.settings.get('debug', False)
        self.h9d = h9d_int

   # @tornado.web.authenticated
    async def post(self, device_id, method_name):
        logging.debug("Execute device (id: " + device_id +") method '" + method_name)
        msg = H9ExecuteDeviceMethod(device_id, method_name)
        if self.request.body:
            msg.value = json.loads(self.request.body)

        msg = await self.h9d_connection_send_msg_get_response(msg)

        #h9d_connection = await self.get_h9d_connection()
        #h9d_connection.writemsg(msg)
        #msg = await h9d_connection.readmsg()
        #self.return_h9d_connection(h9d_connection)

        if isinstance(msg, H9DeviceMethodResponse):
            r = json.dumps(msg.to_dict())
            if msg.error_code != 0:
                self.set_status(400)
                r = json.dumps({
                    'error': {
                        'code': msg.error_code,
                        #'name': msg.name,
                        'message': msg.error_message,
                    }
                })
            elif msg.method == 'info':
                tmp = msg.value
                created_time_utc = parser.isoparse(tmp['created_time'])
                last_seen_time_utc = parser.isoparse(tmp['last_seen_time'])
                to_zone = tz.tzlocal()
                tmp['created_time'] = created_time_utc.astimezone(to_zone).strftime("%Y-%m-%d %H:%M")
                tmp['last_seen_time'] = last_seen_time_utc.astimezone(to_zone).strftime("%Y-%m-%d %H:%M")
                msg.value = tmp
                r = json.dumps(msg.to_dict())
            self.write(r)
        elif isinstance(msg, H9Error):
            logging.debug(msg)
            self.set_status(400)
            r = json.dumps({
                'error': {
                    'code': msg.code,
                    'name': msg.name,
                    'message': msg.message,
                }
            })
            self.write(r)


    #@tornado.web.authenticated
    async def get(self, device_id, method_name):
        await self.post(device_id, method_name)
