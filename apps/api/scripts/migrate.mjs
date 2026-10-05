import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';

const url = process.env.DATABASE_URL ?? 'postgres://csms:csms_dev@localhost:5432/csms';
const sql = await readFile(new URL('../sql/001_initial.sql', import.meta.url), 'utf8');
const pool = new Pool({ connectionString: url });

try {
  await pool.query(sql);
  console.log('Database migration completed.');
} finally {
  await pool.end();
}
