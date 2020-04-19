import logging
import json

from tornado import web, gen
from tornado.iostream import StreamClosedError


class Event(web.RequestHandler):
    def initialize(self, loop=None, h9busfeeder=None):
        self.loop = loop
        self.set_header('content-type', 'text/event-stream')
        self.set_header('cache-control', 'no-cache')

        self.run = True
        self.h9busfeeder = h9busfeeder
        self.h9busfeeder.add_subscribers(self)
        self.context = self.request.connection.context
        logging.info('Connected event subscribers {}:{}'.format(*self.context.address[:2]))

    @gen.coroutine
    def publish_h9bus_event(self, data):
        """Pushes data to a listener."""
        try:
            dict_data = {"type": "h9frame", "data": data.strip()}
            json_data = json.dumps(dict_data)
            logging.debug('Event send {!r}'.format(json_data))

            self.write('data: {}\n\n'.format(json_data))
            yield self.flush()
        except StreamClosedError:
            self.run = False

    @gen.coroutine
    def get(self):
        while self.run:
            yield gen.sleep(10)

    def on_finish(self):
        logging.info('Disconnected event subscribers {}:{}'.format(*self.context.address[:2]))
        self.h9busfeeder.del_subscribers(self)
