// اجرای SQL روی دیتابیس Supabase از طریق Supavisor pooler (IPv4)
// استفاده:
//   node scripts/db.mjs query "select 1"
//   node scripts/db.mjs run supabase/migrations/0001c_tables_only.sql
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { Client } from 'pg';

const [, , command, arg] = process.argv;

const required = [
  'SUPABASE_DB_HOST',
  'SUPABASE_DB_USER',
  'SUPABASE_DB_PASSWORD',
];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`متغیرهای جاافتاده در .env: ${missing.join(', ')}`);
  process.exit(1);
}

if (!command || !arg) {
  console.error('استفاده: node scripts/db.mjs <query|run> <sql یا مسیر فایل>');
  process.exit(1);
}

const sql = command === 'run' ? readFileSync(arg, 'utf8') : arg;

const client = new Client({
  host: process.env.SUPABASE_DB_HOST,
  port: Number(process.env.SUPABASE_DB_PORT ?? 5432),
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME ?? 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

function lineOf(sqlText, position) {
  if (!position) return null;
  const before = sqlText.slice(0, Number(position));
  const line = before.split('\n').length;
  const column = before.length - before.lastIndexOf('\n');
  return `خط ${line}، ستون ${column}`;
}

try {
  client.on('notice', (n) => console.log(`   ℹ️  ${n.message}`));

  await client.connect();
  console.log('✅ متصل شد');

  const result = await client.query(sql);
  const results = Array.isArray(result) ? result : [result];

  results.forEach((r, i) => {
    if (r.rows?.length) {
      console.log(`\n— نتیجه ${i + 1}: ${r.command} (${r.rowCount} ردیف)`);
      console.table(r.rows);
    } else if (r.command) {
      console.log(`— ${i + 1}: ${r.command} OK`);
    }
  });

  console.log('\n✅ اجرا کامل شد');
} catch (err) {
  console.error('\n❌ خطا:', err.message);
  if (err.position) console.error('موقعیت:', lineOf(sql, err.position));
  if (err.detail) console.error('جزئیات:', err.detail);
  if (err.hint) console.error('راهنما:', err.hint);
  if (err.code) console.error('کد:', err.code);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
