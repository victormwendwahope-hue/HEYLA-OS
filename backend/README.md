# HEYLA OS — Backend

Production-ready Flask + PostgreSQL backend for HEYLA OS.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Flask 3.x |
| Database | PostgreSQL 15 |
| ORM | SQLAlchemy 2.x |
| Auth | JWT (Flask-JWT-Extended) |
| Validation | Marshmallow |
| Migrations | Flask-Migrate (Alembic) |
| Testing | pytest |
| Container | Docker + docker-compose |

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py          # App factory
│   ├── config.py            # Dev / Prod / Test configs
│   ├── extensions.py        # db, jwt, bcrypt, cors, migrate
│   ├── models/              # SQLAlchemy models (one file per domain)
│   ├── schemas/             # Marshmallow schemas
│   ├── routes/              # Flask Blueprints (one per module)
│   ├── services/            # Business logic layer
│   ├── utils/helpers.py     # Response helpers, pagination
│   └── middleware/tenant.py # Multi-tenant decorator
├── tests/                   # pytest test suite
├── seed.py                  # Full demo data seed
├── run.py                   # Entry point
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

---

## Quick Start (Local)

### 1. Clone & set up environment

```bash
git clone <repo>
cd heyla_os_backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your DB credentials
```

**.env contents:**
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost/heyla_os
JWT_SECRET_KEY=change_this_to_a_long_random_secret
FLASK_ENV=development
```

### 3. Create PostgreSQL database

```bash
psql -U postgres -c "CREATE DATABASE heyla_os;"
```

### 4. Run migrations

```bash
flask db init          # First time only — creates migrations/ folder
flask db migrate -m "initial schema"
flask db upgrade
```

### 5. Seed demo data

```bash
python seed.py
```

Output:
```
✅ Seed data created successfully!

📋 Test Credentials:
  Admin:    admin@heylademo.com    / Password123!
  Manager:  manager@heylademo.com  / Password123!
  Employee: employee@heylademo.com / Password123!

🏢 Organization: Heyla Demo Corp (slug: heyla-demo-corp)
```

### 6. Run the server

```bash
flask run
# OR
python run.py
```

Server starts at: `http://localhost:5000`

Health check: `GET http://localhost:5000/api/v1/health`

---

## Quick Start (Docker)

```bash
docker-compose up --build
```

This will:
- Start PostgreSQL
- Run migrations automatically
- Seed demo data
- Start the Flask API on port 5000

---

## Running Tests

```bash
pytest
# OR with coverage
pytest --cov=app tests/
```

---

## API Reference

All endpoints are prefixed with `/api/v1/`.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register org + admin user |
| POST | `/auth/login` | Login, returns JWT tokens |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/change-password` | Change password |
| POST | `/auth/invite` | Invite user to org (admin only) |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/` | List org users |
| GET | `/users/:id` | Get user |
| PUT | `/users/:id` | Update user |
| PUT | `/users/:id/deactivate` | Deactivate user |
| PUT | `/users/:id/roles` | Update user roles |

### HR

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/hr/employees` | List / Create employees |
| GET/PUT/DELETE | `/hr/employees/:id` | Get / Update / Delete employee |
| GET/POST | `/hr/attendance` | List / Record attendance |
| PUT | `/hr/attendance/:id` | Update attendance |
| GET/POST | `/hr/leaves` | List / Submit leave request |
| PUT | `/hr/leaves/:id/approve` | Approve leave |
| PUT | `/hr/leaves/:id/reject` | Reject leave |
| GET/POST | `/hr/reviews` | List / Create performance reviews |
| PUT | `/hr/reviews/:id` | Update review |
| GET/POST | `/hr/injuries` | List / Report injury |
| PUT | `/hr/injuries/:id` | Update injury |
| GET/POST | `/hr/documents` | List / Upload document |
| DELETE | `/hr/documents/:id` | Delete document |

### CRM

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/crm/leads` | List / Create leads |
| GET/PUT/DELETE | `/crm/leads/:id` | Get / Update / Delete lead |
| GET/POST | `/crm/deals` | List / Create deals |
| GET/PUT/DELETE | `/crm/deals/:id` | Manage deals |
| GET | `/crm/pipeline` | Pipeline grouped by stage |
| GET/POST | `/crm/activities` | List / Create activities |
| PUT | `/crm/activities/:id/complete` | Mark activity complete |

### Accounting

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/accounting/invoices` | List / Create invoices |
| GET/PUT/DELETE | `/accounting/invoices/:id` | Manage invoices |
| GET/POST | `/accounting/payments` | List / Record payments |
| GET/POST | `/accounting/expenses` | List / Submit expenses |
| PUT | `/accounting/expenses/:id` | Update expense |
| PUT | `/accounting/expenses/:id/approve` | Approve expense |
| GET/POST | `/accounting/payroll` | List / Process payroll |
| PUT | `/accounting/payroll/:id` | Update payroll |
| GET | `/accounting/summary` | Financial summary |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/inventory/products` | List / Create products |
| GET/PUT/DELETE | `/inventory/products/:id` | Manage products |
| GET/POST | `/inventory/equipment` | List / Create equipment |
| GET/PUT/DELETE | `/inventory/equipment/:id` | Manage equipment |
| GET/POST | `/inventory/maintenance` | List / Create maintenance logs |

### Transport

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/transport/vehicles` | List / Create vehicles |
| GET/PUT/DELETE | `/transport/vehicles/:id` | Manage vehicles |
| GET/POST | `/transport/drivers` | List / Create drivers |
| GET/PUT/DELETE | `/transport/drivers/:id` | Manage drivers |
| GET/POST | `/transport/trips` | List / Create trips |
| GET/PUT/DELETE | `/transport/trips/:id` | Manage trips |

### Fuel

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/fuel/logs` | List / Create fuel logs |
| GET/PUT/DELETE | `/fuel/logs/:id` | Manage fuel logs |
| GET | `/fuel/analytics` | Aggregated fuel analytics |

### Networking

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/networking/feed` | Organization feed |
| POST | `/networking/posts` | Create post |
| GET/PUT/DELETE | `/networking/posts/:id` | Manage posts |
| POST | `/networking/posts/:id/like` | Like post |
| PUT | `/networking/posts/:id/pin` | Pin/unpin post |
| GET/POST | `/networking/posts/:id/comments` | List / Add comments |
| DELETE | `/networking/comments/:id` | Delete comment |
| GET | `/networking/connections` | List connections |
| POST | `/networking/connections/request` | Send connection request |
| PUT | `/networking/connections/:id/accept` | Accept connection |
| GET/POST | `/networking/messages` | List / Send messages |
| PUT | `/networking/messages/:id/read` | Mark message as read |

### Marketplace

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/marketplace/jobs` | List / Post jobs |
| GET/PUT/DELETE | `/marketplace/jobs/:id` | Manage jobs |
| PUT | `/marketplace/jobs/:id/close` | Close job |
| GET | `/marketplace/jobs/:id/applications` | List applications |
| POST | `/marketplace/jobs/:id/apply` | Apply to job |
| PUT | `/marketplace/applications/:id/status` | Update application status |
| GET/POST | `/marketplace/jobs/:id/proposals` | List / Submit proposals |
| PUT | `/marketplace/proposals/:id/accept` | Accept proposal |
| PUT | `/marketplace/proposals/:id/reject` | Reject proposal |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/settings/organization` | Get / Update organization |
| GET/PUT | `/settings/organization/profile` | Get / Update org profile |
| GET/PUT | `/settings/user` | Get / Update user settings |
| GET | `/settings/countries` | List all countries |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/summary` | Full org summary |
| GET | `/dashboard/hr` | HR stats |
| GET | `/dashboard/accounting` | Accounting stats |
| GET | `/dashboard/crm` | CRM stats |
| GET | `/dashboard/transport` | Transport stats |

### AI Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/` | Send message, get AI response |
| GET | `/chat/history` | Chat history (placeholder) |

---

## Multi-Tenancy

Every API endpoint is scoped to the authenticated user's `organization_id`.

- All queries filter by `organization_id`
- The `@tenant_required` decorator extracts org from JWT and injects it
- Users from Org A cannot access Org B data

---

## RBAC (Roles)

| Role | Capabilities |
|------|-------------|
| `admin` | Full access, invite users, manage org |
| `manager` | Read/write most resources |
| `employee` | Read access + own records |

---

## Response Format

All endpoints return consistent JSON:

```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { "email": ["Not a valid email address."] }
}
```

---

## Pagination & Filtering

All list endpoints support:

```
GET /api/v1/hr/employees?page=1&per_page=20&q=john&department=Engineering&status=active
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET_KEY` | — | Secret for signing JWTs |
| `JWT_ACCESS_TOKEN_EXPIRES` | `3600` | Access token TTL (seconds) |
| `JWT_REFRESH_TOKEN_EXPIRES` | `2592000` | Refresh token TTL (seconds) |
| `FLASK_ENV` | `development` | `development` / `production` / `testing` |

---

## Database Models

| Module | Tables |
|--------|--------|
| Core | `organizations`, `users`, `roles`, `user_roles`, `countries` |
| HR | `employees`, `attendance`, `leaves`, `performance_reviews`, `injuries`, `documents` |
| Accounting | `invoices`, `payments`, `expenses`, `payrolls` |
| CRM | `leads`, `deals`, `activities` |
| Inventory | `products`, `equipment`, `maintenance_logs` |
| Transport | `vehicles`, `drivers`, `trips` |
| Fuel | `fuel_logs` |
| Networking | `posts`, `comments`, `connections`, `messages` |
| Marketplace | `jobs`, `applications`, `proposals` |
| Settings | `organization_profiles`, `user_settings` |

---

## Production Deployment

```bash
# Set production env
export FLASK_ENV=production
export DATABASE_URL=postgresql://user:pass@prod-host/heyla_os
export JWT_SECRET_KEY=very_long_random_secret_at_least_32_chars

# Run migrations
flask db upgrade

# Start with gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 run:app
```
