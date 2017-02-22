#!/bin/bash

if [ ! -f /data/data.db ]
then
	echo "Database file not found at /data/data.db, trying to create one"
	sqlite3 /data/data.db < /var/db.sql
fi

# update data
echo "Starting data update every 10 seconds"
while true
do
	timeout -sHUP 1m request_data -d /data/data.db -u ${ESP_ADDR}
	sleep 10
done &

# clean data older than 2 days
echo "Starting data clean every 1 hour"
while true
do
	clean_data -d /data/data.db -r '-2 days' &
	sleep 3600
done &

npm start

