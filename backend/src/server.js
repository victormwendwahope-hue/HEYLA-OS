import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';

import { db } from './db.js';
import authRouter from './routes/auth.js';
import { hashPassword } from './auth.js';
import jobsRouter, { applicationsRouter } from './routes/jobs.js';
import careersRouter from './routes/careers.js';
import chatRouter from './routes/chat.js';
import aiRouter from './routes/ai.js';
import uploadRouter from './routes/upload.js';
import adminRouter from './routes/admin.js';
import paymentRouter from './routes/payment.js';
import { requireAuth } from './auth.js';
import { crudRouter } from './routes/crud.js';
import { rateLimit, securityHeaders } from './security.js';


const app = express();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT) || 4000;

/**
 * Render frontend origin
 * IMPORTANT: set CORS_ORIGIN environment variable to match your frontend's origin.
 * Examples:
 *   http://localhost:5173 (local dev)
 *   https://myapp.example.com (production)
 */
const DEFAULT_FRONTEND_ORIGIN = 'http://localhost:5173';

const CORS_ORIGINS_ALLOWLIST = [
  DEFAULT_FRONTEND_ORIGIN,
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_ORIGIN,
  'https://heyla-os.onrender.com',
  'https://heyla-os-backend.onrender.com',
  'https://heyla-backend.onrender.com',
].filter(Boolean);

console.log('\n🧩 [config] CORS_ORIGINS_ALLOWLIST:');
console.log(CORS_ORIGINS_ALLOWLIST);
console.log('[config] CORS_ORIGIN env:', process.env.CORS_ORIGIN);
console.log('[config] FRONTEND_ORIGIN env:', process.env.FRONTEND_ORIGIN);
console.log('[config] NODE_ENV:', process.env.NODE_ENV);
console.log('[config] PORT:', process.env.PORT);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && CORS_ORIGINS_ALLOWLIST.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// CORS library for actual (non-preflight) requests.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin header)
      if (!origin) return callback(null, true);

      if (CORS_ORIGINS_ALLOWLIST.includes(origin)) {
        return callback(null, true);
      }

      console.log('[CORS BLOCKED]', origin);
      return callback(new Error(`Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);



app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(securityHeaders);

// Global rate limit (generous), strict limiter on auth routes
app.use('/api/', rateLimit({ windowMs: 60_000, max: 300, key: 'api' }));

// Static uploads
app.use('/uploads', express.static(db.uploadsDir));

// Root health
app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'HEYLA OS Backend',
    status: 'running',
    time: new Date().toISOString(),
  });
});

// Health
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, service: 'heyla-os-backend', time: new Date().toISOString() })
);

// Auth
app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, max: 20, key: 'auth' }), authRouter);

// Jobs & careers
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/careers', careersRouter);

// Chat
app.use('/api/chat', chatRouter);

// AI Chat Assistant
app.use('/api/ai', aiRouter);

// Uploads
app.use('/api/upload', uploadRouter);

// Admin
app.use('/api/admin', adminRouter);

// Payment
app.use('/api/payment', paymentRouter);

// --- Payslip export (CSV) ---
app.post('/api/payroll/export-payslips', requireAuth, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'No payroll items to export' });
    }

    const fields = [
      { key: 'employeeNo', header: 'Employee No' },
      { key: 'payrollNumber', header: 'Payroll Number' },
      { key: 'firstName', header: 'First Name' },
      { key: 'lastName', header: 'Last Name' },
      { key: 'department', header: 'Department' },
      { key: 'position', header: 'Position' },
      { key: 'payType', header: 'Pay Type' },
      { key: 'employmentType', header: 'Employment Type' },
      { key: 'basicPay', header: 'Basic Pay' },
      { key: 'housingAllowance', header: 'Housing Allowance' },
      { key: 'transportAllowance', header: 'Transport Allowance' },
      { key: 'medicalAllowance', header: 'Medical Allowance' },
      { key: 'otherAllowances', header: 'Other Allowances' },
      { key: 'hourlyRate', header: 'Hourly Rate' },
      { key: 'hoursWorked', header: 'Hours Worked' },
      { key: 'overtime', header: 'Overtime' },
      { key: 'gross', header: 'Gross Pay' },
      { key: 'paye', header: 'PAYE' },
      { key: 'nssf', header: 'NSSF' },
      { key: 'nhif', header: 'NHIF' },
      { key: 'otherDeductions', header: 'Other Deductions' },
      { key: 'totalDeductions', header: 'Total Deductions' },
      { key: 'netPay', header: 'Net Pay' },
      { key: 'paidLeaveDays', header: 'Paid Leave Days' },
      { key: 'unpaidLeaveDays', header: 'Unpaid Absent Days' },
      { key: 'sickLeaveDays', header: 'Sick Leave Days' },
      { key: 'status', header: 'Status' },
      { key: 'period', header: 'Period' },
      { key: 'paymentDate', header: 'Payment Date' },
      { key: 'createdAt', header: 'Created At' },
    ];

    const escapeCsv = (v) => {
      const s = v === null || v === undefined ? '' : String(v);
      // RFC4180-ish escaping
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const headerRow = fields.map((f) => escapeCsv(f.header)).join(',');
    const rows = items.map((it) =>
      fields
        .map((f) => escapeCsv((it && it[f.key]) ?? ''))
        .join(',')
    );

    const csv = [headerRow, ...rows].join('\n');

    const filename = `payslips_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to export payslips' });
  }
});

// --- Payslip generation ---
app.post('/api/payroll/generate-payslip', requireAuth, async (req, res) => {
  try {
    const { recordId } = req.body;
    if (!recordId) return res.status(400).json({ error: 'recordId is required' });

    const records = await db.find('payroll', (r) => r.id === recordId);
    if (records.length === 0) return res.status(404).json({ error: 'Payroll record not found' });
    const record = records[0];

    const employees = await db.find('employees', (e) => e.id === record.employeeId);
    const emp = employees[0] || {};

    const gross = record.grossPay || 0;
    const paye = Math.max(0, (gross - 24000) * 0.3);
    const nssf = Math.min(gross * 0.06, 2160);
    const nhif = 1700;

    const payslip = {
      id: `ps-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      payrollRecordId: recordId,
      employeeId: record.employeeId,
      payslipNumber: `PSL-${record.period.replace('-', '')}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      period: record.period,
      employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || record.employeeId,
      payrollNumber: emp.payrollNumber || record.employeeId,
      department: emp.department || '',
      position: emp.position || '',
      basicPay: record.basicPay || 0,
      housingAllowance: record.housingAllowance !== undefined ? record.housingAllowance : (emp.housingAllowance || 0),
      transportAllowance: record.transportAllowance !== undefined ? record.transportAllowance : (emp.transportAllowance || 0),
      medicalAllowance: record.medicalAllowance !== undefined ? record.medicalAllowance : (emp.medicalAllowance || 0),
      otherAllowances: record.otherAllowances !== undefined ? record.otherAllowances : (emp.otherAllowances || 0),
      overtime: record.overtime || 0,
      grossPay: gross,
      paye,
      nssf,
      nhif,
      totalDeductions: record.deductions || 0,
      netPay: record.netPay || 0,
      paidLeaveDays: emp.paidLeaveDays || 0,
      unpaidLeaveDays: emp.unpaidLeaveDays || 0,
      sickLeaveDays: emp.sickLeaveDays || 0,
      paymentDate: record.paidAt || new Date().toISOString(),
      companyName: 'HEYLA OS SOLUTIONS LTD',
      companyKraPin: 'A123456789Z',
      generatedAt: new Date().toISOString(),
    };

    const created = await db.insert('payslips', payslip);
    await db.update('payroll', recordId, { payslipGeneratedAt: new Date().toISOString() });
    res.status(201).json(created);
  } catch (e) {
    console.error('Generate payslip error:', e);
    res.status(500).json({ error: 'Failed to generate payslip' });
  }
});

// Generic CRUD modules
const crudCollections = [
  // HR
  'employees', 'attendance', 'leave', 'performance',
  'wiba', 'injuries', 'blacklist', 'documents',
  // CRM
  'leads', 'customers', 'tickets',
  // Accounting
  'invoices', 'expenses', 'payments', 'payroll',
  'payslips',
  // Inventory
  'products',
  // Transport / fuel
  'vehicles', 'drivers', 'shipments', 'fuel', 'trips',
  // EHS
  'ehs-incidents', 'ehs-inspections', 'ehs-compliance', 'ehs-alerts',
  // Engineering
  'engineering-projects', 'engineering-contracts', 'engineering-claims',
  'engineering-variations', 'engineering-payments', 'engineering-disputes',
  'engineering-warnings',
  // Jobs
  'interviews',
  // Networking / marketplace
  'network-posts', 'network-connections',
  'marketplace-listings', 'marketplace-orders',
  // Misc
  'notifications', 'announcements',
];

for (const name of crudCollections) {
  app.use(`/api/${name}`, crudRouter(name));
}

// 404
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

async function seedAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'hydancheru@gmail.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'DanHacks@Admin';
  const adminName = process.env.ADMIN_NAME || adminEmail.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || 'Admin';
  const adminCompany = process.env.ADMIN_COMPANY || '';

  const existing = (await db.find('users', (u) => (u.email || '').toLowerCase() === adminEmail))[0];

  // Idempotent + sync env values (fixes "admin exists but wrong passwordHash")
  if (existing) {
    await db.update('users', existing.id, {
      email: adminEmail,
      name: adminName,
      company: adminCompany,
      accountType: 'individual',
      role: 'admin',
      passwordHash: await hashPassword(adminPassword),
      trialStartedAt: null,
      trialDurationDays: 0,
      updatedAt: new Date().toISOString(),
    });
    console.log(`👑 Admin user synced (already existed): ${adminEmail}`);
    return;
  }

  await db.insert('users', {
    email: adminEmail,
    name: adminName,
    company: adminCompany,
    accountType: 'individual',
    role: 'admin',
    passwordHash: await hashPassword(adminPassword),
    trialStartedAt: null,
    trialDurationDays: 0,
  });

  console.log(`👑 Admin user created: ${adminEmail}`);
}

seedAdminUser()
  .catch((e) => console.error('Admin seed failed:', e))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 HEYLA OS backend listening on http://localhost:${PORT}`);
      console.log(`   CORS allowlist: ${CORS_ORIGINS_ALLOWLIST.join(', ')}`);
      console.log(`   Data dir:     ${path.resolve(process.env.DATA_DIR || './data')}`);
      console.log(`   Try: curl http://localhost:${PORT}/api/health\n`);
    });
  });
