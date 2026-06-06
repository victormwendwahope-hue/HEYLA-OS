import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

// Public listing
router.get('/', async (_req, res) => {
  const jobs = await db.all('jobs');
  res.json(jobs.filter((j) => j.status !== 'Closed'));
});

router.get('/:id', async (req, res) => {
  const job = await db.get('jobs', req.params.id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  res.json(job);
});

// Companies post jobs
router.post('/', requireAuth, async (req, res) => {
  const job = await db.insert('jobs', {
    ...req.body,
    ownerId: req.user.sub,
    companyName: req.body.companyName || req.user.name,
    status: req.body.status || 'Open',
    skills: Array.isArray(req.body.skills) ? req.body.skills : [],
  });
  res.status(201).json(job);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const existing = await db.get('jobs', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && existing.ownerId !== req.user.sub) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(await db.update('jobs', req.params.id, req.body));
});

router.delete('/:id', requireAuth, async (req, res) => {
  const existing = await db.get('jobs', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && existing.ownerId !== req.user.sub) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await db.remove('jobs', req.params.id);
  res.json({ ok: true });
});

// Apply to a job
router.post('/:id/applications', requireAuth, async (req, res) => {
  const job = await db.get('jobs', req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  const app = await db.insert('applications', {
    jobId: job.id,
    jobTitle: job.title,
    companyId: job.ownerId,
    applicantId: req.user.sub,
    applicantName: req.user.name,
    applicantEmail: req.user.email,
    coverLetter: req.body.coverLetter || '',
    resumeUrl: req.body.resumeUrl || '',
    status: 'New',
  });
  res.status(201).json(app);
});

router.get('/:id/applications', requireAuth, async (req, res) => {
  const job = await db.get('jobs', req.params.id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && job.ownerId !== req.user.sub) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(await db.find('applications', (a) => a.jobId === job.id));
});

export default router;

// Mounted separately at /api/applications
export const applicationsRouter = Router();
applicationsRouter.use(requireAuth);

applicationsRouter.get('/', async (req, res) => {
  const rows = await db.all('applications');
  const mine = rows.filter(
    (a) =>
      req.user.role === 'admin' ||
      a.applicantId === req.user.sub ||
      a.companyId === req.user.sub
  );
  res.json(mine);
});

applicationsRouter.patch('/:id', async (req, res) => {
  const app = await db.get('applications', req.params.id);
  if (!app) return res.status(404).json({ error: 'Not found' });
  if (
    req.user.role !== 'admin' &&
    app.companyId !== req.user.sub &&
    app.applicantId !== req.user.sub
  ) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(await db.update('applications', req.params.id, req.body));
});
