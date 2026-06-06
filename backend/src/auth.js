import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

const ACCESS_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || ACCESS_SECRET + ':refresh';
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_EXPIRES_MS = 1000 * 60 * 60 * 24 * 30; // 30d

export const ROLES = ['admin', 'manager', 'employee', 'individual'];

export const hashPassword = (pw) => bcrypt.hash(pw, 12);
export const verifyPassword = (pw, hash) => bcrypt.compare(pw, hash);

export function issueAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
}

// Refresh tokens are random opaque strings; we store a SHA-256 hash so a DB leak
// doesn't expose live tokens. Family id ties rotated tokens together so reuse
// of an old token revokes the whole family (token theft detection).
function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

export async function issueRefreshToken(user, { familyId } = {}) {
  const raw = crypto.randomBytes(48).toString('base64url');
  const fam = familyId || crypto.randomBytes(16).toString('hex');
  await db.insert('refresh_tokens', {
    userId: user.id,
    familyId: fam,
    tokenHash: sha256(raw),
    expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS).toISOString(),
    revokedAt: null,
    replacedBy: null,
  });
  return { token: raw, familyId: fam };
}

export async function rotateRefreshToken(rawToken) {
  const hash = sha256(rawToken);
  const rows = await db.find('refresh_tokens', (r) => r.tokenHash === hash);
  const record = rows[0];
  if (!record) return { error: 'invalid' };

  if (record.revokedAt) {
    // Reuse of a revoked token -> revoke whole family.
    await revokeFamily(record.familyId, 'reuse-detected');
    return { error: 'reused' };
  }
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return { error: 'expired' };
  }

  const user = await db.get('users', record.userId);
  if (!user) return { error: 'invalid' };

  const next = await issueRefreshToken(user, { familyId: record.familyId });
  await db.update('refresh_tokens', record.id, {
    revokedAt: new Date().toISOString(),
    replacedBy: sha256(next.token),
  });
  return { user, refresh: next.token, access: issueAccessToken(user) };
}

export async function revokeRefreshToken(rawToken) {
  const rows = await db.find('refresh_tokens', (r) => r.tokenHash === sha256(rawToken));
  for (const r of rows) {
    if (!r.revokedAt) await db.update('refresh_tokens', r.id, { revokedAt: new Date().toISOString() });
  }
}

export async function revokeFamily(familyId, reason = 'revoked') {
  const rows = await db.find('refresh_tokens', (r) => r.familyId === familyId && !r.revokedAt);
  for (const r of rows) {
    await db.update('refresh_tokens', r.id, { revokedAt: new Date().toISOString(), reason });
  }
}

export async function revokeAllForUser(userId) {
  const rows = await db.find('refresh_tokens', (r) => r.userId === userId && !r.revokedAt);
  for (const r of rows) {
    await db.update('refresh_tokens', r.id, { revokedAt: new Date().toISOString() });
  }
}

export function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden: insufficient role' });
    next();
  };
}

export async function findUserByEmail(email) {
  const rows = await db.find('users', (u) => u.email.toLowerCase() === email.toLowerCase());
  return rows[0] || null;
}

export { ACCESS_SECRET, REFRESH_SECRET };
