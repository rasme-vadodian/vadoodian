import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const AdminLogin: React.FC = () => {
  const { setAdminView, showToast } = useApp();
  const [username, setUsername] = useState('مدیر شیفت');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      showToast('ورود موفق', 'خوش آمدید! دسترسی کل به پنل مدیریت عمارت فعال گردید.');
      setAdminView('live_tables');
    }, 600);
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-6rem)] flex flex-col justify-between items-center px-4 py-8 select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-28 w-96 h-96 rounded-full bg-[#FFDCC1]/40 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-28 w-96 h-96 rounded-full bg-[#D8E2FF]/30 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-[440px] z-10 my-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-[#EADBCE] px-7 py-9 sm:px-9 sm:py-10">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-24 h-24 mb-4 p-1 bg-[#FAF2EC] rounded-full shadow-inner border border-[#EADBCE]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbYfJkZ19CLez71mjwf78q_7lDstr06froTx3QOGyELM60tNKdApELUZ86rj9XM3mkd0B_o9KIpyFXs3USOrW-FO5sz6cbaPANYuxM-X9CrH7SLxrmJEpC3j7TSNVAixHHEOIN2vCMbv_Snid4yXkFiU-CYo_Y998SY8b5H_HnEDkgQObMIOqCPDJAZiAJWcD4WzIDsb26uZZX1yvZQAIKUVKFS6CCQbFE1AnyYJp9Z5dCDgAy3nj7w"
                alt="نشان کافه و موزه ودودیان"
                className="w-full h-full object-cover rounded-full shadow-sm"
              />
              <span className="absolute bottom-0 right-1 w-7 h-7 bg-[#002252] text-white rounded-full flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[16px]">shield_person</span>
              </span>
            </div>

            <h1 className="text-3xl font-bold text-[#002252] tracking-tight">
              ورود به پنل مدیریت عمارت
            </h1>
            <p className="text-[#6E6B67] text-base mt-1.5 max-w-[320px]">
              مدیریت سفارش‌ها، به‌روزرسانی منو و پایش گزارش‌های روزانه کافه موزه ودودیان
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <label className="text-base text-[#1E1B18] flex items-center gap-1.5 font-bold" htmlFor="username">
                <span className="material-symbols-outlined text-lg text-[#BD8655]">badge</span>
                <span>نام کاربری یا شناسه پرسنلی</span>
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: مدیر شیفت"
                  required
                  className="w-full bg-[#FAF2EC] text-[#1E1B18] text-base rounded-xl pr-10 pl-4 py-3 outline-none focus:bg-white focus:border-[#002252] border border-[#EADBCE] transition-all font-bold"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#BD8655]">
                  <span className="material-symbols-outlined text-xl">person</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-base text-[#1E1B18] flex items-center gap-1.5 font-bold" htmlFor="password">
                <span className="material-symbols-outlined text-lg text-[#BD8655]">lock</span>
                <span>رمز عبور مدیریت</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور خود را وارد کنید"
                  required
                  className="w-full bg-[#FAF2EC] text-[#1E1B18] text-base rounded-xl pr-10 pl-10 py-3 outline-none focus:bg-white focus:border-[#002252] border border-[#EADBCE] transition-all font-bold"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#BD8655]">
                  <span className="material-symbols-outlined text-xl">key</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6E6B67] hover:text-[#002252] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-[#002252] accent-[#002252] cursor-pointer"
                />
                <span className="text-[#6E6B67]">مرا به خاطر بسپار</span>
              </label>
              <button
                type="button"
                onClick={() => showToast('راهنما', 'رمز عبور پیش‌فرض برای مدیر فعال است.')}
                className="text-[#835428] font-bold hover:underline cursor-pointer"
              >
                فراموشی رمز؟
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#002252] text-white text-xl font-bold py-3.5 px-4 rounded-xl shadow-md hover:bg-[#00377B] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-60"
            >
              <span>{isLoading ? 'در حال تایید هویت...' : 'ورود به پنل ادمین'}</span>
              <span className="material-symbols-outlined text-xl rotate-180">arrow_forward</span>
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-4 bg-[#FAF2EC] rounded-xl p-3 flex items-start gap-2.5 border border-[#EADBCE]">
            <span className="material-symbols-outlined text-[#BD8655] text-xl shrink-0 mt-0.5">verified_user</span>
            <p className="text-xs text-[#6E6B67] leading-relaxed text-right">
              دسترسی به این بخش صرفاً مخصوص مدیران و سرپرستان شیفت کافه و موزه ودودیان می‌باشد. تمامی ورودها در سامانه ثبت و پایش می‌شوند.
            </p>
          </div>
        </div>
      </div>

      <footer className="text-center text-[#6E6B67] text-sm mt-4">
        <p>تمامی حقوق برای مجموعه فرهنگی و تاریخی کافه موزه ودودیان محفوظ است.</p>
        <p className="text-xs text-[#835428] font-bold mt-0.5">نسخه سامانه مدیریت ۱.۴</p>
      </footer>
    </div>
  );
};
