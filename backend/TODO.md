# HEYLA-OS Docker PORT Fix - TODO

## Plan Steps:
- [x] Create backend/docker-entrypoint.sh with robust PORT expansion
- [x] Update backend/Dockerfile: COPY entrypoint, chmod +x, set ENTRYPOINT, update EXPOSE
- [ ] Test locally: cd backend && docker compose up --build (optional - compose schema strict)
- [ ] Test PORT env: export PORT=10000 && docker compose up (optional)
- [x] Verify gunicorn in requirements.txt
- [x] Commit/push and redeploy to Render
- [ ] Confirm deployment success
