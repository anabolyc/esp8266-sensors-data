var sqlite3 = require('sqlite3').verbose();
var path    = require('path');
var db      = new sqlite3.Database('../data/data.db');
var express = require('express');
var app     = express();

var sqlTmpl = { dataavg: 
                "SELECT CAST(frame * 60 AS INT) AS date, temp, humi, cdio " +
                "FROM ( " +
                "     SELECT frame, avg(temp) as temp, avg(humi) as humi, avg(cdio) as cdio " +
                "     FROM (" +
                "         SELECT round(strftime('%s', date) / 60.0) as frame, * " +
                "         FROM sensors_data" +
                "     ) x" +
                "     GROUP BY frame " +
                ") x " +
                "WHERE date > %from " + 
                "ORDER BY date",
                data: 
                "SELECT CAST(strftime('%s', date) AS INT) AS date, NULLIF(temp, 0) AS temp, NULLIF(humi, 0) AS humi, NULLIF(cdio, 0) AS cdio " +
                "FROM sensors_data " +
                "WHERE CAST(strftime('%s', date) AS INT) > %from " + 
                "ORDER BY date"};
(function() {
    var getDbData = function(sql) {
        return function(req, res) {
            var from = req.query.from || 0;
            db.all(sql.replace("%from", from), function(err, rows) {
                res.json(rows);
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
