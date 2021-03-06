import logging
from tornado import gen
from tornado.iostream import StreamClosedError
from asyncio import IncompleteReadError

from .event import Event

from h9.asyncmsgstream import H9msgStream
from h9.msg import H9ExecuteDeviceMethod

class H9d:
    def __init__(self, address, port):
        self.h9d_address = address
        self.h9d_port = port
        self.subscribers = []
        self.msg_stream = None
        self.retry_count = 0

    async def run(self):
        self.msg_stream = H9msgStream(self.h9d_address, self.h9d_port)
        while True:
            try:
                await self.msg_stream.connect("h9web")
                msg = H9ExecuteDeviceMethod(32, 'subscribe')
                msg.value = {'event': 'register_change'}
                self.msg_stream.writemsg(msg)
            except (StreamClosedError, ConnectionRefusedError) as e:
                if self.retry_count == 0:
                    logging.error("Unable connect to h9d - retry in 10 seconds...")
                else:
                    logging.warning("Unable connect to h9d - retry in 10 seconds...")
                await gen.sleep(10)
                self.retry_count = self.retry_count + 1
                continue

            logging.info("Connected to h9d")
            while True:
                try:
                    msg = await self.msg_stream.readmsg()
                    await Event.publish_to_all(msg)
                except (StreamClosedError, IncompleteReadError):
                    logging.error("Disconnected from h9d - retry in 5 seconds...")
                    await gen.sleep(5)
                    break

    def send_msg(self, msg):
        self.msg_stream.writemsg(msg)
