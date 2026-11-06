-- =============================================================
-- تست محافظ گذار وضعیت سفارش و همگام‌سازی وضعیت میز
-- اجرا: node scripts/db.mjs run supabase/tests/0002_guard_test.sql
-- همه‌چیز داخل تراکنش است و در پایان rollback می‌شود (داده‌ای باقی نمی‌ماند).
-- =============================================================
begin;

do $$
declare
  t_id      uuid;
  s_id      uuid;
  o_id      uuid;
  r_id      uuid;
  st        public.table_status;
  ok        boolean := false;
begin
  -- ---------- آماده‌سازی ----------
  insert into public.tables (number, capacity)
  values (9999, 2)
  returning id into t_id;

  insert into public.table_sessions (table_id) values (t_id) returning id into s_id;

  insert into public.orders (session_id, table_id, subtotal, total)
  values (s_id, t_id, 100000, 100000)
  returning id into o_id;

  -- ---------- تست ۱: گذار مجاز ----------
  update public.orders set status = 'in_preparation' where id = o_id;

  if (select confirmed_at from public.orders where id = o_id) is null then
    raise exception 'تست ۱ شکست خورد: confirmed_at پر نشد';
  end if;
  raise notice 'تست ۱ ✅ گذار مجاز انجام شد و confirmed_at پر شد';

  -- ---------- تست ۲: گذار نامجاز ----------
  begin
    update public.orders set status = 'paid' where id = o_id;
    raise exception 'تست ۲ شکست خورد: گذار in_preparation → paid پذیرفته شد!';
  exception
    when check_violation then
      ok := true;
  end;

  if not ok then
    raise exception 'تست ۲ شکست خورد: خطای expected رخ نداد';
  end if;
  raise notice 'تست ۲ ✅ گذار نامجاز in_preparation → paid رد شد';

  -- ---------- تست ۳: گذار مجاز بعدی ----------
  update public.orders set status = 'ready' where id = o_id;
  update public.orders set status = 'delivered' where id = o_id;

  if (select delivered_at from public.orders where id = o_id) is null then
    raise exception 'تست ۳ شکست خورد: delivered_at پر نشد';
  end if;
  raise notice 'تست ۳ ✅ مسیر sent_to_admin → … → delivered کامل شد';

  -- ---------- تست ۴: وضعیت میز با فراخوان ----------
  insert into public.guest_requests (session_id, table_id, type)
  values (s_id, t_id, 'call_waiter')
  returning id into r_id;

  select status into st from public.tables where id = t_id;
  if st <> 'calling' then
    raise exception 'تست ۴ شکست خورد: وضعیت میز % شد، انتظار calling', st;
  end if;
  raise notice 'تست ۴ ✅ فراخوان، وضعیت میز را calling کرد';

  -- ---------- تست ۵: پایان فراخوان ----------
  update public.guest_requests set status = 'accepted' where id = r_id;

  select status into st from public.tables where id = t_id;
  if st <> 'active' then
    raise exception 'تست ۵ شکست خورد: وضعیت میز % شد، انتظار active', st;
  end if;
  raise notice 'تست ۵ ✅ پذیرش فراخوان، وضعیت میز را active کرد';

  -- ---------- تست ۶: یک نشست باز برای هر میز ----------
  begin
    insert into public.table_sessions (table_id) values (t_id);
    raise exception 'تست ۶ شکست خورد: نشست دوم ساخته شد!';
  exception
    when unique_violation then
      raise notice 'تست ۶ ✅ نشست دوم برای همان میز رد شد';
  end;

  raise notice '🎉 همه تست‌ها پاس شدند';
end;
$$;

rollback;
