$(document).ready(function() {
    var last;
    var numSpans = [$("#span-updt"), $("#span-temp"),$("#span-humi"), $("#span-cdio"), $("#span-pres")];
    var colorSettings = {
        items: [{
            min: 17,
            max: 20,
            colors: ["#013fa3", "#008954", "#9e0012"]
        }, {
            min: 30,
            max: 80,
            colors: ["#9e0012", "#008954", "#013fa3"]
        }, {
            min: 300,
            max: 1000,
            colors: ["#013fa3", "#008954", "#9e0012"]
        }, {
	    min: 740,
	    max: 765,
	    colors: ["#013fa3", "#008954", "#013fa3"]
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
                            values: [item.temp, item.humi, item.cdio, item.pres * 0.00075]
                        }
                    }));

                    var last = app.last();
                    if (last) {
                        // UPDATE NUMS
			var values = [ new Date(last.date * 1000).formatTime(true).asString ];
			var colors = [ $("#span-updt").css("color") ];
			last.values.forEach(function(x, index) { 
				values.push(Math.round(x)); 
				colors.push(colorSettings.getColor(x, colorSettings.items[index]));
			});
                        updateNumbers(numSpans, values, colors);
                    }
                }
                // UPDATE CHARTS
                app.updateCharts();
                // Check if data not too old
                var last = app.last();
                if (last && new Date().valueOf() - last.date * 1000 > 1000 * 60 * 10) {
                    var grey = $("#span-updt").css("color");
		    var values = [ new Date(last.date * 1000).formatTime(true).asString ];
		    var colors = [ grey ];
		    last.values.forEach(function(x) {
			values.push(Math.round(x));
			colors.push(grey);
		    });
                    updateNumbers(numSpans, values, colors); 
                }
            }
        })
    };

    // SENSORS DATA
    (function (callback) {
        var app = new Application({
            chartPlaceholders: ["chart-temp", "chart-humi", "chart-cdio", "chart-pres"],
            scales: function() {
                return [ 
                    [24, new Date().add(-1 / 1), 16], 
                    [12, new Date().add(-1 / 2), 12], 
                    [6 , new Date().add(-1 / 4), 8],  
                    [2 , new Date().add(-1 / 12), 4]
                ];
            },
            scalesCallback: function(value) {
                $(".div-chart-title").text(value + 'h');
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
