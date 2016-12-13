# Version: 0.0.1
FROM ubuntu:16.04
MAINTAINER lk "tiny.lk@gmail.com"
ENV REFRESHED_AT 2016-12-12
COPY resolv.conf /etc/resolv.conf
COPY sources.list /etc/apt/sources.list
RUN apt-get -qq update \
    && apt-get install --no-install-recommends --no-install-suggests -y \
                    net-tools \
                    iputils-ping \
                    nginx

RUN echo 'Hi, I am in your container' >/var/www/html/index.html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

# docker build -t "tinylk/static_web:0.0.1" .
