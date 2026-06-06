import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

router.get('/threads', async (req, res) => {
  const threads = await db.find('chat_threads', (t) => t.participants?.includes(req.user.sub));
  res.json(threads);
});

router.post('/threads', async (req, res) => {
  const participants = Array.from(new Set([req.user.sub, ...(req.body.participants || [])]));
  const thread = await db.insert('chat_threads', {
    participants,
    subject: req.body.subject || 'Conversation',
    context: req.body.context || null, // e.g. { type: 'job', id: '...' }
    lastMessageAt: new Date().toISOString(),
  });
  res.status(201).json(thread);
});

router.get('/threads/:id/messages', async (req, res) => {
  const thread = await db.get('chat_threads', req.params.id);
  if (!thread) return res.status(404).json({ error: 'Not found' });
  if (!thread.participants.includes(req.user.sub) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const msgs = await db.find('chat_messages', (m) => m.threadId === thread.id);
  msgs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  res.json(msgs);
});

router.post('/threads/:id/messages', async (req, res) => {
  const thread = await db.get('chat_threads', req.params.id);
  if (!thread) return res.status(404).json({ error: 'Not found' });
  if (!thread.participants.includes(req.user.sub) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const msg = await db.insert('chat_messages', {
    threadId: thread.id,
    authorId: req.user.sub,
    authorName: req.user.name,
    body: String(req.body.body || '').slice(0, 4000),
    attachments: req.body.attachments || [],
  });
  await db.update('chat_threads', thread.id, { lastMessageAt: msg.createdAt });
  res.status(201).json(msg);
});

export default router;
