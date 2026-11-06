-- =============================================================
-- ۰۰۰۵ — نشست مهمان با QR، ورود واقعی ویتر، صف فراخوان و سفارش
-- اجرا: node scripts/db.mjs run supabase/migrations/0005_sessions_qr_orders.sql
--
-- چرا RPC؟ ویترها کاربر Supabase Auth ندارند. بنابراین تشخیص هویت ویتر با
-- یک توکن امن در جدول staff_sessions انجام می‌شود و همه عملیات از طریق
-- توابع security definer با RLS دور زده می‌شود؛ اما مشتری/ویتر هرگز به
-- جدول‌ها دسترسی مستقیم ندارند.
-- =============================================================

-- ---------- توکن مهمان روی نشست میز ----------
alter table public.table_sessions
  add column if not exists guest_token text;

update public.table_sessions
   set guest_token = encode(gen_random_bytes(18), 'hex')
 where guest_token is null;

alter table public.table_sessions
  alter column guest_token set default encode(gen_random_bytes(18), 'hex');

alter table public.table_sessions
  alter column guest_token set not null;

create unique index if not exists table_sessions_guest_token_key
  on public.table_sessions (guest_token);

-- ---------- نشست ویتر ----------
create table if not exists public.staff_sessions (
  id           uuid primary key default gen_random_uuid(),
  staff_id     uuid not null references public.staff (id) on delete cascade,
  token        text not null unique default encode(gen_random_bytes(32), 'hex'),
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '16 hours',
  ended_at     timestamptz
);

create index if not exists staff_sessions_staff_idx
  on public.staff_sessions (staff_id, created_at desc);

alter table public.staff_sessions enable row level security;

-- ---------- محدودیت نرخ تلاش ورود ----------
create table if not exists public.login_attempts (
  id           bigserial primary key,
  staff_code   text not null,
  succeeded    boolean not null default false,
  attempted_at timestamptz not null default now()
);

create index if not exists login_attempts_code_time_idx
  on public.login_attempts (staff_code, attempted_at desc);

alter table public.login_attempts enable row level security;

-- =============================================================
-- ابزارها
-- =============================================================
create or replace function public.normalize_digits(p text)
returns text
language sql
immutable
as $$
  select translate(
    coalesce(p, ''),
    '۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩',
    '01234567890123456789'
  );
$$;

-- اعتبارسنجی توکن ویتر + به‌روزرسانی آخرین فعالیت
create or replace function public.waiter_from_token(p_token text)
returns table (
  staff_id   uuid,
  full_name  text,
  code       text,
  shift      text,
  session_id uuid
)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
  select st.id, st.full_name, st.code, st.shift, ss.id
    from public.staff_sessions ss
    join public.staff st on st.id = ss.staff_id
   where ss.token = p_token
     and ss.ended_at is null
     and ss.expires_at > now()
     and st.is_active
   limit 1;

  if found then
    update public.staff_sessions
       set last_seen_at = now()
     where token = p_token;
  end if;
end;
$$;

create or replace function public.staff_id_from_token(p_token text)
returns uuid
language sql
security definer
set search_path = public, extensions
as $$
  select w.staff_id from public.waiter_from_token(p_token) w limit 1;
$$;

-- =============================================================
-- ورود / خروج ویتر
-- =============================================================
create or replace function public.waiter_login(p_code text, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_code    text := btrim(public.normalize_digits(p_code));
  v_pin     text := btrim(public.normalize_digits(p_pin));
  v_staff   public.staff;
  v_fails   integer;
  v_token   text;
  v_session uuid;
begin
  if v_code = '' or v_pin = '' then
    return jsonb_build_object('ok', false, 'error', 'invalid', 'message', 'کد پرسنلی و پین را وارد کنید.');
  end if;

  select count(*) into v_fails
    from public.login_attempts
   where staff_code = v_code
     and not succeeded
     and attempted_at > now() - interval '15 minutes';

  if v_fails >= 5 then
    return jsonb_build_object(
      'ok', false,
      'error', 'rate_limited',
      'message', 'تعداد تلاش‌های ناموفق زیاد است. ۱۵ دقیقه بعد دوباره امتحان کنید.'
    );
  end if;

  select * into v_staff
    from public.staff
   where code = v_code
     and role = 'waiter'
   limit 1;

  if v_staff.id is null
     or not v_staff.is_active
     or v_staff.pin_hash is null
     or extensions.crypt(v_pin, v_staff.pin_hash) <> v_staff.pin_hash then
    insert into public.login_attempts (staff_code, succeeded)
    values (v_code, false);

    return jsonb_build_object('ok', false, 'error', 'invalid', 'message', 'کد پرسنلی یا پین اشتباه است.');
  end if;

  insert into public.login_attempts (staff_code, succeeded)
  values (v_code, true);

  -- هر ویتر روی یک تبلت فعال است؛ نشست قبلی بسته می‌شود.
  update public.staff_sessions
     set ended_at = now()
   where staff_id = v_staff.id
     and ended_at is null;

  insert into public.staff_sessions (staff_id)
  values (v_staff.id)
  returning id, token into v_session, v_token;

  return jsonb_build_object(
    'ok', true,
    'token', v_token,
    'sessionId', v_session,
    'staff', jsonb_build_object(
      'id', v_staff.id,
      'name', v_staff.full_name,
      'code', v_staff.code,
      'shift', coalesce(v_staff.shift, '')
    )
  );
end;
$$;

create or replace function public.waiter_logout(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update public.staff_sessions
     set ended_at = now()
   where token = p_token
     and ended_at is null;

  return jsonb_build_object('ok', true);
end;
$$;

-- =============================================================
-- مشتری: باز کردن نشست با توکن QR
-- =============================================================
create or replace function public.customer_session(p_qr_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_table   public.tables;
  v_session public.table_sessions;
begin
  select * into v_table
    from public.tables
   where qr_token = btrim(p_qr_token)
     and is_active
   limit 1;

  if v_table.id is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_qr', 'message', 'QR این میز معتبر نیست یا میز غیرفعال شده است.');
  end if;

  select * into v_session
    from public.table_sessions
   where table_id = v_table.id
     and status = 'open'
   limit 1;

  if v_session.id is null then
    insert into public.table_sessions (table_id, guest_token)
    values (v_table.id, encode(gen_random_bytes(18), 'hex'))
    returning * into v_session;

    update public.tables
       set status = 'active'
     where id = v_table.id
       and status = 'free';
  end if;

  return jsonb_build_object(
    'ok', true,
    'token', v_session.guest_token,
    'sessionId', v_session.id,
    'table', jsonb_build_object(
      'id', v_table.id,
      'number', v_table.number,
      'capacity', v_table.capacity,
      'name', 'میز ' || v_table.number
    )
  );
end;
$$;

create or replace function public.customer_state(p_guest_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_session public.table_sessions;
  v_table   public.tables;
begin
  select * into v_session
    from public.table_sessions
   where guest_token = p_guest_token
     and status = 'open'
   limit 1;

  if v_session.id is null then
    return jsonb_build_object('ok', false, 'error', 'session_closed', 'message', 'نشست این میز بسته شده است. لطفاً دوباره QR میز را اسکن کنید.');
  end if;

  select * into v_table from public.tables where id = v_session.table_id;

  return jsonb_build_object(
    'ok', true,
    'sessionId', v_session.id,
    'table', jsonb_build_object(
      'id', v_table.id,
      'number', v_table.number,
      'capacity', v_table.capacity,
      'name', 'میز ' || v_table.number,
      'status', v_table.status
    ),
    'call', (
      select jsonb_build_object(
        'id', gr.id,
        'type', gr.type,
        'status', gr.status,
        'createdAt', gr.created_at,
        'acceptedAt', gr.seen_at
      )
       from public.guest_requests gr
      where gr.session_id = v_session.id
        and gr.status in ('pending', 'seen')
      order by gr.created_at desc
      limit 1
    ),
    'orders', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', o.id,
          'number', o.number,
          'status', o.status,
          'subtotal', o.subtotal,
          'serviceFee', o.service_fee,
          'total', o.total,
          'createdAt', o.created_at,
          'items', coalesce((
            select jsonb_agg(jsonb_build_object(
              'name', oi.name,
              'quantity', oi.quantity,
              'unitPrice', oi.unit_price
            ) order by oi.name)
            from public.order_items oi
            where oi.order_id = o.id
          ), '[]'::jsonb)
        ) order by o.created_at desc
      )
      from public.orders o
      where o.session_id = v_session.id
        and o.status not in ('paid', 'cancelled')
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.create_guest_call(
  p_guest_token text,
  p_type text default 'call_waiter',
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_session public.table_sessions;
  v_type    public.guest_request_type := 'call_waiter';
  v_existing public.guest_requests;
  v_call    public.guest_requests;
begin
  select * into v_session
    from public.table_sessions
   where guest_token = p_guest_token
     and status = 'open'
   limit 1;

  if v_session.id is null then
    return jsonb_build_object('ok', false, 'error', 'session_closed', 'message', 'نشست میز باز نیست. QR میز را دوباره اسکن کنید.');
  end if;

  if p_type in ('call_waiter', 'order', 'bill') then
    v_type := p_type::public.guest_request_type;
  end if;

  select * into v_existing
    from public.guest_requests
   where session_id = v_session.id
     and type = v_type
     and status in ('pending', 'seen')
   order by created_at desc
   limit 1;

  if v_existing.id is not null then
    return jsonb_build_object(
      'ok', true,
      'already', true,
      'call', jsonb_build_object('id', v_existing.id, 'type', v_existing.type, 'status', v_existing.status, 'createdAt', v_existing.created_at)
    );
  end if;

  insert into public.guest_requests (session_id, table_id, type, note)
  values (v_session.id, v_session.table_id, v_type, nullif(btrim(p_note), ''))
  returning * into v_call;

  return jsonb_build_object(
    'ok', true,
    'already', false,
    'call', jsonb_build_object('id', v_call.id, 'type', v_call.type, 'status', v_call.status, 'createdAt', v_call.created_at)
  );
end;
$$;

-- =============================================================
-- ویتر: وضعیت کامل سالن
-- =============================================================
create or replace function public.waiter_state(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_staff record;
begin
  select * into v_staff from public.waiter_from_token(p_token) limit 1;

  if v_staff.staff_id is null then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  return jsonb_build_object(
    'ok', true,
    'staff', jsonb_build_object(
      'id', v_staff.staff_id,
      'name', v_staff.full_name,
      'code', v_staff.code,
      'shift', coalesce(v_staff.shift, '')
    ),
    'tables', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', t.number,
        'dbId', t.id,
        'number', t.number,
        'capacity', t.capacity,
        'status', t.status
      ) order by t.number)
      from public.tables t
      where t.is_active
    ), '[]'::jsonb),
    'calls', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', gr.id,
        'tableNumber', t.number,
        'tableName', 'میز ' || t.number,
        'type', gr.type,
        'status', gr.status,
        'createdAt', gr.created_at,
        'note', gr.note
      ) order by gr.created_at)
      from public.guest_requests gr
      join public.tables t on t.id = gr.table_id
      where gr.status in ('pending', 'seen')
    ), '[]'::jsonb),
    'orders', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', o.id,
        'number', o.number,
        'status', o.status,
        'subtotal', o.subtotal,
        'tax', o.tax,
        'serviceFee', o.service_fee,
        'total', o.total,
        'note', o.note,
        'createdAt', o.created_at,
        'tableNumber', t.number,
        'waiterName', coalesce(st.full_name, ''),
        'waiterCode', coalesce(st.code, ''),
        'items', coalesce((
          select jsonb_agg(jsonb_build_object(
            'name', oi.name,
            'quantity', oi.quantity,
            'unitPrice', oi.unit_price,
            'ingredients', oi.ingredients
          ) order by oi.name)
          from public.order_items oi
          where oi.order_id = o.id
        ), '[]'::jsonb)
      ) order by o.created_at desc)
      from public.orders o
      join public.tables t on t.id = o.table_id
      left join public.staff st on st.id = o.waiter_id
      where o.status in ('sent_to_admin', 'in_preparation', 'ready', 'delivered')
    ), '[]'::jsonb),
    'stats', jsonb_build_object(
      'todayOrders', (
        select count(*) from public.orders o
         where o.waiter_id = v_staff.staff_id
           and (o.created_at at time zone 'Asia/Tehran')::date = (now() at time zone 'Asia/Tehran')::date
      ),
      'monthOrders', (
        select count(*) from public.orders o
         where o.waiter_id = v_staff.staff_id
           and date_trunc('month', o.created_at at time zone 'Asia/Tehran')
             = date_trunc('month', now() at time zone 'Asia/Tehran')
      ),
      'totalSales', (
        select coalesce(sum(o.total), 0) from public.orders o
         where o.waiter_id = v_staff.staff_id
           and o.status <> 'cancelled'
      )
    )
  );
end;
$$;

-- =============================================================
-- ویتر: فراخوان‌ها
-- =============================================================
create or replace function public.waiter_accept_call(p_token text, p_call_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_staff uuid := public.staff_id_from_token(p_token);
begin
  if v_staff is null then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  update public.guest_requests
     set status = 'accepted',
         seen_at = coalesce(seen_at, now()),
         handled_by = v_staff
   where id = p_call_id
     and status in ('pending', 'seen');

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.waiter_resolve_call(p_token text, p_call_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_staff uuid := public.staff_id_from_token(p_token);
begin
  if v_staff is null then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  update public.guest_requests
     set status = 'accepted',
         seen_at = coalesce(seen_at, now()),
         resolved_at = now(),
         handled_by = v_staff
   where id = p_call_id
     and status in ('pending', 'seen', 'accepted');

  return jsonb_build_object('ok', true);
end;
$$;

-- =============================================================
-- ویتر: سفارش
-- =============================================================
create or replace function public.waiter_open_table(p_token text, p_table_number integer)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_staff   uuid := public.staff_id_from_token(p_token);
  v_table   public.tables;
  v_session public.table_sessions;
begin
  if v_staff is null then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  select * into v_table
    from public.tables
   where number = p_table_number and is_active
   limit 1;

  if v_table.id is null then
    return jsonb_build_object('ok', false, 'error', 'table_not_found', 'message', 'این میز تعریف نشده است.');
  end if;

  select * into v_session
    from public.table_sessions
   where table_id = v_table.id and status = 'open'
   limit 1;

  if v_session.id is null then
    insert into public.table_sessions (table_id, opened_by, guest_token)
    values (v_table.id, v_staff, encode(gen_random_bytes(18), 'hex'))
    returning * into v_session;

    update public.tables set status = 'active' where id = v_table.id;
  end if;

  return jsonb_build_object('ok', true, 'sessionId', v_session.id, 'token', v_session.guest_token);
end;
$$;

create or replace function public.waiter_create_order(
  p_token text,
  p_table_number integer,
  p_items jsonb,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_staff     uuid := public.staff_id_from_token(p_token);
  v_table     public.tables;
  v_session   public.table_sessions;
  v_item      jsonb;
  v_menu      public.menu_items;
  v_qty       integer;
  v_subtotal  integer := 0;
  v_service   integer;
  v_order     public.orders;
  v_rows      integer := 0;
begin
  if v_staff is null then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty_order', 'message', 'سبد سفارش خالی است.');
  end if;

  select * into v_table
    from public.tables
   where number = p_table_number and is_active
   limit 1;

  if v_table.id is null then
    return jsonb_build_object('ok', false, 'error', 'table_not_found', 'message', 'این میز تعریف نشده است.');
  end if;

  select * into v_session
    from public.table_sessions
   where table_id = v_table.id and status = 'open'
   limit 1;

  if v_session.id is null then
    insert into public.table_sessions (table_id, opened_by, guest_token)
    values (v_table.id, v_staff, encode(gen_random_bytes(18), 'hex'))
    returning * into v_session;
  end if;

  -- قیمت و نام از دیتابیس خوانده می‌شود، نه از مرورگر.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := greatest(0, coalesce((v_item->>'quantity')::integer, 0));
    if v_qty > 0 then
      select * into v_menu
        from public.menu_items
       where id = (v_item->>'menuItemId')::uuid
         and is_available
       limit 1;

      if v_menu.id is null then
        return jsonb_build_object('ok', false, 'error', 'item_unavailable', 'message', 'یکی از اقلام سفارش موجود نیست. منو را تازه‌سازی کنید.');
      end if;

      v_subtotal := v_subtotal + (v_menu.price * v_qty);
      v_rows := v_rows + 1;
    end if;
  end loop;

  if v_rows = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty_order', 'message', 'سبد سفارش خالی است.');
  end if;

  v_service := round(v_subtotal * 0.10)::integer;

  insert into public.orders (
    session_id, table_id, waiter_id, status,
    subtotal, tax, service_fee, total, note
  ) values (
    v_session.id, v_table.id, v_staff, 'sent_to_admin',
    v_subtotal, 0, v_service, v_subtotal + v_service, nullif(btrim(p_note), '')
  ) returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := greatest(0, coalesce((v_item->>'quantity')::integer, 0));
    if v_qty > 0 then
      select * into v_menu
        from public.menu_items
       where id = (v_item->>'menuItemId')::uuid
         and is_available
       limit 1;

      insert into public.order_items (
        order_id, menu_item_id, name, unit_price, quantity, ingredients
      ) values (
        v_order.id, v_menu.id, v_menu.name, v_menu.price, v_qty, v_menu.ingredients
      );
    end if;
  end loop;

  -- فراخوان‌های باز این میز با ثبت سفارش بسته می‌شوند.
  update public.guest_requests
     set status = 'accepted',
         seen_at = coalesce(seen_at, now()),
         resolved_at = now(),
         handled_by = v_staff
   where table_id = v_table.id
     and status in ('pending', 'seen');

  update public.tables set status = 'active' where id = v_table.id;

  return jsonb_build_object(
    'ok', true,
    'orderId', v_order.id,
    'number', v_order.number,
    'total', v_order.total
  );
end;
$$;

create or replace function public.waiter_update_order_status(
  p_token text,
  p_order_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_staff uuid := public.staff_id_from_token(p_token);
begin
  if v_staff is null then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  if p_status not in ('in_preparation', 'ready', 'delivered', 'paid', 'cancelled') then
    return jsonb_build_object('ok', false, 'error', 'invalid_status');
  end if;

  update public.orders
     set status = p_status::public.order_status
   where id = p_order_id;

  return jsonb_build_object('ok', true);
exception
  when check_violation then
    return jsonb_build_object('ok', false, 'error', 'invalid_transition', 'message', 'این تغییر وضعیت مجاز نیست.');
end;
$$;

create or replace function public.waiter_close_table(p_token text, p_table_number integer)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_staff   uuid := public.staff_id_from_token(p_token);
  v_table   public.tables;
  v_session public.table_sessions;
begin
  if v_staff is null then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  select * into v_table
    from public.tables
   where number = p_table_number
   limit 1;

  if v_table.id is null then
    return jsonb_build_object('ok', false, 'error', 'table_not_found');
  end if;

  select * into v_session
    from public.table_sessions
   where table_id = v_table.id and status = 'open'
   limit 1;

  if v_session.id is not null then
    update public.table_sessions
       set status = 'closed', closed_at = now()
     where id = v_session.id;

    update public.guest_requests
       set status = 'expired'
     where session_id = v_session.id
       and status in ('pending', 'seen');
  end if;

  update public.tables set status = 'free' where id = v_table.id;

  return jsonb_build_object('ok', true);
end;
$$;

-- =============================================================
-- ادمین: پرسنل، میزها، فراخوان و وضعیت سفارش
-- =============================================================
create or replace function public.admin_upsert_waiter(
  p_id uuid,
  p_name text,
  p_code text,
  p_pin text,
  p_shift text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_pin text := btrim(public.normalize_digits(p_pin));
  v_staff public.staff;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  if btrim(coalesce(p_name, '')) = '' or btrim(public.normalize_digits(p_code)) = '' then
    return jsonb_build_object('ok', false, 'error', 'invalid', 'message', 'نام و کد پرسنلی الزامی است.');
  end if;

  if p_id is null then
    if v_pin = '' then
      return jsonb_build_object('ok', false, 'error', 'pin_required', 'message', 'برای ویتر جدید پین ۴ رقمی لازم است.');
    end if;

    insert into public.staff (full_name, code, role, pin_hash, shift)
    values (
      btrim(p_name),
      btrim(public.normalize_digits(p_code)),
      'waiter',
      extensions.crypt(v_pin, extensions.gen_salt('bf', 10)),
      nullif(btrim(p_shift), '')
    )
    returning * into v_staff;
  else
    update public.staff
       set full_name = btrim(p_name),
           code = btrim(public.normalize_digits(p_code)),
           shift = nullif(btrim(p_shift), ''),
           is_active = true,
           pin_hash = case
             when v_pin = '' then pin_hash
             else extensions.crypt(v_pin, extensions.gen_salt('bf', 10))
           end
     where id = p_id
       and role = 'waiter'
     returning * into v_staff;

    if v_staff.id is null then
      return jsonb_build_object('ok', false, 'error', 'not_found');
    end if;
  end if;

  return jsonb_build_object('ok', true, 'id', v_staff.id);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'duplicate_code', 'message', 'این کد پرسنلی قبلاً ثبت شده است.');
end;
$$;

create or replace function public.admin_set_waiter_pin(p_id uuid, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_pin text := btrim(public.normalize_digits(p_pin));
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  if length(v_pin) < 4 then
    return jsonb_build_object('ok', false, 'error', 'invalid_pin', 'message', 'پین باید حداقل ۴ رقم باشد.');
  end if;

  update public.staff
     set pin_hash = extensions.crypt(v_pin, extensions.gen_salt('bf', 10))
   where id = p_id
     and role = 'waiter';

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.admin_delete_waiter(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  -- حذف فیزیکی ممکن است به سفارش‌های قبلی آسیب بزند؛ غیرفعال می‌کنیم.
  update public.staff
     set is_active = false
   where id = p_id
     and role = 'waiter';

  update public.staff_sessions
     set ended_at = now()
   where staff_id = p_id
     and ended_at is null;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.admin_add_table(p_number integer, p_capacity integer)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_table public.tables;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  insert into public.tables (number, capacity)
  values (p_number, greatest(1, p_capacity))
  returning * into v_table;

  return jsonb_build_object('ok', true, 'id', v_table.id, 'number', v_table.number, 'qrToken', v_table.qr_token);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'duplicate_table', 'message', 'این شماره میز قبلاً ثبت شده است.');
end;
$$;

create or replace function public.admin_delete_table(p_number integer)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  update public.tables
     set is_active = false
   where number = p_number;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.admin_create_call(p_table_number integer, p_type text default 'call_waiter')
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_admin   public.staff;
  v_table   public.tables;
  v_session public.table_sessions;
  v_type    public.guest_request_type := 'call_waiter';
  v_call    public.guest_requests;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  select * into v_admin from public.staff where auth_user_id = auth.uid() limit 1;
  select * into v_table from public.tables where number = p_table_number and is_active limit 1;

  if v_table.id is null then
    return jsonb_build_object('ok', false, 'error', 'table_not_found');
  end if;

  if p_type in ('call_waiter', 'order', 'bill') then
    v_type := p_type::public.guest_request_type;
  end if;

  select * into v_session
    from public.table_sessions
   where table_id = v_table.id and status = 'open'
   limit 1;

  if v_session.id is null then
    insert into public.table_sessions (table_id, opened_by, guest_token)
    values (v_table.id, v_admin.id, encode(gen_random_bytes(18), 'hex'))
    returning * into v_session;
  end if;

  insert into public.guest_requests (session_id, table_id, type)
  values (v_session.id, v_table.id, v_type)
  returning * into v_call;

  return jsonb_build_object('ok', true, 'callId', v_call.id);
end;
$$;

create or replace function public.admin_update_order_status(p_order_id uuid, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  if p_status not in ('in_preparation', 'ready', 'delivered', 'paid', 'cancelled') then
    return jsonb_build_object('ok', false, 'error', 'invalid_status');
  end if;

  update public.orders
     set status = p_status::public.order_status
   where id = p_order_id;

  return jsonb_build_object('ok', true);
exception
  when check_violation then
    return jsonb_build_object('ok', false, 'error', 'invalid_transition', 'message', 'این تغییر وضعیت مجاز نیست.');
end;
$$;

-- =============================================================
-- دسترسی‌ها: anon فقط از طریق RPC، بدون دسترسی مستقیم به جدول
-- =============================================================
revoke all on function public.normalize_digits(text) from public;
revoke all on function public.waiter_from_token(text) from public;
revoke all on function public.staff_id_from_token(text) from public;
revoke all on function public.waiter_login(text, text) from public;
revoke all on function public.waiter_logout(text) from public;
revoke all on function public.customer_session(text) from public;
revoke all on function public.customer_state(text) from public;
revoke all on function public.create_guest_call(text, text, text) from public;
revoke all on function public.waiter_state(text) from public;
revoke all on function public.waiter_accept_call(text, uuid) from public;
revoke all on function public.waiter_resolve_call(text, uuid) from public;
revoke all on function public.waiter_open_table(text, integer) from public;
revoke all on function public.waiter_create_order(text, integer, jsonb, text) from public;
revoke all on function public.waiter_update_order_status(text, uuid, text) from public;
revoke all on function public.waiter_close_table(text, integer) from public;
revoke all on function public.admin_upsert_waiter(uuid, text, text, text, text) from public;
revoke all on function public.admin_set_waiter_pin(uuid, text) from public;
revoke all on function public.admin_delete_waiter(uuid) from public;
revoke all on function public.admin_add_table(integer, integer) from public;
revoke all on function public.admin_delete_table(integer) from public;
revoke all on function public.admin_create_call(integer, text) from public;
revoke all on function public.admin_update_order_status(uuid, text) from public;

grant execute on function public.waiter_login(text, text) to anon, authenticated;
grant execute on function public.waiter_logout(text) to anon, authenticated;
grant execute on function public.customer_session(text) to anon, authenticated;
grant execute on function public.customer_state(text) to anon, authenticated;
grant execute on function public.create_guest_call(text, text, text) to anon, authenticated;
grant execute on function public.waiter_state(text) to anon, authenticated;
grant execute on function public.waiter_accept_call(text, uuid) to anon, authenticated;
grant execute on function public.waiter_resolve_call(text, uuid) to anon, authenticated;
grant execute on function public.waiter_open_table(text, integer) to anon, authenticated;
grant execute on function public.waiter_create_order(text, integer, jsonb, text) to anon, authenticated;
grant execute on function public.waiter_update_order_status(text, uuid, text) to anon, authenticated;
grant execute on function public.waiter_close_table(text, integer) to anon, authenticated;
grant execute on function public.admin_upsert_waiter(uuid, text, text, text, text) to authenticated;
grant execute on function public.admin_set_waiter_pin(uuid, text) to authenticated;
grant execute on function public.admin_delete_waiter(uuid) to authenticated;
grant execute on function public.admin_add_table(integer, integer) to authenticated;
grant execute on function public.admin_delete_table(integer) to authenticated;
grant execute on function public.admin_create_call(integer, text) to authenticated;
grant execute on function public.admin_update_order_status(uuid, text) to authenticated;

-- گزارش
select
  (select count(*) from public.staff_sessions) as staff_sessions,
  (select count(*) from public.login_attempts) as login_attempts,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'waiter_login','waiter_state','customer_session','create_guest_call',
        'waiter_create_order','admin_upsert_waiter','admin_add_table'
      )) as rpc_count;
