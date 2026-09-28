import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Crosshair, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Zap, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { GameId, ProductPackage, Order } from '../types';
import { GAMES } from '../data/initialCatalog';
import { api } from '../services/api';
import { PlayerIdHelpModal } from './PlayerIdHelpModal';
import { CheckoutModal } from './CheckoutModal';

interface StorefrontProps {
  packages: ProductPackage[];
  onOrderCreated: (order: Order) => void;
  activeGameId?: GameId;
  onSelectGame?: (gameId: GameId) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({ 
  packages, 
  onOrderCreated,
  activeGameId = 'free_fire',
  onSelectGame,
}) => {
  const [selectedGameId, setSelectedGameId] = useState<GameId>(activeGameId);
  const [playerId, setPlayerId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  useEffect(() => {
    if (activeGameId && activeGameId !== selectedGameId) {
      setSelectedGameId(activeGameId);
      setVerifiedNickname(null);
      setVerificationError(null);
    }
  }, [activeGameId]);
  
  const [isVerifyingPlayer, setIsVerifyingPlayer] = useState(false);
  const [verifiedNickname, setVerifiedNickname] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const currentGame = GAMES.find((g) => g.id === selectedGameId) || GAMES[0];
  const activePackages = packages.filter((p) => p.gameId === selectedGameId && p.isActive);

  // Auto-select first package when game changes
  useEffect(() => {
    if (activePackages.length > 0 && !activePackages.find((p) => p.id === selectedPackageId)) {
      setSelectedPackageId(activePackages[0].id);
    }
  }, [selectedGameId, activePackages, selectedPackageId]);

  // Handle Player ID verification
  const handleVerifyPlayer = async () => {
    if (!playerId.trim()) return;
    setIsVerifyingPlayer(true);
    setVerificationError(null);
    setVerifiedNickname(null);

    try {
      const res = await api.validatePlayer(selectedGameId, playerId);
      if (res.valid) {
        setVerifiedNickname(res.playerName || 'Verified Account');
      } else {
        setVerificationError(res.error || 'Player ID could not be found.');
      }
    } catch {
      setVerificationError('Verification timed out. You may still proceed to order.');
    } finally {
      setIsVerifyingPlayer(false);
    }
  };

  const selectedPkg = activePackages.find((p) => p.id === selectedPackageId);

  const handleProceedToCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPkg) {
      alert('Please select a top-up package.');
      return;
    }
    if (!playerId.trim()) {
      alert('Please enter your Player ID.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      alert('Please enter a valid email address to receive your top-up receipt.');
      return;
    }

    const { order } = await api.createOrder({
      gameId: selectedGameId,
      packageId: selectedPkg.id,
      playerId,
      playerNickname: verifiedNickname || undefined,
      customerEmail,
      customerPhone,
      paymentGateway: 'paystack',
    });

    setPendingOrder(order);
    setIsCheckoutOpen(true);
  };

  const handlePaymentComplete = (completedOrder: Order) => {
    setIsCheckoutOpen(false);
    onOrderCreated(completedOrder);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Top Banner Notice */}
      <div className="ds-card bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Direct & Automated Top-Up</h2>
            <p className="text-xs text-slate-400">Official publisher wholesale B2B route. Instant delivery within ~30 seconds.</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Legitimate Supply Only</span>
        </div>
      </div>

      {/* Step 1: Select Game */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
            1
          </span>
          <h3 className="font-bold text-base text-white">Select Game</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {GAMES.map((game) => {
            const isSelected = selectedGameId === game.id;
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => {
                  setSelectedGameId(game.id);
                  setVerifiedNickname(null);
                  setVerificationError(null);
                  onSelectGame?.(game.id);
                }}
                className={`relative p-4 rounded-2xl border text-left transition-all flex items-start space-x-3.5 ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    game.id === 'free_fire'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  {game.id === 'free_fire' ? <Flame className="w-6 h-6" /> : <Crosshair className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-white truncate">{game.name}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{game.tagline}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Publisher: {game.publisher}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Player ID Input & Verification */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-base text-white">{currentGame.playerIdLabel}</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-medium cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Where do I find this?</span>
          </button>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={playerId}
                onChange={(e) => {
                  setPlayerId(e.target.value);
                  setVerifiedNickname(null);
                  setVerificationError(null);
                }}
                placeholder={currentGame.playerIdPlaceholder}
                className="ds-input w-full px-4 py-3 text-sm font-mono transition"
              />
            </div>
            <button
              type="button"
              disabled={isVerifyingPlayer || !playerId.trim()}
              onClick={handleVerifyPlayer}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
            >
              {isVerifyingPlayer ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verify Account</span>
                </>
              )}
            </button>
          </div>

          {/* Verification Badge */}
          {verifiedNickname && (
            <div className="mt-2.5 flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 rounded-xl">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>
                Account Verified: <strong className="text-white font-semibold">{verifiedNickname}</strong>
              </span>
            </div>
          )}

          {verificationError && (
            <div className="mt-2.5 flex items-center space-x-2 text-xs text-red-400 bg-red-950/40 border border-red-500/30 px-3 py-2 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{verificationError}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400 mt-2">
            Tip: Please ensure your Player ID is entered accurately. Top-ups are dispatched instantly and cannot be reversed.
          </p>
        </div>
      </div>

      {/* Step 3: Select Package / Denomination */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
            3
          </span>
          <h3 className="font-bold text-base text-white">Choose Denomination</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {activePackages.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedPackageId(pkg.id)}
                className={`relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                    : 'bg-slate-850/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {pkg.badge && (
                  <span className="absolute -top-2.5 right-3 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    {pkg.badge}
                  </span>
                )}

                <div>
                  <span className="font-extrabold text-sm sm:text-base text-white block">
                    {pkg.name}
                  </span>
                  {pkg.bonus ? (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1 mt-0.5">
                      <Sparkles className="w-3 h-3" />
                      <span>+{pkg.bonus} Extra Bonus</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Standard Pack</span>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Price</span>
                  <span className="font-black text-sm sm:text-base text-emerald-400">
                    ₦{pkg.salePriceNgn.toLocaleString()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 4: Customer Details & Checkout */}
      <form onSubmit={handleProceedToCheckout} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
            4
          </span>
          <h3 className="font-bold text-base text-white">Receipt & Checkout</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Email Address <span className="text-emerald-400">*</span>
            </label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="e.g. gamer@gmail.com"
              className="ds-input w-full px-4 py-2.5 text-sm"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Order receipt and reference code will be emailed here.</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              WhatsApp / Phone <span className="text-slate-500">(Optional)</span>
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="e.g. 08012345678"
              className="ds-input w-full px-4 py-2.5 text-sm"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">For priority support via WhatsApp.</span>
          </div>
        </div>

        {/* Order Summary Breakdown */}
        {selectedPkg && (
          <div className="mt-4 bg-slate-800/70 rounded-2xl p-4 border border-slate-700/60 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Game & Item</span>
              <span className="font-semibold text-white">{currentGame.name} — {selectedPkg.name}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Target Account</span>
              <span className="font-mono text-emerald-400 font-semibold">{playerId || 'Not entered yet'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payment Gateway</span>
              <span className="text-slate-300">Paystack / Flutterwave</span>
            </div>
            <div className="pt-2 border-t border-slate-700/60 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-200">Total Due (NGN)</span>
              <span className="font-black text-xl text-emerald-400">₦{selectedPkg.salePriceNgn.toLocaleString()}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="ds-button-primary w-full py-3.5 text-base flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          <span>Pay with Paystack / Flutterwave</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      {/* Modals */}
      <PlayerIdHelpModal
        gameId={selectedGameId}
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <CheckoutModal
        order={pendingOrder}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};
