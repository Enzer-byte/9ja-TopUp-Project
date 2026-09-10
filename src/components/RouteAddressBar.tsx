import React, { useState } from 'react';
import { Globe, Copy, Check, ChevronDown, ExternalLink, ShieldAlert, Sparkles, Navigation } from 'lucide-react';
import { ParsedRoute } from '../routes';

interface RouteAddressBarProps {
  parsedRoute: ParsedRoute;
  onNavigate: (path: string) => void;
  isAdminAuthenticated: boolean;
}

export const RouteAddressBar: React.FC<RouteAddressBarProps> = ({
  parsedRoute,
  onNavigate,
  isAdminAuthenticated,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${parsedRoute.pathname}` : parsedRoute.pathname;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const visitorRoutes = [
    { path: '/dashboard', label: 'Storefront (Main Store)', desc: 'Primary customer gaming catalog' },
    { path: '/dashboard/games/free-fire', label: 'Free Fire Direct URL', desc: 'Direct package selection for Free Fire Diamonds' },
    { path: '/dashboard/games/codm', label: 'CODM Direct URL', desc: 'Direct package selection for Call of Duty CP' },
    { path: '/dashboard/track', label: 'Track Order', desc: 'Order tracking lookup & status search' },
    { path: '/dashboard/track/NGT-2026-DEMO', label: 'Track Order Permalink', desc: 'Direct order status permalink with live stepper' },
  ];

  const adminRoutes = [
    { path: '/admin/dashboard/overview', label: 'Admin Overview', desc: 'GMV, gross margin, & fulfillment rates' },
    { path: '/admin/dashboard/orders', label: 'Orders & Retries', desc: 'Order status filtering & manual retry triggers' },
    { path: '/admin/dashboard/catalog', label: 'Catalog Toggles', desc: 'Package activation & wholesale/retail NGN pricing' },
    { path: '/admin/dashboard/suppliers', label: 'Supplier Adapters', desc: 'Switch fulfillment engines (Mock, Coda, Reloadly)' },
    { path: '/admin/dashboard/audit', label: 'Webhook & Idempotency Audit', desc: 'Immutable webhook delivery log & double-credit guard' },
  ];

  return (
    <div className="relative mb-6">
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        {/* URL Display */}
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-center space-x-1.5 min-w-0 font-mono">
            <span className="text-slate-500 text-[11px] hidden md:inline">URL:</span>
            <span className="font-bold text-white truncate text-[11px] sm:text-xs">
              {parsedRoute.pathname}
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-bold uppercase tracking-wider shrink-0 ${
              parsedRoute.section === 'admin'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {parsedRoute.section}
            </span>
          </div>
        </div>

        {/* Route Actions */}
        <div className="flex items-center space-x-2 shrink-0 justify-end">
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition flex items-center space-x-1 text-[11px] font-medium"
            title="Copy current URL"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy URL'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/40 transition flex items-center space-x-1 text-[11px] font-bold"
          >
            <Navigation className="w-3 h-3" />
            <span>Explore All Routes</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown Route Map Modal */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900 border border-slate-750 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Platform URL Route Directory</span>
              </h4>
              <p className="text-xs text-slate-400">
                Direct deep links for visitor storefront and PIN-protected admin operations.
              </p>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visitor Section */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <span>Customer Visitor URLs</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded">Public</span>
              </div>
              <div className="space-y-1.5">
                {visitorRoutes.map((r) => (
                  <button
                    key={r.path}
                    onClick={() => {
                      onNavigate(r.path);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex flex-col ${
                      parsedRoute.pathname === r.path
                        ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : 'bg-slate-850/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-400">{r.path}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{r.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Section */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <span>Admin Operations URLs</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 rounded">PIN: admin2026</span>
              </div>
              <div className="space-y-1.5">
                {adminRoutes.map((r) => (
                  <button
                    key={r.path}
                    onClick={() => {
                      onNavigate(r.path);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex flex-col ${
                      parsedRoute.pathname === r.path
                        ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30'
                        : 'bg-slate-850/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-400">{r.path}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{r.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
