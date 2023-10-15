import logging
from tornado import gen
from tornado.iostream import StreamClosedError
from asyncio import IncompleteReadError, Future
import json
from .event import Event
import jsonrpc
from h9.asyncmsgstream import H9msgStream



class H9d:
    class H9dException(Exception):
        def __init__(self, code, message):
            self.code = code
            self.message = message
            super().__init__(self.message)

    entity = "h9web"

    def __init__(self, address, port):
        self.result_queue = {}
        self.h9d_address = address
        self.h9d_port = port
        self.subscribers = []
        self.msg_stream = None
        self.retry_count = 0

    def _send_message(self, rpc_message):
        self.msg_stream.write_json_str(json.dumps(rpc_message))

    async def run(self):
        self.msg_stream = H9msgStream(self.h9d_address, self.h9d_port)
        while True:
            try:
                await self.msg_stream.connect(self.entity)

                req = jsonrpc.request("subscribe", params={"event": "frame"})
                self._send_message(req)
                data = await self.msg_stream.read_json_str()
                res = jsonrpc.parse_json(data)

                if not isinstance(res, jsonrpc.Ok) or res.id != req["id"]:
                    logging.error("H9d frame subscribe error - {}".format(res))

            except (StreamClosedError, ConnectionRefusedError) as e:
                if self.retry_count == 0:
                    logging.error("Unable connect to h9d - retry in 10 seconds...")
                else:
                    logging.warning("Unable connect to h9d - retry in 10 seconds...")
                await gen.sleep(10)
                self.retry_count = self.retry_count + 1
                continue

            logging.info("Connected to h9d: {}@{}:{}".format(self.entity, self.h9d_address, self.h9d_port))
            while True:
                try:
                    data = await self.msg_stream.read_json_str()

                    msg = jsonrpc.parse_json(data)
                    if isinstance(msg, jsonrpc.Notification):
                        logging.warning(msg)
                        await Event.publish_to_all(msg)
                    elif isinstance(msg, jsonrpc.Ok):
                        # logging.warning("Ok result")
                        logging.info(msg)
                        if msg.id in self.result_queue:
                            self.result_queue[msg.id].set_result(msg.result)
                            del self.result_queue[msg.id]
                    elif isinstance(msg, jsonrpc.Error):
                        logging.warning(msg)
                        if msg.id in self.result_queue:
                            self.result_queue[msg.id].set_exception(H9d.H9dException(msg.code, msg.message))
                            del self.result_queue[msg.id]
                except (StreamClosedError, IncompleteReadError):
                    logging.error("Disconnected from h9d - retry in 5 seconds...")
                    await gen.sleep(5)
                    break

    async def call_request(self, rpc_request):
        result_future = Future()
        self.result_queue[rpc_request["id"]] = result_future
        self._send_message(rpc_request)
        res = await result_future
        logging.critical(res)
        return res
