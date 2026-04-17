# HEYLA-OS Fix Login + Refresh Blockers TODO

## Plan Steps (Priority Order)

### 1. [✅] Fix CORS credentials in backend/app/__init__.py
   - Add `supports_credentials=True` to cors.init_app

### 2. [✅] Fix syntax in backend/create_superadmin.py
   - Replace `\"\"\"` with `"""`

### 3. [✅] Disable broken migrations in backend/docker-entrypoint.sh
   - Comment out `flask db upgrade || true`

### 4. [ ] Rebuild & restart backend
   - `cd backend && docker-compose down && docker-compose up --build`

### 5. [ ] Test login
   - Frontend login → Network tab: POST /api/v1/auth/login 200 + token saved

### 6. [ ] Test refresh
   - Page reload → APIs authorized with Bearer token

### 7. [ ] Verify superadmin (manual if needed)
   - `cd backend && python create_superadmin.py`

**Progress: 3/7 complete**

