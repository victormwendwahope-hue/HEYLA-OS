import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { validate, z } from '../validate.js';

// Allowed MIME types and their safe extensions
const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'video/mp4', 'video/quicktime', 'video/x-msvideo',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
]);

// Block dangerous extensions that could execute code
const BLOCKED_EXTENSIONS = new Set([
  '.html', '.htm', '.js', '.mjs', '.ts', '.jsx', '.tsx',
  '.php', '.phtml', '.php3', '.php4', '.php5', '.pht',
  '.exe', '.bin', '.app', '.dmg', '.msi', '.jar', '.dll',
  '.sh', '.bash', '.zsh', '.fish', '.bat', '.cmd', '.com',
  '.svg', // SVG can contain script tags; if needed, sanitize separately
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, db.uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10).toLowerCase();
    cb(null, `${Date.now()}-${nanoid(8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    // Check MIME type
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
    // Check extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (BLOCKED_EXTENSIONS.has(ext)) {
      return cb(new Error(`File extension not allowed: ${ext}`));
    }
    cb(null, true);
  },
});

const router = Router();
router.use(requireAuth);

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.originalname,
    size: req.file.size,
    mime: req.file.mimetype,
  });
});

export default router;
