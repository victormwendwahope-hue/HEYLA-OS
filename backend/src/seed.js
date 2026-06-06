import 'dotenv/config';
import { db } from './db.js';
import { hashPassword, findUserByEmail } from './auth.js';

const email = process.env.ADMIN_EMAIL || 'hydancheru@gmail.com';
const password = process.env.ADMIN_PASSWORD || 'DanHacks@Admin';
const name = process.env.ADMIN_NAME || 'Dan Hacks';
const company = process.env.ADMIN_COMPANY || 'HEYLA Corp';

const existing = await findUserByEmail(email);
if (existing) {
  // Ensure role is admin and password matches the env value (idempotent reset).
  await db.update('users', existing.id, {
    role: 'admin',
    passwordHash: await hashPassword(password),
    name,
    company,
  });
  console.log(`✓ Admin already existed — reset password & role for ${email}`);
} else {
  const user = await db.insert('users', {
    email,
    name,
    company,
    role: 'admin',
    accountType: 'company',
    passwordHash: await hashPassword(password),
  });
  console.log(`✓ Seeded admin user ${user.email} (id=${user.id})`);
}

console.log('Done.');
process.exit(0);
