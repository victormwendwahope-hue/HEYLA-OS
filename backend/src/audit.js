// Append-only audit log. Stored in audit_logs.json via db.insert.
// Captures: actor, action, resource, IP, user-agent, timestamp, metadata.
import { db } from './db.js';

function clientIp(req) {
  if (!req || !req.headers) return 'unknown';
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

export async function audit(req, action, resource, metadata = {}) {
  try {
    await db.insert('audit_logs', {
      action,                           // e.g. 'auth.login', 'invoice.create'
      resource: resource || null,       // e.g. 'invoices/abc123'
      actorId: req.user?.sub || null,
      actorEmail: req.user?.email || metadata.email || null,
      actorRole: req.user?.role || null,
      ip: clientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 256),
      metadata,
      at: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[audit] failed to write log', e);
  }
}

// Express middleware that audits after the response finishes if status < 400.
export function auditAfter(action, resourceFn) {
  return (req, res, next) => {
    res.on('finish', () => {
      if (res.statusCode >= 400) return;
      const resource = typeof resourceFn === 'function' ? resourceFn(req, res) : resourceFn;
      audit(req, action, resource, { status: res.statusCode, method: req.method, path: req.originalUrl });
    });
    next();
  };
}
