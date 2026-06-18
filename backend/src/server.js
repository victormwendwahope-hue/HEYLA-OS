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
  console.log(`   CORS allowlist: ${CORS_ORIGINS_ALLOWLIST.join(', ')}`);
  console.log(`   Data dir:     ${path.resolve(process.env.DATA_DIR || './data')}`);
  console.log(`   Try: curl http://localhost:${PORT}/api/health\n`);
});
