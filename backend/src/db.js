// Tiny JSON-file store with per-file write queues for atomicity.
import fs from 'node:fs/promises';
import path from 'node:path';
import { nanoid } from 'nanoid';

const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');
await fs.mkdir(DATA_DIR, { recursive: true });
await fs.mkdir(path.join(DATA_DIR, 'uploads'), { recursive: true });

const queues = new Map(); // file -> Promise chain

function fileFor(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

async function readRaw(name) {
  try {
    const buf = await fs.readFile(fileFor(name), 'utf8');
    return JSON.parse(buf);
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function writeRaw(name, rows) {
  const tmp = fileFor(name) + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2));
  await fs.rename(tmp, fileFor(name));
}

function enqueue(name, fn) {
  const prev = queues.get(name) || Promise.resolve();
  const next = prev.catch(() => {}).then(fn);
  queues.set(name, next);
  return next;
}

export const db = {
  uploadsDir: path.join(DATA_DIR, 'uploads'),

  async all(name) {
    return readRaw(name);
  },

  async find(name, predicate) {
    const rows = await readRaw(name);
    return rows.filter(predicate);
  },

  async get(name, id) {
    const rows = await readRaw(name);
    return rows.find((r) => r.id === id) || null;
  },

  async insert(name, data) {
    return enqueue(name, async () => {
      const rows = await readRaw(name);
      const now = new Date().toISOString();
      const row = { id: nanoid(12), createdAt: now, updatedAt: now, ...data };
      rows.push(row);
      await writeRaw(name, rows);
      return row;
    });
  },

  async update(name, id, patch) {
    return enqueue(name, async () => {
      const rows = await readRaw(name);
      const i = rows.findIndex((r) => r.id === id);
      if (i === -1) return null;
      rows[i] = { ...rows[i], ...patch, id, updatedAt: new Date().toISOString() };
      await writeRaw(name, rows);
      return rows[i];
    });
  },

  async remove(name, id) {
    return enqueue(name, async () => {
      const rows = await readRaw(name);
      const next = rows.filter((r) => r.id !== id);
      const removed = rows.length !== next.length;
      if (removed) await writeRaw(name, next);
      return removed;
    });
  },

  async upsertBy(name, key, value, data) {
    return enqueue(name, async () => {
      const rows = await readRaw(name);
      const i = rows.findIndex((r) => r[key] === value);
      const now = new Date().toISOString();
      if (i === -1) {
        const row = { id: nanoid(12), createdAt: now, updatedAt: now, ...data, [key]: value };
        rows.push(row);
        await writeRaw(name, rows);
        return row;
      }
      rows[i] = { ...rows[i], ...data, updatedAt: now };
      await writeRaw(name, rows);
      return rows[i];
    });
  },
};
