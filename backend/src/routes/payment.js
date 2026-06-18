import { Router } from 'express';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

// Return payment URL for frontend redirect
router.get('/', (_req, res) => {
  const url = process.env.PAYMENT_URL;
  if (!url) return res.status(400).json({ error: 'PAYMENT_URL not configured' });
  res.json({ url });
});

export default router;

