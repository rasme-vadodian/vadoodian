import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Waiter } from '../../types';

export const StaffPerformance: React.FC = () => {
  const {
    waiters,
    saveWaiter,
    updateWaiterPin,
    deleteWaiter,
    toPersianDigits,
    formatPrice,
    showToast
  } = useApp();

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [shift, setShift] = useState('شیفت عصر (۱۶:۰۰ الی ۲۴:۰۰)');

  // Quick pin editing state map
  const [pinInputs, setPinInputs] = useState<{ [code: string]: string }>({});
  const [showPinState, setShowPinState] = useState<{ [code: string]: boolean }>({});

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const needsPin = formMode === 'create';
    if (!name.trim() || !code.trim() || (needsPin && pin.length < 4)) {
      showToast(
        'خطا',
        needsPin
          ? 'لطفاً نام، کد کاربری و پین ۴ رقمی را کامل وارد فرمایید.'
          : 'نام و کد کاربری را وارد فرمایید. برای تغییر پین، فیلد پین را پر کنید.'
      );
      return;
    }

    saveWaiter({
      id: editingId,
      name: name.trim(),
      code: code.trim(),
      pin: pin.trim(),
      shift
    });

    // Reset form
    setName('');
    setCode('');
    setPin('');
    setEditingId(undefined);
    setFormMode('create');
  };

  const startEditWaiter = (waiter: Waiter) => {
    setName(waiter.name);
    setCode(waiter.code);
    setPin('');
    setShift(waiter.shift);
    setEditingId(waiter.id);
    setFormMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveInlinePin = (waiterCode: string) => {
    const newPin = pinInputs[waiterCode];
    if (!newPin || newPin.length < 4) {
      showToast('خطا', 'پین باید دقیقاً ۴ رقم باشد.');
      return;
    }
    updateWaiterPin(waiterCode, newPin);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-16 select-none">
      {/* Page Title & Status Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADBCE]/70 pb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-7 bg-[#002252] rounded-full"></div>
            <h1 className="text-3xl font-bold text-[#002252] tracking-tight">عملکرد ویترها و پرسنل</h1>
          </div>
          <p className="text-[#6E6B67] text-lg mt-1 mr-4">
            مدیریت وضعیت و دسترسی پرسنل و ویترهای سالن • ثبت سریع، ویرایش دسترسی‌ها و پین ورود
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-4 py-1.5 rounded-xl bg-[#FAF2EC] border border-[#EADBCE] text-base text-[#002252] font-bold">
            پرسنل حاضر: {toPersianDigits(waiters.length)} نفر
          </span>
        </div>
      </div>

      {/* Section 1: Add / Edit Waiter Form Card (Image 2) */}
      <section className="bg-white rounded-2xl border border-[#EADBCE] shadow-xs overflow-hidden">
        {/* Form Header */}
        <div className="px-6 py-4 bg-[#FAF2EC] border-b border-[#EADBCE] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-2xl text-[#BD8655]">
              {formMode === 'create' ? 'person_add' : 'edit_square'}
            </span>
            <h2 className="text-2xl font-bold text-[#002252]">
              {formMode === 'create' ? 'ثبت ویتر جدید' : `ویرایش مشخصات ویتر: ${name}`}
            </h2>
          </div>

          {formMode === 'edit' && (
            <button
              type="button"
              onClick={() => {
                setFormMode('create');
                setEditingId(undefined);
                setName('');
                setCode('');
                setPin('');
              }}
              className="text-sm text-[#835428] font-bold hover:underline cursor-pointer"
            >
              انصراف و حالت ثبت جدید
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-[#1E1B18] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#BD8655]">badge</span>
                <span>نام و نام خانوادگی</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: امیرحسین رضایی"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF2EC]/50 border border-[#EADBCE] text-lg text-[#1E1B18] outline-none focus:bg-white focus:border-[#002252] transition-all font-bold"
              />
            </div>

            {/* User ID / Code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-[#1E1B18] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#BD8655]">tag</span>
                <span>کد کاربری / شناسه</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="مثال: ۱۰۲۵"
                required
                className="w-full px-3.5 py-2 text-center rounded-xl bg-[#FAF2EC]/50 border border-[#EADBCE] text-lg font-bold text-[#002252] outline-none focus:bg-white focus:border-[#002252] transition-all font-mono"
              />
            </div>

            {/* 4-digit PIN */}
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-[#1E1B18] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#BD8655]">lock</span>
                <span>پین ورود (۴ رقم)</span>
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={formMode === 'edit' ? 'برای عدم تغییر خالی بگذارید' : '••••'}
                required={formMode === 'create'}
                className="w-full px-3.5 py-2 text-center tracking-widest rounded-xl bg-[#FAF2EC]/50 border border-[#EADBCE] text-2xl font-bold text-[#002252] outline-none focus:bg-white focus:border-[#002252] transition-all font-mono"
              />
            </div>

            {/* Shift */}
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-[#1E1B18] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#BD8655]">schedule</span>
                <span>شیفت کاری</span>
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF2EC]/50 border border-[#EADBCE] text-base text-[#1E1B18] outline-none focus:bg-white focus:border-[#002252] transition-all font-bold"
              >
                <option value="شیفت صبح (۰۸:۰۰ الی ۱۶:۰۰)">شیفت صبح (۰۸:۰۰ الی ۱۶:۰۰)</option>
                <option value="شیفت عصر (۱۶:۰۰ الی ۲۴:۰۰)">شیفت عصر (۱۶:۰۰ الی ۲۴:۰۰)</option>
              </select>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-[#EADBCE] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[#6E6B67] text-sm">
              <span className="material-symbols-outlined text-base text-[#BD8655]">info</span>
              <span>کد کاربری و پین چهاررقمی برای ورود پرسنل به اپلیکیشن سفارش‌گیر تبلت استفاده می‌شود.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#002252] hover:bg-[#00377B] text-white text-lg font-bold shadow-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">save</span>
                <span>{formMode === 'create' ? 'ثبت ویتر جدید' : 'ذخیره تغییرات ویتر'}</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Section 2: Waiters List & Performance Table (Image 2) */}
      <section className="bg-white rounded-2xl border border-[#EADBCE] shadow-xs overflow-hidden flex flex-col mb-8">
        {/* Table Header Info */}
        <div className="px-6 py-4 bg-[#FAF2EC] border-b border-[#EADBCE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-2xl text-[#002252]">groups</span>
            <div>
              <h2 className="text-2xl font-bold text-[#002252] leading-tight">فهرست و آمار عملکرد پرسنل</h2>
              <p className="text-xs text-[#6E6B67]">پایش فروش، تعداد سفارشات و امکان ویرایش سریع پین ورود</p>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#FAF2EC]/80 text-[#002252] border-b border-[#EADBCE] text-lg font-bold">
                <th className="py-3.5 px-6">نام و نام خانوادگی</th>
                <th className="py-3.5 px-4 text-center">کد کاربری</th>
                <th className="py-3.5 px-4 text-center">شیفت کاری</th>
                <th className="py-3.5 px-4 text-center">سفارش‌های ثبت‌شده</th>
                <th className="py-3.5 px-4 text-center">مجموع فروش (تومان)</th>
                <th className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1">
                    <span>پین ورود</span>
                    <span className="text-xs text-[#835428] font-normal">(ویرایش سریع)</span>
                  </div>
                </th>
                <th className="py-3.5 px-6 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE] text-base">
              {waiters.map((waiter) => {
                const currentVal = pinInputs[waiter.code] !== undefined ? pinInputs[waiter.code] : waiter.pin;
                const isPassword = !showPinState[waiter.code];

                return (
                  <tr key={waiter.id} className="hover:bg-[#FAF2EC]/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#FFDCC1] text-[#835428] font-bold flex items-center justify-center text-sm">
                          {waiter.name.slice(0, 1)}
                        </div>
                        <span className="font-bold text-lg text-[#002252]">{waiter.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-[#002252] text-xl font-mono">
                      {waiter.code}
                    </td>

                    <td className="py-4 px-4 text-center text-sm text-[#6E6B67]">
                      {waiter.shift.split(' ')[1] || waiter.shift}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-[#002252] text-2xl font-mono">
                      {toPersianDigits(waiter.ordersCount)}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-[#835428] text-lg">
                      {formatPrice(waiter.totalSales)} <span className="text-xs text-[#6E6B67] font-normal">تومان</span>
                    </td>

                    {/* Quick PIN edit input with eye and check */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 p-1 px-2 rounded-xl bg-[#FAF2EC] border border-[#EADBCE] shadow-xs">
                        <span className="material-symbols-outlined text-base text-[#BD8655]">lock</span>
                        <input
                          type={isPassword ? 'password' : 'text'}
                          maxLength={4}
                          value={currentVal}
                          onChange={(e) =>
                            setPinInputs({ ...pinInputs, [waiter.code]: e.target.value })
                          }
                          className="w-16 h-8 text-center font-mono text-base font-bold text-[#002252] tracking-widest bg-white border border-[#EADBCE] rounded-lg outline-none focus:border-[#002252]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPinState({
                              ...showPinState,
                              [waiter.code]: !showPinState[waiter.code]
                            })
                          }
                          className="p-1 text-[#6E6B67] hover:text-[#002252] rounded-lg transition-colors cursor-pointer"
                          title="نمایش / مخفی کردن پین"
                        >
                          <span className="material-symbols-outlined text-base">
                            {isPassword ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveInlinePin(waiter.code)}
                          className="p-1 text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                          title="ذخیره پین جدید"
                        >
                          <span className="material-symbols-outlined text-base">check</span>
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditWaiter(waiter)}
                          className="p-2 rounded-xl text-[#002252] hover:bg-[#002252]/10 transition-colors cursor-pointer"
                          title="ویرایش اطلاعات"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`آیا از حذف پرسنل ${waiter.name} اطمینان دارید؟`)) {
                              deleteWaiter(waiter.id);
                            }
                          }}
                          className="p-2 rounded-xl text-[#6E6B67] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="حذف کاربر"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
