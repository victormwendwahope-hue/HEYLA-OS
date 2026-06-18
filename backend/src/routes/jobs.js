import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { validate, idParam, z } from '../validate.js';

const router = Router();

// Validation schemas
const jobCreateSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(5000).optional().default(''),
  companyName: z.string().trim().max(200).optional(),
  skills: z.array(z.string().max(100)).optional().default([]),
  qualifications: z.array(z.string().max(100)).optional().default([]),
  location: z.string().trim().max(300).optional().default(''),
  status: z.enum(['Open', 'Closed']).optional().default('Open'),
});

const jobUpdateSchema = jobCreateSchema.partial();

// Public listing
router.get('/', async (_req, res) => {
  const jobs = await db.all('jobs');
  res.json(jobs.filter((j) => j.status !== 'Closed'));
});

router.get('/:id', validate({ params: idParam }), async (req, res) => {
  const job = await db.get('jobs', req.params.id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  res.json(job);
});

// Companies post jobs
router.post('/', requireAuth, validate({ body: jobCreateSchema }), async (req, res) => {
  const job = await db.insert('jobs', {
    title: req.body.title,
    description: req.body.description,
    companyName: req.body.companyName || req.user.name,
    skills: req.body.skills,
    qualifications: req.body.qualifications,
    location: req.body.location,
    status: req.body.status,
    ownerId: req.user.sub,
  });
  res.status(201).json(job);
});

router.patch('/:id', requireAuth, validate({ params: idParam, body: jobUpdateSchema }), async (req, res) => {
  const existing = await db.get('jobs', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && existing.ownerId !== req.user.sub) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Strip dangerous fields from patch
  const { ownerId, createdAt, id, ...patch } = req.body;
  const job = await db.update('jobs', req.params.id, patch);
  res.json(job);
});

router.delete('/:id', requireAuth, validate({ params: idParam }), async (req, res) => {
  const existing = await db.get('jobs', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && existing.ownerId !== req.user.sub) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await db.remove('jobs', req.params.id);
  res.json({ ok: true });
});

// Apply to a job
router.post('/:id/applications', requireAuth, validate({ params: idParam, body: z.object({
  coverLetter: z.string().max(5000).optional().default(''),
  resumeUrl: z.string().url().optional().default(''),
}) }), async (req, res) => {
  const job = await db.get('jobs', req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  const app = await db.insert('applications', {
    jobId: job.id,
    jobTitle: job.title,
    companyId: job.ownerId,
    applicantId: req.user.sub,
    applicantName: req.user.name,
    applicantEmail: req.user.email,
    coverLetter: req.body.coverLetter,
    resumeUrl: req.body.resumeUrl,
    status: 'New',
  });
  res.status(201).json(app);
});

router.get('/:id/applications', requireAuth, validate({ params: idParam }), async (req, res) => {
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

applicationsRouter.patch('/:id', validate({ params: idParam, body: z.object({
  status: z.enum(['New', 'Reviewing', 'Interview', 'Offer', 'Rejected']).optional(),
}) }), async (req, res) => {
  const app = await db.get('applications', req.params.id);
  if (!app) return res.status(404).json({ error: 'Not found' });
  if (
    req.user.role !== 'admin' &&
    app.companyId !== req.user.sub &&
    app.applicantId !== req.user.sub
  ) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { id, createdAt, applicantId, jobId, companyId, ...patch } = req.body;
  const updated = await db.update('applications', req.params.id, patch);
  res.json(updated);
});
