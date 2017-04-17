var sqlite3 = require('sqlite3').verbose();
var path    = require('path');
var db      = new sqlite3.Database('../data/data.db', sqlite3.OPEN_READONLY);
var express = require('express');
var app     = express();

var sqlTmpl = { dataavg: 
                "SELECT CAST(frame * 60 AS INT) AS date, temp, humi, cdio, pres " +
                "FROM ( " +
                "     SELECT frame, avg(temp/100.0) as temp, avg(humi) as humi, avg(cdio) as cdio, avg(pres) as pres " +
                "     FROM (" +
                "         SELECT round(strftime('%s', date) / 60.0) as frame, * " +
                "         FROM sensors_data" +
                "     ) x" +
                "     GROUP BY frame " +
                ") x " +
                "WHERE date > %from " + 
                "ORDER BY date",
                data: 
                "SELECT CAST(strftime('%s', date) AS INT) AS date, NULLIF(temp/100.0, 0) AS temp, NULLIF(humi, 0) AS humi, NULLIF(cdio, 0) AS cdio, NULLIF(pres, 0) as pres " +
                "FROM sensors_data " +
                "WHERE CAST(strftime('%s', date) AS INT) > %from " + 
                "ORDER BY date"};
(function() {
    var getDbData = function(sql) {
        return function(req, res) {
            var start = new Date().valueOf();
            var from = req.query.from || 0;
            var isFirstRow = true;
            
            res.append("Content-Type", "application/json; charset=utf-8");
            res.write("[");
            db.each(sql.replace("%from", from), function(err, rows) {
                if (isFirstRow)
                    isFirstRow = false;
                else
                    res.write(",");
                var rowJson = JSON.stringify(rows);
                if (rowJson)
                    res.write(rowJson);
                else 
                    console.log("WARN: row strangely not stringified", rows);
            }, function(err, rowsCount) {
                var end = new Date().valueOf();
                console.log("Request (from = " + from + ") finished in " + (end - start) + " ms. Number of rows:", rowsCount);
                res.write("]");
                res.end();
            });
        };
    };

    for (var prop in sqlTmpl) {
        var path = "/" + prop;
        console.log("Serving requests at " + path);
        app.get(path, getDbData(sqlTmpl[prop]));
    }
})();


app.use(express.static(path.join(__dirname, 'static')));

app.listen(5000);
console.log("App started, listening port 5000...");
