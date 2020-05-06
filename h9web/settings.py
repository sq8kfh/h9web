import os.path
import ssl
import sys

from tornado.options import define
from h9web._version import __version__


def print_version(flag):
    if flag:
        print(__version__)
        sys.exit(0)


define('address', default='', help='Listen address')
define('port', type=int, default=8888,  help='Listen port')
define('ssladdress', default='', help='SSL listen address')
define('sslport', type=int, default=4433,  help='SSL listen port')
define('certfile', default='', help='SSL certificate file')
define('keyfile', default='', help='SSL private key file')
define('debug', type=bool, default=False, help='Debug mode')
define('redirect', type=bool, default=False, help='Redirecting http to https')
define('xheaders', type=bool, default=True, help='Support xheaders')
define('wpintvl', type=int, default=0, help='Websocket ping interval')
define('xsrf', type=bool, default=True, help='CSRF protection')
define('version', type=bool, help='Show version information', callback=print_version)
define('cli', default='/bin/bash', help='CLI path')


def get_server_settings(options):
    settings = dict(
        xheaders=options.xheaders,
        max_body_size=1 * 1024 * 1024
    )
    return settings


def get_ssl_context(options):
    if not options.certfile and not options.keyfile:
        return None
    elif not options.certfile:
        raise ValueError('certfile is not provided')
    elif not options.keyfile:
        raise ValueError('keyfile is not provided')
    elif not os.path.isfile(options.certfile):
        raise ValueError('File {!r} does not exist'.format(options.certfile))
    elif not os.path.isfile(options.keyfile):
        raise ValueError('File {!r} does not exist'.format(options.keyfile))
    else:
        ssl_ctx = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        ssl_ctx.load_cert_chain(options.certfile, options.keyfile)
        return ssl_ctx

