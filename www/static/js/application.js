function Application(options) {
    var self = this;
    self.scales = options.scales;
    self.scaleIndex = 0;
    self.colorSettings = options.colorSettings;
    self.scalesCallback = options.scalesCallback;

    self.data = [];
    self.charts = [];
    console.time("initializing charts;");
    options.chartPlaceholders.forEach(function(item, index) {
        self.charts.push(AmCharts.makeChart(item, 
            options.getChartOptions(options.colorSettings[index].colors)
        ));
    });
    console.timeEnd("initializing charts;");
};

Application.prototype.getMinDate = function() {
    return new Date().add(-1);
};

Application.prototype.addData = function(data) { 
    var self = this;
    data.forEach(function(x) { 
        self.data.push(x)
    });
    // DELETE OLD POINTS
    var minDate = this.getMinDate().to();
    while(this.data[0].date < minDate) {
        this.data.shift();
    }
};

Application.prototype.last = function() {
    if (this.data.length == 0)
        return null;
    else {
        var length = this.data.length;
        var last = this.data[length - 1];
        var result = [];
        for (var i = 0; i < last.values.length; i++) {
            for (var j = length - 1; j >= 0; j--) {
                if (this.data[j].values[i] > 0) {
                    result[i] = this.data[j].values[i];
                    break;
                }
            }
        }
        return {
            date: last.date,
            values: result
        };
    }
};

Application.prototype.lastdate = function() {
    return (
        this.last() || { date: this.getMinDate().to() }
    ).date;
};

Application.prototype.getChartData = function(from, skipPoints) {
    return this.data
    .map(function(point) {
        return point.values.reduce(function(prev, x) {
            prev.push(x);
            return prev;
        }, [point.date * 1000])
    }).filter(function(point) { 
        return point[0] >= from; 
    }).reduce(function(prev, curr, index) {
        if (index % skipPoints == 0) {
            prev.push({ cnt: 1, values: curr });
            return prev;
        } else {
            var last = prev[prev.length - 1];
            last.cnt++;
            for (var i = 0; i < curr.length; i++)
                last.values[i] += curr[i];
            prev[prev.length - 1] = last;
            return prev;
        }
    }, []).map(function(item) {
        return item.values.map(function(x) { return x / item.cnt; } );
    });
};

Application.prototype.updateCharts = function() { 
    var self = this;
    var scales = self.scales();
    if (self.scaleIndex == scales.length) self.scaleIndex = 0;
    var minScale = scales[self.scaleIndex++];
    var minScaleValue = minScale[1].valueOf();
    var maxScaleValue = new Date().valueOf();
    self.scalesCallback(minScale[0]);
    var series = self.getChartData(minScaleValue, minScale[2])
    console.log("Chart data", series.length + " points", "Scale: " + minScale[0] + "HRS");

    console.time("update charts");
    self.charts.forEach(function(chart, index) {
        var catAxis = chart.valueAxes[0]; // chart.categoryAxis;
        catAxis.gridCount = minScale[0];
        catAxis.labelFrequency = minScale[0] / 4;
        catAxis.minimum = minScaleValue;
        catAxis.maximum = maxScaleValue;

        var setting = self.colorSettings[index];
        chart.dataProvider = series
        .filter(function(point) { 
            return point[index + 1] > 0; 
        })
        .map(function(point) {
            var prop = point[index + 1] < setting.min ? "y1" : (point[index + 1] > setting.max ? "y3" : "y2");
            var pnt = { x: new Date(point[0]) };
            pnt[prop] = point[index + 1];
            return pnt;
        });
        chart.validateData();
    });
    console.timeEnd("update charts");
};