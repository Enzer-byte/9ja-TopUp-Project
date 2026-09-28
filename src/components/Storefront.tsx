import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Headphones,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { GameId, Order, ProductPackage } from '../types';
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

const naira = (value: number) => `₦${value.toLocaleString()}`;

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
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [isVerifyingPlayer, setIsVerifyingPlayer] = useState(false);
  const [verifiedNickname, setVerifiedNickname] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const currentGame = GAMES.find((game) => game.id === selectedGameId) || GAMES[0];
  const activePackages = packages
    .filter((pkg) => pkg.gameId === selectedGameId && pkg.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const selectedPkg = activePackages.find((pkg) => pkg.id === selectedPackageId);

  useEffect(() => {
    if (activeGameId !== selectedGameId) {
      setSelectedGameId(activeGameId);
      setVerifiedNickname(null);
      setVerificationError(null);
    }
  }, [activeGameId, selectedGameId]);

  useEffect(() => {
    if (activePackages.length && !activePackages.some((pkg) => pkg.id === selectedPackageId)) {
      setSelectedPackageId(activePackages[0].id);
    }
  }, [activePackages, selectedPackageId]);

  const selectGame = (gameId: GameId) => {
    setSelectedGameId(gameId);
    setVerifiedNickname(null);
    setVerificationError(null);
    onSelectGame?.(gameId);
  };

  const handleVerifyPlayer = async () => {
    if (!playerId.trim()) return;
    setIsVerifyingPlayer(true);
    setVerificationError(null);
    setVerifiedNickname(null);
    try {
      const result = await api.validatePlayer(selectedGameId, playerId);
      if (result.valid) setVerifiedNickname(result.playerName || 'Verified account');
      else setVerificationError(result.error || 'We could not find that player ID.');
    } catch {
      setVerificationError('Verification is unavailable right now. Please double-check your ID before paying.');
    } finally {
      setIsVerifyingPlayer(false);
    }
  };

  const handleProceedToCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPkg) return;
    if (!playerId.trim()) {
      document.getElementById('player-id')?.focus();
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      document.getElementById('email')?.focus();
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

  return (
    <div className="pb-28 text-slate-100 sm:pb-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 px-5 py-6 shadow-2xl shadow-slate-950/30 sm:px-8 sm:py-9">
        <div className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_75%_30%,rgba(16,185,129,0.17),transparent_52%)]" />
        <div className="relative max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300">
            <Zap className="h-3.5 w-3.5 fill-current" /> Instant game top-up
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Top up. Get back in the game.</h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">Secure, direct credits for your favourite mobile games — delivered to the player ID you provide.</p>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure checkout</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Usually under 60 seconds</span>
          </div>
        </div>
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-7">
          <section aria-labelledby="game-heading">
            <div className="mb-3 flex items-end justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">Step 1</p><h2 id="game-heading" className="mt-1 text-xl font-bold text-white">Choose your game</h2></div>
              <span className="text-xs text-slate-500">2 games available</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {GAMES.map((game) => {
                const selected = game.id === selectedGameId;
                return <button key={game.id} type="button" onClick={() => selectGame(game.id)} className={`group relative isolate min-h-36 overflow-hidden rounded-2xl border text-left transition ${selected ? 'border-emerald-400 ring-2 ring-emerald-400/30' : 'border-slate-800 hover:border-slate-600'}`}>
                  <img src={game.bannerUrl} alt="" className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${selected ? 'scale-105 opacity-60' : 'opacity-35 group-hover:scale-105 group-hover:opacity-50'}`} />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900/15" />
                  <div className="relative flex h-full min-h-36 flex-col justify-between p-4">
                    <div className="flex items-start justify-between gap-2"><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">{game.publisher}</span>{selected && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-slate-950"><Check className="h-4 w-4 stroke-[3]" /></span>}</div>
                    <div><h3 className="text-lg font-extrabold text-white">{game.name}</h3><p className="mt-0.5 text-xs text-slate-300">{game.currencyName} · Instant delivery</p></div>
                  </div>
                </button>;
              })}
            </div>
          </section>

          <section aria-labelledby="package-heading">
            <div className="mb-3"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">Step 2</p><h2 id="package-heading" className="mt-1 text-xl font-bold text-white">Pick a denomination</h2></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {activePackages.map((pkg) => {
                const selected = pkg.id === selectedPackageId;
                return <button key={pkg.id} type="button" onClick={() => setSelectedPackageId(pkg.id)} className={`relative min-h-40 rounded-2xl border p-3.5 text-left transition sm:p-4 ${selected ? 'border-emerald-400 bg-emerald-400/[0.08] ring-1 ring-emerald-400/40 shadow-lg shadow-emerald-950/30' : 'border-slate-800 bg-slate-900 hover:border-slate-600 hover:bg-slate-800/90'}`}>
                  {pkg.badge && <span className="absolute -top-2 left-3 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-950">{pkg.badge}</span>}
                  {selected && <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-slate-950"><Check className="h-3.5 w-3.5 stroke-[3]" /></span>}
                  <span className="block pt-2 text-xl font-black tracking-tight text-white">{pkg.amount.toLocaleString()} <span className="text-xs font-bold text-slate-400">{currentGame.currencyName === 'Diamonds' ? '♦' : 'CP'}</span></span>
                  <span className={`mt-1 block min-h-5 text-[11px] font-bold ${pkg.bonus ? 'text-emerald-400' : 'text-slate-500'}`}>{pkg.bonus ? `+${pkg.bonus.toLocaleString()} bonus` : 'No bonus included'}</span>
                  <span className="mt-5 block border-t border-slate-800 pt-2 text-base font-black text-white">{naira(pkg.salePriceNgn)}</span>
                </button>;
              })}
            </div>
          </section>

          <form id="checkout-form" onSubmit={handleProceedToCheckout} className="space-y-5">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5" aria-labelledby="player-heading">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">Step 3</p><h2 id="player-heading" className="mt-1 text-lg font-bold text-white">Your {currentGame.playerIdLabel}</h2><p className="mt-1 text-xs leading-5 text-slate-400">Credits go directly to this account. Please check every digit.</p></div><button type="button" onClick={() => setIsHelpOpen(true)} className="shrink-0 rounded-lg bg-slate-800 px-2.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"><CircleHelp className="mr-1 inline h-3.5 w-3.5 text-emerald-400" />Find ID</button></div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row"><input id="player-id" required value={playerId} onChange={(event) => { setPlayerId(event.target.value); setVerifiedNickname(null); setVerificationError(null); }} placeholder={currentGame.playerIdPlaceholder} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" /><button type="button" disabled={!playerId.trim() || isVerifyingPlayer} onClick={handleVerifyPlayer} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-bold text-slate-100 hover:bg-slate-700 disabled:opacity-50">{isVerifyingPlayer ? <RefreshCw className="mx-auto h-4 w-4 animate-spin text-emerald-400" /> : 'Verify ID'}</button></div>
              {verifiedNickname && <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Verified as {verifiedNickname}</p>}
              {verificationError && <p className="mt-3 text-xs font-medium text-amber-300">{verificationError}</p>}
            </section>
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">Step 4</p><h2 className="mt-1 text-lg font-bold text-white">Receipt details</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-300">Email address <span className="text-emerald-400">*</span><input id="email" required type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="you@example.com" className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none" /></label><label className="text-xs font-semibold text-slate-300">Phone <span className="font-normal text-slate-500">(optional)</span><input type="tel" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="080 1234 5678" className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none" /></label></div></section>
            <button type="submit" className="hidden w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-slate-950 transition hover:bg-emerald-300 sm:flex"><LockKeyhole className="h-4 w-4" /> Continue to secure payment <ArrowRight className="h-4 w-4" /></button>
          </form>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-slate-950/20">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">Your order</p>
            {selectedPkg ? <><div className="mt-4 flex gap-3 border-b border-slate-800 pb-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-sm font-black text-emerald-400">{currentGame.name.slice(0, 2).toUpperCase()}</div><div><p className="text-sm font-bold text-white">{currentGame.name}</p><p className="mt-0.5 text-xs text-slate-400">{selectedPkg.amount.toLocaleString()} {currentGame.currencyName}{selectedPkg.bonus ? ` + ${selectedPkg.bonus} bonus` : ''}</p></div></div><div className="space-y-3 py-4 text-xs"><div className="flex justify-between text-slate-400"><span>Player ID</span><span className="max-w-40 truncate font-mono text-slate-200">{playerId || 'Add your ID'}</span></div><div className="flex justify-between text-slate-400"><span>Delivery</span><span className="font-semibold text-emerald-400">Instant</span></div></div><div className="flex items-end justify-between border-t border-slate-800 pt-4"><span className="text-sm font-bold text-slate-300">Total</span><span className="text-2xl font-black text-white">{naira(selectedPkg.salePriceNgn)}</span></div></> : <p className="mt-4 text-sm text-slate-400">Choose a package to see your total.</p>}
          </div>
          <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><div className="flex gap-2.5"><Headphones className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><div><p className="text-xs font-bold text-white">Need help before paying?</p><p className="mt-1 text-[11px] leading-4 text-slate-400">Our support team can help you locate your player ID or track an order.</p></div></div><div className="mt-3 flex items-center gap-3 text-[11px] font-bold text-slate-300"><span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Secure payment</span><span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Fast delivery</span></div></div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-700 bg-slate-950/95 p-3 backdrop-blur sm:hidden"><button type="submit" form="checkout-form" className="flex w-full items-center justify-between rounded-xl bg-emerald-400 px-4 py-3.5 text-slate-950"><span className="text-left"><span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">Total</span><span className="text-lg font-black">{selectedPkg ? naira(selectedPkg.salePriceNgn) : 'Choose a pack'}</span></span><span className="flex items-center gap-1 text-sm font-black">Continue <ChevronRight className="h-5 w-5" /></span></button></div>

      <PlayerIdHelpModal gameId={selectedGameId} isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <CheckoutModal order={pendingOrder} isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onPaymentComplete={(order) => { setIsCheckoutOpen(false); onOrderCreated(order); }} />
    </div>
  );
};
