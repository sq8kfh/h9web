const Frame = ({priority, type, seqnum, source, destination, dlc, data, origin}) =>
        `<div class="alert alert-info">
               <strong>${source}</strong> (<strong>${origin}</strong>) -> <strong>${destination}</strong> priority: <strong>${priority}</strong> type: <strong>${type}</strong> seqnum:  <strong>${seqnum}</strong> dlc: <strong>${dlc}</strong> data: <strong>${data.join(' ')}</strong>
            </div>`

jQuery(function ($) {
    var sendframe_form_id = '#sendframe_form';

    addSSEventListener("h9frame", function (e) {
        var tmp_json = JSON.parse(e.data);
        console.log('sse h9frame: ' + e.data);
        $('#frame_list').prepend(Frame(tmp_json));
        if ($('#frame_list').children().length > 50) {
            $('#frame_list').children().last().remove();
        }
    });

    $(sendframe_form_id).submit(function (event) {
        event.preventDefault();
        // var data = {};
        // $(sendframe_form_id).serializeArray().map(function(x){data[x.name] = x.value;});
        // data = JSON.stringify(data);
        // console.log('Send frame: ' + data);
        var data = $(sendframe_form_id).serializeJSON();

        console.log('Send frame: ' + data);

        var token = $('input[name="_xsrf"]').attr('value')
        $.ajaxSetup({
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-XSRFToken', token);
            }
        });

        jQuery.ajax({
            url: '/api/sendframe',
            async: true,
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST',
            data: data,
        }).done(function () {
            // Handle Success
        }).fail(function (xhr, status, error) {
            // Handle Failure
        });
    });
});
