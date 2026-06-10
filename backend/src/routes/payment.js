import { Router } from 'express';

const router = Router();

// Simple pass-through for the frontend to know where to redirect.
router.get('/', (_req, res) => {
  const url = process.env.PAYMENT_URL;
  if (!url) return res.status(500).json({ error: 'PAYMENT_URL not configured' });
  res.json({ url });
});

export default router;

