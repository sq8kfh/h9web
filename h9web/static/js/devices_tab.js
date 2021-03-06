function error_message(msg) {
    var tmp= $('<div class="alert alert-danger" role="alert">' + msg + '</div>');
    $('#log').prepend(tmp);
    if ($('#log').children().length > 5) {
        $('#log').children().last().remove();
    }
    $('#modal').modal({'show': true, 'focus': false});
}

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
            input.change();
        }).fail(function (xhr, status, error) {
            var err = JSON.parse(xhr.responseText).error;
            error_message('Read register ' + register_id + ' on device ' + device_id + ' error - ' + err.message);
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
            input.change();
        }).fail(function (xhr, status, error) {
            var err = JSON.parse(xhr.responseText).error;
            error_message('Write register ' + register_id + ' on device ' + device_id + ' error - ' + err.message);
        });
}

function refresh_device(device_id) {
    var device_tab_register_list = $('#register-list');
    var device_tab_id = $('#dt-id');
    var device_tab_type = $('#dt-type');
    var device_tab_name = $('#dt-name');
    var device_tab_version = $('#dt-version');
    var device_tab_created = $('#dt-created');
    var device_tab_last_seen = $('#dt-last-seen');
    var device_tab_description = $('#dt-description');

    var device_tab_reset_btn = $('#dt-reset-btn');
    var device_tab_firmware_upload_btn = $('#dt-firmware-upload-btn');

    device_tab_register_list.empty();
    device_tab_id.text(device_id);
    device_tab_type.text('');
    device_tab_name.text('');
    device_tab_version.text('');
    device_tab_created.text('');
    device_tab_last_seen.text('');
    device_tab_description.text('');

    device_tab_reset_btn.prop('disabled', true);
    device_tab_firmware_upload_btn.prop('disabled', true);

    jQuery.ajax({
            url: '/api/device/' + device_id +'/info',
            async: true,
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST',
            //data: data,
        }).done(function (response) {
            device_tab_type.text(response.value.type);
            device_tab_name.text(response.value.name);
            device_tab_version.text(response.value.version);
            device_tab_created.text(response.value.created_time);
            device_tab_last_seen.text(response.value.last_seen_time);
            device_tab_description.text(response.value.description);
            device_tab_reset_btn.prop('disabled', false);
        }).fail(function (xhr, status, error) {
            var err = JSON.parse(xhr.responseText).error;
            error_message('Get device info error - ' + err.message);
        });

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

                var tmp_tr = $('<tr><th class="align-middle" scope="row">' + register.register + '</th><td class="align-middle">' + register.name + '<td class="align-middle">' + register.size + '</td><td class="align-middle">' + register.type + '</td><td><input type="text" class="form-control form-control-sm" name="value"/></td></td><td><button type="button" name="read" class="btn btn-outline-info btn-sm"' + readable + '>Read</button><button type="button" name="write" class="btn btn-outline-info btn-sm"' + writable +'>Write</button></td></tr>');
                var tmp_second_tr = null;

                if (register.bits_names) {
                    tmp_tr.find("th").attr("rowspan", 2);
                    tmp_second_tr = $('<tr><td colspan="5"><div class="btn-group"></div></td></tr>');
                    tmp_second_tr.attr("device-id", device_id);
                    tmp_second_tr.attr("bit-register-id", register.register);

                    var i = 0;
                    for (bit_name of register.bits_names) {
                        var button = $('<button type="button" bit="' + i + '" class="btn btn-outline-info btn-sm">' + bit_name + '</button>');

                        button.click(function () {
                            //var device_id = $(this).parent().parent().attr("device-id");
                            var register_id = $(this).parent().parent().parent().attr("bit-register-id");
                            var bit_number = parseInt($(this).attr("bit"), 10);
                            var input = $('#register-list').find("tr[register-id=" + register_id + "]").find("input[name=value]");

                            var value = parseInt(input.val());
                            value = value ^ (1 << bit_number);
                            input.val(value);
                            input.change();
                        });

                        button.appendTo(tmp_second_tr.find("div"));
                        ++i;
                    }

                    tmp_tr.find("input[name=value]").change(function () {
                        //var device_id = $(this).parent().parent().attr("device-id");
                        var register_id = $(this).parent().parent().attr("register-id");
                        var value = parseInt($(this).val(), 10);
                        var tr = $('#register-list').find("tr[bit-register-id=" + register_id + "]");

                        for (var i = 0; i < 16; ++i) {
                            var button = tr.find('button[bit=' + i + ']');
                            if (button) {
                                if (value & (1 << i)) {
                                    button.addClass('active');
                                } else {
                                    button.removeClass('active');
                                }
                            }
                        }
                    });
                }

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

                tmp_tr.appendTo(device_tab_register_list);
                if (register.bits_names) {
                    tmp_second_tr.appendTo(device_tab_register_list);
                }
            }
        }).fail(function (xhr, status, error) {
            var err = JSON.parse(xhr.responseText).error;
            error_message('Get registes list error - ' + err.message);
        });
}

function refresh_device_list() {
    var devices_list = $('#devices-list');
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
            var tmp_li = $('<tr><th scope="row">' + device['id'] + '</th><td>' + device.name + '</td></tr>');
            tmp_li.attr("device-id", device.id);
            tmp_li.click(function() {
                var device_id = $(this).attr("device-id");
                refresh_device(device_id);
            });
            tmp_li.appendTo(devices_list);
        }
    }).fail(function (xhr, status, error) {
        var err = JSON.parse(xhr.responseText).error;
        error_message('Get devices list error - ' + err.message);
    });
}

jQuery(function ($) {
    var refresh_btn = $('#devices-list-refresh-btn');
    var discover_btn = $('#devices-discover-btn');
    var device_tab_reset_btn = $('#dt-reset-btn');

    refresh_btn.click(refresh_device_list);

    discover_btn.click(function() {
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
            refresh_device_list();
        }).fail(function (xhr, status, error) {
            var err = JSON.parse(xhr.responseText).error;
            error_message('Discover error - ' + err.message);
        });
    });

    device_tab_reset_btn.click(function() {
        var device_tab_id = $('#dt-id');

        var token = $('input[name="_xsrf"]').attr('value')
        jQuery.ajaxSetup({
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-XSRFToken', token);
            }
        });

        jQuery.ajax({
            url: '/api/device/' + device_tab_id.text() +'/reset',
            async: true,
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST',
            //data: data,
        }).done(function (response) {

        }).fail(function (xhr, status, error) {
            var err = JSON.parse(xhr.responseText).error;
            error_message('Device reset error - ' + err.message);
        });
    });

    refresh_device_list();
});
