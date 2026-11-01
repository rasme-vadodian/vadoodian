# معماری پروژه ودودیان

> سند مرجع تصمیم‌های فنی. هر تغییری در ساختار باید اول اینجا به‌روز شود.

## تصمیم‌های پایه

| موضوع | تصمیم |
|---|---|
| بک‌اند | Supabase (Postgres + Realtime + Auth) |
| محدوده | تک‌شعبه — بدون `tenant_id` |
| داده اولیه | از `src/data/initialData.ts` به‌عنوان seed منتقل می‌شود |
| نقش‌ها | مشتری (بدون لاگین) · ویتر (PIN) · ادمین (پسورد) |
| سبد خرید مشتری | **ندارد** — مشتری فقط منو و جزئیات محصول را می‌بیند و ویتر را فراخوان می‌کند |
| زبان/RTL | حفظ کامل فارسی و `dir="rtl"` |

## نقش‌ها و مسیرها

```
/t/:qrToken        مشتری — فقط با توکن QR میز، بدون حساب کاربری
/waiter/login      ورود ویتر با کد + PIN
/waiter            صف فراخوان‌ها + میزها
/waiter/order/:id  فرم سفارش برای یک میز
/admin/login       ورود ادمین
/admin             مانیتور زنده میزها
/admin/orders      فیش‌ها
/admin/menu        مدیریت منو
/admin/staff       پرسنل و عملکرد
```

`GlobalModeBar` یک ابزار دمو است و در نسخه نهایی حذف می‌شود؛ در محیط توسعه
می‌تواند باقی بماند ولی هرگز نباید اجازه ورود به پنل بدون احراز هویت بدهد.

## QR و هویت میز

- `tables.qr_token` رشته تصادفی ۱۸ کاراکتری است، **نه شماره میز**.
- QR چاپی فقط توکن را در خود دارد؛ باطل‌کردن QR = تولید توکن جدید.
- مشتری با باز کردن `/t/:token` یک RPC صدا می‌زند که:
  1. میز را با توکن پیدا می‌کند،
  2. اگر نشست باز ندارد، یکی ایجاد می‌کند (`table_sessions`),
  3. شناسه نشست + منوی فعال را برمی‌گرداند.
- دسترسی مستقیم anon به جدول‌های میز/سفارش/فراخوان بسته است. خواندن و نوشتن
  فقط از طریق RPC انجام می‌شود تا نشود با دستکاری درخواست، سفارش میز دیگر را دید.

## نشست میز (چرا لازم است)

یک میز در طول روز چند بار پر و خالی می‌شود. بدون `table_sessions`:

- سه گروه مهمان روی یک میز قاطی می‌شوند،
- گزارش فروش هر ویتر غلط درمی‌آید،
- بستن حساب یک میز، فیش‌های مهمان قبلی را هم قفل می‌کند.

قاعده: **در هر لحظه حداکثر یک نشست باز برای هر میز** (partial unique index).
تسویه = بستن نشست + آزاد شدن میز.

## جریان کاری

```
مشتری: منوی QR → مشاهده محصول و جزئیات (فقط خواندنی) → «فراخوان ویتر»
   │
   ├─ guest_requests (type=call_waiter, status=pending)
   ▼                         socket: call:created
ویتر: نوتیفیکیشن میز (بدون اقلام — مشتری سفارشی ثبت نکرده)
   │  (یا خودش دستی یک میز را باز می‌کند — همان فرم)
   ├─ انتخاب اقلام از منو
   └─ «تایید» → orders (status=sent_to_admin) + guest_request.status=accepted
   ▼
ادمین: sent_to_admin → in_preparation → ready → delivered → paid
```

نکته: مشتری سبد خرید ندارد و آیتمی ارسال نمی‌کند. پس `guest_requests.items`
همیشه خالی می‌ماند و `type='order'` از سمت مشتری هرگز تولید نمی‌شود؛ سفارش را
همیشه ویتر می‌سازد. مسیر «فراخوان» و مسیر «انتخاب دستی میز» به **یک کامپوننت
سفارش‌گیری مشترک** می‌رسند و تفاوتی در محتوا ندارند.

### وضعیت‌ها

| موجودیت | مقادیر مجاز |
|---|---|
| `guest_requests.status` | `pending` → `seen` → `accepted` / `rejected` / `expired` |
| `orders.status` | `sent_to_admin` → `in_preparation` → `ready` → `delivered` → `paid`، با `cancelled` از هر مرحله قبل از `paid` |
| `tables.status` | `free` · `active` · `calling` · `bill_requested` |
| `table_sessions.status` | `open` · `closed` |

گذارهای وضعیت سفارش باید در یک trigger دیتابیس اعتبارسنجی شوند تا UI و API
نتوانند وضعیت غیرمجاز بسازند (مثلاً `paid` مستقیم از `sent_to_admin`).

## ساختار پوشه‌ها (هدف)

```
src/
├─ app/
│  ├─ router.tsx
│  └─ providers.tsx          Auth + Realtime + UI
├─ features/
│  ├─ customer/  pages · components · hooks
│  ├─ waiter/    pages · components · hooks
│  └─ admin/     pages · components
├─ entities/     table · order · menu · call · waiter   (model + api + status)
└─ shared/       api/client · realtime · ui · lib(persian, money)
```

## شکستن Context فعلی

`src/context/AppContext.tsx` الان همه‌چیز است. جایگزین:

| مسئولیت | مقصد |
|---|---|
| نقش/هویت کاربر | `AuthProvider` |
| داده‌های سرور + اتصال socket | `RealtimeProvider` (React Query + Supabase channel) |
| توست/مودال‌های UI | `UIContext` |
| `toPersianDigits` / `formatPrice` | `shared/lib/persian.ts` |

> سبد خرید مشتری حذف شده است (نه در context و نه در UI). تنها اکشن سمت مشتری
> «فراخوان ویتر» است.

## نقشه انتقال فایل‌های فعلی

| فعلی | مقصد |
|---|---|
| `components/customer/CustomerMenu.tsx` | `features/customer/pages/MenuPage.tsx` |
| `components/customer/CustomerItemDetail.tsx` | `features/customer/pages/ItemPage.tsx` |
| `components/customer/CustomerQuickGrid.tsx` | حذف/ادغام در MenuPage |
| `components/waiter/WaiterWorkspace.tsx` | `features/waiter/pages/TablesPage.tsx` |
| `components/waiter/WaiterOrderTaking.tsx` | `features/waiter/pages/OrderComposerPage.tsx` |
| `components/waiter/OrderConfirmModal.tsx` | `features/waiter/components/ConfirmOrderDialog.tsx` |
| `components/admin/AdminLayout.tsx` | `features/admin/components/AdminShell.tsx` |
| `components/admin/LiveTablesMonitoring.tsx` | `features/admin/pages/LiveTablesPage.tsx` |
| بقیه فایل‌های admin | مطابق نام، داخل `features/admin/pages` |

## کانال‌های Realtime

| کانال/رویداد | منتشرکننده | مصرف‌کننده |
|---|---|---|
| `call:created` | مشتری (RPC) | ویترها |
| `call:accepted` / `call:resolved` | ویتر | مشتری همان میز |
| `order:created` | ویتر | ادمین |
| `order:status` | ادمین | ویتر + مشتری |
| `table:updated` | دیتابیس | ادمین (Live Tables) |

اتاق‌ها: `table:{id}`، `waiters`، `admin`.

## امنیت

- PIN ویتر با `argon2`/`bcrypt` هش می‌شود؛ هیچ‌وقت در پاسخ API برنمی‌گردد.
- ورود با کد+پین از طریق Edge Function انجام می‌شود؛ بعد از ۵ تلاش ناموفق،
  کد موقتاً قفل می‌شود.
- نشست ادمین/ویتر با توکن Supabase Auth مدیریت می‌شود؛ نقش در `staff.role`.
- RLS روشن است؛ نقش `anon` به هیچ جدولی جز منوی عمومی دسترسی ندارد.
- `service_role` فقط سمت سرور.

## فازهای اجرا

| فاز | کار | معیار پذیرش |
|---|---|---|
| ۰ | روتر + شکستن Context + `shared/` — **بدون تغییر رفتار** | ظاهر و جریان فعلی عیناً کار می‌کند |
| ۱ | پروژه Supabase + اسکیما + seed منو | منو از دیتابیس خوانده می‌شود |
| ۲ | QR و نشست میز | هر QR به میز درست می‌رسد، نشست تکراری ساخته نمی‌شود |
| ۳ | فراخوان realtime | فراخوان زیر ۲ ثانیه روی تبلت ویتر ظاهر می‌شود |
| ۴ | مشتری → ویتر → ادمین | فیش تاییدشده بدون رفرش در پنل ادمین دیده می‌شود |
| ۵ | احراز هویت واقعی | ورود بدون PIN/پسورد غیرممکن است |

هر فاز جدا commit می‌شود. فاز ۰ و ۱ هم‌زمان انجام نمی‌شوند.

## باز مانده (TBD)

- تبدیل `initialData.ts` به `supabase/seed.sql`
- طراحی برگه چاپ QR برای هر میز
- روش تسویه: POS بیرونی یا پرداخت آنلاین
- سیاست نگهداری داده (حذف فیش‌های قدیمی)
