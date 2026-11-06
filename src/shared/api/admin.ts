import { supabase } from './supabase';
import type { Order, TableItem, Waiter, WaiterCall } from '../../types';
import {
  mapBoardTable,
  mapCall,
  mapOrder,
  mapStaff,
  type DbCall,
  type DbOrder,
  type DbOrderItem,
  type DbStaff,
  type DbTable,
} from './mappers';

/**
 * لایه داده ادمین.
 *
 * ادمین با Supabase Auth وارد می‌شود و RLS فقط به کاربری که در public.staff
 * نقش admin فعال دارد اجازه خواندن/نوشتن می‌دهد. تغییر پین و ساخت میز از
 * RPCهای security definer انجام می‌شود تا هش bcrypt سمت سرور ساخته شود.
 */

export interface AdminBoard {
  orders: Order[];
  tables: TableItem[];
  calls: WaiterCall[];
  staff: Waiter[];
}

function monthStartIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export async function fetchAdminBoard(): Promise<AdminBoard> {
  const since = monthStartIso();

  const [ordersResult, itemsResult, staffResult, tablesResult, callsResult] =
    await Promise.all([
      supabase
        .from('orders')
        .select(
          'id,number,status,subtotal,tax,service_fee,total,note,created_at,table_id,waiter_id,payment_method'
        )
        .gte('created_at', since)
        .order('created_at', { ascending: false }),
      supabase
        .from('order_items')
        .select('order_id,name,unit_price,quantity,ingredients,menu_item_id'),
      supabase
        .from('staff')
        .select('id,full_name,code,shift,is_active,role')
        .order('full_name'),
      supabase
        .from('tables')
        .select('id,number,capacity,status,qr_token,is_active')
        .eq('is_active', true)
        .order('number'),
      supabase
        .from('guest_requests')
        .select('id,table_id,type,status,created_at,note')
        .in('status', ['pending', 'seen'])
        .order('created_at'),
    ]);

  const firstError =
    ordersResult.error ||
    itemsResult.error ||
    staffResult.error ||
    tablesResult.error ||
    callsResult.error;
  if (firstError) throw firstError;

  const ordersRows = (ordersResult.data ?? []) as unknown as DbOrder[];
  const itemRows = (itemsResult.data ?? []) as unknown as DbOrderItem[];
  const staffRows = (staffResult.data ?? []) as unknown as DbStaff[];
  const tableRows = (tablesResult.data ?? []) as unknown as DbTable[];
  const callRows = (callsResult.data ?? []) as unknown as DbCall[];

  const tableById = new Map(tableRows.map((table) => [table.id, table]));
  const staffById = new Map(staffRows.map((staff) => [staff.id, staff]));

  const itemsByOrder = new Map<string, DbOrderItem[]>();
  for (const item of itemRows) {
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  }

  const orders = ordersRows.map((row) => {
    const table = tableById.get(row.table_id);
    const staff = row.waiter_id ? staffById.get(row.waiter_id) : undefined;
    return mapOrder(
      row,
      itemsByOrder.get(row.id) ?? [],
      table?.number ?? 0,
      staff?.full_name ?? 'ثبت سیستم',
      staff?.code ?? '-'
    );
  });

  const callRowsWithNumber: DbCall[] = callRows.map((call) => {
    const tableId = (call as unknown as { table_id: string }).table_id;
    const table = tableById.get(tableId);
    return {
      ...call,
      table_number: table?.number ?? 0,
      table_name: table ? `میز ${table.number}` : 'میز نامشخص',
    };
  });

  const calls = callRowsWithNumber.map((call) => mapCall(call));

  const tables = tableRows.map((table) => mapBoardTable(table, calls));

  const statsByStaff = new Map<string, { orders: number; sales: number }>();
  for (const order of ordersRows) {
    if (!order.waiter_id) continue;
    if (order.status === 'cancelled') continue;
    const current = statsByStaff.get(order.waiter_id) ?? { orders: 0, sales: 0 };
    current.orders += 1;
    current.sales += order.total;
    statsByStaff.set(order.waiter_id, current);
  }

  const staff = staffRows
    .filter((row) => row.role === 'waiter')
    .map((row) => mapStaff(row, statsByStaff.get(row.id)));

  return { orders, tables, calls, staff };
}

export async function addTable(number: number, capacity: number): Promise<string> {
  const { data, error } = await supabase.rpc('admin_add_table', {
    p_number: number,
    p_capacity: capacity,
  });
  if (error) throw new Error(error.message);

  const payload = data as { ok?: boolean; message?: string; qrToken?: string };
  if (!payload?.ok) throw new Error(payload?.message || 'ثبت میز ناموفق بود.');
  return payload.qrToken ?? '';
}

export async function deleteTable(number: number): Promise<void> {
  const { data, error } = await supabase.rpc('admin_delete_table', {
    p_number: number,
  });
  if (error) throw new Error(error.message);
  const payload = data as { ok?: boolean; message?: string };
  if (!payload?.ok) throw new Error(payload?.message || 'حذف میز ناموفق بود.');
}

export async function createAdminCall(
  tableNumber: number,
  type: 'call_waiter' | 'order' | 'bill' = 'call_waiter'
): Promise<void> {
  const { data, error } = await supabase.rpc('admin_create_call', {
    p_table_number: tableNumber,
    p_type: type,
  });
  if (error) throw new Error(error.message);
  const payload = data as { ok?: boolean; message?: string };
  if (!payload?.ok) throw new Error(payload?.message || 'ارسال فراخوان ناموفق بود.');
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: string
): Promise<void> {
  const { data, error } = await supabase.rpc('admin_update_order_status', {
    p_order_id: orderId,
    p_status: status,
  });
  if (error) throw new Error(error.message);
  const payload = data as { ok?: boolean; message?: string };
  if (!payload?.ok) throw new Error(payload?.message || 'تغییر وضعیت ناموفق بود.');
}

export async function upsertWaiter(input: {
  id?: string;
  name: string;
  code: string;
  pin?: string;
  shift: string;
}): Promise<void> {
  const { data, error } = await supabase.rpc('admin_upsert_waiter', {
    p_id: input.id ?? null,
    p_name: input.name,
    p_code: input.code,
    p_pin: input.pin ?? '',
    p_shift: input.shift,
  });
  if (error) throw new Error(error.message);
  const payload = data as { ok?: boolean; message?: string };
  if (!payload?.ok) throw new Error(payload?.message || 'ذخیره ویتر ناموفق بود.');
}

export async function setWaiterPin(id: string, pin: string): Promise<void> {
  const { data, error } = await supabase.rpc('admin_set_waiter_pin', {
    p_id: id,
    p_pin: pin,
  });
  if (error) throw new Error(error.message);
  const payload = data as { ok?: boolean; message?: string };
  if (!payload?.ok) throw new Error(payload?.message || 'تغییر پین ناموفق بود.');
}

export async function deactivateWaiter(id: string): Promise<void> {
  const { data, error } = await supabase.rpc('admin_delete_waiter', {
    p_id: id,
  });
  if (error) throw new Error(error.message);
  const payload = data as { ok?: boolean; message?: string };
  if (!payload?.ok) throw new Error(payload?.message || 'حذف ویتر ناموفق بود.');
}
