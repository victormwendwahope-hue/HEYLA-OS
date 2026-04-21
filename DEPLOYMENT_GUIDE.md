# HEYLA-OS Render Deployment Guide

## Backend (Web Service)
1. Git push → Auto-deploy.
2. Env vars:
   - `DATABASE_URL`: Render Postgres connection string.
   - `FLASK_ENV=production`
   - `SECRET_KEY`: Generate with `openssl rand -hex 32`
3. Build command: Default.
4. Start command: `./docker-entrypoint.sh`

## Frontend (Static Site)
1. Git push → Auto-deploy.
2. **Critical Env Var**:
   ```
   VITE_API_URL=https://heyla-os-backend.onrender.com/api/v1
   ```
3. Build settings:
   - Build Command: `npm run build`
   - Output Dir: `dist`
4. vercel.json handles SPA routing.

## Database
1. Render Postgres > Connect > Internal DB.
2. Copy `DATABASE_URL` to Backend env.

## Fix 405 Login Error
- Frontend env `VITE_API_URL` **must** include `/api/v1`.
- Test: Open DevTools Network tab, login → URL should be `/api/v1/auth/login`.

## Local Dev
```
cd backend && make dev  # Backend + DB
cd frontend && npm run dev  # Frontend proxy /api → backend
```

## Production Test
curl -X POST https://heyla-os-backend.onrender.com/api/v1/auth/login \\
-H 'Content-Type: application/json' \\
-d '{\"email\":\"admin@test.com\",\"password\":\"admin123\"}'

