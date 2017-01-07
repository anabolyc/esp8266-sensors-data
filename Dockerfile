FROM armhf/node:6.9.1-slim

# required packages
RUN apt-get update 
RUN apt-get install sqlite3 jq curl -y
RUN apt-get install python build-essential -y

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

# cleanup
RUN apt-get purge python build-essential -y
RUN apt-get autoremove -y
RUN rm -rf /var/lib/apt/lists/*

EXPOSE 5000
CMD start.sh

# sudo ln -s "$(which nodejs)" /usr/bin/node
