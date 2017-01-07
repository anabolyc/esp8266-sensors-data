FROM resin/rpi-raspbian:jessie

# required packages
RUN apt-get update && apt-get DEBIAN_FRONTEND=noninteractive install sqlite3 jq curl -y && rm -rf /var/lib/apt/lists/*

# prepare database
COPY ./data/db.sql /data/db.sql
RUN sqlite3 /data/data.db < /data/db.sql
RUN rm /data/db.sql

# data script
COPY ./data/request_data /usr/sbin/request_data
COPY ./start.sh /usr/sbin/start.sh

# www
RUN mkdir -p /www/static
COPY ./www/server.js /www/
COPY ./www/package.json /www/
COPY ./www/static /www/static

WORKDIR /www
RUN npm install

EXPOSE 5000
CMD start.sh

