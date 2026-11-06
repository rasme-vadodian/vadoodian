export type CategoryId = 'hot' | 'cold' | 'snack' | 'dessert';

export interface MenuItem {
  id: string;
  name: string;
  code: string;
  category: string;
  price: number;
  ingredients: string;
  story: string;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  showInQR: boolean;
}

export interface Waiter {
  id: string;
  name: string;
  code: string;
  /** فقط در داده‌های نمونه استفاده می‌شد؛ دیگر از دیتابیس خوانده نمی‌شود. */
  pin: string;
  shift: string;
  ordersCount: number;
  totalSales: number;
  todayOrders: number;
  monthOrders: number;
  isActive?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  ingredients?: string;
  image?: string;
}

export interface Order {
  id: string;
  /** شماره فیش قابل نمایش (از دیتابیس) */
  number?: number;
  /** وضعیت خام دیتابیس؛ برای جلوگیری از گم‌شدن معنی ready/cancelled */
  dbStatus?: string;
  tableNumber: number;
  waiterName: string;
  waiterCode: string;
  status: 'pending' | 'in_preparation' | 'delivered' | 'paid' | 'cancelled';
  time: string;
  date: string;
  createdAt?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceFee: number;
  total: number;
  guestNote?: string;
  paymentMethod: 'pos' | 'online';
  isPaid: boolean;
}

export interface TableItem {
  id: number;
  dbId?: string;
  capacity: number;
  status: 'available' | 'occupied' | 'calling_waiter' | 'in_preparation';
  activeReceiptId?: string;
  qrToken?: string;
}

export interface WaiterCall {
  id: string;
  tableNumber: number;
  tableName: string;
  time: string;
  minutesAgo: number;
  type: 'call_waiter' | 'bill_request' | 'service_refill';
  status: 'pending' | 'accepted' | 'resolved';
  createdAt?: string;
  note?: string;
}

export interface Category {
  id: CategoryId | string;
  name: string;
  icon: string;
  order: number;
  isActive: boolean;
  itemCount: number;
}

export interface WaiterSession {
  token: string;
  staff: {
    id: string;
    name: string;
    code: string;
    shift: string;
  };
}

export interface CustomerSession {
  token: string;
  sessionId: string;
  tableNumber: number;
  tableCapacity: number;
  tableName: string;
}
