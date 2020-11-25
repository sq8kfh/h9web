import logging
from tornado import gen
from tornado.iostream import StreamClosedError

from .event import Event

from h9.asyncmsgstream import H9msgStream
from h9.msg import H9ExecuteMethod

class H9bus:
    def __init__(self):
        self.subscribers = []
        self.stream = None


    async def run(self):
        self.msg_stream = H9msgStream("127.0.0.1", 7878)
        while True:
            try:
                await self.msg_stream.connect("h9web")
                exec_method = H9ExecuteMethod("subscribe")
                exec_method.value = {'event': 'frame'}
                self.msg_stream.writemsg(exec_method)
            except StreamClosedError:
                logging.error("Unable connect to h9bus")
                await gen.sleep(10)
                continue
            logging.info("Connecting to h9bus")
            while True:
                try:
                    msg = await self.msg_stream.readmsg()
                    await Event.publish_to_all(msg)
                except StreamClosedError:
                    logging.warning("Disconnected from h9bus")
                    await gen.sleep(5)


    def send_frame(self, msg):
        self.msg_stream.writemsg(msg)
