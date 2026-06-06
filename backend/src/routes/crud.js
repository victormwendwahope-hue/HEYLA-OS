// Generic CRUD router factory with RBAC + audit + validation.
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { validate, idParam, paginationQuery, safeRecord, z } from '../validate.js';
import { audit } from '../audit.js';

// Collections that only admins may write to (read still owner-scoped/admin).
const ADMIN_WRITE = new Set([
  'payroll', 'audit_logs', 'announcements',
]);

// Collections that are admin-only for everything.
const ADMIN_ONLY = new Set(['audit_logs']);

const writeBody = safeRecord; // shape-checked, but per-domain validation is done in dedicated routers when needed.

export function crudRouter(collection, opts = {}) {
  const router = Router();
  router.use(requireAuth);

  const adminOnly = ADMIN_ONLY.has(collection);
  const adminWrite = adminOnly || ADMIN_WRITE.has(collection);

  function canRead(req, row) {
    if (req.user.role === 'admin') return true;
    if (adminOnly) return false;
    if (!row.ownerId) return true;
    return row.ownerId === req.user.sub;
  }
  function canWrite(req, row) {
    if (req.user.role === 'admin') return true;
    if (adminWrite) return false;
    if (!row) return true;
    return !row.ownerId || row.ownerId === req.user.sub;
  }

  router.get('/', validate({ query: paginationQuery }), async (req, res) => {
    if (adminOnly && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    let rows = await db.all(collection);
    if (req.user.role !== 'admin') rows = rows.filter((r) => !r.ownerId || r.ownerId === req.user.sub);
    if (req.query.q) {
      const q = String(req.query.q).toLowerCase();
      rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
    }
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || rows.length;
    res.json(rows.slice(offset, offset + limit));
  });

  router.get('/:id', validate({ params: idParam }), async (req, res) => {
    const row = await db.get(collection, req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    if (!canRead(req, row)) return res.status(403).json({ error: 'Forbidden' });
    res.json(row);
  });

  router.post('/', validate({ body: writeBody }), async (req, res) => {
    if (adminWrite && req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const payload = opts.beforeCreate ? opts.beforeCreate(req.body, req) : req.body;
    const row = await db.insert(collection, { ...payload, ownerId: req.user.sub });
    await audit(req, `${collection}.create`, `${collection}/${row.id}`);
    res.status(201).json(row);
  });

  router.patch('/:id', validate({ params: idParam, body: writeBody }), async (req, res) => {
    const existing = await db.get(collection, req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (!canWrite(req, existing)) return res.status(403).json({ error: 'Forbidden' });
    // Strip identity/owner fields from arbitrary patches.
    const { id, ownerId, createdAt, ...patch } = req.body;
    const row = await db.update(collection, req.params.id, patch);
    await audit(req, `${collection}.update`, `${collection}/${row.id}`);
    res.json(row);
  });

  router.delete('/:id', validate({ params: idParam }), async (req, res) => {
    const existing = await db.get(collection, req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (!canWrite(req, existing)) return res.status(403).json({ error: 'Forbidden' });
    const ok = await db.remove(collection, req.params.id);
    await audit(req, `${collection}.delete`, `${collection}/${req.params.id}`);
    res.json({ ok });
  });

  return router;
}
