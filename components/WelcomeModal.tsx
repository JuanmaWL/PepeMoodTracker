import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Smile,
  BarChart3,
  CheckCircle2,
  Zap,
  Fingerprint,
  X,
  Sparkles,
  BookOpen,
  Gift
} from 'lucide-react';
import SoundManager from '../utils/sounds';
import { PEPE_ASSETS } from '../constants';
import {
  APP_VERSION,
  RELEASE_NOTES,
  SEEN_VERSION_KEY,
  TUTORIAL_KEY
} from '../utils/changelog';

export type WelcomeTab = 'guide' | 'changelog';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: WelcomeTab;
  hasUnseenVersion?: boolean;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'guide',
  hasUnseenVersion = false
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [activeTab, setActiveTab] = useState<WelcomeTab>(initialTab);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab);
    setDontShowAgain(localStorage.getItem(TUTORIAL_KEY) === 'true');
  }, [isOpen, initialTab]);

  const handleClose = () => {
    SoundManager.play('click');
    if (dontShowAgain) {
      localStorage.setItem(TUTORIAL_KEY, 'true');
    } else {
      localStorage.removeItem(TUTORIAL_KEY);
    }
    localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION);
    onClose();
  };

  const handleCheckbox = () => {
    SoundManager.play('pop');
    setDontShowAgain((prev) => !prev);
  };

  const handleSwitchTab = (tab: WelcomeTab) => {
    if (tab === activeTab) return;
    SoundManager.play('pop');
    setActiveTab(tab);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/15 rounded-full blur-[80px] animate-pulse"
          style={{ animationDuration: '4s' }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/15 rounded-full blur-[80px] animate-pulse"
          style={{ animationDuration: '5s', animationDelay: '1s' }}
        ></div>
      </div>

      <div
        className="bg-slate-900/90 border border-white/10 w-full max-w-lg rounded-[2rem] shadow-[0_0_80px_rgba(34,197,94,0.15)] overflow-hidden relative flex flex-col max-h-[90vh] ring-1 ring-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-24 bg-gradient-to-b from-green-500/10 to-transparent flex items-center justify-center shrink-0">
          <div className="w-16 h-16 bg-slate-900 rounded-full border-4 border-slate-800 shadow-2xl flex items-center justify-center relative z-10 mt-5">
            <img
              src={PEPE_ASSETS.OK}
              alt="Pepe Lore Keeper"
              referrerPolicy="no-referrer"
              className="w-11 h-11 object-contain drop-shadow-lg"
            />
            <div className="absolute -bottom-1.5 -right-1.5 bg-green-500 text-slate-900 p-0.5 rounded-full border-4 border-slate-900">
              <CheckCircle2 size={14} strokeWidth={3} />
            </div>
          </div>
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-800/70 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors border border-white/10"
            aria-label="Cerrar guía"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 md:px-7 pt-4 pb-5 relative z-10 overflow-y-auto custom-scrollbar">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-0.5 bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent">
              Pepe&apos;s Lore Keeper
            </h2>
            <p className="text-slate-400 text-xs font-medium tabular-nums">
              Versión v{APP_VERSION} · Manual rápido y registro de cambios
            </p>
          </div>

          <div
            className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-2xl mb-5"
            role="tablist"
            aria-label="Secciones de bienvenida"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'guide'}
              onClick={() => handleSwitchTab('guide')}
              className={`min-h-[44px] rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'bg-slate-800 text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen size={15} />
              <span>Guía Rápida</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'changelog'}
              onClick={() => handleSwitchTab('changelog')}
              className={`min-h-[44px] rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'changelog'
                  ? 'bg-emerald-500/15 text-emerald-300 shadow-sm border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gift size={15} />
              <span>
                Novedades{hasUnseenVersion ? ' · Nuevo' : ''}
              </span>
            </button>
          </div>

          {activeTab === 'guide' ? (
            <div className="space-y-3 mb-6">
              <div className="relative flex flex-col p-4 rounded-2xl bg-slate-800/45 border border-white/5">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-white text-xs font-black uppercase tracking-wide">
                        1. Elige un día
                      </h4>
                      <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider inline-flex items-center gap-1 whitespace-nowrap">
                        <Zap size={11} className="text-amber-400" />
                        Pro Tip
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Toca cualquier casilla del calendario para abrir el editor completo o pulsa &laquo;Registrar Hoy&raquo;.
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-start gap-2.5">
                  <div className="p-1.5 bg-amber-500/15 rounded-lg text-amber-400 shrink-0 mt-0.5">
                    <Fingerprint size={14} />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <span className="text-amber-300 font-bold uppercase">Speedrun:</span> Mantén pulsado cualquier día para abrir el menú radial y puntuar en 1 segundo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-800/45 border border-white/5">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
                  <Smile size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-white text-xs font-black uppercase tracking-wide mb-1">
                    2. Define tu Vibe y Lore
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Elige estado (de Rage a Legendario), añade notas diarias y usa{' '}
                    <span className="text-purple-300 font-bold inline-flex items-center gap-1">
                      <Sparkles size={11} /> Pepe Magic
                    </span>{' '}
                    para crear memes a medida.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-800/45 border border-white/5">
                <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-400 shrink-0">
                  <BarChart3 size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-white text-xs font-black uppercase tracking-wide mb-1">
                    3. Cápsula, Wrapped y Tribunal
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Consulta estadísticas, logros, recuerdos en &laquo;Un día como hoy&raquo; y descarga tu tarjeta Pepe Wrapped desde el menú inferior.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {RELEASE_NOTES.map((release) => (
                <div
                  key={release.version}
                  className="p-4 rounded-2xl bg-slate-800/45 border border-emerald-500/20 space-y-3"
                >
                  <div className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-2.5">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400 tabular-nums">
                        Versión {release.version}
                      </p>
                      <h4 className="text-sm font-black text-white mt-0.5">{release.title}</h4>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
                      {release.dateLabel}
                    </span>
                  </div>

                  <ul className="space-y-2.5">
                    {release.highlights.map((item) => (
                      <li key={item.label} className="text-left">
                        <p className="text-xs font-extrabold text-slate-100">{item.label}</p>
                        <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{item.detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="w-full min-h-[46px] py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black uppercase tracking-[0.16em] text-xs rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(34,197,94,0.4)] active:scale-98 mb-2"
          >
            ¡Entendido, let&apos;s go!
          </button>

          <button
            type="button"
            onClick={handleCheckbox}
            className="flex items-center justify-center gap-2.5 text-slate-400 hover:text-slate-200 transition-colors mx-auto w-full min-h-[44px]"
          >
            <div
              className={`w-4 h-4 rounded border-2 border-slate-600 flex items-center justify-center transition-all ${
                dontShowAgain ? 'bg-green-500 border-green-500' : ''
              }`}
            >
              {dontShowAgain && <CheckCircle2 size={12} className="text-slate-900" strokeWidth={3} />}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider select-none">
              No volver a mostrar guía inicial
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
