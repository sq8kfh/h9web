jQuery(function ($) {
    addSSEventListener("h9bus_stat", function (e) {
        var tmp_json = JSON.parse(e.data);
        var h9bus_stat = tmp_json.value;
        console.log('sse h9bus_stat: ' + e.data);
        $('#h9bus_version').text(h9bus_stat.version);
        $('#h9bus_uptime').text(h9bus_stat.uptime);
        $('#h9bus_coneccted_clients').text(h9bus_stat.connected_clients_count);
        const Endpoint = ({name, send_frames_counter, received_frames_counter}) =>
            `<h6 id="h9bus_endpoint_name" class="card-subtitle mb-1 mt-3">${name}:</h6>
               <div class="row">
                   <div class="col-sm-5">Frames sent:</div>
                   <div class="col" id="h9bus_endpoint_sent">${send_frames_counter}</div>
               </div>
               <div class="row">
                   <div class="col-sm-5">Frames received:</div>
                   <div class="col" id="h9bus_endpoint_recv">${received_frames_counter}</div>
               </div>`
        endpoint_list = h9bus_stat.endpoint.map(function (endpoint) {
            return Endpoint(endpoint);
        }).join('');
        $('#h9bus_endpoint').html(endpoint_list);
    });

    addSSEventListener("h9d_stat", function (e) {
        var tmp_json = JSON.parse(e.data);
        var h9d_stat = tmp_json.value;
        console.log('sse h9bus_stat: ' + e.data);
        $('#h9d_version').text(h9d_stat.version);
        $('#h9d_uptime').text(h9d_stat.uptime);
        $('#h9d_coneccted_clients').text(h9d_stat.connected_clients_count);
        $('#h9d_active_devices').text(h9d_stat.active_devices_count);
    });
});