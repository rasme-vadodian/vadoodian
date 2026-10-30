import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const CustomerItemDetail: React.FC = () => {
  const {
    products,
    selectedProductId,
    setCustomerView,
    callWaiter,
    callWaiterModalOpen,
    setCallWaiterModalOpen,
    toPersianDigits,
    formatPrice
  } = useApp();

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const handleCallWaiter = () => {
    callWaiter(4, 'میز ۴ (شاه‌نشین حیاط)');
    setCallWaiterModalOpen(true);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-[#FFF8F4] relative pb-28 select-none">
      {/* Visual Showcase with Arch Framing */}
      <div className="relative w-full overflow-hidden bg-[#FAF2EC] rounded-b-[2.5rem] shadow-sm">
        <div className="relative w-full h-80 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#002252]/90 via-black/20 to-black/30"></div>

          {/* Top Back button */}
          <div className="absolute top-4 right-4 z-20">
            <button
              type="button"
              onClick={() => setCustomerView('customer_menu')}
              aria-label="بازگشت به منو"
              className="flex items-center justify-center w-11 h-11 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">arrow_forward</span>
            </button>
          </div>

          {/* Bottom Title & Category Tag */}
          <div className="absolute bottom-5 right-5 left-5 flex items-end justify-between z-10">
            <div className="flex flex-col gap-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#BD8655]/60 text-[#FFDCC1] shadow-sm w-fit">
                <span className="material-symbols-outlined text-base">local_cafe</span>
                <span className="font-bold text-xs">
                  دسته‌بندی: {product.category === 'hot' ? 'نوشیدنی گرم و دمی' : product.category === 'cold' ? 'شربت‌خانه و نوشیدنی سرد' : product.category === 'snack' ? 'میان‌وعده عمارتی' : 'کیک و شیرینی دست‌پخت'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight">
                {product.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content Stream (Image 28) */}
      <div className="px-4 flex flex-col gap-5 mt-4">
        {/* Title & Ingredients Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#EADBCE] flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-5 bg-[#BD8655] rounded-full"></span>
              <h3 className="text-xl font-bold text-[#002252]">
                محتویات و ترکیبات محصول
              </h3>
            </div>
            <p className="text-[#6E6B67] text-base leading-relaxed text-right">
              {product.ingredients}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-[#EADBCE]">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-[#002252] font-mono">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-[#835428] font-bold">تومان</span>
            </div>

            <span className="text-xs px-2.5 py-1 rounded-full bg-[#FAF2EC] text-[#002252] border border-[#EADBCE] font-bold">
              کد: {product.code}
            </span>
          </div>
        </div>

        {/* Historical Narrative Card */}
        {product.story && (
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#EADBCE] flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-[#835428] font-bold text-lg">
              <span className="material-symbols-outlined text-xl">history_edu</span>
              <span>روایت تاریخی محصول (کافه و موزه ودودیان)</span>
            </div>
            <p className="text-[#1E1B18] text-base leading-relaxed text-right font-medium">
              «{product.story}»
            </p>
          </div>
        )}

        {/* Table Notice */}
        <div className="bg-[#FAF2EC] rounded-2xl p-4 border border-[#EADBCE] text-sm text-[#6E6B67] flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-[#BD8655]">room_service</span>
          <p>
            برای ثبت سفارش این قلم یا درخواست پذیرایی، دکمه فراخوانی مهماندار در پایین صفحه را لمس فرمایید.
          </p>
        </div>
      </div>

      {/* Floating Call Waiter Button */}
      <div className="fixed bottom-6 z-50 flex items-center inset-x-0 justify-center pointer-events-none">
        <button
          type="button"
          onClick={handleCallWaiter}
          aria-label="صدا کردن ویتر"
          className="pointer-events-auto flex items-center gap-2.5 px-6 py-3.5 bg-[#002252] text-white rounded-full shadow-2xl border-2 border-[#BD8655] active:scale-95 transition-all hover:bg-[#00377B] cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl text-[#FFDCC1] animate-bounce">
            notifications_active
          </span>
          <span className="text-xl font-bold tracking-wide">
            فراخوانی مهماندار
          </span>
        </button>
      </div>

      {/* Waiter Summoned Modal (Image 24) */}
      {callWaiterModalOpen && (
        <div
          onClick={() => setCallWaiterModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFF8F4] w-full max-w-xs rounded-3xl p-6 border-2 border-[#BD8655] shadow-2xl flex flex-col items-center text-center gap-3 animate-in zoom-in-95 duration-200"
          >
            <div className="w-16 h-16 rounded-full bg-[#002252] text-[#FFDCC1] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-3xl">room_service</span>
            </div>
            <h3 className="text-2xl font-bold text-[#002252]">مهماندار فراخوانده شد</h3>
            <p className="text-base text-[#6E6B67] leading-relaxed">
              پیام شما ثبت شد. مهماندار عمارت ودودیان تا لحظاتی دیگر جهت ثبت سفارش بر سر میز شما حاضر خواهد شد.
            </p>
            <button
              type="button"
              onClick={() => setCallWaiterModalOpen(false)}
              className="w-full mt-2 py-3 rounded-xl bg-[#BD8655] text-white font-bold text-lg active:scale-95 transition-all shadow-md cursor-pointer"
            >
              سپاسگزارم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
