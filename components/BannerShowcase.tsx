import React, { useState, useEffect, useMemo, memo } from 'react';
import { BANNER_SLIDES, PEPE_ASSETS } from '../constants';

interface BannerShowcaseProps {
  currentYear: number;
  ecoMode: boolean;
  isPaused: boolean;
}

const PIXEL_COLORS = [
  '#4ade80',
  '#22c55e',
  '#60a5fa',
  '#818cf8',
  '#c084fc',
  '#f472b6',
  '#fb7185',
  '#fbbf24',
  '#38bdf8'
];

const BannerShowcase: React.FC<BannerShowcaseProps> = memo(({ currentYear, ecoMode, isPaused }) => {
  const [bannerIndex, setBannerIndex] = useState(0);

  const activePixels = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: Math.floor(Math.random() * 19) * 14,
      top: Math.floor(Math.random() * 19) * 14,
      color: PIXEL_COLORS[Math.floor(Math.random() * PIXEL_COLORS.length)],
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4
    }));
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        setBannerIndex(prev => (prev + 1) % BANNER_SLIDES.length);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <header className="mt-8 mb-6 text-center flex flex-col items-center relative w-full px-4">
      <div className="relative group mb-8 mt-4">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] pointer-events-none opacity-80 ${ecoMode ? 'hidden' : ''}`}>
          <div className="absolute inset-0 border-2 border-green-500/30 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute inset-8 border-2 border-emerald-400/40 rounded-full border-dotted animate-[spin_15s_linear_infinite_reverse]"></div>
          <div className="absolute inset-4 bg-green-500/20 blur-[50px] rounded-full animate-pulse"></div>
        </div>

        <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-[3rem] overflow-hidden pepe-float z-10 transition-all duration-500 hover:scale-105 group-hover:shadow-[0_30px_70px_-10px_rgba(34,197,94,0.4)] border-4 border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900">
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.2) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
              imageRendering: 'pixelated',
              maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
            }}
          >
            {!ecoMode && activePixels.map((p) => (
              <div
                key={p.id}
                className="absolute"
                style={{
                  width: '14px',
                  height: '14px',
                  top: `${p.top}px`,
                  left: `${p.left}px`,
                  backgroundColor: p.color,
                  animation: `pixel-breath ${p.duration}s infinite ${p.delay}s`,
                  boxShadow: `0 0 10px ${p.color}`,
                  opacity: 0,
                  willChange: 'transform, opacity'
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0 z-20 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px]"></div>
          {!ecoMode && (
            <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-[scan_3s_linear_infinite] h-full opacity-30"></div>
          )}

          <div className="absolute inset-0 z-10 p-6 flex items-center justify-center">
            {BANNER_SLIDES.map((src, index) => {
              const isFavicon1 = src === PEPE_ASSETS.FAVICON_1;
              const isActive = index === bannerIndex;

              return (
                <img
                  key={src}
                  src={src}
                  alt="Pepe Banner"
                  referrerPolicy="no-referrer"
                  className={`
                    absolute inset-0 w-full h-full object-contain p-6 transition-all duration-1000 ease-in-out
                    ${isActive
                      ? (isFavicon1 ? 'opacity-100 scale-125 blur-0' : 'opacity-100 scale-100 blur-0')
                      : 'opacity-0 scale-90 blur-sm'
                    }
                  `}
                />
              );
            })}
          </div>

          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-30"></div>
        </div>
      </div>

      <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-green-400 via-emerald-300 to-green-600 bg-clip-text text-transparent py-2 px-6 leading-tight animate-shimmer tracking-tighter uppercase text-center drop-shadow-lg">
        PEPE PIXEL YEAR
      </h1>
      <p className="text-slate-400 font-bold tracking-[0.2em] text-[10px] md:text-sm mt-1 italic opacity-90 uppercase text-center max-w-lg mx-auto">
        {currentYear} EDITION
      </p>
    </header>
  );
});

export default BannerShowcase;
