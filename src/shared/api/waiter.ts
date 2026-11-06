import { supabase } from './supabase';
import type { Order, TableItem, WaiterCall, WaiterSession } from '../../types';
import { mapCall, mapOrder, mapStaff, mapTableStatus } from './mappers';

/**
 * لایه داده ویتر.
 *
 * ویترها کاربر Supabase Auth ندارند؛ ورود با کد + پین انجام می‌شود و
 * سرور یک توکن کوتاه‌عمر در staff_sessions صادر می‌کند.
 */

const STORAGE_KEY = 'vadoodian_waiter_session';

export interface WaiterLoginResult {
  ok: boolean;
  session?: WaiterSession;
  error?: string;
  message?: string;
}

export interface WaiterState {
  ok: boolean;
  staff?: { id: string; name: string; code: string; shift: string };
  tables?: TableItem[];
  calls?: WaiterCall[];
  orders?: Order[];
  stats?: { todayOrders: number; monthOrders: number; totalSales: number };
}

interface RawWaiterState {
  ok: boolean;
  staff?: { id: string; name: string; code: string; shift: string };
  tables?: Array<{
    id: number;
    dbId: string;
    number: number;
    capacity: number;
    status: string;
  }>;
  calls?: Array<{
    id: string;
    tableNumber: number;
    tableName: string;
    type: string;
    status: string;
    createdAt: string;
    note?: string | null;
  }>;
  orders?: Array<{
    id: string;
    number: number;
    status: string;
    subtotal: number;
    tax: number;
    serviceFee: number;
    total: number;
    note?: string | null;
    createdAt: string;
    tableNumber: number;
    waiterName: string;
    waiterCode: string;
    items: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      ingredients?: string | null;
    }>;
  }>;
  stats?: { todayOrders: number; monthOrders: number; totalSales: number };
}

export function readStoredWaiter(): WaiterSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WaiterSession;
    if (!parsed?.token || !parsed?.staff) return null;
    return parsed;
  } catch {
    return null;
  }
}

function storeWaiter(session: WaiterSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredWaiter(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function loginWaiter(code: string, pin: string): Promise<WaiterLoginResult> {
  const { data, error } = await supabase.rpc('waiter_login', {
    p_code: code,
    p_pin: pin,
  });

  if (error) {
    return { ok: false, error: 'network', message: 'ارتباط با سرور برقرار نشد. دوباره تلاش کنید.' };
  }

  const payload = data as {
    ok: boolean;
    token?: string;
    sessionId?: string;
    staff?: { id: string; name: string; code: string; shift: string };
    error?: string;
    message?: string;
  };

  if (!payload?.ok || !payload.token || !payload.staff) {
    return {
      ok: false,
      error: payload?.error ?? 'invalid',
      message: payload?.message ?? 'کد یا پین اشتباه است.',
    };
  }

  const session: WaiterSession = { token: payload.token, staff: payload.staff };
  storeWaiter(session);
  return { ok: true, session };
}

export async function logoutWaiter(token: string): Promise<void> {
  clearStoredWaiter();
  try {
    await supabase.rpc('waiter_logout', { p_token: token });
  } catch {
    // اگر شبکه قطع بود، نشست سمت سرور با انقضا بسته می‌شود.
  }
}

export async function fetchWaiterState(token: string): Promise<WaiterState> {
  const { data, error } = await supabase.rpc('waiter_state', { p_token: token });
  if (error) throw new Error(error.message);

  const raw = data as RawWaiterState;
  if (!raw?.ok) return { ok: false };

  const calls = (raw.calls ?? []).map((call) =>
    mapCall({
      id: call.id,
      table_number: call.tableNumber,
      table_name: call.tableName,
      type: call.type,
      status: call.status,
      created_at: call.createdAt,
      note: call.note,
    })
  );
  const tables: TableItem[] = (raw.tables ?? []).map((table) => ({
    id: table.number,
    dbId: table.dbId,
    capacity: table.capacity,
    status:
      calls.some((call) => call.tableNumber === table.number && call.status === 'pending')
        ? 'calling_waiter'
        : mapTableStatus(table.status),
  }));

  const orders = (raw.orders ?? []).map((order) =>
    mapOrder(
      {
        id: order.id,
        number: order.number,
        status: order.status,
        subtotal: order.subtotal,
        tax: order.tax,
        service_fee: order.serviceFee,
        total: order.total,
        note: order.note ?? null,
        created_at: order.createdAt,
        table_id: '',
        waiter_id: null,
      },
      order.items.map((item) => ({
        order_id: order.id,
        name: item.name,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        ingredients: item.ingredients,
      })),
      order.tableNumber,
      order.waiterName,
      order.waiterCode
    )
  );

  return {
    ok: true,
    staff: raw.staff,
    tables,
    calls,
    orders,
    stats: raw.stats,
  };
}

export async function acceptCall(token: string, callId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('waiter_accept_call', {
    p_token: token,
    p_call_id: callId,
  });
  if (error) throw new Error(error.message);
  return Boolean((data as { ok?: boolean })?.ok);
}

export async function resolveCall(token: string, callId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('waiter_resolve_call', {
    p_token: token,
    p_call_id: callId,
  });
  if (error) throw new Error(error.message);
  return Boolean((data as { ok?: boolean })?.ok);
}

export async function openTable(token: string, tableNumber: number): Promise<boolean> {
  const { data, error } = await supabase.rpc('waiter_open_table', {
    p_token: token,
    p_table_number: tableNumber,
  });
  if (error) throw new Error(error.message);
  const payload = data as { ok?: boolean; message?: string };
  if (!payload?.ok) throw new Error(payload?.message || 'باز کردن میز ناموفق بود.');
  return true;
}

export async function closeTable(token: string, tableNumber: number): Promise<boolean> {
  const { data, error } = await supabase.rpc('waiter_close_table', {
    p_token: token,
    p_table_number: tableNumber,
  });
  if (error) throw new Error(error.message);
  return Boolean((data as { ok?: boolean })?.ok);
}

export interface CreateOrderInput {
  tableNumber: number;
  items: Array<{ menuItemId: string; quantity: number }>;
  note?: string;
}

export async function createWaiterOrder(
  token: string,
  input: CreateOrderInput
): Promise<{ ok: boolean; orderId?: string; number?: number; total?: number; message?: string }> {
  const { data, error } = await supabase.rpc('waiter_create_order', {
    p_token: token,
    p_table_number: input.tableNumber,
    p_items: input.items,
    p_note: input.note?.trim() || null,
  });

  if (error) throw new Error(error.message);
  return data as {
    ok: boolean;
    orderId?: string;
    number?: number;
    total?: number;
    message?: string;
  };
}

export async function updateWaiterOrderStatus(
  token: string,
  orderId: string,
  status: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('waiter_update_order_status', {
    p_token: token,
    p_order_id: orderId,
    p_status: status,
  });
  if (error) throw new Error(error.message);
  const payload = data as { ok?: boolean; message?: string };
  if (!payload?.ok) throw new Error(payload?.message || 'تغییر وضعیت ناموفق بود.');
  return true;
}

/** فقط برای نمایش در پروفایل؛ آمار از خود waiter_state می‌آید. */
export function waiterStatsToWaiter(
  staff: { id: string; name: string; code: string; shift: string },
  stats?: { todayOrders: number; monthOrders: number; totalSales: number }
) {
  return mapStaff(
    {
      id: staff.id,
      full_name: staff.name,
      code: staff.code,
      shift: staff.shift,
      is_active: true,
      role: 'waiter',
    },
    { orders: stats?.monthOrders ?? 0, sales: stats?.totalSales ?? 0 }
  );
}
