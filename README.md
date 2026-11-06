# سامانه مدیریت کافه و رستوران ودودیان (Vadoodian)

> سامانه مدرن، بلادرنگ (Real-time) و یکپارچه مدیریت سالن، فراخوان ویتر، ثبت سفارش و مانیتورینگ سفارشات برای کافه و رستوران، پیاده‌سازی شده با **React 19** و **Supabase**.

---

## ۱. نمای کلی و اهداف پروژه

پروژه **ودودیان** یک راهکار نرم‌افزاری تحت وب برای بهبود سرعت و کیفیت خدمات‌رسانی در سالن کافه/رستوران است. این سیستم سه نقش کاربری مجزا را با کمترین اصطکاک به یکدیگر متصل می‌کند:

1. **مشتری (Guest / Customer):**
   - بدون نیاز به نصب اپلیکیشن یا ورود به سیستم (No Login).
   - دسترسی سریع با اسکن کد QR اختصاصی روی هر میز (`/t/:qrToken`).
   - مشاهده منوی دیجیتال تعاملی، جزئیات آیتم‌ها، داستان و ترکیبات محصولات.
   - ثبت مستقیم فراخوان ویتر (Call Waiter) بدون سبد خرید مستقیم (سفارش نهایی در سالن توسط ویتر ثبت می‌شود).
2. **ویتر / سالن‌کار (Waiter Workspace):**
   - ورود سریع با کد پرسنلی و پین ۴ رقمی (PIN Login) طراحی‌شده برای تبلت و موبایل.
   - مانیتورینگ زنده میزهای سالن و صف نوتیفیکیشن فراخوان‌ها.
   - ثبت سفارش سر میز، انتخاب اقلام منو، ثبت یادداشت و ارسال مستقیم به آشپزخانه/بار.
   - مدیریت چرخه فیش‌ها و بستن حساب/آزادسازی میز.
3. **مدیر سالن / صندوق (Admin Dashboard):**
   - ورود امن با احراز هویت اختصاصی Supabase Auth.
   - مانیتورینگ زنده وضعیت میزها (آزاد، در حال سفارش، فراخوان ویتر، درخواست صورت‌حساب).
   - بورد مدیریت فیش‌های سفارش با چرخه وضعیت مرحله‌به‌مرحله.
   - مدیریت کاتالوگ منو (دسته‌بندی‌ها، قیمت‌ها، موجودی اقلام).
   - مدیریت پرسنل و پین‌ها، و آمار عملکرد سفارشات.

---

## ۲. پشته فناوری (Tech Stack)

| لایه | تکنولوژی | توضیحات |
|---|---|---|
| **Frontend Framework** | **React 19** + **TypeScript** | رندرینگ سریع، تایپ‌های دقیق و مدرن |
| **Build Tool / Bundler** | **Vite 8** | بیلد سریع با بهینه‌سازی کدهای فرانت‌اند |
| **Styling** | **Tailwind CSS v4** | استایل‌دهی مدرن Utility-first، پشتیبانی کامل از راست‌به‌چپ (`dir="rtl"`) |
| **UI Components & Icons** | **Lucide React** + **Google Material Symbols** | آیکون‌های استاندارد و هماهنگ |
| **Animations** | **Motion** (Framer Motion v12) | انیمیشن‌های روان برای کارت‌ها، مودال‌ها و نوتیفیکیشن‌ها |
| **Backend & Database** | **Supabase** (PostgreSQL 15+) | پایگاه داده رابطه‌ای، توابع RPC، اعلان‌های Realtime و Auth |
| **Security & Policies** | **PostgreSQL RLS (Row Level Security)** | امنیت داده در سطح رکوردها و تفکیک دسترسی مشتری، ویتر و ادمین |
| **Database Tooling** | **pg (node-postgres)** + **tsx** | اسکریپت‌های مدیریت مستقیم مایگریشن‌ها و Seed اولیه دیتابیس |

---

## ۳. ساختار پوشه‌ها و فایل‌ها (Folder Structure)

```text
vadoodian-main/
├── docs/                       # مستندات جامع معماری و هوش مصنوعی
│   ├── architecture.md         # معماری کلاینت، جریان داده، جریان نقش‌ها و کامپوننت‌ها
│   ├── database-schema.md      # جزئیات کامل جداول، ایندکس‌ها، تریگرها، RLS و RPCها
│   └── DEPLOY-HAMRAVESH.md     # راهنمای دپلوی و استقرار سرور روی هم‌روش
├── public/                     # فایل‌های استاتیک و آیکون‌ها
├── scripts/                    # اسکریپت‌های سیستمی و مدیریتی Node.js
│   ├── admin.mjs               # ابزار CLI ساخت و ارتقای کاربر ادمین در Supabase
│   ├── db.mjs                  # ابزار CLI اجرای اسکریپت‌ها و مایگریشن‌های SQL
│   └── seed.ts                 # اسکریپت انتقال داده‌های منوی اولیه به دیتابیس
├── src/                        # سورس کد فرانت‌اند
│   ├── components/             # کامپوننت‌های رابط کاربری به تفکیک نقش
│   │   ├── admin/              # پنل مدیریت (میزها، سفارش‌ها، منو، پرسنل)
│   │   ├── common/             # کامپوننت‌های عمومی (صفحه لندینگ، نوار تغییر مود)
│   │   ├── customer/           # منوی مشتری و نمایش جزئیات آیتم
│   │   └── waiter/             # لاگین پین، ثبت سفارش و کارتابل ویتر
│   ├── context/                # کانتکست‌های سراسری وضعیت اپلیکیشن (AppContext)
│   ├── data/                   # داده‌های موک و کاتالوگ اولیه منو (initialData.ts)
│   ├── shared/                 # ماژول‌های مشترک و هسته زیرساختی
│   │   ├── api/                # لایه ارتباط با دیتابیس Supabase و مپرهای داده
│   │   │   ├── admin.ts        # متدهای ارتباطی پنل مدیریت
│   │   │   ├── customer.ts     # متدهای ارتباطی سمت مشتری و خواندن نشست
│   │   │   ├── waiter.ts       # متدهای سالن‌کار (لاگین پین، ثبت فیش، فراخوان)
│   │   │   ├── menu.ts         # دریافت و دسته‌بندی منو
│   │   │   ├── mappers.ts      # تبدیل ساختار دیتابیس (snake_case) به UI (camelCase)
│   │   │   └── supabase.ts     # اینستنس کلاینت Supabase در مرورگر
│   │   ├── auth/               # توابع بررسی نشست و احراز هویت
│   │   ├── realtime/           # مدیریت کانال Realtime و همگام‌سازی تابلو
│   │   └── router.ts           # روتر سبک مبتنی بر HTML5 History API
│   ├── types/                  # تعاریف تایپ‌های جامع سامانه (index.ts)
│   ├── App.tsx                 # کامپوننت ریشه و راه‌اندازی روت‌ها و گیت‌های نقشی
│   ├── index.css               # استایل‌های سراسری، فونت‌ها و پیکربندی Tailwind
│   └── main.tsx                # نقطه ورود React و رندر اولیه برنامه
├── supabase/                   # مایگریشن‌ها و تست‌های دیتابیس
│   ├── migrations/             # اسکریپت‌های رسمی SQL مایگریشن
│   │   ├── 0001_init.sql       # ایجاد ساختار پایه جداول، اینام‌ها و RLS
│   │   ├── 0002_orders_guards_realtime.sql # فیش سفارش، تریگر وضعیت و Realtime
│   │   ├── 0003_admin_auth.sql # احراز هویت ادمین با Supabase Auth
│   │   ├── 0004_drop_table_section.sql     # پاکسازی فیلدهای اضافه
│   │   └── 0005_sessions_qr_orders.sql     # نشست QR، توکن ویتر، لاگین پین و RPCها
│   └── tests/                  # اسکریپت‌های اعتبارسنجی و تست مایگریشن‌ها
├── index.html                  # فایل اصلی HTML و متاتگ‌های نمایش موبایل
├── package.json                # وابستگی‌ها و اسکریپت‌های npm
├── tsconfig.json               # تنظیمات کامپایلر TypeScript
└── vite.config.ts              # تنظیمات بیلد و پلاگین‌های Vite
```

---

## ۴. راه‌اندازی و اجرای محلی (Local Development)

### پیش‌نیازها
- **Node.js**: نسخه 20 به بالا
- **npm**: نسخه 10 به بالا
- **یک پروژه فعال در Supabase** (یا اینستنس لوکال Supabase CLI)

### گام ۱: دریافت وابستگی‌ها
در ترمینال، دستور زیر را اجرا کنید:
```bash
npm install
```

### گام ۲: تنظیم متغیرهای محیطی (`.env`)
یک فایل به نام `.env` در ریشه پروژه ایجاد کرده و مقادیر پروژه Supabase خود را در آن قرار دهید:

```env
# تنظیمات فرانت‌اند (برای اتصال مرورگر به Supabase)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# تنظیمات اسکریپت‌های سیستمی و مایگریشن مستقیم (db.mjs و seed.ts)
SUPABASE_DB_HOST=aws-0-eu-central-1.pooler.supabase.com
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres.your-project-id
SUPABASE_DB_PASSWORD=your-database-password
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### گام ۳: اجرای مایگریشن‌های دیتابیس
برای اعمال ساختار جداول، ایندکس‌ها، تریگرها و توابع RPC روی Supabase:
```bash
node scripts/db.mjs run supabase/migrations/0001_init.sql
node scripts/db.mjs run supabase/migrations/0002_orders_guards_realtime.sql
node scripts/db.mjs run supabase/migrations/0003_admin_auth.sql
node scripts/db.mjs run supabase/migrations/0004_drop_table_section.sql
node scripts/db.mjs run supabase/migrations/0005_sessions_qr_orders.sql
```

### گام ۴: تزریق داده‌های منو (Seed Data)
جهت بارگذاری دسته‌بندی‌ها و اقلام منوی نمونه در پایگاه داده:
```bash
npm run seed
```

### گام ۵: ساخت کاربر مدیر (Admin)
برای ساخت اکانت ادمین جدید یا ارتقای یک کاربر موجود به نقش مدیریت:
```bash
# ایجاد مستقیم ادمین جدید با اسکریپت:
node scripts/admin.mjs create "مدیر اصلی" admin@example.com "YourSecurePassword123"

# یا در صورتی که کاربر قبلاً در بخش Auth ثبت شده است:
node scripts/admin.mjs promote admin@example.com "مدیر اصلی"
```

### گام ۶: اجرای سرور توسعه فرانت‌اند
```bash
npm run dev
```
برنامه به صورت پیش‌فرض روی آدرس زیر در دسترس خواهد بود:
```text
http://localhost:3000
```

---

## ۵. اسکریپت‌های موجود در پروژه

| اسکریپت | دستور | توضیحات |
|---|---|---|
| اجرای محیط توسعه | `npm run dev` | اجرای Vite با هات‌لودینگ روی پورت 3000 |
| بیلد پروداکشن | `npm run build` | بررسی تایپ‌ها و کامپایل به پوشه `dist/` |
| پیش‌نمایش بیلد | `npm run preview` | پیش‌نمایش نسخه کامپایل‌شده |
| بررسی خطاهای تایپ | `npm run lint` | بررسی استاتیک کد بدون کامپایل (`tsc --noEmit`) |
| سید اولیه منو | `npm run seed` | انتقال داده‌های اولیه به جداول Supabase |
| ابزار مدیریت دیتابیس | `npm run db` | اتصال مستقیم و اجرای دستورات SQL |
| ساخت کاربر ادمین | `npm run admin:create` | ساخت اکانت ادمین در Supabase Auth و جدول پرسنل |
| ارتقا به نقش ادمین | `npm run admin:promote` | انتساب نقش `admin` به ایمیل موجود در دیتابیس |

---

## ۶. ارجاع به اسناد تخصصی معماری

برای مطالعه جزئیات عمیق‌تر نرم‌افزار و دیتابیس، به فایل‌های موجود در پوشه `docs/` مراجعه کنید:

- **[معماری نرم‌افزار و جریان کلاینت (`docs/architecture.md`)](./docs/architecture.md):**
  تحلیل ارتباطات فرانت‌اند با Supabase، سیستم روتر، مدیریت استیت و تفکیک لایه‌های نقشی.
- **[معماری و اسکیمای پایگاه داده (`docs/database-schema.md`)](./docs/database-schema.md):**
  طراحی کامل جداول، کلیدها، انواع اینام‌ها، تریگرهای اعتبارسنجی وضعیت، سیاست‌های امنیتی RLS و لیست کامل توابع RPC.
- **[راهنمای استقرار در هم‌روش (`docs/DEPLOY-HAMRAVESH.md`)](./docs/DEPLOY-HAMRAVESH.md):**
  دستورالعمل‌های مرحله‌به‌مرحله دپلوی پروژه روی بستر ابری PaaS هم‌روش.
