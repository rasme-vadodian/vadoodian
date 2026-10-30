import React from 'react';
import { useApp } from '../../context/AppContext';

export const GlobalModeBar: React.FC = () => {
  const {
    mode,
    setMode,
    adminView,
    setAdminView,
    waiterView,
    setWaiterView,
    customerView,
    setCustomerView,
    calls,
    setSelectedOrderId,
    toPersianDigits
  } = useApp();

  const pendingCallsCount = calls.filter((c) => c.status === 'pending').length;

  return (
    <div className="bg-[#002252] text-white border-b border-[#00377B] px-3 py-1.5 flex flex-wrap items-center justify-between text-base select-none z-50 sticky top-0 shadow-md">
      {/* Brand & Persona Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 pl-2 border-l border-white/20">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F8BA84]"></span>
          <span className="font-bold text-lg text-[#FFDCC1]">عمارت ودودیان</span>
        </div>

        {/* 3 Main Personas */}
        <div className="flex items-center gap-1 bg-[#001A41] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('admin')}
            className={`px-3 py-1 rounded-lg font-bold text-base transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'admin'
                ? 'bg-[#00377B] text-white shadow-sm ring-1 ring-[#BD8655]/40'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            <span>پنل مدیریت عمارت</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('waiter')}
            className={`px-3 py-1 rounded-lg font-bold text-base transition-all flex items-center gap-1.5 relative cursor-pointer ${
              mode === 'waiter'
                ? 'bg-[#BD8655] text-white shadow-sm ring-1 ring-white/30'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-lg">badge</span>
            <span>تبلت مهماندار / ویتر</span>
            {pendingCallsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center animate-pulse">
                {toPersianDigits(pendingCallsCount)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMode('customer')}
            className={`px-3 py-1 rounded-lg font-bold text-base transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'customer'
                ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-white/30'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-lg">restaurant_menu</span>
            <span>منوی دیجیتال مهمان (میز ۴)</span>
          </button>
        </div>
      </div>

      {/* Screen Fast-Jumper Dropdown & Badges */}
      <div className="flex items-center gap-2 mt-1 sm:mt-0">
        <span className="text-xs text-white/60 hidden md:inline">دسترسی سریع به نماها:</span>
        <select
          value={
            mode === 'admin'
              ? `admin:${adminView}`
              : mode === 'waiter'
              ? `waiter:${waiterView}`
              : `customer:${customerView}`
          }
          onChange={(e) => {
            const [targetMode, targetView] = e.target.value.split(':');
            setMode(targetMode as any);
            if (targetMode === 'admin') setAdminView(targetView as any);
            if (targetMode === 'waiter') setWaiterView(targetView as any);
            if (targetMode === 'customer') setCustomerView(targetView as any);
          }}
          className="bg-[#001A41] text-[#FFDCC1] border border-[#BD8655]/40 rounded-lg px-2.5 py-1 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#BD8655] cursor-pointer"
        >
          <optgroup label="صفحات پنل مدیریت (ادمین)">
            <option value="admin:live_tables">مانیتورینگ جامع سالن و میزهای زنده</option>
            <option value="admin:orders_list">فهرست سفارشات و فیش‌ها</option>
            <option value="admin:order_detail">سند جزئیات فاکتور #۸۸۴۲</option>
            <option value="admin:menu_management">مدیریت منو، دسته‌ها و میزها</option>
            <option value="admin:product_edit">ویرایش و تعریف محصول جدید</option>
            <option value="admin:staff_performance">عملکرد ویترها و پرسنل</option>
            <option value="admin:admin_login">ورود به پنل مدیریت عمارت</option>
          </optgroup>
          <optgroup label="صفحات تبلت مهماندار (ویتر)">
            <option value="waiter:waiter_workspace">میز کار و هشدارهای مهماندار</option>
            <option value="waiter:waiter_ordering">فرم ثبت سفارش میز ۴</option>
            <option value="waiter:waiter_login">ورود مهمانداران با پین‌پد لمسی</option>
          </optgroup>
          <optgroup label="صفحات مشتری (سر میز)">
            <option value="customer:customer_quick_grid">منوی سریع و شبکه‌ای (سفارش فوری سر میز)</option>
            <option value="customer:customer_menu">منوی کلاسیک و روایتی (کاتالوگ و رزرو)</option>
            <option value="customer:customer_item_detail">نمای تک‌محصول (قهوه دمی زعفرانی)</option>
          </optgroup>
        </select>
      </div>
    </div>
  );
};
