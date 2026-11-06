# معماری جامع نرم‌افزار ودودیان (Architecture & Client Design)

> این سند مرجع رسمی تصمیم‌گیری‌های فنی، مهندسی نرم‌افزار، لایه‌بندی فرانت‌اند و نحوه ارتباط با پایگاه داده است. این فایل به صورت ویژه برای مدل‌های هوش مصنوعی (AI-Friendly) و نگهداشت آسان توسعه‌دهندگان طراحی شده است.

---

## ۱. اصول بنیادین و پارادایم سیستم

سیستم مدیریت سفارشات و سالن ودودیان بر پایه ۴ اصل مهندسی استوار است:

1. **مدل سه‌نقشی کاملاً مجزا (Strict Role Segregation):**
   - **مشتری (Guest / Customer):** بدون حساب کاربری و کلمه عبور. ورود صرفاً از طریق توکن تصادفی میز (`/t/:qrToken`). دسترسی کاملاً خواندنی به منو و ثبت رویداد فراخوان ویتر.
   - **ویتر (Waiter / Floor Staff):** ورود بدون حساب ایمیلی Supabase Auth. لاگین از طریق `code + PIN` و دریافت توکن نشست اختصاصی در جدول `staff_sessions`. ثبت سفارش سر میز، تغییر وضعیت فیش و آزادسازی میز.
   - **مدیر (Admin / Cashier):** ورود رسمی با ایمیل و پسورد در **Supabase Auth**. احراز هویت مضاعف با رکورد فعال در جدول `public.staff` و دسترسی کامل به مانیتورینگ سالن، منو، فیش‌ها و عملکرد پرسنل.

2. **الگوی امنیتی RPC-First (Zero Direct Access for Public):**
   - به هیچ عنوان به مشتری و ویتر دسترسی مستقیم خواندن یا نوشتن روی جداول حساس داده نمی‌شود (`anon` اجازه `select/insert/update/delete` روی جداول `tables`, `orders`, `guest_requests` ندارد).
   - تمام تراکنش‌های بیزینسی از طریق توابع رویه‌ای ذخیره‌شده با دسترسی امنیتی بالا (`SECURITY DEFINER` RPC) کنترل و اعتبارسنجی می‌شوند.

3. **جلوگیری از تداخل نشست‌های میز (`table_sessions`):**
   - یک میز فیزیکی در طول روز بارها خالی و پر می‌شود.
   - شناسه میز ثابت است اما مهمانان با یکدیگر متفاوتند. تمام فیش‌ها، درخواست‌ها و زمان‌بندی‌ها به نشست فعال (`table_sessions` با وضعیت `open`) متصل می‌شوند.
   - بستن حساب میز (`close_table`) نشست را مختومه و میز را برای گروه بعدی آزاد می‌کند.

4. **عدم وجود سبد خرید مستقیم برای مشتری (No Customer Direct Cart):**
   - برای کاهش خطای ثبت سفارش، مشتری مستقیماً فیش صادر نمی‌کند؛ بلکه اقلام منو را مشاهده کرده و با زدن دکمه «فراخوان ویتر»، سالن‌کار را به میز فرا می‌خواند تا ثبت نهایی در حضور مشتری انجام شود.

---

## ۲. نحوه ارتباط فرانت‌اند با بک‌اند و دیتابیس Supabase

```
┌────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (SPA)                            │
│  React 19 + TypeScript + Custom Router (HTML5 History API) + Context  │
└───────┬───────────────────────────┬────────────────────────────┬───────┘
        │ (1) QR / Public RPC       │ (2) PIN / RPC Token        │ (3) Supabase Auth + RLS
        ▼                           ▼                            ▼
┌──────────────────┐       ┌──────────────────┐         ┌────────────────────┐
│   Guest Client   │       │   Waiter Client  │         │    Admin Client    │
│  (Role: anon)    │       │  (Role: anon)    │         │ (Role: auth'd)     │
└────────┬─────────┘       └────────┬─────────┘         └────────┬───────────┘
         │                          │                            │
         │ customer_session()       │ waiter_login()             │ supabase.auth.signIn()
         │ create_guest_call()      │ waiter_create_order()      │ Direct Table Access
         │ customer_state()         │ waiter_update_order()      │ via RLS (*_admin_all)
         ▼                          ▼                            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE / POSTGRESQL                           │
│  - Row Level Security (RLS) Active                                     │
│  - Security Definer RPCs (Bypass RLS securely with DB validation)      │
│  - Triggers (Status Guard, Table Sync)                                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Broadcast Event ('changed')
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               REALTIME BROADCAST CHANNEL (vadoodian:board)             │
│   فرانت‌اند به صورت زنده فقط پیام تغییر دریافت کرده و متد خود را رفرش می‌کند   │
└────────────────────────────────────────────────────────────────────────┘
```

### الف. لایه دسترسی مشتری (`src/shared/api/customer.ts`)
1. **ورود با توکن QR:** کلاینت متد `customer_session(p_qr_token)` را صدا می‌زند.
2. **پاسخ سرور:** اگر میز معتبر باشد، یک نشست باز (`table_sessions`) ایجاد یا خوانده شده و یک `guest_token` ۱۸ بایتی به مرورگر بازگردانده و در `localStorage` ذخیره می‌شود.
3. **دریافت وضعیت:** کلاینت به صورت متناوب یا با پیام‌های ریل‌تایم، متد `customer_state(guest_token)` را فراخوانی کرده و وضعیت فعلی میز، فراخوان‌های در جریان و فیش‌های ثبت‌شده را دریافت می‌نماید.
4. **فراخوان ویتر:** متد `create_guest_call(guest_token, type, note)` رکورد درخواست جدید را بدون اجازه دسترسی مستقیم به جدول `guest_requests` درج می‌کند.

### ب. لایه دسترسی ویتر (`src/shared/api/waiter.ts`)
1. **ورود با پین:** متد `waiter_login(code, pin)` اجرا می‌شود. سرور پین را با `crypt(pin, pin_hash)` اعتبارسنجی می‌کند. پس از ۵ تلاش اشتباه، برای ۱۵ دقیقه قفل نرخ (Rate-limit) اعمال می‌شود.
2. **توکن نشست موقت:** یک رکورد با اعتبار ۱۶ ساعته در `staff_sessions` ثبت شده و توکن ۳۲ بایتی به کلاینت تحویل می‌گردد (`vadoodian_waiter_token`).
3. **عملیات سالن:** کلیه اقدامات ویتر با ارسال توکن انجام می‌شود:
   - `waiter_state(token)`: دریافت اطلاعات تمام میزهای فعال، صف فراخوان‌ها، سفارشات و آمار روزانه.
   - `waiter_open_table(token, tableNumber)`: باز کردن دستی میز.
   - `waiter_create_order(token, tableNumber, items, note)`: استعلام قیمت لحظه‌ای اقلام از جدول `menu_items` سمت دیتابیس (جلوگیری از دستکاری قیمت در کلاینت)، محاسبه ۱۰٪ حق سرویس، درج رکورد `orders` و رکوردهای `order_items` و بستن فراخوان‌های باز آن میز.
   - `waiter_update_order_status(token, orderId, status)`: تغییر وضعیت سفارش.
   - `waiter_close_table(token, tableNumber)`: تسویه حساب، تغییر وضعیت نشست به `closed` و آزاد کردن میز (`free`).

### ج. لایه دسترسی مدیر (`src/shared/api/admin.ts`)
1. **احراز هویت استاندارد:** ادمین با متد `supabase.auth.signInWithPassword()` وارد می‌شود.
2. **بررسی گارد دسترسی:** تابع دیتابیسی `public.is_admin()` بررسی می‌کند که کاربر لاگین‌شده حتماً در جدول `public.staff` با ستون `role = 'admin'` و `is_active = true` ثبت شده باشد.
3. **سیاست‌های RLS مستقیم:** طبق پالیسی‌های مایگریشن `0003_admin_auth.sql`، ادمین تاییدشده دسترسی کامل خواندن و نوشتن روی تمام جداول سامانه دارد.

### د. معماری همگام‌سازی بلادرنگ (Realtime Board)
برای پرهیز از افشای مستقیم داده‌های حساس روی وب‌سوکت عمومی:
- کانال broadcast ساده به نام `vadoodian:board` تعریف شده است (`src/shared/realtime/board.ts`).
- هنگام هر تغییر مهم (ثبت سفارش، تغییر وضعیت، فراخوان ویتر)، رویداد `{ event: 'changed' }` ارسال می‌شود.
- کلاینت‌های شنونده به محض دریافت سیگنال، متد اختصاصی رول خود (`waiter_state` یا `customer_state`) را صدا زده و داده‌های جدید و امن خود را واکشی می‌کنند.

---

## ۳. مسیریابی و ساختار صفحات (Routing Architecture)

سامانه از یک روتر سبک و پایدار مبتنی بر History API مرورگر (`src/shared/router.ts`) استفاده می‌کند. این روتر مسیرهای زیر را پوشش می‌دهد:

```
┌─────────────────────────────────┬───────────────────┬────────────────────────────────────────────┐
│ آدرس مسیر                       │ نام Route در تایپ │ کامپوننت متناظر                            │
├─────────────────────────────────┼───────────────────┼────────────────────────────────────────────┤
│ /                               │ home              │ LandingPage                                │
│ /t/:qrToken                     │ customer          │ CustomerGate (CustomerMenu / Detail)       │
│ /waiter/login                   │ waiter-login      │ WaiterPinLogin                             │
│ /waiter                         │ waiter-workspace  │ WaiterWorkspace                            │
│ /waiter/order/:tableNumber      │ waiter-order      │ WaiterOrderTaking                          │
│ /admin/login                    │ admin-login       │ AdminLogin                                 │
│ /admin                          │ admin-live        │ AdminLayout > LiveTablesMonitoring         │
│ /admin/orders                   │ admin-orders      │ AdminLayout > OrdersList                   │
│ /admin/orders/:orderId          │ admin-order       │ AdminLayout > OrderDetailView              │
│ /admin/menu                     │ admin-menu        │ AdminLayout > MenuManagement               │
│ /admin/menu/:productId          │ admin-product     │ AdminLayout > ProductEditForm              │
│ /admin/staff                    │ admin-staff       │ AdminLayout > StaffPerformance             │
└─────────────────────────────────┴───────────────────┴────────────────────────────────────────────┘
```

---

## ۴. مدیریت وضعیت‌ها و کامپوننت‌های اصلی

### الف. استیت مرکزی (`AppContext.tsx`)
وضعیت‌های سراسری نرم‌افزار در `src/context/AppContext.tsx` نگهداری می‌شوند:
- **احراز هویت ادمین:** `adminSession`, `adminAuthLoading`, `adminView`
- **احراز هویت ویتر:** `waiterSession`, `waiterAuthLoading`, `waiterView`
- **نشست مشتری:** `customerSession`, `customerLoading`, `customerError`, `customerView`
- **کاتالوگ منو:** `menuItems`, `categories`, `activeCategory`
- **وضعیت زنده سالن:** `tables`, `orders`, `waiterCalls`, `stats`
- **پیام‌های سیستم:** سیستم توست سراسری (`showToast`, `toast`)

### ب. سلسله‌مراتب کامپوننت‌ها (Component Hierarchy)

```
App
├── GlobalModeBar (فقط محیط توسعه با ?demo=1)
├── LandingPage (در مسیر ریشه /)
├── CustomerGate (در مسیر /t/:qrToken)
│   ├── CustomerMenu (مشاهده لیست دسته‌ها و کارت‌های محصول)
│   ├── CustomerItemDetail (مشاهده تصویر بزرگ، ترکیبات و داستان محصول)
│   └── CallWaiterFloatingModal (مودال فراخوان ویتر)
├── Waiter Section (در مسیرهای /waiter/*)
│   ├── WaiterPinLogin (صفحه‌کلید لمسی ورود پین)
│   ├── WaiterWorkspace (داشبورد سالن: فیلتر میزها، کارت‌های فراخوان)
│   ├── WaiterOrderTaking (فرم سفارش‌گیری سر میز با منوی سریع)
│   ├── OrderConfirmModal (تایید اقلام، مشاهده جمع کل و ارسال به صندوق)
│   └── WaiterProfileModal (خروج و مشاهده آمار شیفت)
└── Admin Section (در مسیرهای /admin/*)
    ├── AdminLogin (فرم ورود ایمیل و پسورد)
    └── AdminLayout (سایدبار دسکتاپ و نوار ناوبری موبایل)
        ├── LiveTablesMonitoring (دید کلی به سالن، وضعیت میزها و زمان اقامت)
        ├── OrdersList (فیلتر فیش‌ها بر اساس وضعیت و تسویه‌حساب)
        ├── OrderDetailView (چاپ یا مشاهده ریز اقلام فیش)
        ├── MenuManagement (افزودن و ویرایش دسته‌ها و اقلام)
        ├── ProductEditForm (ویرایش تصویر، ترکیبات و قیمت محصول)
        └── StaffPerformance (تعداد سفارش‌ها و ثبت ویتر جدید)
```

---

## ۵. قوانین و استانداردهای کدنویسی جهت نگهداشت و توسعه AI

مدل‌های هوش مصنوعی و توسعه‌دهندگان باید استانداردهای زیر را در تمامی فایل‌های این پروژه رعایت نمایند:

1. **مرجع یگانه حقیقت (Single Source of Truth):**
   - تمامی انواع داده در `src/types/index.ts` تعریف می‌شوند. از ساخت تایپ‌های موازی و تکراری خودداری شود.
   - مپینگ ساختار دیتابیس به کمل‌کیس منحصراً در `src/shared/api/mappers.ts` انجام شود.

2. **ایزولاسیون فراخوانی‌های دیتابیس:**
   - کامپوننت‌های UI نباید به صورت مستقیم کوئری SQL یا کلاینت خام `supabase.from()` را فراخوانی کنند.
   - تمام تراکنش‌ها باید از طریق توابع ماژولار در پوشه `src/shared/api/` صورت گیرد.

3. **رعایت RTL و بومی‌سازی تقویم و ارقام:**
   - رابط کاربری به صورت کامل راست‌به‌چپ (`dir="rtl"`) و با تایپوگرافی فارسی طراحی شده است.
   - برای نمایش اعداد در UI، همواره از تابع تبدیل ارقام فارسی و فرمت استاندارد قیمت به تومان استفاده شود.

4. **تغییرناپذیری فیش‌های صادرشده (Snapshot Preservation):**
   - در صورت تغییر قیمت یا عنوان یک محصول در منو، فیش‌های قبلی نباید دستخوش تغییر شوند. جدول `order_items` اطلاعات قیمت و نام را در زمان سفارش فریز (Snapshot) می‌کند.

5. **گاردهای گذار وضعیت (State Transition Integrity):**
   - مراحل سفارش (`orders.status`) یک‌طرفه و تحت کنترل تریگر دیتابیس هستند:
     `sent_to_admin` → `in_preparation` → `ready` → `delivered` → `paid`
   - هیچ کامپوننتی نباید تلاش کند سفارشی را از `sent_to_admin` مستقیماً به `paid` تغییر دهد (موجب خطای `check_violation` خواهد شد).
