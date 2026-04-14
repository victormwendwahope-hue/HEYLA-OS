#!/bin/bash
set -e

PORT=${PORT:-5000}
cd /app/backend

# Optional migrations (if first deploy)
flask db stamp head || true
flask db upgrade || true

# Create superadmin
python create_superadmin.py || true

echo "Starting server on port $PORT..."
exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 120 --preload run:app
