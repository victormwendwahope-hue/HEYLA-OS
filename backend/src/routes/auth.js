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

  const adminEmail = (process.env.ADMIN_EMAIL || 'hydancheru@gmail.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'DanHacks@Admin';
  const isAdmin = email.toLowerCase() === adminEmail && password === adminPassword;

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

  const adminEmail = (process.env.ADMIN_EMAIL || 'hydancheru@gmail.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'DanHacks@Admin';

  const loginUser = await findUserByEmail(email);

  // Enforce registration-first: user must exist.
  if (!loginUser) {
    await audit(req, 'auth.login.fail', null, { email, reason: 'not-registered' });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Verify password.
  const ok = await verifyPassword(password, loginUser.passwordHash);
  if (!ok) {
    await audit(req, 'auth.login.fail', null, { email, reason: 'bad-credentials' });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Non-admin users: check if trial has EXPIRED (now > trialEnd).
  // If expired, block and direct to payment.
  if (loginUser.role !== 'admin') {
    const now = Date.now();
    const trialStartedAt = loginUser.trialStartedAt ? Date.parse(loginUser.trialStartedAt) : null;
    const trialDurationDays = Number(loginUser.trialDurationDays || 7);
    const trialEnd = trialStartedAt ? trialStartedAt + trialDurationDays * 24 * 60 * 60 * 1000 : null;

    // Block if trial exists AND has expired (now > trialEnd).
    if (trialEnd && now > trialEnd) {
      await audit(req, 'auth.login.fail', null, { email, reason: 'trial-expired' });
      return res.status(403).json({
        error: 'Trial expired. Please upgrade to continue.',
        redirectToPayment: true,
        paymentUrl: process.env.PAYMENT_URL || null,
      });
    }
  }

  // Login successful.
  const access = issueAccessToken(loginUser);
  const { token: refreshToken } = await issueRefreshToken(loginUser);
  
  // Audit: create a minimal req-like object for audit since we can't spread req directly.
  await audit(req, 'auth.login', `users/${loginUser.id}`, { email: loginUser.email });
  
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
