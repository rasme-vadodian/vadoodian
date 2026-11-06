import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderItem } from '../../types';
import { OrderConfirmModal } from './OrderConfirmModal';

export const WaiterOrderTaking: React.FC = () => {
  const {
    products,
    categories,
    tables,
    selectedTableForOrder,
    activeWaiter,
    setWaiterView,
    toPersianDigits,
    formatPrice,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const [modalOpen, setModalOpen] = useState(false);

  const handleUpdateQty = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isAvailable) return false;
      if (selectedCategory === 'all') return true;
      return p.category === selectedCategory;
    });
  }, [products, selectedCategory]);

  const orderItems: OrderItem[] = useMemo(
    () =>
      Object.keys(quantities)
        .filter((id) => (quantities[id] || 0) > 0)
        .map((id) => {
          const prod = products.find((p) => p.id === id);
          return {
            productId: id,
            name: prod ? prod.name : 'قلم سفارش',
            price: prod ? prod.price : 0,
            quantity: quantities[id],
            image: prod?.image,
          };
        })
        .filter((item) => item.quantity > 0),
    [quantities, products]
  );

  const totalCount = orderItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const currentTable = tables.find((t) => t.id === selectedTableForOrder);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-[#FFF8F4] relative pb-28 select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EADBCE] shadow-xs px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setWaiterView('waiter_workspace')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#002252] hover:bg-[#FAF2EC] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">arrow_forward</span>
          </button>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[#002252]">
              سفارش‌گیری میز {toPersianDigits(selectedTableForOrder)}
            </span>
            <span className="text-xs text-[#835428]">پنل مهماندار سالن</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-sm font-bold text-emerald-800">آماده ثبت</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 flex flex-col gap-4">
        {/* Table Banner */}
        <div className="relative overflow-hidden bg-[#FAF2EC] border border-[#EADBCE] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#002252] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-base">table_restaurant</span>
              </span>
              <span className="text-xl font-bold text-[#002252]">
                میز {toPersianDigits(selectedTableForOrder)}
              </span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFDCC1] text-[#835428] font-bold">
              {currentTable ? `${toPersianDigits(currentTable.capacity)} نفره` : 'تالار عمارت'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#EADBCE] text-sm text-[#6E6B67]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#BD8655]">badge</span>
              <span>مهماندار شیفت:</span>
              <strong className="text-[#1E1B18]">{activeWaiter?.name || '-'}</strong>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono">
              <span className="material-symbols-outlined text-xs text-[#BD8655]">schedule</span>
              <span>
                {new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm shadow-xs transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#002252] text-white shadow-sm'
                : 'bg-white border border-[#EADBCE] text-[#6E6B67] hover:bg-[#FAF2EC]'
            }`}
          >
            همه منو
          </button>
          {categories
            .filter((cat) => cat.isActive)
            .map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm shadow-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#002252] text-white shadow-sm'
                      : 'bg-white border border-[#EADBCE] text-[#6E6B67] hover:bg-[#FAF2EC]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
        </div>

        {/* Products Stream */}
        <div className="flex flex-col gap-3">
          {filteredProducts.length === 0 && (
            <p className="text-center text-sm text-[#6E6B67] py-6 bg-white border border-[#EADBCE] rounded-2xl">
              قلمی در این دسته موجود نیست.
            </p>
          )}

          {filteredProducts.map((product) => {
            const qty = quantities[product.id] || 0;

            return (
              <div
                key={product.id}
                className="flex flex-col p-3 rounded-2xl bg-white border border-[#EADBCE] shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#FAF2EC] border border-[#EADBCE] shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.isFeatured && (
                      <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-[#BD8655] text-white text-[10px] font-bold">
                        ویژه
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-[#002252] leading-tight truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#6E6B67] line-clamp-1 mt-0.5">{product.ingredients}</p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-xl font-bold text-[#002252]">{formatPrice(product.price)}</span>
                      <span className="text-xs text-[#835428]">تومان</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Stepper Row */}
                <div className="flex items-center justify-between pt-2.5 mt-2 bg-[#FAF2EC] px-3 py-1.5 rounded-xl border border-[#EADBCE]/50">
                  <span className="text-xs text-[#6E6B67]">تعداد انتخابی:</span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(product.id, -1)}
                      className={`w-8 h-8 rounded-full bg-white border border-[#EADBCE] text-[#002252] flex items-center justify-center font-bold text-lg transition-transform active:scale-90 cursor-pointer ${
                        qty === 0 ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    >
                      -
                    </button>
                    <span className="font-bold text-xl text-[#002252] min-w-[1.25rem] text-center font-mono">
                      {toPersianDigits(qty)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(product.id, 1)}
                      className="w-8 h-8 rounded-full bg-[#002252] text-white flex items-center justify-center font-bold text-lg transition-transform active:scale-90 cursor-pointer shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-md shadow-2xl border-t border-[#EADBCE] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FFDCC1] text-[#835428] text-xs font-bold font-mono">
                {toPersianDigits(totalCount)}
              </span>
              <span className="text-xs text-[#6E6B67]">قلم انتخاب شده</span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-[#002252] font-mono">{formatPrice(totalPrice)}</span>
              <span className="text-xs text-[#835428] font-bold">تومان</span>
            </div>
          </div>

          <button
            type="button"
            disabled={totalCount === 0}
            onClick={() => setModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#002252] hover:bg-[#00377B] text-white font-bold text-lg shadow-md active:scale-98 transition-transform cursor-pointer disabled:opacity-50"
          >
            <span>بررسی و تایید سفارش</span>
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
        </div>
      </div>

      {/* Modal Confirmation */}
      <OrderConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tableNumber={selectedTableForOrder}
        items={orderItems}
        onOrderConfirmed={() => {
          setModalOpen(false);
          setQuantities({});
          setWaiterView('waiter_workspace');
        }}
      />
    </div>
  );
};
