import React from 'react';
import { X, HelpCircle, CheckCircle2, Copy } from 'lucide-react';
import { GameId } from '../types';

interface PlayerIdHelpModalProps {
  gameId: GameId;
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerIdHelpModal: React.FC<PlayerIdHelpModalProps> = ({ gameId, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl text-slate-100">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">
              {gameId === 'free_fire' ? 'How to find Free Fire UID' : 'How to find CODM Player ID'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {gameId === 'free_fire' ? (
            <>
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-slate-200">Launch Free Fire</p>
                    <p className="text-xs text-slate-400">Open the game on your Android or iOS device.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-slate-200">Tap your Profile Avatar</p>
                    <p className="text-xs text-slate-400">Click on your character banner in the top-left corner of the main lobby screen.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-slate-200">Copy your 9 or 10-digit UID</p>
                    <p className="text-xs text-slate-400">Your UID is displayed right below your gamer handle. Tap the small copy icon next to it.</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-300">
                  <span className="font-bold">UID Example:</span> <code>1982740129</code>. Diamonds will credit instantly to this account.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-slate-200">Open Settings in COD: Mobile</p>
                    <p className="text-xs text-slate-400">Tap the Gear icon in the top right menu of the main game lobby.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-slate-200">Navigate to "LEGAL AND PRIVACY"</p>
                    <p className="text-xs text-slate-400">Scroll the left-hand navigation tabs down to the bottom and select "LEGAL AND PRIVACY".</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-slate-200">Copy your Player ID (OpenID)</p>
                    <p className="text-xs text-slate-400">Your Player ID is listed under your account information. Tap the Copy button.</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-300">
                  <span className="font-bold">Player ID Example:</span> <code>6749201938402910</code>. CP is credited automatically via official B2B wholesale route.
                </p>
              </div>
            </>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-sm border border-slate-700 transition"
          >
            Got it, return to Top-Up
          </button>
        </div>
      </div>
    </div>
  );
};
