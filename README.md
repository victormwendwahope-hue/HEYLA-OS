# 🚀 HEYLA OS - Modern Full-Stack Business ERP Dashboard

[![GitHub](https://img.shields.io/badge/GitHub-Repo-black?logo=github)](https://github.com/victormwendwahope-hue/HEYLA-OS)
[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://heyla-os.onrender.com)

**HEYLA OS** is a production-ready full-stack ERP/CRM dashboard for SMEs worldwide (Africa focus: Kenya, Nigeria, Ghana...). **Frontend**: React 18 TS SPA with shadcn/ui – HR (full CRUD/attendance/payroll), CRM, Accounting, Inventory, Transport/Fuel, Networking, Marketplace, Jobs, Dashboard analytics, HeyleyBot AI chat, 20+ country landings. **Backend**: Flask Python with PostgreSQL models ready.

Mobile-first, responsive, mock-data functional (Zustand stores).

## ✨ Features Overview

```
🧑‍💼 HR (Full)     📈 CRM & Leads
├─ Employee CRUD    ├─ Pipeline/Deals
├─ Attendance       ├─ Analytics
├─ Leave/Perf       └─ Contacts
├─ Payroll Calc     📦 Inventory/Stock
├─ Blacklist/Docs   ├─ CRUD/Tracking
└─ WIBA/Injuries    └─ Fuel/Transport Logs

🌐 Networking     🛒 Marketplace/Jobs
├─ Feed/Messaging  ├─ Postings
└─ Connections     └─ Proposals

💰 Accounting     ⚙️ Dashboard/Settings
├─ Payroll/Fin     ├─ Charts (Recharts)
└─ Revenue         └─ Auth/Profile
```

+ Country landings (ke, ng, za, us, gb...) + HeyleyBot.

## 🏗️ Tech Stack

### Frontend
| Category | Tech |
|----------|------|
| Core | Vite, React 18 TS, React Router |
| UI | Tailwind, shadcn/ui (50+), Lucide |
| State/Data | Zustand stores, Tanstack Query, React Hook Form/Zod |
| Charts/Forms | Recharts, Sonner toasts |
| Dev | Vitest, Playwright, ESLint/TS |

### Backend
| Category | Tech |
|----------|------|
| Core | Flask Python |
| DB | PostgreSQL (models/hr.py, crm.py...) |
| Schema | database.sql ready |

## 🎮 Quick Start

**Frontend (Standalone)**:
```bash
cd frontend
npm install
npm run dev  # localhost:8080/
```

**Backend**:
```bash
cd backend
pip install -r requirements.txt
flask run  # localhost:5000
```

Live Demo: https://heyla-os.onrender.com

## 🧭 Routes (React Router)

Public: `/` (Country Select), `/country/ke` (Landings), `/login`, `/register`, `/careers`.

Protected (Sidebar):
```
/dashboard (stats/charts)
├── /hr (Directory) → /hr/attendance, /hr/leave, /hr/performance, /hr/employee/:id, /hr/blacklist, /hr/documents...
├── /crm
├── /accounting → /accounting/payroll
├── /inventory
├── /transport
├── /fuel
├── /networking
├── /marketplace
├── /jobs
└── /settings
```

## 🏗️ Frontend Code Structure

```
frontend/src/
├── App.tsx (QueryClient, Routes, ProtectedRoute)
├── main.tsx
├── components/
│   ├── ui/ (accordion.tsx, button.tsx, table.tsx, 50+ shadcn...)
│   ├── layout/ AppLayout.tsx, Sidebar.tsx, TopBar.tsx
│   ├── landing-pages/ CountrySelectPage.tsx, ke/KenyaLanding.tsx (20 countries)
│   ├── chat/ HeyleyBot.tsx
│   ├── hr/ AddEmployeeDialog.tsx
│   └── shared/ CommonUI.tsx
├── pages/
│   ├── dashboard/ DashboardPage.tsx
│   ├── hr/ HRPage.tsx, AttendancePage.tsx, LeavePage.tsx...
│   ├── accounting/ AccountingPage.tsx, PayrollPage.tsx
│   ├── crm/ CRMPage.tsx
│   ├── inventory/ InventoryPage.tsx
│   ├── fuel/ FuelPage.tsx
│   ├── transport/ TransportPage.tsx
│   ├── networking/ NetworkingPage.tsx
│   ├── marketplace/ MarketplacePage.tsx
│   ├── jobs/ JobsPage.tsx
│   ├── auth/ Login/Register
│   └── settings/ SettingsPage.tsx
├── store/ authStore.ts, employeeStore.ts, fuelStore.ts... (Zustand)
├── hooks/ use-toast.ts, use-mobile.tsx
└── lib/utils.ts
```

Backend: `backend/app/models/` (user.py, hr.py...) + database.sql.

## 🚀 Features (Live)

- HR CRUD w/ dialogs/forms
- Responsive sidebar/table/charts
- Country-localized marketing
- Mock data, forms validation
- Toasts/modals/tooltips

## 🔮 Roadmap

Phase 2: Backend API integration.
Phase 3: PWA/mobile.
Phase 4: SaaS/multi-tenant.

## 🤝 Contributing

Fork → branch → PR.

MIT License.

Live: https://heyla-os.onrender.com | GitHub: https://github.com/victormwendwahope-hue/HEYLA-OS
