# مهاجرت از Supabase به هم‌روش — برنامه و دستورالعمل

> وضعیت: **پیشنهاد، در انتظار تأیید**
> هدف: در پایان توسعه، داده‌ها از Supabase به Postgres هم‌روش منتقل شوند و پروژه
> بدون کاهش امکانات و با جداسازی کامل سه نقش، روی هم‌روش اجرا شود.

---

## ۱. خلاصه تصمیم

بکاپ گرفتن از دیتابیس Supabase و ریختن آن روی یک Postgres خالی **به‌تنهایی کافی نیست**.
فرانت‌اند با `@supabase/supabase-js` به سه سرویس جدا وصل می‌شود:

| سرویس Supabase | کاربرد در پروژه | با `pg_dump` منتقل می‌شود؟ |
|---|---|---|
| Postgres | جدول‌ها، داده، تریگرها | ✅ بله |
| Auth (GoTrue) | ورود ادمین | ❌ نه (کاربر و رمز در schema `auth`) |
| Realtime | فراخوان و سفارش زنده | ❌ نه (Publication و WebSocket) |
| Storage | تصاویر | ❌ نه (فعلاً استفاده نمی‌شود) |

بنابراین اگر تا روز مهاجرت روی Supabase-Auth و Supabase-Realtime سرمایه‌گذاری شود،
انتقال به هم‌روش یعنی **بازنویسی**، نه بکاپ و ریستور.

**تصمیم پیشنهادی:** از همین حالا یک لایهٔ API مال خودمان بسازیم و Supabase را فقط
به‌عنوان «یک Postgres» استفاده کنیم. در آن صورت روز مهاجرت:

```
pg_dump  →  pg_restore روی Postgres هم‌روش  →  تغییر DATABASE_URL  →  تمام
```

بدون تغییر در فرانت‌اند و بدون از دست رفتن قابلیت.

---

## ۲. وضعیت فعلی (اندازه‌گیری‌شده)

| مورد | مقدار |
|---|---|
| حجم دیتابیس | ۱۱ مگابایت |
| جدول‌های `public` | ۸ |
| کاربر Auth | ۱ (ادمین) |
| پرسنل | ۵ (۱ ادمین + ۴ ویتر) |
| Policyهای RLS | ۱۱ |
| دسته / آیتم منو / میز | ۴ / ۱۲ / ۱۰ |
| سفارش ثبت‌شده در DB | ۰ |
| تصاویر در Supabase Storage | ۰ (همه از `lh3.googleusercontent.com`) |
| افزونه‌های لازم | `pgcrypto` (برای `crypt`, `gen_salt`, `gen_random_bytes`) |

نکته: پلن رایگان Supabase محدودیت‌هایی دارد (حدود ۵۰۰MB دیتابیس، ۵GB پهنای باند،
خواب‌رفتن پروژه بعد از یک هفته بی‌استفادگی). حجم فعلی خیلی کم است، پس عجله‌ای نیست؛
اما وابستگی به Auth/Realtime است که مهاجرت را گران می‌کند.

### وضعیت کد (مهم)

- فقط احراز هویت ادمین واقعاً به Supabase وصل است.
- منو، میز، سفارش، فراخوان و ویترها در `localStorage` هستند.
- Realtime، QR میز (`/t/:token`) و ورود واقعی ویتر هنوز پیاده نشده‌اند.
- ورود ویتر هر PIN چهاررقمی را قبول می‌کند.

یعنی «تکمیل شدن» پروژه خودش شامل ساخت لایهٔ داده و سه نقش است. همان نقطه، بهترین
زمان برای گذاشتن API مال خودمان است.

---

## ۳. نقش‌ها و ماتریس دسترسی

سه نقش، سه محدودهٔ کاملاً جدا. مشتری حساب کاربری ندارد و فقط با توکن QR میز وارد می‌شود.

| قابلیت / مسیر API | مشتری (QR) | ویتر (کد + PIN) | ادمین (ایمیل + رمز) |
|---|:---:|:---:|:---:|
| `GET /api/public/menu` | ✅ | ✅ | ✅ |
| `POST /api/public/session` (توکن QR) | ✅ | ❌ | ❌ |
| `POST /api/public/calls` (فراخوان ویتر) | ✅ فقط میز خودش | ❌ | ❌ |
| `GET /api/public/session/me` | ✅ فقط نشست خودش | ❌ | ❌ |
| `GET /api/waiter/queue` | ❌ | ✅ | ❌ |
| `GET /api/waiter/tables` | ❌ | ✅ | ❌ |
| `POST /api/waiter/calls/:id/accept` | ❌ | ✅ | ❌ |
| `POST /api/waiter/orders` | ❌ | ✅ | ❌ |
| `GET /api/waiter/orders/:id` | ❌ | ✅ | ❌ |
| `GET/POST/PATCH/DELETE /api/admin/menu/*` | ❌ | ❌ | ✅ |
| `GET/POST/PATCH/DELETE /api/admin/staff/*` | ❌ | ❌ | ✅ |
| `GET/POST/DELETE /api/admin/tables/*` | ❌ | ❌ | ✅ |
| `GET/PATCH /api/admin/orders/*` | ❌ | ❌ | ✅ |
| `GET /api/admin/reports/*` | ❌ | ❌ | ✅ |

### قواعد اجرای دسترسی (سه لایه)

1. **UI (تجربه کاربری):** هر نقش فقط صفحه‌های خودش را می‌بیند. `GlobalModeBar` باید در
   production حذف شود؛ وگرنه هر کسی می‌تواند ظاهر نقش دیگر را باز کند.
2. **API (امنیت واقعی):** میان‌افزار `requireRole('waiter' | 'admin')` روی هر مسیر.
   نبود توکن = `401`، نقش اشتباه = `403`.
3. **دیتابیس (دفاع دوم):** API با کاربر محدود `vadoodian_api` وصل می‌شود؛ دسترسی
   عمومی به Postgres بسته است. در صورت نیاز، RLS با claimهای JWT هم فعال می‌شود.

قواعد کلیدی:

- **مشتری:** شناسهٔ میز هرگز از بدنهٔ درخواست خوانده نمی‌شود. توکن امضاشدهٔ سرور شامل
  `{ role: 'customer', table_id, session_id }` است و هر کوئری با همان محدود می‌شود.
  مشتری نمی‌تواند میز دیگر را ببیند یا سفارش بسازد.
- **ویتر:** JWT شامل `{ staff_id, role: 'waiter' }` است. ویتر فقط صف و میزهای عملیاتی
  را می‌بیند؛ به مدیریت منو/پرسنل دسترسی ندارد.
- **ادمین:** JWT شامل `{ staff_id, role: 'admin' }` و بررسی `is_active`. ادمین از
  مسیرهای `/api/admin/*` استفاده می‌کند، نه از مسیرهای ویتر.
- **نرخ تلاش ورود:** حداکثر ۵ تلاش ناموفق برای هر کد/IP در ۱۵ دقیقه (جدول `login_attempts`).

---

## ۴. معماری هدف

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  مشتری (QR)  │   │ ویتر (تبلت)  │   │ ادمین (PC)   │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       └──────────────────┼──────────────────┘
                          │ HTTPS + JWT
                 ┌────────▼─────────┐
                 │  API (Node/Express) │
                 │  Auth · Roles · SSE │
                 └────────┬─────────┘
                          │ آدرس داخلی (بدون اینترنت)
                 ┌────────▼─────────┐
                 │ Postgres هم‌روش  │
                 └──────────────────┘
```

- **بدون دسترسی مستقیم مرورگر به دیتابیس.**
- **Realtime:** تریگرهای `LISTEN/NOTIFY` + پخش SSE در اتاق‌های `waiters`، `admin`،
  `table:{id}`. اگر چند replica داشتیم، Redis بین آن‌ها پل می‌زند.
- **فرانت:** فقط `fetch` به API؛ حذف کامل `@supabase/supabase-js` از باندل.

---

## ۵. تغییرات اسکیما برای Postgres خالی

- حذف وابستگی به `auth`:
  - `staff.auth_user_id` و کلید خارجی به `auth.users` حذف شود.
  - ستون‌های `email text unique` و `password_hash text` به `staff` اضافه شود.
  - توابع `public.is_admin()` و `auth.uid()` و همهٔ Policyهای `*_admin_all` و
    `staff_select_self` حذف شوند (چون دسترسی از API انجام می‌شود).
- حذف بلوک `supabase_realtime` از مایگریشن‌ها و Publication.
- حذف `grant ... to anon, authenticated`؛ نقش `anon` دیگر معنا ندارد.
- افزودن جدول `login_attempts (code text, ip text, attempted_at timestamptz, success boolean)`.
- افزودن ایندکس روی `tables.qr_token` (از قبل unique است) و `staff.email`.
- `pgcrypto` روی مقصد نصب شود (`gen_salt`/`crypt` برای PIN ویتر).

مایگریشن‌های سازگار در پوشهٔ `supabase/migrations/hamravesh/` نگه داشته می‌شوند تا
نسخهٔ Supabase دست‌نخورده بماند.

---

## ۶. بکاپ از Supabase

### چه چیزی را برداریم؟

| مورد | روش |
|---|---|
| جدول‌ها، داده، تریگر، ایندکس | `pg_dump --schema=public` |
| کاربر ادمین | ساده‌تر: بعد از مهاجرت رمز را از نو بسازیم |
| هش رمز ادمین (اختیاری) | `select id, email, encrypted_password from auth.users` |
| تصاویر | لازم نیست؛ تصاویر در Storage نیستند |
| Realtime / Edge Functions | لازم نیست؛ در API خودمان بازسازی می‌شوند |

> نکته فنی: از **Session Pooler** (پورت ۵۴۳۲) بکاپ بگیرید. Transaction Pooler
> (پورت ۶۵۴۳) از `pg_dump` پشتیبانی نمی‌کند. اتصال Direct هم روی بعضی شبکه‌ها IPv6-only است.

### دستور بکاپ (PowerShell + Docker)

```powershell
$env:PGPASSWORD = "<SUPABASE_DB_PASSWORD>"
docker run --rm -e PGPASSWORD -v "${PWD}:/dump" postgres:17 `
  pg_dump `
  -h aws-1-eu-west-3.pooler.supabase.com -p 5432 `
  -U postgres.gdubpxedwbzwmesixkxl -d postgres `
  --schema=public --no-owner --no-privileges `
  -Fc -f /dump/vadoodian_public.dump
```

خروجی: `vadoodian_public.dump` (فرمت custom، فشرده).

### قبل از بکاپ

- نوشتن را متوقف کنید (حالت maintenance).
- شناسهٔ ادمین را بردارید تا در مقصد کلید خارجی خطا ندهد:
  ```sql
  select auth_user_id from public.staff where auth_user_id is not null;
  ```
- تعداد ردیف‌ها را ثبت کنید تا بعد از ریستور مقایسه شود:
  ```sql
  select 'categories' t, count(*) from categories
  union all select 'menu_items', count(*) from menu_items
  union all select 'tables', count(*) from tables
  union all select 'staff', count(*) from staff;
  ```

---

## ۷. بازگردانی روی هم‌روش

1. **ساخت دیتابیس:** در کنسول هم‌روش، Postgres مدیریت‌شده بسازید. برای پروداکشن
   «دسترسی عمومی» را بسته نگه دارید و از آدرس داخلی استفاده کنید.
2. **افزونه:**
   ```sql
   create extension if not exists pgcrypto;
   ```
3. **پل موقت برای وابستگی به `auth`:** چون دامپ `public` هنوز FK به `auth.users` دارد:
   ```sql
   create schema if not exists auth;
   create table if not exists auth.users (id uuid primary key);
   insert into auth.users (id) values ('<ADMIN_UUID>') on conflict do nothing;
   create or replace function auth.uid() returns uuid
     language sql stable as $$ select null::uuid $$;
   ```
4. **ریستور:**
   ```powershell
   $env:PGPASSWORD = "<HAMRAVESH_DB_PASSWORD>"
   docker run --rm -e PGPASSWORD -v "${PWD}:/dump" postgres:17 `
     pg_restore `
     -h <INTERNAL_HOST> -p 5432 -U <USER> -d <DB_NAME> `
     --no-owner --no-privileges `
     /dump/vadoodian_public.dump
   ```
5. **پاک‌سازی وابستگی‌های Supabase:**
   ```sql
   alter table public.staff drop constraint if exists staff_auth_user_id_fkey;
   drop schema auth cascade;   -- is_admin و policyهای وابسته هم حذف می‌شوند

   alter table public.staff
     add column if not exists email text,
     add column if not exists password_hash text;
   create unique index if not exists staff_email_key on public.staff (lower(email));
   ```
   سپس RLS را روی جدول‌ها خاموش کنید (دسترسی از API کنترل می‌شود) یا Policyهای
   سادهٔ مخصوص API بنویسید.
6. **ادمین اول:** رمز جدید را با bcrypt بسازید و در `staff.password_hash` بگذارید
   (اسکریپت `npm run admin:set-password`). اگر هش قبلی Supabase را برداشته‌اید،
   همان هش bcrypt قابل استفاده است.
7. **بررسی صحت:** تعداد ردیف‌ها باید با مرحلهٔ ۶ یکی باشد و `pgcrypto` نصب باشد.

---

## ۸. راه‌اندازی API و فرانت روی هم‌روش

| اپ | نوع | پورت | متغیرهای محیطی |
|---|---|---|---|
| `vadoodian-api` | منبع گیت (Dockerfile در `server/`) | ۸۰۸۰ | `DATABASE_URL` (آدرس داخلی)، `JWT_SECRET`، `CORS_ORIGIN` |
| `vadoodian-web` | منبع گیت (Dockerfile فعلی + nginx) | ۸۰ | `VITE_API_URL` به‌صورت **Build Argument** |

- دیتابیس و API در **یک namespace** باشند تا از آدرس داخلی استفاده شود.
- Health Check: API روی `/healthz`، وب روی `/healthz`.
- دامنه و SSL را از تنظیمات «آدرس دامنه» فعال کنید.
- برای SSE یک heartbeat هر ۲۵ ثانیه بفرستید تا پروکسی اتصال را نبندد.

---

## ۹. معیار پذیرش (تست امنیت نقش‌ها)

- [ ] مشتری با QR میز ۴، درخواست `/api/waiter/queue` بزند → `403`.
- [ ] مشتری با QR میز ۴، سفارش میز ۴ را ببیند ولی میز ۵ را نه.
- [ ] مشتری با QR جعلی → `401` و هیچ نشستی ساخته نشود.
- [ ] ویتر با PIN درست وارد شود؛ با PIN غلط بعد از ۵ تلاش قفل شود.
- [ ] ویتر به `/api/admin/menu` → `403`.
- [ ] ادمین منو/پرسنل/میز را مدیریت کند و تغییر بلافاصله در منوی مشتری دیده شود.
- [ ] فراخوان مشتری زیر ۲ ثانیه در صف ویتر ظاهر شود.
- [ ] رفرش صفحه در هر سه نقش، نشست را حفظ کند.
- [ ] قطع و وصل اینترنت بین‌الملل، اثری روی کار داخل کافه نداشته باشد.

---

## ۱۰. بکاپ بعد از مهاجرت

- فعال‌کردن **PITR** روی Postgres مدیریت‌شده هم‌روش.
- یک `pg_dump` روزانه با cron/اپ زمان‌بندی‌شده و آپلود به **Object Storage** هم‌روش
  (S3-compatible) برای نسخهٔ خارج از سرور.
- نگهداری ۷ نسخهٔ روزانه + ۴ نسخهٔ هفتگی.

---

## ۱۱. ریسک‌ها و نکات

| ریسک | راه‌حل |
|---|---|
| خواب‌رفتن پروژهٔ رایگان Supabase | مهاجرت در بازهٔ آرام؛ بکاپ تازه |
| ناسازگاری `pg_dump` با Transaction Pooler | استفاده از Session Pooler |
| خطای FK به `auth.users` هنگام ریستور | پل موقت `auth` + شناسهٔ ادمین |
| از کار افتادن هش bcrypt | تست ورود بعد از ریستور؛ در صورت نیاز ریست رمز |
| قطع SSE توسط پروکسی | heartbeat و reconnect خودکار |
| چند replica API | یک replica، یا Redis Pub/Sub |
| نشت رمز دیتابیس | چرخش رمز، کاربر جدا برای API، `.env` خارج از گیت |

---

## ۱۲. گام‌های بعدی پیشنهادی

1. تأیید این معماری.
2. ساخت `server/` (Express + `pg` + JWT + bcrypt + SSE) و اجرای آن روی همان دیتابیس Supabase.
3. انتقال `AppContext` از `localStorage` به API؛ ساخت `/t/:token` و ورود واقعی ویتر.
4. حذف `@supabase/supabase-js` از فرانت.
5. نوشتن مایگریشن‌های `hamravesh/` و اسکریپت‌های `db:dump` / `db:restore`.
6. تمرین مهاجرت روی یک دیتابیس تستی، سپس مهاجرت واقعی.
