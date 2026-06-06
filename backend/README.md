# HEYLA OS — Standalone Node/Express Backend

A self-contained backend for the HEYLA OS frontend. No external services required.

- **Runtime:** Node.js 18+
- **Framework:** Express 4
- **Auth:** JWT (HS256) + bcrypt password hashing
- **Persistence:** JSON files under `./data/` (one file per collection, atomic writes)
- **File uploads:** Multer → `./data/uploads/`
- **No database server, no cloud, no external API calls.**

> Lovable's web preview cannot host Node servers, so this backend runs **outside** the
> preview — on your own machine, a VPS, Render, Railway, Fly, etc. Point the frontend
> at it via `VITE_API_URL`.

## Quick start

```bash
cd backend
cp .env.example .env          # then edit JWT_SECRET
npm install
npm run seed                  # creates the default admin
npm start                     # http://localhost:4000
```

Then in the **project root**:

```bash
echo "VITE_API_URL=http://localhost:4000/api" > .env.local
```

Restart the Vite dev server and log in with the seeded admin:

- **Email:** `hydancheru@gmail.com`
- **Password:** `DanHacks@Admin`

If the backend is unreachable, the frontend falls back to its built-in mock auth
so the preview keeps working.

## Project structure

```
backend/
  src/
    server.js          # Express app + route mounting
    db.js              # JSON-file store with atomic writes
    auth.js            # JWT issue/verify + middleware
    seed.js            # Idempotent admin seed
    routes/
      auth.js          # /auth/register, /auth/login, /auth/me
      crud.js          # Generic CRUD factory used by most modules
      jobs.js          # /jobs + /applications + match scoring
      careers.js       # /careers/profile, /careers/match
      chat.js          # /chat/threads, /chat/messages (HEYLEY Bot)
      upload.js        # /upload  (multipart files)
  data/                # JSON files + uploads (created on first run, gitignored)
  .env.example
  package.json
```

## API surface

All routes are prefixed with `/api`. All non-auth routes require
`Authorization: Bearer <jwt>`.

### Auth

| Method | Path                | Body                                           |
| ------ | ------------------- | ---------------------------------------------- |
| POST   | `/api/auth/register`| `{ email, password, name, company, accountType }` |
| POST   | `/api/auth/login`   | `{ email, password }`                          |
| GET    | `/api/auth/me`      | —                                              |
| POST   | `/api/auth/logout`  | — (client-side token discard; server stateless)|

### Generic CRUD modules (`/api/<resource>`)

All support `GET / GET /:id / POST / PATCH /:id / DELETE /:id`:

- `employees`, `attendance`, `leave`, `performance`, `wiba`, `injuries`,
  `blacklist`, `documents`
- `leads`, `customers`, `tickets`
- `invoices`, `expenses`, `payments`, `payroll`
- `products` (inventory)
- `vehicles`, `fuel`, `trips`
- `ehs-incidents`, `ehs-inspections`, `ehs-compliance`
- `engineering-projects`, `engineering-contracts`, `engineering-claims`,
  `engineering-variations`, `engineering-payments`, `engineering-disputes`,
  `engineering-warnings`
- `network-posts`, `network-connections`, `marketplace-listings`,
  `marketplace-orders`
- `notifications`, `announcements`

Every record gets `id`, `createdAt`, `updatedAt`, `ownerId` automatically.
Owners see their own rows; users with role `admin` see everything.

### Jobs & careers

| Method | Path                              | Notes |
| ------ | --------------------------------- | ----- |
| GET    | `/api/jobs`                       | Public listing (no auth) |
| POST   | `/api/jobs`                       | Company creates a job |
| POST   | `/api/jobs/:id/applications`      | Apply to a job |
| GET    | `/api/jobs/:id/applications`      | Company sees applicants |
| PATCH  | `/api/applications/:id`           | Update status (`Reviewing`, `Interview`, `Offer`, `Rejected`) |
| GET    | `/api/careers/profile`            | Job-seeker profile |
| PUT    | `/api/careers/profile`            | Update skills, qualifications, etc. |
| GET    | `/api/careers/match`              | Returns jobs ranked by skill overlap |

### Chat (HEYLEY Bot + person-to-person)

| Method | Path                              |
| ------ | --------------------------------- |
| GET    | `/api/chat/threads`               |
| POST   | `/api/chat/threads`               |
| GET    | `/api/chat/threads/:id/messages`  |
| POST   | `/api/chat/threads/:id/messages`  |

### Uploads

`POST /api/upload` (multipart, field `file`) → `{ url, filename, size, mime }`.
Files are served from `/uploads/<filename>`.

## Wiring the frontend

A tiny `src/lib/api.ts` axios-style fetch wrapper is included in the frontend.
Each Zustand store has a clearly marked spot (`// TODO: api.<module>`) where you
swap the mock array for an API call. The auth flow is already wired end-to-end.

## Security notes

- Passwords hashed with bcrypt (10 rounds).
- JWTs signed with `JWT_SECRET` — **set this to a long random string in production.**
- CORS restricted by `CORS_ORIGIN` (comma-separated list).
- All inputs validated with `zod`.
- Role-based access via `requireRole('admin')` middleware.
- No SQL — JSON-file store eliminates SQL-injection surface; race-safe via
  per-file write queue.
