import tornado.web
import logging
from urllib.parse import urlparse

class CommonHandler:
    def get_client_addr(self) -> (str, int):
        #TODO: add support for X-Headers
        return self.request.connection.context.address[:2]


class BaseHandler(tornado.web.RequestHandler, CommonHandler):
    def get_current_user(self):
        return "kfh" #self.get_secure_cookie("authenticated")

    def set_default_headers(self) -> None:
        super(BaseHandler, self).set_default_headers()
        if self.settings["dev_mode"]:
            # self.set_header("Access-Control-Allow-Origin", "*")
            self.set_header("Access-Control-Allow-Origin", "*")
            self.set_header("Access-Control-Allow-Headers", "Authorization, *")
            self.set_header('Access-Control-Allow-Methods', 'PUT, POST, GET, OPTIONS')

    def prepare(self):
        pass
#         if "Origin" in self.request.headers:
#             origin = self.request.headers.get("Origin")
#
#             parsed_origin = urlparse(origin)
#
#             netloc = parsed_origin.netloc.lower()
#             #scheme = parsed_origin.scheme.lower()
#             #logging.debug('netloc: {}'.format(netloc))
#
#             host = self.request.headers.get('Host')
#             #logging.debug('host: {}'.format(host))
#
#             #if netloc != host:# or self.request.connection.context._orig_protocol != scheme:
#             #    raise tornado.web.HTTPError(403, 'Cross origin operation is not allowed.')
#
#         if self.request.connection.context._orig_protocol == 'http' and self.settings['redirect']:
#             port = '' if self.settings['sslport'] == 443 else ':%s' % self.settings['sslport']
#             to_url = 'https://{}{}{}'.format(self.request.host_name, port, self.request.uri)
#             self.redirect(to_url, permanent=True)


class LoginHandler(BaseHandler):
    def post(self):
        if self.get_argument("password") == 'kfh': #TODO: do it little more secure:P
            self.set_secure_cookie("authenticated", "yes of course")
            self.redirect(self.get_argument("next", default='/'))
        else:
            self.render('login.html', login_fail=True)

    def get(self):
        self.render('login.html', login_fail=False)


class LogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie("authenticated")
        self.redirect("/")


class IndexHandler(BaseHandler):
    def initialize(self):
        self.debug = self.settings.get('debug', False)

    #@tornado.web.authenticated
    def get(self):
        self.render('index.html', debug=self.debug)


# class NotFoundHandler(BaseHandler):
#     def prepare(self):
#         raise tornado.web.HTTPError(404)
