
import React, { useMemo } from 'react';
import { Trash2, X } from 'lucide-react';
import { MOODS } from '../constants';
import { MoodLevel } from '../types';

interface QuickLogMenuProps {
  isOpen: boolean;
  startPos: { x: number; y: number } | null;
  currentPos: { x: number; y: number } | null;
}

// Configuración visual
const RADIUS = 110; 
const ITEM_SIZE = 56;
const CENTER_DEADZONE = 20;

// MÁRGENES DE SEGURIDAD (Calculados para que no se corte nada)
// X: 110 (Radio) + 28 (Item) + 20 (Padding) aprox = 160
const SAFE_MARGIN_X = 160; 
// Top: 110 (Radio) + 28 (Item) + 10 (Scale) + 40 (Labels) = 190 aprox
const SAFE_MARGIN_TOP = 190;
// Bottom: 90 (Delete pos) + 30 (Size) + 20 (Padding) = 140 aprox
const SAFE_MARGIN_BOTTOM = 140;

const QuickLogMenu: React.FC<QuickLogMenuProps> = ({ isOpen, startPos, currentPos }) => {
  if (!isOpen || !startPos) return null;

  // CLAMPING INTELIGENTE:
  // Aseguramos que el CENTRO del menú siempre esté en una zona donde quepa todo el arco.
  // Si tocas muy al borde, el menú se desplazará hacia adentro, manteniéndose conectado por la línea.
  
  const menuCenterX = Math.min(Math.max(startPos.x, SAFE_MARGIN_X), window.innerWidth - SAFE_MARGIN_X);
  const menuCenterY = Math.min(Math.max(startPos.y, SAFE_MARGIN_TOP), window.innerHeight - SAFE_MARGIN_BOTTOM);
  
  const menuCenter = { x: menuCenterX, y: menuCenterY };

  // ORDEN CROMÁTICO (Rojo -> Azul -> Naranja -> Amarillo -> Verde -> Morado)
  const orderedMoods = [
    MoodLevel.Rage,      // Rojo
    MoodLevel.Sadge,     // Azul
    MoodLevel.Regular,   // Naranja
    MoodLevel.Normal,    // Amarillo
    MoodLevel.MoiBiens,  // Verde
    MoodLevel.Legendary  // Morado
  ];

  const activeSelection = useMemo(() => {
    if (!currentPos) return null;

    const dx = currentPos.x - menuCenter.x;
    const dy = currentPos.y - menuCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Zona muerta central para evitar selecciones accidentales al inicio
    if (distance < CENTER_DEADZONE) return null;

    // Zona de Borrado (Hacia abajo)
    if (dy > 40 && Math.abs(dx) < 60) {
        return { type: 'DELETE', data: null, color: '#ef4444' };
    }

    let closestMood = null;
    let minDist = Number.MAX_VALUE;

    // Distribuir en un arco de 180 grados (Semicírculo superior)
    const totalSpan = 180;
    const step = totalSpan / (orderedMoods.length - 1);

    orderedMoods.forEach((mood, index) => {
        // 180 (Izquierda) -> 0 (Derecha)
        const angleDeg = 180 - (index * step);
        const rad = angleDeg * (Math.PI / 180);
        
        const ix = Math.cos(rad) * RADIUS;
        const iy = -Math.sin(rad) * RADIUS; 

        const distToIcon = Math.sqrt(Math.pow(dx - ix, 2) + Math.pow(dy - iy, 2));
        
        // Aumentamos el radio de "imán" para facilitar la selección
        if (distToIcon < 60 && distToIcon < minDist) {
            minDist = distToIcon;
            closestMood = mood;
        }
    });

    if (closestMood) {
        return { type: 'MOOD', data: closestMood, color: MOODS[closestMood].color };
    }
    
    return null;
  }, [menuCenter, currentPos]);

  const cursorColor = activeSelection ? activeSelection.color : 'rgba(255,255,255,0.5)'; 
  const step = 180 / (orderedMoods.length - 1);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none select-none overflow-hidden">
      
      {/* 1. Fondo Dinámico (Ambiente) */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px] transition-all duration-300 ease-out"
        style={{
            background: activeSelection 
                ? `radial-gradient(circle at ${menuCenter.x}px ${menuCenter.y}px, ${activeSelection.color}40 0%, ${activeSelection.color}10 40%, rgba(2,6,23,0.8) 100%)`
                : 'radial-gradient(circle at center, rgba(15,23,42,0.4) 0%, rgba(2,6,23,0.8) 100%)'
        }}
      />

      {/* Contenedor relativo a la posición CALCULADA (no la del dedo) */}
      <div 
        className="absolute w-0 h-0"
        style={{ left: menuCenter.x, top: menuCenter.y }}
      >
        
        {/* 2. Guía Visual del Arco (Track) */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-white/5 bg-white/[0.02] pointer-events-none" />
        
        {/* 3. Línea conectora (Drag Line) - Crucial cuando el menú se desplaza por los bordes */}
        {currentPos && (
            <svg className="absolute overflow-visible top-0 left-0 pointer-events-none" style={{ width: 0, height: 0 }}>
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                        <stop offset="100%" stopColor={cursorColor} stopOpacity="0.8" />
                    </linearGradient>
                </defs>
                <line 
                    x1={0} y1={0} 
                    x2={currentPos.x - menuCenter.x} 
                    y2={currentPos.y - menuCenter.y} 
                    stroke="url(#lineGradient)" 
                    strokeWidth="2" 
                    strokeDasharray="4 4"
                    className="animate-[dash_1s_linear_infinite]"
                />
            </svg>
        )}

        {/* 4. Punto Central (Ancla) */}
        <div className="absolute w-14 h-14 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/10 -translate-x-1/2 -translate-y-1/2 shadow-2xl flex items-center justify-center z-40">
            <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${activeSelection ? 'bg-white' : 'bg-slate-500'}`} style={{ backgroundColor: activeSelection ? activeSelection.color : undefined }} />
        </div>

        {/* 5. Iconos de Mood (Arco) */}
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
                    className="absolute flex flex-col items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    style={{
                        left: x,
                        top: y,
                        transform: `translate(-50%, -50%) scale(${isActive ? 1.3 : 1})`,
                        zIndex: isActive ? 50 : 30
                    }}
                >
                    {/* Label Flotante */}
                    <div className={`
                        absolute -top-10 bg-slate-900/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/10 whitespace-nowrap backdrop-blur-xl
                        transition-all duration-200 shadow-xl
                        ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75 pointer-events-none'}
                    `}>
                        {config.label}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/90"></div>
                    </div>
                    
                    {/* Burbuja del Icono */}
                    <div 
                        className={`
                            relative rounded-[1.2rem] overflow-hidden flex items-center justify-center
                            transition-all duration-300 border
                            ${isActive ? 'shadow-[0_0_40px_rgba(0,0,0,0.6)]' : 'shadow-lg'}
                        `}
                        style={{
                            width: ITEM_SIZE,
                            height: ITEM_SIZE,
                            backgroundColor: isActive ? config.color : 'rgba(15, 23, 42, 0.6)',
                            borderColor: isActive ? '#fff' : 'rgba(255, 255, 255, 0.1)',
                            boxShadow: isActive ? `0 0 30px ${config.color}80` : undefined
                        }}
                    >
                        {/* Imagen */}
                        <img 
                            src={config.image} 
                            alt={config.label} 
                            className={`
                                w-full h-full object-cover transition-all duration-300
                                ${isActive ? 'scale-110 rotate-3 brightness-110' : 'scale-90 opacity-80 grayscale-[0.5]'}
                            `} 
                        />
                        
                        {/* Brillo Glassmorphism */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                    </div>
                </div>
            );
        })}

        {/* 6. Zona de Borrado (Abajo) */}
        <div
            className="absolute flex flex-col items-center justify-center transition-all duration-300"
            style={{
                left: 0,
                top: 90, 
                transform: `translate(-50%, -50%) scale(${activeSelection?.type === 'DELETE' ? 1.2 : 1})`,
                zIndex: 30
            }}
        >
             {activeSelection?.type === 'DELETE' && (
                <div className="absolute inset-0 pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
                </div>
            )}

            <div className={`
                w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 backdrop-blur-md
                ${activeSelection?.type === 'DELETE' 
                    ? 'bg-red-500 border-white text-white shadow-[0_0_30px_rgba(239,68,68,0.6)]' 
                    : 'bg-slate-900/40 border-slate-700/50 text-slate-400 hover:bg-slate-800/60'}
            `}>
                {activeSelection?.type === 'DELETE' ? <Trash2 size={24} className="animate-bounce" /> : <X size={24} />}
            </div>
            
            <span className={`
                absolute top-full mt-2 text-[9px] font-black uppercase tracking-widest transition-opacity duration-300
                ${activeSelection?.type === 'DELETE' ? 'text-red-400 opacity-100' : 'text-slate-500 opacity-0'}
            `}>
                Cancelar
            </span>
        </div>

      </div>
      
      {/* Texto de Instrucción (Footer) */}
      <div 
        className="absolute bottom-20 left-0 right-0 text-center pointer-events-none transition-opacity duration-300"
        style={{ opacity: activeSelection ? 1 : 0.6 }}
      >
        <p className="text-white/80 text-sm font-bold uppercase tracking-widest drop-shadow-md">
            {activeSelection 
                ? activeSelection.type === 'DELETE' ? "Soltar para cancelar" : MOODS[activeSelection.data as MoodLevel].label 
                : "Desliza para elegir"}
        </p>
        <p className="text-white/40 text-[10px] font-medium mt-1">
            {activeSelection?.type === 'MOOD' ? MOODS[activeSelection.data as MoodLevel].subLabel : ""}
        </p>
      </div>

    </div>
  );
};

export default QuickLogMenu;
