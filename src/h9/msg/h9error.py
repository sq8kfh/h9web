import lxml.etree

from .h9msg import H9msg


class H9Error(H9msg):
    def __init__(self, code: int, message: str, name: str = None):
        super(H9Error, self).__init__()
        lxml.etree.SubElement(self._xml, 'error')
        self.code = code
        self.name = name
        self.message = message

    @property
    def code(self) -> int:
        return int(self._xml[0].attrib.get("code"))

    @property
    def name(self) -> str:
        return str(self._xml[0].attrib.get("name"))

    @property
    def message(self) -> str:
        return str(self._xml[0].attrib.get("message"))

    @code.setter
    def code(self, value: int):
        self._xml[0].attrib['code'] = str(value)

    @name.setter
    def name(self, value: str):
        if not value:
            if 'name' in self._xml[0].attrib:
                del self._xml[0].attrib['name']
        else:
            self._xml[0].attrib['name'] = str(value)

    @message.setter
    def message(self, value: str):
        self._xml[0].attrib['message'] = str(value)

    def to_dict(self):
        res = dict()
        if self.errnum:
            res['code'] = self.code
        if self.name:
            res['name'] = self.name
        if self.msg:
            res['message'] = self.message
        return res
