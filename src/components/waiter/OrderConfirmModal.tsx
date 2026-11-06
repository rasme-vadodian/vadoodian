import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderItem } from '../../types';

interface OrderConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  items: OrderItem[];
  onOrderConfirmed: () => void;
}

export const OrderConfirmModal: React.FC<OrderConfirmModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
  items,
  onOrderConfirmed
}) => {
  const { activeWaiter, createOrder, toPersianDigits, formatPrice, showToast } = useApp();

  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const serviceFee = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + serviceFee;

  const handleConfirmAndSend = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    const created = await createOrder({
      tableNumber,
      waiterName: activeWaiter?.name ?? '',
      waiterCode: activeWaiter?.code ?? '',
      status: 'pending',
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('fa-IR'),
      items,
      subtotal,
      tax: 0,
      serviceFee,
      total: grandTotal,
      guestNote: note.trim() || undefined,
      paymentMethod: 'pos',
      isPaid: false,
    });

    setIsSubmitting(false);

    if (!created) {
      setError('ثبت سفارش انجام نشد. اتصال شبکه و موجودی اقلام را بررسی کنید.');
      return;
    }

    showToast(
      'سفارش ارسال شد',
      `فیش #${created.number ?? ''} میز ${tableNumber} با موفقیت به پنل مدیریت ارسال گردید.`
    );
    setNote('');
    onOrderConfirmed();
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EADBCE] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Ornamental Header (Image 18) */}
        <div className="relative bg-[#FAF2EC] px-6 pt-3 pb-4 border-b border-[#EADBCE] flex-shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#002252] text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-2xl text-[#F8BA84]">receipt_long</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-[#002252] tracking-tight">
                  پیش‌فاکتور و تایید نهایی سفارش میز {toPersianDigits(tableNumber)}
                </h1>
                <span className="text-xs text-[#835428] font-bold">مهماندار: {activeWaiter?.name || '-'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#002252] via-[#BD8655] to-[#002252]"></div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 divide-y divide-[#EADBCE]">
          {/* Order Details */}
          <section className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#835428]">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">restaurant_menu</span>
                <span>اقلام انتخابی میز ({toPersianDigits(items.length)} قلم)</span>
              </span>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF2EC] border border-[#EADBCE]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#EADBCE] flex items-center justify-center text-[#835428]">
                      <span className="material-symbols-outlined">coffee</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#1E1B18]">{item.name}</h4>
                      <p className="text-xs text-[#6E6B67] mt-0.5">
                        {toPersianDigits(item.quantity)} × {formatPrice(item.price)} تومان
                      </p>
                    </div>
                  </div>
                  <div className="text-left font-bold text-[#002252] text-lg">
                    {formatPrice(item.price * item.quantity)}
                    <span className="text-xs text-[#6E6B67] mr-1 font-normal">تومان</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Kitchen Note */}
          <section className="pt-4 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-[#835428]" htmlFor="order-note">
              <span className="material-symbols-outlined text-base">sticky_note_2</span>
              <span>یادداشت ویژه برای باریستا و مطبخ:</span>
            </label>
            <textarea
              id="order-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="نکات مهمان، زمان‌بندی سرو و قند..."
              className="w-full text-base rounded-xl border border-[#EADBCE] bg-[#FAF2EC] focus:bg-white focus:border-[#002252] text-[#1E1B18] p-3 transition resize-none outline-none"
            ></textarea>
          </section>

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-red-800 text-sm font-bold">
              <span className="material-symbols-outlined text-lg shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Calculations Box */}
          <section className="pt-4">
            <div className="bg-[#FAF2EC] p-4 rounded-2xl border border-[#EADBCE] space-y-2.5">
              <div className="flex items-center justify-between text-base text-[#6E6B67]">
                <span>جمع اقلام سفارش:</span>
                <span className="font-bold text-[#1E1B18]">{formatPrice(subtotal)} تومان</span>
              </div>

              <div className="flex items-center justify-between text-base text-[#6E6B67]">
                <span className="flex items-center gap-1">
                  <span>حق سرویس و میزبانی عمارتی</span>
                  <span className="text-xs bg-[#FFDCC1] text-[#835428] px-1.5 py-0.2 rounded font-bold">
                    ۱۰٪
                  </span>
                </span>
                <span className="font-bold text-[#1E1B18]">{formatPrice(serviceFee)} تومان</span>
              </div>

              <div className="h-px bg-[#EADBCE] my-1"></div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-col">
                  <span className="font-bold text-xl text-[#002252]">مبلغ نهایی قابل پرداخت:</span>
                  <span className="text-xs text-[#6E6B67]">شامل ارزش افزوده و پذیرایی</span>
                </div>
                <div className="text-left">
                  <span className="text-3xl font-bold text-[#002252] font-mono">{formatPrice(grandTotal)}</span>
                  <span className="text-sm font-bold text-[#835428] mr-1">تومان</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FAF2EC] border-t border-[#EADBCE] flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => void handleConfirmAndSend()}
            disabled={isSubmitting}
            className="w-full sm:flex-1 py-3.5 bg-[#002252] hover:bg-[#00377B] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-lg cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-xl">send</span>
            <span>{isSubmitting ? 'در حال ارسال...' : 'تایید و ارسال مستقیم به پنل ادمین'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
