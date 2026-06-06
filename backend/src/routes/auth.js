import { Router } from 'express';
import { db } from '../db.js';
import {
  hashPassword,
  verifyPassword,
  issueAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForUser,
  publicUser,
  requireAuth,
  findUserByEmail,
} from '../auth.js';
import { validate, z } from '../validate.js';
import { audit } from '../audit.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(200)
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().max(200).optional().default(''),
  accountType: z.enum(['company', 'individual']).optional().default('company'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(200),
});

const refreshSchema = z.object({ refreshToken: z.string().min(20).max(512) });

router.post('/register', validate({ body: registerSchema }), async (req, res) => {
  const { email, password, name, company, accountType } = req.body;
  if (await findUserByEmail(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const user = await db.insert('users', {
    email, name, company, accountType,
    role: accountType === 'individual' ? 'individual' : 'manager',
    passwordHash: await hashPassword(password),
  });
  const access = issueAccessToken(user);
  const { token: refreshToken } = await issueRefreshToken(user);
  await audit(req, 'auth.register', `users/${user.id}`, { email: user.email });
  res.status(201).json({ token: access, refreshToken, user: publicUser(user) });
});

router.post('/login', validate({ body: loginSchema }), async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !ok) {
    await audit(req, 'auth.login.fail', null, { email });
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const access = issueAccessToken(user);
  const { token: refreshToken } = await issueRefreshToken(user);
  await audit({ ...req, user: { sub: user.id, email: user.email, role: user.role } }, 'auth.login', `users/${user.id}`);
  res.json({ token: access, refreshToken, user: publicUser(user) });
});

router.post('/refresh', validate({ body: refreshSchema }), async (req, res) => {
  const result = await rotateRefreshToken(req.body.refreshToken);
  if (result.error) {
    if (result.error === 'reused') await audit(req, 'auth.refresh.reuse', null);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  res.json({ token: result.access, refreshToken: result.refresh, user: publicUser(result.user) });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await db.get('users', req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(user) });
});

router.post('/logout', requireAuth, validate({ body: z.object({ refreshToken: z.string().optional() }) }), async (req, res) => {
  if (req.body.refreshToken) await revokeRefreshToken(req.body.refreshToken);
  await audit(req, 'auth.logout', `users/${req.user.sub}`);
  res.json({ ok: true });
});

router.post('/logout-all', requireAuth, async (req, res) => {
  await revokeAllForUser(req.user.sub);
  await audit(req, 'auth.logout_all', `users/${req.user.sub}`);
  res.json({ ok: true });
});

export default router;
