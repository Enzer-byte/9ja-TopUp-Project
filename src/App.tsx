import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Storefront } from './components/Storefront';
import { OrderStatusView } from './components/OrderStatusView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAuthGate } from './components/AdminAuthGate';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { RouteAddressBar } from './components/RouteAddressBar';
import { ProductPackage, SystemSettings, Order, GameId } from './types';
import { api } from './services/api';
import { parsePath, ParsedRoute } from './routes';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      return p === '/' || p === '' ? '/dashboard' : p;
    }
    return '/dashboard';
  });

  const [packages, setPackages] = useState<ProductPackage[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({ activeSupplier: 'mock', supplierSimulateFailure: false, supplierDelayMs: 0, whatsappSupportNumber: '+2348012345678', preferredGateway: 'paystack' });
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ngt_admin_session') === 'authenticated';
    } catch {
      return false;
    }
  });

  const parsedRoute: ParsedRoute = parsePath(currentPath);

  useEffect(() => {
    api.catalog().then(({ packages: list }) => setPackages(list)).catch(console.error);

    // Normalize URL if root
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.history.replaceState(null, '', '/dashboard');
      setCurrentPath('/dashboard');
    }

    const handleLocationChange = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (newPath: string) => {
    window.history.pushState(null, '', newPath);
    setCurrentPath(newPath);
  };

  const handleOrderCreated = (order: Order) => {
    setActiveOrder(order);
    navigateTo(`/dashboard/track/${order.orderRef}`);
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('ngt_admin_session');
    setIsAdminAuthenticated(false);
    navigateTo('/dashboard');
  };

  const isAdminRoute = parsedRoute.section === 'admin';

  // Determine active game if on storefront or game sub-route
  const activeGameId: GameId = parsedRoute.subRoute === 'game_codm' ? 'codm' : 'free_fire';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <Header
        currentPath={currentPath}
        onNavigate={navigateTo}
        isAdminRoute={isAdminRoute}
        onExitAdmin={() => navigateTo('/dashboard')}
        onLogoutAdmin={handleLogoutAdmin}
        isAdminAuthenticated={isAdminAuthenticated}
        settings={settings}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
        {/* Interactive URL Address Bar & Directory */}
        <RouteAddressBar
          parsedRoute={parsedRoute}
          onNavigate={navigateTo}
          isAdminAuthenticated={isAdminAuthenticated}
        />

        {/* Dynamic Route View Resolution */}
        {!isAdminRoute ? (
          /* ================= VISITOR SECTION (/dashboard and sub-URLs) ================= */
          <>
            {(parsedRoute.subRoute === 'storefront' ||
              parsedRoute.subRoute === 'game_free_fire' ||
              parsedRoute.subRoute === 'game_codm') && (
              <Storefront
                packages={packages}
                onOrderCreated={handleOrderCreated}
                activeGameId={activeGameId}
                onSelectGame={(gameId) => {
                  navigateTo(gameId === 'free_fire' ? '/dashboard/games/free-fire' : '/dashboard/games/codm');
                }}
              />
            )}

            {parsedRoute.subRoute === 'track' && (
              <OrderStatusView
                activeOrder={activeOrder}
                settings={settings}
                initialOrderRef={parsedRoute.param}
                onSelectOrder={(order) => setActiveOrder(order)}
                onOrderRefChange={(orderRef) => navigateTo(`/dashboard/track/${orderRef}`)}
              />
            )}
          </>
        ) : (
          /* ================= ADMIN OPERATIONS SECTION (/admin/dashboard and sub-URLs) ================= */
          <>
            {!isAdminAuthenticated ? (
              <AdminAuthGate
                onAuthenticated={() => {
                  setIsAdminAuthenticated(true);
                  if (currentPath === '/admin' || currentPath === '/admin/dashboard') {
                    navigateTo('/admin/dashboard/overview');
                  }
                }}
                onExitToStorefront={() => navigateTo('/dashboard')}
              />
            ) : (
              <AdminDashboard
                packages={packages}
                onPackagesUpdated={(updated) => setPackages(updated)}
                settings={settings}
                onSettingsUpdated={(updated) => setSettings(updated)}
                activeAdminSubRoute={
                  parsedRoute.subRoute === 'admin_orders'
                    ? 'admin_orders'
                    : parsedRoute.subRoute === 'admin_catalog'
                    ? 'admin_catalog'
                    : parsedRoute.subRoute === 'admin_suppliers'
                    ? 'admin_suppliers'
                    : parsedRoute.subRoute === 'admin_audit'
                    ? 'admin_audit'
                    : 'admin_overview'
                }
                onNavigateSubRoute={(sub) => {
                  switch (sub) {
                    case 'admin_orders':
                      navigateTo('/admin/dashboard/orders');
                      break;
                    case 'admin_catalog':
                      navigateTo('/admin/dashboard/catalog');
                      break;
                    case 'admin_suppliers':
                      navigateTo('/admin/dashboard/suppliers');
                      break;
                    case 'admin_audit':
                      navigateTo('/admin/dashboard/audit');
                      break;
                    case 'admin_overview':
                    default:
                      navigateTo('/admin/dashboard/overview');
                      break;
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {/* WhatsApp Support Floating Badge (Only on Visitor pages) */}
      {!isAdminRoute && <WhatsAppFloatingButton settings={settings} />}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Nigerian Gaming Top-Up Platform. Legitimate B2B publisher supply.</p>
          <div className="flex items-center space-x-3 text-[11px]">
            <span>Free Fire</span>
            <span>•</span>
            <span>Call of Duty: Mobile</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Paystack & Flutterwave Verified</span>
            <span>•</span>
            {/* Direct Admin Portal link */}
            <button
              onClick={() => navigateTo('/admin/dashboard/overview')}
              className="text-slate-600 hover:text-amber-400 font-medium transition cursor-pointer"
              title="Protected Staff Portal"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
