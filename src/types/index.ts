export type CategoryId = 'hot' | 'cold' | 'snack' | 'dessert';

export interface MenuItem {
  id: string;
  name: string;
  code: string;
  category: CategoryId;
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
  pin: string;
  shift: string;
  ordersCount: number;
  totalSales: number;
  todayOrders: number;
  monthOrders: number;
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
  tableNumber: number;
  waiterName: string;
  waiterCode: string;
  status: 'pending' | 'in_preparation' | 'delivered' | 'paid';
  time: string;
  date: string;
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
  capacity: number;
  status: 'available' | 'occupied' | 'calling_waiter' | 'in_preparation';
  section: string;
  activeReceiptId?: string;
}

export interface WaiterCall {
  id: string;
  tableNumber: number;
  tableName: string;
  time: string;
  minutesAgo: number;
  type: 'call_waiter' | 'bill_request' | 'service_refill';
  status: 'pending' | 'accepted' | 'resolved';
}

export interface Category {
  id: CategoryId | string;
  name: string;
  icon: string;
  order: number;
  isActive: boolean;
  itemCount: number;
}
