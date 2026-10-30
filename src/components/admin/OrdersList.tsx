import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';

export const OrdersList: React.FC = () => {
  const {
    orders,
    setAdminView,
    setSelectedOrderId,
    setQuickInvoiceOrder,
    quickInvoiceOrder,
    showToast,
    toPersianDigits,
    formatPrice
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'delivered'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'pending' && (order.status === 'pending' || order.status === 'in_preparation')) ||
      (activeFilter === 'delivered' && (order.status === 'delivered' || order.status === 'paid'));

    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      order.id.toLowerCase().includes(query) ||
      order.tableNumber.toString().includes(query) ||
      order.waiterName.toLowerCase().includes(query) ||
      order.items.some((i) => i.name.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'in_preparation').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered' || o.status === 'paid').length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('بروزرسانی داده‌ها', 'فهرست سفارشات و فیش‌های روز با موفقیت همگام‌سازی شد.');
    }, 600);
  };

  const handleQuickPrint = (receiptId: string) => {
    showToast('چاپ فیش حرارتی', `دستور چاپ فیش آشپزخانه برای سفارش #${receiptId} صادر شد.`);
  };

  const totalDisplayedPrice = filteredOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="flex flex-col w-full gap-5 pb-12 select-none">
      {/* Top Filter and Search Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl shadow-xs border border-[#EADBCE]">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#002252] text-white shadow-sm'
                : 'bg-[#FAF2EC] text-[#6E6B67] hover:bg-[#EADBCE]'
            }`}
          >
            <span>همه فیش‌ها</span>
            <span className="inline-flex items-center justify-center bg-white/20 px-2 py-0.5 rounded-full text-xs font-mono">
              {toPersianDigits(orders.length)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base transition-all cursor-pointer ${
              activeFilter === 'pending'
                ? 'bg-[#002252] text-white shadow-sm'
                : 'bg-[#FAF2EC] text-[#6E6B67] hover:bg-[#EADBCE]'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#BD8655]"></span>
            <span>سفارش داده شده</span>
            <span className="inline-flex items-center justify-center bg-[#EADBCE] px-2 py-0.5 rounded-full text-xs font-mono text-[#002252]">
              {toPersianDigits(pendingCount)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('delivered')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base transition-all cursor-pointer ${
              activeFilter === 'delivered'
                ? 'bg-[#002252] text-white shadow-sm'
                : 'bg-[#FAF2EC] text-[#6E6B67] hover:bg-[#EADBCE]'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
            <span>تحویل داده شده</span>
            <span className="inline-flex items-center justify-center bg-[#EADBCE] px-2 py-0.5 rounded-full text-xs font-mono text-[#002252]">
              {toPersianDigits(deliveredCount)}
            </span>
          </button>
        </div>

        {/* Search & Refresh Tools */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-72">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6B67] text-xl pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی شماره فیش، میز یا قلم..."
              className="w-full bg-[#FAF2EC] text-[#1E1B18] text-base pr-10 pl-3 py-2 rounded-xl border border-[#EADBCE] outline-none focus:bg-white focus:border-[#002252] transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1 px-3 py-2 bg-[#FAF2EC] hover:bg-[#EADBCE] text-[#002252] rounded-xl text-sm font-bold transition-colors shrink-0 cursor-pointer"
            title="بازخوانی زنده"
          >
            <span className={`material-symbols-outlined text-lg ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>تازه‌سازی</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#EADBCE] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#FAF2EC] text-[#002252] border-b border-[#EADBCE] text-lg font-bold">
                <th className="py-3 px-4">شماره فیش</th>
                <th className="py-3 px-4">موقعیت میز</th>
                <th className="py-3 px-4">مهماندار / ویتر</th>
                <th className="py-3 px-4">خلاصه اقلام فاکتور</th>
                <th className="py-3 px-4 text-left">مبلغ کل (تومان)</th>
                <th className="py-3 px-4 text-center">وضعیت</th>
                <th className="py-3 px-4 text-center w-28">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE] text-base text-[#1E1B18]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#6E6B67] text-lg">
                    هیچ سفارشی مطابق جستجو یا فیلتر یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const summary = order.items
                    .map((item) => `${toPersianDigits(item.quantity)}× ${item.name}`)
                    .join('، ');

                  const isPending = order.status === 'pending' || order.status === 'in_preparation';

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF2EC]/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#002252] text-lg">
                        #{toPersianDigits(order.id)}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#1E1B18]">
                        میز {toPersianDigits(order.tableNumber)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[#6E6B67] font-medium">
                          <span className="material-symbols-outlined text-base text-[#BD8655]">person</span>
                          {order.waiterName}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-[#1E1B18] font-medium line-clamp-1" title={summary}>
                          {summary}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-left font-bold text-[#002252] text-lg">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isPending ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            سفارش داده شده
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            تحویل داده شده
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setQuickInvoiceOrder(order)}
                            className="p-1.5 rounded-lg text-[#002252] hover:bg-[#002252]/10 transition-colors cursor-pointer"
                            title="مشاهده سریع فاکتور"
                          >
                            <span className="material-symbols-outlined text-xl">receipt_long</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickPrint(order.id)}
                            className="p-1.5 rounded-lg text-[#BD8655] hover:bg-[#BD8655]/10 transition-colors cursor-pointer"
                            title="چاپ فیش آشپزخانه"
                          >
                            <span className="material-symbols-outlined text-xl">print</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setAdminView('order_detail');
                            }}
                            className="p-1.5 rounded-lg text-[#6E6B67] hover:text-[#002252] hover:bg-[#FAF2EC] transition-colors cursor-pointer"
                            title="سند کامل سفارش"
                          >
                            <span className="material-symbols-outlined text-xl">open_in_new</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Strip */}
        <div className="px-4 py-3 bg-[#FAF2EC] flex flex-col sm:flex-row items-center justify-between text-[#6E6B67] text-sm gap-2 border-t border-[#EADBCE]">
          <div className="flex items-center gap-2 font-medium">
            <span>نمایش {toPersianDigits(filteredOrders.length)} فیش از مجموع {toPersianDigits(orders.length)} سفارش ثبت‌شده امروز</span>
            <span className="w-1 h-1 rounded-full bg-[#6E6B67]"></span>
            <span className="text-[#002252] font-bold">
              مجموع فاکتورهای نمایش‌یافته: {formatPrice(totalDisplayedPrice)} تومان
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono">
            <button disabled className="px-2.5 py-1 bg-[#EADBCE] text-gray-500 rounded-lg text-xs disabled:opacity-50">
              قبلی
            </button>
            <span className="px-2.5 py-1 bg-[#002252] text-white rounded-lg text-xs font-bold">۱</span>
            <button className="px-2.5 py-1 bg-white border border-[#EADBCE] text-[#002252] rounded-lg text-xs">۲</button>
            <button className="px-2.5 py-1 bg-white border border-[#EADBCE] text-[#002252] rounded-lg text-xs">۳</button>
            <button className="px-2.5 py-1 bg-[#EADBCE] text-[#002252] rounded-lg text-xs">بعدی</button>
          </div>
        </div>
      </div>

      {/* Quick Invoice Modal (From Image 6) */}
      {quickInvoiceOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#EADBCE] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#002252] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-[#F8BA84]">receipt</span>
                <span className="text-xl font-bold">
                  جزئیات فاکتور شماره #{toPersianDigits(quickInvoiceOrder.id)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQuickInvoiceOrder(null)}
                className="text-white hover:bg-white/10 rounded-lg p-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 flex flex-col gap-3 text-base text-[#1E1B18]">
              <div className="flex justify-between items-center py-1.5 bg-[#FAF2EC] px-3 rounded-xl border border-[#EADBCE]/50">
                <span className="text-[#6E6B67]">موقعیت سالن:</span>
                <span className="font-bold text-[#002252] text-lg">میز شماره {toPersianDigits(quickInvoiceOrder.tableNumber)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 bg-[#FAF2EC] px-3 rounded-xl border border-[#EADBCE]/50">
                <span className="text-[#6E6B67]">ویتر ثبت‌کننده:</span>
                <span className="font-bold text-[#1E1B18]">{quickInvoiceOrder.waiterName}</span>
              </div>

              <div className="flex flex-col gap-1 py-1">
                <span className="text-[#6E6B67] font-bold text-sm">اقلام سفارشی ثبت‌شده:</span>
                <div className="p-3 bg-[#FAF2EC] rounded-xl text-base leading-relaxed text-[#1E1B18] border border-[#EADBCE]/60 space-y-1">
                  {quickInvoiceOrder.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>{toPersianDigits(i.quantity)}× {i.name}</span>
                      <span className="font-bold text-[#002252] text-sm">{formatPrice(i.price * i.quantity)} ت</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#EADBCE]">
                <span className="font-bold text-lg text-[#1E1B18]">مبلغ کل قابل پرداخت:</span>
                <span className="text-2xl font-bold text-[#002252]">
                  {formatPrice(quickInvoiceOrder.total)} <span className="text-sm font-normal text-[#835428]">تومان</span>
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-[#FAF2EC] border-t border-[#EADBCE] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setQuickInvoiceOrder(null)}
                className="px-4 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#1E1B18] font-bold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                بستن
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('چاپ فاکتور', `فاکتور رسمی فیش #${quickInvoiceOrder.id} جهت چاپ ارسال گردید.`);
                  setQuickInvoiceOrder(null);
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#002252] text-white font-bold hover:bg-[#00377B] shadow-md transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">print</span>
                <span>چاپ رسمی فاکتور</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
