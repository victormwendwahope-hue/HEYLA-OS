// Admin-only routes: audit log access, user role management.
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireRole, ROLES, revokeAllForUser } from '../auth.js';
import { validate, idParam, paginationQuery, z } from '../validate.js';
import { audit } from '../audit.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/audit-logs', validate({ query: paginationQuery }), async (req, res) => {
  let rows = await db.all('audit_logs');
  rows.sort((a, b) => (b.at || '').localeCompare(a.at || ''));
  if (req.query.q) {
    const q = String(req.query.q).toLowerCase();
    rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }
  const offset = Number(req.query.offset) || 0;
  const limit = Number(req.query.limit) || 100;
  res.json(rows.slice(offset, offset + limit));
});

router.get('/users', async (_req, res) => {
  const rows = await db.all('users');
  res.json(rows.map(({ passwordHash, ...u }) => u));
});

const roleSchema = z.object({ role: z.enum(ROLES) });
router.patch('/users/:id/role',
  validate({ params: idParam, body: roleSchema }),
  async (req, res) => {
    const u = await db.update('users', req.params.id, { role: req.body.role });
    if (!u) return res.status(404).json({ error: 'Not found' });
    await revokeAllForUser(req.params.id); // force re-login after role change
    await audit(req, 'admin.user.role_change', `users/${req.params.id}`, { role: req.body.role });
    const { passwordHash, ...safe } = u;
    res.json(safe);
  });

router.post('/users/:id/revoke-sessions',
  validate({ params: idParam }),
  async (req, res) => {
    await revokeAllForUser(req.params.id);
    await audit(req, 'admin.user.revoke_sessions', `users/${req.params.id}`);
    res.json({ ok: true });
  });

export default router;
