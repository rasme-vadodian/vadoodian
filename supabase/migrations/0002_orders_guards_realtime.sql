-- =============================================================
-- ۰۰۰۲ — تکمیل اسکیما: جدول‌های سفارش، محافظ‌ها، policy و realtime
-- این فایل idempotent است و با `node scripts/db.mjs run` اجرا می‌شود.
-- =============================================================

-- ---------------------------- orders ----------------------------
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  number           bigserial,
  session_id       uuid not null references public.table_sessions (id) on delete restrict,
  table_id         uuid not null references public.tables (id) on delete restrict,
  waiter_id        uuid references public.staff (id) on delete set null,
  guest_request_id uuid unique references public.guest_requests (id) on delete set null,
  status           public.order_status not null default 'sent_to_admin',
  subtotal         integer not null default 0,
  tax              integer not null default 0,
  service_fee      integer not null default 0,
  total            integer not null default 0,
  note             text,
  payment_method   public.payment_method,
  created_at       timestamptz not null default now(),
  confirmed_at     timestamptz,
  delivered_at     timestamptz,
  paid_at          timestamptz
);

create index if not exists orders_live_idx
  on public.orders (status, created_at desc)
  where status <> 'paid';

create index if not exists orders_session_idx on public.orders (session_id);
create index if not exists orders_waiter_idx  on public.orders (waiter_id, created_at desc);

-- ------------------------- order_items --------------------------
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid references public.menu_items (id) on delete set null,
  name         text    not null,
  unit_price   integer not null check (unit_price >= 0),
  quantity     integer not null check (quantity > 0),
  ingredients  text,
  note         text
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- =============================================================
-- محافظ گذار وضعیت سفارش
-- =============================================================
create or replace function public.enforce_order_transition()
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

drop trigger if exists orders_transition_guard on public.orders;
create trigger orders_transition_guard
  before update of status on public.orders
  for each row execute function public.enforce_order_transition();

-- =============================================================
-- همگام‌سازی وضعیت میز با درخواست مهمان
-- =============================================================
create or replace function public.sync_table_status()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'pending' then
    update public.tables
       set status = case when new.type = 'order' then 'active'::public.table_status
                         else 'calling'::public.table_status end
     where id = new.table_id;
  elsif new.status in ('accepted', 'rejected', 'expired') then
    update public.tables
       set status = 'active'::public.table_status
     where id = new.table_id
       and status = 'calling'::public.table_status;
  end if;
  return new;
end;
$$;

drop trigger if exists guest_requests_sync_table on public.guest_requests;
create trigger guest_requests_sync_table
  after insert or update of status on public.guest_requests
  for each row execute function public.sync_table_status();

-- =============================================================
-- RLS و policyها
-- =============================================================
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

drop policy if exists menu_public_read on public.menu_items;
create policy menu_public_read on public.menu_items
  for select to anon, authenticated
  using (is_available and show_in_qr);

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select to anon, authenticated
  using (is_active);

-- =============================================================
-- Realtime
-- =============================================================
do $$
declare
  t text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    return;
  end if;

  foreach t in array array['guest_requests', 'orders', 'order_items', 'tables']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end;
$$;

-- =============================================================
-- گزارش
-- =============================================================
select 'tables' as check_item, count(*) as value
from information_schema.tables
where table_schema = 'public' and table_name in (
  'staff','tables','table_sessions','categories','menu_items',
  'guest_requests','orders','order_items'
)
union all
select 'policies', count(*) from pg_policies where schemaname = 'public'
union all
select 'triggers', count(*) from information_schema.triggers where trigger_schema = 'public'
union all
select 'realtime_tables', count(*) from pg_publication_tables
  where pubname = 'supabase_realtime' and schemaname = 'public'
    and tablename in ('guest_requests','orders','order_items','tables');
