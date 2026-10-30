import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, Waiter, Order, TableItem, WaiterCall, Category } from '../types';
import { INITIAL_PRODUCTS, INITIAL_WAITERS, INITIAL_TABLES, INITIAL_ORDERS, INITIAL_CALLS, INITIAL_CATEGORIES } from '../data/initialData';

export type AppMode = 'admin' | 'waiter' | 'customer';

export type AdminView = 
  | 'live_tables' 
  | 'orders_list' 
  | 'order_detail' 
  | 'menu_management' 
  | 'product_edit' 
  | 'staff_performance' 
  | 'admin_login';

export type WaiterView = 
  | 'waiter_login' 
  | 'waiter_workspace' 
  | 'waiter_ordering';

export type CustomerView = 
  | 'customer_menu' 
  | 'customer_quick_grid'
  | 'customer_item_detail';

interface CustomerCartItem {
  productId: string;
  quantity: number;
}

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  adminView: AdminView;
  setAdminView: (view: AdminView) => void;
  waiterView: WaiterView;
  setWaiterView: (view: WaiterView) => void;
  customerView: CustomerView;
  setCustomerView: (view: CustomerView) => void;

  // Data
  products: MenuItem[];
  categories: Category[];
  waiters: Waiter[];
  tables: TableItem[];
  orders: Order[];
  calls: WaiterCall[];

  // Selections
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  selectedOrderId: string;
  setSelectedOrderId: (id: string) => void;
  selectedTableForOrder: number;
  setSelectedTableForOrder: (table: number) => void;
  activeWaiter: Waiter | null;
  setActiveWaiter: (waiter: Waiter | null) => void;

  // Modals & Overlays
  categoryModalOpen: boolean;
  setCategoryModalOpen: (open: boolean) => void;
  waiterProfileModalOpen: boolean;
  setWaiterProfileModalOpen: (open: boolean) => void;
  orderConfirmModalOpen: boolean;
  setOrderConfirmModalOpen: (open: boolean) => void;
  quickInvoiceOrder: Order | null;
  setQuickInvoiceOrder: (order: Order | null) => void;
  callWaiterModalOpen: boolean;
  setCallWaiterModalOpen: (open: boolean) => void;

  // Actions
  toggleProductAvailability: (id: string) => void;
  saveProduct: (product: MenuItem) => void;
  deleteProduct: (id: string) => void;

  addCategory: (name: string, icon: string, order: number) => void;
  toggleCategoryStatus: (id: string) => void;

  addTable: (id: number, capacity: number) => void;
  deleteTable: (id: number) => void;

  saveWaiter: (waiter: Partial<Waiter> & { name: string; code: string; pin: string }) => void;
  updateWaiterPin: (code: string, newPin: string) => void;
  deleteWaiter: (id: string) => void;

  callWaiter: (tableNumber: number, tableName?: string) => void;
  acceptCall: (callId: string) => void;
  resolveCall: (callId: string) => void;

  createOrder: (order: Omit<Order, 'id'> & { id?: string }) => Order;
  cancelOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Customer Cart / Table Tray
  customerCart: { [productId: string]: number };
  updateCustomerCart: (productId: string, delta: number) => void;
  clearCustomerCart: () => void;

  // Toast
  toast: { title: string; message: string } | null;
  showToast: (title: string, message: string) => void;

  // Utils
  toPersianDigits: (n: number | string) => string;
  formatPrice: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>('admin');
  const [adminView, setAdminView] = useState<AdminView>('live_tables');
  const [waiterView, setWaiterView] = useState<WaiterView>('waiter_workspace');
  const [customerView, setCustomerView] = useState<CustomerView>('customer_menu');

  // Load from local storage or initial
  const [products, setProducts] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('vadudian_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('vadudian_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [waiters, setWaiters] = useState<Waiter[]>(() => {
    const saved = localStorage.getItem('vadudian_waiters');
    return saved ? JSON.parse(saved) : INITIAL_WAITERS;
  });

  const [tables, setTables] = useState<TableItem[]>(() => {
    const saved = localStorage.getItem('vadudian_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('vadudian_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [calls, setCalls] = useState<WaiterCall[]>(() => {
    const saved = localStorage.getItem('vadudian_calls');
    return saved ? JSON.parse(saved) : INITIAL_CALLS;
  });

  const [selectedProductId, setSelectedProductId] = useState<string>('p-1');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('۸۸۴۲');
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<number>(4);
  const [activeWaiter, setActiveWaiter] = useState<Waiter | null>(INITIAL_WAITERS[0]);

  // Modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [waiterProfileModalOpen, setWaiterProfileModalOpen] = useState(false);
  const [orderConfirmModalOpen, setOrderConfirmModalOpen] = useState(false);
  const [quickInvoiceOrder, setQuickInvoiceOrder] = useState<Order | null>(null);
  const [callWaiterModalOpen, setCallWaiterModalOpen] = useState(false);

  // Customer Cart / Table Tray
  const [customerCart, setCustomerCart] = useState<{ [productId: string]: number }>(() => {
    const saved = localStorage.getItem('vadudian_customer_cart');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('vadudian_customer_cart', JSON.stringify(customerCart));
  }, [customerCart]);

  const updateCustomerCart = (productId: string, delta: number) => {
    setCustomerCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const clearCustomerCart = () => {
    setCustomerCart({});
  };

  // Toast
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('vadudian_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('vadudian_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('vadudian_waiters', JSON.stringify(waiters));
  }, [waiters]);

  useEffect(() => {
    localStorage.setItem('vadudian_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('vadudian_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('vadudian_calls', JSON.stringify(calls));
  }, [calls]);

  const toPersianDigits = (n: number | string): string => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n.toString().replace(/\d/g, (x) => persianDigits[parseInt(x, 10)]);
  };

  const formatPrice = (amount: number): string => {
    return toPersianDigits(amount.toLocaleString('en-US'));
  };

  const toggleProductAvailability = (id: string) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const saveProduct = (product: MenuItem) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });
    showToast('ذخیره شد', `محصول ${product.name} با موفقیت در منو بروزرسانی گردید.`);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('حذف محصول', 'محصول انتخاب شده از منو حذف شد.');
  };

  const addCategory = (name: string, icon: string, order: number) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      icon: icon || 'local_cafe',
      order: order || categories.length + 1,
      isActive: true,
      itemCount: 0
    };
    setCategories((prev) => [...prev, newCat]);
    showToast('دسته‌بندی جدید', `دسته‌بندی «${name}» با موفقیت افزوده شد.`);
  };

  const toggleCategoryStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const addTable = (id: number, capacity: number) => {
    setTables((prev) => {
      if (prev.some((t) => t.id === id)) {
        showToast('خطا', `میز شماره ${id} قبلاً تعریف شده است.`);
        return prev;
      }
      const newTable: TableItem = {
        id,
        capacity,
        status: 'available',
        section: 'سالن اصلی عمارت'
      };
      return [...prev, newTable].sort((a, b) => a.id - b.id);
    });
    showToast('ثبت میز جدید', `میز شماره ${id} با ظرفیت ${capacity} نفر ثبت گردید.`);
  };

  const deleteTable = (id: number) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
    showToast('حذف میز', `میز شماره ${id} از سالن حذف شد.`);
  };

  const saveWaiter = (waiterData: Partial<Waiter> & { name: string; code: string; pin: string }) => {
    setWaiters((prev) => {
      const existingIndex = prev.findIndex((w) => w.code === waiterData.code);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...waiterData
        };
        return updated;
      } else {
        const newWaiter: Waiter = {
          id: `w-${Date.now()}`,
          name: waiterData.name,
          code: waiterData.code,
          pin: waiterData.pin,
          shift: waiterData.shift || 'شیفت عصر (۱۶:۰۰ الی ۲۴:۰۰)',
          ordersCount: 0,
          totalSales: 0,
          todayOrders: 0,
          monthOrders: 0
        };
        return [newWaiter, ...prev];
      }
    });
    showToast('ثبت ویتر', `مشخصات ویتر ${waiterData.name} با موفقیت ذخیره شد.`);
  };

  const updateWaiterPin = (code: string, newPin: string) => {
    setWaiters((prev) =>
      prev.map((w) => (w.code === code ? { ...w, pin: newPin } : w))
    );
    const waiter = waiters.find((w) => w.code === code);
    showToast('تغییر پین', `پین ورود ${waiter ? waiter.name : 'پرسنل'} با موفقیت به ${newPin} تغییر یافت.`);
  };

  const deleteWaiter = (id: string) => {
    setWaiters((prev) => prev.filter((w) => w.id !== id));
    showToast('حذف پرسنل', 'کاربر مورد نظر از فهرست پرسنل حذف شد.');
  };

  const callWaiter = (tableNumber: number, tableName?: string) => {
    const existing = calls.find((c) => c.tableNumber === tableNumber && c.status === 'pending');
    if (existing) {
      showToast('پیام ثبت شده', `فراخوانی برای میز ${tableNumber} قبلاً ثبت شده و در جریان است.`);
      return;
    }

    const newCall: WaiterCall = {
      id: `call-${Date.now()}`,
      tableNumber,
      tableName: tableName || `میز ${tableNumber}`,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      minutesAgo: 0,
      type: 'call_waiter',
      status: 'pending'
    };

    setCalls((prev) => [newCall, ...prev]);

    // Update table status
    setTables((prev) =>
      prev.map((t) => (t.id === tableNumber ? { ...t, status: 'calling_waiter' } : t))
    );

    showToast('فراخوانی مهماندار', `درخواست حضور مهماندار برای میز ${tableNumber} به تبلت پرسنل ارسال گردید.`);
  };

  const acceptCall = (callId: string) => {
    setCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, status: 'accepted' } : c))
    );
    const call = calls.find((c) => c.id === callId);
    if (call) {
      setSelectedTableForOrder(call.tableNumber);
      setWaiterView('waiter_ordering');
      showToast('پذیرش فراخوان', `درخواست ${call.tableName} پذیرفته شد. در حال باز کردن فرم سفارش...`);
    }
  };

  const resolveCall = (callId: string) => {
    const call = calls.find((c) => c.id === callId);
    setCalls((prev) => prev.filter((c) => c.id !== callId));
    if (call) {
      setTables((prev) =>
        prev.map((t) => (t.id === call.tableNumber ? { ...t, status: 'occupied' } : t))
      );
      showToast('پایان خدمت', `درخواست ${call.tableName} به عنوان انجام‌شده ثبت شد.`);
    }
  };

  const createOrder = (orderData: Omit<Order, 'id'> & { id?: string }): Order => {
    const newId = orderData.id || `${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: newId
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update table status
    setTables((prev) =>
      prev.map((t) =>
        t.id === newOrder.tableNumber
          ? { ...t, status: 'in_preparation', activeReceiptId: newId }
          : t
      )
    );

    // Update waiter stats
    if (activeWaiter) {
      setWaiters((prev) =>
        prev.map((w) =>
          w.code === activeWaiter.code
            ? {
                ...w,
                ordersCount: w.ordersCount + 1,
                todayOrders: w.todayOrders + 1,
                totalSales: w.totalSales + newOrder.total
              }
            : w
        )
      );
    }

    // Auto resolve pending calls for this table
    setCalls((prev) => prev.filter((c) => c.tableNumber !== newOrder.tableNumber));

    showToast('ثبت موفق سفارش', `سفارش فیش #${newId} برای میز ${newOrder.tableNumber} ارسال شد.`);
    return newOrder;
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast('لغو سفارش', `سفارش #${orderId} با موفقیت لغو گردید.`);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    showToast('بروزرسانی وضعیت', `وضعیت فیش #${orderId} تغییر یافت.`);
  };

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        adminView,
        setAdminView,
        waiterView,
        setWaiterView,
        customerView,
        setCustomerView,
        products,
        categories,
        waiters,
        tables,
        orders,
        calls,
        selectedProductId,
        setSelectedProductId,
        selectedOrderId,
        setSelectedOrderId,
        selectedTableForOrder,
        setSelectedTableForOrder,
        activeWaiter,
        setActiveWaiter,
        categoryModalOpen,
        setCategoryModalOpen,
        waiterProfileModalOpen,
        setWaiterProfileModalOpen,
        orderConfirmModalOpen,
        setOrderConfirmModalOpen,
        quickInvoiceOrder,
        setQuickInvoiceOrder,
        callWaiterModalOpen,
        setCallWaiterModalOpen,
        toggleProductAvailability,
        saveProduct,
        deleteProduct,
        addCategory,
        toggleCategoryStatus,
        addTable,
        deleteTable,
        saveWaiter,
        updateWaiterPin,
        deleteWaiter,
        callWaiter,
        acceptCall,
        resolveCall,
        createOrder,
        cancelOrder,
        updateOrderStatus,
        customerCart,
        updateCustomerCart,
        clearCustomerCart,
        toast,
        showToast,
        toPersianDigits,
        formatPrice
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
