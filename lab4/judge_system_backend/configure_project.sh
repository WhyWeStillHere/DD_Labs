#!/bin/sh

if [ ! -d "venv" ] 
then
    echo "No venv directory"
    echo "Creating virtual environment"
    python3 -m venv venv
fi

echo "Installing requirements to venv"
source venv/bin/activate
pip install -r requirements.txt
rm **/migrations/0*.py
python3 manage.py makemigrations
python3 manage.py migrate
