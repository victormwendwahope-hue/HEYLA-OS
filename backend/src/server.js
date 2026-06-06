import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';

import { db } from './db.js';
import authRouter from './routes/auth.js';
import jobsRouter, { applicationsRouter } from './routes/jobs.js';
import careersRouter from './routes/careers.js';
import chatRouter from './routes/chat.js';
import uploadRouter from './routes/upload.js';
import adminRouter from './routes/admin.js';
import { crudRouter } from './routes/crud.js';
import { rateLimit, securityHeaders } from './security.js';

const app = express();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT) || 4000;

const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:8080')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Allow tools (Postman, curl) with no origin, and any whitelisted origin.
      if (!origin) return cb(null, true);
      if (origins.includes('*') || origins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(securityHeaders);

// Global rate limit (generous), strict limiter on auth routes
app.use('/api/', rateLimit({ windowMs: 60_000, max: 300, key: 'api' }));

// Static uploads
app.use('/uploads', express.static(db.uploadsDir));

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

// Uploads
app.use('/api/upload', uploadRouter);

// Admin
app.use('/api/admin', adminRouter);

// Generic CRUD modules
const crudCollections = [
  // HR
  'employees', 'attendance', 'leave', 'performance',
  'wiba', 'injuries', 'blacklist', 'documents',
  // CRM
  'leads', 'customers', 'tickets',
  // Accounting
  'invoices', 'expenses', 'payments', 'payroll',
  // Inventory
  'products',
  // Transport / fuel
  'vehicles', 'fuel', 'trips',
  // EHS
  'ehs-incidents', 'ehs-inspections', 'ehs-compliance',
  // Engineering
  'engineering-projects', 'engineering-contracts', 'engineering-claims',
  'engineering-variations', 'engineering-payments', 'engineering-disputes',
  'engineering-warnings',
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

app.listen(PORT, () => {
  console.log(`\n🚀 HEYLA OS backend listening on http://localhost:${PORT}`);
  console.log(`   CORS origins: ${origins.join(', ')}`);
  console.log(`   Data dir:     ${path.resolve(process.env.DATA_DIR || './data')}`);
  console.log(`   Try: curl http://localhost:${PORT}/api/health\n`);
});
