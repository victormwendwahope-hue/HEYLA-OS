# HEYLA OS Complete Render.com Deployment Guide

## Overview
Deploy frontend, backend, PostgreSQL on Render.com. Creates superadmin automatically.

**Final URLs example:**
- Frontend: https://heyla-os.onrender.com
- Backend: https://heyla-os-backend.onrender.com
- Superadmin: heyla@gmail.com / Heyla@123

## 1. PostgreSQL Database (Render)
1. Dashboard → New → PostgreSQL
2. Name: `heyla-os-db`
3. Plan: Free/Starter
4. **Copy DATABASE_URL** from Info → Connect → Internal DB URL

## 2. Backend API (Web Service)
1. Dashboard → New → Web Service
2. Connect GitHub repo (`HEYLA-OS`)
3. **Root Directory:** `backend`
4. Runtime: **Docker**
5. Port: `5000`
6. **Environment Variables:**
   ```
   DATABASE_URL=postgres://... (paste from Postgres above)
   JWT_SECRET_KEY=openssl rand -base64 32 | generate one!
   FLASK_ENV=production
   ```
7. Deploy → **Connect Postgres service** (Private Networking)

# No auto-migrations (disabled in docker-entrypoint.sh for clean deploys)

## 3. Create Superadmin (Post-Deploy)
**Render Shell** (Backend service → Shell):
```bash
cd /app
FLASK_APP=run.py flask shell < create_superadmin.py
```
**Output example:**
```
🔍 Checking existing superadmin/org...
✅ Heyla OS org exists: ID=1
✅ Admin role created
🎉 SUPERADMIN CREATED SUCCESSFULLY!
  Email:    heyla@gmail.com
  Password: Heyla@123
  Org:      Heyla OS (heyla-os)
```
**Note:** Script is idempotent - safe to re-run.

## 4. Frontend (Static Site)
1. Dashboard → New → Static Site
2. Connect same GitHub repo
3. **Root Directory:** `frontend`
4. Build: `bun install && bun build` (or `npm run build`)
5. Publish: `dist`

   ```
   VITE_API_URL=https


  -H 'Content-Type: application/json' \\
  -d '{"email":"heyla@gmail.com","password":"Heyla@123"}'
```

**Frontend:** Visit https://heyla-os.onrender.com → Login

## Environment Files Created
- `backend/.env.render.example`
- `frontend/.env.example`
- `backend/create_superadmin.py`

## Troubleshooting
| Issue | Solution |
|-------|----------|
| CORS error | Check `VITE_API_URL` matches backend |
| DB connection | Verify `DATABASE_URL` & Private Network |
| 500 errors | Render Shell: `flask db upgrade` |
| No superadmin | Run `create_superadmin.py` |

## Scale Up
- Postgres: Upgrade plan
- Backend: Add more instances
- CDN: Render static auto-CDN

**Complete!** 🚀
