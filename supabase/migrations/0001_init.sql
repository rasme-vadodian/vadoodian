-- =============================================================
-- ودودیان — اسکیمای پایه (فاز ۱)
-- اجرا: Supabase → SQL Editor (یا supabase db push)
-- توجه: این فایل روی Supabase نوشته شده؛ به auth.users وابسته است.
-- =============================================================

create extension if not exists pgcrypto;

-- ---------- انواع ----------
create type staff_role          as enum ('admin', 'waiter');
create type table_status        as enum ('free', 'active', 'calling', 'bill_requested');
create type session_status      as enum ('open', 'closed');
create type guest_request_type  as enum ('call_waiter', 'order', 'bill');
create type guest_request_state as enum ('pending', 'seen', 'accepted', 'rejected', 'expired');
create type order_status        as enum ('sent_to_admin', 'in_preparation', 'ready', 'delivered', 'paid', 'cancelled');
create type payment_method      as enum ('pos', 'online', 'cash');

-- ---------- پرسنل ----------
create table staff (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users (id) on delete set null,
  full_name     text        not null,
  code          text        not null unique,
  role          staff_role  not null default 'waiter',
  pin_hash      text,
  shift         text,
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now()
);

-- ---------- میزها ----------
create table tables (
  id          uuid primary key default gen_random_uuid(),
  number      integer not null unique,
  capacity    integer not null default 4 check (capacity > 0),
  section     text    not null default 'سالن اصلی',
  qr_token    text    not null unique default encode(gen_random_bytes(9), 'hex'),
  status      table_status not null default 'free',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- نشست میز ----------
create table table_sessions (
  id          uuid primary key default gen_random_uuid(),
  table_id    uuid not null references tables (id) on delete cascade,
  status      session_status not null default 'open',
  guest_count integer,
  opened_by   uuid references staff (id) on delete set null,
  opened_at   timestamptz not null default now(),
  closed_at   timestamptz
);

-- حداکثر یک نشست باز برای هر میز
create unique index one_open_session_per_table
  on table_sessions (table_id)
  where status = 'open';

-- ---------- منو ----------
create table categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  icon        text not null default 'local_cafe',
  sort_order  integer not null default 0,
  is_active   boolean not null default true
);

create table menu_items (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  name          text not null,
  category_id   uuid not null references categories (id) on delete restrict,
  price         integer not null check (price >= 0),   -- تومان
  ingredients   text not null default '',
  story         text not null default '',
  image_url     text,
  is_available  boolean not null default true,
  is_featured   boolean not null default false,
  show_in_qr    boolean not null default true,
  created_at    timestamptz not null default now()
);

create index menu_items_category_idx on menu_items (category_id) where is_available;

-- ---------- درخواست مهمان (فراخوان / سفارش) ----------
create table guest_requests (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references table_sessions (id) on delete cascade,
  table_id    uuid not null references tables (id) on delete cascade,
  type        guest_request_type  not null,
  status      guest_request_state not null default 'pending',
  -- snapshot اقلام انتخاب‌شده توسط مشتری؛ قیمت‌ها در لحظه ارسال
  items       jsonb not null default '[]'::jsonb,
  note        text,
  created_at  timestamptz not null default now(),
  seen_at     timestamptz,
  resolved_at timestamptz,
  handled_by  uuid references staff (id) on delete set null
);

create index guest_requests_pending_idx
  on guest_requests (table_id, created_at)
  where status in ('pending', 'seen');

-- ---------------------------- سفارش‌ها ----------------------------
create table orders (
  id               uuid primary key default gen_random_uuid(),
  number           bigint generated always as identity,
  session_id       uuid not null references table_sessions (id) on delete restrict,
  table_id         uuid not null references tables (id) on delete restrict,
  waiter_id        uuid references staff (id) on delete set null,
  guest_request_id uuid unique references guest_requests (id) on delete set null,
  status           order_status not null default 'sent_to_admin',
  subtotal         integer not null default 0,
  tax              integer not null default 0,
  service_fee      integer not null default 0,
  total            integer not null default 0,
  note             text,
  payment_method   payment_method,
  created_at       timestamptz not null default now(),
  confirmed_at     timestamptz,
  delivered_at     timestamptz,
  paid_at          timestamptz
);

create index orders_live_idx   on orders (status, created_at desc) where status <> 'paid';
create index orders_session_idx on orders (session_id);
create index orders_waiter_idx  on orders (waiter_id, created_at desc);

-- ------------------------- اقلام سفارش ---------------------------
create table order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders (id) on delete cascade,
  menu_item_id uuid references menu_items (id) on delete set null,
  -- snapshot: اگر قیمت/نام محصول بعداً عوض شد، فیش قدیمی تغییر نکند
  name        text    not null,
  unit_price  integer not null check (unit_price >= 0),
  quantity    integer not null check (quantity > 0),
  ingredients text,
  note        text
);

create index order_items_order_idx on order_items (order_id);

-- =============================================================
-- اعتبارسنجی گذار وضعیت سفارش
-- =============================================================
create or replace function enforce_order_transition()
returns trigger
language plpgsql
as $$
declare
  ok boolean := false;
begin
  if new.status = old.status then
    return new;
  end if;

  ok := case old.status
    when 'sent_to_admin' then new.status in ('in_preparation', 'cancelled')
    when 'in_preparation' then new.status in ('ready', 'cancelled')
    when 'ready'         then new.status in ('delivered', 'cancelled')
    when 'delivered'     then new.status in ('paid', 'cancelled')
    else false
  end;

  if not ok then
    raise exception 'گذار وضعیت نامجاز: % → %', old.status, new.status
      using errcode = 'check_violation';
  end if;

  if new.status = 'in_preparation' then new.confirmed_at := now(); end if;
  if new.status = 'delivered'      then new.delivered_at := now(); end if;
  if new.status = 'paid'           then new.paid_at      := now(); end if;

  return new;
end;
$$;

create trigger orders_transition_guard
  before update of status on orders
  for each row execute function enforce_order_transition();

-- =============================================================
-- به‌روزرسانی وضعیت میز با تغییر نشست/فراخوان
-- =============================================================
create or replace function sync_table_status()
returns trigger
language plpgsql
as $$
begin
  if tg_table_name = 'guest_requests' then
    if new.status = 'pending' then
      update tables set status = 'calling' where id = new.table_id;
    elsif new.status in ('accepted', 'rejected', 'expired') then
      update tables set status = 'active' where id = new.table_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger guest_requests_sync_table
  after insert or update of status on guest_requests
  for each row execute function sync_table_status();

-- =============================================================
-- RLS — پیش‌فرض: بسته. دسترسی‌ها در مایگریشن ۰۰۰۲ (فاز ۲/۳)
-- =============================================================
alter table staff            enable row level security;
alter table tables           enable row level security;
alter table table_sessions   enable row level security;
alter table guest_requests   enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table categories       enable row level security;
alter table menu_items       enable row level security;

-- منو: فقط خواندن عمومی برای مشتری
create policy menu_public_read on menu_items
  for select to anon, authenticated
  using (is_available and show_in_qr);

create policy categories_public_read on categories
  for select to anon, authenticated
  using (is_active);

-- =============================================================
-- Realtime
-- =============================================================
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table guest_requests, orders, order_items, tables;
  end if;
end;
$$;

-- =============================================================
-- TODO (مایگریشن ۰۰۰۲):
--   RPC ساخت نشست از qr_token
--   RPC ثبت درخواست مهمان (anon)
--   سیاست‌های staff/admin
--   محدودیت نرخ تلاش ورود
-- =============================================================
