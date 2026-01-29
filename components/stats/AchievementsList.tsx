
import React, { memo, useMemo } from 'react';
import { Lock, CalendarCheck } from 'lucide-react';
import { ACHIEVEMENTS } from '../../utils/gamification';
import { UnlockedAchievement } from '../../types';

interface AchievementsListProps {
  unlockedItems: UnlockedAchievement[];
}

const AchievementsList: React.FC<AchievementsListProps> = ({ unlockedItems }) => {
    
    // Sort logic: 
    // 1. Unlocked vs Locked
    // 2. Unlocked: Date Descending (Newest first)
    // 3. Locked: Default Order
    const sortedAchievements = useMemo(() => {
        return [...ACHIEVEMENTS].sort((a, b) => {
            const unlockA = unlockedItems.find(u => u.id === a.id);
            const unlockB = unlockedItems.find(u => u.id === b.id);
            
            // Si ambos están desbloqueados, ordenar por fecha (más reciente primero)
            if (unlockA && unlockB) {
                // Manejar Legacy (null) -> ponerlos al final de los desbloqueados
                if (unlockA.unlockedAt && unlockB.unlockedAt) {
                    return unlockB.unlockedAt - unlockA.unlockedAt;
                }
                if (unlockA.unlockedAt && !unlockB.unlockedAt) return -1;
                if (!unlockA.unlockedAt && unlockB.unlockedAt) return 1;
                return 0; // Ambos legacy
            }
            
            if (unlockA && !unlockB) return -1; // A primero
            if (!unlockA && unlockB) return 1;  // B primero
            
            return 0; // Mantener orden original si ambos bloqueados
        });
    }, [unlockedItems]);

    const formatDate = (timestamp: number | null) => {
        if (!timestamp) return 'Legado (Pre-2024)'; // Migrados sin fecha
        return new Date(timestamp).toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
             {sortedAchievements.map((ach) => {
                 const unlockInfo = unlockedItems.find(u => u.id === ach.id);
                 const isUnlocked = !!unlockInfo;
                 
                 return (
                     <div 
                        key={ach.id} 
                        className={`
                            relative p-5 rounded-3xl border transition-all duration-500 flex flex-col gap-4 overflow-hidden group
                            ${isUnlocked 
                                ? 'bg-slate-800/40 border-slate-700/50 hover:border-slate-500/50 hover:bg-slate-800/60 hover:-translate-y-1' 
                                : 'bg-slate-900/20 border-slate-800/50 opacity-50 grayscale hover:opacity-70'
                            }
                        `}
                        style={{
                            boxShadow: isUnlocked ? `0 10px 30px -10px ${ach.color}15` : 'none'
                        }}
                     >
                        {/* Background Effects for Unlocked */}
                        {isUnlocked && (
                            <>
                                <div 
                                    className="absolute inset-0 opacity-[0.05] pointer-events-none group-hover:opacity-[0.1] transition-opacity duration-500"
                                    style={{ background: `radial-gradient(circle at top right, ${ach.color}, transparent 70%)` }}
                                />
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_linear] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none z-10" />
                            </>
                        )}

                        <div className="flex items-start gap-4 relative z-20">
                            {/* Icon Box */}
                            <div 
                                className={`
                                    w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3
                                    ${isUnlocked ? 'shadow-inner' : ''}
                                `}
                                style={{ 
                                    backgroundColor: isUnlocked ? `${ach.color}15` : '#0f172a', 
                                    color: isUnlocked ? ach.color : '#475569',
                                    boxShadow: isUnlocked ? `0 0 15px ${ach.color}25` : 'none',
                                    border: isUnlocked ? `1px solid ${ach.color}30` : '1px solid #1e293b'
                                }}
                            >
                                {isUnlocked ? <ach.icon size={28} className="drop-shadow-sm filter" /> : <Lock size={24} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-black uppercase tracking-wide leading-tight mb-1.5 ${isUnlocked ? 'text-slate-200 group-hover:text-white' : 'text-slate-600'}`}>
                                    {ach.title}
                                </h4>
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed group-hover:text-slate-300 transition-colors line-clamp-3">
                                    {ach.description}
                                </p>
                            </div>
                        </div>

                        {/* Footer: Date & Status */}
                        {isUnlocked && (
                            <div className="mt-auto pt-3 border-t border-slate-700/30 flex justify-between items-center relative z-20">
                                <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <CalendarCheck size={12} className="text-slate-500" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        {formatDate(unlockInfo.unlockedAt)}
                                    </span>
                                </div>
                                <div className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor]" style={{ color: ach.color, backgroundColor: ach.color }}></div>
                            </div>
                        )}
                     </div>
                 );
             })}
        </div>
    );
};

export default memo(AchievementsList);
