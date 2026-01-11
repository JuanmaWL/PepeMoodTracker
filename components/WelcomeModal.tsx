
import React, { useState, useEffect } from 'react';
import { Calendar, Smile, BarChart3, CheckCircle2, Zap, Fingerprint, X, Sparkles } from 'lucide-react';
import SoundManager from '../utils/sounds';
import { PEPE_ASSETS } from '../constants';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_KEY = 'pepe_tutorial_seen_v1';

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(TUTORIAL_KEY);
    if (hasSeen === 'true') {
        setDontShowAgain(true);
    }
  }, []);

  const handleClose = () => {
    SoundManager.play('click');
    if (dontShowAgain) {
      localStorage.setItem(TUTORIAL_KEY, 'true');
    } else {
      localStorage.removeItem(TUTORIAL_KEY);
    }
    onClose();
  };

  const handleCheckbox = () => {
    SoundManager.play('pop');
    setDontShowAgain(!dontShowAgain);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500">
      
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
      </div>

      <div className="bg-slate-900/80 border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_80px_rgba(34,197,94,0.15)] overflow-hidden relative flex flex-col max-h-[90vh] ring-1 ring-white/5">
        
        {/* Header Decorative */}
        <div className="relative h-28 bg-gradient-to-b from-green-500/10 to-transparent flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="w-20 h-20 bg-slate-900 rounded-full border-4 border-slate-800 shadow-2xl flex items-center justify-center relative z-10 mt-6 transform hover:scale-105 transition-transform duration-500 group">
                <img src={PEPE_ASSETS.OK} alt="Pepe" className="w-14 h-14 object-contain drop-shadow-lg group-hover:rotate-6 transition-transform" />
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-slate-900 p-1 rounded-full border-4 border-slate-900 animate-bounce">
                    <CheckCircle2 size={16} strokeWidth={3} />
                </div>
            </div>
            <button 
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5"
            >
                <X size={20} />
            </button>
        </div>

        <div className="p-6 md:p-8 pt-6 relative z-10 overflow-y-auto custom-scrollbar">
          
          <div className="text-center mb-6">
             <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1 bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent filter drop-shadow-sm">
               Pepe's Lore Keeper
             </h2>
             <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-xs mx-auto">
               Sistema de gestión de vibes. Edición Legendaria.
             </p>
          </div>

          <div className="space-y-3 mb-8">
            
            {/* Step 1: Selección (Con el Tip integrado) */}
            <div className="relative group flex flex-col p-4 rounded-3xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-all duration-300">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
                        <Calendar size={22} />
                    </div>
                    <div className="text-left flex-1">
                        <h4 className="text-white text-xs font-black uppercase tracking-wide mb-1 flex items-center gap-2">
                            1. Elige un día
                        </h4>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-[80%]">
                            Toca cualquier casilla del calendario para abrir el editor completo.
                        </p>
                    </div>
                </div>

                {/* PRO TIP BADGE - Static */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-yellow-500/30 rounded-lg shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                    <Zap size={10} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                    <span className="text-[9px] font-black text-yellow-200 uppercase tracking-wider">Pro Tip</span>
                </div>

                {/* Tip Info - Always Visible */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-start gap-3">
                    <div className="p-1.5 bg-yellow-500/20 rounded-md text-yellow-400 shrink-0 mt-0.5">
                        <Fingerprint size={14} />
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                        <span className="text-yellow-400 font-bold uppercase">Speedrun:</span> Mantén pulsado (Long Press) cualquier día para abrir el menú radial y registrar tu mood en 1 segundo sin entrar al editor.
                    </p>
                </div>
            </div>

            {/* Step 2: Definición */}
            <div className="group flex items-start gap-4 p-4 rounded-3xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-all duration-300">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Smile size={22} />
                </div>
                <div className="text-left">
                    <h4 className="text-white text-xs font-black uppercase tracking-wide mb-1 flex items-center gap-2">
                        2. Define tu Vibe
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        Elige tu estado (de Rage a Legendario). Añade notas y usa <span className="text-purple-400 font-bold"><Sparkles size={10} className="inline" /> Pepe Magic</span> para generar memes.
                    </p>
                </div>
            </div>

            {/* Step 3: Análisis */}
            <div className="group flex items-start gap-4 p-4 rounded-3xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-all duration-300">
                <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-400 shrink-0 group-hover:scale-110 transition-transform">
                    <BarChart3 size={22} />
                </div>
                <div className="text-left">
                    <h4 className="text-white text-xs font-black uppercase tracking-wide mb-1 flex items-center gap-2">
                        3. El Tribunal
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        Consulta estadísticas, desbloquea logros ocultos y deja que el Oráculo juzgue tus decisiones de vida.
                    </p>
                </div>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(34,197,94,0.4)] hover:shadow-[0_15px_40px_-10px_rgba(34,197,94,0.5)] active:scale-95 mb-4 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 skew-y-12 transition-transform duration-500 ease-out pointer-events-none"></div>
            <span className="relative z-10">¡Entendido, let's go!</span>
          </button>

          <button 
            onClick={handleCheckbox}
            className="flex items-center justify-center gap-3 text-slate-500 hover:text-slate-300 transition-colors mx-auto group w-full py-2"
          >
             <div className={`w-4 h-4 rounded border-2 border-slate-700 flex items-center justify-center transition-all duration-300 ${dontShowAgain ? 'bg-green-500 border-green-500' : 'group-hover:border-slate-500'}`}>
                {dontShowAgain && <CheckCircle2 size={12} className="text-slate-900 animate-in zoom-in" strokeWidth={3} />}
             </div>
             <span className="text-[10px] font-bold uppercase tracking-wider select-none">No volver a mostrar</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
