import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryId, MenuItem } from '../../types';

export const MenuManagement: React.FC = () => {
  const {
    products,
    categories,
    tables,
    toggleProductAvailability,
    deleteProduct,
    setSelectedProductId,
    setAdminView,
    addCategory,
    addTable,
    deleteTable,
    categoryModalOpen,
    setCategoryModalOpen,
    toPersianDigits,
    formatPrice
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CategoryId>('all');

  // Inline Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatOrder, setNewCatOrder] = useState('5');
  const [newCatIcon, setNewCatIcon] = useState('local_cafe');

  // Inline Table Form State
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'in_stock' && p.isAvailable) ||
      (stockFilter === 'out_of_stock' && !p.isAvailable);

    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.code.toLowerCase().includes(query) ||
      p.ingredients.toLowerCase().includes(query);

    return matchesCat && matchesStock && matchesQuery;
  });

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatIcon, parseInt(newCatOrder, 10) || 5);
    setNewCatName('');
  };

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newTableNumber, 10);
    if (!num) return;
    addTable(num, parseInt(newTableCapacity, 10) || 4);
    setNewTableNumber('');
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12 select-none">
      {/* Page Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EADBCE] shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#BD8655]"></span>
            <h1 className="text-3xl font-bold text-[#002252]">مدیریت منو و اقلام</h1>
          </div>
          <p className="text-[#6E6B67] text-base">
            کنترل لحظه‌ای موجودی اقلام منو، قیمت‌ها، دسته‌بندی‌ها و چیدمان میزهای عمارت
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FAF2EC] text-[#835428] hover:bg-[#FFDCC1] font-bold text-base rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">folder_managed</span>
            <span>مدیریت دسته‌بندی‌ها</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedProductId('');
              setAdminView('product_edit');
            }}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#002252] text-white hover:bg-[#00377B] font-bold text-base rounded-xl transition-all shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            <span>افزودن محصول جدید</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#EADBCE] flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6B67] text-xl">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام یا کد محصول..."
              className="w-full pl-4 pr-11 py-2.5 bg-[#FAF2EC] text-[#1E1B18] text-base rounded-xl border border-[#EADBCE] outline-none focus:bg-white focus:border-[#002252] transition-all"
            />
          </div>

          {/* Stock Filter Pills */}
          <div className="flex items-center gap-1 bg-[#FAF2EC] p-1 rounded-xl border border-[#EADBCE]">
            <span className="text-sm text-[#6E6B67] px-2 hidden sm:inline font-bold">وضعیت:</span>
            <button
              type="button"
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                stockFilter === 'all'
                  ? 'bg-[#002252] text-white shadow-xs'
                  : 'text-[#6E6B67] hover:text-[#002252]'
              }`}
            >
              همه
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('in_stock')}
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                stockFilter === 'in_stock'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-[#6E6B67] hover:text-emerald-700'
              }`}
            >
              موجود
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                stockFilter === 'out_of_stock'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-[#6E6B67] hover:text-red-700'
              }`}
            >
              ناموجود
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-base whitespace-nowrap transition-all cursor-pointer font-bold ${
              categoryFilter === 'all'
                ? 'bg-[#002252] text-white shadow-xs'
                : 'bg-[#FAF2EC] text-[#6E6B67] hover:bg-[#EADBCE]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#F8BA84]"></span>
            <span>همه اقلام</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-mono">
              {toPersianDigits(products.length)}
            </span>
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.id).length;
            const isSelected = categoryFilter === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id as CategoryId)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-base whitespace-nowrap transition-all cursor-pointer font-bold ${
                  isSelected
                    ? 'bg-[#002252] text-white shadow-xs'
                    : 'bg-[#FAF2EC] text-[#6E6B67] hover:bg-[#EADBCE]'
                }`}
              >
                <span>{cat.name}</span>
                <span className="bg-[#EADBCE] text-[#002252] px-2 py-0.5 rounded-full text-xs font-mono">
                  {toPersianDigits(count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Products Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#EADBCE] overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#FAF2EC] text-[#002252] text-lg font-bold border-b border-[#EADBCE]">
                <th className="py-3.5 px-4 w-20 text-center">تصویر</th>
                <th className="py-3.5 px-4">نام محصول و کد</th>
                <th className="py-3.5 px-4">دسته‌بندی</th>
                <th className="py-3.5 px-4">قیمت پایه</th>
                <th className="py-3.5 px-4 text-center">وضعیت موجودی</th>
                <th className="py-3.5 px-4 text-center w-28">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCE] text-base text-[#1E1B18]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6E6B67] text-lg">
                    محصولی مطابق فیلتر یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-[#FAF2EC]/50 transition-colors ${
                        !product.isAvailable ? 'bg-[#FAF2EC]/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`w-12 h-12 rounded-xl object-cover mx-auto shadow-xs border border-[#EADBCE] transition-all ${
                            !product.isAvailable ? 'grayscale opacity-60' : ''
                          }`}
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-lg text-[#002252]">{product.name}</span>
                            {product.isFeatured && (
                              <span className="material-symbols-outlined text-sm text-[#BD8655]" title="پیشنهاد ویژه">
                                star
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#6E6B67] font-mono">کد: {product.code}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FFDCC1] text-[#835428] text-sm font-bold">
                          {categories.find((c) => c.id === product.category)?.name || product.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-lg font-bold text-[#002252]">{formatPrice(product.price)}</span>
                        <span className="text-xs text-[#6E6B67] mr-1">تومان</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <label className="inline-flex items-center cursor-pointer gap-2">
                          <input
                            type="checkbox"
                            checked={product.isAvailable}
                            onChange={() => toggleProductAvailability(product.id)}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700 shadow-inner"></div>
                          <span
                            className={`text-sm font-bold min-w-[3rem] ${
                              product.isAvailable ? 'text-emerald-800' : 'text-[#835428]'
                            }`}
                          >
                            {product.isAvailable ? 'موجود' : 'ناموجود'}
                          </span>
                        </label>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProductId(product.id);
                              setAdminView('product_edit');
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6E6B67] hover:bg-[#FAF2EC] hover:text-[#002252] transition-all cursor-pointer"
                            title="ویرایش محصول"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`آیا از حذف محصول ${product.name} اطمینان دارید؟`)) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6E6B67] hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
                            title="حذف"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
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

        {/* Table Footer */}
        <div className="bg-[#FAF2EC] px-5 py-3 flex flex-col sm:flex-row items-center justify-between text-[#6E6B67] text-base gap-2 border-t border-[#EADBCE]">
          <div className="flex items-center gap-1 font-bold">
            <span>نمایش {toPersianDigits(filteredProducts.length)} از {toPersianDigits(products.length)} محصول تعریف‌شده</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="px-2.5 py-1 bg-[#002252] text-white rounded-lg font-bold">صفحه ۱</span>
          </div>
        </div>
      </div>

      {/* Inline Section 1: Categories Management (From Image 10) */}
      <section className="bg-white p-6 rounded-2xl shadow-xs border border-[#EADBCE] flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADBCE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#BD8655]/15 flex items-center justify-center text-[#835428]">
              <span className="material-symbols-outlined text-2xl">folder_managed</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BD8655]"></span>
                <h2 className="text-2xl font-bold text-[#002252]">مدیریت دسته‌بندی‌های منو</h2>
              </div>
              <p className="text-sm text-[#6E6B67]">تعریف گروه‌های منوی عمارت و ترتیب نمایش</p>
            </div>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-[#FFDCC1] text-[#835428] font-bold text-sm">
            {toPersianDigits(categories.length)} دسته‌بندی فعال
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Add Category Form */}
          <div className="lg:col-span-5 bg-[#FAF2EC] p-5 rounded-2xl border border-[#EADBCE] flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#002252] font-bold text-lg">
              <span className="material-symbols-outlined text-[#BD8655] text-xl">add_circle</span>
              <span>افزودن دسته‌بندی جدید</span>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-[#1E1B18]">نام دسته‌بندی *</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="مثلاً: دمنوش و عرقیات سنتی"
                  required
                  className="w-full px-3 py-2 bg-white text-[#1E1B18] text-base rounded-xl border border-[#EADBCE] outline-none focus:border-[#002252]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-[#1E1B18]">ترتیب نمایش</label>
                  <input
                    type="number"
                    value={newCatOrder}
                    onChange={(e) => setNewCatOrder(e.target.value)}
                    min={1}
                    className="w-full px-3 py-2 bg-white text-[#1E1B18] text-base rounded-xl border border-[#EADBCE] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-[#1E1B18]">نماد / آیکون</label>
                  <select
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-[#1E1B18] text-base rounded-xl border border-[#EADBCE] outline-none"
                  >
                    <option value="local_cafe">☕ نوشیدنی گرم</option>
                    <option value="water_drop">🧊 نوشیدنی سرد</option>
                    <option value="restaurant">🥪 میان‌وعده</option>
                    <option value="bakery_dining">🍰 کیک و دسر</option>
                    <option value="spa">🌿 دمنوش سنتی</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 bg-[#002252] text-white hover:bg-[#00377B] font-bold text-base rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                <span>افزودن دسته‌بندی</span>
              </button>
            </form>
          </div>

          {/* Existing Categories Table */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="rounded-xl border border-[#EADBCE] overflow-hidden bg-white shadow-xs">
              <table className="w-full text-right border-collapse text-base">
                <thead>
                  <tr className="bg-[#FAF2EC] text-[#6E6B67] text-sm border-b border-[#EADBCE]">
                    <th className="py-2.5 px-3 text-center w-12">ترتیب</th>
                    <th className="py-2.5 px-3">نام دسته‌بندی</th>
                    <th className="py-2.5 px-3 text-center">تعداد محصولات</th>
                    <th className="py-2.5 px-3 text-center">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADBCE]/50">
                  {categories.map((cat, idx) => {
                    const count = products.filter((p) => p.category === cat.id).length;
                    return (
                      <tr key={cat.id} className="hover:bg-[#FAF2EC]/50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-[#6E6B67]">
                          {toPersianDigits(idx + 1)}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-[#FFDCC1] text-[#835428] flex items-center justify-center">
                              <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                            </span>
                            <span className="font-bold text-[#002252] text-base">{cat.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF2EC] text-[#1E1B18] font-bold text-xs border border-[#EADBCE]">
                            {toPersianDigits(count)} محصول
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-800 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span> فعال
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Inline Section 2: Table Manager (From Image 10) */}
      <section className="bg-white p-6 rounded-2xl shadow-xs border border-[#EADBCE] flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADBCE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#BD8655]/15 flex items-center justify-center text-[#835428]">
              <span className="material-symbols-outlined text-2xl">table_restaurant</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BD8655]"></span>
                <h2 className="text-2xl font-bold text-[#002252]">مدیریت و تعریف میزهای سالن</h2>
              </div>
              <p className="text-sm text-[#6E6B67]">تعریف شماره میزها، ظرفیت و موقعیت سالن</p>
            </div>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-[#FFDCC1] text-[#835428] font-bold text-sm">
            {toPersianDigits(tables.length)} میز فعال
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Add Table Form */}
          <div className="lg:col-span-5 bg-[#FAF2EC] p-5 rounded-2xl border border-[#EADBCE] flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#002252] font-bold text-lg">
              <span className="material-symbols-outlined text-[#BD8655] text-xl">add_circle</span>
              <span>افزودن میز جدید</span>
            </div>

            <form onSubmit={handleAddTableSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-[#1E1B18]">شماره میز *</label>
                  <input
                    type="number"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    min={1}
                    max={99}
                    placeholder="مثلاً: ۹"
                    required
                    className="w-full px-3 py-2 bg-white text-[#1E1B18] text-base rounded-xl border border-[#EADBCE] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-[#1E1B18]">ظرفیت</label>
                  <select
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-[#1E1B18] text-base rounded-xl border border-[#EADBCE] outline-none"
                  >
                    <option value="2">۲ نفره</option>
                    <option value="4">۴ نفره</option>
                    <option value="6">۶ نفره</option>
                    <option value="8">۸ نفره</option>
                    <option value="12">۱۲ نفره (گروهی)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 bg-[#002252] text-white hover:bg-[#00377B] font-bold text-base rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                <span>ثبت میز در سالن</span>
              </button>
            </form>
          </div>

          {/* Tables List */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="rounded-xl border border-[#EADBCE] overflow-hidden bg-white shadow-xs">
              <table className="w-full text-right border-collapse text-base">
                <thead>
                  <tr className="bg-[#FAF2EC] text-[#6E6B67] text-sm border-b border-[#EADBCE]">
                    <th className="py-2.5 px-3 text-center w-14">شماره</th>
                    <th className="py-2.5 px-3">ظرفیت</th>
                    <th className="py-2.5 px-3">موقعیت</th>
                    <th className="py-2.5 px-3 text-center">وضعیت</th>
                    <th className="py-2.5 px-3 text-center w-20">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADBCE]/50">
                  {tables.map((tbl) => (
                    <tr key={tbl.id} className="hover:bg-[#FAF2EC]/50 transition-colors">
                      <td className="py-2.5 px-3 text-center">
                        <span className="w-8 h-8 rounded-lg bg-[#FAF2EC] font-bold text-[#002252] flex items-center justify-center mx-auto border border-[#EADBCE]">
                          {toPersianDigits(tbl.id)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#1E1B18]">
                        {toPersianDigits(tbl.capacity)} نفره
                      </td>
                      <td className="py-2.5 px-3 text-[#6E6B67] text-sm">
                        {tbl.section}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-800 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span> فعال
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => deleteTable(tbl.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors mx-auto cursor-pointer"
                          title="حذف میز"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Slide-over Modal for Category Management (Image 10) */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#EADBCE] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-[#FAF2EC] border-b border-[#EADBCE] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#BD8655]/15 flex items-center justify-center text-[#835428]">
                  <span className="material-symbols-outlined text-2xl">folder_managed</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#002252]">مدیریت دسته‌بندی‌های منو</h3>
                  <p className="text-xs text-[#6E6B67]">تعریف و اولویت‌بندی دسته‌های منوی کافه و موزه</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              <form onSubmit={handleAddCategorySubmit} className="p-4 bg-[#FAF2EC] rounded-2xl border border-[#EADBCE] flex flex-col gap-3">
                <span className="font-bold text-base text-[#002252]">ثبت دسته جدید:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="نام دسته‌بندی (مثلاً: شربت‌خانه)"
                    className="px-3 py-2 bg-white rounded-xl border border-[#EADBCE] text-base outline-none"
                    required
                  />
                  <select
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="px-3 py-2 bg-white rounded-xl border border-[#EADBCE] text-base outline-none"
                  >
                    <option value="local_cafe">☕ نوشیدنی گرم</option>
                    <option value="water_drop">🧊 نوشیدنی سرد</option>
                    <option value="restaurant">🥪 میان‌وعده</option>
                    <option value="bakery_dining">🍰 کیک و دسر</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="py-2 bg-[#002252] text-white rounded-xl font-bold text-base hover:bg-[#00377B] cursor-pointer"
                >
                  ثبت دسته
                </button>
              </form>

              <div className="rounded-xl border border-[#EADBCE] overflow-hidden">
                <table className="w-full text-right border-collapse text-base">
                  <thead className="bg-[#FAF2EC] text-[#6E6B67] text-sm">
                    <tr>
                      <th className="p-3">عنوان دسته</th>
                      <th className="p-3 text-center">اقلام</th>
                      <th className="p-3 text-center">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE]">
                    {categories.map((c) => (
                      <tr key={c.id}>
                        <td className="p-3 font-bold text-[#002252] flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg text-[#BD8655]">{c.icon}</span>
                          <span>{c.name}</span>
                        </td>
                        <td className="p-3 text-center">
                          {toPersianDigits(products.filter((p) => p.category === c.id).length)} قلم
                        </td>
                        <td className="p-3 text-center text-emerald-700 font-bold text-sm">فعال</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF2EC] border-t border-[#EADBCE] flex justify-end">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#835428] text-white font-bold text-base hover:bg-[#673D12] cursor-pointer shadow-sm"
              >
                بستن و بازگشت به منو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
