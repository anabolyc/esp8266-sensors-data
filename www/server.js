var sqlite3 = require('sqlite3').verbose();
var path    = require('path');
var db      = new sqlite3.Database('../data/data.db');
var express = require('express');
var app     = express();

var sqlTmpl = "select cast(frame * 60 as INT) as date, temp, humi, cdio" +
              " from (" +
              "     select frame, avg(temp) as temp, avg(humi) as humi, avg(cdio) as cdio" +
              "     from (" +
              "         select round(strftime('%s', date) / 60.0) as frame, * " +
              "         from sensors_data" +
              "     ) x" +
              "     group by frame" +
              " ) x";

app.get('/data', function(req, res) {
    var startDate = req.query.from;
    var sql = sqlTmpl + (startDate ? (" WHERE date > " + startDate) : "") + " ORDER BY date";
    db.all(sql, function(err, rows) {
        res.json(rows);
    });
});


app.use(express.static(path.join(__dirname, 'static')));

app.listen(5000);
console.log("App started, listening port 5000...");
