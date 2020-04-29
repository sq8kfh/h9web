import logging
import json

from tornado import web, gen
from tornado.iostream import StreamClosedError
from h9.msg import H9frame

class Event(web.RequestHandler):
    def initialize(self, loop=None):
        self.loop = loop
        self.set_header('content-type', 'text/event-stream')
        self.set_header('cache-control', 'no-cache')

        self.run = True
        self.context = self.request.connection.context

        Event.subscribers.append(self)
        logging.info('Connected event subscribers {}:{}'.format(*self.context.address[:2]))


    async def publish_h9bus_frame(self, msg):
        try:
            dict_data = {"type": "h9frame", "data": msg.to_dict()}
            json_data = json.dumps(dict_data)
            logging.debug('Event send {!r}'.format(json_data))

            self.write('data: {}\n\n'.format(json_data))
            await self.flush()
        except StreamClosedError:
            self.run = False


    async def get(self):
        while self.run:
            await gen.sleep(10)

    def on_finish(self):
        logging.info('Disconnected event subscribers {}:{}'.format(*self.context.address[:2]))
        Event.subscribers.remove(self)

    subscribers = []

    @classmethod
    async def publish_to_all(cls, message):
        print("Writing to Clients")
        if isinstance(message, H9frame):
            await gen.multi([sub.publish_h9bus_frame(message) for sub in cls.subscribers])

    # @classmethod
    # async def publish_to_all_other(cls, self_subscriber, message):
    #     print("Writing to Other clients")
    #
    #     for subscriber in cls.subscribers:
    #         if  self_subscriber != subscriber:
    #             subscriber.publish_h9bus_frame(subscriber, message)
