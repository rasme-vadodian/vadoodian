import { supabase } from './supabase';
import type { CustomerSession } from '../../types';

/**
 * لایه داده مشتری.
 *
 * مشتری هیچ دسترسی مستقیمی به جدول‌ها ندارد. همه چیز از طریق RPC و با
 * توکنی که سرور برای همان نشست میز صادر می‌کند انجام می‌شود.
 */

const STORAGE_KEY = 'vadoodian_customer_session';

export interface CustomerState {
  ok: boolean;
  table?: {
    id: string;
    number: number;
    capacity: number;
    name: string;
    status: string;
  };
  call?: {
    id: string;
    type: string;
    status: string;
    createdAt: string;
    acceptedAt?: string | null;
  } | null;
  orders?: Array<{
    id: string;
    number: number;
    status: string;
    subtotal: number;
    serviceFee: number;
    total: number;
    createdAt: string;
    items: Array<{ name: string; quantity: number; unitPrice: number }>;
  }>;
  error?: string;
  message?: string;
}

interface StoredCustomer {
  qrToken: string;
  token: string;
  tableNumber: number;
  tableCapacity: number;
  tableName: string;
  sessionId: string;
}

function readStored(): StoredCustomer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCustomer;
    if (!parsed?.token || !parsed?.qrToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readStoredCustomer(qrToken?: string): StoredCustomer | null {
  const stored = readStored();
  if (!stored) return null;
  if (qrToken && stored.qrToken !== qrToken) return null;
  return stored;
}

export function clearStoredCustomer(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function store(session: CustomerSession, qrToken: string): StoredCustomer {
  const value: StoredCustomer = {
    qrToken,
    token: session.token,
    tableNumber: session.tableNumber,
    tableCapacity: session.tableCapacity,
    tableName: session.tableName,
    sessionId: session.sessionId,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  return value;
}

/** با اسکن QR میز، نشست باز موجود را برمی‌گرداند یا نشست تازه می‌سازد. */
export async function openCustomerSession(qrToken: string): Promise<CustomerSession> {
  const { data, error } = await supabase.rpc('customer_session', {
    p_qr_token: qrToken,
  });

  if (error) throw new Error(error.message);

  const payload = data as {
    ok: boolean;
    token?: string;
    sessionId?: string;
    table?: { id: string; number: number; capacity: number; name: string };
    message?: string;
  };

  if (!payload?.ok || !payload.token || !payload.table) {
    throw new Error(payload?.message || 'QR این میز معتبر نیست.');
  }

  const session: CustomerSession = {
    token: payload.token,
    sessionId: payload.sessionId ?? '',
    tableNumber: payload.table.number,
    tableCapacity: payload.table.capacity,
    tableName: payload.table.name,
  };

  store(session, qrToken);
  return session;
}

/** اگر نشست قبلی همان میز در حافظه باشد، بدون تماس دوباره استفاده می‌شود. */
export async function resumeCustomerSession(qrToken: string): Promise<CustomerSession> {
  const stored = readStoredCustomer(qrToken);
  if (stored) {
    return {
      token: stored.token,
      sessionId: stored.sessionId,
      tableNumber: stored.tableNumber,
      tableCapacity: stored.tableCapacity,
      tableName: stored.tableName,
    };
  }
  return openCustomerSession(qrToken);
}

export async function fetchCustomerState(token: string): Promise<CustomerState> {
  const { data, error } = await supabase.rpc('customer_state', {
    p_guest_token: token,
  });
  if (error) throw new Error(error.message);
  return data as CustomerState;
}

export async function requestGuestCall(
  token: string,
  type: 'call_waiter' | 'order' | 'bill' = 'call_waiter',
  note?: string
): Promise<{ ok: boolean; already?: boolean; message?: string }> {
  const { data, error } = await supabase.rpc('create_guest_call', {
    p_guest_token: token,
    p_type: type,
    p_note: note ?? null,
  });
  if (error) throw new Error(error.message);

  const payload = data as { ok: boolean; already?: boolean; message?: string };
  return payload;
}
