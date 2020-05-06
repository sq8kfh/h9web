jQuery(function ($) {
    var sendframe_form_id = '#sendframe_form';

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
