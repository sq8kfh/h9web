function read_register_device(device_id, register_id, input) {
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
            // Handle Failure
        });
}

function write_register_device(device_id, register_id, input) {
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
            // Handle Failure
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
                console.log(readable, register.readable);
                var writable = register.writable === "1" ? "" : " disabled";
                console.log(writable, register.writable);

                var tmp_tr= $('<tr><th scope="row">' + register.register + '</th><td>' + register.name + '<td>' + register.size + '</td><td>' + register.type + '</td><td><input type="text" name="value"/></td></td><td><button type="button" name="read" class="btn btn-outline-info"' + readable + '>Read</button><button type="button" name="write" class="btn btn-outline-info"' + writable +'>Write</button></td></tr>');
                tmp_tr.attr("device-id", device_id);
                tmp_tr.attr("register-id", register.register);

                tmp_tr.find("button[name=read]").click(function() {
                    var device_id = $(this).parent().parent().attr("device-id");
                    var register_id = $(this).parent().parent().attr("register-id");
                    var input = $(this).parent().parent().find("input[name=value]");

                    read_register_device(device_id, register_id, input);
                });

                tmp_tr.find("button[name=write]").click(function() {
                    var device_id = $(this).parent().parent().attr("device-id");
                    var register_id = $(this).parent().parent().attr("register-id");
                    var input = $(this).parent().parent().find("input[name=value]");

                    write_register_device(device_id, register_id, input);
                });

                tmp_tr.appendTo(register_list);
            }
        }).fail(function (xhr, status, error) {
            // Handle Failure
        });
}

jQuery(function ($) {
    var refresh_button = $('#devices-list-refresh-button');
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
                var tmp_li = $('<li class="list-group-item">' + device['id'] + ' [' + device.type_name + ']</li>');
                tmp_li.attr("device-id", device.id);
                tmp_li.click(function() {
                    var device_id = $(this).attr("device-id");
                    refresh_device(device_id);
                });
                tmp_li.appendTo(devices_list);
            }
        }).fail(function (xhr, status, error) {
            // Handle Failure
        });
    });
});
