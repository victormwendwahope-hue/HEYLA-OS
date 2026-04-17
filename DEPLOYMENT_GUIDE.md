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

## 3. Superadmin (Auto-Created)
✅ **Now AUTO-RUNS** on every backend deploy via `docker-entrypoint.sh`!

**Credentials:**
```
Email: heyla@gmail.com
Password: Heyla@123
Org: Heyla OS
```

**Verify:** Check Render Logs → "🎉 SUPERADMIN CREATED SUCCESSFULLY!"

## 4. Frontend (Static Site)
1. Dashboard → New → Static Site
2. Connect same GitHub repo
3. **Root Directory:** `frontend`
4. Build: `bun install && bun build` (or `npm run build`)
5. Publish: `dist`

   ```
VITE_API_URL=https://heyla-os-backend.onrender.com/api/v1


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
| 404 `/auth/login` | Frontend missing `/api/v1` → Check `.env` VITE_API_URL |
| 401 Invalid credentials | Use superadmin: heyla@gmail.com / Heyla@123 |
| CORS error | Origins include `*.onrender.com` ✅ |
| DB connection | Verify DATABASE_URL & Private Network |
| No logs | Check new LOGIN HIT logs |
| 500 Login crash | Render logs show exact error now

**Test Login:**
```bash
curl -X POST https://heyla-os-backend.onrender.com/api/v1/auth/login \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"heyla@gmail.com","password":"Heyla@123"}'
```
Expected: `{"data":{"access_token":"eyJ...",...},"message":"Login successful"}


## Scale Up
- Postgres: Upgrade plan
- Backend: Add more instances
- CDN: Render static auto-CDN

**Complete!** 🚀
