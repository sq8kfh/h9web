import json
import logging
import asyncio
import struct
import jsonrpc

class H9msgStream(object):
    def __init__(self, host, port):
        self._host = host
        self._port = port

    async def connect(self, entity="pyh9"):
        self._reader, self._writer = await asyncio.open_connection(self._host, self._port)
        msg = jsonrpc.request("authenticate", params={"entity": entity})

    def write_json_str(self, json_str):
        data = json_str.encode('utf-8')
        if not self._writer:
            logging.warning("NOT")
        self._writer.write(struct.pack("!I", len(data)))
        self._writer.write(data)

    async def read_json_str(self):
        tmp = await self._reader.readexactly(4)
        length = struct.unpack("!I", tmp)[0]

        data = await self._reader.readexactly(length)
        return data
        # return json.loads(data) #jsonrpcclient.parse_json(data)

    def close(self):
        self._writer.close()
