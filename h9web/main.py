import os
import logging
import tornado.web
import tornado.ioloop

from tornado.options import options
from h9web import h9bus
from h9web import h9d
from h9web.cli import CliWSHandler
from h9web.handler import IndexHandler, LoginHandler, LogoutHandler
from h9web.event import Event
from h9web.api import H9webAPI, DevAPI, ExecuteMethodAPI, ExecuteDeviceMethodAPI
from h9web.settings import get_ssl_context, get_server_settings


class Application(tornado.web.Application):
    def __init__(self, options, h9bus_int, h9d_int, loop):
        handlers = [
            (r'/', IndexHandler),  # , dict(loop=loop, cli=options.cli)),
            (r'/login', LoginHandler),
            (r'/logout', LogoutHandler),
            (r'/cli', CliWSHandler, dict(loop=loop)),
            (r'/events', Event, dict(h9bus_int=h9bus_int, h9d_int=h9d_int)),
            (r'/api/sendframe', H9webAPI, dict(h9bus_int=h9bus_int)),
            (r'/api/dev', DevAPI, dict(h9d_int=h9d_int)),
            (r'/api/execute/([A-Za-z0-9_]+)', ExecuteMethodAPI, dict(h9d_int=h9d_int)),
            (r'/api/device/([0-9]+)/execute/([A-Za-z0-9_]+)', ExecuteDeviceMethodAPI, dict(h9d_int=h9d_int)),
        ]
        settings = dict(
            template_path=os.path.join(os.path.dirname(__file__), 'templates'),
            static_path=os.path.join(os.path.dirname(__file__), 'static'),
            login_url='/login',
            cookie_secret='__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__',
            websocket_ping_interval=options.wpintvl,
            xsrf_cookies=options.xsrf,
            debug=options.debug,
            sslport=options.sslport,
            redirect=options.redirect,
            cli=options.cli
        )
        super(Application, self).__init__(handlers, **settings)

def main():
    options.parse_command_line()
    loop = tornado.ioloop.IOLoop.current()

    h9bus_int = h9bus.H9bus()
    h9d_int = h9d.H9d()

    app = Application(options, h9bus_int, h9d_int, loop)

    ssl_ctx = get_ssl_context(options)
    server_settings = get_server_settings(options)

    app.listen(options.port, options.address, **server_settings)
    logging.info('Listening on {}:{} (http)'.format(options.port, options.address))
    if ssl_ctx:
        server_settings.update(ssl_options=ssl_ctx)
        app.listen(options.sslport, options.ssladdress, **server_settings)
        logging.info('Listening on {}:{} (https)'.format(options.sslport, options.ssladdress))

    loop.spawn_callback(h9bus_int.run)
    loop.spawn_callback(h9d_int.run)
    loop.start()


if __name__ == '__main__':
    main()
