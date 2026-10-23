import 'dotenv/config';
import fs from 'node:fs/promises';
import { pool } from './db.js';
try {
  const sql = await fs.readFile(new URL('../sql/schema.sql', import.meta.url), 'utf8');
  await pool.query(sql);
  console.log('PostgreSQL schema created successfully.');
} catch (err) {
  console.error('Database setup failed:', err.message);
  process.exitCode = 1;
} finally { await pool.end(); }
