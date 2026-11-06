import type { Order, OrderItem, TableItem, Waiter, WaiterCall } from '../../types';

/** ارقام فارسی/عربی را به لاتین تبدیل می‌کند (کد پرسنلی و پین). */
export function normalizeDigits(input: string): string {
  return (input ?? '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

export function mapOrderStatus(
  status: string
): Order['status'] {
  switch (status) {
    case 'sent_to_admin':
      return 'pending';
    case 'in_preparation':
      return 'in_preparation';
    case 'ready':
      return 'in_preparation';
    case 'delivered':
      return 'delivered';
    case 'paid':
      return 'paid';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
}

export function mapTableStatus(status: string): TableItem['status'] {
  switch (status) {
    case 'free':
      return 'available';
    case 'calling':
    case 'bill_requested':
      return 'calling_waiter';
    case 'active':
    default:
      return 'occupied';
  }
}

function minutesSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / 60000));
}

function timeFromIso(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function dateFromIso(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fa-IR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  } catch {
    return '';
  }
}

export interface DbOrderItem {
  order_id: string;
  name: string;
  unit_price: number;
  quantity: number;
  ingredients?: string | null;
  menu_item_id?: string | null;
}

export interface DbOrder {
  id: string;
  number: number;
  status: string;
  subtotal: number;
  tax: number;
  service_fee: number;
  total: number;
  note: string | null;
  created_at: string;
  table_id: string;
  waiter_id: string | null;
  payment_method?: string | null;
}

export function mapOrder(
  row: DbOrder,
  items: DbOrderItem[],
  tableNumber: number,
  waiterName: string,
  waiterCode: string
): Order {
  const orderItems: OrderItem[] = items.map((item) => ({
    productId: item.menu_item_id ?? '',
    name: item.name,
    price: item.unit_price,
    quantity: item.quantity,
    ingredients: item.ingredients ?? undefined,
  }));

  const status = mapOrderStatus(row.status);

  return {
    id: row.id,
    number: row.number,
    dbStatus: row.status,
    tableNumber,
    waiterName,
    waiterCode,
    status,
    time: timeFromIso(row.created_at),
    date: dateFromIso(row.created_at),
    createdAt: row.created_at,
    items: orderItems,
    subtotal: row.subtotal,
    tax: row.tax,
    serviceFee: row.service_fee,
    total: row.total,
    guestNote: row.note ?? undefined,
    paymentMethod: row.payment_method === 'online' ? 'online' : 'pos',
    isPaid: row.status === 'paid',
  };
}

export interface DbCall {
  id: string;
  table_number: number;
  type: string;
  status: string;
  created_at: string;
  note?: string | null;
  table_name?: string;
}

export function mapCall(row: DbCall): WaiterCall {
  const type: WaiterCall['type'] =
    row.type === 'bill'
      ? 'bill_request'
      : row.type === 'order'
      ? 'service_refill'
      : 'call_waiter';

  const status: WaiterCall['status'] =
    row.status === 'pending' ? 'pending' : row.status === 'seen' ? 'accepted' : 'resolved';

  return {
    id: row.id,
    tableNumber: row.table_number,
    tableName: row.table_name || `میز ${row.table_number}`,
    time: timeFromIso(row.created_at),
    minutesAgo: minutesSince(row.created_at),
    type,
    status,
    createdAt: row.created_at,
  };
}

export interface DbStaff {
  id: string;
  full_name: string;
  code: string;
  shift: string | null;
  is_active: boolean;
  role: string;
}

export function mapStaff(row: DbStaff, stats?: { orders: number; sales: number }): Waiter {
  return {
    id: row.id,
    name: row.full_name,
    code: row.code,
    pin: '',
    shift: row.shift || 'بدون شیفت',
    ordersCount: stats?.orders ?? 0,
    totalSales: stats?.sales ?? 0,
    todayOrders: 0,
    monthOrders: stats?.orders ?? 0,
  };
}

export interface DbTable {
  id: string;
  number: number;
  capacity: number;
  status: string;
  qr_token: string;
  is_active: boolean;
}

export function mapTable(row: DbTable): TableItem {
  return {
    id: row.number,
    dbId: row.id,
    capacity: row.capacity,
    status: mapTableStatus(row.status),
    qrToken: row.qr_token,
  };
}

export function mapBoardTable(row: DbTable, calls: WaiterCall[]): TableItem {
  const table = mapTable(row);
  if (calls.some((call) => call.tableNumber === row.number && call.status === 'pending')) {
    table.status = 'calling_waiter';
  }
  return table;
}
