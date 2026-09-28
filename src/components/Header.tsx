import React from 'react';
import { Gamepad2, Search, MessageSquare } from 'lucide-react';
import { SystemSettings } from '../types';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isAdminRoute: boolean;
  onExitAdmin: () => void;
  onLogoutAdmin?: () => void;
  isAdminAuthenticated?: boolean;
  settings: SystemSettings;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  isAdminRoute,
  onExitAdmin,
  onLogoutAdmin,
  isAdminAuthenticated,
  settings,
}) => {
  const whatsappUrl = `https://wa.me/${settings.whatsappSupportNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Hello, I need assistance with my Nigerian Gaming Top-Up order.'
  )}`;

  const isTrackActive = currentPath.startsWith('/dashboard/track');

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo & Tag */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer"
            onClick={() => onNavigate('/dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Gamepad2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-emerald-300">
                  NG TopUp
                </span>
                {isAdminRoute ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    ADMIN PORTAL
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none">
                {isAdminRoute ? 'Secure Operations & Metrics' : 'Instant Gaming Top-Up'}
              </p>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {!isAdminRoute ? (
              <>
                <button
                  onClick={() => onNavigate('/dashboard/track')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    isTrackActive
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Track</span>
                  <span className="sm:hidden">Order</span>
                </button>
              </>
            ) : (
              <>
                {/* Admin Mode Controls */}
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Storefront (/dashboard)
                </button>

                {isAdminAuthenticated && onLogoutAdmin && (
                  <button
                    onClick={onLogoutAdmin}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-red-950/50 hover:text-red-300 text-slate-300 border border-slate-700 transition"
                  >
                    Logout
                  </button>
                )}
              </>
            )}

            {/* WhatsApp Link for Visitor Support */}
            {!isAdminRoute && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/50 transition-colors flex items-center"
                title="Customer Support on WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
