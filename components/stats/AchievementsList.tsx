
import React, { memo } from 'react';
import { Lock, Trophy } from 'lucide-react';
import { ACHIEVEMENTS } from '../../utils/gamification';

interface AchievementsListProps {
  unlockedIds: string[];
}

const AchievementsList: React.FC<AchievementsListProps> = ({ unlockedIds }) => {
    // SORTING LOGIC: Unlocked first
    const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
        const aUnlocked = unlockedIds.includes(a.id);
        const bUnlocked = unlockedIds.includes(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0; // Maintain original order otherwise
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
             {sortedAchievements.map((ach) => {
                 const isUnlocked = unlockedIds.includes(ach.id);
                 const particles = isUnlocked ? [...Array(4)].map((_, i) => ({
                    top: Math.random() * 80 + 10 + '%',
                    left: Math.random() * 80 + 10 + '%',
                    delay: Math.random() * 2 + 's',
                    duration: Math.random() * 3 + 2 + 's'
                 })) : [];

                 return (
                     <div 
                        key={ach.id} 
                        className={`
                            relative p-5 rounded-3xl border transition-all duration-500 flex items-start gap-4 overflow-hidden group
                            ${isUnlocked 
                                ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-500/50 hover:shadow-2xl hover:-translate-y-1' 
                                : 'bg-slate-900/40 border-slate-800 opacity-50 grayscale hover:opacity-70'
                            }
                        `}
                        style={{
                            boxShadow: isUnlocked ? `0 4px 20px -5px ${ach.color}20` : 'none'
                        }}
                     >
                        {isUnlocked && (
                            <>
                                <div 
                                    className="absolute inset-0 opacity-[0.08] pointer-events-none group-hover:opacity-[0.15] transition-opacity duration-500"
                                    style={{ background: `radial-gradient(circle at top right, ${ach.color}, transparent 80%)` }}
                                />
                                {particles.map((p, i) => (
                                    <div 
                                        key={i}
                                        className="absolute w-1 h-1 rounded-full animate-pulse opacity-40 pointer-events-none"
                                        style={{
                                            backgroundColor: ach.color,
                                            top: p.top,
                                            left: p.left,
                                            animationDuration: p.duration,
                                            animationDelay: p.delay,
                                            boxShadow: `0 0 4px ${ach.color}`
                                        }}
                                    />
                                ))}
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none z-10" />
                            </>
                        )}

                        <div 
                            className={`
                                p-3 rounded-2xl shrink-0 transition-all duration-500 group-hover:scale-110 relative z-20
                                ${isUnlocked ? 'shadow-inner' : ''}
                            `}
                            style={{ 
                                backgroundColor: isUnlocked ? `${ach.color}15` : '#1e293b', 
                                color: isUnlocked ? ach.color : '#64748b',
                                boxShadow: isUnlocked ? `0 0 15px ${ach.color}30` : 'none'
                            }}
                        >
                            {isUnlocked ? <ach.icon size={26} className="drop-shadow-sm filter" /> : <Lock size={26} />}
                            {isUnlocked && <div className="absolute inset-0 rounded-2xl opacity-20 blur-md animate-pulse" style={{ backgroundColor: ach.color }}></div>}
                        </div>

                        <div className="flex-1 relative z-20">
                            <h4 className={`text-sm font-black uppercase tracking-wide mb-1 leading-tight ${isUnlocked ? 'text-slate-100 group-hover:text-white' : 'text-slate-600'}`}>
                                {ach.title}
                            </h4>
                            <p className="text-[10px] text-slate-400/80 font-medium leading-relaxed group-hover:text-slate-300 transition-colors">
                                {ach.description}
                            </p>
                            {isUnlocked && (
                                <div className="mt-3 inline-flex items-center gap-1.5 bg-slate-950/30 px-2 py-1 rounded-lg border border-slate-700/50">
                                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ach.color }}></div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: ach.color }}>Desbloqueado</span>
                                </div>
                            )}
                        </div>
                     </div>
                 );
             })}
        </div>
    );
};

export default memo(AchievementsList);
