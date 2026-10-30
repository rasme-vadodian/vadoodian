import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';

export const CustomerMenu: React.FC = () => {
  const {
    products,
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
  const [reservationGuests, setReservationGuests] = useState('۲ تا ۴ نفر');
  const [reservationDate, setReservationDate] = useState('امروز، پذیرایی عصرانه');

  // Specialties
  const specialties = products.filter((p) => p.isFeatured);

  // Grouped products
  const hotItems = products.filter((p) => p.category === 'hot');
  const coldItems = products.filter((p) => p.category === 'cold');
  const snackItems = products.filter((p) => p.category === 'snack');
  const dessertItems = products.filter((p) => p.category === 'dessert');

  const handleCallWaiter = () => {
    callWaiter(4, 'میز ۴ (شاه‌نشین حیاط)');
    setCallWaiterModalOpen(true);
  };

  const handleOpenItem = (id: string) => {
    setSelectedProductId(id);
    setCustomerView('customer_item_detail');
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('رزرو میز ثبت شد', `درخواست رزرو شما برای ${reservationGuests} در تاریخ ${reservationDate} دریافت گردید. همکاران ما با شما تماس خواهند گرفت.`);
  };

  const renderProductItem = (item: MenuItem) => {
    return (
      <article
        key={item.id}
        onClick={() => handleOpenItem(item.id)}
        className="menu-item bg-white rounded-2xl p-3 border border-[#BD8655]/25 shadow-xs flex items-center gap-3.5 hover:border-[#002252] transition-all cursor-pointer active:scale-98"
      >
        <img
          src={item.image}
          alt={item.name}
          className={`w-24 h-24 rounded-xl object-cover shrink-0 border border-[#BD8655]/20 ${
            !item.isAvailable ? 'grayscale opacity-60' : ''
          }`}
        />
        <div className="flex flex-col flex-1 justify-between h-full py-0.5 min-w-0">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-bold text-[#002252] leading-snug truncate">
                {item.name}
              </h4>
              {!item.isAvailable && (
                <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold">
                  ناموجود
                </span>
              )}
            </div>
            <p className="text-sm text-[#6E6B67] line-clamp-2 mt-0.5">
              {item.ingredients}
            </p>
          </div>
          <div className="flex items-baseline justify-between mt-2 text-[#002252]">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono">{formatPrice(item.price)}</span>
              <span className="text-xs text-[#835428] font-bold">تومان</span>
            </div>
            <span className="text-xs text-[#6E6B67] font-bold hover:text-[#002252] flex items-center">
              <span>جزئیات</span>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </span>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#FFF8F4] text-[#1E1B18] pb-32 relative select-none">
      {/* 1. Header (Image 24) */}
      <header className="sticky top-0 z-40 bg-[#FFF8F4]/90 backdrop-blur-md border-b border-[#BD8655]/25 shadow-xs">
        <div className="px-4 h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-[#BD8655]/40 shadow-xs bg-white p-0.5">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDshXBocqdr-7Ym3kj9eC062gWD9l_KjpdF5wZUv6JeF7mccfU2DP53JjCwZy-ZhAAyhG0VZSwqC61oKS_TMXu0veDZlp1LqRvpHCht_9Y7iBIXUS5xxeogbqMQ5IvnjcZJXHzh3HIZAs0nsBxoCtGQwaEPX2nUlgtO48y92AlUNWsolhCW0p09S5xKIDi5wAfIPdxTn6aIByX0AivcVGMCqicFSDdttN7RnhPbpGfeaamurmxyUS8refHfPLXIlpENKiA"
                alt="لوگوی کافه و موزه ودودیان"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-[#002252] leading-none">کافه و موزه تاریخی ودودیان</h1>
              <span className="text-xs text-[#835428] font-bold mt-1">منوی دیجیتال • میز ۴ شاه‌نشین حیاط</span>
            </div>
          </div>

          {/* Quick View Toggle */}
          <div className="flex items-center gap-1 bg-[#FAF2EC] p-1 rounded-xl border border-[#BD8655]/30">
            <button
              type="button"
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#002252] text-white shadow-xs flex items-center gap-1"
              title="نمای کلاسیک عمارتی"
            >
              <span className="material-symbols-outlined text-sm">view_headline</span>
              <span>کلاسیک</span>
            </button>
            <button
              type="button"
              onClick={() => setCustomerView('customer_quick_grid')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#6E6B67] hover:text-[#002252] transition-colors cursor-pointer flex items-center gap-1"
              title="تغییر به منوی سریع شبکه‌ای"
            >
              <span className="material-symbols-outlined text-sm text-[#BD8655]">grid_view</span>
              <span>سریع</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-4 flex flex-col gap-5">
        {/* Story Hero Banner (Image 26) */}
        <section className="relative overflow-hidden rounded-2xl bg-[#002252] text-white shadow-md min-h-[160px] flex flex-col justify-end p-4 border border-[#BD8655]/40">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMIHstEoQxoqAqHzlXU9Ad7n4tpE7GynBLNrkvoCeo7qcO9N5cxFZErEO0GevyuQuZd8QlrlcJXrfCTG1NJYazU4sZuQkUmLf_GQbJo1e7fjxWIZDkmTcRcr7IRNdwS25n73CO-8bJtTEkZYOwa2FRvZ3JHSjf5DhDDIhpmP8zZ5ZV7FpoPc8VYoH97P7bnTqPf-pb_VuQqJpdlYLhHG7WqaMOtR4eOKOvthXuurRKMm1Lxv3e4kojfg"
            alt="فضای سنتی و اصیل کافه موزه ودودیان"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#002252] via-[#002252]/60 to-transparent"></div>
          <div className="relative z-10 flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white drop-shadow-sm">کافه و موزه تاریخی ودودیان</h2>
            <p className="text-sm text-[#FFDCC1] drop-shadow-xs">روایت اصالت، طعم و تاریخ در قلب عمارت ناصری</p>
          </div>
        </section>

        {/* 3. Search Bar (Image 24) */}
        <section className="relative">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute right-3.5 text-[#BD8655] pointer-events-none text-2xl">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام نوشیدنی، خوراک، شربت یا شیرینی..."
              className="w-full bg-[#FAF2EC] text-[#1E1B18] placeholder-[#6E6B67] text-base pr-11 pl-4 py-3 rounded-2xl border border-[#BD8655]/30 focus:border-[#002252] focus:bg-white focus:outline-none transition-all shadow-inner"
            />
          </div>
        </section>

        {/* 4. 2x2 Category Grid (Image 24) */}
        <section>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#002252] text-xl">menu_book</span>
              <h3 className="text-xl font-bold text-[#002252]">دسته‌بندی‌های عمارت</h3>
            </div>
            <span className="text-xs text-[#835428] font-bold">۴ رسته پذیرایی</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <a
              href="#cat-hot"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAF2EC] border border-[#BD8655]/30 hover:border-[#002252] shadow-xs active:scale-98 transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-[#002252]/10 flex items-center justify-center shrink-0 text-[#002252]">
                <span className="material-symbols-outlined text-2xl">local_cafe</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-bold text-[#002252] leading-tight truncate">نوشیدنی و خوراک گرم</span>
                <span className="text-xs text-[#6E6B67]">انواع قهوه و دمنوش</span>
              </div>
            </a>

            <a
              href="#cat-cold"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAF2EC] border border-[#BD8655]/30 hover:border-[#002252] shadow-xs active:scale-98 transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-[#BD8655]/15 flex items-center justify-center shrink-0 text-[#BD8655]">
                <span className="material-symbols-outlined text-2xl">emoji_food_beverage</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-bold text-[#002252] leading-tight truncate">نوشیدنی و خوراک سرد</span>
                <span className="text-xs text-[#6E6B67]">شربت‌خانه و بار سرد</span>
              </div>
            </a>

            <a
              href="#cat-snacks"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAF2EC] border border-[#BD8655]/30 hover:border-[#002252] shadow-xs active:scale-98 transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-[#002252]/10 flex items-center justify-center shrink-0 text-[#002252]">
                <span className="material-symbols-outlined text-2xl">bakery_dining</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-bold text-[#002252] leading-tight truncate">میان‌وعده و سبک</span>
                <span className="text-xs text-[#6E6B67]">لقمه‌های عمارتی</span>
              </div>
            </a>

            <a
              href="#cat-pastry"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAF2EC] border border-[#BD8655]/30 hover:border-[#002252] shadow-xs active:scale-98 transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-[#BD8655]/15 flex items-center justify-center shrink-0 text-[#BD8655]">
                <span className="material-symbols-outlined text-2xl">cake</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-bold text-[#002252] leading-tight truncate">کیک و شیرینی</span>
                <span className="text-xs text-[#6E6B67]">دست‌پخت روز مطبخ</span>
              </div>
            </a>
          </div>
        </section>

        {/* Featured Museum Specialties Carousel (Image 26) */}
        <section className="mb-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#BD8655]"></div>
              <h3 className="text-xl font-bold text-[#002252]">امضای ودودیان</h3>
            </div>
            <div className="flex items-center gap-1 text-[#6E6B67] text-xs bg-[#FAF2EC] px-2.5 py-0.5 rounded-full border border-[#EADBCE]">
              <span className="material-symbols-outlined text-sm text-[#BD8655]">arrow_back</span>
              <span>اسکرول افقی</span>
            </div>
          </div>

          <div className="flex flex-row overflow-x-auto scrollbar-none snap-x gap-3 pb-2 no-scrollbar">
            {specialties.map((spec) => (
              <div
                key={spec.id}
                onClick={() => handleOpenItem(spec.id)}
                className="bg-white rounded-2xl overflow-hidden shadow-xs border border-[#BD8655]/25 flex flex-col w-[210px] shrink-0 snap-start cursor-pointer hover:border-[#002252] transition-all"
              >
                <div className="relative h-28 w-full overflow-hidden bg-[#FAF2EC]">
                  <img src={spec.image} alt={spec.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#BD8655] text-white text-[11px] font-bold">
                    ویژه موزه
                  </span>
                </div>
                <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
                  <div>
                    <h4 className="text-lg font-bold text-[#002252] leading-tight truncate">
                      {spec.name}
                    </h4>
                    <p className="text-xs text-[#6E6B67] line-clamp-2 leading-snug mt-1">
                      {spec.ingredients}
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-[#EADBCE]/50">
                    <span className="text-xl font-bold text-[#002252] font-mono">{formatPrice(spec.price)}</span>
                    <span className="text-xs text-[#835428] font-bold">تومان</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories Catalog */}
        {/* 1. Hot Drinks & Food */}
        <section className="flex flex-col gap-3 pt-2" id="cat-hot">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#BD8655]/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#002252]"></span>
              <h3 className="text-2xl font-bold text-[#002252]">نوشیدنی و خوراک گرم</h3>
            </div>
            <span className="text-xs text-[#6E6B67]">{toPersianDigits(hotItems.length)} مورد</span>
          </div>
          <div className="flex flex-col gap-3">
            {hotItems.map(renderProductItem)}
          </div>
        </section>

        {/* 2. Cold Drinks (Sharbat-khane) */}
        <section className="flex flex-col gap-3 pt-4" id="cat-cold">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#BD8655]/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BD8655]"></span>
              <h3 className="text-2xl font-bold text-[#002252]">نوشیدنی و خوراک سرد (شربت‌خانه)</h3>
            </div>
            <span className="text-xs text-[#6E6B67]">{toPersianDigits(coldItems.length)} مورد</span>
          </div>
          <div className="flex flex-col gap-3">
            {coldItems.map(renderProductItem)}
          </div>
        </section>

        {/* 3. Snacks & Light Fare */}
        <section className="flex flex-col gap-3 pt-4" id="cat-snacks">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#BD8655]/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#002252]"></span>
              <h3 className="text-2xl font-bold text-[#002252]">میان‌وعده و خوراک سبک</h3>
            </div>
            <span className="text-xs text-[#6E6B67]">{toPersianDigits(snackItems.length)} مورد</span>
          </div>
          <div className="flex flex-col gap-3">
            {snackItems.map(renderProductItem)}
          </div>
        </section>

        {/* 4. Pastries & Desserts */}
        <section className="flex flex-col gap-3 pt-4" id="cat-pastry">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#BD8655]/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BD8655]"></span>
              <h3 className="text-2xl font-bold text-[#002252]">کیک و شیرینی دست‌پخت عمارت</h3>
            </div>
            <span className="text-xs text-[#6E6B67]">{toPersianDigits(dessertItems.length)} مورد</span>
          </div>
          <div className="flex flex-col gap-3">
            {dessertItems.map(renderProductItem)}
          </div>
        </section>

        {/* Reservation Section (Image 26) */}
        <section className="mt-4 mb-6">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#BD8655]"></div>
            <h3 className="text-xl font-bold text-[#002252]">رزرو میز و همنشینی در عمارت</h3>
          </div>

          <form
            onSubmit={handleReservationSubmit}
            className="bg-[#FAF2EC] border-2 border-[#002252]/20 rounded-2xl p-5 shadow-xs flex flex-col gap-3.5"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#835428] text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-2xl">table_restaurant</span>
              </div>
              <div className="flex flex-col">
                <h4 className="text-lg font-bold text-[#002252]">تجربه همنشینی در فضای تاریخی</h4>
                <p className="text-xs text-[#6E6B67] leading-relaxed mt-0.5">
                  برای برگزاری دورهمی‌های خانوادگی، کاری یا پذیرایی اختصاصی در تالار آینه و حیاط اندرونی.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#002252]">تاریخ و نوبت:</label>
                <select
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  className="bg-white border border-[#EADBCE] rounded-xl px-2.5 py-2 text-sm text-[#1E1B18] font-bold outline-none"
                >
                  <option value="امروز، پذیرایی عصرانه">امروز، عصرانه (۱۶ تا ۲۰)</option>
                  <option value="امروز، پذیرایی شام">امروز، شام (۲۰ تا ۲۴)</option>
                  <option value="فردا، پذیرایی صبحانه">فردا، صبحانه (۰۸ تا ۱۲)</option>
                  <option value="فردا، پذیرایی عصرانه">فردا، عصرانه (۱۶ تا ۲۰)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#002252]">تعداد مهمانان:</label>
                <select
                  value={reservationGuests}
                  onChange={(e) => setReservationGuests(e.target.value)}
                  className="bg-white border border-[#EADBCE] rounded-xl px-2.5 py-2 text-sm text-[#1E1B18] font-bold outline-none"
                >
                  <option value="۲ نفر">۲ نفر (میز ۲ نفره)</option>
                  <option value="۲ تا ۴ نفر">۲ تا ۴ نفر (شاه‌نشین)</option>
                  <option value="۶ نفر">۶ نفر (تالار آینه)</option>
                  <option value="۸ تا ۱۲ نفر">۸ تا ۱۲ نفر (گروهی)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#002252] text-white hover:bg-[#00377B] font-bold text-base flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl text-[#F8BA84]">event_available</span>
              <span>ثبت درخواست رزرو میز</span>
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-[#EADBCE] text-xs text-[#6E6B67]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base text-[#BD8655]">call</span>
                <span>هماهنگی اختصاصی رویداد:</span>
              </span>
              <a href="tel:02133900000" className="font-bold text-[#002252] font-mono text-sm hover:underline">
                ۰۲۱-۳۳۹۰۰۰۰۰
              </a>
            </div>
          </form>
        </section>

        {/* Footer Emblem */}
        <footer className="p-4 rounded-2xl border border-[#BD8655]/30 bg-[#FAF2EC] text-center flex flex-col items-center gap-1.5">
          <span className="text-sm text-[#835428] font-bold">«عمارت و کافه موزه تاریخی ودودیان»</span>
          <span className="text-xs text-[#6E6B67]">طراحی شده جهت خدمت‌رسانی هوشمند سر میزهای میهمانان</span>
        </footer>
      </main>

      {/* Persistent Floating Call Waiter Button (Image 24) */}
      <aside className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <button
          type="button"
          onClick={handleCallWaiter}
          aria-label="فراخوانی مهماندار"
          className="pointer-events-auto flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#002252] text-[#FFF8F4] border-2 border-[#BD8655] shadow-2xl active:scale-95 hover:bg-[#001A41] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl text-[#FFDCC1] animate-bounce">
            notifications_active
          </span>
          <span className="text-xl font-bold tracking-wide">
            فراخوانی مهماندار
          </span>
        </button>
      </aside>

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
