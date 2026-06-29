import { Router } from 'express';
import { requireAuth, requireRole } from '../auth.js';
import { db } from '../db.js';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { nanoid } from 'nanoid';

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg', 'image/png', 'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
]);

const router = Router();
router.use(requireAuth);

function ensureDir(dir) {
  return fs.mkdir(dir, { recursive: true });
}

// Upload a document for an employee
router.post('/upload/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employeeDir = path.join(db.uploadsDir, 'employees', employeeId);
    await ensureDir(employeeDir);

    const storage = multer.diskStorage({
      destination: (_r, _f, cb) => cb(null, employeeDir),
      filename: (_r, file, cb) => {
        const ext = path.extname(file.originalname) || '';
        cb(null, `${Date.now()}-${nanoid(8)}${ext}`);
      },
    });

    const upload = multer({
      storage,
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_r, file, cb) => {
        if (!ALLOWED_TYPES.has(file.mimetype)) {
          return cb(new Error(`File type ${file.mimetype} not allowed`));
        }
        cb(null, true);
      },
    }).single('file');

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Upload failed' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const doc = {
        employeeId,
        originalName: req.file.originalname,
        filename: req.file.filename,
        mime: req.file.mimetype,
        size: req.file.size,
        category: req.body.category || 'Other',
        description: req.body.description || '',
        uploadedBy: req.user.sub,
        uploadedAt: new Date().toISOString(),
      };

      const created = await db.insert('employee-documents', doc);
      res.status(201).json(created);
    });
  } catch (e) {
    console.error('Document upload error:', e);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Upload multiple documents for an employee
router.post('/upload-multiple/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employeeDir = path.join(db.uploadsDir, 'employees', employeeId);
    await ensureDir(employeeDir);

    const storage = multer.diskStorage({
      destination: (_r, _f, cb) => cb(null, employeeDir),
      filename: (_r, file, cb) => {
        const ext = path.extname(file.originalname) || '';
        cb(null, `${Date.now()}-${nanoid(8)}${ext}`);
      },
    });

    const upload = multer({
      storage,
      limits: { fileSize: 10 * 1024 * 1024, files: 20 },
      fileFilter: (_r, file, cb) => {
        if (!ALLOWED_TYPES.has(file.mimetype)) {
          return cb(new Error(`File type ${file.mimetype} not allowed`));
        }
        cb(null, true);
      },
    }).array('files', 20);

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Upload failed' });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      const created = [];
      for (const file of req.files) {
        const doc = {
          employeeId,
          originalName: file.originalname,
          filename: file.filename,
          mime: file.mimetype,
          size: file.size,
          category: req.body.category || 'Other',
          description: req.body.description || '',
          uploadedBy: req.user.sub,
          uploadedAt: new Date().toISOString(),
        };
        const record = await db.insert('employee-documents', doc);
        created.push(record);
      }
      res.status(201).json(created);
    });
  } catch (e) {
    console.error('Multiple upload error:', e);
    res.status(500).json({ error: 'Failed to upload documents' });
  }
});

// List documents for an employee (or all if employeeId === 'all')
router.get('/list/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const docs = employeeId === 'all'
      ? await db.all('employee-documents')
      : await db.find('employee-documents', (d) => d.employeeId === employeeId);
    res.json(docs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)));
  } catch (e) {
    console.error('List documents error:', e);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

// Download a document (authenticated — not publicly accessible)
router.get('/download/:id', async (req, res) => {
  try {
    const docs = await db.find('employee-documents', (d) => d.id === req.params.id);
    if (docs.length === 0) return res.status(404).json({ error: 'Document not found' });
    const doc = docs[0];
    const filePath = path.join(db.uploadsDir, 'employees', doc.employeeId, doc.filename);
    const exists = await fs.stat(filePath).then(() => true).catch(() => false);
    if (!exists) return res.status(404).json({ error: 'File not found on disk' });
    res.setHeader('Content-Type', doc.mime);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}"`);
    res.sendFile(filePath);
  } catch (e) {
    console.error('Download error:', e);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const docs = await db.find('employee-documents', (d) => d.id === req.params.id);
    if (docs.length === 0) return res.status(404).json({ error: 'Document not found' });
    const doc = docs[0];
    const filePath = path.join(db.uploadsDir, 'employees', doc.employeeId, doc.filename);
    await fs.unlink(filePath).catch(() => {});
    await db.remove('employee-documents', req.params.id);
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete error:', e);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Delete all documents for an employee (used on termination)
router.delete('/employee/:employeeId/all', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const docs = await db.find('employee-documents', (d) => d.employeeId === employeeId);
    const employeeDir = path.join(db.uploadsDir, 'employees', employeeId);
    for (const doc of docs) {
      const fp = path.join(employeeDir, doc.filename);
      await fs.unlink(fp).catch(() => {});
      await db.remove('employee-documents', doc.id);
    }
    await fs.rm(employeeDir, { recursive: true, force: true });
    res.json({ ok: true, deleted: docs.length });
  } catch (e) {
    console.error('Delete all error:', e);
    res.status(500).json({ error: 'Failed to delete employee documents' });
  }
});

export default router;