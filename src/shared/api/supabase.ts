import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  throw new Error(
    'VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY تنظیم نشده‌اند. فایل .env را از روی .env.example بساز.'
  );
}

/**
 * کلاینت Supabase برای استفاده در مرورگر.
 * فقط anon key اینجا مجاز است؛ service_role هرگز نباید در باندل فرانت قرار بگیرد.
 */
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
