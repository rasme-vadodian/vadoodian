import React from 'react';
import { useApp, AdminView } from '../../context/AppContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { adminView, setAdminView, calls, toPersianDigits } = useApp();

  const pendingCallsCount = calls.filter((c) => c.status === 'pending').length;

  const navItems: { view: AdminView; label: string; icon: string }[] = [
    { view: 'live_tables', label: 'میزهای زنده و سفارش‌ها', icon: 'table_restaurant' },
    { view: 'orders_list', label: 'فهرست سفارشات', icon: 'receipt_long' },
    { view: 'menu_management', label: 'مدیریت منو و اقلام', icon: 'restaurant_menu' },
    { view: 'staff_performance', label: 'عملکرد ویترها و پرسنل', icon: 'badge' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFF8F4] text-[#1E1B18]">
      {/* Right Sidebar (RTL) */}
      <aside className="w-60 bg-[#FAF2EC] border-l border-[#EADBCE] flex flex-col justify-between h-full z-30 shrink-0 select-none shadow-sm">
        {/* Top: Logo & Navigation */}
        <div className="flex flex-col">
          {/* Brand Logo Header */}
          <div className="h-20 px-5 flex items-center gap-3 border-b border-[#EADBCE]/70 bg-[#F4ECE6]">
            <div className="w-11 h-11 rounded-xl bg-[#002252] flex items-center justify-center text-white shadow-sm ring-2 ring-[#BD8655]/30 shrink-0">
              <span className="material-symbols-outlined text-2xl text-[#F8BA84]">local_cafe</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xl font-bold text-[#002252] leading-tight truncate">کافه و موزه ودودیان</span>
              <span className="text-sm font-medium text-[#6E6B67] truncate">سامانه مدیریت عمارت</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 p-3.5 mt-2">
            {navItems.map((item) => {
              const isActive = adminView === item.view || 
                (item.view === 'menu_management' && adminView === 'product_edit') ||
                (item.view === 'orders_list' && adminView === 'order_detail');

              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => setAdminView(item.view)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-right w-full ${
                    isActive
                      ? 'bg-[#002252] text-white font-bold shadow-md shadow-[#002252]/20 ring-1 ring-[#002252]/30'
                      : 'text-[#6E6B67] hover:bg-[#EADBCE]/50 hover:text-[#002252]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-2xl ${isActive ? 'text-[#F8BA84]' : 'text-[#835428]'}`}>
                      {item.icon}
                    </span>
                    <span className="text-lg font-medium">{item.label}</span>
                  </div>

                  {item.view === 'live_tables' && pendingCallsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
                      {toPersianDigits(pendingCallsCount)}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Admin Profile & Logout */}
        <div className="p-3.5 border-t border-[#EADBCE]/70 bg-[#F4ECE6]/60">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#EADBCE] shadow-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#00377B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                م
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-bold text-[#002252] leading-tight truncate">مدیر کافه</span>
                <span className="text-xs text-[#6E6B67]">سطح دسترسی کل</span>
              </div>
            </div>
            <button
              onClick={() => setAdminView('admin_login')}
              className="p-1.5 text-[#6E6B67] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="صفحه ورود / خروج"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FFF8F4]">
        {/* Top Header */}
        <header className="h-16 border-b border-[#EADBCE] bg-white/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
          {/* Status & Clock */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-base font-semibold text-emerald-800 leading-none">سیستم برخط و متصل</span>
            </div>
            <div className="h-5 w-px bg-[#EADBCE] hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-2 text-[#6E6B67] text-lg">
              <span className="material-symbols-outlined text-xl text-[#BD8655]">calendar_today</span>
              <span>پنج‌شنبه ۲۴ آبان ۱۴۰۳</span>
              <span className="mx-1">•</span>
              <span className="material-symbols-outlined text-xl text-[#BD8655]">schedule</span>
              <span>۱۸:۴۵</span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {pendingCallsCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold animate-pulse">
                <span className="material-symbols-outlined text-base">notifications_active</span>
                <span>{toPersianDigits(pendingCallsCount)} فراخوان فعال</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setAdminView('product_edit')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4ECE6] hover:bg-[#EADBCE] text-[#002252] text-base font-bold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg text-[#BD8655]">add_circle</span>
              <span>افزودن محصول</span>
            </button>

            <div className="h-6 w-px bg-[#EADBCE]"></div>

            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#002252]">امیرحسین ودودیان</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#BD8655]/15 text-[#835428] font-bold hidden sm:inline">
                سرپرست مجموعه
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};
