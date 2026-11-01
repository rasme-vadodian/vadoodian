// انتقال داده‌های دموی initialData.ts به دیتابیس Supabase
// اجرا: npx tsx scripts/seed.ts
import 'dotenv/config';
import { Client } from 'pg';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_WAITERS,
  INITIAL_TABLES,
} from '../src/data/initialData';

const PERSIAN = '۰۱۲۳۴۵۶۷۸۹';
const toLatin = (value: string) =>
  value.replace(/[۰-۹]/g, (d) => String(PERSIAN.indexOf(d)));

// نگاشت وضعیت‌های UI به enum دیتابیس
const TABLE_STATUS: Record<string, string> = {
  available: 'free',
  occupied: 'active',
  calling_waiter: 'calling',
  in_preparation: 'active',
};

const client = new Client({
  host: process.env.SUPABASE_DB_HOST,
  port: Number(process.env.SUPABASE_DB_PORT ?? 5432),
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME ?? 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function main() {
  await client.connect();
  console.log('✅ متصل شد\n');
  await client.query('begin');

  // ---------- دسته‌بندی‌ها ----------
  const categoryIds = new Map<string, string>();
  for (const c of INITIAL_CATEGORIES) {
    const { rows } = await client.query(
      `insert into public.categories (slug, name, icon, sort_order, is_active)
       values ($1, $2, $3, $4, $5)
       on conflict (slug) do update
         set name = excluded.name,
             icon = excluded.icon,
             sort_order = excluded.sort_order,
             is_active = excluded.is_active
       returning id`,
      [c.id, c.name, c.icon, c.order, c.isActive]
    );
    categoryIds.set(c.id, rows[0].id);
  }
  console.log(`— دسته‌بندی‌ها: ${categoryIds.size}`);

  // ---------- محصولات ----------
  let productCount = 0;
  for (const p of INITIAL_PRODUCTS) {
    const categoryId = categoryIds.get(p.category);
    if (!categoryId) {
      console.warn(`  ⚠️ دسته‌ی «${p.category}» برای ${p.code} پیدا نشد — رد شد`);
      continue;
    }
    await client.query(
      `insert into public.menu_items
         (code, name, category_id, price, ingredients, story, image_url,
          is_available, is_featured, show_in_qr)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       on conflict (code) do update
         set name = excluded.name,
             category_id = excluded.category_id,
             price = excluded.price,
             ingredients = excluded.ingredients,
             story = excluded.story,
             image_url = excluded.image_url,
             is_available = excluded.is_available,
             is_featured = excluded.is_featured,
             show_in_qr = excluded.show_in_qr`,
      [
        p.code,
        p.name,
        categoryId,
        p.price,
        p.ingredients,
        p.story,
        p.image || null,
        p.isAvailable,
        p.isFeatured,
        p.showInQR,
      ]
    );
    productCount++;
  }
  console.log(`— محصولات: ${productCount}`);

  // ---------- میزها ----------
  let tableCount = 0;
  for (const t of INITIAL_TABLES) {
    // on conflict do nothing تا وضعیت زنده‌ی میزها در اجرای دوباره بازنویسی نشود
    const { rowCount } = await client.query(
      `insert into public.tables (number, capacity, section, status)
       values ($1, $2, $3, $4)
       on conflict (number) do nothing`,
      [t.id, t.capacity, t.section, TABLE_STATUS[t.status] ?? 'free']
    );
    tableCount += rowCount ?? 0;
  }
  console.log(`— میزها: ${tableCount} جدید (بقیه از قبل بودند)`);

  // ---------- پرسنل ----------
  let staffCount = 0;
  for (const w of INITIAL_WAITERS) {
    const code = toLatin(w.code);
    // pin_hash فقط هنگام درج ست می‌شود؛ seed دوباره پین‌ها را ریست نمی‌کند
    const { rowCount } = await client.query(
      `insert into public.staff (full_name, code, role, pin_hash, shift)
       values ($1, $2, 'waiter', crypt($3, gen_salt('bf', 10)), $4)
       on conflict (code) do update
         set full_name = excluded.full_name,
             shift = excluded.shift`,
      [w.name, code, w.pin, w.shift]
    );
    staffCount += rowCount ?? 0;
  }
  console.log(`— پرسنل: ${staffCount} درج/بروزرسانی (کدها به رقم لاتین تبدیل شدند)`);

  await client.query('commit');
  console.log('\n✅ seed کامل شد');

  const { rows } = await client.query(`
    select 'categories' as t, count(*)::int as n from public.categories
    union all select 'menu_items', count(*)::int from public.menu_items
    union all select 'tables', count(*)::int from public.tables
    union all select 'staff', count(*)::int from public.staff
  `);
  console.table(rows);
}

main()
  .catch(async (err) => {
    console.error('\n❌ خطا:', err.message);
    await client.query('rollback').catch(() => {});
    process.exitCode = 1;
  })
  .finally(() => client.end().catch(() => {}));
