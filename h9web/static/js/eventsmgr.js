let sse;
let _listeners_ =[];

function addSSEventListener(event, func) {
    _listeners_.push({'event': event, 'listener': func});
    sse.addEventListener(event, func);
}

function setupSSE(reconnect_time) {
    const sse_url = window.location.href.split(/\?|#/, 1)[0] + 'events';
    sse = new EventSource(sse_url);

    sse.addEventListener("connection", function (e) {
        console.log("SSE connection: " + e.data);
        $('#sse-indicator').removeClass('invisible');
    });

    sse.onerror = function () {
        console.log("SSE error, try reconnect by ", reconnect_time/1000, " seconds");
        $('#sse-indicator').addClass('invisible');
        sse.close();
        window.setTimeout(setupSSE, reconnect_time, reconnect_time * 2 > 15000 ? 15000 : reconnect_time * 2);
    };

    for (listener of _listeners_) {
        sse.addEventListener(listener.event, listener.listener);
    }
}

jQuery(function ($) {
    setupSSE(1000);
});
