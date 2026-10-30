import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const WaiterWorkspace: React.FC = () => {
  const {
    activeWaiter,
    calls,
    orders,
    acceptCall,
    resolveCall,
    setSelectedTableForOrder,
    setWaiterView,
    setWaiterProfileModalOpen,
    toPersianDigits,
    formatPrice,
    showToast
  } = useApp();

  const [manualTableNumber, setManualTableNumber] = useState('');
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({
    't4-item-1': 2,
    't4-item-2': 1,
    't7-item-1': 3,
    't7-item-2': 1
  });

  const pendingCalls = calls.filter((c) => c.status === 'pending');
  const urgentCall = pendingCalls[0];

  const handleManualTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tableNum = parseInt(manualTableNumber, 10);
    if (!tableNum) {
      showToast('خطا', 'لطفاً شماره میز معتبر وارد فرمایید.');
      return;
    }
    setSelectedTableForOrder(tableNum);
    setWaiterView('waiter_ordering');
  };

  const handleQtyChange = (key: string, delta: number) => {
    setItemQuantities((prev) => {
      const current = prev[key] || 1;
      const next = Math.max(0, current + delta);
      return { ...prev, [key]: next };
    });
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-[#FFF8F4] relative overflow-hidden pb-24 select-none">
      {/* Top Header */}
      <header className="bg-[#002252] text-white px-4 pt-4 pb-4 border-b border-[#00377B] relative z-10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#00377B] border border-white/20 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              <span className="material-symbols-outlined text-xl">restaurant_menu</span>
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none tracking-tight">کافه و موزه ودودیان</h1>
              <span className="text-xs text-[#FFDCC1] font-mono">سیستم مهمانداری تالار</span>
            </div>
          </div>

          {/* Time & Live Indicator */}
          <div className="flex items-center gap-2 bg-[#001A41]/80 px-2.5 py-1 rounded-full border border-white/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-[#D8E2FF]">۱۸:۴۵ عصر</span>
          </div>
        </div>

        {/* Waiter Identity Strip */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#BD8655] border border-white/20 flex items-center justify-center text-white font-bold">
              <span className="material-symbols-outlined text-xl">person</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-white">
                {activeWaiter ? activeWaiter.name : 'علی رضایی'}
              </span>
              <span className="text-xs text-[#FFDCC1]">
                {activeWaiter ? activeWaiter.shift : 'سالن تالار آینه • شیفت عصر'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setWaiterProfileModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-base text-[#F8BA84]">analytics</span>
            <span>مشاهده عملکرد</span>
          </button>
        </div>
      </header>

      {/* KPI Active Calls Strip */}
      <section className="w-full px-4 py-3 bg-[#FAF2EC] border-b border-[#EADBCE]">
        <div className="bg-white p-3 rounded-2xl border border-[#EADBCE] shadow-xs flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl animate-bounce">notifications_active</span>
            </div>
            <div>
              <span className="text-base font-bold text-[#1E1B18] block leading-tight">
                تعداد فراخوان‌های فعال
              </span>
              <span className="text-xs text-[#6E6B67]">نیازمند مراجعه و پاسخگویی سریع سر میز</span>
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-xl text-red-700">
            <span className="text-2xl font-bold font-mono">
              {toPersianDigits(pendingCalls.length)}
            </span>
            <span className="text-xs font-bold">میز</span>
          </div>
        </div>
      </section>

      {/* Main Urgent Call Banner (Image 20) */}
      <section className="p-4 pt-3">
        {urgentCall ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 via-white to-[#FFDCC1]/40 border-2 border-red-500 p-4 shadow-md transition-all duration-300">
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </span>
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                    نیازمند پاسخ فوری
                  </span>
                </div>
                <span className="text-xs text-[#6E6B67] flex items-center gap-1 bg-[#FAF2EC] px-2 py-0.5 rounded-lg border border-[#EADBCE]">
                  <span className="material-symbols-outlined text-xs text-[#BD8655]">schedule</span>
                  <span>{toPersianDigits(urgentCall.minutesAgo || 2)} دقیقه پیش</span>
                </span>
              </div>

              {/* Highlight Detail */}
              <div className="flex gap-3 items-center">
                <div className="px-4 h-14 rounded-2xl bg-red-100 border border-red-200 flex flex-row items-center justify-center gap-1.5 shrink-0 text-red-800">
                  <span className="text-sm font-medium">میز</span>
                  <span className="text-3xl font-bold font-mono leading-none">
                    {toPersianDigits(urgentCall.tableNumber)}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1E1B18] leading-tight">فراخوانی مهماندار</h2>
                  <p className="text-xs text-[#6E6B67] mt-0.5">
                    مهمان در {urgentCall.tableName} درخواست حضور ویتر دارد.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => acceptCall(urgentCall.id)}
                  className="bg-[#002252] hover:bg-[#00377B] text-white py-2.5 px-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">receipt_long</span>
                  <span>ثبت سفارش میز</span>
                </button>

                <button
                  type="button"
                  onClick={() => resolveCall(urgentCall.id)}
                  className="bg-white border border-[#EADBCE] text-[#002252] hover:bg-[#FAF2EC] py-2.5 px-3 rounded-xl font-bold text-base flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl text-emerald-700">check</span>
                  <span>پاسخ داده شد</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900">
            <span className="material-symbols-outlined text-2xl text-emerald-600">check_circle</span>
            <div>
              <p className="font-bold text-base">در حال حاضر همه درخواست‌های سالن پاسخ داده شده‌اند.</p>
              <p className="text-xs text-emerald-700">آماده دریافت فراخوان‌های بعدی از سر میزها</p>
            </div>
          </div>
        )}
      </section>

      {/* Active Orders & Items Editing Section (Image 20) */}
      <main className="px-4 space-y-4 flex-1">
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#BD8655] text-xl">receipt_long</span>
              <h3 className="font-bold text-lg text-[#002252] leading-tight">سفارش‌های ثبت‌شده و ویرایش اقلام</h3>
            </div>
            <span className="text-xs bg-[#FFDCC1] text-[#835428] px-2.5 py-0.5 rounded-full font-bold">
              ۲ سفارش فعال
            </span>
          </div>

          {/* Table 4 Active Order Card */}
          <div className="rounded-2xl bg-white border border-[#EADBCE] shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-xl bg-[#002252] text-white font-bold text-sm font-mono">
                  میز ۴
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#1E1B18] leading-tight">سفارش شماره #۱۰۴</h4>
                  <span className="text-xs text-[#6E6B67]">ثبت: ۱۲ دقیقه پیش</span>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                در حال سرو
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF2EC] border border-[#EADBCE]/60">
                <div className="flex flex-col">
                  <span className="font-bold text-base text-[#1E1B18]">قهوه دمی قجری ودودیان</span>
                  <span className="text-xs text-[#835428] font-bold">۸۵,۰۰۰ تومان</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQtyChange('t4-item-1', -1)}
                    className="w-8 h-8 rounded-xl bg-white border border-[#EADBCE] text-[#002252] flex items-center justify-center font-bold text-lg hover:bg-[#FAF2EC] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg text-[#002252] w-5 text-center font-mono">
                    {toPersianDigits(itemQuantities['t4-item-1'] || 0)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQtyChange('t4-item-1', 1)}
                    className="w-8 h-8 rounded-xl bg-white border border-[#EADBCE] text-[#002252] flex items-center justify-center font-bold text-lg hover:bg-[#FAF2EC] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF2EC] border border-[#EADBCE]/60">
                <div className="flex flex-col">
                  <span className="font-bold text-base text-[#1E1B18]">شیرینی سنتی باقلوا پسته</span>
                  <span className="text-xs text-[#835428] font-bold">۶۵,۰۰۰ تومان</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQtyChange('t4-item-2', -1)}
                    className="w-8 h-8 rounded-xl bg-white border border-[#EADBCE] text-[#002252] flex items-center justify-center font-bold text-lg hover:bg-[#FAF2EC] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg text-[#002252] w-5 text-center font-mono">
                    {toPersianDigits(itemQuantities['t4-item-2'] || 0)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQtyChange('t4-item-2', 1)}
                    className="w-8 h-8 rounded-xl bg-white border border-[#EADBCE] text-[#002252] flex items-center justify-center font-bold text-lg hover:bg-[#FAF2EC] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedTableForOrder(4);
                setWaiterView('waiter_ordering');
              }}
              className="w-full py-2 rounded-xl border border-dashed border-[#BD8655] text-[#835428] hover:bg-[#FFDCC1]/30 text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              <span>ویرایش و افزودن اقلام دیگر به میز ۴</span>
            </button>
          </div>

          {/* Table 7 Active Order Card */}
          <div className="rounded-2xl bg-white border border-[#EADBCE] shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-xl bg-[#835428] text-white font-bold text-sm font-mono">
                  میز ۷
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#1E1B18] leading-tight">سفارش شماره #۱۰۷</h4>
                  <span className="text-xs text-[#6E6B67]">ثبت: ۵ دقیقه پیش</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF2EC] border border-[#EADBCE]/60">
                <div className="flex flex-col">
                  <span className="font-bold text-base text-[#1E1B18]">چای لاهیجان با هل و دارچین</span>
                  <span className="text-xs text-[#835428] font-bold">۴۵,۰۰۰ تومان</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQtyChange('t7-item-1', -1)}
                    className="w-8 h-8 rounded-xl bg-white border border-[#EADBCE] text-[#002252] flex items-center justify-center font-bold text-lg hover:bg-[#FAF2EC] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg text-[#002252] w-5 text-center font-mono">
                    {toPersianDigits(itemQuantities['t7-item-1'] || 0)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQtyChange('t7-item-1', 1)}
                    className="w-8 h-8 rounded-xl bg-white border border-[#EADBCE] text-[#002252] flex items-center justify-center font-bold text-lg hover:bg-[#FAF2EC] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Manual Table Order Section (Image 20) */}
        <section className="rounded-2xl bg-white border border-[#EADBCE] shadow-xs p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#FAF2EC] text-[#002252] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">table_restaurant</span>
            </span>
            <h3 className="font-bold text-base text-[#002252] leading-tight">انتخاب دستی میز و ثبت سفارش</h3>
          </div>

          <p className="text-xs text-[#6E6B67]">
            شماره میز مورد نظر را مستقیماً وارد کنید تا فرایند ثبت سفارش الکترونیک آغاز شود:
          </p>

          <form onSubmit={handleManualTableSubmit} className="flex flex-col gap-3">
            <div className="relative w-full">
              <input
                type="number"
                min={1}
                max={99}
                value={manualTableNumber}
                onChange={(e) => setManualTableNumber(e.target.value)}
                placeholder="شماره میز (مثلاً ۴)"
                className="w-full bg-[#FAF2EC] border-2 border-[#EADBCE] focus:border-[#002252] rounded-xl px-4 py-2.5 text-center text-2xl font-bold font-mono text-[#002252] outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6E6B67] text-xs pointer-events-none font-bold">
                شماره میز:
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#002252] hover:bg-[#00377B] text-white py-3 px-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">note_add</span>
              <span>ورود و ثبت سفارش میز</span>
            </button>
          </form>
        </section>
      </main>

      {/* Fixed Bottom Bar (Image 20) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-[#EADBCE] px-4 py-2.5 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setWaiterProfileModalOpen(true)}
          className="flex flex-col items-center gap-1 text-[#00377B] cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-[#FAF2EC] flex items-center justify-center text-[#00377B]">
            <span className="material-symbols-outlined text-xl">person</span>
          </div>
          <p className="text-xs font-bold">پروفایل و عملکرد ویتر</p>
        </button>
      </div>
    </div>
  );
};
