import { MenuItem, Waiter, Order, TableItem, WaiterCall, Category } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'hot',
    name: 'نوشیدنی گرم',
    icon: 'local_cafe',
    order: 1,
    isActive: true,
    itemCount: 12
  },
  {
    id: 'cold',
    name: 'نوشیدنی سرد',
    icon: 'water_drop',
    order: 2,
    isActive: true,
    itemCount: 9
  },
  {
    id: 'snack',
    name: 'میان‌وعده',
    icon: 'restaurant',
    order: 3,
    isActive: true,
    itemCount: 8
  },
  {
    id: 'dessert',
    name: 'کیک و دسر',
    icon: 'bakery_dining',
    order: 4,
    isActive: true,
    itemCount: 9
  }
];

export const INITIAL_PRODUCTS: MenuItem[] = [
  {
    id: 'p-1',
    name: 'قهوه امضای ودودیان',
    code: 'VAD-101',
    category: 'hot',
    price: 85000,
    ingredients: 'اسپرسو دوپل، شربت زعفران قائنات، شیر پرچرب عمارتی، کف شیر دارچینی و گل‌سرخ',
    story: 'تهیه شده بر پایه نسخه دست‌نویس عمارت ودودیان در اواخر دوره قاجار؛ آمیزه‌ای گرم از دانه قهوه تازه برشته با شهد زعفران اعلا و رایحه هل تبریز که در فنجان‌های سفال لعاب‌دار سنتی سرو می‌گردد.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTFeg722lng0zL8QnjZmjtbEOATygOoiE6zmLSFLqQ1Wj86-rCAbDJAWXXv-4De622zGIiqVIPRZtIxSGUQokssMO7rVnL8GWCvYrKhambs9pZWngyCJ5S3MV75z9PX3w1fEb5HMc9QzKEbP3l9H-6aCdt1fqZ7gBc9L4rmM-XEWLv3P5yssqhGfnUfbSmF1JAro-YTOB_MQOV_5yFTDnBDxOurGn9w9dTNouExLHjSlbNeSK0ox2sWw',
    isAvailable: true,
    isFeatured: true,
    showInQR: true
  },
  {
    id: 'p-2',
    name: 'اسپرسو دبل',
    code: 'VAD-102',
    category: 'hot',
    price: 65000,
    ingredients: 'دابل شات عصاره‌گیری شده دانه‌های تخصصی ۱۰۰٪ عربیکا با کرمای طلایی و ماندگار',
    story: 'عصاره غلیظ با طعم‌یاد فندق برشته و شکلات تلخ ۶۵ درصد که در استکان‌های سفارشی عمارت سرو می‌شود.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcipvob22fTzTbdF6bcm2kGK5CZyorhtzOFoFWeoK3qwU_xtg-y5GqACXnVbysoIsA1T3BPtjC8eg_krS7aYRIUqG7I7DaTo-6M5No6zodthJuV-eJlVPzWRN_I3VaorFBa8smZBEauWpZAge-Hn2Tww4G1Z-9CJM17s-s51lg7RWJmoCLLroXjF2dPRjn6fS4dhtjmeHrCXUIRBILzdjvmIBrtA0M5Jp1n0QrOo0oZZPjXUX9e5Hg0w',
    isAvailable: true,
    isFeatured: false,
    showInQR: true
  },
  {
    id: 'p-3',
    name: 'آمریکانو',
    code: 'VAD-103',
    category: 'hot',
    price: 75000,
    ingredients: 'اسپرسو دبل غلیظ به همراه آب تصفیه شده جوش با دمای استاندارد ۹۲ درجه',
    story: 'طعم اصیل قهوه سیاه با نت‌های میوه‌ای ملایم و پس‌مزه کاراملی شفاف.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh-GnqXi5Pd-VQSUZa7usTBOn3enXXF7o5qFR5CY1C51X60qOpGDfh0nLx4mQe6A3994NVELgGYHVrzP3LJNy_XhZlwXAw143ZW7h-DcWX7W0hcYxjfOx5cdxXPzITqMj_eKFZr--o9nGAraCHgNgHWir0uGqj9PJ2Q86183md-KdsgL6JbPcBKFfPeexSokTucGDjmDGpqfFLZdinegSAdqqGThVyOy2qVRNbsf50Ro5huAf5PsYZ-w',
    isAvailable: true,
    isFeatured: false,
    showInQR: true
  },
  {
    id: 'p-4',
    name: 'لاته',
    code: 'VAD-104',
    category: 'hot',
    price: 88000,
    ingredients: 'اسپرسو دبل، شیر پرچرب فوم‌گرفته با تکنیک لاته آرت، کمی پودر هل',
    story: 'بافت ابریشمی شیر محلی تفتان ترکیب شده با گرمای دانه برشته قهوه.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDf1iZyvnXdPig8ECuOWoaFzqpoDeJVSPS10jIG9DrhxD7ZpsFgbVHXvS5wD54RmIWfxXHrStwegNiRjwbHFsjC72ALGrkKa1N5ch_8_B3APW9Tn3uIkw3g7l-XDzqcz-kzy7midCJOFkeVQ_iNTfI2NjzVikK6NBciBmU8fte_2gIdvT11Bh7JnaDj7K5i-SJZAPvPa28tM8a4-fQPfEBRzwX2rgf1QcoQEI5CFgHiDB0QoxgJteq3TA',
    isAvailable: true,
    isFeatured: false,
    showInQR: true
  },
  {
    id: 'p-5',
    name: 'چای قندپهلو شاه‌عباسی',
    code: 'VAD-105',
    category: 'hot',
    price: 45000,
    ingredients: 'چای سرگل بهاره لاهیجان، غنچه گل‌محمدی کاشان، نبات زعفرانی اعلا و هل',
    story: 'سرو در استکان‌های سنتی کمرباریک با نعلبکی شاه‌عباسی برنجی اصیل عمارت.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBloSDG8gO1POxPmYLYApR0xuGaz1qD7lkQRFWKjbxLRq_mIRj6tfH-E3zLTR1TCfZcazxKwOFGn6uAEyGZRI4CARGYCGOQEvlpczNtV4uPmk0Od3Pvi1pzWopDOTdAYrEZ6D4_syNXTW6ILtACHNUsZ5sOlWljsrYeXG2GWE9xkKRc-KnN9J2oumylknWGIbysS4VjbAlBzEZBjXjespsGOMNA0y1eik5YhGIOWjiduHUYW79QucfMLQ',
    isAvailable: true,
    isFeatured: true,
    showInQR: true
  },
  {
    id: 'p-6',
    name: 'شربت زعفران و بیدمشک',
    code: 'VAD-201',
    category: 'cold',
    price: 95000,
    ingredients: 'شهد زعفران قائنات، عرق بیدمشک دوآتشه شیراز، تخم شربتی و یخ بلوری',
    story: 'فرمول اختصاصی شربت‌خانه ناصری که در روزهای گرم تابستان در آب‌انبار عمارت خنک می‌شده است.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQk4jOl0vZopyx_AgUokpqZ64mpfEYmyXoNtbBMBBOgBVyvcs6bB6k3E68VggqbTz0C6-yEbvlcb5yh70NvUiTBPm2xKN49OA0md9aWl7q9QjDpzNBmr3L10GuR1iIunNyE-AQ-wXXBLNSQjUaittZpQtpgkSK0O75AYnKODc6ONZcajZqjehFwKSVsoKVNw4H3rFu4D47-dOONgsJGDN9HM2wsDR1cO-q77u5akZuKXMU15lEUM1QYA',
    isAvailable: true,
    isFeatured: true,
    showInQR: true
  },
  {
    id: 'p-7',
    name: 'شربت سکنجبین خیار و گلاب',
    code: 'VAD-202',
    category: 'cold',
    price: 55000,
    ingredients: 'سرکه‌انگبین طبیعی، خلال خیار بوته‌ای ترد، نعناع تازه و گلاب کاشان',
    story: 'نوشیدنی طبع خنک و سنتی ایرانی برای شادابی و تجدید قوا در حیاط مرکزی موزه.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGzQJCmH422pAt08aSam8sDkkGdpwzzX1uydjVTwBCFON9Wgxwh3Sw6mt4jKMu8-E31qO4ju4QlSBGFN9TbqDWhnAQ0tIoqppb5PsaXQuaMQrmG30Bz4qsyDeLhchNGX8jZHW5bxvCf4sKZ7Aq9y3FEn17zRj7sG9jiMsahSMu-LjMKOLlpj-s0lwS6cuMKIFfBbl6sPg8Sl1HgPoGKzmjaRoEmDZduO46WJL2NaoP4Cie44JUwHI8wQ',
    isAvailable: true,
    isFeatured: true,
    showInQR: true
  },
  {
    id: 'p-8',
    name: 'موهیتو دست‌ساز',
    code: 'VAD-203',
    category: 'cold',
    price: 85000,
    ingredients: 'نعناع تازه باغچه عمارت، لیمو ترش سنگی، سودا خنک، شکر قهوه‌ای',
    story: 'نوشیدنی سرشار از حس طراوت و عطر تازه لیمو و نعناع خرد شده.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWT6DbX2SD9kUPGbs7Bn7GXsvHYLZDj3AGaopNnb3RX0jSnwXF5zjw44tLMGdYqBPzGrt0J7v-_BBjkmcj9LK86k617geZuAHK0kJ7bswwvIhM94cdiENPJipCckj-Mw5p_xu12IOJgZ6T9hHRh3-SvDU9HHqoJhepg6qnSTIA_XHDrRAlunfGc839sWYeLKVE6LMbnUqUybrqZknRKyZmo9y9VF6JU87zlMc0702JO3XGB3NKYFP-1A',
    isAvailable: true,
    isFeatured: false,
    showInQR: true
  },
  {
    id: 'p-9',
    name: 'باقلوای سنتی تبریز',
    code: 'VAD-301',
    category: 'dessert',
    price: 70000,
    ingredients: 'لایه‌های نازک یوفکا، مغز پسته اعلای قزوین و رفسنجان، شهد زعفران و گلاب',
    story: 'دست‌پخت روز قنادی عمارت بر پایه دستور اصیل قاجاری، ترد و بدون قند مصنوعی اضافی.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLA03mXZbU4fkEDJbWdGxQ7JGEX6AknG92NbMJpEl5IsAp5zvE1lyQxRrkwt6EFEJZqg2YvyGRbYEHvBsbYF75P9ISHTChP96ovkzpCA2B30XXon2x5pn7XgQbonRoRFv2VGvdK3NHWzve_nIbAvqIAgPmZG6JE_1A6K0rdgTP_KpWkrjBtglocaBPQV6XbpRyVSvpKnnW1iHg5C-dQ0VwAB8ep9ezpoaPDcz1DC8XAdA7J3wqb3rnlQ',
    isAvailable: true,
    isFeatured: true,
    showInQR: true
  },
  {
    id: 'p-10',
    name: 'چیزکیک کلاسیک ودودیان',
    code: 'VAD-302',
    category: 'dessert',
    price: 120000,
    ingredients: 'پنیر خامه‌ای طبیعی، کراست بیسکویت کره‌ای خانگی، پوره تمشک و انار وحشی',
    story: 'بافت مخملی و خامه‌ای با ته‌مزه ترش‌وشیرین میوه‌های البرز.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpi_oxaYZcGnRjD7IpwhkPHl_pUfs3uo5HLgoPQGVqdkGIQmMnbXBwHDzpfhC_4eH5FCaCSVGVnjegB_jdYWtHIQ7KEbo9FXSFhvwRuc-cH0fu06W1t7RiuX5pAi1DKVcN7BOOxbI2d4sNpN6ByAaRJ7prgNHYzVFhiwcblK8G6-BH4u6phdxxKdreo6fEecweRcPA_zy4LHkGazEJKdAaIh5xpu7Km9ss7S395JZoJERuSfkO0UsKHA',
    isAvailable: false,
    isFeatured: false,
    showInQR: true
  },
  {
    id: 'p-11',
    name: 'کروسان ساده فرانسوی',
    code: 'VAD-401',
    category: 'snack',
    price: 70000,
    ingredients: 'خمیر هزارلا کره‌ای فرانسوی، برشته و ترد با عطر کره تازه حیوانی',
    story: 'پخت تازه در تنور نانوایی عمارت در آغاز هر شیفت کاری صبح و عصر.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmFKuNe8g2CFD0KOr_RatWJjYiMeWGzadLWqu_n_le4CSTM3fj51KOYaJKrGYn8UBSwzl6JOiCotoKnKCN_TbIUswF4GVDQpZ4XTTBwStQtQ3u89H7_IDcFvFk7U5sLiMWSb1dl2_dMlhFSYEkHXFUIufmVnWzI6XpJUbt3sy3K9hURfuOFMDy1mzjBCXqDQSzrIUhax2Gi32QPxYsdHLTYhiEL26aM0hO-gQ2WqGZKYBFffWu5AShmA',
    isAvailable: true,
    isFeatured: false,
    showInQR: true
  },
  {
    id: 'p-12',
    name: 'املت ویژه تهرانی',
    code: 'VAD-402',
    category: 'snack',
    price: 135000,
    ingredients: 'پوره گوجه سرخ‌شده در کره محلی، ۳ عدد تخم‌مرغ رسمی تازه، نان سنگک کنجدی و ریحان',
    story: 'سرو در تابه‌های چدنی سنگین سنتی با فلفل سیاه تازه ساییده و سبزی‌خوردن باغچه.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkDm8cA_fi44qT6GBKA0dlBMqfmP7ESDZzWnO_hSQLx5JlAQ5XB9PAxgRIFaYRB1Gytvw-pR4H0KGKvL9XPWExhBwuByJWs1v5LxwvCUvwDxDZ8j6Gt4xvO-uj4YUzPLjOrieDCjssP3RqA_V5cMUz1uxYFO0FkZmUbB1mL7Mtp1KS8VOWi6O5_WOta7DQy_fbRdVe54Yp5WefBAPby_z-QhCCP49VM-0-mTn_IQF6Or0ZixFzeEYFqQ',
    isAvailable: true,
    isFeatured: true,
    showInQR: true
  }
];

export const INITIAL_WAITERS: Waiter[] = [
  {
    id: 'w-1',
    name: 'علی رضایی',
    code: '۱۰۲۱',
    pin: '4123',
    shift: 'شیفت صبح (۰۸:۰۰ الی ۱۶:۰۰)',
    ordersCount: 443,
    totalSales: 14850000,
    todayOrders: 18,
    monthOrders: 425
  },
  {
    id: 'w-2',
    name: 'سارا معتمد',
    code: '۱۰۲۲',
    pin: '2201',
    shift: 'شیفت عصر (۱۶:۰۰ الی ۲۴:۰۰)',
    ordersCount: 404,
    totalSales: 11200000,
    todayOrders: 14,
    monthOrders: 390
  },
  {
    id: 'w-3',
    name: 'رضا کمالی',
    code: '۱۰۲۳',
    pin: '7734',
    shift: 'شیفت صبح (۰۸:۰۰ الی ۱۶:۰۰)',
    ordersCount: 322,
    totalSales: 9450000,
    todayOrders: 9,
    monthOrders: 313
  },
  {
    id: 'w-4',
    name: 'مهدی صادقی',
    code: '۱۰۲۴',
    pin: '9011',
    shift: 'شیفت عصر (۱۶:۰۰ الی ۲۴:۰۰)',
    ordersCount: 185,
    totalSales: 4300000,
    todayOrders: 3,
    monthOrders: 182
  }
];

export const INITIAL_TABLES: TableItem[] = [
  { id: 1, capacity: 2, status: 'occupied', section: 'شاه‌نشین حیاط', activeReceiptId: '۸۸۴۰' },
  { id: 2, capacity: 4, status: 'calling_waiter', section: 'تالار آینه', activeReceiptId: '۸۸۳۹' },
  { id: 3, capacity: 4, status: 'occupied', section: 'تالار آینه', activeReceiptId: '۸۸۳۶' },
  { id: 4, capacity: 6, status: 'calling_waiter', section: 'شاه‌نشین حیاط', activeReceiptId: '۸۸۴۲' },
  { id: 5, capacity: 2, status: 'in_preparation', section: 'ایوان حوض‌خانه' },
  { id: 6, capacity: 8, status: 'calling_waiter', section: 'حیاط اندرونی', activeReceiptId: '۸۸۳۸' },
  { id: 7, capacity: 4, status: 'occupied', section: 'شاه‌نشین حیاط', activeReceiptId: '۸۸۳۵' },
  { id: 8, capacity: 4, status: 'occupied', section: 'حیاط اندرونی', activeReceiptId: '۸۸۳۹' },
  { id: 12, capacity: 6, status: 'in_preparation', section: 'تالار آینه', activeReceiptId: '۸۸۴۱' },
  { id: 15, capacity: 4, status: 'available', section: 'ایوان حوض‌خانه' }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: '۸۸۴۲',
    tableNumber: 4,
    waiterName: 'علی رضایی',
    waiterCode: '۱۰۲۱',
    status: 'pending',
    time: '۱۸:۴۱',
    date: 'پنج‌شنبه ۲۴ آبان ۱۴۰۳',
    items: [
      {
        productId: 'p-1',
        name: 'قهوه امضای ودودیان',
        price: 120000,
        quantity: 2,
        ingredients: 'اسپرسو دوبل، شربت زعفران، کف شیر دارچینی',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9WfOi5vGxVl5kNa1Y1oqA3pVJjBiWpwmFW9xLwKDx54SYJIpz_VwNlT0l4kweW0_OtdRqXveVu-vA4LCdfbNEyYGv_eO5uq4Z1M0nD7j_RH2ZtN03CT9Tsq-7-EbDAkOrTZJ0vNQs3oem7rrtouYbrh-35bIfBSgYUrzLH8Y6RxQsCtBcIdwn0g5K8aYK3JUCKaaENRJi62WUnbNuRslX1Aoh3_Moz5v3XZobXV8_idN45q0HHV2-Gw'
      },
      {
        productId: 'p-9',
        name: 'باقلوای سنتی تبریز',
        price: 180000,
        quantity: 1,
        ingredients: 'مغز پسته اعلا، شربت گلاب دوآتشه',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLA03mXZbU4fkEDJbWdGxQ7JGEX6AknG92NbMJpEl5IsAp5zvE1lyQxRrkwt6EFEJZqg2YvyGRbYEHvBsbYF75P9ISHTChP96ovkzpCA2B30XXon2x5pn7XgQbonRoRFv2VGvdK3NHWzve_nIbAvqIAgPmZG6JE_1A6K0rdgTP_KpWkrjBtglocaBPQV6XbpRyVSvpKnnW1iHg5C-dQ0VwAB8ep9ezpoaPDcz1DC8XAdA7J3wqb3rnlQ'
      },
      {
        productId: 'p-5',
        name: 'چای قاجاری سنتی در استکان کمرباریک',
        price: 95000,
        quantity: 1,
        ingredients: 'همراه با هل، نبات زعفرانی و نقل',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBloSDG8gO1POxPmYLYApR0xuGaz1qD7lkQRFWKjbxLRq_mIRj6tfH-E3zLTR1TCfZcazxKwOFGn6uAEyGZRI4CARGYCGOQEvlpczNtV4uPmk0Od3Pvi1pzWopDOTdAYrEZ6D4_syNXTW6ILtACHNUsZ5sOlWljsrYeXG2GWE9xkKRc-KnN9J2oumylknWGIbysS4VjbAlBzEZBjXjespsGOMNA0y1eik5YhGIOWjiduHUYW79QucfMLQ'
      },
      {
        productId: 'p-7',
        name: 'شربت بیدمشک و نسترن شیراز',
        price: 20000,
        quantity: 1,
        ingredients: 'عرق بیدمشک و نسترن ناب',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEHlMO6pxi3GImks-N92cKIWLWmpV2QN8N8kt-YvwFakS2vmtnDmeJkQjIywJuXcbT9d857i86mrL2YsrH3bElDuJdvzUiMnVabIAppi1xbI7AJkGH1OrP5IcY2KejYGOVzaBOCFbi5YNu9WyY8OuCa5DrWPyYx9UvBO7pI4TgXdfh2njiv1cqiznXHcr9rJlUBbP153WqGjh3U-4A38zY1rxGumHINvwY_894qji6TaLNGjJIRfxipA'
      }
    ],
    subtotal: 535000,
    tax: 53500,
    serviceFee: 0,
    total: 588500,
    guestNote: 'مهمان محترم درخواست قهوه با دمای سرو ملایم (ولرم) و باقلوای بدون شکر مضاعف داشتند. چای قاجاری به همراه قندان مجزا و آب جوش اضافه بر سر میز آورده شود.',
    paymentMethod: 'pos',
    isPaid: true
  },
  {
    id: '۸۸۴۱',
    tableNumber: 12,
    waiterName: 'سارا معتمد',
    waiterCode: '۱۰۲۲',
    status: 'pending',
    time: '۱۸:۳۵',
    date: 'پنج‌شنبه ۲۴ آبان ۱۴۰۳',
    items: [
      { productId: 'p-5', name: 'چای سنتی دمی شاه‌عباسی', price: 45000, quantity: 1 },
      { productId: 'p-9', name: 'باقلوا پسته', price: 70000, quantity: 2 },
      { productId: 'p-6', name: 'شربت زعفران', price: 95000, quantity: 1 }
    ],
    subtotal: 280000,
    tax: 28000,
    serviceFee: 12000,
    total: 320000,
    paymentMethod: 'online',
    isPaid: false
  },
  {
    id: '۸۸۴۰',
    tableNumber: 1,
    waiterName: 'علی رضایی',
    waiterCode: '۱۰۲۱',
    status: 'delivered',
    time: '۱۸:۱۰',
    date: 'پنج‌شنبه ۲۴ آبان ۱۴۰۳',
    items: [
      { productId: 'p-4', name: 'کاپوچینو و لاته', price: 88000, quantity: 3 },
      { productId: 'p-10', name: 'چیزکیک انار ودودیان', price: 120000, quantity: 2 }
    ],
    subtotal: 504000,
    tax: 50400,
    serviceFee: 35600,
    total: 590000,
    paymentMethod: 'pos',
    isPaid: true
  },
  {
    id: '۸۸۳۹',
    tableNumber: 2,
    waiterName: 'سارا معتمد',
    waiterCode: '۱۰۲۲',
    status: 'pending',
    time: '۱۸:۳۲',
    date: 'پنج‌شنبه ۲۴ آبان ۱۴۰۳',
    items: [
      { productId: 'p-7', name: 'شربت بیدمشک و نسترن شیراز', price: 110000, quantity: 2 },
      { productId: 'p-12', name: 'کشک بادمجان مخصوص عمارت', price: 290000, quantity: 1 },
      { productId: 'p-5', name: 'دمنوش آرامش بهارنارنج', price: 170000, quantity: 1 }
    ],
    subtotal: 680000,
    tax: 0,
    serviceFee: 0,
    total: 680000,
    guestNote: 'کشک بادمجان کم‌روغن سرو شود؛ نان سنگک تازه کنار غذا فراموش نشود.',
    paymentMethod: 'pos',
    isPaid: false
  },
  {
    id: '۸۸۳۸',
    tableNumber: 6,
    waiterName: 'سارا معتمد',
    waiterCode: '۱۰۲۲',
    status: 'pending',
    time: '۱۸:۲۵',
    date: 'پنج‌شنبه ۲۴ آبان ۱۴۰۳',
    items: [
      { productId: 'p-5', name: 'دمنوش بهارنارنج', price: 65000, quantity: 4 },
      { productId: 'p-9', name: 'حلوا زعفرانی تبریز', price: 150000, quantity: 1 }
    ],
    subtotal: 410000,
    tax: 0,
    serviceFee: 0,
    total: 410000,
    paymentMethod: 'pos',
    isPaid: false
  },
  {
    id: '۸۸۳۷',
    tableNumber: 15,
    waiterName: 'مهدی صادقی',
    waiterCode: '۱۰۲۴',
    status: 'delivered',
    time: '۱۷:۴۰',
    date: 'پنج‌شنبه ۲۴ آبان ۱۴۰۳',
    items: [
      { productId: 'p-3', name: 'قهوه فرانسه', price: 100000, quantity: 2 },
      { productId: 'p-11', name: 'کروسان پسته و هل', price: 70000, quantity: 2 }
    ],
    subtotal: 340000,
    tax: 0,
    serviceFee: 0,
    total: 340000,
    paymentMethod: 'online',
    isPaid: true
  },
  {
    id: '۸۸۳۶',
    tableNumber: 3,
    waiterName: 'علی رضایی',
    waiterCode: '۱۰۲۱',
    status: 'delivered',
    time: '۱۷:۲۰',
    date: 'پنج‌شنبه ۲۴ آبان ۱۴۰۳',
    items: [
      { productId: 'p-6', name: 'کلدبرو زعفرانی', price: 120000, quantity: 1 },
      { productId: 'p-9', name: 'تارت توت‌فرنگی و گلاب', price: 90000, quantity: 1 }
    ],
    subtotal: 210000,
    tax: 0,
    serviceFee: 0,
    total: 210000,
    paymentMethod: 'pos',
    isPaid: true
  },
  {
    id: '۸۸۳۵',
    tableNumber: 7,
    waiterName: 'سارا معتمد',
    waiterCode: '۱۰۲۲',
    status: 'delivered',
    time: '۱۶:۵۰',
    date: 'پنج‌شنبه ۲۴ آبان ۱۴۰۳',
    items: [
      { productId: 'p-3', name: 'آمریکانو', price: 65000, quantity: 2 },
      { productId: 'p-9', name: 'براونی گردویی داغ', price: 65000, quantity: 2 }
    ],
    subtotal: 260000,
    tax: 0,
    serviceFee: 0,
    total: 260000,
    paymentMethod: 'pos',
    isPaid: true
  }
];

export const INITIAL_CALLS: WaiterCall[] = [
  {
    id: 'call-1',
    tableNumber: 4,
    tableName: 'میز ۴ (شاه‌نشین حیاط)',
    time: '۱۸:۴۰',
    minutesAgo: 2,
    type: 'call_waiter',
    status: 'pending'
  },
  {
    id: 'call-2',
    tableNumber: 2,
    tableName: 'میز ۲ (تالار آینه)',
    time: '۱۸:۳۰',
    minutesAgo: 12,
    type: 'bill_request',
    status: 'pending'
  },
  {
    id: 'call-3',
    tableNumber: 7,
    tableName: 'میز ۷ (شاه‌نشین حیاط)',
    time: '۱۸:۲۵',
    minutesAgo: 17,
    type: 'service_refill',
    status: 'pending'
  },
  {
    id: 'call-4',
    tableNumber: 6,
    tableName: 'میز ۶ (حیاط اندرونی)',
    time: '۱۸:۳۹',
    minutesAgo: 3,
    type: 'call_waiter',
    status: 'pending'
  }
];
