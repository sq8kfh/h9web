import os.path
import ssl
import sys

from tornado.options import define
from h9web._version import __version__
from urllib.parse import urlparse

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
define('tdstream', default='', help='Trusted downstream, separated by comma')
define('redirect', type=bool, default=True, help='Redirecting http to https')
define('fbidhttp', type=bool, default=True,
       help='Forbid public plain http incoming requests')
define('xheaders', type=bool, default=True, help='Support xheaders')
define('xsrf', type=bool, default=True, help='CSRF protection')
define('origin', default='same', help='''Origin policy,
'same': same origin policy, matches host name and port number;
'primary': primary domain policy, matches primary domain only;
'<domains>': custom domains policy, matches any domain in the <domains> list
separated by comma;
'*': wildcard policy, matches any domain, allowed in debug mode only.''')
define('wpintvl', type=int, default=0, help='Websocket ping interval')
define('delay', type=int, default=0, help='The delay to call recycle_worker')
define('maxconn', type=int, default=20,
       help='Maximum live connections (cli sessions) per client')
define('version', type=bool, help='Show version information',
       callback=print_version)


base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
max_body_size = 1 * 1024 * 1024


def get_app_settings(options):
    settings = dict(
        template_path=os.path.join(base_dir, 'h9web', 'templates'),
        static_path=os.path.join(base_dir, 'h9web', 'static'),
        websocket_ping_interval=options.wpintvl,
        debug=options.debug,
        xsrf_cookies=options.xsrf,
        origin_policy=get_origin_setting(options)
    )
    return settings


def get_server_settings(options):
    settings = dict(
        xheaders=options.xheaders,
        max_body_size=max_body_size,
        trusted_downstream=get_trusted_downstream(options.tdstream)
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


def get_trusted_downstream(tdstream):
    result = set()
    for ip in tdstream.split(','):
        ip = ip.strip()
        if ip:
            result.add(ip)
    return result


def parse_origin_from_url(url):
    url = url.strip()
    if not url:
        return

    if not (url.startswith('http://') or url.startswith('https://') or
            url.startswith('//')):
        url = '//' + url

    parsed = urlparse(url)
    port = parsed.port
    scheme = parsed.scheme

    if scheme == '':
        scheme = 'https' if port == 443 else 'http'

    if port == 443 and scheme == 'https':
        netloc = parsed.netloc.replace(':443', '')
    elif port == 80 and scheme == 'http':
        netloc = parsed.netloc.replace(':80', '')
    else:
        netloc = parsed.netloc

    return '{}://{}'.format(scheme, netloc)


def get_origin_setting(options):
    if options.origin == '*':
        if not options.debug:
            raise ValueError(
                'Wildcard origin policy is only allowed in debug mode.'
            )
        else:
            return '*'

    origin = options.origin.lower()
    if origin in ['same', 'primary']:
        return origin

    origins = set()
    for url in origin.split(','):
        url = url.strip()
        if not url:
            continue

        if not (url.startswith('http://') or url.startswith('https://') or
                    url.startswith('//')):
            url = '//' + url

        parsed = urlparse(url)
        port = parsed.port
        scheme = parsed.scheme

        if scheme == '':
            scheme = 'https' if port == 443 else 'http'

        if port == 443 and scheme == 'https':
            netloc = parsed.netloc.replace(':443', '')
        elif port == 80 and scheme == 'http':
            netloc = parsed.netloc.replace(':80', '')
        else:
            netloc = parsed.netloc

        origins.add('{}://{}'.format(scheme, netloc))

    if not origins:
        raise ValueError('Empty origin list')

    return origins
