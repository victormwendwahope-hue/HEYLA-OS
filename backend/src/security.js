// Hand-written security middleware — no external deps.

// Simple in-memory rate limiter (per-IP, per-route bucket).
// Good enough for a single-node deployment. For multi-node use Redis.
export function rateLimit({ windowMs = 60_000, max = 60, key = 'global' } = {}) {
  const hits = new Map(); // ip -> { count, resetAt }
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const id = `${key}:${ip}`;
    const now = Date.now();
    const bucket = hits.get(id);
    if (!bucket || bucket.resetAt < now) {
      hits.set(id, { count: 1, resetAt: now + windowMs });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > max) {
      const retry = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retry));
      return res.status(429).json({ error: 'Too many requests', retryAfter: retry });
    }
    next();
  };
}

// Minimal security headers (helmet replacement).
export function securityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
}
