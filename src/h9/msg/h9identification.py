from enum import Enum

import lxml.etree

from .h9msg import H9msg


class H9Identification(H9msg):
    def __init__(self, entity: str):
        super(H9Identification, self).__init__()
        lxml.etree.SubElement(self._xml, 'identification')
        self.entity = entity

    @property
    def entity(self) -> str:
        return self._xml[0].attrib.get("entity")

    @entity.setter
    def entity(self, value: str):
        self._xml[0].attrib['entity'] = value
