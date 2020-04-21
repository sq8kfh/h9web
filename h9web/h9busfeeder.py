import logging
from tornado import gen
from tornado.tcpclient import TCPClient
from tornado.iostream import StreamClosedError


class H9busFeeder:
    def __init__(self):
        self.subscribers = []
        self.stream = None

    def add_subscribers(self, sub):
        self.subscribers.append(sub)

    def del_subscribers(self, sub):
        self.subscribers.remove(sub)

    async def run(self):
        while True:
            try:
                self.stream = await TCPClient().connect("localhost", 1234)
            except StreamClosedError:
                logging.error("Unable connect to h9bus")
                await gen.sleep(10)
                continue
            logging.info("Connecting to h9bus")
            while True:
                try:
                    a = await self.stream.read_until(b"\n")
                    a = a.decode('UTF-8')
                    await gen.multi([sub.publish_h9bus_event(a) for sub in self.subscribers])
                except StreamClosedError:
                    logging.warning("Disconnected from h9bus")
                    await gen.sleep(5)
