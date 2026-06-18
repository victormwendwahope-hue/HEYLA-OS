import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { validate, z } from '../validate.js';

const router = Router();
router.use(requireAuth);

// Validation schema for career profile
const profileSchema = z.object({
  name: z.string().trim().max(200).optional(),
  title: z.string().trim().max(200).optional().default(''),
  location: z.string().trim().max(300).optional().default(''),
  bio: z.string().trim().max(2000).optional().default(''),
  skills: z.array(z.string().max(100)).optional().default([]),
  qualifications: z.array(z.string().max(200)).optional().default([]),
  experienceYears: z.number().int().min(0).max(80).optional().default(0),
  avatarUrl: z.string().url().optional().default(''),
  resumeUrl: z.string().url().optional().default(''),
});

router.get('/profile', async (req, res) => {
  const profile = (await db.find('career_profiles', (p) => p.userId === req.user.sub))[0] || null;
  res.json(profile);
});

router.put('/profile', validate({ body: profileSchema }), async (req, res) => {
  const data = {
    userId: req.user.sub,
    name: req.body.name || req.user.name,
    title: req.body.title,
    location: req.body.location,
    bio: req.body.bio,
    skills: req.body.skills,
    qualifications: req.body.qualifications,
    experienceYears: req.body.experienceYears,
    avatarUrl: req.body.avatarUrl,
    resumeUrl: req.body.resumeUrl,
  };
  const profile = await db.upsertBy('career_profiles', 'userId', req.user.sub, data);
  res.json(profile);
});

// Job matching: rank open jobs by skill overlap + qualification overlap.
router.get('/match', async (req, res) => {
  const profile =
    (await db.find('career_profiles', (p) => p.userId === req.user.sub))[0] || null;
  const jobs = (await db.all('jobs')).filter((j) => j.status !== 'Closed');

  if (!profile || !profile.skills?.length) {
    return res.json(jobs.map((j) => ({ ...j, matchScore: 0 })));
  }

  const skillSet = new Set(profile.skills.map((s) => String(s).toLowerCase()));
  const qualSet = new Set((profile.qualifications || []).map((s) => String(s).toLowerCase()));

  const scored = jobs.map((j) => {
    const jobSkills = (j.skills || []).map((s) => String(s).toLowerCase());
    const overlap = jobSkills.filter((s) => skillSet.has(s)).length;
    const qualHit = (j.qualifications || []).some((q) => qualSet.has(String(q).toLowerCase()));
    const denom = Math.max(jobSkills.length, 1);
    const matchScore = Math.round(((overlap / denom) * 80) + (qualHit ? 20 : 0));
    return { ...j, matchScore };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  res.json(scored);
});

export default router;
