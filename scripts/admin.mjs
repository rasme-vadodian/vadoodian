// ساخت یا ارتقای ادمین اصلی
//
// ساخت کاربر جدید (نیازمند SUPABASE_SERVICE_ROLE_KEY در .env):
//   npm run admin:create -- admin@vadoodian.com "MyPass123" "مدیر اصلی" ADMIN
//
// ارتقای کاربری که قبلاً در داشبورد Supabase ساخته‌اید:
//   npm run admin:promote -- admin@vadoodian.com "مدیر اصلی" ADMIN
import 'dotenv/config';
import { Client } from 'pg';

const [, , command, ...args] = process.argv;

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

const USAGE = `
استفاده:
  node scripts/admin.mjs create  <email> <password> "<full_name>" [code]
  node scripts/admin.mjs promote <email> "<full_name>" [code]

نمونه:
  npm run admin:create -- admin@vadoodian.com "MyPass123" "مدیر اصلی" ADMIN
  npm run admin:promote -- admin@vadoodian.com "مدیر اصلی" ADMIN
`.trim();

function fail(message) {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

function openDb() {
  const required = ['SUPABASE_DB_HOST', 'SUPABASE_DB_USER', 'SUPABASE_DB_PASSWORD'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) fail(`متغیرهای جاافتاده در .env: ${missing.join(', ')}`);

  return new Client({
    host: process.env.SUPABASE_DB_HOST,
    port: Number(process.env.SUPABASE_DB_PORT ?? 5432),
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    database: process.env.SUPABASE_DB_NAME ?? 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
}

async function adminApi(path, options = {}) {
  if (!SUPABASE_URL) fail('VITE_SUPABASE_URL در .env تنظیم نشده است.');
  if (!SERVICE_KEY) {
    fail('برای ساخت کاربر، SUPABASE_SERVICE_ROLE_KEY را در .env بگذارید.');
  }

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const raw = await response.text();
  let body = null;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = raw;
  }

  return { response, body };
}

function apiMessage(body, fallback) {
  if (!body) return fallback;
  if (typeof body === 'string') return body;
  return body.msg || body.message || body.error_description || body.error || fallback;
}

async function findAuthUserByEmail(email) {
  for (let page = 1; page <= 50; page++) {
    const { response, body } = await adminApi(
      `/auth/v1/admin/users?page=${page}&per_page=200`
    );
    if (!response.ok) {
      fail(`دریافت فهرست کاربران ناموفق بود: ${apiMessage(body, `HTTP ${response.status}`)}`);
    }

    const users = body?.users ?? [];
    const found = users.find(
      (user) => (user.email || '').toLowerCase() === email.toLowerCase()
    );
    if (found) return found;
    if (users.length < 200) return null;
  }
  return null;
}

async function createOrUpdateAuthUser(email, password, fullName) {
  const { response, body } = await adminApi('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });

  if (response.ok && body?.id) return body;

  const message = apiMessage(body, `HTTP ${response.status}`);
  const alreadyExists =
    response.status === 422 || /already|exists|registered/i.test(message);

  if (!alreadyExists) fail(`ساخت کاربر Auth ناموفق بود: ${message}`);

  const existing = await findAuthUserByEmail(email);
  if (!existing) fail(`کاربری با ایمیل ${email} پیدا نشد.`);

  const update = await adminApi(`/auth/v1/admin/users/${existing.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });

  if (!update.response.ok) {
    fail(`به‌روزرسانی رمز کاربر موجود ناموفق بود: ${apiMessage(update.body, `HTTP ${update.response.status}`)}`);
  }

  return update.body?.id ? update.body : existing;
}

async function linkAdminStaff(client, userId, email, fullName, code) {
  const existing = await client.query(
    'select id from public.staff where auth_user_id = $1',
    [userId]
  );

  if (existing.rowCount) {
    await client.query(
      `update public.staff
          set full_name = $2,
              role = 'admin',
              is_active = true,
              code = coalesce(nullif($3, ''), code)
        where auth_user_id = $1`,
      [userId, fullName, code || '']
    );
    return 'به‌روزرسانی شد';
  }

  const desiredCode = (code || email.split('@')[0] || 'ADMIN').toUpperCase();
  const conflict = await client.query(
    'select auth_user_id from public.staff where code = $1',
    [desiredCode]
  );

  if (conflict.rowCount) {
    fail(
      `کد پرسنلی «${desiredCode}» قبلاً استفاده شده است. یک کد دیگر به‌عنوان آرگومان آخر بدهید.`
    );
  }

  await client.query(
    `insert into public.staff (auth_user_id, full_name, code, role, is_active)
     values ($1, $2, $3, 'admin', true)`,
    [userId, fullName, desiredCode]
  );
  return 'ساخته شد';
}

async function main() {
  if (!command || !['create', 'promote'].includes(command)) {
    console.log(USAGE);
    process.exit(1);
  }

  const [email, second, third, fourth] = args;

  if (command === 'create') {
    const password = second;
    const fullName = third;
    const code = fourth;

    if (!email || !password || !fullName) {
      console.log(USAGE);
      process.exit(1);
    }
    if (password.length < 6) fail('رمز عبور باید حداقل ۶ کاراکتر باشد.');

    const client = openDb();
    await client.connect();
    try {
      console.log(`— ساخت/به‌روزرسانی کاربر Auth: ${email}`);
      const user = await createOrUpdateAuthUser(email, password, fullName);

      console.log(`— اتصال به staff و تعیین نقش admin (UUID: ${user.id})`);
      const result = await linkAdminStaff(client, user.id, email, fullName, code);

      const { rows } = await client.query(
        `select full_name, code, role, is_active
           from public.staff
          where auth_user_id = $1`,
        [user.id]
      );

      console.log(`\n✅ ادمین ${result}`);
      console.table(rows);
      console.log(`\nحالا با ایمیل ${email} و رمز واردشده به پنل مدیریت وارد شوید.`);
    } finally {
      await client.end().catch(() => {});
    }
    return;
  }

  // promote
  const fullName = second;
  const code = third;

  if (!email || !fullName) {
    console.log(USAGE);
    process.exit(1);
  }

  const client = openDb();
  await client.connect();
  try {
    const { rows } = await client.query(
      'select id from auth.users where lower(email) = lower($1) limit 1',
      [email]
    );

    if (!rows.length) {
      fail(
        `کاربری با ایمیل ${email} در auth.users وجود ندارد.\n` +
          'اول در داشبورد Supabase → Authentication → Users → Add user بسازید، سپس همین دستور را دوباره اجرا کنید.'
      );
    }

    const result = await linkAdminStaff(client, rows[0].id, email, fullName, code);

    const { rows: adminRows } = await client.query(
      `select full_name, code, role, is_active
         from public.staff
        where auth_user_id = $1`,
      [rows[0].id]
    );

    console.log(`\n✅ ادمین ${result}`);
    console.table(adminRows);
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((error) => {
  console.error('\n❌ خطا:', error.message);
  process.exitCode = 1;
});
