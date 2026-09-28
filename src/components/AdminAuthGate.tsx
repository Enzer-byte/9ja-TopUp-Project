import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';

interface AdminAuthGateProps {
  onAuthenticated: () => void;
  onExitToStorefront: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  onAuthenticated,
  onExitToStorefront,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    setTimeout(() => {
      if (pin.trim().length >= 24) {
        sessionStorage.setItem('ngt_admin_api_token', pin.trim());
        localStorage.setItem('ngt_admin_session', 'authenticated');
        onAuthenticated();
      } else {
        setError('Enter the API token issued to your admin account.');
        setPin('');
      }
      setIsVerifying(false);
    }, 400);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white">Admin Operations Access</h2>
          <p className="text-xs text-slate-400">
            Restricted area: <code className="text-emerald-400 font-mono">/admin/dashboard</code>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Enter Admin API Token</span>
            </label>
            <input
              type="password"
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(null);
              }}
              placeholder="Token from your administrator"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg tracking-widest text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!pin.trim() || isVerifying}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isVerifying ? 'Verifying...' : 'Unlock Admin Operations'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={onExitToStorefront}
            className="text-xs text-slate-400 hover:text-white flex items-center justify-center space-x-1.5 mx-auto font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer Storefront (/dashboard)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
