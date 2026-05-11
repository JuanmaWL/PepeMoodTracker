
import React from 'react';
import { X, Trophy, Medal } from 'lucide-react';
import AchievementsList from './stats/AchievementsList';
import { UnlockedAchievement } from '../types';
import { ACHIEVEMENTS } from '../utils/gamification';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedItems: UnlockedAchievement[];
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, unlockedItems }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-slate-900/90 border border-slate-700/50 w-full max-w-5xl rounded-[2rem] md:rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[92vh] max-h-[950px] relative ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* BACKGROUND AMBIENT */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]"></div>
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>

        {/* HEADER UNIFICADO: LOGROS */}
        <div className="p-4 md:p-6 border-b border-white/5 flex flex-col gap-4 bg-slate-900/50 relative z-20 backdrop-blur-xl shrink-0">
            <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2.5 md:p-3 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl md:rounded-2xl text-white shadow-lg shadow-amber-500/20 relative group">
                        <Trophy size={24} className="md:size-7 relative z-10" />
                        <div className="absolute inset-0 bg-white/20 blur-lg"></div>
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent filter drop-shadow-sm">
                            <span className="md:hidden">Trofeos</span>
                            <span className="hidden md:block">Sala de Trofeos</span>
                        </h2>
                        <div className="flex items-center gap-2 md:gap-3 mt-1.5 md:mt-2">
                             <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] md:text-[10px] text-amber-300 font-bold uppercase tracking-widest flex items-center gap-1 w-fit">
                                    <Medal size={10} className="md:size-3" />
                                    {unlockedItems.length} / {ACHIEVEMENTS.length}
                                </span>
                                <div className="w-16 md:w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                        style={{ width: `${Math.round((unlockedItems.length / ACHIEVEMENTS.length) * 100)}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-[8px] md:text-[10px] font-black text-amber-500/40 uppercase tracking-tighter">
                                {Math.round((unlockedItems.length / ACHIEVEMENTS.length) * 100)}%
                            </span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2 md:p-3 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10 shrink-0"
                >
                    <X size={20} className="md:size-6" />
                </button>
            </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative z-10 bg-gradient-to-b from-slate-900/0 to-slate-950/50">
           <AchievementsList unlockedItems={unlockedItems} />
        </div>
        
        {/* FOOTER */}
        <div className="p-4 bg-slate-950/80 border-t border-white/5 flex justify-center items-center relative z-20 backdrop-blur-md">
             <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em] opacity-60">
                 "Gotta catch 'em all" - Pepe
             </p>
        </div>

      </div>
    </div>
  );
};

export default AchievementsModal;
