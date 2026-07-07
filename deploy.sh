#!/usr/bin/env bash
#
# Deploy the latest `main` to this server (the netcup VPS).
# Run on the server — manually (`/var/www/asta/deploy.sh`) or automatically
# by the GitHub Actions "deploy" job after CI passes.
#
# It pulls the newest code, rebuilds backend + frontend, applies any new DB
# migration, and restarts the backend service.

set -euo pipefail

cd /var/www/asta

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Building backend"
cd server
npm install
npx prisma migrate deploy
npx prisma generate
npm run build

echo "==> Building frontend"
cd ../client
npm install
npm run build

echo "==> Fixing ownership + restarting backend"
chown -R www-data:www-data /var/www/asta
systemctl restart asta

echo "==> Deploy complete."
