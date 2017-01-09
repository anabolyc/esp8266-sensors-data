// TODO: filter last 24 hrs
$(document).ready(function() {
    var state = {
        data: [],
        lastdate: 0,
        charts: [],
        last: function() {
            return this.data.length > 0 ? this.data[this.data.length - 1] : null;
        },
        getMinDate: function() {
            var d = new Date();
            d.setDate(d.getDate() - 1);
            return d;
        },
        lastdate: function() {
            return (this.last() || { date: 0 }).date;
        },
        formatTime: function(date, withSeconds) {
            var hrs = date.getHours();
            var mins = date.getMinutes()
            var result =  
                (hrs < 10 ? "0" : "") + hrs 
                + (withSeconds ? ":" : " ")
                + (mins < 10 ? "0" : "") + mins;
            return result;
        }
    };

    var chartOptions = {
        chart: {
            type: "spline",
            backgroundColor: "black"
        },
        title: { text: '' },
        legend: { enabled: false },
        yAxis: { 
            title: { text: '' },
            gridLineColor: "#333",
            gridLineDashStyle: "ShortDot"
        },
        xAxis: {
            type: 'datetime'
        },
        tooltip: { enabled: false }
    };

    var settings = {
        temp: {
            min: 17,
            max: 20,
            colors: ["#013fa3", "#555", "#7c0101"]
        }, 
        humi: {
            min: 30,
            max: 80,
            colors: ["#7c0101", "#555", "#013fa3"]
        },
        cdio: {
            min: 0,
            max: 400,
            colors: ["#7c0101", "#555", "#013fa3"]
        },
        getColor: function(value, settings) {
            if (value < settings.min)
                return settings.colors[0];
            else if (value > settings.max)
                return settings.colors[2];
            else
                return settings.colors[1];
        }
    };
    
    // TIME
    (function (callback) {
        callback();
        window.setInterval(callback, 2000);
    })(function() {
        $("#span-time").text(state.formatTime(new Date(), true));
        window.setTimeout(function() {
            $("#span-time").text(state.formatTime(new Date(), false));
        }, 500);
    });

    // SENSORS DATA
    (function (callback) {
        callback();
        window.setInterval(callback, 60000);
    })(function() {
        $.getJSON({
            url: "/data?from=" + state.lastdate(),
            success: function(data) {
                if (data.length > 0) {
                    // ADD NEW DATA
                    for (var i = 0; i < data.length; i++) {
                        state.data.push(data[i]);
                    }
                    // DELETE POINTS OLDER THAN 24 HRS
                    var minDate = state.getMinDate();
                    while(new Date(state.data[0].date * 1000) < minDate)
                        state.data.shift();

                    var last = state.last();
                    // UPDATE NUMS
                    if (last) {
                        $("#span-updt").text(state.formatTime(new Date(last.date * 1000), true));
                        $("#span-temp").text(last.temp).css("color", settings.getColor(last.temp, settings.temp));
                        $("#span-humi").text(last.humi).css("color", settings.getColor(last.humi, settings.humi));
                        $("#span-cdio").text(last.cdio).css("color", settings.getColor(last.cdio, settings.cdio));
                    }

                    // UPDATE CHARTS
                    state.charts = [
                        Highcharts.chart('chart-temp', $.extend(chartOptions, {
                            series: [{
                                name: "TEMP",
                                color: settings.getColor(last.temp, settings.temp),
                                animation: false,
                                marker: false,
                                data: state.data.map(function(point){ 
                                    return [point.date * 1000, point.temp]; 
                                })
                            }]
                        })),
                        Highcharts.chart('chart-humi', $.extend(chartOptions, {
                            series: [{
                                type: "spline",
                                name: "HUMI",
                                color: settings.getColor(last.humi, settings.humi),
                                animation: false,
                                marker: false,
                                data: state.data.map(function(point){ 
                                    return [point.date * 1000, point.humi]; 
                                })
                            }]
                        })),
                        Highcharts.chart('chart-cdio', $.extend(chartOptions, {
                            series: [{
                                type: "spline",
                                name: "CDIO",
                                color: settings.getColor(last.cdio, settings.cdio),
                                animation: false,
                                marker: false,
                                data: state.data.map(function(point){ 
                                    return [point.date * 1000, point.cdio]; 
                                })
                            }]
                        }))
                    ];
                }
            }
        })
    });
});