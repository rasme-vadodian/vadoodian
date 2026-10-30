import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryId, MenuItem, OrderItem } from '../../types';

export const CustomerQuickGrid: React.FC = () => {
  const {
    products,
    categories,
    customerCart,
    updateCustomerCart,
    clearCustomerCart,
    createOrder,
    setSelectedProductId,
    setCustomerView,
    callWaiter,
    callWaiterModalOpen,
    setCallWaiterModalOpen,
    toPersianDigits,
    formatPrice,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | CategoryId>('all');
  const [quickDetailItem, setQuickDetailItem] = useState<MenuItem | null>(null);
  const [trayExpanded, setTrayExpanded] = useState(false);
  const [guestNote, setGuestNote] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Filtering products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.ingredients.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  // Calculate cart items
  const cartEntries: { item: MenuItem; quantity: number }[] = Object.keys(customerCart)
    .filter((id) => (customerCart[id] || 0) > 0)
    .map((id) => ({
      item: products.find((p) => p.id === id)!,
      quantity: customerCart[id]
    }))
    .filter((entry) => !!entry.item);

  const totalCartCount = cartEntries.reduce((acc, entry) => acc + entry.quantity, 0);
  const totalCartPrice = cartEntries.reduce((acc, entry) => acc + entry.item.price * entry.quantity, 0);

  const handleCallWaiter = () => {
    callWaiter(4, 'میز ۴ (شاه‌نشین حیاط)');
    setCallWaiterModalOpen(true);
  };

  const handleSendOrderFromTray = () => {
    if (cartEntries.length === 0) return;
    setIsSubmittingOrder(true);

    const orderItems: OrderItem[] = cartEntries.map((entry) => ({
      productId: entry.item.id,
      name: entry.item.name,
      price: entry.item.price,
      quantity: entry.quantity,
      ingredients: entry.item.ingredients,
      image: entry.item.image
    }));

    setTimeout(() => {
      createOrder({
        tableNumber: 4,
        waiterName: 'مهماندار شیفت (سفارش دیجیتال میز)',
        waiterCode: '۱۰۲۱',
        status: 'pending',
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        date: 'پنج‌شنبه ۲۴ آبان ۱۴۰۳',
        items: orderItems,
        subtotal: totalCartPrice,
        tax: 0,
        serviceFee: 0,
        total: totalCartPrice,
        guestNote: guestNote || 'سفارش آنلاین مستقیم از سر میز ۴',
        paymentMethod: 'pos',
        isPaid: false
      });

      setIsSubmittingOrder(false);
      clearCustomerCart();
      setTrayExpanded(false);
      showToast('سفارش ثبت شد', 'سفارش میز ۴ مستقیماً به مطبخ و پنل ادمین ارسال گردید.');
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#FFF8F4] text-[#1E1B18] pb-32 relative select-none">
      {/* 1. Header with View Switcher */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EADBCE] shadow-xs px-4 pt-3 pb-2.5">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#BD8655]/40 shadow-xs bg-white p-0.5 shrink-0">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDshXBocqdr-7Ym3kj9eC062gWD9l_KjpdF5wZUv6JeF7mccfU2DP53JjCwZy-ZhAAyhG0VZSwqC61oKS_TMXu0veDZlp1LqRvpHCht_9Y7iBIXUS5xxeogbqMQ5IvnjcZJXHzh3HIZAs0nsBxoCtGQwaEPX2nUlgtO48y92AlUNWsolhCW0p09S5xKIDi5wAfIPdxTn6aIByX0AivcVGMCqicFSDdttN7RnhPbpGfeaamurmxyUS8refHfPLXIlpENKiA"
                alt="لوگوی کافه و موزه ودودیان"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#002252] leading-none">کافه و موزه ودودیان</span>
              <span className="text-xs text-[#835428] font-bold mt-0.5">میز ۴ • شاه‌نشین حیاط</span>
            </div>
          </div>

          {/* Quick View Toggle (Switch between Quick Grid and Storytelling Menu) */}
          <div className="flex items-center bg-[#FAF2EC] p-1 rounded-xl border border-[#EADBCE]">
            <button
              type="button"
              onClick={() => setCustomerView('customer_menu')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#6E6B67] hover:text-[#002252] transition-colors cursor-pointer flex items-center gap-1"
              title="مشاهده نمای داستانی و کلاسیک"
            >
              <span className="material-symbols-outlined text-base">view_headline</span>
              <span>کلاسیک</span>
            </button>
            <button
              type="button"
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#002252] text-white shadow-xs flex items-center gap-1"
              title="نمای شبکه‌ای سریع فعال است"
            >
              <span className="material-symbols-outlined text-base text-[#F8BA84]">grid_view</span>
              <span>سریع</span>
            </button>
          </div>
        </div>

        {/* Search Bar with Instant Clear */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute right-3 text-[#BD8655] pointer-events-none text-xl">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی سریع در منو (نام، ترکیبات، کد)..."
            className="w-full bg-[#FAF2EC] text-[#1E1B18] placeholder-[#6E6B67] text-sm pr-9 pl-9 py-2 rounded-xl border border-[#EADBCE] focus:border-[#002252] focus:bg-white focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 w-6 h-6 rounded-full bg-[#EADBCE] text-[#002252] flex items-center justify-center text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sticky Horizontal Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 no-scrollbar scroll-smooth">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#002252] text-white shadow-xs'
                : 'bg-[#FAF2EC] text-[#6E6B67] hover:bg-[#EADBCE]'
            }`}
          >
            <span>همه اقلام</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {toPersianDigits(products.length)}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = products.filter((p) => p.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as CategoryId)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#002252] text-white shadow-xs'
                    : 'bg-[#FAF2EC] text-[#6E6B67] hover:bg-[#EADBCE]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="bg-[#EADBCE] text-[#002252] px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                  {toPersianDigits(count)}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content (Exclusively Compact List Format) */}
      <main className="px-3 pt-2.5 flex flex-col gap-2">
        {/* Counter & Search feedback */}
        <div className="flex items-center justify-between px-1 bg-white p-2.5 rounded-xl border border-[#EADBCE] text-xs shadow-xs">
          <div className="flex items-center gap-1.5 text-[#6E6B67]">
            <span>فهرست فشرده:</span>
            <strong className="text-[#002252] text-sm">{toPersianDigits(filteredProducts.length)}</strong>
            <span>محصول آماده سفارش سر میز</span>
          </div>
          <button
            type="button"
            onClick={() => setCustomerView('customer_menu')}
            className="text-[#835428] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>نمای روایتی و رزرو</span>
            <span className="material-symbols-outlined text-sm">arrow_left</span>
          </button>
        </div>

        {/* Ultra-Compact Row List (Maximum Products Visible at Single Glance) */}
        <div className="flex flex-col gap-2">
          {filteredProducts.map((product) => {
            const currentQty = customerCart[product.id] || 0;

            return (
              <div
                key={product.id}
                className={`bg-white rounded-xl border border-[#EADBCE] p-2.5 flex items-center justify-between gap-3 shadow-xs hover:border-[#002252] transition-all ${
                  !product.isAvailable ? 'opacity-60 bg-[#FAF2EC]/50' : ''
                }`}
              >
                {/* Product Thumbnail & Details */}
                <div
                  onClick={() => setQuickDetailItem(product)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FAF2EC] shrink-0 border border-[#EADBCE] shadow-xs">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.isFeatured && (
                      <span className="absolute top-1 right-1 px-1 py-0.2 rounded bg-[#BD8655] text-white text-[9px] font-bold shadow-xs">
                        ویژه
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-base text-[#002252] truncate leading-tight">
                        {product.name}
                      </h3>
                      {!product.isAvailable && (
                        <span className="text-[9px] px-1.5 bg-red-100 text-red-800 rounded font-bold">
                          ناموجود
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6E6B67] truncate mt-0.5">
                      {product.ingredients}
                    </p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-base font-bold text-[#002252] font-mono leading-none">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-[11px] text-[#835428] font-bold">تومان</span>
                    </div>
                  </div>
                </div>

                {/* Direct Add / Stepper Counter */}
                <div className="shrink-0">
                  {product.isAvailable ? (
                    currentQty === 0 ? (
                      <button
                        type="button"
                        onClick={() => updateCustomerCart(product.id, 1)}
                        className="h-8 px-3 rounded-xl bg-[#002252] hover:bg-[#00377B] text-white font-bold text-xs flex items-center gap-1 transition-transform active:scale-90 shadow-xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span>افزودن</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-[#FAF2EC] border border-[#EADBCE] rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => updateCustomerCart(product.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white text-[#002252] flex items-center justify-center font-bold text-sm shadow-xs cursor-pointer active:scale-90"
                        >
                          -
                        </button>
                        <span className="font-bold text-sm text-[#002252] font-mono min-w-[16px] text-center">
                          {toPersianDigits(currentQty)}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCustomerCart(product.id, 1)}
                          className="w-6 h-6 rounded-lg bg-[#002252] text-white flex items-center justify-center font-bold text-sm shadow-xs cursor-pointer active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    )
                  ) : (
                    <span className="text-xs text-[#6E6B67] font-bold">اتمام موجودی</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Bar: Table Tray Bar & Call Waiter */}
      <div className="fixed bottom-0 inset-x-0 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-md shadow-2xl border-t border-[#EADBCE] px-4 py-2.5">
        {totalCartCount > 0 ? (
          <div className="flex items-center justify-between gap-3">
            <div
              onClick={() => setTrayExpanded(true)}
              className="flex flex-col justify-center cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#BD8655] text-white text-xs font-bold font-mono">
                  {toPersianDigits(totalCartCount)}
                </span>
                <span className="text-xs font-bold text-[#002252] underline">سینی سفارش میز ۴</span>
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold text-[#002252] font-mono">
                  {formatPrice(totalCartPrice)}
                </span>
                <span className="text-xs text-[#835428] font-bold">تومان</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTrayExpanded(true)}
                className="py-2.5 px-3.5 rounded-xl bg-[#002252] hover:bg-[#00377B] text-white font-bold text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-transform cursor-pointer"
              >
                <span>مشاهده و ارسال</span>
                <span className="material-symbols-outlined text-lg">arrow_back</span>
              </button>

              <button
                type="button"
                onClick={handleCallWaiter}
                className="w-10 h-10 rounded-xl bg-[#BD8655] hover:bg-[#835428] text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                title="فراخوانی مهماندار"
              >
                <span className="material-symbols-outlined text-xl animate-bounce">notifications_active</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-[#6E6B67]">سفارش شما خالی است</span>
              <span className="text-sm font-bold text-[#002252]">اقلام مورد نظر را با (+) انتخاب فرمایید</span>
            </div>

            <button
              type="button"
              onClick={handleCallWaiter}
              className="py-2.5 px-4 rounded-xl bg-[#002252] hover:bg-[#00377B] text-white font-bold text-sm flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl text-[#FFDCC1] animate-bounce">
                notifications_active
              </span>
              <span>فراخوانی مهماندار</span>
            </button>
          </div>
        )}
      </div>

      {/* Expandable Order Tray Drawer (سینی سفارش) */}
      {trayExpanded && (
        <div
          onClick={() => setTrayExpanded(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] animate-in slide-in-from-bottom duration-200"
          >
            {/* Tray Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#002252] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-[#F8BA84]">receipt_long</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#002252]">سینی سفارش میز ۴</h3>
                  <span className="text-xs text-[#835428]">شاه‌نشین حیاط عمارت ودودیان</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTrayExpanded(false)}
                className="w-8 h-8 rounded-full bg-[#FAF2EC] flex items-center justify-center text-[#6E6B67] hover:text-black cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Itemized List */}
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-56 pr-1 no-scrollbar">
              {cartEntries.map((entry) => (
                <div
                  key={entry.item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF2EC] border border-[#EADBCE]"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={entry.item.image}
                      alt={entry.item.name}
                      className="w-12 h-12 rounded-lg object-cover border border-[#EADBCE]"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#002252]">{entry.item.name}</h4>
                      <span className="text-xs text-[#835428] font-mono">
                        {formatPrice(entry.item.price)} تومان
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateCustomerCart(entry.item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-[#EADBCE] text-[#002252] flex items-center justify-center font-bold text-base cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-bold text-base text-[#002252] font-mono w-4 text-center">
                      {toPersianDigits(entry.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCustomerCart(entry.item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-[#002252] text-white flex items-center justify-center font-bold text-base cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Note Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#6E6B67]">یادداشت مهمان (قند، ولرم بودن و ...):</label>
              <input
                type="text"
                value={guestNote}
                onChange={(e) => setGuestNote(e.target.value)}
                placeholder="مثال: قهوه کم‌شیرین باشد..."
                className="w-full px-3 py-2 bg-[#FAF2EC] rounded-xl border border-[#EADBCE] text-sm text-[#1E1B18] outline-none"
              />
            </div>

            {/* Total Tally */}
            <div className="flex items-center justify-between pt-2 border-t border-[#EADBCE]">
              <span className="font-bold text-base text-[#1E1B18]">جمع کل اقلام:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#002252] font-mono">{formatPrice(totalCartPrice)}</span>
                <span className="text-xs font-bold text-[#835428]">تومان</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleCallWaiter}
                className="w-1/3 py-3 rounded-xl bg-[#FAF2EC] hover:bg-[#EADBCE] text-[#002252] font-bold text-xs flex flex-col items-center justify-center gap-0.5 cursor-pointer border border-[#EADBCE]"
              >
                <span className="material-symbols-outlined text-lg text-[#BD8655]">campaign</span>
                <span>فراخوان مهماندار</span>
              </button>

              <button
                type="button"
                onClick={handleSendOrderFromTray}
                disabled={isSubmittingOrder}
                className="flex-1 py-3 rounded-xl bg-[#002252] hover:bg-[#00377B] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-xl">send</span>
                <span>{isSubmittingOrder ? 'در حال ارسال...' : 'ارسال مستقیم سفارش به مطبخ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Item Detail Modal */}
      {quickDetailItem && (
        <div
          onClick={() => setQuickDetailItem(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#EADBCE] flex flex-col animate-in zoom-in-95 duration-150"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-[#FAF2EC]">
              <img
                src={quickDetailItem.image}
                alt={quickDetailItem.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setQuickDetailItem(null)}
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#002252]">{quickDetailItem.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-[#FFDCC1] text-[#835428] font-bold rounded">
                    کد {quickDetailItem.code}
                  </span>
                </div>
                <p className="text-xs text-[#6E6B67] mt-1 leading-relaxed">
                  {quickDetailItem.ingredients}
                </p>
              </div>

              {quickDetailItem.story && (
                <div className="p-3 rounded-xl bg-[#FAF2EC] border border-[#EADBCE] text-xs text-[#1E1B18] leading-relaxed">
                  <strong className="text-[#835428] block mb-0.5">روایت تاریخی موزه:</strong>
                  «{quickDetailItem.story}»
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#EADBCE]">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#002252] font-mono">
                    {formatPrice(quickDetailItem.price)}
                  </span>
                  <span className="text-xs text-[#835428] font-bold">تومان</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateCustomerCart(quickDetailItem.id, 1);
                    setQuickDetailItem(null);
                    showToast('افزوده شد', `${quickDetailItem.name} به سینی سفارش افزوده شد.`);
                  }}
                  className="px-4 py-2 bg-[#002252] hover:bg-[#00377B] text-white rounded-xl font-bold text-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>افزودن به سینی</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
