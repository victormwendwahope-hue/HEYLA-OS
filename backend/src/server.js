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
import paymentRouter from './routes/payment.js';
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
const FRONTEND_ORIGIN = (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.trim())
  ? process.env.CORS_ORIGIN.trim()
  : DEFAULT_FRONTEND_ORIGIN;

const CORS_ORIGINS_ALLOWLIST = [FRONTEND_ORIGIN];

console.log('\n🧩 [config] CORS_ORIGIN env:', process.env.CORS_ORIGIN);
console.log('[config] FRONTEND_ORIGIN effective:', FRONTEND_ORIGIN);
console.log('[config] CORS_ORIGINS_ALLOWLIST:', CORS_ORIGINS_ALLOWLIST.join(', '));
console.log('[config] NODE_ENV:', process.env.NODE_ENV);
console.log('[config] PORT:', process.env.PORT);

// HARD: preflight must match and respond before any other middleware (rateLimit, headers, routes).
app.options('*', (req, res) => {
  if (!req.path.startsWith('/api/')) return res.status(404).end();

  const origin = req.headers.origin;

  if (req.path === '/api/auth/login') {
    console.log('\n🧪 [preflight] OPTIONS /api/auth/login');
    console.log('[preflight] Origin header:', origin);
    console.log('[preflight] CORS allowlist:', CORS_ORIGINS_ALLOWLIST.join(', '));
  }

  // Only set Access-Control-Allow-Origin for allowed origins (credentials require exact origin).
  if (origin && CORS_ORIGINS_ALLOWLIST.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin'
  );

  return res.status(204).end();
});

// CORS: make sure non-preflight requests succeed with correct headers.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin header)
      if (!origin) return callback(null, true);
      if (CORS_ORIGINS_ALLOWLIST.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
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

// Payment
app.use('/api/payment', paymentRouter);


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
  console.log(`   CORS origin:  ${FRONTEND_ORIGIN}`);
  console.log(`   Data dir:     ${path.resolve(process.env.DATA_DIR || './data')}`);
  console.log(`   Try: curl http://localhost:${PORT}/api/health\n`);
});
