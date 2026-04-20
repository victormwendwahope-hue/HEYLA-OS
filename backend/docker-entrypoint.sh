#!/bin/bash
set -e

# Set Flask CLI environment
export FLASK_APP=run.py
export FLASK_ENV=${FLASK_ENV:-production}

# Render port (defaults to 10000 from logs)
PORT=${PORT:-10000}

echo "🚀 Starting HEYLA-OS Backend..."
echo "📊 Environment: $FLASK_ENV"
echo "🌐 Port: $PORT"
echo "🔗 DATABASE_URL: ${DATABASE_URL:0:20}..."  # partial for security

# 1. Run Alembic migrations (creates/updates tables)
echo "🔍 Running Flask-Migrate (Alembic) upgrades..."
flask db upgrade || echo "⚠️ Migration failed - check logs"

# 2. Seed initial data (countries, demo org/users)
echo "🌱 Running seed.py..."
python seed.py || echo "⚠️ Seeding warnings (may be idempotent)"

# 3. Ensure superadmin exists (idempotent)
echo "👑 Ensuring superadmin setup..."
python create_superadmin.py || echo "⚠️ Superadmin already exists"

echo "✅ Database setup complete!"
echo "Container ready. Starting Gunicorn..."

# 4. Production Gunicorn (optimized for Render)
exec gunicorn --bind 0.0.0.0:${PORT} \
    --workers 1 \
    --threads 4 \
    --worker-class sync \
    --worker-tmp-dir /dev/shm \
    --timeout 120 \
    --preload \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    run:app
