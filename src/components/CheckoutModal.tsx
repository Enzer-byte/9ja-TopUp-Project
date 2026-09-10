import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Building2, PhoneCall, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import { Order, PaymentGateway } from '../types';
import { OrderService } from '../services/orderService';

interface CheckoutModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  order,
  isOpen,
  onClose,
  onPaymentComplete,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>(order?.paymentGateway || 'paystack');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer' | 'ussd'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [duplicateWebhookTested, setDuplicateWebhookTested] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handlePayNow = async (isDuplicateTest = false) => {
    setIsProcessing(true);
    setErrorMessage(null);

    const gatewayRef = `${selectedGateway.toUpperCase()}_TX_${Date.now()}`;
    const idempotencyKey = isDuplicateTest
      ? `idemp_test_fixed_key_${order.orderRef}` // Static key to test duplicate idempotency rejection
      : `idemp_${order.orderRef}_${Date.now()}`;

    try {
      const result = await OrderService.handlePaymentWebhook({
        orderId: order.id,
        gatewayRef,
        gateway: selectedGateway,
        idempotencyKey,
      });

      if (isDuplicateTest) {
        setDuplicateWebhookTested(true);
      }

      if (result.order) {
        onPaymentComplete(result.order);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Payment error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Complete Secure Checkout</h3>
              <p className="text-xs text-slate-400">Order Ref: <span className="font-mono text-emerald-400 font-semibold">{order.orderRef}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Order Summary Box */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {order.gameId === 'free_fire' ? 'Free Fire Diamonds' : 'Call of Duty CP'}
              </span>
              <p className="font-bold text-base text-white">{order.packageName}</p>
              <p className="text-xs text-slate-300">
                To: <span className="font-mono text-emerald-400 font-semibold">{order.playerId}</span>
                {order.playerNickname && <span className="text-slate-400 ml-1">({order.playerNickname})</span>}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Due</span>
              <span className="font-black text-xl text-emerald-400">₦{order.amountNgn.toLocaleString()}</span>
            </div>
          </div>

          {/* Gateway Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Select Nigerian Payment Gateway
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedGateway('paystack')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  selectedGateway === 'paystack'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm">Paystack</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded">Recommended</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Cards, Bank, USSD, OPay</p>
                </div>
                {selectedGateway === 'paystack' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedGateway('flutterwave')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  selectedGateway === 'flutterwave'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm">Flutterwave</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Barter, Bank, Card</p>
                </div>
                {selectedGateway === 'flutterwave' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-800/70 p-1 rounded-xl border border-slate-700/60">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-2 text-xs font-medium rounded-lg flex items-center justify-center space-x-1.5 transition ${
                  paymentMethod === 'card'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Debit Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`py-2 px-2 text-xs font-medium rounded-lg flex items-center justify-center space-x-1.5 transition ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Transfer</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('ussd')}
                className={`py-2 px-2 text-xs font-medium rounded-lg flex items-center justify-center space-x-1.5 transition ${
                  paymentMethod === 'ussd'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>USSD</span>
              </button>
            </div>
          </div>

          {/* Payment Details Simulator */}
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/70">
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-700/60">
                  <span>Accepted Cards</span>
                  <span className="font-semibold text-slate-300">Verve • Mastercard • Visa</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 font-mono text-xs text-slate-300 flex items-center justify-between">
                  <span>5399 •••• •••• 9012 (Demo Verve)</span>
                  <span className="text-emerald-400 text-[10px] font-bold">READY</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  In production, this opens the official {selectedGateway === 'paystack' ? 'Paystack' : 'Flutterwave'} secure popup/checkout window.
                </p>
              </div>
            )}

            {paymentMethod === 'bank_transfer' && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Bank Name</span>
                  <span className="font-bold text-white">Wema / Paystack Titan</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/50">
                  <span className="text-slate-400">Account Number</span>
                  <span className="font-mono font-bold text-emerald-400">9912048172</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Account Name</span>
                  <span className="font-bold text-white">NG TopUp / {order.orderRef}</span>
                </div>
              </div>
            )}

            {paymentMethod === 'ussd' && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-300">Dial from your registered mobile number:</p>
                <div className="p-3 bg-slate-900 rounded-xl font-mono text-center text-sm font-bold text-emerald-400">
                  *737*000*9912# (GTBank / Zenith / Access)
                </div>
              </div>
            )}
          </div>

          {/* Idempotency Test Helper */}
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-700/60 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-300 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Phase 2 Webhook Idempotency Test</span>
              </span>
              {duplicateWebhookTested && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
                  Duplicate Safely Blocked
                </span>
              )}
            </div>
            <p className="text-slate-400 text-[11px] mb-2">
              Demonstrates that multiple identical webhook deliveries cannot trigger duplicate top-ups.
            </p>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handlePayNow(true)}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
            >
              Test firing duplicate webhook with fixed key
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handlePayNow(false)}
            disabled={isProcessing}
            className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <span>Pay ₦{order.amountNgn.toLocaleString()}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
