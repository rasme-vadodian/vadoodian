-- =============================================================
-- ۰۰۰۳ — احراز هویت واقعی ادمین
-- اجرا: node scripts/db.mjs run supabase/migrations/0003_admin_auth.sql
-- =============================================================

-- آیا کاربر واردشده (auth.uid) یک ادمین فعال است؟
-- security definer تا خواندن staff از RLS خودش عبور کند و loop نسازد.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff s
    where s.auth_user_id = auth.uid()
      and s.role = 'admin'
      and s.is_active
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- بعد از ورود، فرانت باید بتواند نقش رکورد خودش را بخواند.
drop policy if exists staff_select_self on public.staff;
create policy staff_select_self on public.staff
  for select to authenticated
  using (auth_user_id = auth.uid());

-- دسترسی کامل ادمین به جدول‌ها. anon همچنان هیچ دسترسی‌ای ندارد.
-- (چند policy permissive با هم OR می‌شوند؛ خواندن عمومی منو دست‌نخورده می‌ماند.)
do $$
declare
  t text;
begin
  foreach t in array array[
    'staff',
    'tables',
    'table_sessions',
    'guest_requests',
    'orders',
    'order_items',
    'categories',
    'menu_items'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_admin_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated '
      'using (public.is_admin()) with check (public.is_admin())',
      t || '_admin_all',
      t
    );
  end loop;
end;
$$;

-- گزارش
select
  (select count(*) from pg_policies where schemaname = 'public' and policyname like '%_admin_all') as admin_policies,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_admin') as is_admin_functions;
