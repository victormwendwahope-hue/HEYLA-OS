#!/bin/bash
# Runs ON the EC2 instance. Extracts the repo tarball and starts the full
# HEYLA-OS stack: Odoo backend + PostgreSQL + nginx (serves frontend + /api proxy).
# Usage: sudo bash /home/ubuntu/aws-deploy.sh /home/ubuntu/heyla-deploy.tgz
set -euo pipefail
exec > /home/ubuntu/heyla-deploy.log 2>&1

TARBALL="${1:-/home/ubuntu/heyla-deploy.tgz}"
APP_DIR=/opt/heyla-os

if ! docker info >/dev/null 2>&1; then
  echo "Docker not ready yet — aborting. Check /var/log/heyla-userdata.log"
  exit 1
fi

rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"
tar -xzf "$TARBALL" -C "$APP_DIR" --strip-components=0
cd "$APP_DIR"

echo "[1/4] Building images..."
docker compose build
docker compose up -d

echo "[2/4] Waiting for Odoo to come up..."
for i in $(seq 1 60); do
  if docker exec heyla_odoo true 2>/dev/null; then break; fi
  sleep 5
done

echo "[3/4] Initializing heyla_os database + module..."
docker exec -u odoo heyla_odoo odoo -d heyla_os \
  --db_host=db --db_user=odoo --db_password=odoo \
  --http-port=8069 \
  --load=base,heyla_os_addon \
  --init=heyla_os_addon \
  --stop-after-init \
  || echo "NOTE: init exit code $? — module may already be loaded in a persisted volume."

echo "[4/4] Restarting services..."
docker compose restart odoo nginx

echo "=== Deploy complete ==="
docker compose ps