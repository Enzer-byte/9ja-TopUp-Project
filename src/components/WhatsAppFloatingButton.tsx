import React from 'react';
import { MessageSquare } from 'lucide-react';
import { SystemSettings } from '../types';

interface WhatsAppFloatingButtonProps {
  settings: SystemSettings;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({ settings }) => {
  const whatsappUrl = `https://wa.me/${settings.whatsappSupportNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Hello NG TopUp Support, I have a question about my gaming top-up.'
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-3.5 rounded-full shadow-2xl shadow-emerald-500/30 flex items-center space-x-2 transition-transform hover:scale-105"
      title="Chat with WhatsApp Support"
    >
      <MessageSquare className="w-5 h-5 fill-slate-950" />
      <span className="text-xs font-black hidden sm:inline">WhatsApp Help</span>
    </a>
  );
};
