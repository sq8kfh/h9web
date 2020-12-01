function read_register_device(device_id, register_id, input, button) {
    jQuery.ajax({
            url: '/api/device/' + device_id +'/get_register',
            async: true,
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({'register': register_id}),
        }).done(function (response) {
            console.log(response);
            input.val(response.value.value);
        }).fail(function (xhr, status, error) {
            var err = JSON.parse(xhr.responseText).error;
            var tmp= $('<div class="alert alert-danger" role="alert">Read register ' + register_id + ' on device ' + device_id + ' error - ' + err.message + '</div>');
            $('#log').prepend(tmp);
            if ($('#log').children().length > 5) {
                $('#log').children().last().remove();
            }
            $('#modal').modal({'show': true, 'focus': false});
        });
}

function write_register_device(device_id, register_id, input, button) {
    jQuery.ajax({
            url: '/api/device/' + device_id +'/set_register',
            async: true,
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({'register': register_id, 'value': input.val()}),
        }).done(function (response) {
            console.log(response);
            input.val(response.value.value);
        }).fail(function (xhr, status, error) {
            var err = JSON.parse(xhr.responseText).error;
            var tmp= $('<div class="alert alert-danger" role="alert">Write register ' + register_id + ' on device ' + device_id + ' error - ' + err.message + '</div>');
            $('#log').prepend(tmp);
            if ($('#log').children().length > 5) {
                $('#log').children().last().remove();
            }
            $('#modal').modal({'show': true, 'focus': false});
        });
}

function refresh_device(device_id) {
    var register_list = $('#register-list');
    register_list.empty();

    jQuery.ajax({
            url: '/api/device/' + device_id +'/registers_list',
            async: true,
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST',
            //data: data,
        }).done(function (response) {
            console.log(response.value.registers);
            for (register of response.value.registers) {
                var readable = register.readable === "1" ? "" : " disabled";
                var writable = register.writable === "1" ? "" : " disabled";

                var tmp_tr= $('<tr><th class="align-middle" scope="row">' + register.register + '</th><td class="align-middle">' + register.name + '<td class="align-middle">' + register.size + '</td><td class="align-middle">' + register.type + '</td><td><input type="text" class="form-control form-control-sm" name="value"/></td></td><td><button type="button" name="read" class="btn btn-outline-info btn-sm"' + readable + '>Read</button><button type="button" name="write" class="btn btn-outline-info btn-sm"' + writable +'>Write</button></td></tr>');
                tmp_tr.attr("device-id", device_id);
                tmp_tr.attr("register-id", register.register);

                tmp_tr.find("button[name=read]").click(function() {
                    var device_id = $(this).parent().parent().attr("device-id");
                    var register_id = $(this).parent().parent().attr("register-id");
                    var input = $(this).parent().parent().find("input[name=value]");
                    var button = $(this).parent().parent().find("button[name=read]");

                    read_register_device(device_id, register_id, input, button);
                });

                tmp_tr.find("button[name=write]").click(function() {
                    var device_id = $(this).parent().parent().attr("device-id");
                    var register_id = $(this).parent().parent().attr("register-id");
                    var input = $(this).parent().parent().find("input[name=value]");
                    var button = $(this).parent().parent().find("button[name=write]");

                    write_register_device(device_id, register_id, input, button);
                });

                tmp_tr.appendTo(register_list);
            }
        }).fail(function (xhr, status, error) {
            var err = JSON.parse(xhr.responseText).error;
            var tmp= $('<div class="alert alert-danger" role="alert">Get registes list error - ' + err.message + '</div>');
            $('#log').prepend(tmp);
            if ($('#log').children().length > 5) {
                $('#log').children().last().remove();
            }
            $('#modal').modal({'show': true, 'focus': false});
        });
}

jQuery(function ($) {
    var refresh_button = $('#devices-list-refresh-button');
    var discover_button = $('#devices-discover-button');

    var devices_list = $('#devices-list');

    refresh_button.click(function() {
        devices_list.empty();

        var token = $('input[name="_xsrf"]').attr('value')
        jQuery.ajaxSetup({
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-XSRFToken', token);
            }
        });

        jQuery.ajax({
            url: '/api/devices_list',
            async: true,
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST',
            //data: data,
        }).done(function (response) {
            console.log(response.value.devices);
            for (device of response.value.devices) {
                var tmp_li = $('<tr><th scope="row">' + device['id'] + '</th><td>' + device.type_name + '</td></tr>');
                tmp_li.attr("device-id", device.id);
                tmp_li.click(function() {
                    var device_id = $(this).attr("device-id");
                    refresh_device(device_id);
                });
                tmp_li.appendTo(devices_list);
            }
        }).fail(function (xhr, status, error) {
            var err = JSON.parse(xhr.responseText).error;
            var tmp= $('<div class="alert alert-danger" role="alert">Get devices list error - ' + err.message + '</div>');
            $('#log').prepend(tmp);
            if ($('#log').children().length > 5) {
                $('#log').children().last().remove();
            }
            $('#modal').modal({'show': true, 'focus': false});
        });
    });

    discover_button.click(function() {
        var token = $('input[name="_xsrf"]').attr('value')
        jQuery.ajaxSetup({
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-XSRFToken', token);
            }
        });

        jQuery.ajax({
            url: '/api/discover',
            async: true,
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST',
            //data: data,
        }).done(function (response) {

        }).fail(function (xhr, status, error) {
            var err = JSON.parse(xhr.responseText).error;
            var tmp= $('<div class="alert alert-danger" role="alert">Discover error - ' + err.message + '</div>');
            $('#log').prepend(tmp);
            if ($('#log').children().length > 5) {
                $('#log').children().last().remove();
            }
            $('#modal').modal({'show': true, 'focus': false});
        });
    });
});
