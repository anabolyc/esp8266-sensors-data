$(document).ready(function() {
    var last;
    var numSpans = [$("#span-updt"), $("#span-temp"),$("#span-humi"), $("#span-cdio")];
    var colorSettings = {
        items: [{
            min: 17,
            max: 20,
            colors: ["#013fa3", "#008954", "#7c0101"]
        }, {
            min: 30,
            max: 80,
            colors: ["#7c0101", "#008954", "#013fa3"]
        }, {
            min: 300,
            max: 1000,
            colors: ["#013fa3", "#008954", "#7c0101"]
        }],
        getColor: function(value, settings) {
            if (value < settings.min)
                return settings.colors[0];
            else if (value > settings.max)
                return settings.colors[2];
            else
                return settings.colors[1];
        }
    };

    var updateNumbers = function($placeholders, nums, colors) {
        $placeholders.forEach(function(item, index) {
            item.text(nums[index]).parent().css("color", colors[index]);
        });
    };

    var updateData = function(app) {
        console.log("sending data request;");
        $.getJSON({
            url: "/data?from=" + (app.lastdate()),
            success: function(data) {
                if (data.length > 0) {
                    console.log("new data points: ", data.length);
                    var prevLastDate = app.lastdate()
                    // ADD NEW DATA
                    app.addData(data.map(function(item) {
                        return {
                            date: item.date,
                            values: [item.temp, item.humi, item.cdio]
                        }
                    }));

                    var last = app.last();
                    if (last) {
                        // UPDATE NUMS
                        updateNumbers(numSpans, 
                            [   new Date(last.date * 1000).formatTime(true).asString, 
                                Math.round(last.values[0]), 
                                Math.round(last.values[1]), 
                                Math.round(last.values[2])
                            ], [
                                $("#span-updt").css("color"),
                                colorSettings.getColor(last.values[0], colorSettings.items[0]),
                                colorSettings.getColor(last.values[1], colorSettings.items[1]),
                                colorSettings.getColor(last.values[2], colorSettings.items[2])
                            ]
                        );
                    }
                }
                // UPDATE CHARTS
                app.updateCharts();
                // Check if data not too old
                var last = app.last();
                if (last && new Date().valueOf() - last.date * 1000 > 1000 * 60 * 10) {
                    var grey = $("#span-updt").css("color");
                    updateNumbers(numSpans, 
                        [   new Date(last.date * 1000).formatTime(true).asString, 
                            Math.round(last.values[0]), 
                            Math.round(last.values[1]), 
                            Math.round(last.values[2])
                        ], [ grey, grey, grey, grey]
                    ); 
                }
            }
        })
    };

    // SENSORS DATA
    (function (callback) {
        var app = new Application({
            chartPlaceholders: ["chart-temp", "chart-humi", "chart-cdio"],
            scales: function() {
                return [ 
                    [24, new Date().add(-1 / 1), 16], 
                    [12, new Date().add(-1 / 2), 12], 
                    [6 , new Date().add(-1 / 4), 8],  
                    [2 , new Date().add(-1 / 12), 4]
                ];
            },
            scalesCallback: function(value) {
                $(".div-chart-title").text(value + ' HRS');
            },
            colorSettings: colorSettings.items,
            getChartOptions: function(colors) { return {
                "type": "xy",
                "balloon": { 
                    "enabled": false
                },
                "dataProvider": [{x: 0, y1: 0, y2: 0, y3: 0}],
                "categoryField": "x",
                //"categoryAxis": null,
                "valueAxes": [{
                    "type": "date",
                    "autoGridCount": false,
                    "strictMinMax": true,
                    "position": "bottom",
                    "axisAlpha": 0.5,
                    "color": "#888",
                    "axisColor": "#555",
                    "gridColor": "#013fa3",
                    "gridAlpha": 0,
                    "fillColor": "#888",
                    "fillAlpha": 0.1,
                    "labelsEnabled": true, 
                    "labelFunction": function(valueText, date, categoryAxis) {
                        return AmCharts.formatDate(/*date.dataContext.x*/ new Date(valueText), "JJ:NN");
                    }
                }, {
                    "axisAlpha": 1,
                    "position": "left",
                    "color": "#888",
                    "axisColor": "#555",
                    "gridColor": "#013fa3",
                    "gridAlpha": 0.2
                }],
                "graphs": colors.map(function(color, index) {
                    return {
                        "bullet": "round",
                        "xField": "x",
                        "yField": "y" + (index + 1),
                        //"valueField": yField,
                        "bulletAlpha": 0.5,
                        "bulletBorderAlpha": 0,
                        "bulletBorderThickness": 0.5,
                        "bulletColor": color,
                        "lineAlpha": 0,
                        "fillAlphas": 0,
                        "bulletSize": 6
                    };
                })
            }}
        });
        window.setTimeout(updateData.bind(this, app), 0);
        window.setInterval(updateData.bind(this, app), 10000);
    })();
});