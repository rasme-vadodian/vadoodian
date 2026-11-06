import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';

export const ProductEditForm: React.FC = () => {
  const {
    products,
    categories,
    selectedProductId,
    saveProduct,
    deleteProduct,
    setAdminView,
    toPersianDigits,
    formatPrice
  } = useApp();

  const existingProduct = products.find((p) => p.id === selectedProductId);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<string>('hot');
  const [price, setPrice] = useState('85000');
  const [ingredients, setIngredients] = useState('');
  const [story, setStory] = useState('');
  const [image, setImage] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);
  const [showInQR, setShowInQR] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setCode(existingProduct.code);
      setCategory(existingProduct.category);
      setPrice(existingProduct.price.toString());
      setIngredients(existingProduct.ingredients);
      setStory(existingProduct.story);
      setImage(existingProduct.image);
      setIsAvailable(existingProduct.isAvailable);
      setIsFeatured(existingProduct.isFeatured);
      setShowInQR(existingProduct.showInQR);
    } else {
      // New product defaults
      setName('شربت بهارنارنج و زعفران عمارتی');
      setCode(`VAD-${Math.floor(100 + Math.random() * 900)}`);
      setCategory('cold');
      setPrice('95000');
      setIngredients('عرق بهارنارنج دوآتشه شیراز، شهد زعفران اعلا، بیدمشک و خلال لیمو');
      setStory('دستور به یادگار مانده از اندرونی عمارت در اواسط دوره قاجار که برای پذیرایی از میهمانان ویژه آماده می‌شده است.');
      setImage('https://lh3.googleusercontent.com/aida-public/AB6AXuDTFeg722lng0zL8QnjZmjtbEOATygOoiE6zmLSFLqQ1Wj86-rCAbDJAWXXv-4De622zGIiqVIPRZtIxSGUQokssMO7rVnL8GWCvYrKhambs9pZWngyCJ5S3MV75z9PX3w1fEb5HMc9QzKEbP3l9H-6aCdt1fqZ7gBc9L4rmM-XEWLv3P5yssqhGfnUfbSmF1JAro-YTOB_MQOV_5yFTDnBDxOurGn9w9dTNouExLHjSlbNeSK0ox2sWw');
      setIsAvailable(true);
      setIsFeatured(true);
      setShowInQR(true);
    }
  }, [existingProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const productPayload: MenuItem = {
      id: existingProduct ? existingProduct.id : `p-${Date.now()}`,
      name: name.trim(),
      code: code.trim(),
      category,
      price: parseInt(price.replace(/,/g, ''), 10) || 0,
      ingredients: ingredients.trim(),
      story: story.trim(),
      image: image.trim(),
      isAvailable,
      isFeatured,
      showInQR
    };

    setTimeout(() => {
      saveProduct(productPayload);
      setIsSaving(false);
      setAdminView('menu_management');
    }, 400);
  };

  const handleDelete = () => {
    if (existingProduct && confirm(`آیا از حذف محصول ${existingProduct.name} اطمینان دارید؟`)) {
      deleteProduct(existingProduct.id);
      setAdminView('menu_management');
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 select-none">
      {/* Top Command Bar / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-2xl shadow-xs border border-[#EADBCE]">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-[#002252] text-white shadow-xs">
            <span className="material-symbols-outlined text-2xl text-[#F8BA84]">edit_note</span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#002252]">
                {existingProduct ? `ویرایش محصول: ${existingProduct.name}` : 'تعریف محصول جدید عمارت'}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-[#FFDCC1] text-[#835428] text-xs font-mono font-bold">
                کد: {code}
              </span>
            </div>
            <p className="text-sm text-[#6E6B67]">مشخصات پایه، قیمت‌گذاری، داستان تاریخی موزه و تنظیمات عرضه</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setAdminView('menu_management')}
            className="px-4 py-2 rounded-xl bg-[#FAF2EC] hover:bg-[#EADBCE] text-[#002252] font-bold text-base transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
            <span>بازگشت به فهرست اقلام</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-[#002252] hover:bg-[#00377B] text-white font-bold text-base shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Column (Primary Data: 7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Basic Product Specs */}
          <section className="bg-white p-6 rounded-2xl shadow-xs border border-[#EADBCE] flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
              <div className="flex items-center gap-2 text-[#002252]">
                <span className="material-symbols-outlined text-2xl text-[#BD8655]">feed</span>
                <h2 className="text-xl font-bold">شناسنامه و مشخصات پایه کالا</h2>
              </div>
              <span className="text-xs text-[#6E6B67]">* فیلدهای ستاره‌دار الزامی است</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-base font-bold text-[#1E1B18] flex items-center gap-1">
                  <span>نام محصول (فارسی)</span>
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: قهوه امضای ودودیان"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF2EC] border border-[#EADBCE] text-lg text-[#1E1B18] outline-none focus:bg-white focus:border-[#002252] transition-all font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-base font-bold text-[#1E1B18] flex items-center gap-1">
                  <span>کد اختصاصی (SKU)</span>
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="VAD-101"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF2EC] border border-[#EADBCE] text-lg text-[#002252] text-left font-mono outline-none focus:bg-white focus:border-[#002252] transition-all font-bold"
                />
              </div>
            </div>

            {/* Category Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-[#1E1B18]">دسته‌بندی اصلی منو *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories
                  .filter((cat) => cat.isActive)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                        category === cat.id
                          ? 'bg-[#002252] text-white border-[#002252] shadow-sm'
                          : 'bg-[#FAF2EC] text-[#6E6B67] border-[#EADBCE] hover:bg-white hover:text-[#002252]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                      <span className="text-base font-bold">{cat.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Recipe / Ingredients */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-base font-bold text-[#1E1B18]">محتویات و ترکیبات محصول</label>
                <span className="text-xs text-[#6E6B67]">نمایش در کارت سفارش مشتری</span>
              </div>
              <input
                type="text"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="مثال: اسپرسو دوپل، شربت زعفران، کف شیر دارچینی"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF2EC] border border-[#EADBCE] text-base text-[#1E1B18] outline-none focus:bg-white focus:border-[#002252] transition-all"
              />
            </div>

            {/* Historical Narrative */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-base font-bold text-[#1E1B18] flex items-center gap-1.5">
                  <span>داستان و توصیف تاریخی محصول (بخش موزه)</span>
                  <span className="material-symbols-outlined text-base text-[#BD8655]">history_edu</span>
                </label>
                <span className="text-xs text-[#6E6B67]">حداکثر ۱۲۰ کلمه</span>
              </div>
              <textarea
                rows={3}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="روایت کوتاه از پیشینه دستور پخت یا حس و طعم نوشیدنی در عمارت..."
                className="w-full p-3.5 rounded-xl bg-[#FAF2EC] border border-[#EADBCE] text-base text-[#1E1B18] outline-none focus:bg-white focus:border-[#002252] transition-all leading-relaxed resize-none"
              ></textarea>
            </div>

            {/* Featured Badge Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF2EC] border border-[#EADBCE]">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#FFDCC1] flex items-center justify-center text-[#835428]">
                  <span className="material-symbols-outlined text-2xl">star</span>
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold text-[#002252]">پیشنهاد ویژه کافه</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-[#BD8655]/15 text-[#835428] font-bold">
                      ویژه منو
                    </span>
                  </div>
                  <span className="text-xs text-[#6E6B67]">
                    نمایش نشان ستاره‌دار و قرارگیری در ردیف برگزیده‌های امضای ودودیان
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#002252]"></div>
              </label>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="bg-white p-6 rounded-2xl shadow-xs border border-[#EADBCE] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
              <div className="flex items-center gap-2 text-[#002252]">
                <span className="material-symbols-outlined text-2xl text-[#BD8655]">payments</span>
                <h2 className="text-xl font-bold">قیمت‌گذاری محصول</h2>
              </div>
              <span className="text-xs text-[#835428] font-bold">واحد پول: تومان (IRT)</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-[#1E1B18] flex items-center justify-between">
                <span>قیمت محصول (تومان) *</span>
                <span className="text-xs text-[#6E6B67]">مبلغ قابل پرداخت توسط مشتری</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="۸۵,۰۰۰"
                  required
                  className="w-full pl-16 pr-4 py-3 rounded-xl bg-[#FAF2EC] border border-[#EADBCE] text-2xl text-left font-bold text-[#002252] outline-none focus:bg-white focus:border-[#002252] transition-all"
                />
                <span className="absolute left-4 text-[#6E6B67] text-base select-none font-bold">تومان</span>
              </div>
            </div>
          </section>
        </div>

        {/* Left Column (Media, Status, Actions: 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Media / Photo Upload Card */}
          <section className="bg-white p-6 rounded-2xl shadow-xs border border-[#EADBCE] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EADBCE]">
              <div className="flex items-center gap-2 text-[#002252]">
                <span className="material-symbols-outlined text-2xl text-[#BD8655]">add_a_photo</span>
                <h2 className="text-xl font-bold">تصویر شاخص محصول</h2>
              </div>
              <span className="text-xs text-[#6E6B67]">نسبت ۱:۱ مربع</span>
            </div>

            {/* Preview Image */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FAF2EC] border border-[#EADBCE] shadow-inner group">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-[#835428] text-white text-xs font-bold shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span>تصویر اصلی</span>
              </div>
            </div>

            {/* Image URL input */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-[#1E1B18]">نشانی تصویر محصول (URL):</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-[#FAF2EC] border border-[#EADBCE] text-xs text-left font-mono outline-none"
              />
            </div>
          </section>

          {/* Availability & Menu Settings */}
          <section className="bg-white p-6 rounded-2xl shadow-xs border border-[#EADBCE] flex flex-col gap-5">
            <div className="flex items-center gap-2 text-[#002252] pb-2 border-b border-[#EADBCE]">
              <span className="material-symbols-outlined text-2xl text-[#BD8655]">tune</span>
              <h2 className="text-xl font-bold">وضعیت عرضه و تنظیمات منو</h2>
            </div>

            {/* Main Availability Toggle */}
            <div className="p-4 rounded-xl bg-[#FAF2EC] border border-[#EADBCE] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#002252]">وضعیت موجودی</span>
                <span className={`text-xs mt-0.5 ${isAvailable ? 'text-emerald-800' : 'text-red-700 font-bold'}`}>
                  {isAvailable ? 'آماده ثبت سفارش توسط سالن‌کاران و مشتری' : 'ناموجود (غیرفعال در منو)'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700 shadow-inner"></div>
              </label>
            </div>

            {/* QR Code visibility */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF2EC] border border-[#EADBCE] cursor-pointer hover:bg-[#EFE7E1] transition-colors select-none">
              <input
                type="checkbox"
                checked={showInQR}
                onChange={(e) => setShowInQR(e.target.checked)}
                className="w-5 h-5 rounded text-[#002252] accent-[#002252]"
              />
              <div className="flex flex-col">
                <span className="text-base font-bold text-[#002252]">نمایش در کیو‌آرکد میزها</span>
                <span className="text-xs text-[#6E6B67]">امکان مشاهده و سفارش‌گیری آنلاین سر میز توسط میهمانان</span>
              </div>
            </label>
          </section>

          {/* Action Buttons */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#EADBCE] flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 rounded-xl bg-[#002252] hover:bg-[#00377B] text-white text-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-2xl">check_circle</span>
              <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره و ثبت در منو'}</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAdminView('menu_management')}
                className="py-2.5 rounded-xl bg-[#FAF2EC] hover:bg-[#EADBCE] text-[#002252] font-bold text-base transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                <span>انصراف</span>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={!existingProduct}
                className="py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-base transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-lg">delete_forever</span>
                <span>حذف محصول</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
