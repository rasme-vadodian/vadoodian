import React from 'react';
import { useApp } from '../../context/AppContext';

export const WaiterProfileModal: React.FC = () => {
  const {
    activeWaiter,
    waiterProfileModalOpen,
    setWaiterProfileModalOpen,
    logoutWaiter,
    toPersianDigits,
    formatPrice
  } = useApp();

  if (!waiterProfileModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#002252]/40 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#BD8655]/20 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header Section (Image 16) */}
        <div className="relative bg-[#FAF2EC] px-6 pt-3 pb-4 border-b border-[#EADBCE] flex-shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#002252] text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-2xl text-[#F8BA84]">badge</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#002252] tracking-tight">
                  پروفایل و عملکرد روزانه مهماندار
                </h1>
                <span className="text-xs text-[#835428]">سامانه نظارت تالار عمارت</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWaiterProfileModalOpen(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#002252] via-[#BD8655] to-[#002252]"></div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Identity Card */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#1E1B18]">نام و نام خانوادگی ویتر</label>
            <div className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-[#EADBCE] bg-[#FAF2EC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#835428] border border-[#EADBCE] shrink-0 font-bold">
                  <span className="material-symbols-outlined text-2xl">badge</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-[#002252]">
                    {activeWaiter ? activeWaiter.name : 'مهماندار'}
                  </span>
                  <div className="text-xs text-[#6E6B67] mt-0.5">
                    کد پرسنلی: {activeWaiter ? toPersianDigits(activeWaiter.code) : '-'} • {activeWaiter?.shift || 'شیفت فعال'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#EADBCE] text-xs text-emerald-800 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>تأیید شده</span>
              </div>
            </div>
          </div>

          {/* Performance Stats Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#835428]">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">analytics</span>
                <span>عملکرد سفارش‌ها</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#FAF2EC] border border-[#EADBCE] flex flex-col justify-between">
                <span className="text-xs font-bold text-[#6E6B67]">سفارش‌های امروز</span>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold text-[#002252] font-mono">
                    {toPersianDigits(activeWaiter?.todayOrders ?? 0)}
                  </span>
                  <span className="text-xs text-[#835428] font-bold">سفارش</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF2EC] border border-[#EADBCE] flex flex-col justify-between">
                <span className="text-xs font-bold text-[#6E6B67]">سفارش‌های این ماه</span>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold text-[#002252] font-mono">
                    {toPersianDigits(activeWaiter?.monthOrders ?? 0)}
                  </span>
                  <span className="text-xs text-[#835428] font-bold">سفارش</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#002252] border border-[#00377B] flex items-center justify-between">
              <span className="text-sm font-bold text-[#FFDCC1]">مجموع فروش ثبت‌شده</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white font-mono">
                  {formatPrice(activeWaiter?.totalSales ?? 0)}
                </span>
                <span className="text-xs text-[#F8BA84] font-bold">تومان</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-[#FAF2EC] border-t border-[#EADBCE] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setWaiterProfileModalOpen(false);
              void logoutWaiter();
            }}
            className="px-4 h-11 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl border border-red-200 flex items-center justify-center gap-1.5 transition-colors text-base cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>خروج از شیفت</span>
          </button>

          <button
            type="button"
            onClick={() => setWaiterProfileModalOpen(false)}
            className="flex-1 sm:flex-none px-6 h-11 bg-white hover:bg-gray-50 text-[#002252] font-bold rounded-xl border border-[#EADBCE] flex items-center justify-center transition-colors text-base cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
