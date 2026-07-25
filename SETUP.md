# HEYLA OS + Odoo Backend Setup

## Architecture

```
[Browser] --> [Nginx :80] --> [/api/*] --> [Odoo :8069] --> [PostgreSQL]
                 |
                 +--> [/] --> [React SPA (static)]
```

## Quick Start (Docker)

```bash
# 1. Build the frontend
cd frontend && npm install && npm run build && cd ..

# 2. Start all services
docker-compose up -d

# 3. Access the application
open http://localhost
```

## Manual Development Setup

### Prerequisites
- Python 3.10+ with Odoo 18 installed
- PostgreSQL 14+
- Node.js 18+ with Bun/npm
- Odoo 18 community edition

### 1. Set up Odoo

```bash
# Add the HEYLA addon to Odoo's addons path
export ADDONS_PATH=/path/to/heyla_os_addon:$ADDONS_PATH

# Start Odoo with the module
odoo -d heyla_os --db_host=localhost --db_user=odoo --db_password=odoo \
  --addons-path=$ADDONS_PATH --load=base,heyla_os_addon --dev=all
```

### 2. Set up the Frontend

```bash
cd frontend
npm install
cp .env.development .env.local  # Edit if needed
npm run dev
```

### 3. Configure API URL

For development, update `frontend/.env.local`:
```
VITE_API_URL=http://localhost:8069
```

## Odoo Module Structure

```
heyla_os_addon/
  __init__.py                 # Module init
  __manifest__.py             # Module manifest
  models/                     # Odoo models (35 models)
    res_user.py               # User management
    hr_employee.py            # Employees
    hr_payroll.py             # Payroll records + payslips
    hr_attendance.py          # Attendance
    hr_leave.py               # Leave management
    hr_performance.py         # Performance reviews
    hr_wiba.py                # WIBA claims
    hr_injury.py              # Injury reports
    hr_blacklist.py           # Employee blacklist
    hr_document.py            # Employee documents
    crm_lead.py               # CRM leads
    accounting_invoice.py     # Invoices
    inventory_product.py      # Products
    ehs_*.py                  # EHS (incidents, compliance, inspections, alerts)
    engineering_*.py          # Engineering (projects, contracts, claims, etc.)
    transport_*.py            # Transport (vehicles, drivers, shipments)
    fuel_entry.py             # Fuel tracking
    job_*.py                  # Jobs (postings, applicants, interviews)
    network_*.py              # Networking (posts, jobs)
  controllers/                # REST API controllers
    health.py                 # Health check
    auth.py                   # Auth (login, register, refresh, logout)
    hr.py                     # HR endpoints (employees, payroll, attendance, docs)
    crm.py                    # CRM endpoints (leads)
    accounting.py             # Invoice endpoints
    inventory.py              # Product endpoints
    ehs.py                    # EHS endpoints
    engineering.py            # Engineering endpoints
    transport.py              # Transport endpoints
    fuel.py                   # Fuel endpoints
    jobs.py                   # Jobs endpoints
    networking.py             # Networking endpoints
    admin.py                  # Admin endpoints
    upload.py                 # File upload
  security/                   # Access control
    ir.model.access.csv
  data/                       # Demo data
    demo_data.xml
```

## API Endpoints

The Odoo backend exposes all endpoints under `/api/`:

| Module | Endpoints | Methods |
|--------|-----------|---------|
| Auth | `/api/auth/*` | POST, GET, PATCH |
| HR | `/api/employees/*` | GET, POST, PATCH, DELETE |
| HR | `/api/payroll/*` | GET, POST, PATCH, DELETE |
| HR | `/api/attendance/*` | GET, POST, PATCH |
| HR | `/api/employee-documents/*` | GET, POST, DELETE |
| CRM | `/api/leads/*` | GET, POST, PATCH, DELETE |
| Accounting | `/api/invoices/*` | GET, POST, PATCH, DELETE |
| Inventory | `/api/products/*` | GET, POST, PATCH, DELETE |
| EHS | `/api/ehs-*` | GET |
| Engineering | `/api/engineering-*` | GET |
| Transport | `/api/vehicles/*`, `/api/drivers/*`, `/api/shipments/*` | GET, POST, PATCH, DELETE |
| Fuel | `/api/fuel/*` | GET, POST, PATCH, DELETE |
| Jobs | `/api/jobs/*`, `/api/applicants/*`, `/api/interviews/*` | GET, POST, PATCH, DELETE |
| Networking | `/api/network-posts/*`, `/api/network-jobs/*` | GET, POST, DELETE |
| Admin | `/api/admin/*` | GET, PATCH, POST |
| System | `/api/health`, `/api/upload` | GET, POST |

## Demo Credentials

- **Admin**: admin@heyla.com / admin
- **Manager**: jane@heyla.com / admin
