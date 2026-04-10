# Backend CORS Fix - TODO

## Plan Steps:
- [x] Update app/__init__.py: CORS resources r"/api/*" → r"/*" to match /api/v1/* blueprints
- [ ] Redeploy backend to Render
- [ ] Test /auth/register from frontend
- [ ] Confirm no more CORS errors
