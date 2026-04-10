# HEYLA-OS Frontend-Backend Connection TODO

## Plan Steps (Approved)

1. ✅ Create TODO.md - Track progress.

2. ✅ Backend/DB Setup Verification**:
   - Docker not available. User to run `cd backend && pip install -r requirements.txt && flask db upgrade && python seed.py && python run.py` for local backend+DB setup.
   - Healthcheck: curl http://localhost:5000/api/v1/health

3. **Update Backend CORS**: Edit app/config.py to add localhost:8080.

4. **Frontend Setup**:
   - Create .env with VITE_API_URL.
   - Update vite.config.ts with API proxy.
   - Create src/lib/api.ts (axios instance w/ auth).

5. **Auth Integration**: Edit src/store/authStore.ts - add login/register API calls using api.ts.

6. **HR Example Integration**: 
   - Edit src/store/employeeStore.ts - useQuery/mutations for /hr/employees.
   - Update src/pages/hr/* pages to use store.

7. **Test Connections**:
   - Run backend+frontend.
   - Test health, login, fetch employees.

8. **Expand to Other Modules**: CRM, Inventory etc. (pattern from HR).

9. **Final Verification**: Full flow works, attempt_completion.

Updated after each step.

