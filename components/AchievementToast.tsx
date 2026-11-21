import React, { useMemo, memo } from 'react';
import { Trophy } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementToastProps {
  achievement: Achievement;
  isClosing: boolean;
  onOpenAchievements: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = memo(({ achievement, isClosing, onOpenAchievements }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        angle: i * 18,
        distance: 80 + Math.random() * 60,
        duration: 0.6 + Math.random() * 0.8
      })),
    [achievement.id]
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-8 pointer-events-none px-4">
      <div
        className="w-full max-w-sm relative pointer-events-auto cursor-pointer"
        style={{
          animation: isClosing
            ? 'implodeOut 0.7s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards'
            : 'bounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onClick={() => {
          if (!isClosing) {
            onOpenAchievements();
          }
        }}
      >
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div
            className="w-[500px] h-[500px] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.2),transparent)] rounded-full"
            style={{
              animation: 'god-rays 10s linear infinite',
              maskImage: 'radial-gradient(closest-side, black 40%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(closest-side, black 40%, transparent 100%)'
            }}
          />
        </div>

        {!isClosing && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible w-full h-full pointer-events-none">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute w-2 h-2 rounded-full animate-ping"
                style={{
                  backgroundColor: p.id % 2 === 0 ? achievement.color : '#fff',
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${p.angle}deg) translate(${p.distance}px)`,
                  animationDuration: `${p.duration}s`,
                  animationDelay: '0.1s'
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 p-[3px] rounded-3xl overflow-hidden group">
          <div
            className="absolute inset-[-50%] animate-[spin-border_3s_linear_infinite]"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, ${achievement.color} 90deg, transparent 180deg, ${achievement.color} 270deg, transparent 360deg)`
            }}
          />

          <div
            className="relative bg-slate-900 rounded-[22px] overflow-hidden backdrop-blur-3xl"
            style={
              {
                animation: 'pulse-shadow 2s infinite ease-in-out',
                '--toast-color-20': `${achievement.color}20`,
                '--toast-color-40': `${achievement.color}40`,
                '--toast-color-80': `${achievement.color}80`
              } as React.CSSProperties
            }
          >
            <div className="absolute inset-0 bg-slate-900/90 z-0" />
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')] z-0" />

            <div className="relative z-10 p-5 flex items-center gap-5">
              <div className="shrink-0 relative">
                <div className="absolute inset-0 blur-2xl opacity-60 animate-pulse" style={{ backgroundColor: achievement.color }}></div>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center relative shadow-lg border border-white/20 overflow-hidden"
                  style={{ backgroundColor: `${achievement.color}20` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  <achievement.icon
                    size={36}
                    style={{ color: achievement.color }}
                    className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-[spin_3s_ease-in-out_infinite_alternate]"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="px-2 py-0.5 rounded-md bg-yellow-500/20 border border-yellow-500/40 flex items-center gap-1 shadow-sm">
                    <Trophy size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">Logro Desbloqueado</span>
                  </div>
                </div>
                <h4 className="text-xl font-black text-white leading-tight mb-1 drop-shadow-md tracking-tight">
                  {achievement.title}
                </h4>
                <p className="text-xs text-slate-300 font-medium leading-relaxed opacity-90 line-clamp-2">
                  {achievement.description}
                </p>
              </div>
            </div>

            <div
              className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/30 to-transparent z-20"
              style={{ animation: 'shimmer-fast 2s infinite linear' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default AchievementToast;
