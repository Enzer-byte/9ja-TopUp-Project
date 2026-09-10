import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Sliders, 
  Search, 
  ShieldAlert, 
  RefreshCw, 
  Layers, 
  Flame, 
  Crosshair,
  Server,
  Activity,
  History
} from 'lucide-react';
import { Order, ProductPackage, TransactionLog, SystemSettings, SupplierType } from '../types';
import { storage } from '../services/storage';
import { OrderService } from '../services/orderService';
import { AdminSkeleton } from './AdminSkeleton';

interface AdminDashboardProps {
  packages: ProductPackage[];
  onPackagesUpdated: (packages: ProductPackage[]) => void;
  settings: SystemSettings;
  onSettingsUpdated: (settings: SystemSettings) => void;
  activeAdminSubRoute?: 'admin_overview' | 'admin_orders' | 'admin_catalog' | 'admin_suppliers' | 'admin_audit';
  onNavigateSubRoute?: (subRoute: 'admin_overview' | 'admin_orders' | 'admin_catalog' | 'admin_suppliers' | 'admin_audit') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  packages,
  onPackagesUpdated,
  settings,
  onSettingsUpdated,
  activeAdminSubRoute = 'admin_overview',
  onNavigateSubRoute,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'processing'>('all');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Trigger brief skeleton transition effect when sub-route changes
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [activeAdminSubRoute]);

  // Map route to activeTab
  const currentTab = (() => {
    switch (activeAdminSubRoute) {
      case 'admin_orders':
        return 'orders';
      case 'admin_catalog':
        return 'catalog';
      case 'admin_suppliers':
        return 'supplier';
      case 'admin_audit':
        return 'audit';
      case 'admin_overview':
      default:
        return 'analytics';
    }
  })();

  const setTab = (tab: 'analytics' | 'orders' | 'catalog' | 'supplier' | 'audit') => {
    if (onNavigateSubRoute) {
      switch (tab) {
        case 'orders':
          onNavigateSubRoute('admin_orders');
          break;
        case 'catalog':
          onNavigateSubRoute('admin_catalog');
          break;
        case 'supplier':
          onNavigateSubRoute('admin_suppliers');
          break;
        case 'audit':
          onNavigateSubRoute('admin_audit');
          break;
        case 'analytics':
        default:
          onNavigateSubRoute('admin_overview');
          break;
      }
    }
  };

  const refreshData = () => {
    setOrders(storage.getOrders());
    setTransactions(storage.getTransactions());
  };

  const handleManualRefresh = () => {
    setIsManualRefreshing(true);
    refreshData();
    setTimeout(() => {
      setIsManualRefreshing(false);
    }, 450);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Compute Metrics
  const totalOrdersCount = orders.length;
  const successfulOrders = orders.filter((o) => o.status === 'success');
  const failedOrders = orders.filter((o) => o.status === 'failed');
  const processingOrders = orders.filter((o) => o.status === 'processing');

  const gmvNgn = successfulOrders.reduce((acc, curr) => acc + curr.amountNgn, 0);
  const totalCostNgn = successfulOrders.reduce((acc, curr) => acc + curr.costNgn, 0);
  const grossMarginNgn = gmvNgn - totalCostNgn;
  const marginPercentage = gmvNgn > 0 ? ((grossMarginNgn / gmvNgn) * 100).toFixed(1) : '0.0';

  // Manual retry handler
  const handleManualRetry = async (orderId: string) => {
    setRetryingOrderId(orderId);
    try {
      const res = await OrderService.adminRetryOrder(orderId);
      if (res.order) {
        setSelectedOrder(res.order);
      }
      refreshData();
      alert(res.message);
    } catch {
      alert('Retry encountered an error');
    } finally {
      setRetryingOrderId(null);
    }
  };

  // Toggle package availability
  const handleTogglePackage = (pkgId: string, currentStatus: boolean) => {
    const updated = storage.updatePackage(pkgId, { isActive: !currentStatus });
    onPackagesUpdated(updated);
  };

  // Update package price
  const handleUpdatePrice = (pkgId: string, newSalePrice: number) => {
    if (isNaN(newSalePrice) || newSalePrice <= 0) return;
    const updated = storage.updatePackage(pkgId, { salePriceNgn: newSalePrice });
    onPackagesUpdated(updated);
  };

  // Change active supplier
  const handleSupplierChange = (supplier: SupplierType) => {
    const updated = storage.saveSettings({ activeSupplier: supplier });
    onSettingsUpdated(updated);
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.toLowerCase();
    return (
      o.orderRef.toLowerCase().includes(q) ||
      o.playerId.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12 text-slate-100 max-w-5xl mx-auto">
      {/* Admin Title & Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center justify-between sm:justify-start space-x-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-black text-lg text-white">Merchant Admin & Operations</h2>
                {isTransitioning ? (
                  <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    <span>Loading View...</span>
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Live Synced</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Order fulfillment, GMV analytics, supplier adapters, and catalog control</p>
            </div>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isManualRefreshing || isTransitioning}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition flex items-center space-x-1.5 text-xs font-semibold shrink-0"
            title="Sync live data from storage"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isManualRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isManualRefreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
        </div>

        {/* Sub-nav tabs */}
        <div className="flex flex-wrap items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs gap-1">
          <button
            onClick={() => setTab('analytics')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 ${
              currentTab === 'analytics' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Overview</span>
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              currentTab === 'orders' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Orders & Retries ({orders.length})
          </button>
          <button
            onClick={() => setTab('catalog')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              currentTab === 'catalog' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Catalog Toggles
          </button>
          <button
            onClick={() => setTab('supplier')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              currentTab === 'supplier' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Supplier Adapter
          </button>
          <button
            onClick={() => setTab('audit')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              currentTab === 'audit' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Audit Trail ({transactions.length})
          </button>
        </div>
      </div>

      {/* Sub-route Content with Skeleton Transition */}
      {isTransitioning ? (
        <AdminSkeleton tab={currentTab} />
      ) : (
        <div className="animate-in fade-in duration-200">
          {/* Overview Analytics Tab */}
          {currentTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* GMV */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Gross Merchandise Value</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-black text-xl sm:text-2xl text-emerald-400">
                ₦{gmvNgn.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Confirmed paid GMV</p>
            </div>

            {/* Gross Margin */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Estimated Gross Margin</span>
                <TrendingUp className="w-4 h-4 text-teal-400" />
              </div>
              <div className="font-black text-xl sm:text-2xl text-teal-400">
                ₦{grossMarginNgn.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">~{marginPercentage}% average margin</p>
            </div>

            {/* Successful Orders */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Fulfilled Top-Ups</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-black text-xl sm:text-2xl text-white">
                {successfulOrders.length} <span className="text-xs text-slate-500 font-normal">/ {totalOrdersCount}</span>
              </div>
              <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
                {totalOrdersCount > 0 ? ((successfulOrders.length / totalOrdersCount) * 100).toFixed(0) : 0}% success rate
              </p>
            </div>

            {/* Failed Orders */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Failed / Retries</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="font-black text-xl sm:text-2xl text-red-400">
                {failedOrders.length}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Eligible for manual retry</p>
            </div>
          </div>

          {/* Quick Resiliency & Supplier Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 border border-slate-700">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Active Fulfillment Supplier: <span className="text-emerald-400 uppercase">{settings.activeSupplier}</span></h3>
                <p className="text-xs text-slate-400">Swappable adapter layer with zero storefront downtime.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTab('supplier')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition"
            >
              Configure Supplier Adapter
            </button>
          </div>

          {/* Recent Audit Transactions */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <History className="w-4 h-4 text-emerald-400" />
                <span>Audit Transaction Trail (Idempotency & Webhooks)</span>
              </h3>
              <button
                type="button"
                onClick={() => setTab('audit')}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                View Full Audit Log →
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No transaction logs recorded yet.</p>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-slate-850 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        tx.status === 'processed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : tx.status === 'duplicate_ignored'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {tx.eventType}
                      </span>
                      <span className="text-slate-300">{tx.payloadSummary}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders & Retries Tab */}
      {currentTab === 'orders' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search reference, UID, or email..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center space-x-1 text-xs">
              {(['all', 'success', 'failed', 'processing'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                    statusFilter === filter
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Order Ref</th>
                  <th className="py-2.5 px-3">Game & Item</th>
                  <th className="py-2.5 px-3">Player ID</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Margin</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const margin = ord.amountNgn - ord.costNgn;
                    return (
                      <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-mono font-bold text-white">{ord.orderRef}</td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-200 block">
                            {ord.gameId === 'free_fire' ? 'Free Fire' : 'CODM'}
                          </span>
                          <span className="text-[11px] text-slate-400">{ord.packageName}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-emerald-400 font-semibold">{ord.playerId}</td>
                        <td className="py-3 px-3 font-black text-white">₦{ord.amountNgn.toLocaleString()}</td>
                        <td className="py-3 px-3 text-teal-400 font-semibold">+₦{margin.toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            ord.status === 'success'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : ord.status === 'failed'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-cyan-500/20 text-cyan-400'
                          }`}>
                            {ord.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {ord.status === 'failed' && (
                            <button
                              type="button"
                              disabled={retryingOrderId === ord.id}
                              onClick={() => handleManualRetry(ord.id)}
                              className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-[11px] font-bold flex items-center space-x-1 ml-auto transition disabled:opacity-50"
                            >
                              {retryingOrderId === ord.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3 h-3" />
                              )}
                              <span>Retry</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Catalog & Toggles Tab */}
      {currentTab === 'catalog' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
          <div>
            <h3 className="font-bold text-base text-white">Manage Product Catalog & Pricing</h3>
            <p className="text-xs text-slate-400">Enable/disable packages or modify retail NGN prices with live margin calculation.</p>
          </div>

          <div className="space-y-3">
            {packages.map((pkg) => {
              const margin = pkg.salePriceNgn - pkg.costPriceNgn;
              const marginPct = ((margin / pkg.salePriceNgn) * 100).toFixed(0);

              return (
                <div
                  key={pkg.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    pkg.isActive
                      ? 'bg-slate-850/80 border-slate-700/80'
                      : 'bg-slate-900/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      pkg.gameId === 'free_fire' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {pkg.gameId === 'free_fire' ? <Flame className="w-5 h-5" /> : <Crosshair className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white">{pkg.name}</span>
                        {pkg.badge && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        Wholesale Cost: ₦{pkg.costPriceNgn.toLocaleString()} • Margin: +₦{margin.toLocaleString()} ({marginPct}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Price editor */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs text-slate-400">Retail ₦</span>
                      <input
                        type="number"
                        defaultValue={pkg.salePriceNgn}
                        onBlur={(e) => handleUpdatePrice(pkg.id, Number(e.target.value))}
                        className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Active toggle switch */}
                    <button
                      type="button"
                      onClick={() => handleTogglePackage(pkg.id, pkg.isActive)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                        pkg.isActive
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <span>{pkg.isActive ? 'Active' : 'Disabled'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Supplier Adapter Tab */}
      {currentTab === 'supplier' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
          <div>
            <h3 className="font-bold text-base text-white">Swappable Supplier Adapter Architecture</h3>
            <p className="text-xs text-slate-400">Switch fulfillment engine on the fly without changing storefront or checkout code.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Mock Supplier */}
            <div className={`p-4 rounded-2xl border transition ${
              settings.activeSupplier === 'mock'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                : 'bg-slate-850/60 border-slate-800'
            }`}>
              <span className="text-xs font-bold text-emerald-400 block mb-1">Testing & Development</span>
              <h4 className="font-black text-base text-white">Mock Supplier Engine</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Simulates instant API validation and ~1.5s fulfillment loop with test failure flags.
              </p>
              <button
                type="button"
                onClick={() => handleSupplierChange('mock')}
                className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                  settings.activeSupplier === 'mock'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {settings.activeSupplier === 'mock' ? 'Currently Active' : 'Switch to Mock'}
              </button>
            </div>

            {/* Coda Payments Adapter */}
            <div className={`p-4 rounded-2xl border transition ${
              settings.activeSupplier === 'coda'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                : 'bg-slate-850/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-cyan-400">Primary Target</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.2 rounded font-bold">Recommended</span>
              </div>
              <h4 className="font-black text-base text-white">Coda Payments B2B</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Official publisher distributor for Free Fire & CODM in Nigeria. Validation API + TopUp API.
              </p>
              <button
                type="button"
                onClick={() => handleSupplierChange('coda')}
                className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                  settings.activeSupplier === 'coda'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {settings.activeSupplier === 'coda' ? 'Currently Active' : 'Switch to Coda'}
              </button>
            </div>

            {/* Reloadly Adapter */}
            <div className={`p-4 rounded-2xl border transition ${
              settings.activeSupplier === 'reloadly'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                : 'bg-slate-850/60 border-slate-800'
            }`}>
              <span className="text-xs font-bold text-amber-400 block mb-1">Secondary Backup</span>
              <h4 className="font-black text-base text-white">Reloadly Goods</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                OAuth2 tokenized digital wholesale backup for Free Fire codes.
              </p>
              <button
                type="button"
                onClick={() => handleSupplierChange('reloadly')}
                className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                  settings.activeSupplier === 'reloadly'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {settings.activeSupplier === 'reloadly' ? 'Currently Active' : 'Switch to Reloadly'}
              </button>
            </div>
          </div>

          {/* Reset Demo Data Helper */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset all demo orders and catalog prices to factory default?')) {
                  storage.resetDemoData();
                  refreshData();
                  onPackagesUpdated(storage.getPackages());
                  alert('Demo database reset.');
                }
              }}
              className="text-xs text-slate-500 hover:text-red-400 underline font-medium transition"
            >
              Reset local demo database to seeds
            </button>
          </div>
        </div>
      )}

      {/* Audit Trail Tab */}
      {currentTab === 'audit' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <History className="w-4 h-4 text-emerald-400" />
                <span>Webhook & Idempotency Audit Log</span>
              </h3>
              <p className="text-xs text-slate-400">
                Immutable event stream protecting against double credits and tracking gateway verification payloads.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              Total events: {transactions.length}
            </span>
          </div>

          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No webhook or idempotency events logged yet. Place an order to generate audit records.
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-slate-850/90 border border-slate-800 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-black ${
                        tx.status === 'processed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : tx.status === 'duplicate_ignored'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {tx.eventType}
                      </span>
                      <span className="text-xs font-bold text-white">{tx.payloadSummary}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(tx.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto">
                    <div>Idempotency Key: <span className="text-emerald-400">{tx.idempotencyKey}</span></div>
                    {tx.rawPayload && (
                      <div className="text-slate-500 text-[10px] mt-1 truncate">
                        Payload: {JSON.stringify(tx.rawPayload)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};
