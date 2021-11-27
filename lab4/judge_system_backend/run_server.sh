#!/bin/sh

if [ ! -d "venv" ] 
then
    echo "No venv directory"
    echo "Run configure project first!"
    exit
fi

source venv/bin/activate
python3 manage.py runserver localhost:2222
