import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { normalizeDigits } from '../../shared/api/mappers';

export const WaiterPinLogin: React.FC = () => {
  const { loginWaiter, navigate } = useApp();

  const [staffCode, setStaffCode] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const handleAppendDigit = (digit: string) => {
    if (isLoggingIn) return;
    setError('');
    setEnteredPin((prev) => (prev.length < 4 ? prev + digit : prev));
  };

  const handleBackspace = () => {
    if (isLoggingIn) return;
    setError('');
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  const handleClearPin = () => {
    if (isLoggingIn) return;
    setError('');
    setEnteredPin('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoggingIn) return;

    const code = normalizeDigits(staffCode).trim();
    const pin = normalizeDigits(enteredPin).trim();

    if (!code) {
      setError('کد پرسنلی خود را وارد کنید.');
      return;
    }
    if (pin.length < 4) {
      setError('پین‌کد ۴ رقمی را کامل وارد کنید.');
      return;
    }

    setIsLoggingIn(true);
    setError('');
    try {
      const result = await loginWaiter(code, pin);
      if (!result.ok) {
        setError(result.message ?? 'ورود ناموفق بود.');
        setEnteredPin('');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto min-h-screen justify-between p-4 bg-[#FFF8F4] select-none">
      <div className="flex flex-col">
        {/* Emblem & Identity Section */}
        <div className="flex flex-col items-center justify-center pt-2 pb-4 text-center">
          <div className="relative mb-2">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-md bg-[#002252] p-1 flex items-center justify-center border border-[#BD8655]/40">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjnnbibp0KG7PnyJCBU2iZjzqKAt_RLAnBBxRefBBNYy82tGLVDVkezDFGCA7V3X-JuIBu_Q9UqphkOd-ElgzS_5mId-oZevI2ZQfkAUQwuFbMeqAKPxqlt5tXoqTnkbbt1bvbqCC_8w-K7VblkCneIco7vlFNI9PPlrani9ZPb4OlqANyjD8ExNfzqOhH8aeirYdadoxXtlNklVcAH2bkyRJ7iTFuX3iHNQ4_zYEdTT1bcQeHQdvFvA"
                alt="نشان کافه و موزه ودودیان"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="absolute bottom-0 right-0 bg-[#BD8655] text-white rounded-full p-1.5 shadow-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">badge</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#002252] leading-tight">ورود مهمانداران سالن</h1>
          <p className="text-lg text-[#835428] font-bold">کافه و موزه تاریخی ودودیان</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Staff Code */}
          <div className="bg-[#FAF2EC] rounded-2xl p-3.5 shadow-xs border border-[#EADBCE] mb-3.5">
            <label htmlFor="staff-code" className="text-base font-bold text-[#1E1B18] flex items-center gap-1 mb-2">
              <span className="material-symbols-outlined text-base text-[#BD8655]">person</span>
              <span>کد پرسنلی:</span>
            </label>
            <input
              id="staff-code"
              type="text"
              inputMode="numeric"
              autoComplete="username"
              value={staffCode}
              onChange={(e) => {
                setError('');
                setStaffCode(e.target.value);
              }}
              disabled={isLoggingIn}
              placeholder="مثلاً ۱۰۲۱"
              className="w-full bg-white border-2 border-[#EADBCE] focus:border-[#002252] rounded-xl px-4 py-2.5 text-center text-2xl font-bold font-mono text-[#002252] outline-none transition-colors disabled:opacity-60"
            />
          </div>

          {/* Handheld PIN Pad Interface */}
          <div className="bg-[#FAF2EC] rounded-2xl p-3.5 shadow-xs border border-[#EADBCE] mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-base font-bold text-[#1E1B18] flex items-center gap-1">
                <span className="material-symbols-outlined text-base text-[#BD8655]">lock</span>
                <span>پین‌کد ورود ۴ رقمی:</span>
              </div>
              <button
                type="button"
                onClick={handleClearPin}
                className="text-sm text-[#835428] font-bold hover:underline cursor-pointer"
              >
                پاک کردن
              </button>
            </div>

            {/* 4 Visual Dots */}
            <div className="flex items-center justify-center gap-4 py-2 mb-3 bg-white rounded-xl border border-[#EADBCE]">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = idx < enteredPin.length;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                      isFilled ? 'bg-[#002252] scale-125 shadow-xs' : 'bg-gray-300'
                    }`}
                  />
                );
              })}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {['۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleAppendDigit(digit)}
                  disabled={isLoggingIn}
                  className="h-12 rounded-xl bg-white text-2xl font-bold text-[#002252] shadow-xs active:bg-[#FFDCC1] border border-[#EADBCE] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {digit}
                </button>
              ))}

              <button
                type="button"
                onClick={handleClearPin}
                disabled={isLoggingIn}
                className="h-12 rounded-xl bg-[#FAF2EC] text-base font-bold text-[#6E6B67] border border-[#EADBCE] active:bg-[#EADBCE] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                لغو
              </button>

              <button
                type="button"
                onClick={() => handleAppendDigit('۰')}
                disabled={isLoggingIn}
                className="h-12 rounded-xl bg-white text-2xl font-bold text-[#002252] shadow-xs active:bg-[#FFDCC1] border border-[#EADBCE] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                ۰
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                disabled={isLoggingIn}
                className="h-12 rounded-xl bg-[#FAF2EC] text-[#002252] border border-[#EADBCE] active:bg-[#EADBCE] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-2xl">backspace</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-red-800 text-sm font-bold">
              <span className="material-symbols-outlined text-lg shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-[#002252] hover:bg-[#00377B] text-white py-3.5 px-4 rounded-2xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-3 cursor-pointer disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-2xl">login</span>
            <span className="text-xl font-bold tracking-wide">
              {isLoggingIn ? 'در حال ورود به سالن...' : 'ورود به شیفت و سالن'}
            </span>
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col gap-2">
        <div className="bg-[#FAF2EC] rounded-xl p-2.5 flex items-start gap-2 text-[#6E6B67] border border-[#EADBCE] text-xs">
          <span className="material-symbols-outlined text-[#BD8655] text-lg shrink-0 mt-0.5">info</span>
          <p className="leading-snug">
            کد پرسنلی و پین خود را از مدیر عمارت دریافت کنید. پس از چند تلاش ناموفق،
            ورود موقتاً محدود می‌شود.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm text-[#835428] font-bold hover:underline cursor-pointer"
        >
          بازگشت به صفحه اصلی
        </button>
      </div>
    </div>
  );
};
