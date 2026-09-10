import { GameId } from './types';

export type AppRoute =
  | { path: '/dashboard'; name: 'Visitor Storefront'; section: 'visitor' }
  | { path: '/dashboard/games/free-fire'; name: 'Free Fire Store'; section: 'visitor'; gameId: 'free_fire' }
  | { path: '/dashboard/games/codm'; name: 'CODM Store'; section: 'visitor'; gameId: 'codm' }
  | { path: '/dashboard/track'; name: 'Track Order'; section: 'visitor'; orderRef?: string }
  | { path: `/dashboard/track/${string}`; name: 'Track Specific Order'; section: 'visitor'; orderRef: string }
  | { path: '/admin/dashboard'; name: 'Admin Overview'; section: 'admin' }
  | { path: '/admin/dashboard/overview'; name: 'Admin Overview'; section: 'admin' }
  | { path: '/admin/dashboard/orders'; name: 'Admin Orders & Retries'; section: 'admin' }
  | { path: '/admin/dashboard/catalog'; name: 'Admin Catalog & Prices'; section: 'admin' }
  | { path: '/admin/dashboard/suppliers'; name: 'Admin Supplier Adapters'; section: 'admin' }
  | { path: '/admin/dashboard/audit'; name: 'Admin Webhook & Idempotency Audit'; section: 'admin' };

export interface ParsedRoute {
  pathname: string;
  section: 'visitor' | 'admin';
  subRoute:
    | 'storefront'
    | 'game_free_fire'
    | 'game_codm'
    | 'track'
    | 'admin_overview'
    | 'admin_orders'
    | 'admin_catalog'
    | 'admin_suppliers'
    | 'admin_audit';
  param?: string; // e.g. orderRef
}

export function parsePath(pathname: string): ParsedRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';

  // Admin Routes
  if (clean.startsWith('/admin')) {
    if (clean === '/admin' || clean === '/admin/dashboard' || clean === '/admin/dashboard/overview') {
      return { pathname: '/admin/dashboard/overview', section: 'admin', subRoute: 'admin_overview' };
    }
    if (clean === '/admin/dashboard/orders') {
      return { pathname: '/admin/dashboard/orders', section: 'admin', subRoute: 'admin_orders' };
    }
    if (clean === '/admin/dashboard/catalog') {
      return { pathname: '/admin/dashboard/catalog', section: 'admin', subRoute: 'admin_catalog' };
    }
    if (clean === '/admin/dashboard/suppliers') {
      return { pathname: '/admin/dashboard/suppliers', section: 'admin', subRoute: 'admin_suppliers' };
    }
    if (clean === '/admin/dashboard/audit') {
      return { pathname: '/admin/dashboard/audit', section: 'admin', subRoute: 'admin_audit' };
    }
    return { pathname: '/admin/dashboard/overview', section: 'admin', subRoute: 'admin_overview' };
  }

  // Visitor Routes
  if (clean === '/dashboard/games/free-fire') {
    return { pathname: clean, section: 'visitor', subRoute: 'game_free_fire', param: 'free_fire' };
  }
  if (clean === '/dashboard/games/codm') {
    return { pathname: clean, section: 'visitor', subRoute: 'game_codm', param: 'codm' };
  }
  if (clean.startsWith('/dashboard/track/')) {
    const orderRef = clean.replace('/dashboard/track/', '');
    return { pathname: clean, section: 'visitor', subRoute: 'track', param: orderRef };
  }
  if (clean === '/dashboard/track') {
    return { pathname: clean, section: 'visitor', subRoute: 'track' };
  }

  // Fallback to default storefront
  return { pathname: '/dashboard', section: 'visitor', subRoute: 'storefront' };
}
