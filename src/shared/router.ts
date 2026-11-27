/**
 * روتر سبک بر پایه History API، بدون وابستگی جدید.
 *
 * مسیرها عمداً ساده و قابل خواندن هستند تا QR هر میز فقط یک لینک باشد:
 *   /t/:qrToken
 *   /waiter/login
 *   /waiter
 *   /waiter/order/:tableNumber
 *   /admin/login
 *   /admin
 *   /admin/orders
 *   /admin/orders/:orderId
 *   /admin/menu
 *   /admin/menu/:productId
 *   /admin/staff
 */

export type Route =
  | { name: 'home' }
  | { name: 'customer'; qrToken: string }
  | { name: 'waiter-login' }
  | { name: 'waiter-workspace' }
  | { name: 'waiter-order'; tableNumber: number }
  | { name: 'admin-login' }
  | { name: 'admin-live' }
  | { name: 'admin-orders' }
  | { name: 'admin-order'; orderId: string }
  | { name: 'admin-menu' }
  | { name: 'admin-product'; productId: string }
  | { name: 'admin-staff' };

/** پیشوند انتشار (برای GitHub Pages مقدار /vadoodian است)؛ در ریشه خالی است. */
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** مسیر مرورگر را به مسیر داخلی اپ، بدون پیشوند انتشار، تبدیل می‌کند. */
const stripBase = (pathname: string): string => {
  if (!BASE_PATH) return pathname;
  if (pathname === BASE_PATH) return '/';
  if (pathname.startsWith(`${BASE_PATH}/`)) return pathname.slice(BASE_PATH.length);
  return pathname;
};

/** مسیر داخلی اپ را به مسیر کامل قابل استفاده در History API تبدیل می‌کند. */
const withBase = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalized}`;
};

const clean = (path: string) => {
  const withoutQuery = path.split('?')[0].split('#')[0];
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery || '/';
};

const segments = (path: string) =>
  clean(path)
    .split('/')
    .filter(Boolean)
    .map((part) => decodeURIComponent(part));

export function parseRoute(pathname: string): Route {
  const parts = segments(stripBase(pathname));

  if (parts.length === 0) return { name: 'home' };

  if (parts[0] === 't' && parts[1]) {
    return { name: 'customer', qrToken: parts[1] };
  }

  if (parts[0] === 'waiter') {
    if (parts[1] === 'login') return { name: 'waiter-login' };
    if (parts[1] === 'order' && parts[2]) {
      const tableNumber = Number(parts[2]);
      if (Number.isFinite(tableNumber) && tableNumber > 0) {
        return { name: 'waiter-order', tableNumber };
      }
    }
    return { name: 'waiter-workspace' };
  }

  if (parts[0] === 'admin') {
    if (parts[1] === 'login') return { name: 'admin-login' };
    if (parts[1] === 'orders') {
      return parts[2]
        ? { name: 'admin-order', orderId: parts[2] }
        : { name: 'admin-orders' };
    }
    if (parts[1] === 'menu') {
      return parts[2]
        ? { name: 'admin-product', productId: parts[2] }
        : { name: 'admin-menu' };
    }
    if (parts[1] === 'staff') return { name: 'admin-staff' };
    return { name: 'admin-live' };
  }

  return { name: 'home' };
}

export function routePath(route: Route): string {
  switch (route.name) {
    case 'customer':
      return `/t/${route.qrToken}`;
    case 'waiter-login':
      return '/waiter/login';
    case 'waiter-workspace':
      return '/waiter';
    case 'waiter-order':
      return `/waiter/order/${route.tableNumber}`;
    case 'admin-login':
      return '/admin/login';
    case 'admin-live':
      return '/admin';
    case 'admin-orders':
      return '/admin/orders';
    case 'admin-order':
      return `/admin/orders/${route.orderId}`;
    case 'admin-menu':
      return '/admin/menu';
    case 'admin-product':
      return `/admin/menu/${route.productId}`;
    case 'admin-staff':
      return '/admin/staff';
    default:
      return '/';
  }
}

export function pushPath(path: string): void {
  const target = withBase(path);
  if (window.location.pathname === target) return;
  window.history.pushState({}, '', target);
}

export function replacePath(path: string): void {
  const target = withBase(path);
  if (window.location.pathname === target) return;
  window.history.replaceState({}, '', target);
}

/** لینک کامل QR یک میز؛ برای چاپ یا ساخت QR. */
export function tableQrUrl(qrToken: string): string {
  return `${window.location.origin}${withBase(`/t/${qrToken}`)}`;
}
