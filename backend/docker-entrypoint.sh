#!/bin/sh
set -e

# Robust PORT handling for Render/Docker
PORT=${PORT:-5000}
exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 120 run:app
