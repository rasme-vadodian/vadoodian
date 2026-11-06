import React from 'react';
import { useApp } from '../../context/AppContext';

export const OrderDetailView: React.FC = () => {
  const {
    orders,
    selectedOrderId,
    setAdminView,
    cancelOrder,
    updateOrderStatus,
    showToast,
    toPersianDigits,
    formatPrice
  } = useApp();

  const order = orders.find((o) => o.id === selectedOrderId) || orders[0];

  if (!order) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-[#EADBCE]">
        <p className="text-xl font-bold text-[#002252]">سفارشی یافت نشد.</p>
        <button
          type="button"
          onClick={() => setAdminView('live_tables')}
          className="mt-4 px-4 py-2 bg-[#002252] text-white rounded-xl font-bold"
        >
          بازگشت به مانیتورینگ زنده میزها
        </button>
      </div>
    );
  }

  const handlePrintThermal = () => {
    showToast('چاپ فیش حرارتی', `فیش حرارتی سفارش #${order.number ?? '-'} به چاپگر مطبخ ارسال گردید.`);
  };

  const handleCancel = () => {
    if (confirm(`آیا از لغو سفارش #${order.number ?? '-'} میز ${order.tableNumber} اطمینان دارید؟`)) {
      cancelOrder(order.id);
      setAdminView('orders_list');
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-16 select-none">
      {/* Top Bar Actions & Back Link */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EADBCE] shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setAdminView('live_tables')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF2EC] hover:bg-[#EADBCE] text-[#002252] font-bold text-base transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
            <span>بازگشت به مانیتورینگ زنده میزها</span>
          </button>

          <div className="h-6 w-px bg-[#EADBCE] hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6E6B67] font-bold">شناسه سند:</span>
            <span className="text-2xl font-bold text-[#002252]">فاکتور سفارش #فیش-{toPersianDigits(order.number ?? '-')}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDCC1] text-[#835428] font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-[#835428] animate-pulse"></span>
            <span>
              {order.status === 'pending'
                ? 'سفارش داده شده'
                : order.status === 'in_preparation'
                ? 'در حال آماده‌سازی'
                : order.status === 'delivered'
                ? 'تحویل داده شده'
                : 'تسویه شده'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePrintThermal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002252] text-white hover:bg-[#00377B] shadow-sm transition-all font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl text-[#F8BA84]">receipt_long</span>
            <span>چاپ فیش حرارتی</span>
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">cancel</span>
            <span>لغو سفارش</span>
          </button>
        </div>
      </div>

      {/* Primary Meta Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Table Info Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#002252] text-white p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-80">موقعیت سفارش</span>
            <span className="material-symbols-outlined text-2xl text-[#F8BA84]">table_restaurant</span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold leading-tight">میز شماره {toPersianDigits(order.tableNumber)}</div>
            <div className="text-xs text-[#FFDCC1] mt-1">بخش شاه‌نشین حیاط موزه</div>
          </div>
          <div className="mt-4 pt-2 border-t border-white/20 flex items-center justify-between text-sm">
            <span className="text-white/70">نوع سفارش:</span>
            <span className="font-bold text-white">سرو حضوری در سالن</span>
          </div>
        </div>

        {/* Waiter Card */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#EADBCE] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6E6B67]">مهماندار ثبت‌کننده</span>
            <span className="material-symbols-outlined text-2xl text-[#BD8655]">badge</span>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-12 h-12 rounded-full bg-[#FFDCC1] flex items-center justify-center text-[#835428] font-bold text-lg shadow-inner">
              ع‌ر
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xl font-bold text-[#1E1B18] truncate">{order.waiterName}</span>
              <span className="text-xs text-[#835428] font-medium">ویتر ارشد سالن (کد {order.waiterCode})</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#FAF2EC] flex items-center justify-between text-xs text-[#6E6B67]">
            <span>شیفت عصر</span>
            <span className="text-emerald-700 font-bold">حاضر در سالن</span>
          </div>
        </div>

        {/* Timing Card */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#EADBCE] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6E6B67]">زمان ثبت سفارش</span>
            <span className="material-symbols-outlined text-2xl text-[#BD8655]">schedule</span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-[#002252]">{toPersianDigits(order.time)}</div>
            <div className="text-sm text-[#6E6B67] mt-1">{order.date}</div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#FAF2EC] flex items-center justify-between text-xs text-[#6E6B67]">
            <span>مدت زمان سپری شده:</span>
            <span className="font-bold text-[#002252]">۴ دقیقه پیش</span>
          </div>
        </div>

        {/* Settlement Status Card */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#EADBCE] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6E6B67]">وضعیت پرداخت</span>
            <span className="material-symbols-outlined text-2xl text-[#BD8655]">point_of_sale</span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-emerald-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-600">check_circle</span>
              <span>{order.isPaid ? 'پرداخت شده در محل' : 'در انتظار تسویه'}</span>
            </div>
            <div className="mt-2 text-xs text-[#6E6B67]">
              دستگاه پوز سیار سامان کیش #۰۴
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#FAF2EC] flex items-center justify-between text-xs text-[#6E6B67]">
            <span>روش پرداخت:</span>
            <span className="font-bold text-[#002252]">کارتخوان سیار سالن</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Detailed Invoice Table + Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Items Detail Table & Notes (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <div className="rounded-2xl bg-white shadow-sm border border-[#EADBCE] overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-[#FAF2EC] border-b border-[#EADBCE] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#002252] text-2xl">restaurant_menu</span>
                <span className="text-xl font-bold text-[#002252]">ریز اقلام سفارش عمارت</span>
              </div>
              <span className="text-sm text-[#6E6B67] bg-white px-3 py-1 rounded-full border border-[#EADBCE] font-bold">
                مجموع {toPersianDigits(order.items.length)} ردیف کالا
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-[#FAF2EC]/50 text-[#6E6B67] font-semibold text-base border-b border-[#EADBCE]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">عنوان قلم و مشخصات طعم</th>
                    <th className="py-3 px-4 text-center">تعداد</th>
                    <th className="py-3 px-4 text-left">قیمت واحد</th>
                    <th className="py-3 px-4 text-left">مجموع (تومان)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADBCE]/50 text-base">
                  {order.items.map((item, index) => (
                    <tr key={index} className="hover:bg-[#FAF2EC]/40 transition-colors">
                      <td className="py-3 px-4 text-[#6E6B67] font-bold">{toPersianDigits(index + 1)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover border border-[#EADBCE] shrink-0"
                            />
                          )}
                          <div className="flex flex-col">
                            <span className="font-bold text-lg text-[#002252]">{item.name}</span>
                            {item.ingredients && (
                              <span className="text-xs text-[#6E6B67] mt-0.5">{item.ingredients}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-3 py-1 bg-[#FAF2EC] rounded-xl font-bold text-lg text-[#002252]">
                          {toPersianDigits(item.quantity)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-left text-[#6E6B67]">
                        {formatPrice(item.price)}
                      </td>
                      <td className="py-3 px-4 text-left font-bold text-[#002252] text-lg">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Special Notes Card */}
          {order.guestNote && (
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#EADBCE] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#835428] font-bold text-lg">
                <span className="material-symbols-outlined text-xl">stylus_note</span>
                <span>یادداشت ویژه سفارش‌دهنده و آشپزخانه</span>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF2EC] text-[#1E1B18] text-base leading-relaxed flex items-start gap-3 border border-[#EADBCE]/60">
                <span className="material-symbols-outlined text-[#835428] text-2xl shrink-0 mt-0.5">format_quote</span>
                <p className="font-medium">{order.guestNote}</p>
              </div>
            </div>
          )}
        </div>

        {/* Financial Summary & Actions (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="rounded-2xl bg-white shadow-sm border border-[#EADBCE] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EADBCE]">
              <span className="text-xl font-bold text-[#002252]">خلاصه حساب فاکتور</span>
              <span className="material-symbols-outlined text-2xl text-[#BD8655]">account_balance_wallet</span>
            </div>

            <div className="flex flex-col gap-2.5 text-base">
              <div className="flex items-center justify-between text-[#6E6B67]">
                <span>مجموع ارزش اقلام منو:</span>
                <span className="font-bold text-[#1E1B18]">{formatPrice(order.subtotal)} تومان</span>
              </div>

              <div className="flex items-center justify-between text-[#6E6B67]">
                <span>مالیات بر ارزش افزوده (۱۰٪ مصوب):</span>
                <span className="font-bold text-[#1E1B18]">{formatPrice(order.tax)} تومان</span>
              </div>

              <div className="flex items-center justify-between text-[#6E6B67]">
                <span>حق سرویس و پذیرایی (۱۰٪):</span>
                <span className="font-bold text-[#1E1B18]">{formatPrice(order.serviceFee)} تومان</span>
              </div>
            </div>

            {/* Total Pay Box */}
            <div className="p-4 rounded-xl bg-[#FAF2EC] flex flex-col gap-1 border border-[#EADBCE]">
              <span className="text-xs text-[#835428] font-bold">مبلغ نهایی فاکتور</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-bold text-[#002252] tracking-tight">{formatPrice(order.total)}</span>
                <span className="text-base font-bold text-[#002252]">تـومان</span>
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs font-bold text-[#6E6B67]">تغییر وضعیت فاکتور:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateOrderStatus(order.id, 'in_preparation')}
                  disabled={order.dbStatus !== 'sent_to_admin'}
                  className={`py-2 px-3 rounded-xl text-sm font-bold border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    order.dbStatus === 'in_preparation' || order.dbStatus === 'ready' || order.dbStatus === 'delivered'
                      ? 'bg-[#BD8655] text-white border-[#BD8655]'
                      : 'bg-[#FAF2EC] text-[#002252] border-[#EADBCE] hover:bg-[#EADBCE]'
                  }`}
                >
                  در حال آماده‌سازی
                </button>
                <button
                  type="button"
                  onClick={() => updateOrderStatus(order.id, 'ready')}
                  disabled={order.dbStatus !== 'in_preparation'}
                  className={`py-2 px-3 rounded-xl text-sm font-bold border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    order.dbStatus === 'ready' || order.dbStatus === 'delivered'
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-[#FAF2EC] text-[#002252] border-[#EADBCE] hover:bg-[#EADBCE]'
                  }`}
                >
                  آماده سرو
                </button>
                <button
                  type="button"
                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                  disabled={order.dbStatus !== 'ready'}
                  className={`py-2 px-3 rounded-xl text-sm font-bold border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    order.dbStatus === 'delivered' || order.dbStatus === 'paid'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-[#FAF2EC] text-[#002252] border-[#EADBCE] hover:bg-[#EADBCE]'
                  }`}
                >
                  تحویل داده شد
                </button>
                <button
                  type="button"
                  onClick={() => updateOrderStatus(order.id, 'paid')}
                  disabled={order.dbStatus !== 'delivered'}
                  className={`py-2 px-3 rounded-xl text-sm font-bold border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    order.dbStatus === 'paid'
                      ? 'bg-gray-700 text-white border-gray-700'
                      : 'bg-[#FAF2EC] text-[#002252] border-[#EADBCE] hover:bg-[#EADBCE]'
                  }`}
                >
                  تسویه شد
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
