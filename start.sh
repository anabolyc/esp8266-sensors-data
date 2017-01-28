#!/bin/bash

if [ ! -f /data/data.db ]; then sqlite3 /data/data.db < /var/db.sql; fi;

# update data
while true; do request_data -d /data/data.db -u http://192.168.1.90:8080/data; sleep 10; done &

# clean data older than 2 days
while true; do clean_data -d /data/data.db -r '-2 days'; sleep 3600; done &

npm start

