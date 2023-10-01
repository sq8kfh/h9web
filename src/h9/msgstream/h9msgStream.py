import socket
import struct
from ..msg import xml_to_h9msg, H9Identification

class H9msgStream(object):
    def __init__(self, host, port):
        self._host = host
        self._port = port
        self._sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    def connect(self, entity="pyh9"):
        self._sock.connect((self._host, self._port))
        self.writemsg(H9Identification(entity))

    def writemsg(self, msg):
        data = msg.to_bytes()
        self._sock.send(struct.pack("!I", len(data)))
        self._sock.send(data)

    def readmsg(self):
        tmp = self._recv(4)
        length = struct.unpack("!I", tmp)[0]

        data = self._recv(length)
        msg = xml_to_h9msg(data)
        return msg

    def close(self):
        self._sock.close()

    def _recv(self, length):
        chunks = []
        bytes_recd = 0
        while bytes_recd < length:
            chunk = self._sock.recv(min(length - bytes_recd, 2048))
            if chunk == b'':
                raise RuntimeError("socket connection broken")
            chunks.append(chunk)
            bytes_recd = bytes_recd + len(chunk)
        return b''.join(chunks)
