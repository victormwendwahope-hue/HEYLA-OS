#!/bin/bash
set -e

PORT=${PORT:-5000}

# Create tables with db.create_all() (fast init for prod)
flask run --no-debugger run:app & 
sleep 2
flask shell << 'EOF'
from run import app
with app.app_context():
    db.create_all()
EOF
pkill -f "flask run" || true

# Run superadmin creation (idempotent, safe for prod)
python create_superadmin.py || true

echo "Container ready. Running entrypoint..."

echo "✅ Superadmin check complete"
echo "Starting server on port $PORT..."

exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 120 --preload run:app
