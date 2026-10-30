import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const WaiterPinLogin: React.FC = () => {
  const { waiters, setActiveWaiter, setWaiterView, showToast, toPersianDigits } = useApp();

  const [selectedShift, setSelectedShift] = useState<'evening' | 'morning'>('evening');
  const [selectedWaiterCode, setSelectedWaiterCode] = useState('۱۰۲۱');
  const [enteredPin, setEnteredPin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const activeWaiter = waiters.find((w) => w.code === selectedWaiterCode) || waiters[0];

  const handleAppendDigit = (digit: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      if (nextPin.length === 4) {
        // Auto trigger login or feedback
      }
    }
  };

  const handleBackspace = () => {
    if (enteredPin.length > 0) {
      setEnteredPin(enteredPin.slice(0, -1));
    }
  };

  const handleClearPin = () => {
    setEnteredPin('');
  };

  const handleSubmit = () => {
    if (enteredPin.length < 4) {
      showToast('خطا', 'لطفاً پین‌کد ۴ رقمی خود را وارد فرمایید.');
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      setActiveWaiter(activeWaiter);
      showToast('ورود موفق', `خوش آمدید، مهماندار ${activeWaiter.name}! شیفت فعال گردید.`);
      setWaiterView('waiter_workspace');
    }, 500);
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

        {/* Shift Selection */}
        <div className="bg-[#FAF2EC] rounded-2xl p-3.5 shadow-xs border border-[#EADBCE] mb-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-bold text-[#1E1B18] flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-[#BD8655]">schedule</span>
              <span>شیفت کاری فعال:</span>
            </span>
            <span className="text-xs text-[#6E6B67] font-bold">امروز ۲۴ آبان</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedShift('evening')}
              className={`flex flex-col items-start p-2.5 rounded-xl text-right transition-all cursor-pointer ${
                selectedShift === 'evening'
                  ? 'bg-[#002252] text-white shadow-sm ring-1 ring-[#BD8655]/40'
                  : 'bg-white text-[#1E1B18] border border-[#EADBCE]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-0.5">
                <span className="text-lg font-bold">شیفت عصر</span>
                <span className="material-symbols-outlined text-base text-[#F8BA84]">wb_twilight</span>
              </div>
              <span className="text-xs opacity-80 font-mono">۱۶:۰۰ الی ۲۴:۰۰</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedShift('morning')}
              className={`flex flex-col items-start p-2.5 rounded-xl text-right transition-all cursor-pointer ${
                selectedShift === 'morning'
                  ? 'bg-[#002252] text-white shadow-sm ring-1 ring-[#BD8655]/40'
                  : 'bg-white text-[#1E1B18] border border-[#EADBCE]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-0.5">
                <span className="text-lg font-bold">شیفت صبح</span>
                <span className="material-symbols-outlined text-base text-[#BD8655]">wb_sunny</span>
              </div>
              <span className="text-xs opacity-80 font-mono">۰۸:۰۰ الی ۱۶:۰۰</span>
            </button>
          </div>
        </div>

        {/* Waiter Quick Select Chips */}
        <div className="bg-[#FAF2EC] rounded-2xl p-3.5 shadow-xs border border-[#EADBCE] mb-3.5">
          <label className="text-base font-bold text-[#1E1B18] flex items-center gap-1 mb-2">
            <span className="material-symbols-outlined text-base text-[#BD8655]">person</span>
            <span>انتخاب سریع مهماندار:</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {waiters.slice(0, 3).map((w) => {
              const isSelected = selectedWaiterCode === w.code;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    setSelectedWaiterCode(w.code);
                    setEnteredPin('');
                  }}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#BD8655] text-white shadow-sm ring-2 ring-[#002252]'
                      : 'bg-white text-[#1E1B18] border border-[#EADBCE] hover:border-[#BD8655]'
                  }`}
                >
                  <div className="text-base font-bold truncate leading-tight">{w.name}</div>
                  <div className="text-xs mt-0.5 font-mono opacity-80">کد {w.code}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Handheld PIN Pad Interface */}
        <div className="bg-[#FAF2EC] rounded-2xl p-3.5 shadow-xs border border-[#EADBCE] mb-4">
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
                className="h-12 rounded-xl bg-white text-2xl font-bold text-[#002252] shadow-xs active:bg-[#FFDCC1] border border-[#EADBCE] transition-all flex items-center justify-center cursor-pointer"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClearPin}
              className="h-12 rounded-xl bg-[#FAF2EC] text-base font-bold text-[#6E6B67] border border-[#EADBCE] active:bg-[#EADBCE] transition-all flex items-center justify-center cursor-pointer"
            >
              لغو
            </button>

            <button
              type="button"
              onClick={() => handleAppendDigit('۰')}
              className="h-12 rounded-xl bg-white text-2xl font-bold text-[#002252] shadow-xs active:bg-[#FFDCC1] border border-[#EADBCE] transition-all flex items-center justify-center cursor-pointer"
            >
              ۰
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-xl bg-[#FAF2EC] text-[#002252] border border-[#EADBCE] active:bg-[#EADBCE] transition-all flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">backspace</span>
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoggingIn}
          className="w-full bg-[#002252] hover:bg-[#00377B] text-white py-3.5 px-4 rounded-2xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-3 cursor-pointer disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-2xl">login</span>
          <span className="text-xl font-bold tracking-wide">
            {isLoggingIn ? 'در حال ورود به سالن...' : 'ورود به شیفت و سالن'}
          </span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="bg-[#FAF2EC] rounded-xl p-2.5 flex items-start gap-2 text-[#6E6B67] border border-[#EADBCE] text-xs">
        <span className="material-symbols-outlined text-[#BD8655] text-lg shrink-0 mt-0.5">info</span>
        <p className="leading-snug">
          رمز عبور نمونه: برای ویتر انتخابی پین ۴ رقمی (مثلاً 4123) ثبت شده است.
        </p>
      </div>
    </div>
  );
};
