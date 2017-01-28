$(document).ready(function() {
    // TIME
    (function (callback) {
        callback();
        window.setInterval(callback, 2000);
    })(function() {
        console.time("updating digital clock;")
        var time = new Date().formatTime(true);
        $("#span-time-hr").text(time.hours);
        $("#span-time-mi").text(time.minutes);
        $("#span-time-dt").toggleClass("active");
        window.setTimeout(function() {
            $("#span-time-hr").text(time.hours);
            $("#span-time-mi").text(time.minutes);
            $("#span-time-dt").toggleClass("active");
        }, 1000);
        console.timeEnd("updating digital clock;")
    });
});