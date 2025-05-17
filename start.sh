#!/bin/sh
flask db upgrade
exec gunicorn --bind 0.0.0.0:5000 --timeout 120 run:app