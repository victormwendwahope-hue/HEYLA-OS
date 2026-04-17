#!/bin/bash
set -e

PORT=${PORT:-5000}

# Optional migrations disabled (no migrations folder)
# flask db stamp head || true
# flask db upgrade || true

# Run superadmin creation (idempotent, safe for prod)
python create_superadmin.py || true

echo "Container ready. Running entrypoint..."

echo "✅ Superadmin check complete"
echo "Starting server on port $PORT..."

exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 120 --preload run:app
