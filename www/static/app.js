$(document).ready(function() {
    Date.prototype.minus = function(amount) {
        this.setDate(this.getDate() - amount);
        return this;
    };

    var config = {
        dataUpdateInterval: 10000,
        timeUpdateInterval: 1000,
        getMinDate: function() {
            return (new Date()).minus(1);
        }
    };

    var state = {
        data: [],
        charts: [],
        scaleIndex: 0,
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
            state.charts.forEach(function(chart, index) {
                var shifts = shiftPoints;
                chart.series[0].color = colors[index];
                data.forEach(function(point, pointIndex) {
                    var isShift = shifts-- > 0;
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
            backgroundColor: "black"
            //animation: false
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
            colors: ["#013fa3", "#555", "#7c0101"]
        }, 
        humi: {
            min: 30,
            max: 80,
            colors: ["#7c0101", "#555", "#013fa3"]
        },
        cdio: {
            min: 0,
            max: 800,
            colors: ["#555", "#013fa3", "#7c0101"]
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
        var time = state.formatTime(new Date(), true);
        $("#span-time-hr").text(time.hours);
        $("#span-time-mi").text(time.minutes);
        $("#span-time-dt").toggleClass("active");
        window.setTimeout(function() {
            $("#span-time-hr").text(time.hours);
            $("#span-time-mi").text(time.minutes);
            $("#span-time-dt").toggleClass("active");
        }, config.timeUpdateInterval);
    });

    // SENSORS DATA
    (function (init, callback) {
        init()
        callback();
        window.setInterval(callback, config.dataUpdateInterval);
    })(function() {
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
        $.getJSON({
            url: "/data?from=" + state.lastdate(),
            success: function(data) {
                // CHANGE SCALE
                var scales = state.scales();
                if (state.scaleIndex == scales.length)
                    state.scaleIndex = 0;
                var minScale = scales[state.scaleIndex++];
                state.charts.forEach(function(chart) {
                    chart.setTitle({text: minScale[0]});
                    chart.xAxis[0].setExtremes(minScale[1], null);
                });

                if (data.length > 0) {
                    var prevLastDate = state.lastdate()
                    // ADD NEW DATA
                    for (var i = 0; i < data.length; i++) {
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
                        $("#span-updt").text(state.formatTime(new Date(last.date * 1000), true).asString);
                        $("#span-temp").text(Math.round(last.temp)).css("color", settings.getColor(last.temp, settings.temp));
                        $("#span-humi").text(Math.round(last.humi)).css("color", settings.getColor(last.humi, settings.humi));
                        $("#span-cdio").text(Math.round(last.cdio)).css("color", settings.getColor(last.cdio, settings.cdio));
                        
                        // UPDATE CHARTS
                        var colors = [
                            settings.getColor(last.temp, settings.temp),
                            settings.getColor(last.humi, settings.humi),
                            settings.getColor(last.cdio, settings.cdio)
                        ];

                        state.updateCharts(colors,  
                            state.data.filter(function(point) {
                                return point.date > prevLastDate;
                            }).map(function(point) { 
                                return {date: point.date * 1000, values: [point.temp, point.humi, point.cdio]}; 
                            }),
                            // first data load: no need to shift data
                            prevLastDate == 0 ? 0 : shiftPoints
                        );
                    }
                }
            }
        })
    });
});