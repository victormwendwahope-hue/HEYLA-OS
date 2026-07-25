#!/bin/bash
set -e

echo "=== HEYLA OS + Odoo Backend Installation ==="
echo ""

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required. Install Docker Desktop first."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required."; exit 1; }

echo "[1/4] Building frontend..."
cd frontend
npm install --silent
npm run build
cd ..

echo "[2/4] Starting Odoo + PostgreSQL + Nginx..."
docker-compose up -d

echo "[3/4] Waiting for Odoo to start..."
sleep 10

echo "[4/4] Installing HEYLA OS module..."
docker exec heyla_odoo odoo -d heyla_os \
  --db_host=db --db_user=odoo --db_password=odoo \
  --http-port=8069 \
  --load=base,heyla_os_addon \
  --init=heyla_os_addon \
  --stop-after-init

echo ""
echo "=== Installation Complete ==="
echo "Frontend:  http://localhost"
echo "Odoo Backend: http://localhost:8069"
echo "API:       http://localhost/api"
echo ""
echo "Demo Login:  admin@heyla.com / admin"
echo ""
