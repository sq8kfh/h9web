from enum import Enum

import lxml.etree

from .h9msg import H9msg


class H9Subscribe(H9msg):
    class Content(Enum):
        FRAME = 1

    def __init__(self, content: Content):
        super(H9Subscribe, self).__init__()
        lxml.etree.SubElement(self._xml, 'subscribe')
        self.content = content

    @property
    def content(self) -> Content:
        return H9Subscribe.Content[self._xml[0].attrib.get("content")]

    @content.setter
    def content(self, value: Content):
        self._xml[0].attrib['content'] = str(value.name)
