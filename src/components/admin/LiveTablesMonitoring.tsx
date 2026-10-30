import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';

export const LiveTablesMonitoring: React.FC = () => {
  const {
    orders,
    calls,
    tables,
    callWaiter,
    setAdminView,
    setSelectedOrderId,
    setQuickInvoiceOrder,
    toPersianDigits,
    formatPrice
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'prep'>('all');
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [selectedTableForCall, setSelectedTableForCall] = useState<number>(4);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'urgent') return order.status === 'pending';
    if (activeFilter === 'prep') return order.status === 'in_preparation';
    return true;
  });

  const handleCallWaiterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    callWaiter(selectedTableForCall, `میز ${selectedTableForCall} (فراخوان مدیریت)`);
    setCallModalOpen(false);
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const prepCount = orders.filter((o) => o.status === 'in_preparation').length;

  return (
    <div className="flex flex-col w-full pb-12 select-none">
      {/* Top Banner & Live Shift Strip */}
      <div className="relative overflow-hidden rounded-2xl bg-[#EFE7E1]/80 border border-[#EADBCE] shadow-sm p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#002252] flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-3xl text-[#F8BA84]">table_restaurant</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#002252]">مانیتورینگ جامع سالن و میزهای زنده</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#BD8655]/20 text-[#835428]">
                شیفت فعال عصر
              </span>
            </div>
            <p className="text-[#6E6B67] text-base mt-0.5">
              پایش لحظه‌ای سفارشات سر میزها، پیجر مهمانداران و گردش کار مطبخ عمارت ودودیان
            </p>
          </div>
        </div>

        {/* Filters & Waiter Call Trigger */}
        <div className="flex items-center gap-2 z-10 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-[#EADBCE]/80 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-base transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#002252] text-white shadow-sm'
                : 'text-[#6E6B67] hover:bg-[#FAF2EC]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">grid_view</span>
            <span>همه فیش‌ها ({toPersianDigits(orders.length)})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('urgent')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-base transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'urgent'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-[#6E6B67] hover:bg-[#FAF2EC]'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-red-500">priority_high</span>
            <span>نیازمند اقدام ({toPersianDigits(pendingCount)})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('prep')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-base transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'prep'
                ? 'bg-[#BD8655] text-white shadow-sm'
                : 'text-[#6E6B67] hover:bg-[#FAF2EC]'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-[#BD8655]">soup_kitchen</span>
            <span>در حال آماده‌سازی ({toPersianDigits(prepCount)})</span>
          </button>

          <div className="h-6 w-px bg-[#EADBCE] mx-1"></div>

          <button
            type="button"
            onClick={() => setCallModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#835428] hover:bg-[#673D12] text-white font-bold text-base shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            title="فراخوان ویتر به سالن یا میز"
          >
            <span className="material-symbols-outlined text-lg text-[#FFDCC1] animate-bounce">notifications_active</span>
            <span>فراخوان ویتر</span>
          </button>
        </div>
      </div>

      {/* 4 Key Performance Indicators (KPIs) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* KPI 1: Daily Orders */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EADBCE] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base text-[#6E6B67] font-medium">سفارش‌های روزانه</span>
            <div className="w-10 h-10 rounded-xl bg-[#D8E2FF] flex items-center justify-center text-[#002252]">
              <span className="material-symbols-outlined text-2xl">today</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold text-[#002252]">{toPersianDigits(44)}</span>
            <span className="text-base text-[#6E6B67] font-medium">سفارش</span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#FAF2EC] text-sm text-[#835428]">
            <span>ثبت‌شده در شیفت‌های امروز</span>
            <span className="material-symbols-outlined text-base">check</span>
          </div>
          <div className="absolute bottom-0 right-0 left-0 h-1 bg-[#002252]"></div>
        </div>

        {/* KPI 2: Monthly Orders */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EADBCE] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base text-[#6E6B67] font-medium">سفارش‌های ماهانه</span>
            <div className="w-10 h-10 rounded-xl bg-[#FFDCC1] flex items-center justify-center text-[#835428]">
              <span className="material-symbols-outlined text-2xl">calendar_month</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold text-[#002252]">{toPersianDigits('۱,۲۸۰')}</span>
            <span className="text-base text-[#6E6B67] font-medium">سفارش</span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#FAF2EC] text-sm text-[#835428]">
            <span>مجموع سفارش‌های ماه جاری</span>
            <span className="material-symbols-outlined text-base">trending_up</span>
          </div>
          <div className="absolute bottom-0 right-0 left-0 h-1 bg-[#835428]"></div>
        </div>

        {/* KPI 3: Monthly Sales */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EADBCE] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base text-[#6E6B67] font-medium">فروش ماهانه</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-[#002252] tracking-tight">{toPersianDigits('۱۸۵,۴۰۰,۰۰۰')}</span>
            <span className="text-sm font-bold text-[#835428]">تومان</span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#FAF2EC] text-sm text-[#6E6B67]">
            <span>مجموع درآمد ماه جاری</span>
            <span className="text-emerald-700 font-bold">رشد ۱۲٪</span>
          </div>
          <div className="absolute bottom-0 right-0 left-0 h-1 bg-emerald-700"></div>
        </div>

        {/* KPI 4: Active In-Progress Orders */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EADBCE] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base text-[#6E6B67] font-medium">سفارش‌های در جریان</span>
            <div className="w-10 h-10 rounded-xl bg-[#F4ECE6] flex items-center justify-center text-[#002252]">
              <span className="material-symbols-outlined text-2xl">timelapse</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold text-[#002252]">{toPersianDigits(6)}</span>
            <span className="text-base text-[#6E6B67] font-medium">سفارش فعال</span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#FAF2EC] text-sm text-[#835428] font-medium">
            <span>۴ در حال آماده‌سازی • ۲ در انتظار اقدام</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#BD8655] animate-pulse"></span>
          </div>
          <div className="absolute bottom-0 right-0 left-0 h-1 bg-[#BD8655]"></div>
        </div>
      </section>

      {/* Real-time Order Cards Grid */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#EADBCE] mb-6 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAF2EC] p-4 rounded-xl border border-[#EADBCE]/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#002252] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-2xl text-[#F8BA84]">receipt_long</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#002252]">فهرست و جزئیات جامع سفارش‌ها</h2>
              <p className="text-sm text-[#6E6B67]">گردش کار فعال میزها، فاکتورها و وضعیت تسویه سالن</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-base font-bold bg-white text-[#002252] border border-[#EADBCE]">
              تعداد نمایش: {toPersianDigits(filteredOrders.length)} سفارش
            </span>
          </div>
        </div>

        {/* Order Cards 2-Col Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredOrders.map((order) => {
            const isNew = order.status === 'pending';

            return (
              <div
                key={order.id}
                className="bg-[#FAF2EC]/40 rounded-2xl p-5 border border-[#EADBCE] flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#EADBCE]">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white shadow-sm ${
                          isNew ? 'bg-[#002252]' : 'bg-[#00413D]'
                        }`}
                      >
                        <span className="text-xs opacity-80 leading-none">میز</span>
                        <span className="text-2xl font-bold leading-none mt-0.5">
                          {toPersianDigits(order.tableNumber)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-[#002252]">
                            فاکتور سفارش #فیش-{toPersianDigits(order.id)}
                          </span>
                          {isNew ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold border border-red-300">
                              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                              سفارش جدید - لحظاتی پیش
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              تحویل داده شده
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#6E6B67] mt-0.5">
                          <span>
                            ویتر ثبت‌کننده: <strong className="text-[#1E1B18]">{order.waiterName}</strong>
                          </span>
                          <span>•</span>
                          <span>زمان ثبت: <strong>{toPersianDigits(order.time)}</strong></span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setAdminView('order_detail');
                      }}
                      className="p-2 text-[#835428] hover:bg-[#FFDCC1]/50 rounded-xl transition-colors cursor-pointer"
                      title="مشاهده فاکتور کامل"
                    >
                      <span className="material-symbols-outlined text-2xl">visibility</span>
                    </button>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto rounded-xl bg-white shadow-xs border border-[#EADBCE]/60">
                    <table className="w-full text-right text-base">
                      <thead className="bg-[#F4ECE6]/80 text-[#6E6B67] font-semibold text-sm">
                        <tr>
                          <th className="p-2.5">شرح قلم</th>
                          <th className="p-2.5 text-center">تعداد</th>
                          <th className="p-2.5">قیمت واحد</th>
                          <th className="p-2.5 text-left">قیمت کل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EADBCE]/50">
                        {order.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-[#FAF2EC]/50 transition-colors">
                            <td className="p-2.5">
                              <div className="font-bold text-[#002252]">{item.name}</div>
                              {item.ingredients && (
                                <div className="text-xs text-[#6E6B67] truncate max-w-[200px]">
                                  {item.ingredients}
                                </div>
                              )}
                            </td>
                            <td className="p-2.5 text-center font-bold text-[#835428] text-lg">
                              {toPersianDigits(item.quantity)}
                            </td>
                            <td className="p-2.5 text-[#6E6B67] text-sm">
                              {formatPrice(item.price)}
                            </td>
                            <td className="p-2.5 text-left font-bold text-[#002252]">
                              {formatPrice(item.price * item.quantity)} <span className="text-xs text-[#6E6B67] font-normal">تومان</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Guest Note */}
                  {order.guestNote && (
                    <div className="p-2.5 rounded-xl bg-[#EFE7E1] flex items-start gap-2 text-sm border border-[#EADBCE]/60">
                      <span className="material-symbols-outlined text-[#835428] text-lg shrink-0 mt-0.5">edit_note</span>
                      <div>
                        <strong className="text-[#835428]">یادداشت مهمان:</strong>
                        <span className="text-[#1E1B18] mr-1">«{order.guestNote}»</span>
                      </div>
                    </div>
                  )}
                </div>

                  {/* Card Bottom Total & Action */}
                  <div className="pt-3 border-t border-[#EADBCE] flex items-center justify-between mt-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-[#6E6B67]">جمع کل قابل پرداخت:</span>
                    <span className="text-2xl font-bold text-[#002252]">
                      {formatPrice(order.total)} <span className="text-sm font-normal text-[#835428]">تومان</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickInvoiceOrder(order)}
                      className="py-2 px-3 rounded-xl bg-[#FAF2EC] hover:bg-[#EADBCE] text-[#002252] text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">receipt</span>
                      <span>پیش‌نمایش فیش</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setAdminView('order_detail');
                      }}
                      className="py-2 px-4 rounded-xl bg-[#002252] hover:bg-[#00377B] text-white text-base font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">open_in_new</span>
                      <span>مشاهده فاکتور کامل</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Waiter Call Modal */}
      {callModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-[#EADBCE]">
            <div className="flex items-center justify-between mb-4 border-b border-[#EADBCE] pb-3">
              <div className="flex items-center gap-2 text-[#002252]">
                <span className="material-symbols-outlined text-2xl text-[#BD8655]">campaign</span>
                <h3 className="text-xl font-bold">فراخوان مهماندار به سالن</h3>
              </div>
              <button
                type="button"
                onClick={() => setCallModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCallWaiterSubmit} className="space-y-4">
              <div>
                <label className="block text-base font-bold text-[#1E1B18] mb-1">
                  شماره میز جهت اعزام مهماندار:
                </label>
                <select
                  value={selectedTableForCall}
                  onChange={(e) => setSelectedTableForCall(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF2EC] border border-[#EADBCE] text-lg font-bold text-[#002252] outline-none"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      میز {toPersianDigits(t.id)} ({t.section} - {toPersianDigits(t.capacity)} نفره)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF2EC] text-sm text-[#6E6B67]">
                پیام هشدار با اولویت بالا به تبلت پرسنل حاضر در شیفت سالن مخابره خواهد شد.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCallModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-[#FAF2EC] text-[#1E1B18] font-bold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#002252] text-white font-bold shadow-md hover:bg-[#00377B] cursor-pointer"
                >
                  ارسال فراخوان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
