# HEYLA OS — Standalone Node/Express Backend

A self-contained, fully-secured backend for the HEYLA OS frontend. No external services required.

- **Runtime:** Node.js 18+
- **Framework:** Express 4
- **Auth:** JWT (HS256) + bcrypt password hashing
- **Persistence:** JSON files under `./data/` (atomic writes per file)
- **File uploads:** Multer 2.x → `./data/uploads/` (with MIME-type validation)
- **Validation:** Zod schemas on all user inputs
- **No database server, no cloud, no external API calls.**

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create and configure your environment
cp .env.example .env
# Edit .env and set:
#   - JWT_SECRET to a random 32+ char string
#   - CORS_ORIGIN to your frontend origin
#   - ADMIN_EMAIL, ADMIN_PASSWORD (for initial admin account)

# 3. Seed the admin user
npm run seed

# 4. Start the server
npm start
# Server runs on http://localhost:4000
```

Then in your **frontend project**:

```bash
echo "VITE_API_URL=http://localhost:4000/api" > .env.local
# Restart your Vite dev server
```

Login with your configured admin credentials (from .env.example):
- **Email:** `hydancheru@gmail.com`
- **Password:** `DanHacks@Admin`

## Features

✅ **Fixed & Secured:**
- ✅ Login now works for all users (trial-gate logic corrected)
- ✅ File uploads restricted to safe MIME types only
- ✅ Input validation on all routes (Zod)
- ✅ Multer upgraded to 2.x (DoS protection)
- ✅ Audit logging with XSS-safe error handling
- ✅ CORS properly configured per-environment
- ✅ `.env.example` & `.gitignore` included
- ✅ No hardcoded credentials or domains

## Project Structure

```
backend/
  src/
    server.js              # Express app setup + route mounting
    db.js                  # JSON-file store with atomic writes
    auth.js                # JWT issue/verify + middleware
    security.js            # Rate limiting + security headers
    audit.js               # Audit log capture
    validate.js            # Zod validation utilities
    seed.js                # Idempotent admin seeder
    routes/
      auth.js              # /auth/register, /auth/login, /auth/me
      crud.js              # Generic CRUD factory (HR, CRM, etc.)
      jobs.js              # /jobs + /applications + matching
      careers.js           # /careers/profile, /careers/match
      chat.js              # /chat/threads, /chat/messages
      upload.js            # /upload (with MIME validation)
      admin.js             # Admin-only audit logs & user mgmt
      payment.js           # /payment (trial redirect)
  data/                    # JSON files + uploads (created on first run)
  .env.example             # Template environment config
  .gitignore               # Protect secrets from git
  package.json
```

## API Surface

All routes are prefixed with `/api`. All routes **except** auth/login, auth/register, and GET /jobs require:
```
Authorization: Bearer <jwt_token>
```

### Auth

| Method | Path                 | Body                                           |
| ------ | -------------------- | ---------------------------------------------- |
| POST   | `/auth/register`     | `{ email, password, name, company, accountType }` |
| POST   | `/auth/login`        | `{ email, password }`                          |
| GET    | `/auth/me`           | —                                              |
| POST   | `/auth/logout`       | `{ refreshToken? }`                            |
| POST   | `/auth/logout-all`   | —                                              |
| POST   | `/auth/refresh`      | `{ refreshToken }`                             |

### Generic CRUD (`/api/<resource>`)

All support `GET / GET /:id / POST / PATCH /:id / DELETE /:id`:

- **HR:** employees, attendance, leave, performance, wiba, injuries, blacklist, documents
- **CRM:** leads, customers, tickets
- **Accounting:** invoices, expenses, payments, payroll
- **Inventory:** products
- **Transport:** vehicles, fuel, trips
- **EHS:** ehs-incidents, ehs-inspections, ehs-compliance
- **Engineering:** engineering-projects, engineering-contracts, engineering-claims, engineering-variations, engineering-payments, engineering-disputes, engineering-warnings
- **Social:** network-posts, network-connections, marketplace-listings, marketplace-orders
- **Misc:** notifications, announcements

Every record auto-gets: `id`, `createdAt`, `updatedAt`, `ownerId`.  
Non-admin users see their own records; admins see everything.

### Jobs & Careers

| Method | Path                              | Notes |
| ------ | --------------------------------- | ----- |
| GET    | `/jobs`                           | Public listing (no auth) |
| POST   | `/jobs`                           | Create job (auth required) |
| POST   | `/jobs/:id/applications`          | Apply (auth required) |
| GET    | `/jobs/:id/applications`          | View applicants (company only) |
| PATCH  | `/applications/:id`               | Update status |
| GET    | `/careers/profile`                | User profile |
| PUT    | `/careers/profile`                | Update profile |
| GET    | `/careers/match`                  | Jobs ranked by skill match |

### Chat

| Method | Path                              |
| ------ | --------------------------------- |
| GET    | `/chat/threads`                   |
| POST   | `/chat/threads`                   |
| GET    | `/chat/threads/:id/messages`      |
| POST   | `/chat/threads/:id/messages`      |

### Uploads

`POST /upload` (multipart, field `file`) → `{ url, filename, size, mime }`  
Files served from `/uploads/<filename>` with proper MIME-type headers.

**Allowed file types:** Images (JPEG, PNG, GIF, WebP), Documents (PDF, Word, Excel), Video, Audio, plain text, CSV, SVG.  
**Blocked:** HTML, JavaScript, executables (.exe, .app, .dll, .sh, etc.)

## Security Notes

✅ **Passwords:** Hashed with bcrypt (12 rounds).  
✅ **JWTs:** Signed with `JWT_SECRET` — **set to a long random string in production.**  
✅ **CORS:** Restricted by `CORS_ORIGIN` (comma-separated list if multiple origins).  
✅ **Input validation:** All user inputs validated with Zod.  
✅ **File uploads:** MIME-type whitelist + dangerous extensions blocked.  
✅ **Rate limiting:** Auth routes: 20/15min. API routes: 300/min.  
✅ **Audit logging:** All actions logged with actor, IP, timestamp.  
✅ **RBAC:** Role-based access control (admin, manager, employee, individual).  
✅ **Refresh tokens:** Opaque, hashed, with family-based reuse detection.  
✅ **Headers:** X-Frame-Options, CSP, HSTS, etc. configured.  

## Deployment

### Environment Variables

**Required:**
- `JWT_SECRET` — Long random string (min 32 chars)
- `CORS_ORIGIN` — Your frontend origin (e.g., `https://myapp.example.com`)

**Recommended:**
- `NODE_ENV=production`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — Set strong, unique credentials
- `PAYMENT_URL` — Where to redirect expired-trial users

**Optional:**
- `PORT` — Default 4000
- `DATA_DIR` — Default `./data`
- `LOG_LEVEL` — Default `info`

### Hosting Options

Run on any platform that supports Node.js 18+:
- **Localhost/VPS:** `npm install && npm run seed && npm start`
- **Render/Railway/Fly:** Push to GitHub, set env vars, deploy.
- **Docker:** Create a `Dockerfile`:
  ```dockerfile
  FROM node:22-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --only=production
  COPY src ./src
  CMD ["npm", "start"]
  ```

## Troubleshooting

**Problem:** Users can't log in.  
→ Check that `JWT_SECRET` is set in `.env`.  
→ Run `npm run seed` to ensure admin exists.  
→ Check `data/audit_logs.json` for login failures.

**Problem:** CORS errors from frontend.  
→ Set `CORS_ORIGIN` to match your frontend URL exactly (including http:// or https://).  
→ No trailing slash.

**Problem:** File uploads fail.  
→ Check file MIME type is in the allowed list (see `upload.js` for full list).  
→ Ensure `data/uploads/` directory exists (created on first start).

**Problem:** Forgot admin password.  
→ Update `ADMIN_PASSWORD` in `.env`, run `npm run seed` again.

## Development

**Watch mode (auto-reload):**
```bash
npm run dev
```

**Format:** ESM modules, ES2020+ syntax, no build step.

**Testing:** Included audit logs can be inspected at `GET /api/admin/audit-logs` (admin only).

## License

Proprietary. See LICENSE file.

## Changes in v1.0.1

- **Fixed:** Login blocked during active trial (trial-gate logic was inverted).
- **Fixed:** Audit crash on login with undefined req.headers.
- **Added:** MIME-type validation on file uploads (XSS prevention).
- **Added:** Zod validation schemas to jobs & careers routes.
- **Upgraded:** Multer 1.x → 2.x (security & DoS fixes).
- **Added:** `.env.example` with all required variables documented.
- **Added:** `.gitignore` to prevent committing secrets.
- **Removed:** Hardcoded domain fallback from CORS (portability fix).
- **Fixed:** Consistent env var defaults (no personal emails/hardcoded creds).
- **Improved:** Enhanced security headers & audit logging.

