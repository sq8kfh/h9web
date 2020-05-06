var jQuery;

jQuery(function ($) {
    var terminal_container = $('#terminal-container'),
        terminal_dragbar = $('#terminal-dragbar'),

        style = {},
        form_id = '#connect',
        DISCONNECTED = 0,
        CONNECTING = 1,
        CONNECTED = 2,
        state = DISCONNECTED;


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


    function current_geometry(term) {
        if (!style.width || !style.height) {
            try {
                get_cell_size(term);
            } catch (TypeError) {
                parse_xterm_style();
            }
        }

        terminal = document.getElementById('terminal-container');

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


    function read_file_as_text(file, callback) {
        var reader = new window.FileReader();
        reader.onload = function () {
            if (callback) {
                callback(reader.result);
            }
        };

        reader.onerror = function (e) {
            console.error(e);
        };

        reader.readAsText(file, 'utf-8');
    }


    function connect() {
        var ws_url = window.location.href.split(/\?|#/, 1)[0].replace('http', 'ws'),
            join = (ws_url[ws_url.length - 1] === '/' ? '' : '/'),
            url = ws_url + join + 'cli?id=' + '1',
            sock = new window.WebSocket(url),
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

        function term_write(text) {
            if (term) {
                term.write(text);
                if (!term.resized) {
                    resize_terminal(term);
                    term.resized = true;
                }
            }
        }

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
            term.fitAddon.fit();
            resize_terminal(term)
            term.focus();
            state = CONNECTED;
        };

        sock.onmessage = function (msg) {
            read_file_as_text(msg.data, term_write);
        };

        sock.onerror = function (e) {
            console.error(e);
        };

        sock.onclose = function (e) {
            term.dispose();
            term = undefined;
            sock = undefined;
            console.log(e.reason);
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
                tmp_height = (tmp_height / cellheight >> 0);// Math.floor(tmp_height / cellheight);
                if (tmp_height < 1) {
                    tmp_height = 1;
                }
                tmp_height = tmp_height * cellheight;
                terminal_container.css("height", tmp_height);
                term.fitAddon.fit();
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


    $(form_id).submit(function (event) {
        event.preventDefault();

        if (state !== DISCONNECTED) {
            console.log('This CLI is already connnected.');
            return;
        }

        connect();
        state = CONNECTING;
    });

});
