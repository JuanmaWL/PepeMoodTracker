
import React, { useState, useEffect } from 'react';
import { X, Calendar, Smile, BarChart3, CheckCircle2 } from 'lucide-react';
import SoundManager from '../utils/sounds';
import { PEPE_ASSETS } from '../constants';

const TUTORIAL_KEY = 'pepe_tutorial_seen_v1';

const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(TUTORIAL_KEY);
    if (!hasSeen) {
      // Pequeño delay para que la animación de entrada sea suave tras cargar la app
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const handleClose = () => {
    SoundManager.play('click');
    if (dontShowAgain) {
      localStorage.setItem(TUTORIAL_KEY, 'true');
    }
    setIsOpen(false);
  };

  const handleCheckbox = () => {
    SoundManager.play('pop');
    setDontShowAgain(!dontShowAgain);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-green-500/30 w-full max-w-lg rounded-[2rem] shadow-[0_0_50px_rgba(34,197,94,0.15)] overflow-hidden relative flex flex-col">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/20 blur-[50px] rounded-full pointer-events-none" />

        <div className="p-6 md:p-8 relative z-10">
          
          <div className="flex flex-col items-center text-center mb-6">
             <div className="w-20 h-20 bg-slate-800 rounded-full border-2 border-green-500/50 flex items-center justify-center mb-4 shadow-lg shadow-green-500/20 relative">
                <img src={PEPE_ASSETS.OK} alt="Pepe" className="w-14 h-14 object-contain" />
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-slate-900 p-1.5 rounded-full border-2 border-slate-900">
                    <CheckCircle2 size={16} />
                </div>
             </div>
             <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">
               Bienvenido al Pixel Year
             </h2>
             <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
               Tu diario visual de estados de ánimo. Registra cada día para descubrir el patrón de tu año.
             </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                    <Calendar size={20} />
                </div>
                <div className="text-left">
                    <h4 className="text-white text-xs font-black uppercase tracking-wide mb-0.5">1. Elige un día</h4>
                    <p className="text-slate-400 text-xs">Toca cualquier casilla del calendario para abrir el registro.</p>
                </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                    <Smile size={20} />
                </div>
                <div className="text-left">
                    <h4 className="text-white text-xs font-black uppercase tracking-wide mb-0.5">2. Define tu Vibe</h4>
                    <p className="text-slate-400 text-xs">Selecciona cómo te sientes. Cada color representa una emoción.</p>
                </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 shrink-0">
                    <BarChart3 size={20} />
                </div>
                <div className="text-left">
                    <h4 className="text-white text-xs font-black uppercase tracking-wide mb-0.5">3. Analiza tu Lore</h4>
                    <p className="text-slate-400 text-xs">Consulta estadísticas, mapas de calor y deja que la IA juzgue tu año.</p>
                </div>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-lg shadow-green-900/40 active:scale-95 mb-4"
          >
            ¡Entendido, let's go!
          </button>

          <button 
            onClick={handleCheckbox}
            className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 transition-colors mx-auto group"
          >
             <div className={`w-4 h-4 rounded border border-slate-600 flex items-center justify-center transition-colors ${dontShowAgain ? 'bg-green-500 border-green-500' : 'group-hover:border-slate-400'}`}>
                {dontShowAgain && <CheckCircle2 size={12} className="text-slate-900" />}
             </div>
             <span className="text-[10px] font-bold uppercase tracking-wider">No volver a mostrar este tutorial</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
