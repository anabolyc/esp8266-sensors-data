var sqlite3 = require('sqlite3').verbose();
var path    = require('path');
var db      = new sqlite3.Database('../data/data.db');
var express = require('express');
var app     = express();

app.get('/data', function(req, res) {
    var startDate = req.query.from;
    // console.log(startDate);
    var sql = "SELECT CAST(strftime('%s', date) as INT) as date, temp, humi, cdio" 
	+ " FROM sensors_data " 
	+ (startDate ? (" WHERE CAST(strftime('%s', date) AS INT) > " + startDate) : "")
	+ " ORDER BY date";
    // console.log(sql);
    db.all(sql, function(err, rows) {
        res.json(rows);
    });
});


app.use(express.static(path.join(__dirname, 'static')));

app.listen(5000);
console.log("App started, listening port 5000...");
