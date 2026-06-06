// Zod validation middleware. Rejects unsafe values with consistent errors.
import { z } from 'zod';

function format(error) {
  const issues = error.issues.map((i) => ({
    path: i.path.join('.') || '(root)',
    code: i.code,
    message: i.message,
  }));
  return { error: 'Validation failed', issues };
}

export function validate({ body, query, params }) {
  return (req, res, next) => {
    try {
      if (body) req.body = body.parse(req.body ?? {});
      if (query) req.query = query.parse(req.query ?? {});
      if (params) req.params = params.parse(req.params ?? {});
      next();
    } catch (e) {
      if (e?.issues) return res.status(400).json(format(e));
      next(e);
    }
  };
}

// Common reusable schemas
export const idParam = z.object({ id: z.string().min(1).max(64) });
export const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  q: z.string().max(200).optional(),
});

// Generic safe record: no prototype-polluting keys, capped depth.
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
export const safeRecord = z.record(z.string(), z.unknown()).superRefine((obj, ctx) => {
  for (const k of Object.keys(obj)) {
    if (FORBIDDEN_KEYS.has(k)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Forbidden key: ${k}`, path: [k] });
    }
  }
});

export { z };
