#!/bin/bash
set -e

# Wait for DB
echo "Waiting for database..."
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  echo "DB not ready, waiting..."
  sleep 2
done

# Run migrations
echo "Running migrations..."
flask db upgrade

# Create superadmin if not exists
echo "Creating superadmin..."
python create_superadmin.py

# Start gunicorn
echo "Starting server on port ${PORT:-5000}..."
exec gunicorn --bind 0.0.0.0:${PORT:-5000
