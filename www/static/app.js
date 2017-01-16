// DEBUG
/*
var getRandomColor = function() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}; */

$(document).ready(function() {

    Date.prototype.minus = function(amount) {
        this.setDate(this.getDate() - amount);
        return this;
    };

    var config = {
        // DEBUG!!
        dataUpdateInterval: 10000,
        timeUpdateInterval: 1000,
        getMinDate: function() {
            return (new Date()).minus(1);
        }
    };

    var state = {
        data: [],
        charts: [],
        scaleIndex: 2,
        scales: function() {
            return [
                ['24 HRS', (new Date()).minus(1 / 1)], 
                ['12 HRS', (new Date()).minus(1 / 2)], 
                ['6 HRS', (new Date()).minus(1 / 4)], 
                ['2 HRS', (new Date()).minus(1 / 12)], 
            ];
        },
        last: function() {
            return this.data.length > 0 ? this.data[this.data.length - 1] : null;
        },
        lastdate: function() {
            return (this.last() || { date: 0 }).date;
        },
        formatTime: function(date, withSeconds) {
            var hrs = date.getHours();
            var mins = date.getMinutes()
            var result =  {
                hours: (hrs < 10 ? "0" : "") + hrs,
                minutes: (mins < 10 ? "0" : "") + mins,
                asString: (hrs < 10 ? "0" : "") + hrs 
                    + (withSeconds ? ":" : " ")
                    + (mins < 10 ? "0" : "") + mins 
            };
            return result;
        },
        updateCharts: function(colors, data, shiftPoints) {
            console.log("update charts: ", data.length, "new points; ", shiftPoints, " ponts to remove;");
            state.charts.forEach(function(chart, index) {
                var shifts = shiftPoints;

                chart.series[0].options.color = colors[index];
                chart.series[0].update(chart.series[0].options);

                data.forEach(function(point, pointIndex) {
                    var isShift = shifts-- > 0;
                    var existing = chart.series[0].data.find(function(point0) { return point0.x == point.date; });
                    if (existing)
                        existing.update({x: point.date, y: point.values[index]});
                    else
                        chart.series[0].addPoint(
                            [ point.date, point.values[index] ], 
                            pointIndex == data.length - 1,
                            isShift
                        );    
                });
            });
        }
    };

    var chartOptions = {
        chart: {
            type: "spline",
            backgroundColor: "black",
            animation: false
        },
        title: { 
            text: '',
            y: 15,
            floating: true
        },
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
            colors: ["#013fa3", "#008954", "#7c0101"]
        }, 
        humi: {
            min: 30,
            max: 80,
            colors: ["#7c0101", "#008954", "#013fa3"]
        },
        cdio: {
            min: 300,
            max: 1000,
            colors: ["#013fa3", "#008954", "#7c0101"]
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
        console.time("updating digital clock;")
        var time = state.formatTime(new Date(), true);
        $("#span-time-hr").text(time.hours);
        $("#span-time-mi").text(time.minutes);
        $("#span-time-dt").toggleClass("active");
        window.setTimeout(function() {
            $("#span-time-hr").text(time.hours);
            $("#span-time-mi").text(time.minutes);
            $("#span-time-dt").toggleClass("active");
        }, config.timeUpdateInterval);
        console.timeEnd("updating digital clock;")
    });

    // SENSORS DATA
    (function (init, callback) {
        init()
        callback();
        window.setInterval(callback, config.dataUpdateInterval);
    })(function() {
        console.log("initializing charts;");
        state.charts = [
            Highcharts.chart('chart-temp', $.extend(chartOptions, {
                series: [{
                    name: "TEMP",
                    animation: false,
                    marker: false
                }]
            })),
            Highcharts.chart('chart-humi', $.extend(chartOptions, {
                series: [{
                    type: "spline",
                    name: "HUMI",
                    animation: false,
                    marker: false
                }]
            })),
            Highcharts.chart('chart-cdio', $.extend(chartOptions, {
                series: [{
                    type: "spline",
                    name: "CDIO",
                    animation: false,
                    marker: false
                }]
            }))
        ];
    }, function() {
        console.log("sending data request;");
        $.getJSON({
            url: "/data?from=" + (state.lastdate() - 1),
            success: function(data) {
                // CHANGE SCALE
                console.log("data request done, updating scales;");
                console.time("update scales");
                var scales = state.scales();
                if (state.scaleIndex == scales.length)
                    state.scaleIndex = 0;
                var minScale = scales[state.scaleIndex++];
                console.log("setting scales to", minScale[0]);
                state.charts.forEach(function(chart) {
                    chart.setTitle({text: minScale[0]});
                    chart.xAxis[0].setExtremes(minScale[1], null);
                });
                console.timeEnd("update scales");

                if (data.length > 0) {
                    console.log("new data points: ", data.length);
                    var prevLastDate = state.lastdate()
                    // ADD NEW DATA
                    for (var i = 0; i < data.length; i++) {
                        var existing = state.data.find(function(item) {return item.date == data[i].date; });
                        if (existing)
                            existing = data[i];
                        else
                            state.data.push(data[i]);
                    }

                    // DELETE OLD POINTS
                    var minDate = config.getMinDate();
                    var shiftPoints = 0;
                    while(new Date(state.data[0].date * 1000) < minDate) {
                        state.data.shift();
                        shiftPoints++;
                    }

                    var last = state.last();
                    if (last) {
                        // UPDATE NUMS
                        console.log("updating numbers;");
                        $("#span-updt").text(state.formatTime(new Date(last.date * 1000), true).asString);
                        $("#span-temp").text(Math.round(last.temp)).parent().css("color", settings.getColor(last.temp, settings.temp));
                        $("#span-humi").text(Math.round(last.humi)).parent().css("color", settings.getColor(last.humi, settings.humi));
                        $("#span-cdio").text(Math.round(last.cdio)).parent().css("color", settings.getColor(last.cdio, settings.cdio));
                        
                        // UPDATE CHARTS
                        console.log("updating charts;");
                        console.time("update charts");
                        var colors = [
                            settings.getColor(last.temp, settings.temp),
                            settings.getColor(last.humi, settings.humi),
                            settings.getColor(last.cdio, settings.cdio)
                        ];
                        // DEBUG
                        var getRandomColor = function() {
                            var letters = '0123456789ABCDEF';
                            var color = '#';
                            for (var i = 0; i < 6; i++ ) {
                                color += letters[Math.floor(Math.random() * 16)];
                            }
                            return color;
                        };

                        state.updateCharts(colors,  
                            state.data.filter(function(point) {
                                return point.date >= prevLastDate;
                            }).map(function(point) { 
                                return {date: point.date * 1000, values: [point.temp, point.humi, point.cdio]}; 
                            }),
                            // first data load: no need to shift data
                            prevLastDate == 0 ? 0 : shiftPoints
                        );
                        console.timeEnd("update charts");
                    }
                }
            }
        })
    });
});