import React, { memo } from 'react';
import { X } from 'lucide-react';
import { InAppNotification } from '../hooks/useNotifications';
import SoundManager from '../utils/sounds';

interface InAppNotificationBannerProps {
  notification: InAppNotification;
  onDismiss: () => void;
}

const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = memo(({ notification, onDismiss }) => {
  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] w-[92%] max-w-sm bg-slate-900/95 border border-emerald-500/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_40px_rgba(34,197,94,0.2)] rounded-3xl backdrop-blur-xl p-4 flex gap-3.5 items-center animate-in fade-in slide-in-from-top-4 duration-500"
      style={{ contentVisibility: 'auto' }}
    >
      <div className="w-[42px] h-[42px] rounded-2xl bg-slate-950 border border-emerald-500/20 shadow-inner flex items-center justify-center shrink-0 overflow-hidden p-1.5">
        <img
          src="https://sme2zz26xzjq57zw.public.blob.vercel-storage.com/favicon_2.png"
          alt="Pepe"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md">
            Pepe Tracker
          </span>
          <span className="text-[7px] text-slate-500 font-black font-mono">AVISO RECURRENTE</span>
        </div>
        <h4 className="text-xs font-black text-slate-100 uppercase tracking-tight leading-none mt-2 truncate">
          {notification.title}
        </h4>
        <p className="text-[9px] text-slate-300 font-bold leading-relaxed mt-1 uppercase tracking-wide opacity-90">
          {notification.body}
        </p>
      </div>

      <button
        onClick={() => {
          SoundManager.play('click');
          onDismiss();
        }}
        className="absolute top-3.5 right-3.5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl active:scale-90 transition-all border border-white/5"
        title="Cerrar notificación"
        aria-label="Cerrar notificación"
      >
        <X size={12} />
      </button>
    </div>
  );
});

export default InAppNotificationBanner;
