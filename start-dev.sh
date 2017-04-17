#!/bin/bash

while true 
do 
	./data/request_data -d ./data/data.db -u http://192.168.1.94:8080/data && sleep 10
done &

cd www

forever ./server.js
