# HEYLA-OS Auth/Login Fix TODO

## Step 1: Update frontend api.ts (add prod fallback baseURL) ✅
## Step 2: No update needed - docker-entrypoint.sh already uses gunicorn run:app correctly ✅\n## Step 3: docker-entrypoint.sh confirmed good ✅
## Step 4: Set frontend deploy env var VITE_API_URL=https://heyla-os-backend.onrender.com/api/v1 [MANUAL]
## Step 5: Test curl https://heyla-os-backend.onrender.com/api/v1/auth/login [MANUAL]
## Step 6: Redeploy frontend & backend [MANUAL]
## Step 7: Verify browser Network tab shows correct /api/v1/auth/login call [MANUAL]
