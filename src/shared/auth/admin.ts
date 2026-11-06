import type { User } from '@supabase/supabase-js';
import { supabase } from '../api/supabase';

/**
 * نشست ادمینِ تاییدشده. وجود این آبجکت یعنی هم Supabase Auth موفق بوده
 * و هم رکورد متناظر در public.staff نقش admin و وضعیت فعال دارد.
 */
export interface AdminSession {
  userId: string;
  email: string;
  fullName: string;
}

export interface AdminLoginResult {
  session: AdminSession | null;
  error: string | null;
}

/**
 * نقش کاربر را از public.staff می‌خواند.
 * فقط رکورد خودِ کاربر قابل خواندن است (policy: staff_select_self).
 */
async function loadAdminProfile(user: User): Promise<AdminSession | null> {
  const { data, error } = await supabase
    .from('staff')
    .select('full_name, role, is_active')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data || data.role !== 'admin' || !data.is_active) return null;

  return {
    userId: user.id,
    email: user.email ?? '',
    fullName: data.full_name || 'مدیر',
  };
}

/** نشست ذخیره‌شده را بازیابی می‌کند؛ اگر کاربر دیگر ادمین نباشد خارج می‌شود. */
export async function restoreAdminSession(): Promise<AdminSession | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;

  const profile = await loadAdminProfile(session.user);
  if (!profile) {
    await supabase.auth.signOut();
    return null;
  }
  return profile;
}

/** ورود با ایمیل/رمز Supabase Auth + بررسی نقش ادمین. */
export async function signInAdmin(email: string, password: string): Promise<AdminLoginResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return { session: null, error: 'ایمیل و رمز عبور را وارد کنید.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.user) {
    const invalid = error?.message?.toLowerCase().includes('invalid');
    return {
      session: null,
      error: invalid ? 'ایمیل یا رمز عبور اشتباه است.' : 'ورود ناموفق بود. دوباره تلاش کنید.',
    };
  }

  let profile: AdminSession | null = null;
  try {
    profile = await loadAdminProfile(data.user);
  } catch {
    profile = null;
  }

  // کاربر Auth معتبر است ولی ادمین نیست؛ نشست نباید باز بماند.
  if (!profile) {
    await supabase.auth.signOut();
    return { session: null, error: 'این حساب دسترسی مدیر فعال ندارد.' };
  }

  return { session: profile, error: null };
}

export async function signOutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}

/** اشتراک روی رویدادهای Supabase Auth (فعلاً فقط SIGNED_OUT استفاده می‌شود). */
export function subscribeToAdminAuth(onEvent: (event: string) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((event) => onEvent(event));
  return () => data.subscription.unsubscribe();
}
