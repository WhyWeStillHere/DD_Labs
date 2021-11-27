FROM ubuntu:18.04

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DEBUG 0

RUN apt update && apt-get -y upgrade
RUN apt -y install vim openssh-server python3.8
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.8 1
RUN apt -y install python3-pip python3.8-venv && python3 -m pip install pip
RUN apt -y install netcat-openbsd gcc 
RUN apt-get -y install build-essential python3-dev python3-pip python3-setuptools python3-wheel python3-cffi libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info


# Backend settup
WORKDIR /judge_system_backend

COPY . .
RUN python3 -m pip install -U pip
RUN pip install paramiko cffi
RUN pip install -r requirements.txt

USER root
RUN useradd -ms /bin/bash simpleUser
RUN chown -R simpleUser:simpleUser /judge_system_backend

USER simpleUser

CMD gunicorn judge_system_backend.wsgi:application --bind 0.0.0.0:$PORT
