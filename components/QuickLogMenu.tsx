
import React, { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { MOODS } from '../constants';
import { MoodLevel } from '../types';

interface QuickLogMenuProps {
  isOpen: boolean;
  startPos: { x: number; y: number } | null;
  currentPos: { x: number; y: number } | null;
}

const RADIUS = 85; // Radio aumentado para 6 elementos
const ITEM_RADIUS = 24; 
const CENTER_DEADZONE = 15;
const SAFE_MARGIN = 120;

const QuickLogMenu: React.FC<QuickLogMenuProps> = ({ isOpen, startPos, currentPos }) => {
  if (!isOpen || !startPos) return null;

  const menuCenterX = Math.min(Math.max(startPos.x, SAFE_MARGIN), window.innerWidth - SAFE_MARGIN);
  const menuCenterY = startPos.y; 
  
  const menuCenter = { x: menuCenterX, y: menuCenterY };

  // Los 6 moods ordenados para el arco (De Izquierda a Derecha)
  const orderedMoods = [
    MoodLevel.Rage,
    MoodLevel.Sadge,
    MoodLevel.Regular,
    MoodLevel.Normal,
    MoodLevel.MoiBiens,
    MoodLevel.Legendary
  ];

  const activeSelection = useMemo(() => {
    if (!currentPos) return null;

    const dx = currentPos.x - menuCenter.x;
    const dy = currentPos.y - menuCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < CENTER_DEADZONE) return null;

    if (dy > 30) {
        return { type: 'DELETE', data: null, color: '#ef4444' };
    }

    let closestMood = null;
    let minDist = Number.MAX_VALUE;

    // Distribuir 6 elementos en 180 grados (aprox 30-36 grados de separación)
    // Angulos: 180 (Izquierda) a 0 (Derecha)
    const totalSpan = 180;
    const step = totalSpan / (orderedMoods.length - 1);

    orderedMoods.forEach((mood, index) => {
        const angleDeg = 180 - (index * step);
        const rad = angleDeg * (Math.PI / 180);
        
        const ix = Math.cos(rad) * RADIUS;
        const iy = -Math.sin(rad) * RADIUS; 

        const distToIcon = Math.sqrt(Math.pow(dx - ix, 2) + Math.pow(dy - iy, 2));
        
        if (distToIcon < minDist) {
            minDist = distToIcon;
            closestMood = mood;
        }
    });

    if (minDist < 50 && closestMood) {
        return { type: 'MOOD', data: closestMood, color: MOODS[closestMood].color };
    }
    
    return null;
  }, [menuCenter, currentPos]);

  const cursorColor = activeSelection ? activeSelection.color : '#10b981'; 
  const hasOffset = Math.abs(startPos.x - menuCenter.x) > 5;
  const step = 180 / (orderedMoods.length - 1);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none select-none">
      
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] animate-in fade-in duration-200"
        style={{
            backgroundImage: activeSelection 
                ? `radial-gradient(circle at ${menuCenter.x}px ${menuCenter.y}px, ${activeSelection.color}30 0%, transparent 50%)`
                : 'none',
            transition: 'background-image 0.3s ease'
        }}
      />

      <div 
        className="absolute w-0 h-0 flex items-center justify-center transition-[left,top] duration-75 ease-out"
        style={{ left: menuCenter.x, top: menuCenter.y }}
      >
        {hasOffset && (
            <svg className="absolute overflow-visible top-0 left-0" style={{ width: 0, height: 0 }}>
                <line 
                    x1={startPos.x - menuCenter.x} 
                    y1={startPos.y - menuCenter.y} 
                    x2={0} y2={0} 
                    stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4"
                />
                <circle cx={startPos.x - menuCenter.x} cy={startPos.y - menuCenter.y} r="4" fill="rgba(255,255,255,0.3)" />
            </svg>
        )}

        <div className="absolute w-12 h-12 bg-white/5 rounded-full border border-white/10 -translate-x-1/2 -translate-y-1/2 animate-ping opacity-30"></div>
        
        <div className="absolute w-5 h-5 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-out z-50 flex items-center justify-center"
             style={{
                 transform: currentPos ? `translate(calc(-50% + ${(currentPos.x - menuCenter.x)}px), calc(-50% + ${(currentPos.y - menuCenter.y)}px))` : 'translate(-50%, -50%)',
                 backgroundColor: cursorColor,
                 boxShadow: `0 0 15px ${cursorColor}`,
                 scale: activeSelection ? '1.2' : '1'
             }}
        >
             <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
        </div>

        <svg className="absolute overflow-visible -translate-x-1/2 -translate-y-1/2" style={{ width: 0, height: 0 }}>
             {orderedMoods.map((mood, index) => {
                 const angleDeg = 180 - (index * step);
                 const rad = angleDeg * (Math.PI / 180);
                 const ix = Math.cos(rad) * RADIUS;
                 const iy = -Math.sin(rad) * RADIUS;
                 const isActive = activeSelection?.type === 'MOOD' && activeSelection.data === mood;
                 
                 return (
                    <line 
                        key={`line-${mood}`}
                        x1={0} y1={0} x2={ix} y2={iy} 
                        stroke={isActive ? MOODS[mood].color : 'rgba(255,255,255,0.05)'}
                        strokeWidth={isActive ? 2 : 1}
                        strokeDasharray={isActive ? "0" : "2 4"}
                        className="transition-all duration-200"
                    />
                 );
             })}
             
             <line 
                x1={0} y1={0} x2={0} y2={60}
                stroke={activeSelection?.type === 'DELETE' ? '#ef4444' : 'rgba(255,255,255,0.05)'}
                strokeWidth={activeSelection?.type === 'DELETE' ? 2 : 1}
                strokeDasharray={activeSelection?.type === 'DELETE' ? "0" : "2 4"}
                className="transition-all duration-200"
             />
        </svg>

        {orderedMoods.map((mood, index) => {
            const angleDeg = 180 - (index * step);
            const rad = angleDeg * (Math.PI / 180);
            const x = Math.cos(rad) * RADIUS;
            const y = -Math.sin(rad) * RADIUS;

            const isActive = activeSelection?.type === 'MOOD' && activeSelection.data === mood;
            const config = MOODS[mood];

            return (
                <div
                    key={mood}
                    className="absolute flex flex-col items-center justify-center transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    style={{
                        left: x,
                        top: y,
                        transform: `translate(-50%, -50%) scale(${isActive ? 1.35 : 1})`,
                        zIndex: isActive ? 20 : 10
                    }}
                >
                    <div className={`
                        absolute -top-8 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border border-slate-700 whitespace-nowrap
                        transition-all duration-200 shadow-xl
                        ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90 pointer-events-none'}
                    `}>
                        {config.label}
                    </div>
                    
                    {isActive && (
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} 
                                     className="absolute w-1 h-1 rounded-full animate-ping opacity-75"
                                     style={{
                                         backgroundColor: config.color,
                                         top: '50%',
                                         left: '50%',
                                         transform: `rotate(${i * 60}deg) translate(${ITEM_RADIUS + 5}px)`,
                                         animationDuration: '1s',
                                         animationDelay: `${i * 0.1}s`
                                     }} 
                                />
                            ))}
                        </div>
                    )}

                    <div 
                        className={`
                            rounded-full border-2 overflow-hidden bg-slate-900
                            transition-all duration-300
                            ${isActive ? 'shadow-[0_0_25px_rgba(0,0,0,0.5)]' : 'opacity-70'}
                        `}
                        style={{
                            width: ITEM_RADIUS * 2,
                            height: ITEM_RADIUS * 2,
                            borderColor: config.color,
                            boxShadow: isActive 
                                ? `0 0 20px ${config.color}60` 
                                : `inset 0 0 10px ${config.color}40` // Glow interior sutil en reposo
                        }}
                    >
                        <img src={config.image} alt={config.label} className="w-full h-full object-cover" />
                    </div>
                </div>
            );
        })}

        <div
            className="absolute flex flex-col items-center justify-center transition-all duration-300"
            style={{
                left: 0,
                top: 60, 
                transform: `translate(-50%, -50%) scale(${activeSelection?.type === 'DELETE' ? 1.4 : 1})`,
                zIndex: 10
            }}
        >
             {activeSelection?.type === 'DELETE' && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} 
                                className="absolute w-1 h-1 rounded-full bg-red-500 animate-ping opacity-75"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    transform: `rotate(${i * 45}deg) translate(25px)`,
                                    animationDuration: '0.6s',
                                    animationDelay: `${i * 0.05}s`
                                }} 
                        />
                    ))}
                </div>
            )}

            <div className={`
                w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${activeSelection?.type === 'DELETE' 
                    ? 'bg-red-500 border-red-400 text-white shadow-[0_0_25px_rgba(239,68,68,0.6)]' 
                    : 'bg-slate-900/80 border-slate-700 text-slate-500'}
            `}>
                <Trash2 size={20} className={activeSelection?.type === 'DELETE' ? 'animate-bounce' : ''} />
            </div>
        </div>

      </div>
      
      <div 
        className="absolute text-white/50 text-xs font-bold uppercase tracking-widest text-center w-full pointer-events-none transition-opacity duration-300"
        style={{ 
            top: (menuCenter.y || 0) + 110, 
            left: 0,
            opacity: activeSelection ? 0.8 : 0.4
        }}
      >
        {activeSelection 
            ? activeSelection.type === 'DELETE' ? "¡Suelta para borrar!" : `Seleccionando: ${MOODS[activeSelection.data as MoodLevel].label}` 
            : "Arrastra al estado"}
      </div>

    </div>
  );
};

export default QuickLogMenu;
