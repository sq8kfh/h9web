import lxml.etree
from .common import Common


class CommonDevice(Common):
    @property
    def device_id(self) -> int:
        return int(self._xml[0].attrib.get("device-id"))

    @device_id.setter
    def device_id(self, value: int):
        self._xml[0].attrib['device-id'] = str(value)

    def to_dict(self):
        res = super(CommonDevice, self).to_dict()
        res['device_id'] = self.device_id
        return res


class CommonDeviceMethod(CommonDevice):
    @property
    def method(self) -> str:
        return str(self._xml[0].attrib.get("method"))

    @method.setter
    def method(self, value: str):
        self._xml[0].attrib['method'] = str(value)

    def to_dict(self):
        res = super(CommonDeviceMethod, self).to_dict()
        res['method'] = self.method
        return res


class H9ExecuteDeviceMethod(CommonDeviceMethod):
    def __init__(self, device_id, method):
        super(H9ExecuteDeviceMethod, self).__init__()
        lxml.etree.SubElement(self._xml, 'execute')
        self.device_id = device_id
        self.method = method
        self.value = dict()


class H9DeviceMethodResponse(CommonDeviceMethod):
    def __init__(self, device_id, method, error_code = None, error_message = None):
        super(H9DeviceMethodResponse, self).__init__()
        lxml.etree.SubElement(self._xml, 'response')
        self.device_id = device_id
        self.method = method
        if error_code is not None:
            self.error_code = error_code
            self.error_message = error_message
        else:
            self.value = dict()

    def _get_error_node(self):
        if len(self._xml[0]) > 0 and self._xml[0][0].tag == 'error':
            return self._xml[0][0]
        else:
            return None

    def _get_or_set_error_node(self):
        error_node = self._get_error_node()
        if error_node is None:
            lxml.etree.SubElement(self._xml[0], 'error')
            return self._get_error_node()
        return error_node

    @property
    def error_code(self) -> int:
        error_node = self._get_error_node()
        if error_node is None:
            return 0
        return int(error_node.attrib.get("code"))

    @property
    def error_name(self) -> str:
        error_node = self._get_error_node()
        if error_node is None:
            return ''
        return str(error_node.attrib.get("name"))

    @property
    def error_message(self) -> str:
        error_node = self._get_error_node()
        if error_node is None:
            return ''
        return str(error_node.attrib.get("message"))

    @error_code.setter
    def error_code(self, value: int):
        error_node = self._get_or_set_error_node()
        error_node.attrib['code'] = str(value)

    @error_name.setter
    def error_name(self, value: str):
        error_node = self._get_or_set_error_node()
        if not value:
            if 'name' in error_node.attrib:
                del error_node.attrib['name']
        else:
            error_node.attrib['name'] = str(value)

    @error_message.setter
    def error_message(self, value: str):
        error_node = self._get_or_set_error_node()
        error_node.attrib['message'] = str(value)

    def to_dict(self):
        res = super().to_dict()
        error_node = self._get_error_node()
        if error_node is not None:
            if 'value' in res:
                del res['value']
            res['code'] = self.error_code
            res['name'] = self.error_name
            res['message'] = self.error_message
        return res


class H9DeviceEvent(CommonDevice):
    def __init__(self, device_id, event_name):
        super(H9DeviceEvent, self).__init__()
        lxml.etree.SubElement(self._xml, 'event')
        self.device_id = device_id
        self.event_name = event_name
        self.value = dict()

    @property
    def event_name(self) -> str:
        return str(self._xml[0].attrib.get("event"))

    @event_name.setter
    def event_name(self, value: str):
        self._xml[0].attrib['event'] = str(value)

    def to_dict(self):
        res = super().to_dict()
        res['event_name'] = self.event_name
        return res
