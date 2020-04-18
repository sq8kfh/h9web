from tornado import web, gen
from tornado.iostream import StreamClosedError


class Event(web.RequestHandler):
    def __init__(self, app, request):
        super().__init__(app, request)

        self.set_header('content-type', 'text/event-stream')
        self.set_header('cache-control', 'no-cache')

        self.last_data = None
        self.data = 'ala'

    @gen.coroutine
    def publish(self, data):
        """Pushes data to a listener."""
        try:
            self.write('data: {}\n\n'.format(data))
            yield self.flush()
        except StreamClosedError:
            pass

    @gen.coroutine
    def get(self):
        # self.application.feeder.subscribe('jobposts')

        while True:
            #data = yield self.application.feeder.take()
            self.data = self.data + '.'

            yield gen.sleep(60)
            if self.last_data == self.data:
                yield gen.sleep(1)
            else:
                yield self.publish(self.data)
                self.last_data = self.data
