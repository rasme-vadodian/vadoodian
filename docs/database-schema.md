# مستندات جامع معماری و اسکیمای پایگاه داده ودودیان

> این سند مشخصات فنی کامل پایگاه داده PostgreSQL در سامانه Supabase را ارائه می‌دهد. این فایل برای راهنمایی دقیق مدل‌های هوش مصنوعی، کوئری‌نویسی و توسعه افزونه‌های جدید ایجاد شده است.

---

## ۱. انواع داده شمارشی اختصاصی (Custom ENUM Types)

| نام نوع داده (Enum) | مقادیر مجاز | شرح کاربرد |
|---|---|---|
| `staff_role` | `'admin'`, `'waiter'` | نقش‌های پرسنل سامانه |
| `table_status` | `'free'`, `'active'`, `'calling'`, `'bill_requested'` | وضعیت لحظه‌ای میز در سالن |
| `session_status` | `'open'`, `'closed'` | وضعیت باز یا بسته بودن نشست گروه مهمان |
| `guest_request_type` | `'call_waiter'`, `'order'`, `'bill'` | نوع درخواست ارسالی توسط مشتری |
| `guest_request_state` | `'pending'`, `'seen'`, `'accepted'`, `'rejected'`, `'expired'` | چرخه حیات و رسیدگی به فراخوان |
| `order_status` | `'sent_to_admin'`, `'in_preparation'`, `'ready'`, `'delivered'`, `'paid'`, `'cancelled'` | چرخه وضعیت پردازش فیش سفارش |
| `payment_method` | `'pos'`, `'online'`, `'cash'` | روش تسویه فیش |

---

## ۲. مشخصات جداول پایگاه داده (Tables & Columns)

### ۱. جدول پرسنل (`staff`)
نگهداری اطلاعات حساب مدیران و سالن‌کاران (ویترها).

| نام ستون | نوع داده (PostgreSQL) | کلید | ویژگی / پیش‌فرض | توضیحات |
|---|---|---|---|---|
| `id` | `uuid` | PK | `default gen_random_uuid()` | شناسه یکتای پرسنل |
| `auth_user_id` | `uuid` | FK, Unique | `references auth.users (id) on delete set null` | ارجاع به جدول احراز هویت Supabase (فقط ادمین‌ها) |
| `full_name` | `text` | - | `not null` | نام و نام خانوادگی |
| `code` | `text` | Unique | `not null` | کد پرسنلی برای لاگین پین |
| `role` | `staff_role` | - | `not null default 'waiter'` | نقش کاربر (admin / waiter) |
| `pin_hash` | `text` | - | `null` | هش پین ۴ رقمی (رمزنگاری‌شده با bcrypt/bf) |
| `shift` | `text` | - | `null` | شیفت کاری (صبح / عصر / شب) |
| `is_active` | `boolean` | - | `not null default true` | وضعیت فعال بودن کاربر در سالن |
| `created_at` | `timestamptz` | - | `not null default now()` | تاریخ و زمان ثبت پرسنل |

---

### ۲. جدول نشست‌های ویتر (`staff_sessions`)
مدیریت توکن‌های لاگین تبلت‌های ویترها (جهت اجتناب از ثبت‌نام ویترها در Supabase Auth).

| نام ستون | نوع داده | کلید | ویژگی / پیش‌فرض | توضیحات |
|---|---|---|---|---|
| `id` | `uuid` | PK | `default gen_random_uuid()` | شناسه نشست |
| `staff_id` | `uuid` | FK | `not null references staff (id) on delete cascade` | سالن‌کار متصل به این نشست |
| `token` | `text` | Unique | `not null default encode(gen_random_bytes(32), 'hex')` | توکن احراز هویت درخواست‌های ویتر |
| `created_at` | `timestamptz` | - | `not null default now()` | زمان ورود |
| `last_seen_at` | `timestamptz` | - | `not null default now()` | آخرین فعالیت ثبت‌شده |
| `expires_at` | `timestamptz` | - | `not null default now() + interval '16 hours'` | زمان انقضای نشست (پیش‌فرض ۱۶ ساعت) |
| `ended_at` | `timestamptz` | - | `null` | زمان خروج رسمی (Logout) |

---

### ۳. جدول تلاش‌های ورود (`login_attempts`)
محافظت از پین‌های ۴ رقمی در برابر حملات Brute-force.

| نام ستون | نوع داده | کلید | ویژگی / پیش‌فرض | توضیحات |
|---|---|---|---|---|
| `id` | `bigserial` | PK | `auto-increment` | شناسه تلاش |
| `staff_code` | `text` | - | `not null` | کد پرسنلی واردشده |
| `succeeded` | `boolean` | - | `not null default false` | نتیجه اعتبارسنجی پین |
| `attempted_at` | `timestamptz` | - | `not null default now()` | زمان تلاش برای ورود |

*قاعده امنیتی:* در صورتی که طی ۱۵ دقیقه اخیر، تعداد تلاش‌های ناموفق یک کد پرسنلی به ۵ بار برسد، متد `waiter_login` خطای `rate_limited` صادر می‌کند.

---

### ۴. جدول میزها (`tables`)
مشخصات فیزیکی و وضعیت سالن.

| نام ستون | نوع داده | کلید | ویژگی / پیش‌فرض | توضیحات |
|---|---|---|---|---|
| `id` | `uuid` | PK | `default gen_random_uuid()` | شناسه میز |
| `number` | `integer` | Unique | `not null` | شماره فیزیکی میز (مثلاً ۱، ۲، ۱۰) |
| `capacity` | `integer` | - | `not null default 4 check (capacity > 0)` | ظرفیت تعداد نفرات میز |
| `qr_token` | `text` | Unique | `not null default encode(gen_random_bytes(9), 'hex')` | توکن تصادفی ۱۸ کاراکتری QR چاپی میز |
| `status` | `table_status` | - | `not null default 'free'` | وضعیت میز (آزاد، فعال، در حال فراخوان) |
| `is_active` | `boolean` | - | `not null default true` | امکان فعال/غیرفعال‌سازی موقت میز |
| `created_at` | `timestamptz` | - | `not null default now()` | زمان تعریف میز |

---

### ۵. جدول نشست‌های میز (`table_sessions`)
جداسازی گروه‌های مختلف مهمانانی که در طول روز دور یک میز می‌نشینند.

| نام ستون | نوع داده | کلید | ویژگی / پیش‌فرض | توضیحات |
|---|---|---|---|---|
| `id` | `uuid` | PK | `default gen_random_uuid()` | شناسه نشست مهمان |
| `table_id` | `uuid` | FK | `not null references tables (id) on delete cascade` | میز مربوطه |
| `guest_token` | `text` | Unique | `not null default encode(gen_random_bytes(18), 'hex')` | توکن دسترسی مشتری برای فراخوانی API |
| `status` | `session_status` | - | `not null default 'open'` | وضعیت نشست (open / closed) |
| `guest_count` | `integer` | - | `null` | تعداد مهمانان حاضر (اختیاری) |
| `opened_by` | `uuid` | FK | `references staff (id) on delete set null` | ویتر بازکننده نشست (در صورت باز شدن دستی) |
| `opened_at` | `timestamptz` | - | `not null default now()` | زمان ورود مهمان به سالن |
| `closed_at` | `timestamptz` | - | `null` | زمان تسویه‌حساب و خروج مهمان |

*ایندکس مهم:* ایندکس شرطی یکتایی `one_open_session_per_table` تضمین می‌کند که **در هر لحظه، حداکثر یک نشست با وضعیت `'open'` برای هر میز وجود داشته باشد**.

---

### ۶. جدول دسته‌بندی‌های منو (`categories`)

| نام ستون | نوع داده | کلید | ویژگی / پیش‌فرض | توضیحات |
|---|---|---|---|---|
| `id` | `uuid` | PK | `default gen_random_uuid()` | شناسه دسته‌بندی |
| `slug` | `text` | Unique | `not null` | شناسه متنی یکتا (مانند `hot`, `cold`, `dessert`) |
| `name` | `text` | - | `not null` | عنوان فارسی دسته (مانند «نوشیدنی‌های گرم») |
| `icon` | `text` | - | `not null default 'local_cafe'` | شناسه آیکون نمایشی |
| `sort_order` | `integer` | - | `not null default 0` | ترتیب چینش در تب‌های منو |
| `is_active` | `boolean` | - | `not null default true` | فعال بودن نمایش این دسته |

---

### ۷. جدول اقلام منو (`menu_items`)

| نام ستون | نوع داده | کلید | ویژگی / پیش‌فرض | توضیحات |
|---|---|---|---|---|
| `id` | `uuid` | PK | `default gen_random_uuid()` | شناسه محصول |
| `code` | `text` | Unique | `not null` | کد اختصاصی آیتم منو (مانند `HOT-01`) |
| `name` | `text` | - | `not null` | نام محصول (مانند «اسپرسو سینگل») |
| `category_id` | `uuid` | FK | `not null references categories (id) on delete restrict` | دسته منو |
| `price` | `integer` | - | `not null check (price >= 0)` | قیمت نهایی به تومان |
| `ingredients` | `text` | - | `not null default ''` | ترکیبات و مواد اولیه |
| `story` | `text` | - | `not null default ''` | داستان، پیشینه یا توضیحات جذاب آیتم |
| `image_url` | `text` | - | `null` | آدرس تصویر محصول |
| `is_available` | `boolean` | - | `not null default true` | موجودی فعلی در انبار/بار |
| `is_featured` | `boolean` | - | `not null default false` | نمایش در بخش محصولات برگزیده |
| `show_in_qr` | `boolean` | - | `not null default true` | مجوز نمایش در منوی QR مشتری |
| `created_at` | `timestamptz` | - | `not null default now()` | زمان درج محصول |

---

### ۸. جدول درخواست‌های مهمان و فراخوان‌ها (`guest_requests`)

| نام ستون | نوع داده | کلید | ویژگی / پیش‌فرض | توضیحات |
|---|---|---|---|---|
| `id` | `uuid` | PK | `default gen_random_uuid()` | شناسه درخواست |
| `session_id` | `uuid` | FK | `not null references table_sessions (id) on delete cascade` | نشست متناظر مهمان |
| `table_id` | `uuid` | FK | `not null references tables (id) on delete cascade` | میز مربوطه |
| `type` | `guest_request_type` | - | `not null` | نوع فراخوان (`call_waiter`, `order`, `bill`) |
| `status` | `guest_request_state` | - | `not null default 'pending'` | وضعیت رسیدگی (`pending`, `seen`, `accepted`, ...) |
| `items` | `jsonb` | - | `not null default '[]'::jsonb` | اسنپ‌شات اقلام احتمالی |
| `note` | `text` | - | `null` | یادداشت ویژه مهمان برای سالن‌کار |
| `created_at` | `timestamptz` | - | `not null default now()` | زمان فشردن دکمه فراخوان |
| `seen_at` | `timestamptz` | - | `null` | زمان مشاهده توسط ویتر |
| `resolved_at` | `timestamptz` | - | `null` | زمان پاسخگویی و رفع فراخوان |
| `handled_by` | `uuid` | FK | `references staff (id) on delete set null` | ویتر رسیدگی‌کننده |

---

### ۹. جدول فیش‌های سفارش (`orders`)

| نام ستون | نوع داده | کلید | ویژگی / پیش‌فرض | توضیحات |
|---|---|---|---|---|
| `id` | `uuid` | PK | `default gen_random_uuid()` | شناسه سفارش |
| `number` | `bigint` | Unique | `generated always as identity` | شماره فیش چاپی ترتیبی (مثلاً ۱۰۲۴) |
| `session_id` | `uuid` | FK | `not null references table_sessions (id) on delete restrict` | نشست مهمان مربوطه |
| `table_id` | `uuid` | FK | `not null references tables (id) on delete restrict` | میز سفارش‌دهنده |
| `waiter_id` | `uuid` | FK | `references staff (id) on delete set null` | ویتر ثبت‌کننده سفارش |
| `guest_request_id` | `uuid` | FK, Unique | `references guest_requests (id) on delete set null` | فراخوانی که منجر به این سفارش شد |
| `status` | `order_status` | - | `not null default 'sent_to_admin'` | وضعیت فیش در آشپزخانه/صندوق |
| `subtotal` | `integer` | - | `not null default 0` | جمع اقلام فیش (تومان) |
| `tax` | `integer` | - | `not null default 0` | مالیات بر ارزش افزوده |
| `service_fee` | `integer` | - | `not null default 0` | حق سرویس سالن (۱۰٪) |
| `total` | `integer` | - | `not null default 0` | مبلغ کل نهایی فیش |
| `note` | `text` | - | `null` | یادداشت کلی فیش |
| `payment_method` | `payment_method` | - | `null` | نحوه پرداخت (pos / online / cash) |
| `created_at` | `timestamptz` | - | `not null default now()` | زمان ثبت سفارش |
| `confirmed_at` | `timestamptz` | - | `null` | زمان تایید و رفتن به وضعیت `in_preparation` |
| `delivered_at` | `timestamptz` | - | `null` | زمان تحویل سر میز (`delivered`) |
| `paid_at` | `timestamptz` | - | `null` | زمان تسویه حساب (`paid`) |

---

### ۱۰. جدول اقلام سفارش (`order_items`)
ریز اقلام مندرج در هر فیش سفارش با مکانیزم فریز قیمت و نام (Snapshotting).

| نام ستون | نوع داده | کلید | ویژگی / پیش‌فرض | توضیحات |
|---|---|---|---|---|
| `id` | `uuid` | PK | `default gen_random_uuid()` | شناسه آیتم فیش |
| `order_id` | `uuid` | FK | `not null references orders (id) on delete cascade` | سفارش والد |
| `menu_item_id` | `uuid` | FK | `references menu_items (id) on delete set null` | ارجاع به منو (جهت گزارش‌گیری) |
| `name` | `text` | - | `not null` | نام محصول فریز‌شده در لحظه خرید |
| `unit_price` | `integer` | - | `not null check (unit_price >= 0)` | قیمت واحد فریز‌شده به تومان |
| `quantity` | `integer` | - | `not null check (quantity > 0)` | تعداد درخواستی |
| `ingredients` | `text` | - | `null` | ترکیبات محصول در زمان سفارش |
| `note` | `text` | - | `null` | درخواست ویژه (مثلاً بدون شکر) |

---

## ۳. روابط بین جداول (Entity Relationship)

```
[categories] 1 ──── ∞ [menu_items]
                             │
                             │ (0..1 references)
                             ▼
  [tables] 1 ──── ∞ [table_sessions] 1 ──── ∞ [orders] 1 ──── ∞ [order_items]
      │                     │                     │
      │                     │                     │ (waiter_id)
      │ 1                   │ 1                   ▼
      │                     │              [staff] (admin/waiter)
      │                     │                     ▲
      ▼                     ▼                     │ (staff_id)
      ∞                     ∞                     │
   [guest_requests] ────────┘             [staff_sessions]
```

1. **`categories` ──(1:N)──> `menu_items`:** هر دسته‌بندی دارای چند قلم کالاست. حذف دسته منوط به نبود آیتم فعال در آن است (`on delete restrict`).
2. **`tables` ──(1:N)──> `table_sessions`:** هر میز دارای تاریخچه‌ای از نشست‌ها است، اما با ایندکس اختصاصی، همزمان فقط یک نشست `'open'` دارد.
3. **`table_sessions` ──(1:N)──> `orders`:** یک نشست ممکن است در طول اقامت مهمان چندین بار سفارش جدید ثبت کند.
4. **`orders` ──(1:N)──> `order_items`:** هر سفارش شامل چند سطر قلم کالا است که با حذف سفارش، اقلام آن نیز پاک می‌شوند (`on delete cascade`).
5. **`staff` ──(1:N)──> `staff_sessions`:** هر پرسنل سالن می‌تواند در هر روز ورود جدیدی روی تبلت داشته باشد.
6. **`table_sessions` ──(1:N)──> `guest_requests`:** فراخوان‌های مهمان متعلق به همان نشست و همان میز هستند.

---

## ۴. تریگرها و توابع محافظتی (Triggers & Integrity Guards)

### ۱. محافظ گذار وضعیت سفارش (`enforce_order_transition`)
این تریگر `BEFORE UPDATE OF status ON orders` اجرا می‌شود و مانع از پرش‌های غیرمجاز وضعیت یا تغییرات اشتباه توسط کاربر یا کلاینت می‌شود:

```
[sent_to_admin] ───► [in_preparation] ───► [ready] ───► [delivered] ───► [paid]
       │                    │                │              │
       └────────────────────┴────────────────┴──────────────┴────► [cancelled]
```

- تغییر از هر مرحله به `cancelled` مجاز است (قبل از پرداخت).
- ثبت خودکار زمان‌ها:
  - ورود به `in_preparation` ──> پر شدن `confirmed_at = now()`
  - ورود به `delivered` ──> پر شدن `delivered_at = now()`
  - ورود به `paid` ──> پر شدن `paid_at = now()`

### ۲. همگام‌سازی وضعیت میز با فراخوان (`sync_table_status`)
این تریگر `AFTER INSERT OR UPDATE OF status ON guest_requests` اجرا می‌شود:
- اگر فراخوان جدید با وضعیت `'pending'` ثبت شود: میز بلافاصله به وضعیت `'calling'` تغییر می‌کند.
- اگر فراخوان توسط ویتر `'accepted'` یا `'resolved'` شود: وضعیت میز از `'calling'` به `'active'` برمی‌گردد.

---

## ۵. امنیت پایگاه داده و سیاست‌های RLS (Row Level Security)

تمامی جدول‌ها دستور `ENABLE ROW LEVEL SECURITY` را دریافت کرده‌اند:

1. **دسترسی عمومی (نقش `anon`):**
   - جدول `menu_items`: فقط خواندن (`SELECT`) اقلامی که `is_available = true` و `show_in_qr = true` هستند (`menu_public_read`).
   - جدول `categories`: فقط خواندن (`SELECT`) دسته‌های فعال (`categories_public_read`).
   - **هیچ دسترسی مستقیمی (خواندن، نوشتن یا ویرایش) به جدول‌های `staff`, `tables`, `table_sessions`, `guest_requests`, `orders`, `order_items` برای نقش `anon` وجود ندارد.** تمام ارتباطات مشتری و ویتر باید الزماً از طریق توابع رویه‌ای `SECURITY DEFINER` صورت گیرد.

2. **دسترسی کاربران واردشده (نقش `authenticated`):**
   - هر پرسنل با سیاست `staff_select_self` می‌تواند مشخصات رکورد اختصاصی خود در `staff` را بخواند (`auth_user_id = auth.uid()`).
   - تابع امنیتی `public.is_admin()` بررسی می‌کند که آیا کاربر دارای رکورد فعال با نقش ادمین است یا خیر.
   - ادمین تاییدشده به واسطه سیاست‌های `*_admin_all` دارای دسترسی کامل (`FOR ALL`) به تمام جداول سامانه است.

---

## ۶. فهرست توابع ذخیره‌شده و رویه‌های امنیتی (RPC List)

| نام تابع (RPC) | سطح دسترسی (Grant) | پارامترها | شرح عملکرد |
|---|---|---|---|
| `customer_session` | `anon, authenticated` | `p_qr_token text` | استعلام میز با QR، ایجاد یا اتصال به نشست باز و صدور توکن مهمان |
| `customer_state` | `anon, authenticated` | `p_guest_token text` | دریافت آخرین وضعیت میز، فراخوان در جریان و فیش‌های باز مشتری |
| `create_guest_call` | `anon, authenticated` | `p_guest_token, p_type, p_note` | ثبت فراخوان ویتر سر میز بدون داشتن سبد خرید مستقیم |
| `waiter_login` | `anon, authenticated` | `p_code text, p_pin text` | بررسی پین با هش، کنترل محدودیت تلاش (Rate-limit) و صدور توکن تبلت |
| `waiter_logout` | `anon, authenticated` | `p_token text` | ابطال توکن نشست ویتر |
| `waiter_state` | `anon, authenticated` | `p_token text` | واکشی کامل اطلاعات سالن، میزها، صف فراخوان‌ها و آمار سفارشات شیفت ویتر |
| `waiter_open_table` | `anon, authenticated` | `p_token, p_table_number` | باز کردن دستی نشست برای میزی که مهمان دارد |
| `waiter_create_order` | `anon, authenticated` | `p_token, p_table_number, p_items, p_note` | استعلام قیمت از دیتابیس، محاسبه سرویس، ایجاد رکورد فیش و اقلام آن |
| `waiter_update_order_status` | `anon, authenticated` | `p_token, p_order_id, p_status` | به‌روزرسانی مرحله فیش بر اساس قوانین تریگر وضعیت |
| `waiter_close_table` | `anon, authenticated` | `p_token, p_table_number` | بستن نشست باز میز (`closed`) و آزاد کردن میز در سالن (`free`) |
| `admin_upsert_waiter` | `authenticated` (فقط ادمین) | `p_id, p_name, p_code, p_pin, p_shift` | افزودن یا ویرایش اطلاعات ویتر و هش کردن پین با الگوریتم امنیتی |
| `admin_set_waiter_pin` | `authenticated` (فقط ادمین) | `p_id, p_pin` | تغییر پین سالن‌کار |
| `admin_delete_waiter` | `authenticated` (فقط ادمین) | `p_id` | غیرفعال‌سازی حساب ویتر و خاتمه تمام نشست‌های فعال او |
| `admin_add_table` | `authenticated` (فقط ادمین) | `p_number, p_capacity` | افزودن میز جدید به سالن و تولید توکن اختصاصی QR |
| `admin_delete_table` | `authenticated` (فقط ادمین) | `p_number` | غیرفعال‌سازی میز |
| `admin_update_order_status` | `authenticated` (فقط ادمین) | `p_order_id, p_status` | کنترل و تغییر مرحله سفارشات از پنل مدیریت/صندوق |
