import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const statusLabel: Record<string, { label: string; className: string }> = {
  sent_to_admin: { label: 'در انتظار تایید', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  pending: { label: 'در انتظار تایید', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  in_preparation: { label: 'در حال آماده‌سازی', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  ready: { label: 'آماده سرو', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  delivered: { label: 'تحویل شده', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  paid: { label: 'تسویه شده', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  cancelled: { label: 'لغو شده', className: 'bg-red-50 text-red-700 border-red-200' },
};

const tableStatusMeta: Record<string, { label: string; className: string }> = {
  available: { label: 'آزاد', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  occupied: { label: 'مشغول', className: 'bg-[#FAF2EC] text-[#835428] border-[#EADBCE]' },
  calling_waiter: { label: 'فراخوان', className: 'bg-red-50 text-red-700 border-red-300' },
  in_preparation: { label: 'در حال آماده‌سازی', className: 'bg-blue-50 text-blue-800 border-blue-200' },
};

export const WaiterWorkspace: React.FC = () => {
  const {
    activeWaiter,
    calls,
    orders,
    tables,
    acceptCall,
    resolveCall,
    updateOrderStatus,
    logoutWaiter,
    setSelectedTableForOrder,
    setWaiterView,
    setWaiterProfileModalOpen,
    toPersianDigits,
    formatPrice,
    showToast,
  } = useApp();

  const [manualTableNumber, setManualTableNumber] = useState('');
  const [busyCallId, setBusyCallId] = useState<string | null>(null);

  const pendingCalls = calls.filter((c) => c.status === 'pending');
  const activeOrders = orders.filter(
    (o) => o.dbStatus !== 'paid' && o.dbStatus !== 'cancelled'
  );

  const openOrderTaking = (tableNumber: number) => {
    setSelectedTableForOrder(tableNumber);
    setWaiterView('waiter_ordering');
  };

  const handleManualTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tableNum = parseInt(manualTableNumber, 10);
    if (!tableNum || !tables.some((t) => t.id === tableNum)) {
      showToast('خطا', 'شماره میز معتبر نیست. شماره میزهای فعال را از فهرست انتخاب کنید.');
      return;
    }
    openOrderTaking(tableNum);
  };

  const handleAccept = (callId: string) => {
    setBusyCallId(callId);
    acceptCall(callId);
    window.setTimeout(() => setBusyCallId(null), 800);
  };

  const handleResolve = (callId: string) => {
    setBusyCallId(callId);
    resolveCall(callId);
    window.setTimeout(() => setBusyCallId(null), 800);
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

          <div className="flex items-center gap-2 bg-[#001A41]/80 px-2.5 py-1 rounded-full border border-white/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-[#D8E2FF]">آنلاین</span>
          </div>
        </div>

        {/* Waiter Identity Strip */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#BD8655] border border-white/20 flex items-center justify-center text-white font-bold shrink-0">
              <span className="material-symbols-outlined text-xl">person</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-lg leading-tight text-white truncate">
                {activeWaiter ? activeWaiter.name : 'مهماندار'}
              </span>
              <span className="text-xs text-[#FFDCC1] truncate">
                کد {activeWaiter ? toPersianDigits(activeWaiter.code) : '-'} • {activeWaiter?.shift || 'شیفت فعال'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setWaiterProfileModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-base text-[#F8BA84]">analytics</span>
              <span>عملکرد</span>
            </button>
            <button
              type="button"
              onClick={() => void logoutWaiter()}
              className="px-2.5 py-1.5 rounded-xl bg-red-500/80 hover:bg-red-600 border border-white/20 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
              title="خروج از حساب"
            >
              <span className="material-symbols-outlined text-base">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* KPI Active Calls Strip */}
      <section className="w-full px-4 py-3 bg-[#FAF2EC] border-b border-[#EADBCE]">
        <div className="bg-white p-3 rounded-2xl border border-[#EADBCE] shadow-xs flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <span className={`material-symbols-outlined text-2xl ${pendingCalls.length ? 'animate-bounce' : ''}`}>
                notifications_active
              </span>
            </div>
            <div>
              <span className="text-base font-bold text-[#1E1B18] block leading-tight">فراخوان‌های فعال</span>
              <span className="text-xs text-[#6E6B67]">نیازمند مراجعه سریع سر میز</span>
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-xl text-red-700">
            <span className="text-2xl font-bold font-mono">{toPersianDigits(pendingCalls.length)}</span>
            <span className="text-xs font-bold">میز</span>
          </div>
        </div>
      </section>

      <main className="px-4 mt-3 space-y-5 flex-1">
        {/* Calls */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#BD8655] text-xl">notifications</span>
              <h3 className="font-bold text-lg text-[#002252] leading-tight">درخواست‌های مهمانان</h3>
            </div>
            <span className="text-xs bg-[#FFDCC1] text-[#835428] px-2.5 py-0.5 rounded-full font-bold">
              {toPersianDigits(calls.length)} درخواست
            </span>
          </div>

          {calls.length === 0 ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900">
              <span className="material-symbols-outlined text-2xl text-emerald-600">check_circle</span>
              <div>
                <p className="font-bold text-base">در حال حاضر درخواست بازی وجود ندارد.</p>
                <p className="text-xs text-emerald-700">آماده دریافت فراخوان‌های بعدی از سر میزها</p>
              </div>
            </div>
          ) : (
            calls.map((call) => (
              <div
                key={call.id}
                className={`rounded-2xl bg-white border p-3.5 shadow-xs space-y-3 ${
                  call.status === 'pending' ? 'border-red-300' : 'border-[#EADBCE]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="px-3 py-1.5 rounded-xl bg-red-100 border border-red-200 text-red-800 flex items-baseline gap-1">
                      <span className="text-xs font-medium">میز</span>
                      <span className="text-xl font-bold font-mono leading-none">
                        {toPersianDigits(call.tableNumber)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#1E1B18] leading-tight">
                        {call.type === 'bill_request'
                          ? 'درخواست صورتحساب'
                          : call.type === 'service_refill'
                          ? 'درخواست سفارش / سرویس'
                          : 'فراخوان مهماندار'}
                      </h4>
                      <span className="text-xs text-[#6E6B67]">
                        {call.minutesAgo > 0
                          ? `${toPersianDigits(call.minutesAgo)} دقیقه پیش`
                          : 'همین حالا'}{' '}
                        • {call.time}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full border font-bold shrink-0 ${
                      call.status === 'pending'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {call.status === 'pending' ? 'جدید' : 'در حال بررسی'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={busyCallId === call.id}
                    onClick={() => handleAccept(call.id)}
                    className="bg-[#002252] hover:bg-[#00377B] text-white py-2.5 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-lg">receipt_long</span>
                    <span>پذیرش و ثبت سفارش</span>
                  </button>

                  <button
                    type="button"
                    disabled={busyCallId === call.id}
                    onClick={() => handleResolve(call.id)}
                    className="bg-white border border-[#EADBCE] text-[#002252] hover:bg-[#FAF2EC] py-2.5 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-lg text-emerald-700">check</span>
                    <span>انجام شد</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Tables */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#BD8655] text-xl">table_restaurant</span>
              <h3 className="font-bold text-lg text-[#002252] leading-tight">میزهای سالن</h3>
            </div>
            <span className="text-xs text-[#6E6B67]">برای ثبت سفارش لمس کنید</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {tables.map((table) => {
              const meta = tableStatusMeta[table.status] || tableStatusMeta.occupied;
              return (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => openOrderTaking(table.id)}
                  className={`rounded-2xl border p-3 flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer ${meta.className}`}
                >
                  <span className="text-2xl font-bold font-mono leading-none">
                    {toPersianDigits(table.id)}
                  </span>
                  <span className="text-[11px] font-bold">{meta.label}</span>
                  <span className="text-[10px] opacity-70">{toPersianDigits(table.capacity)} نفره</span>
                </button>
              );
            })}
            {tables.length === 0 && (
              <p className="col-span-3 text-center text-sm text-[#6E6B67] py-4">میز فعالی ثبت نشده است.</p>
            )}
          </div>
        </section>

        {/* Active Orders */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#BD8655] text-xl">receipt_long</span>
              <h3 className="font-bold text-lg text-[#002252] leading-tight">سفارش‌های جاری</h3>
            </div>
            <span className="text-xs bg-[#FFDCC1] text-[#835428] px-2.5 py-0.5 rounded-full font-bold">
              {toPersianDigits(activeOrders.length)} سفارش فعال
            </span>
          </div>

          {activeOrders.length === 0 ? (
            <p className="text-center text-sm text-[#6E6B67] py-4 bg-white border border-[#EADBCE] rounded-2xl">
              سفارش جاری برای سالن ثبت نشده است.
            </p>
          ) : (
            activeOrders.map((order) => {
              const meta = statusLabel[order.dbStatus ?? order.status] || statusLabel.pending;
              const nextAction = (() => {
                switch (order.dbStatus) {
                  case 'sent_to_admin':
                    return { label: 'تایید و شروع آماده‌سازی', next: 'in_preparation' as const, icon: 'room_service' };
                  case 'in_preparation':
                    return { label: 'آماده سرو', next: 'ready' as const, icon: 'local_cafe' };
                  case 'ready':
                    return { label: 'تحویل به میز', next: 'delivered' as const, icon: 'room_service' };
                  case 'delivered':
                    return { label: 'تسویه و بستن فیش', next: 'paid' as const, icon: 'payments' };
                  default:
                    return null;
                }
              })();
              return (
                <div key={order.id} className="rounded-2xl bg-white border border-[#EADBCE] shadow-xs p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#EADBCE] pb-2.5 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-xl bg-[#002252] text-white font-bold text-sm font-mono">
                        میز {toPersianDigits(order.tableNumber)}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-[#1E1B18] leading-tight">
                          فیش #{toPersianDigits(order.number ?? '-')}
                        </h4>
                        <span className="text-xs text-[#6E6B67]">
                          {order.time} • {toPersianDigits(order.items.length)} قلم
                        </span>
                      </div>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-bold shrink-0 ${meta.className}`}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div
                        key={`${order.id}-${idx}`}
                        className="flex items-center justify-between gap-2 text-sm bg-[#FAF2EC] border border-[#EADBCE]/60 rounded-xl px-2.5 py-1.5"
                      >
                        <span className="font-bold text-[#1E1B18] truncate">
                          {item.name}
                          <span className="text-[#835428] font-mono mr-1">×{toPersianDigits(item.quantity)}</span>
                        </span>
                        <span className="text-[#6E6B67] font-mono shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#EADBCE] pt-2">
                    <span className="text-sm text-[#6E6B67]">مبلغ فیش</span>
                    <span className="font-bold text-lg text-[#002252]">
                      {formatPrice(order.total)} <span className="text-xs text-[#835428]">تومان</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openOrderTaking(order.tableNumber)}
                      className="py-2 rounded-xl border border-dashed border-[#BD8655] text-[#835428] hover:bg-[#FFDCC1]/30 text-sm font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">add_circle</span>
                      <span>افزودن قلم</span>
                    </button>

                    {nextAction ? (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, nextAction.next)}
                        className="py-2 rounded-xl bg-[#002252] text-white hover:bg-[#00377B] text-sm font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">{nextAction.icon}</span>
                        <span>{nextAction.label}</span>
                      </button>
                    ) : (
                      <span className="py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        <span>پایان یافته</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Manual Table Order Section */}
        <section className="rounded-2xl bg-white border border-[#EADBCE] shadow-xs p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#FAF2EC] text-[#002252] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">table_restaurant</span>
            </span>
            <h3 className="font-bold text-base text-[#002252] leading-tight">انتخاب دستی میز و ثبت سفارش</h3>
          </div>

          <p className="text-xs text-[#6E6B67]">
            شماره میز را وارد کنید تا فرایند ثبت سفارش الکترونیک آغاز شود:
          </p>

          <form onSubmit={handleManualTableSubmit} className="flex flex-col gap-3">
            <div className="relative w-full">
              <input
                type="number"
                min={1}
                value={manualTableNumber}
                onChange={(e) => setManualTableNumber(e.target.value)}
                placeholder="شماره میز"
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

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-[#EADBCE] px-4 py-2 flex items-center justify-center gap-8">
        <button
          type="button"
          onClick={() => setWaiterProfileModalOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[#00377B] cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-[#FAF2EC] flex items-center justify-center text-[#00377B]">
            <span className="material-symbols-outlined text-xl">person</span>
          </div>
          <p className="text-[11px] font-bold">پروفایل و عملکرد</p>
        </button>

        <button
          type="button"
          onClick={() => void logoutWaiter()}
          className="flex flex-col items-center gap-0.5 text-red-700 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-700">
            <span className="material-symbols-outlined text-xl">logout</span>
          </div>
          <p className="text-[11px] font-bold">خروج از شیفت</p>
        </button>
      </div>
    </div>
  );
};
