var jQuery;


(function () {
    // For FormData without getter and setter
    var proto = FormData.prototype,
        data = {};

    if (!proto.get) {
        proto.get = function (name) {
            if (data[name] === undefined) {
                var input = document.querySelector('input[name="' + name + '"]'),
                    value;
                if (input) {
                    if (input.type === 'file') {
                        value = input.files[0];
                    } else {
                        value = input.value;
                    }
                    data[name] = value;
                }
            }
            return data[name];
        };
    }

    if (!proto.set) {
        proto.set = function (name, value) {
            data[name] = value;
        };
    }
}());


jQuery(function ($) {
    var status = $('#status'),
        button = $('.btn-primary'),
        form_container = $('.form-container'),
        terminal_container = $('#terminal-container'),
        terminal_dragbar = $('#terminal-dragbar'),

        style = {},
        form_id = '#connect',
        debug = document.querySelector(form_id).noValidate,
        DISCONNECTED = 0,
        CONNECTING = 1,
        CONNECTED = 2,
        state = DISCONNECTED,
        messages = {1: 'This client is connecting ...', 2: 'This client is already connnected.'},
        event_origin;


    function parse_xterm_style() {
        var text = $('.xterm-helpers style').text();
        var arr = text.split('xterm-normal-char{width:');
        style.width = parseFloat(arr[1]);
        arr = text.split('div{height:');
        style.height = parseFloat(arr[1]);
    }


    function get_cell_size(term) {
        style.width = term._core._renderService._renderer.dimensions.actualCellWidth;
        style.height = term._core._renderService._renderer.dimensions.actualCellHeight;
    }


    function toggle_fullscreen(term) {
        //$('#terminal .terminal').toggleClass('fullscreen');
        term.fitAddon.fit();
    }


    function current_geometry(term) {
        if (!style.width || !style.height) {
            try {
                get_cell_size(term);
            } catch (TypeError) {
                parse_xterm_style();
            }
        }

        terminal = document.getElementById('terminal-container');

        //console.log('term w: ' + terminal.clientWidth );
        //console.log('win w: ' + window.innerWidth);
        //var cols = parseInt(terminal.clientWidth / style.width, 10) - 1;
        var rows = parseInt(terminal.clientHeight / style.height, 10);
        var cols = parseInt(window.innerWidth / style.width, 10) - 1;
        //var rows = parseInt(window.innerHeight / style.height, 10);
        return {'cols': cols, 'rows': rows};
    }


    function resize_terminal(term) {
        var geometry = current_geometry(term);
        term.on_resize(geometry.cols, geometry.rows);
    }


    function format_geometry(cols, rows) {
        return JSON.stringify({'cols': cols, 'rows': rows});
    }


    function read_as_text_with_decoder(file, callback, decoder) {
        var reader = new window.FileReader();

        if (decoder === undefined) {
            decoder = new window.TextDecoder('utf-8', {'fatal': true});
        }

        reader.onload = function () {
            var text;
            try {
                text = decoder.decode(reader.result);
            } catch (TypeError) {
                console.log('Decoding error happened.');
            } finally {
                if (callback) {
                    callback(text);
                }
            }
        };

        reader.onerror = function (e) {
            console.error(e);
        };

        reader.readAsArrayBuffer(file);
    }


    function read_as_text_with_encoding(file, callback, encoding) {
        var reader = new window.FileReader();

        if (encoding === undefined) {
            encoding = 'utf-8';
        }

        reader.onload = function () {
            if (callback) {
                callback(reader.result);
            }
        };

        reader.onerror = function (e) {
            console.error(e);
        };

        reader.readAsText(file, encoding);
    }


    function read_file_as_text(file, callback, decoder) {
        if (!window.TextDecoder) {
            read_as_text_with_encoding(file, callback, decoder);
        } else {
            read_as_text_with_decoder(file, callback, decoder);
        }
    }


    function log_status(text, to_populate) {
        console.log(text);
        status.html(text.split('\n').join('<br/>'));

        if (form_container.css('display') === 'none') {
            form_container.show();
        }
    }


    function ajax_complete_callback(resp) {
        button.prop('disabled', false);

        if (resp.status !== 200) {
            log_status(resp.status + ': ' + resp.statusText, true);
            state = DISCONNECTED;
            return;
        }

        var msg = resp.responseJSON;
        if (!msg.id) {
            log_status(msg.status, true);
            state = DISCONNECTED;
            return;
        }

        var ws_url = window.location.href.split(/\?|#/, 1)[0].replace('http', 'ws'),
            join = (ws_url[ws_url.length - 1] === '/' ? '' : '/'),
            url = ws_url + join + 'cli?id=' + msg.id,
            sock = new window.WebSocket(url),
            encoding = 'utf-8',
            decoder = window.TextDecoder ? new window.TextDecoder(encoding) : encoding,
            terminal = document.getElementById('terminal-container'),
            term = new window.Terminal({
                cursorBlink: true,
                rows: 20,
                screenReaderMode: true,
                theme: {
                    background: 'black'
                }
            });

        term.fitAddon = new window.FitAddon.FitAddon();
        term.loadAddon(term.fitAddon);

        terminal_dragbar.css("height", 5);

        console.log(url);
        if (!msg.encoding) {
            console.log('Unable to detect the default encoding of your server');
            msg.encoding = encoding;
        } else {
            console.log('The deault encoding of your server is ' + msg.encoding);
        }

        function term_write(text) {
            if (term) {
                term.write(text);
                if (!term.resized) {
                    resize_terminal(term);
                    term.resized = true;
                }
            }
        }

        function set_encoding(new_encoding) {
            // for console use
            if (!new_encoding) {
                console.log('An encoding is required');
                return;
            }

            if (!window.TextDecoder) {
                decoder = new_encoding;
                encoding = decoder;
                console.log('Set encoding to ' + encoding);
            } else {
                try {
                    decoder = new window.TextDecoder(new_encoding);
                    encoding = decoder.encoding;
                    console.log('Set encoding to ' + encoding);
                } catch (RangeError) {
                    console.log('Unknown encoding ' + new_encoding);
                    return false;
                }
            }
        }

        set_encoding(msg.encoding);

        term.on_resize = function (cols, rows) {
            if (cols !== this.cols || rows !== this.rows) {
                console.log('Resizing terminal to geometry: ' + format_geometry(cols, rows));
                this.resize(cols, rows);
                sock.send(JSON.stringify({'resize': [cols, rows]}));
            }
        };

        term.onData(function (data) {
            // console.log(data);
            sock.send(JSON.stringify({'data': data}));
        });

        sock.onopen = function () {
            term.open(terminal);
            //toggle_fullscreen(term);
            term.fitAddon.fit();
            resize_terminal(term)
            term.focus();
            state = CONNECTED;
        };

        sock.onmessage = function (msg) {
            read_file_as_text(msg.data, term_write, decoder);
        };

        sock.onerror = function (e) {
            console.error(e);
        };

        sock.onclose = function (e) {
            term.dispose();
            term = undefined;
            sock = undefined;
            log_status(e.reason, true);
            state = DISCONNECTED;
            terminal_container.css("height", '');
            terminal_dragbar.css("height", 0);
            $(document).unbind('mousemove');
            $(document).unbind('mouseup');
            terminal_dragbar.unbind('mousedown');
        };

        $(window).resize(function () {
            if (term) {
                resize_terminal(term);
            }
        });
        var dragging = false;

        terminal_dragbar.mousedown(function (e) {
            e.preventDefault();
            dragging = true;
            $(document).mousemove(function (ex) {
                var cellheight = term._core._renderService._renderer.dimensions.actualCellHeight;
                var tmp_height = (window.innerHeight - ex.pageY);
                tmp_height = (tmp_height/cellheight>>0);// Math.floor(tmp_height / cellheight);
                if (tmp_height < 1) {
                    tmp_height = 1;
                }
                tmp_height = tmp_height * cellheight;
                terminal_container.css("height", tmp_height);
                term.fitAddon.fit();
                //console.log('mousemove ' + ex.pageY + ' cellH ' + cellheight);
                //console.log('newH: ' + tmp_height);

            });
        });

        $(document).mouseup(function (e) {
            if (dragging) {
                $(document).unbind('mousemove');
                term.fitAddon.fit();
                resize_terminal(term)
                dragging = false;
            }
        });
    }


    function connect() {
        if (state !== DISCONNECTED) {
            console.log(messages[state]);
            return;
        }

        var form = document.querySelector(form_id),
            url = form.action,
            data;

        data = new FormData(form);

        function ajax_post() {
            status.text('');
            button.prop('disabled', true);

            $.ajax({
                url: url,
                type: 'post',
                data: data,
                complete: ajax_complete_callback,
                cache: false,
                contentType: false,
                processData: false
            });
        }

        ajax_post();

        state = CONNECTING;
    }


    $(form_id).submit(function (event) {
        event.preventDefault();
        connect();
    });

    /*
      function cross_origin_connect(event)
      {
        console.log(event.origin);
        var prop = 'connect',
            args;

        try {
          args = JSON.parse(event.data);
        } catch (SyntaxError) {
          args = event.data.split('|');
        }

        if (!Array.isArray(args)) {
          args = [args];
        }

        try {
          event_origin = event.origin;
        } finally {
          event_origin = undefined;
        }
      }

      window.addEventListener('message', cross_origin_connect, false);

    form_container.show();*/
});
