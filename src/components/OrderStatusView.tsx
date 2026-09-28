import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  MessageSquare, 
  RefreshCw, 
  Gamepad2, 
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Order, SystemSettings } from '../types';
import { api } from '../services/api';

interface OrderStatusViewProps {
  activeOrder: Order | null;
  settings: SystemSettings;
  onSelectOrder: (order: Order) => void;
  initialOrderRef?: string;
  onOrderRefChange?: (orderRef: string) => void;
}

export const OrderStatusView: React.FC<OrderStatusViewProps> = ({
  activeOrder,
  settings,
  onSelectOrder,
  initialOrderRef,
  onOrderRefChange,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialOrderRef || activeOrder?.orderRef || '');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(activeOrder);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Recent-order history is intentionally not exposed by the public API.
  }, []);

  // When initialOrderRef changes or activeOrder changes
  useEffect(() => {
    if (initialOrderRef) {
      setSearchQuery(initialOrderRef);
      api.order(initialOrderRef).then(({ order }) => { setCurrentOrder(order); onSelectOrder(order); }).catch(() => setCurrentOrder(null));
    } else if (activeOrder) {
      setCurrentOrder(activeOrder);
      setSearchQuery(activeOrder.orderRef);
    }
  }, [initialOrderRef, activeOrder]);

  // Polling simulation: checks storage every 3 seconds if status is pending or processing
  useEffect(() => {
    if (!currentOrder || (currentOrder.status !== 'pending' && currentOrder.status !== 'processing')) {
      return;
    }

    const interval = setInterval(() => {
      api.order(currentOrder.orderRef).then(({ order }) => setCurrentOrder(order)).catch(console.error);
    }, 2000);

    return () => clearInterval(interval);
  }, [currentOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsRefreshing(true);
    api.order(searchQuery.trim()).then(({ order: found }) => { setCurrentOrder(found); onSelectOrder(found); onOrderRefChange?.(found.orderRef); }).catch(() => alert(`No order found matching "${searchQuery}". Check the reference code.`)).finally(() => setIsRefreshing(false));
  };

  const copyRef = () => {
    if (!currentOrder) return;
    navigator.clipboard.writeText(currentOrder.orderRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappSupportUrl = currentOrder
    ? `https://wa.me/${settings.whatsappSupportNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Hello NG TopUp Support, I have an inquiry regarding Order Ref: ${currentOrder.orderRef} (${currentOrder.packageName} to ${currentOrder.playerId}).`
      )}`
    : `https://wa.me/${settings.whatsappSupportNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        'Hello NG TopUp Support, I need help tracking my order.'
      )}`;

  return (
    <div className="space-y-6 pb-12 text-slate-100 max-w-2xl mx-auto">
      {/* Search Order Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <h2 className="font-bold text-base text-white mb-2">Track Your Top-Up Status</h2>
        <p className="text-xs text-slate-400 mb-4">
          Enter your Order Reference number (e.g. <span className="font-mono text-emerald-400 font-semibold">NGT-2026-XXXXX</span>) or your email address.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. NGT-2026-88192"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isRefreshing}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            {isRefreshing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Track</span>}
          </button>
        </form>
      </div>

      {/* Order Status Display */}
      {currentOrder ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          {/* Header Status & Reference */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Order Reference
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="font-mono font-black text-xl text-white">{currentOrder.orderRef}</span>
                <button
                  type="button"
                  onClick={copyRef}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs flex items-center space-x-1 transition"
                  title="Copy Reference"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Status Pill */}
            <div>
              {currentOrder.status === 'success' && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SUCCESSFULLY DELIVERED</span>
                </span>
              )}
              {currentOrder.status === 'processing' && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-black animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>PROCESSING WITH PUBLISHER</span>
                </span>
              )}
              {currentOrder.status === 'pending' && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black">
                  <Clock className="w-4 h-4" />
                  <span>AWAITING PAYMENT</span>
                </span>
              )}
              {currentOrder.status === 'failed' && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black">
                  <AlertCircle className="w-4 h-4" />
                  <span>FULFILLMENT FAILED</span>
                </span>
              )}
            </div>
          </div>

          {/* Stepper Visualization */}
          <div className="space-y-3 py-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Automated Delivery Pipeline</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              {/* Step 1 */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-emerald-500/40 space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Order Placed</span>
                </div>
                <p className="text-[11px] text-slate-400">{new Date(currentOrder.createdAt).toLocaleTimeString()}</p>
              </div>

              {/* Step 2 */}
              <div className={`p-3 rounded-xl border space-y-1 ${
                currentOrder.paymentStatus === 'paid'
                  ? 'bg-slate-800/80 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-850/60 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center space-x-1.5 font-bold">
                  {currentOrder.paymentStatus === 'paid' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  <span>2. Payment Paid</span>
                </div>
                <p className="text-[11px] text-slate-400">{currentOrder.paymentGateway.toUpperCase()}</p>
              </div>

              {/* Step 3 */}
              <div className={`p-3 rounded-xl border space-y-1 ${
                currentOrder.status === 'success' || currentOrder.status === 'processing'
                  ? 'bg-slate-800/80 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-850/60 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center space-x-1.5 font-bold">
                  {currentOrder.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : currentOrder.status === 'processing' ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span>3. Supplier Top-Up</span>
                </div>
                <p className="text-[11px] text-slate-400">{currentOrder.supplierName.toUpperCase()} B2B</p>
              </div>

              {/* Step 4 */}
              <div className={`p-3 rounded-xl border space-y-1 ${
                currentOrder.status === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                  : currentOrder.status === 'failed'
                  ? 'bg-red-950/40 border-red-500 text-red-300'
                  : 'bg-slate-850/60 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center space-x-1.5 font-bold">
                  {currentOrder.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : currentOrder.status === 'failed' ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span>4. Account Credited</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {currentOrder.status === 'success' ? 'Ready in-game' : currentOrder.status === 'failed' ? 'Failed' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-700/50">
              <span className="text-slate-400">Game</span>
              <span className="font-bold text-white">
                {currentOrder.gameId === 'free_fire' ? 'Free Fire' : 'Call of Duty: Mobile'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/50">
              <span className="text-slate-400">Item Denomination</span>
              <span className="font-bold text-white">{currentOrder.packageName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/50">
              <span className="text-slate-400">Player UID / ID</span>
              <span className="font-mono font-bold text-emerald-400">
                {currentOrder.playerId} {currentOrder.playerNickname && `(${currentOrder.playerNickname})`}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/50">
              <span className="text-slate-400">Amount Paid</span>
              <span className="font-black text-emerald-400 text-sm">₦{currentOrder.amountNgn.toLocaleString()}</span>
            </div>
            {currentOrder.supplierTxId && (
              <div className="flex justify-between py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Supplier Trans ID</span>
                <span className="font-mono text-slate-300">{currentOrder.supplierTxId}</span>
              </div>
            )}
            {currentOrder.failureReason && (
              <div className="flex justify-between py-1 bg-red-950/30 p-2 rounded-lg border border-red-500/30 text-red-300">
                <span>Failure Diagnostic</span>
                <span>{currentOrder.failureReason}</span>
              </div>
            )}
            <div className="flex justify-between py-1 text-slate-400">
              <span>Customer Email</span>
              <span>{currentOrder.customerEmail}</span>
            </div>
          </div>

          {/* WhatsApp Support CTA */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Need assistance with this order?</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Our Nigerian customer support team is active on WhatsApp with instant response times.
              </p>
            </div>
            <a
              href={whatsappSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shrink-0 transition"
            >
              <span>Chat on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      ) : (
        /* Empty State / Recents */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-center py-10">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No Order Selected</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Search using your reference code above, or pick from recent orders below to view instant status.
            </p>
          </div>

          {recentOrders.length > 0 && (
            <div className="pt-4 max-w-md mx-auto text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Recent Orders in this Session
              </span>
              <div className="space-y-2">
                {recentOrders.map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      setCurrentOrder(ord);
                      setSearchQuery(ord.orderRef);
                      onSelectOrder(ord);
                      onOrderRefChange?.(ord.orderRef);
                    }}
                    className="w-full bg-slate-850 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <span className="font-mono font-bold text-emerald-400">{ord.orderRef}</span>
                      <span className="text-slate-400 ml-2 font-medium">
                        {ord.gameId === 'free_fire' ? 'Free Fire' : 'CODM'} • ₦{ord.amountNgn.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ord.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : ord.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {ord.status.toUpperCase()}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
