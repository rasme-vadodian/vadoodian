// بکاپ کامل داده‌های Supabase (schema: public) به‌صورت SQL + JSON
// استفاده: npm run backup
// خروجی: پوشه backups/
import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { Client } from 'pg';

const outDir = 'backups';
mkdirSync(outDir, { recursive: true });

const client = new Client({
  host: process.env.SUPABASE_DB_HOST,
  port: Number(process.env.SUPABASE_DB_PORT ?? 5432),
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME ?? 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
});

const qi = (name) => '"' + String(name).replace(/"/g, '""') + '"';
const ql = (value) => "'" + String(value).replace(/'/g, "''") + "'";

const numericTypes = new Set([
  'int2', 'int4', 'int8', 'numeric', 'float4', 'float8', 'oid',
]);

function literal(value, udt) {
  if (value === null || value === undefined) return 'NULL';
  if (Buffer.isBuffer(value)) return `'\\x${value.toString('hex')}'::bytea`;
  if (Array.isArray(value)) {
    return 'ARRAY[' + value.map((v) => literal(v)).join(', ') + ']';
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (value instanceof Date) return ql(value.toISOString());
  if (typeof value === 'object') {
    return ql(JSON.stringify(value)) + (udt === 'json' || udt === 'jsonb' ? `::${udt}` : '');
  }
  if (numericTypes.has(udt)) {
    return /^-?\d+(\.\d+)?$/.test(String(value)) ? String(value) : ql(value);
  }
  return ql(value);
}

try {
  await client.connect();
  console.log('✅ اتصال به دیتابیس برقرار شد');

  const tables = (
    await client.query(`
      select c.relname as table_name
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r'
      order by c.relname
    `)
  ).rows.map((r) => r.table_name);

  const columns = (
    await client.query(`
      select table_name, column_name, udt_name, is_generated, is_identity
      from information_schema.columns
      where table_schema = 'public'
      order by table_name, ordinal_position
    `)
  ).rows;

  const columnsByTable = new Map();
  for (const col of columns) {
    if (!columnsByTable.has(col.table_name)) columnsByTable.set(col.table_name, []);
    columnsByTable.get(col.table_name).push(col);
  }

  const foreignKeys = (
    await client.query(`
      select tc.table_name as child, ccu.table_name as parent
      from information_schema.table_constraints tc
      join information_schema.constraint_column_usage ccu
        on ccu.constraint_name = tc.constraint_name
       and ccu.table_schema = tc.table_schema
      where tc.constraint_type = 'FOREIGN KEY' and tc.table_schema = 'public'
    `)
  ).rows;

  // مرتب‌سازی جداول بر اساس وابستگی کلید خارجی (والد قبل از فرزند)
  const deps = new Map(tables.map((t) => [t, new Set()]));
  for (const { child, parent } of foreignKeys) {
    if (deps.has(child) && deps.has(parent) && child !== parent) {
      deps.get(child).add(parent);
    }
  }
  const order = [];
  const seen = new Set();
  const inProgress = new Set();
  const visit = (table) => {
    if (seen.has(table)) return;
    if (inProgress.has(table)) return; // جلوگیری از حلقه
    inProgress.add(table);
    for (const parent of deps.get(table) ?? []) visit(parent);
    inProgress.delete(table);
    seen.add(table);
    order.push(table);
  };
  tables.forEach(visit);
  for (const t of tables) if (!seen.has(t)) order.push(t);

  const jsonDump = {};
  const sqlLines = [
    `-- بکاپ داده‌های ودودیان`,
    `-- تاریخ: ${new Date().toISOString()}`,
    `-- دیتابیس: ${process.env.SUPABASE_DB_HOST}`,
    `-- این فایل «داده» است؛ ساختار جدول‌ها در پوشه supabase/migrations نگهداری می‌شود.`,
    `SET client_encoding = 'UTF8';`,
    `SET standard_conforming_strings = on;`,
    `BEGIN;`,
    ``,
  ];

  const counts = {};

  for (const table of order) {
    const cols = (columnsByTable.get(table) ?? []).filter((c) => c.is_generated !== 'ALWAYS');
    if (!cols.length) continue;

    const rows = (await client.query(`select * from public.${qi(table)}`)).rows;
    counts[table] = rows.length;
    jsonDump[table] = rows;
    if (!rows.length) continue;

    const hasAlwaysIdentity = cols.some((c) => c.is_identity === 'YES');
    const override = hasAlwaysIdentity ? ' OVERRIDING SYSTEM VALUE' : '';
    const columnList = cols.map((c) => qi(c.column_name)).join(', ');

    sqlLines.push(`-- ${table}: ${rows.length} ردیف`);
    for (const row of rows) {
      const values = cols.map((c) => literal(row[c.column_name], c.udt_name));
      sqlLines.push(
        `INSERT INTO public.${qi(table)} (${columnList})${override} VALUES (${values.join(', ')});`
      );
    }
    sqlLines.push('');
  }

  sqlLines.push('COMMIT;', '');

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const sqlPath = `${outDir}/vadoodian-data-${stamp}.sql`;
  const jsonPath = `${outDir}/vadoodian-data-${stamp}.json`;
  writeFileSync(sqlPath, sqlLines.join('\n'), 'utf8');
  writeFileSync(jsonPath, JSON.stringify(jsonDump, null, 2), 'utf8');

  // کاربران ادمین (جدول auth.users) — حاوی هش رمز است
  let authNote = '';
  try {
    const users = (
      await client.query(`
        select id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data
        from auth.users
        order by created_at
      `)
    ).rows;
    writeFileSync(
      `${outDir}/auth-users-${stamp}.json`,
      JSON.stringify(users, null, 2),
      'utf8'
    );
    authNote = `${users.length} کاربر Auth ذخیره شد (فایل محرمانه)`;
  } catch (err) {
    authNote = `دسترسی به auth.users نبود: ${err.message}`;
  }

  console.log('\n📦 نتیجه بکاپ:');
  console.table(counts);
  console.log(`\n- ${sqlPath}  (قابل اجرا با psql)`);
  console.log(`- ${jsonPath}  (نسخه خوانا/JSON)`);
  console.log(`- auth: ${authNote}`);
  console.log('\n✅ بکاپ کامل شد. پوشه backups/ داخل گیت نمی‌رود.');
} catch (error) {
  console.error('\n❌ خطا:', error.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
