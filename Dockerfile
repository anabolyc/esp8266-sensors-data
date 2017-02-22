FROM armhf/node:6.9.1-slim

# required packages
RUN apt-get update 
RUN apt-get install sqlite3 jq curl -y
RUN apt-get install python build-essential -y

# prepare database
COPY ./data/db.sql /var/db.sql

# data script
COPY ./data/request_data /usr/sbin/request_data
COPY ./data/clean_data /usr/sbin/clean_data
COPY ./start.sh /usr/sbin/start.sh

# www
RUN mkdir -p /www/static
COPY ./www/package.json /www/
WORKDIR /www
RUN npm install

# cleanup
RUN apt-get purge python build-essential -y
RUN apt-get autoremove -y
RUN rm -rf /var/lib/apt/lists/*

# db folder
RUN mkdir /data

# site data 
# at later step to optimize build
COPY ./www/server.js /www/
COPY ./www/static /www/static

ENV ESP_ADDR http://localhost:8080/data

EXPOSE 5000
CMD start.sh

# sudo ln -s "$(which nodejs)" /usr/bin/node
