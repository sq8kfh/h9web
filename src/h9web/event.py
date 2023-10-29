import logging
import json

import tornado.web
from tornado.iostream import StreamClosedError
from h9web.api import BaseAPIHandler
# from h9.msg import H9Frame, H9ExecuteMethod, H9MethodResponse, H9DeviceEvent


#TODO: https://github.com/mpetazzoni/sse.js ?

class Event(BaseAPIHandler):
    def initialize(self, h9d_int):
        self.h9d = h9d_int
        self.set_header('Content-Type', 'text/event-stream')
        self.set_header('Cache-Control', 'no-cache')

        self.run = True
        self.context = self.request.connection.context

        Event.subscribers.append(self)
        logging.info('Connected event subscribers {}:{}'.format(*self.context.address[:2]))

    def convert_uptime(self, n):
        n = int(n)
        day = n // (24 * 3600)
        n = n % (24 * 3600)
        hour = n // 3600
        n %= 3600
        minutes = n // 60
        n %= 60
        seconds = n
        ret = ''
        if day:
            ret = ret + str(day) + ' days'
        if hour:
            ret = ret + str(hour) + ' hours '
        if minutes:
            ret = ret + str(minutes) + ' minutes'
        if not ret:
            ret = ret + str(seconds) + ' seconds'
        return ret

    async def publish_on_frame(self, frame):
        try:
            logging.debug('Event on_frame {!r}'.format(frame))
            self.write('event: on_frame\n')
            self.write('id: 1\n')
            self.write('data: {}\n\n'.format(json.dumps(frame)))
            await self.flush()
        except StreamClosedError:
            self.run = False

    async def publish_on_dev_status_update(self, status):
        try:
            logging.debug('Event on_dev_status_update {!r}'.format(status))
            self.write('event: on_dev_status_update\n')
            self.write('id: 1\n')
            self.write('data: {}\n\n'.format(json.dumps(status)))
            await self.flush()
        except StreamClosedError:
            self.run = False

    # @tornado.web.authenticated
    async def get(self):
        try:
            self.write('event: connection\n')
            self.write('data: established\n\n')
            await self.flush()
        except StreamClosedError:
            self.run = False
        while self.run:
            # msg = H9ExecuteMethod('h9bus_stat')
            # self.h9bus.send_frame(msg)
            # msg = H9ExecuteMethod('h9d_stat')
            # self.h9d.send_msg(msg)
            await tornado.web.gen.sleep(60)

    def on_finish(self):
        logging.info('Disconnected event subscribers {}:{}'.format(*self.context.address[:2]))
        Event.subscribers.remove(self)

    subscribers = []

    @classmethod
    async def publish_to_all(cls, notification):
        if notification.method == "on_frame":
            frame = notification.params["frame"]
            logging.info('Event on_frame {!r}'.format(frame))
            frame["priority"] = 0 if frame["priority"] == "H" else 1
            await tornado.web.gen.multi([sub.publish_on_frame(frame) for sub in cls.subscribers])
        elif notification.method == "dev_status_update":
            status = notification.params["status"]
            logging.info('Event dev_status_update {!r}'.format(status))
            await tornado.web.gen.multi([sub.publish_on_dev_status_update(status) for sub in cls.subscribers])
        # if isinstance(message, H9Frame):
        #     await tornado.web.gen.multi([sub.publish_h9bus_frame(message) for sub in cls.subscribers])
        # if isinstance(message, H9MethodResponse) and message.method == 'h9bus_stat':
        #     await tornado.web.gen.multi([sub.publish_h9bus_stat(message) for sub in cls.subscribers])
        # if isinstance(message, H9MethodResponse) and message.method == 'h9d_stat':
        #     await tornado.web.gen.multi([sub.publish_h9d_stat(message) for sub in cls.subscribers])
        # if isinstance(message, H9DeviceEvent):
        #     await tornado.web.gen.multi([sub.publish_device_event(message) for sub in cls.subscribers])
