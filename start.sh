#!/bin/bash

if [ ! -f /data/data.db ]; then sqlite3 /data/data.db < /var/db.sql; fi;

npm start &

while true; do request_data -d /data/data.db -u http://192.168.1.90:8080/data; sleep 10; done

