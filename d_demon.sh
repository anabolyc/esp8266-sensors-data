docker run -d -p 8080:5000 andreymalyshenko/esp8266-sensors-data

#/bin/bash -c "while true; do request_data -d /data/data.db -u http://192.168.1.90:8080/data; sleep 10; done"
