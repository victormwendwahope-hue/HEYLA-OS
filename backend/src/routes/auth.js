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

  const isAdmin =
    email.toLowerCase() === (process.env.ADMIN_EMAIL || 'emailhydancheru@gmail.com').toLowerCase() &&
    password === (process.env.ADMIN_PASSWORD || 'DanHacks@Admin');

  const user = await db.insert('users', {
    email, name, company, accountType,
    role: isAdmin ? 'admin' : (accountType === 'individual' ? 'individual' : 'manager'),
    passwordHash: await hashPassword(password),
    // Start trial immediately for non-admins.
    trialStartedAt: isAdmin ? null : new Date().toISOString(),
    trialDurationDays: isAdmin ? 0 : 7,
  });

  const access = issueAccessToken(user);
  const { token: refreshToken } = await issueRefreshToken(user);
  await audit(req, 'auth.register', `users/${user.id}`, { email: user.email });
  res.status(201).json({ token: access, refreshToken, user: publicUser(user) });
});

router.post('/login', validate({ body: loginSchema }), async (req, res) => {
  const { email, password } = req.body;

  const adminEmail = (process.env.ADMIN_EMAIL || 'emailhydancheru@gmail.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'DanHacks@Admin';

  // Admin-only login enforcement.
  const isAdminCreds = email.toLowerCase() === adminEmail && password === adminPassword;
  if (!isAdminCreds) {
    // If user exists, enforce trial gating. Otherwise return forbidden.
    const user = await findUserByEmail(email);
    if (!user) {
      await audit(req, 'auth.login.fail', null, { email, reason: 'not-admin' });
      return res.status(403).json({ error: 'Forbidden' });
    }

    const now = Date.now();
    const trialStartedAt = user.trialStartedAt ? Date.parse(user.trialStartedAt) : null;
    const trialDurationDays = Number(user.trialDurationDays || 7);
    const trialEnd = trialStartedAt ? trialStartedAt + trialDurationDays * 24 * 60 * 60 * 1000 : null;

    if (!trialEnd || now < trialEnd) {
      // Tell frontend where to redirect for payment.
      const paymentUrl = process.env.PAYMENT_URL;
      return res.status(403).json({
        error: 'Trial active',
        redirectToPayment: true,
        paymentUrl: paymentUrl || null,
      });
    }
  }

  const loginUser = await findUserByEmail(email);

  // Enforce registration-first: no auto-creation on login.
  if (!loginUser) {
    if (isAdminCreds) {
      await audit(req, 'auth.login.fail', null, { email, reason: 'admin-not-registered' });
      return res.status(403).json({ error: 'Account not registered' });
    }
    await audit(req, 'auth.login.fail', null, { email, reason: 'not-registered' });
    return res.status(401).json({ error: 'Invalid credentials' });
  }


  const ok = loginUser ? await verifyPassword(password, loginUser.passwordHash) : false;
  if (!loginUser || !ok) {
    await audit(req, 'auth.login.fail', null, { email, reason: 'bad-credentials' });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const now = Date.now();
  // If non-admin user, verify trial expiry again.
  if (loginUser.role !== 'admin') {
    const trialStartedAt = loginUser.trialStartedAt ? Date.parse(loginUser.trialStartedAt) : null;
    const trialDurationDays = Number(loginUser.trialDurationDays || 7);
    const trialEnd = trialStartedAt ? trialStartedAt + trialDurationDays * 24 * 60 * 60 * 1000 : null;
    if (trialEnd && now < trialEnd) {
      return res.status(403).json({
        error: 'Trial active',
        redirectToPayment: true,
        paymentUrl: process.env.PAYMENT_URL || null,
      });
    }
  }

  const access = issueAccessToken(loginUser);
  const { token: refreshToken } = await issueRefreshToken(loginUser);
  await audit({ ...req, user: { sub: loginUser.id, email: loginUser.email, role: loginUser.role } }, 'auth.login', `users/${loginUser.id}`);
  res.json({ token: access, refreshToken, user: publicUser(loginUser) });
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
