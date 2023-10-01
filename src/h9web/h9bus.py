# import logging
# from tornado import gen
# from tornado.iostream import StreamClosedError
# from asyncio import IncompleteReadError
#
# from .event import Event
#
# from h9.asyncmsgstream import H9msgStream
# from h9.msg import H9ExecuteMethod
#
# class H9bus:
#     def __init__(self, address, port):
#         self.h9bus_address = address
#         self.h9bus_port = port
#         self.subscribers = []
#         self.msg_stream = None
#         self.retry_count = 0
#
#     async def run(self):
#         self.msg_stream = H9msgStream(self.h9bus_address, self.h9bus_port)
#         while True:
#             try:
#                 await self.msg_stream.connect("h9web")
#                 exec_method = H9ExecuteMethod("subscribe")
#                 exec_method.value = {'event': 'frame'}
#                 self.msg_stream.writemsg(exec_method)
#             except (StreamClosedError, ConnectionRefusedError) as e:
#                 if self.retry_count == 0:
#                     logging.error("Unable connect to h9bus - retry in 10 seconds...")
#                 else:
#                     logging.warning("Unable connect to h9bus - retry in 10 seconds...")
#                 await gen.sleep(10)
#                 self.retry_count = self.retry_count + 1
#                 continue
#
#             logging.info("Connected to h9bus")
#             while True:
#                 try:
#                     msg = await self.msg_stream.readmsg()
#                     await Event.publish_to_all(msg)
#                 except (StreamClosedError, IncompleteReadError):
#                     logging.error("Disconnected from h9bus - retry in 5 seconds...")
#                     await gen.sleep(5)
#                     break
#
#     def send_frame(self, msg):
#         self.msg_stream.writemsg(msg)
