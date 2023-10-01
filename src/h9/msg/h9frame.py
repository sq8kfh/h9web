import struct
from enum import Enum

import lxml.etree

from .h9msg import H9msg


class H9SendFrame(H9msg):
    class Priority(Enum):
        H = 0
        L = 1

    class FrameType(Enum):
        NOP = 0
        PAGE_START = 1
        QUIT_BOOTLOADER = 2
        PAGE_FILL = 3
        BOOTLOADER_TURNED_ON = 4
        PAGE_FILL_NEXT = 5
        PAGE_WRITED = 6
        PAGE_FILL_BREAK = 7
        SET_REG = 8
        GET_REG = 9
        SET_BIT = 10
        CLEAR_BIT = 11
        TOGGLE_BIT = 12
        NODE_UPGRADE = 13
        NODE_RESET = 14
        DISCOVER = 15
        REG_EXTERNALLY_CHANGED = 16
        REG_INTERNALLY_CHANGED = 17
        REG_VALUE_BROADCAST = 18
        REG_VALUE = 19
        ERROR = 20
        NODE_HEARTBEAT = 21
        NODE_INFO = 22
        NODE_TURNED_ON = 23
        NODE_SPECIFIC_BULK0 = 24
        NODE_SPECIFIC_BULK1 = 25
        NODE_SPECIFIC_BULK2 = 26
        NODE_SPECIFIC_BULK3 = 27
        NODE_SPECIFIC_BULK4 = 28
        NODE_SPECIFIC_BULK5 = 29
        NODE_SPECIFIC_BULK6 = 30
        NODE_SPECIFIC_BULK7 = 31

    def __init__(self, priority: Priority, frametype: FrameType, seqnum: int, source: int,
                 destination: int, data: [], endpoint=''):
        super(H9SendFrame, self).__init__()
        lxml.etree.SubElement(self._xml, 'sendframe')
        self.priority = priority
        self.frametype = frametype
        self.seqnum = seqnum
        self.source = source
        self.destination = destination
        self.data = data
        self.endpoint = endpoint

    @property
    def priority(self) -> Priority:
        return H9SendFrame.Priority[self._xml[0].attrib.get("priority").upper()]

    @property
    def frametype(self) -> FrameType:
        return H9SendFrame.FrameType(int(self._xml[0].attrib.get("type")))

    @property
    def seqnum(self) -> int:
        return int(self._xml[0].attrib.get("seqnum"))

    @property
    def source(self) -> int:
        return int(self._xml[0].attrib.get("source"))

    @property
    def destination(self) -> int:
        return int(self._xml[0].attrib.get("destination"))

    @property
    def dlc(self) -> int:
        return int(self._xml[0].attrib.get("dlc"))

    @property
    def data(self) -> []:
        dlc = self.dlc
        hexstring = self._xml[0].attrib.get("data")
        if dlc < 1 or not hexstring:
            return []
        return struct.unpack('<%dB' % self.dlc, bytes.fromhex(hexstring))

    @property
    def endpoint(self) -> str:
        ret = self._xml[0].attrib.get("endpoint")
        if not ret:
            return None
        return str(ret)

    @priority.setter
    def priority(self, value: Priority):
        self._xml[0].attrib['priority'] = str(value.name)

    @frametype.setter
    def frametype(self, value: FrameType):
        self._xml[0].attrib['type'] = str(value.value)

    @seqnum.setter
    def seqnum(self, value: int):
        if value < 0 or value > 31:
            raise ValueError('Seqnum value out of range')
        self._xml[0].attrib['seqnum'] = str(value)

    @source.setter
    def source(self, value: int):
        if value < 0 or value > 511:
            raise ValueError('Source value out of range')
        self._xml[0].attrib['source'] = str(value)

    @destination.setter
    def destination(self, value: int):
        if value < 0 or value > 511:
            raise ValueError('Destination value out of range')
        self._xml[0].attrib['destination'] = str(value)

    @data.setter
    def data(self, value: []):
        tmpdlc = 0
        tmpdata = ''

        for b in value:
            if b is None or b == '':
                break
            if isinstance(b, int):
                tmpdata = tmpdata + "%0.2X" % b
            else:
                tmpdata = tmpdata + "%0.2X" % int(b, 16)
            tmpdlc = tmpdlc + 1
        self._xml[0].attrib['dlc'] = str(tmpdlc)
        if tmpdlc:
            self._xml[0].attrib['data'] = tmpdata
        else:
            try:
                del self._xml[0].attrib['data']
            except KeyError:
                pass

    @endpoint.setter
    def endpoint(self, value: str):
        if not value:
            if 'endpoint' in self._xml[0].attrib:
                del self._xml[0].attrib['endpoint']
        else:
            self._xml[0].attrib['endpoint'] = str(value)

    def to_dict(self):
        res = dict(priority=self.priority.name, type=self.frametype.value,
                   seqnum=self.seqnum, source=self.source, destination=self.destination,
                   dlc=self.dlc, data=self.data)
        if self.endpoint:
            res['endpoint'] = self.endpoint
        return res


class H9Frame(H9SendFrame):
    def __init__(self, origin, priority: H9SendFrame.Priority, frametype: H9SendFrame.FrameType,
                 seqnum: int, source: int, destination: int, data: [], endpoint=None):
        super(H9SendFrame, self).__init__()
        lxml.etree.SubElement(self._xml, 'frame')
        self.origin = origin
        self.priority = priority
        self.frametype = frametype
        self.seqnum = seqnum
        self.source = source
        self.destination = destination
        self.data = data
        self.endpoint = endpoint

    @property
    def origin(self) -> str:
        return str(self._xml[0].attrib.get("origin"))

    @origin.setter
    def origin(self, value: str):
        self._xml[0].attrib['origin'] = str(value)

    def to_dict(self):
        res = super(H9Frame, self).to_dict()
        res['origin'] = self.origin
        return res
