import React from 'react';
import { useApp } from '../../context/AppContext';

/**
 * صفحه ورود عمومی.
 *
 * سه مسیر مستقل از هم:
 *  - مشتری: فقط با اسکن QR روی میز
 *  - مهماندار: /waiter/login
 *  - مدیر: /admin/login
 *
 * هیچ لینکی بین این سه ناحیه جابه‌جایی نمی‌کند تا سطح دسترسی هر نقش
 * جدا بماند.
 */
export const LandingPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FFF8F4] px-4 py-10 relative overflow-hidden select-none">
      {/* پس‌زمینه تزئینی */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FFDCC1] blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#EADBCE] blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full overflow-hidden shadow-md bg-[#002252] p-1 border border-[#BD8655]/40 mb-4">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjnnbibp0KG7PnyJCBU2iZjzqKAt_RLAnBBxRefBBNYy82tGLVDVkezDFGCA7V3X-JuIBu_Q9UqphkOd-ElgzS_5mId-oZevI2ZQfkAUQwuFbMeqAKPxqlt5tXoqTnkbbt1bvbqCC_8w-K7VblkCneIco7vlFNI9PPlrani9ZPb4OlqANyjD8ExNfzqOhH8aeirYdadoxXtlNklVcAH2bkyRJ7iTFuX3iHNQ4_zYEdTT1bcQeHQdvFvA"
            alt="نشان کافه و موزه ودودیان"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <h1 className="text-4xl font-bold text-[#002252] leading-tight">
          کافه و موزه ودودیان
        </h1>
        <p className="text-lg text-[#835428] font-bold mt-1 mb-8">
          عمارت تاریخی، پذیرایی اصیل
        </p>

        {/* مشتری */}
        <div className="w-full bg-[#FAF2EC] border border-[#EADBCE] rounded-2xl p-5 mb-3 text-right">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#BD8655] text-2xl">qr_code_scanner</span>
            <h2 className="text-xl font-bold text-[#002252]">مهمان عمارت هستید؟</h2>
          </div>
          <p className="text-sm text-[#6E6B67] leading-relaxed">
            برای مشاهده منو، ثبت سفارش یا فراخوان مهماندار، QR روی میز خود را با دوربین
            گوشی اسکن کنید. نیازی به ثبت‌نام یا رمز عبور نیست.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#835428] bg-white border border-dashed border-[#BD8655] rounded-xl px-3 py-2">
            <span className="material-symbols-outlined text-base">info</span>
            <span>لینک QR هر میز به شکل <span dir="ltr" className="font-mono">/t/…</span> است.</span>
          </div>
        </div>

        {/* ورود پرسنل */}
        <div className="w-full grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate('/waiter/login')}
            className="flex flex-col items-center justify-center gap-2 bg-[#002252] hover:bg-[#00377B] text-white rounded-2xl p-4 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-3xl text-[#F8BA84]">badge</span>
            <span className="font-bold text-lg">ورود مهماندار</span>
            <span className="text-xs text-white/70">کد پرسنلی + پین</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/login')}
            className="flex flex-col items-center justify-center gap-2 bg-white hover:bg-[#FAF2EC] text-[#002252] border border-[#EADBCE] rounded-2xl p-4 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-3xl text-[#BD8655]">admin_panel_settings</span>
            <span className="font-bold text-lg">ورود مدیریت</span>
            <span className="text-xs text-[#6E6B67]">حساب ادمین</span>
          </button>
        </div>

        <p className="text-xs text-[#6E6B67] mt-8 leading-relaxed">
          هر بخش فقط برای نقش خودش طراحی شده است؛ مهمان‌ها به پنل پرسنل و پرسنل به
          منوی مهمان دسترسی ندارند.
        </p>
      </div>
    </div>
  );
};
