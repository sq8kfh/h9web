const antenna_switch_id = 32;
const selected_antenna_register = 10;


function switch_antenna(ant) {
    var token = $('input[name="_xsrf"]').attr('value')
    $.ajaxSetup({
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-XSRFToken', token);
        }
    });

    jQuery.ajax({
            url: '/api/device/' + antenna_switch_id +'/set_register',
            async: true,
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({'register': selected_antenna_register, 'value': ant}),
        }).done(function (response) {
            console.log(response);
        }).fail(function (xhr, status, error) {
            var err = JSON.parse(xhr.responseText).error;
            error_message('Write register ' + selected_antenna_register + ' on device ' + antenna_switch_id + ' error - ' + err.message);
        });
}


function procces_device_event(device_id, event_name, event_data) {
    console.log('Procces device (' +  device_id + ') \'' +  event_name + '\' event:', event_data);

    if (device_id != antenna_switch_id || event_name != 'register_change' || event_data.register_id != selected_antenna_register) return;

    var as_button_1 = $('#antenna-switch-btn1');
    var as_button_2 = $('#antenna-switch-btn2');
    var as_button_3 = $('#antenna-switch-btn3');
    var as_button_4 = $('#antenna-switch-btn4');
    var as_button_5 = $('#antenna-switch-btn5');
    var as_button_6 = $('#antenna-switch-btn6');
    var as_button_7 = $('#antenna-switch-btn7');
    var as_button_8 = $('#antenna-switch-btn8');

    as_button_1.removeClass('active');
    as_button_2.removeClass('active');
    as_button_3.removeClass('active');
    as_button_4.removeClass('active');
    as_button_5.removeClass('active');
    as_button_6.removeClass('active');
    as_button_7.removeClass('active');
    as_button_8.removeClass('active');

    switch (parseInt(event_data.value, 10)) {
        case 1:
            as_button_1.addClass('active'); break;
        case 2:
            as_button_2.addClass('active'); break;
        case 3:
            as_button_3.addClass('active'); break;
        case 4:
            as_button_4.addClass('active'); break;
        case 5:
            as_button_5.addClass('active'); break;
        case 6:
            as_button_6.addClass('active'); break;
        case 7:
            as_button_7.addClass('active'); break;
        case 8:
            as_button_8.addClass('active'); break;
    }
}


jQuery(function ($) {
    addSSEventListener("device_event", function (e) {
        var device_event = JSON.parse(e.data);
        console.log('sse device_event: ' + e.data);
        procces_device_event(device_event.device_id, device_event.event_name, device_event.event_data);
    });

    $('#antenna_switch_tile_device_id').text('#' + antenna_switch_id);

    var as_button_1 = $('#antenna-switch-btn1');
    var as_button_2 = $('#antenna-switch-btn2');
    var as_button_3 = $('#antenna-switch-btn3');
    var as_button_4 = $('#antenna-switch-btn4');
    var as_button_5 = $('#antenna-switch-btn5');
    var as_button_6 = $('#antenna-switch-btn6');
    var as_button_7 = $('#antenna-switch-btn7');
    var as_button_8 = $('#antenna-switch-btn8');

    as_button_1.click(function() {
        switch_antenna(1);
    });
    as_button_2.click(function() {
        switch_antenna(2);
    });
    as_button_3.click(function() {
        switch_antenna(3);
    });
    as_button_4.click(function() {
        switch_antenna(4);
    });
    as_button_5.click(function() {
        switch_antenna(5);
    });
    as_button_6.click(function() {
        switch_antenna(6);
    });
    as_button_7.click(function() {
        switch_antenna(7);
    });
    as_button_8.click(function() {
        switch_antenna(8);
    });
});
