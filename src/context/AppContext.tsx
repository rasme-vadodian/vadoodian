import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MenuItem, Waiter, Order, TableItem, WaiterCall, Category, WaiterSession, CustomerSession } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/initialData';
import {
  AdminSession,
  restoreAdminSession,
  signInAdmin,
  signOutAdmin,
  subscribeToAdminAuth,
} from '../shared/auth/admin';
import {
  createMenuItem,
  deleteMenuItem,
  fetchCatalog,
  insertCategory,
  setCategoryActive,
  setMenuItemAvailability,
  updateMenuItem,
} from '../shared/api/menu';
import {
  clearStoredCustomer,
  fetchCustomerState,
  requestGuestCall,
  resumeCustomerSession,
} from '../shared/api/customer';
import {
  acceptCall as acceptCallRpc,
  clearStoredWaiter,
  createWaiterOrder,
  fetchWaiterState,
  loginWaiter as loginWaiterRpc,
  logoutWaiter as logoutWaiterRpc,
  openTable,
  readStoredWaiter,
  resolveCall as resolveCallRpc,
  updateWaiterOrderStatus,
} from '../shared/api/waiter';
import {
  addTable as addTableRpc,
  createAdminCall,
  deactivateWaiter,
  deleteTable as deleteTableRpc,
  fetchAdminBoard,
  setWaiterPin,
  updateAdminOrderStatus,
  upsertWaiter,
} from '../shared/api/admin';
import { mapCall, mapOrder, mapOrderStatus } from '../shared/api/mappers';
import { notifyBoard, subscribeToBoard } from '../shared/realtime/board';
import {
  parseRoute,
  pushPath,
  replacePath,
  Route,
  routePath,
  tableQrUrl,
} from '../shared/router';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** شناسه‌های ساخته‌شده در UI (مثل p-123) در دیتابیس وجود ندارند. */
const isDatabaseId = (value: string) => UUID_PATTERN.test(value);

export type AppMode = 'home' | 'admin' | 'waiter' | 'customer';

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

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  navigate: (path: string) => void;

  adminView: AdminView;
  setAdminView: (view: AdminView) => void;
  waiterView: WaiterView;
  setWaiterView: (view: WaiterView) => void;
  customerView: CustomerView;
  setCustomerView: (view: CustomerView) => void;

  // Admin auth
  adminSession: AdminSession | null;
  adminAuthLoading: boolean;
  loginAdmin: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logoutAdmin: () => Promise<void>;

  // Waiter auth
  waiterSession: WaiterSession | null;
  waiterAuthLoading: boolean;
  loginWaiter: (code: string, pin: string) => Promise<{ ok: boolean; message?: string }>;
  logoutWaiter: () => Promise<void>;
  waiterStats: { todayOrders: number; monthOrders: number; totalSales: number };
  activeWaiter: Waiter | null;

  // Customer session (QR)
  customerSession: CustomerSession | null;
  customerLoading: boolean;
  customerError: string | null;
  customerCall: WaiterCall | null;
  retryCustomerSession: () => void;

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
  openOrder: (orderId: string) => void;
  openProduct: (productId: string) => void;

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

  createOrder: (order: Omit<Order, 'id'> & { id?: string }) => Promise<Order | null>;
  cancelOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status'] | 'ready') => void;

  refreshData: () => void;
  tableQrUrl: (qrToken: string) => string;

  // Toast
  toast: { title: string; message: string } | null;
  showToast: (title: string, message: string) => void;

  // Utils
  toPersianDigits: (n: number | string) => string;
  formatPrice: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_ROUTE = parseRoute(window.location.pathname);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<Route>(INITIAL_ROUTE);
  const [mode, setModeState] = useState<AppMode>('home');

  // ادمین
  const [adminView, setAdminViewRaw] = useState<AdminView>('admin_login');
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState(true);

  // ویتر
  const [waiterView, setWaiterViewRaw] = useState<WaiterView>('waiter_login');
  const [waiterSession, setWaiterSession] = useState<WaiterSession | null>(() =>
    readStoredWaiter()
  );
  const [waiterAuthLoading, setWaiterAuthLoading] = useState(true);
  const [waiterStats, setWaiterStats] = useState({
    todayOrders: 0,
    monthOrders: 0,
    totalSales: 0,
  });

  // مشتری
  const [customerView, setCustomerView] = useState<CustomerView>('customer_menu');
  const [customerSession, setCustomerSession] = useState<CustomerSession | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [customerCall, setCustomerCall] = useState<WaiterCall | null>(null);
  const [customerQrToken, setCustomerQrToken] = useState<string | null>(null);

  // داده‌های مشترک
  const [products, setProducts] = useState<MenuItem[]>(() => INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(() => INITIAL_CATEGORIES);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [calls, setCalls] = useState<WaiterCall[]>([]);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<number>(4);

  // Modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [waiterProfileModalOpen, setWaiterProfileModalOpen] = useState(false);
  const [orderConfirmModalOpen, setOrderConfirmModalOpen] = useState(false);
  const [quickInvoiceOrder, setQuickInvoiceOrder] = useState<Order | null>(null);
  const [callWaiterModalOpen, setCallWaiterModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const showToast = useCallback((title: string, message: string) => {
    setToast({ title, message });
    window.setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const customerQrRef = useRef<string | null>(null);

  // ---------- منو: خواندن از دیتابیس ----------
  const refreshCatalog = useCallback(async () => {
    try {
      const catalog = await fetchCatalog();
      setProducts(catalog.products);
      setCategories(catalog.categories);
    } catch (error) {
      console.warn(
        'بارگذاری منو از دیتابیس ناموفق بود؛ داده محلی استفاده می‌شود.',
        error
      );
    }
  }, []);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  // ---------- احراز هویت ادمین (Supabase Auth) ----------
  useEffect(() => {
    let active = true;

    restoreAdminSession()
      .then((session) => {
        if (!active) return;
        setAdminSession(session);
        setAdminViewRaw(session ? 'live_tables' : 'admin_login');
      })
      .catch(() => {
        if (!active) return;
        setAdminSession(null);
        setAdminViewRaw('admin_login');
      })
      .finally(() => {
        if (active) setAdminAuthLoading(false);
      });

    const unsubscribe = subscribeToAdminAuth((event) => {
      if (event === 'SIGNED_OUT' && active) {
        setAdminSession(null);
        setAdminViewRaw('admin_login');
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // ---------- اعتبارسنجی نشست ذخیره‌شده ویتر ----------
  useEffect(() => {
    const stored = readStoredWaiter();
    if (!stored) {
      setWaiterAuthLoading(false);
      return;
    }

    let active = true;
    fetchWaiterState(stored.token)
      .then((state) => {
        if (!active) return;
        if (!state.ok) {
          clearStoredWaiter();
          setWaiterSession(null);
          return;
        }
        setWaiterSession((prev) => prev ?? stored);
        if (state.calls) setCalls(state.calls);
        if (state.orders) setOrders(state.orders);
        if (state.tables) setTables(state.tables);
        if (state.stats) setWaiterStats(state.stats);
      })
      .catch(() => {
        if (active) setWaiterSession(null);
      })
      .finally(() => {
        if (active) setWaiterAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // ---------- خواندن داده‌های ادمین ----------
  const refreshAdminData = useCallback(async () => {
    if (!adminSession) return;
    try {
      const board = await fetchAdminBoard();
      setOrders(board.orders);
      setTables(board.tables);
      setCalls(board.calls);
      setWaiters(board.staff);
    } catch (error) {
      console.warn('بارگذاری داده‌های پنل مدیریت ناموفق بود.', error);
    }
  }, [adminSession]);

  // ---------- خواندن داده‌های ویتر ----------
  const refreshWaiterData = useCallback(
    async (tokenOverride?: string) => {
      const token = tokenOverride ?? waiterSession?.token;
      if (!token) return;
      try {
        const state = await fetchWaiterState(token);
        if (!state.ok) {
          clearStoredWaiter();
          setWaiterSession(null);
          setWaiterViewRaw('waiter_login');
          replacePath('/waiter/login');
          setRoute({ name: 'waiter-login' });
          showToast('نشست پایان یافت', 'لطفاً دوباره با کد و پین وارد شوید.');
          return;
        }
        if (state.staff) {
          setWaiterSession((prev) =>
            prev
              ? { ...prev, staff: state.staff ?? prev.staff }
              : prev
          );
        }
        setCalls(state.calls ?? []);
        setOrders(state.orders ?? []);
        setTables(state.tables ?? []);
        setWaiterStats(
          state.stats ?? { todayOrders: 0, monthOrders: 0, totalSales: 0 }
        );
      } catch (error) {
        console.warn('بارگذاری داده‌های ویتر ناموفق بود.', error);
      }
    },
    [waiterSession?.token, showToast]
  );

  // ---------- خواندن وضعیت مشتری ----------
  const refreshCustomerData = useCallback(
    async (sessionOverride?: CustomerSession | null) => {
      const session = sessionOverride ?? customerSession;
      if (!session) return;
      try {
        const state = await fetchCustomerState(session.token);
        if (!state?.ok) {
          setCustomerSession(null);
          clearStoredCustomer();
          setCustomerCall(null);
          setCustomerError(
            state?.message || 'نشست این میز بسته شده است. لطفاً QR میز را دوباره اسکن کنید.'
          );
          return;
        }

        setCustomerError(null);
        if (state.table) {
          setCustomerSession((prev) =>
            prev
              ? {
                  ...prev,
                  tableNumber: state.table!.number,
                  tableCapacity: state.table!.capacity,
                  tableName: state.table!.name,
                }
              : prev
          );
        }

        if (state.call) {
          const call = mapCall({
            id: state.call.id,
            table_number: session.tableNumber,
            table_name: session.tableName,
            type: state.call.type,
            status: state.call.status,
            created_at: state.call.createdAt,
          });
          setCustomerCall(call);
        } else {
          setCustomerCall(null);
        }
      } catch (error) {
        setCustomerError(
          error instanceof Error ? error.message : 'ارتباط با سرور برقرار نشد.'
        );
      }
    },
    [customerSession]
  );

  // ---------- باز کردن نشست مشتری ----------
  const openCustomer = useCallback(
    async (qrToken: string) => {
      setCustomerLoading(true);
      setCustomerError(null);
      try {
        const session = await resumeCustomerSession(qrToken);
        setCustomerSession(session);
        await refreshCustomerData(session);
      } catch (error) {
        setCustomerSession(null);
        setCustomerError(
          error instanceof Error ? error.message : 'QR این میز معتبر نیست.'
        );
      } finally {
        setCustomerLoading(false);
      }
    },
    [refreshCustomerData]
  );

  // ---------- همگام‌سازی URL با نقش/نما ----------
  const applyRoute = useCallback(
    (nextRoute: Route) => {
      setRoute(nextRoute);
      replacePath(routePath(nextRoute));
    },
    []
  );

  const navigate = useCallback((path: string) => {
    pushPath(path);
    setRoute(parseRoute(path));
  }, []);

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // مسیر → نقش و نمای درست
  useEffect(() => {
    switch (route.name) {
      case 'home':
        setModeState('home');
        break;

      case 'customer':
        setModeState('customer');
        break;

      case 'waiter-login':
        setModeState('waiter');
        if (waiterSession) {
          replacePath('/waiter');
          setRoute({ name: 'waiter-workspace' });
        } else {
          setWaiterViewRaw('waiter_login');
        }
        break;

      case 'waiter-workspace':
        setModeState('waiter');
        if (!waiterAuthLoading && !waiterSession) {
          replacePath('/waiter/login');
          setRoute({ name: 'waiter-login' });
        } else {
          setWaiterViewRaw('waiter_workspace');
        }
        break;

      case 'waiter-order':
        setModeState('waiter');
        if (!waiterAuthLoading && !waiterSession) {
          replacePath('/waiter/login');
          setRoute({ name: 'waiter-login' });
        } else {
          setSelectedTableForOrder(route.tableNumber);
          setWaiterViewRaw('waiter_ordering');
        }
        break;

      case 'admin-login':
        setModeState('admin');
        setAdminViewRaw('admin_login');
        break;

      case 'admin-live':
      case 'admin-orders':
      case 'admin-order':
      case 'admin-menu':
      case 'admin-product':
      case 'admin-staff': {
        setModeState('admin');
        if (adminAuthLoading) break;
        if (!adminSession) {
          replacePath('/admin/login');
          setRoute({ name: 'admin-login' });
          break;
        }
        if (route.name === 'admin-live') setAdminViewRaw('live_tables');
        if (route.name === 'admin-orders') setAdminViewRaw('orders_list');
        if (route.name === 'admin-order') {
          setSelectedOrderId(route.orderId);
          setAdminViewRaw('order_detail');
        }
        if (route.name === 'admin-menu') setAdminViewRaw('menu_management');
        if (route.name === 'admin-product') {
          setSelectedProductId(route.productId === 'new' ? '' : route.productId);
          setAdminViewRaw('product_edit');
        }
        if (route.name === 'admin-staff') setAdminViewRaw('staff_performance');
        break;
      }

      default:
        break;
    }
  }, [route, adminAuthLoading, adminSession, waiterAuthLoading, waiterSession]);

  // باز کردن نشست مشتری فقط یک بار برای هر توکن QR
  useEffect(() => {
    if (route.name !== 'customer') return;
    setCustomerQrToken(route.qrToken);
    if (customerQrRef.current === route.qrToken) return;
    customerQrRef.current = route.qrToken;
    void openCustomer(route.qrToken);
  }, [route, openCustomer]);

  // وقتی ادمین وارد شد، داده‌هایش را بگیر
  useEffect(() => {
    if (!adminSession) return;
    void refreshAdminData();
  }, [adminSession, refreshAdminData]);

  // ---------- آمار زنده: Polling + Broadcast ----------
  const refreshCurrent = useCallback(() => {
    if (mode === 'admin') void refreshAdminData();
    else if (mode === 'waiter') void refreshWaiterData();
    else if (mode === 'customer') void refreshCustomerData();
  }, [mode, refreshAdminData, refreshWaiterData, refreshCustomerData]);

  const refreshCurrentRef = useRef(refreshCurrent);
  refreshCurrentRef.current = refreshCurrent;

  useEffect(() => {
    if (mode === 'admin' && adminSession) {
      const id = window.setInterval(() => refreshCurrentRef.current(), 3000);
      return () => window.clearInterval(id);
    }
    if (mode === 'waiter' && waiterSession) {
      const id = window.setInterval(() => refreshCurrentRef.current(), 2500);
      return () => window.clearInterval(id);
    }
    if (mode === 'customer' && customerSession) {
      const id = window.setInterval(() => refreshCurrentRef.current(), 2500);
      return () => window.clearInterval(id);
    }
    return undefined;
  }, [mode, adminSession, waiterSession, customerSession]);

  useEffect(() => {
    return subscribeToBoard(() => refreshCurrentRef.current());
  }, []);

  // ---------- ادمین ----------
  const setAdminView = (view: AdminView) => {
    if (!adminSession && view !== 'admin_login') {
      showToast('دسترسی محدود', 'برای ورود به پنل مدیریت ابتدا با حساب ادمین وارد شوید.');
      navigate('/admin/login');
      return;
    }

    if (view === 'admin_login') {
      navigate('/admin/login');
      return;
    }

    if (!adminSession) return;

    setAdminViewRaw(view);
    switch (view) {
      case 'live_tables':
        navigate('/admin');
        break;
      case 'orders_list':
        navigate('/admin/orders');
        break;
      case 'order_detail':
        navigate(
          `/admin/orders/${selectedOrderId || 'latest'}`
        );
        break;
      case 'menu_management':
        navigate('/admin/menu');
        break;
      case 'product_edit':
        navigate(`/admin/menu/${selectedProductId || 'new'}`);
        break;
      case 'staff_performance':
        navigate('/admin/staff');
        break;
      default:
        break;
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    const { session, error } = await signInAdmin(email, password);
    if (!session) return { ok: false, message: error ?? 'ورود ناموفق بود.' };

    setAdminSession(session);
    setAdminViewRaw('live_tables');
    await refreshCatalog();
    navigate('/admin');
    return { ok: true };
  };

  const logoutAdmin = async () => {
    await signOutAdmin();
    setAdminSession(null);
    setAdminViewRaw('admin_login');
    setOrders([]);
    setCalls([]);
    setTables([]);
    setWaiters([]);
    await refreshCatalog();
    navigate('/admin/login');
  };

  // ---------- ویتر ----------
  const setWaiterView = (view: WaiterView) => {
    if (!waiterSession && view !== 'waiter_login') {
      showToast('دسترسی محدود', 'برای ورود به تبلت مهماندار ابتدا کد و پین را وارد کنید.');
      navigate('/waiter/login');
      return;
    }

    setWaiterViewRaw(view);
    if (view === 'waiter_login') {
      navigate('/waiter/login');
    } else if (view === 'waiter_ordering') {
      navigate(`/waiter/order/${selectedTableForOrder}`);
    } else {
      navigate('/waiter');
    }
  };

  const loginWaiter = async (code: string, pin: string) => {
    const result = await loginWaiterRpc(code, pin);
    if (!result.ok || !result.session) {
      return { ok: false, message: result.message ?? 'ورود ناموفق بود.' };
    }

    setWaiterSession(result.session);
    setWaiterAuthLoading(false);
    setWaiterViewRaw('waiter_workspace');
    customerQrRef.current = null;
    navigate('/waiter');
    await refreshWaiterData(result.session.token);
    notifyBoard();
    return { ok: true };
  };

  const logoutWaiter = async () => {
    const token = waiterSession?.token;
    setWaiterSession(null);
    clearStoredWaiter();
    setOrders([]);
    setCalls([]);
    setTables([]);
    setWaiterStats({ todayOrders: 0, monthOrders: 0, totalSales: 0 });
    setWaiterViewRaw('waiter_login');
    if (token) await logoutWaiterRpc(token);
    navigate('/waiter/login');
  };

  // ---------- کارهای عمومی ----------
  const setMode = (next: AppMode) => {
    if (next === 'home') navigate('/');
    else if (next === 'admin') navigate(adminSession ? '/admin' : '/admin/login');
    else if (next === 'waiter') navigate(waiterSession ? '/waiter' : '/waiter/login');
    else if (next === 'customer') {
      navigate(customerQrToken ? `/t/${customerQrToken}` : '/');
    }
  };

  const openOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    if (!adminSession) return;
    setAdminViewRaw('order_detail');
    navigate(`/admin/orders/${orderId}`);
  };

  const openProduct = (productId: string) => {
    setSelectedProductId(productId);
    if (!adminSession) return;
    setAdminViewRaw('product_edit');
    navigate(`/admin/menu/${productId || 'new'}`);
  };

  const retryCustomerSession = () => {
    if (!customerQrToken) return;
    customerQrRef.current = null;
    void openCustomer(customerQrToken);
  };

  const toPersianDigits = (n: number | string): string => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n.toString().replace(/\d/g, (x) => persianDigits[parseInt(x, 10)]);
  };

  const formatPrice = (amount: number): string => {
    return toPersianDigits(amount.toLocaleString('en-US'));
  };

  const refreshData = () => {
    refreshCurrentRef.current();
  };

  // ---------- منو ----------
  const toggleProductAvailability = (id: string) => {
    const current = products.find((item) => item.id === id);
    if (!current) return;
    const nextValue = !current.isAvailable;

    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: nextValue } : item
      )
    );

    if (!isDatabaseId(id)) return;

    void setMenuItemAvailability(id, nextValue)
      .then(() => {
        refreshCatalog();
        notifyBoard();
      })
      .catch(async () => {
        showToast('خطا در ذخیره', 'تغییر موجودی محصول ذخیره نشد. دوباره تلاش کنید.');
        await refreshCatalog();
      });
  };

  const saveProduct = (product: MenuItem) => {
    const exists = products.some((p) => p.id === product.id);

    setProducts((prev) => {
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });

    showToast('ذخیره شد', `محصول ${product.name} با موفقیت در منو بروزرسانی گردید.`);

    const request = exists ? updateMenuItem(product) : createMenuItem(product);

    void request
      .then(() => {
        refreshCatalog();
        notifyBoard();
      })
      .catch(async () => {
        showToast(
          'خطا در ذخیره',
          'ذخیره محصول در دیتابیس ناموفق بود. اتصال یا دسترسی ادمین را بررسی کنید.'
        );
        await refreshCatalog();
      });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('حذف محصول', 'محصول انتخاب شده از منو حذف شد.');

    if (!isDatabaseId(id)) return;

    void deleteMenuItem(id)
      .then(() => {
        refreshCatalog();
        notifyBoard();
      })
      .catch(async () => {
        showToast('خطا در حذف', 'حذف محصول از دیتابیس ناموفق بود.');
        await refreshCatalog();
      });
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

    void insertCategory(newCat)
      .then(() => {
        refreshCatalog();
        notifyBoard();
      })
      .catch(async () => {
        showToast('خطا در ذخیره', 'ثبت دسته‌بندی در دیتابیس ناموفق بود.');
        await refreshCatalog();
      });
  };

  const toggleCategoryStatus = (id: string) => {
    const current = categories.find((c) => c.id === id);
    if (!current) return;
    const nextValue = !current.isActive;

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: nextValue } : c))
    );

    void setCategoryActive(id, nextValue)
      .then(() => {
        refreshCatalog();
        notifyBoard();
      })
      .catch(async () => {
        showToast('خطا در ذخیره', 'تغییر وضعیت دسته‌بندی ذخیره نشد.');
        await refreshCatalog();
      });
  };

  // ---------- میزها ----------
  const addTable = (id: number, capacity: number) => {
    if (!adminSession) return;
    void addTableRpc(id, capacity)
      .then((qrToken) => {
        showToast(
          'ثبت میز جدید',
          `میز ${id} ثبت شد؛ لینک QR آن آماده است. ${qrToken ? 'در بخش میزها قابل کپی است.' : ''}`
        );
        void refreshAdminData();
        notifyBoard();
      })
      .catch((error: unknown) => {
        showToast('خطا', error instanceof Error ? error.message : 'ثبت میز ناموفق بود.');
      });
  };

  const deleteTable = (id: number) => {
    if (!adminSession) return;
    void deleteTableRpc(id)
      .then(() => {
        showToast('حذف میز', `میز ${id} از سالن حذف شد.`);
        void refreshAdminData();
        notifyBoard();
      })
      .catch((error: unknown) => {
        showToast('خطا', error instanceof Error ? error.message : 'حذف میز ناموفق بود.');
      });
  };

  // ---------- پرسنل ----------
  const saveWaiter = (waiterData: Partial<Waiter> & { name: string; code: string; pin: string }) => {
    if (!adminSession) return;
    const existing = waiterData.id
      ? waiters.find((w) => w.id === waiterData.id)
      : waiters.find((w) => w.code === waiterData.code);

    void upsertWaiter({
      id: existing?.id,
      name: waiterData.name,
      code: waiterData.code,
      pin: waiterData.pin,
      shift: waiterData.shift || 'شیفت عصر (۱۶:۰۰ الی ۲۴:۰۰)',
    })
      .then(() => {
        showToast('ثبت ویتر', `مشخصات ویتر ${waiterData.name} با موفقیت ذخیره شد.`);
        void refreshAdminData();
      })
      .catch((error: unknown) => {
        showToast('خطا', error instanceof Error ? error.message : 'ذخیره ویتر ناموفق بود.');
      });
  };

  const updateWaiterPin = (code: string, newPin: string) => {
    if (!adminSession) return;
    const waiter = waiters.find((w) => w.code === code);
    if (!waiter) {
      showToast('خطا', 'ویتر پیدا نشد. صفحه را تازه کنید.');
      return;
    }

    void setWaiterPin(waiter.id, newPin)
      .then(() => {
        showToast('تغییر پین', `پین ورود ${waiter.name} با موفقیت تغییر یافت.`);
        void refreshAdminData();
      })
      .catch((error: unknown) => {
        showToast('خطا', error instanceof Error ? error.message : 'تغییر پین ناموفق بود.');
      });
  };

  const deleteWaiter = (id: string) => {
    if (!adminSession) return;
    void deactivateWaiter(id)
      .then(() => {
        showToast('حذف پرسنل', 'کاربر مورد نظر غیرفعال و از فهرست پرسنل حذف شد.');
        void refreshAdminData();
      })
      .catch((error: unknown) => {
        showToast('خطا', error instanceof Error ? error.message : 'حذف ویتر ناموفق بود.');
      });
  };

  // ---------- فراخوان ----------
  const callWaiter = (tableNumber: number, tableName?: string) => {
    if (customerSession) {
      void requestGuestCall(customerSession.token, 'call_waiter')
        .then((result) => {
          if (!result?.ok) {
            showToast('خطا', result?.message || 'ثبت فراخوان ناموفق بود.');
            return;
          }
          setCallWaiterModalOpen(true);
          showToast(
            'فراخوانی مهماندار',
            result.already
              ? 'درخواست شما از قبل ثبت شده و در حال بررسی است.'
              : `درخواست میز ${customerSession.tableNumber} به تبلت مهماندار ارسال شد.`
          );
          notifyBoard();
          void refreshCustomerData();
        })
        .catch((error: unknown) => {
          showToast('خطا', error instanceof Error ? error.message : 'ثبت فراخوان ناموفق بود.');
        });
      return;
    }

    if (adminSession) {
      void createAdminCall(tableNumber, 'call_waiter')
        .then(() => {
          showToast('فراخوان ارسال شد', `درخواست حضور مهماندار برای میز ${tableNumber} ثبت شد.`);
          notifyBoard();
          void refreshAdminData();
        })
        .catch((error: unknown) => {
          showToast('خطا', error instanceof Error ? error.message : 'ارسال فراخوان ناموفق بود.');
        });
      return;
    }

    showToast(
      'اسکن QR لازم است',
      tableName
        ? `برای فراخوان از ${tableName}، لطفاً QR روی میز را اسکن کنید.`
        : 'برای فراخوانی مهماندار، QR روی میز را اسکن کنید.'
    );
  };

  const acceptCall = (callId: string) => {
    if (!waiterSession) {
      showToast('دسترسی محدود', 'این عملیات فقط برای مهماندار مجاز است.');
      return;
    }

    const call = calls.find((item) => item.id === callId);
    void acceptCallRpc(waiterSession.token, callId)
      .then(() => {
        if (call) {
          setSelectedTableForOrder(call.tableNumber);
          showToast('پذیرش فراخوان', `درخواست میز ${call.tableNumber} پذیرفته شد.`);
          navigate(`/waiter/order/${call.tableNumber}`);
        }
        notifyBoard();
        void refreshWaiterData();
      })
      .catch((error: unknown) => {
        showToast('خطا', error instanceof Error ? error.message : 'پذیرش فراخوان ناموفق بود.');
      });
  };

  const resolveCall = (callId: string) => {
    if (!waiterSession) {
      showToast('دسترسی محدود', 'این عملیات فقط برای مهماندار مجاز است.');
      return;
    }

    const call = calls.find((item) => item.id === callId);
    void resolveCallRpc(waiterSession.token, callId)
      .then(() => {
        if (call) {
          showToast('پایان خدمت', `درخواست میز ${call.tableNumber} انجام‌شده ثبت شد.`);
        }
        notifyBoard();
        void refreshWaiterData();
      })
      .catch((error: unknown) => {
        showToast('خطا', error instanceof Error ? error.message : 'ثبت پاسخ ناموفق بود.');
      });
  };

  // ---------- سفارش ----------
  const createOrder = async (
    orderData: Omit<Order, 'id'> & { id?: string }
  ): Promise<Order | null> => {
    if (!waiterSession) {
      showToast('دسترسی محدود', 'ثبت سفارش فقط از تبلت مهماندار انجام می‌شود.');
      return null;
    }

    const items = orderData.items
      .filter((item) => item.quantity > 0 && isDatabaseId(item.productId))
      .map((item) => ({ menuItemId: item.productId, quantity: item.quantity }));

    if (items.length === 0) {
      showToast('سبد خالی', 'حداقل یک قلم از منو را انتخاب کنید.');
      return null;
    }

    try {
      const result = await createWaiterOrder(waiterSession.token, {
        tableNumber: orderData.tableNumber,
        items,
        note: orderData.guestNote,
      });

      if (!result.ok || !result.orderId) {
        showToast('ثبت سفارش ناموفق', result.message || 'سفارش ذخیره نشد.');
        return null;
      }

      // برای اطمینان از قیمت و وضعیت نهایی، از سرور دوباره می‌خوانیم.
      await refreshWaiterData();

      showToast(
        'سفارش ثبت شد',
        `فیش #${result.number ?? ''} برای میز ${orderData.tableNumber} به پنل مدیریت ارسال شد.`
      );
      notifyBoard();

      return {
        ...orderData,
        id: result.orderId,
        number: result.number,
        status: 'pending',
        total: result.total ?? orderData.total,
        isPaid: false,
      };
    } catch (error) {
      showToast(
        'ثبت سفارش ناموفق',
        error instanceof Error ? error.message : 'ارتباط با سرور برقرار نشد.'
      );
      return null;
    }
  };

  const applyOrderStatus = (orderId: string, dbStatus: string) => {
    if (adminSession) {
      void updateAdminOrderStatus(orderId, dbStatus)
        .then(() => {
          showToast('بروزرسانی وضعیت', 'وضعیت فیش در دیتابیس ذخیره شد.');
          notifyBoard();
          void refreshAdminData();
        })
        .catch((error: unknown) => {
          showToast('خطا', error instanceof Error ? error.message : 'تغییر وضعیت ناموفق بود.');
        });
      return;
    }

    if (waiterSession) {
      void updateWaiterOrderStatus(waiterSession.token, orderId, dbStatus)
        .then(() => {
          showToast('بروزرسانی وضعیت', 'وضعیت فیش ذخیره شد.');
          notifyBoard();
          void refreshWaiterData();
        })
        .catch((error: unknown) => {
          showToast('خطا', error instanceof Error ? error.message : 'تغییر وضعیت ناموفق بود.');
        });
      return;
    }

    showToast('دسترسی محدود', 'برای تغییر وضعیت سفارش وارد پنل مدیریت شوید.');
  };

  const updateOrderStatus = (orderId: string, status: Order['status'] | 'ready') => {
    if (status === 'pending') return;
    applyOrderStatus(orderId, status);
  };

  const cancelOrder = (orderId: string) => {
    applyOrderStatus(orderId, 'cancelled');
  };

  // ---------- مشتق‌ها ----------
  const pendingCalls = useMemo(
    () => calls.filter((call) => call.status === 'pending'),
    [calls]
  );

  const activeWaiter = useMemo<Waiter | null>(() => {
    if (!waiterSession) return null;
    return {
      id: waiterSession.staff.id,
      name: waiterSession.staff.name,
      code: waiterSession.staff.code,
      pin: '',
      shift: waiterSession.staff.shift,
      ordersCount: waiterStats.monthOrders,
      totalSales: waiterStats.totalSales,
      todayOrders: waiterStats.todayOrders,
      monthOrders: waiterStats.monthOrders,
    };
  }, [waiterSession, waiterStats]);

  // این متغیر برای نمایش شمارنده در محیط توسعه/پنل نگه داشته شده است.
  void pendingCalls;

  const value: AppContextType = {
    mode,
    setMode,
    navigate,
    adminView,
    setAdminView,
    waiterView,
    setWaiterView,
    customerView,
    setCustomerView,
    adminSession,
    adminAuthLoading,
    loginAdmin,
    logoutAdmin,
    waiterSession,
    waiterAuthLoading,
    loginWaiter,
    logoutWaiter,
    waiterStats,
    activeWaiter,
    customerSession,
    customerLoading,
    customerError,
    customerCall,
    retryCustomerSession,
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
    openOrder,
    openProduct,
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
    refreshData,
    tableQrUrl,
    toast,
    showToast,
    toPersianDigits,
    formatPrice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
