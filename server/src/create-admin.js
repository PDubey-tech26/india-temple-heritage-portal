import 'dotenv/config';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';
const rl = readline.createInterface({ input, output });
try {
  const email = (await rl.question('Admin email: ')).trim().toLowerCase();
  const password = await rl.question('Password (12+ characters recommended): ');
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('Enter a valid email address.');
}
  if (password.length < 12) throw new Error('Use a password with at least 12 characters.');
  const hash = await bcrypt.hash(password, 12);
  await pool.query('INSERT INTO admin_users(email,password_hash,role) VALUES($1,$2,$3) ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash', [email, hash, 'admin']);
  console.log('Admin account created/updated.');
} catch (err) { console.error(err.message); process.exitCode = 1; }
finally { rl.close(); await pool.end(); }
