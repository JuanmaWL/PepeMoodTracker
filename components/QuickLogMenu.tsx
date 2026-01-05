import React, { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { MOODS } from '../constants';
import { MoodLevel } from '../types';

interface QuickLogMenuProps {
  isOpen: boolean;
  startPos: { x: number; y: number } | null;
  currentPos: { x: number; y: number } | null;
}

const RADIUS = 75; // Radio del menú aumentado ligeramente
const ITEM_RADIUS = 28; // Radio de los iconos
const CENTER_DEADZONE = 15; // Zona muerta en el centro
const SAFE_MARGIN = 110; // Margen de seguridad para que el menú no se corte (Radius + Item + Padding)

const QuickLogMenu: React.FC<QuickLogMenuProps> = ({ isOpen, startPos, currentPos }) => {
  if (!isOpen || !startPos) return null;

  // 1. CLAMPING LOGIC: Ajustar el centro del menú para que siempre esté visible
  // Si startPos.x está muy cerca del borde, movemos el centro visual del menú
  const menuCenterX = Math.min(Math.max(startPos.x, SAFE_MARGIN), window.innerWidth - SAFE_MARGIN);
  // Mantenemos Y igual (asumimos scroll vertical disponible), pero podríamos clamp también si fuera necesario.
  const menuCenterY = startPos.y; 
  
  const menuCenter = { x: menuCenterX, y: menuCenterY };

  // Los 5 moods ordenados para el arco (De Izquierda a Derecha: Fatal -> Legendario)
  const orderedMoods = [
    MoodLevel.Fatal,
    MoodLevel.Regular,
    MoodLevel.Normal,
    MoodLevel.MoiBiens,
    MoodLevel.Legendary
  ];

  // Calcular selección activa basada en ángulo y distancia
  // NOTA: Usamos menuCenter en lugar de startPos para los cálculos relativos
  const activeSelection = useMemo(() => {
    if (!currentPos) return null;

    const dx = currentPos.x - menuCenter.x;
    const dy = currentPos.y - menuCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Si estamos muy cerca del centro, no seleccionamos nada
    if (distance < CENTER_DEADZONE) return null;

    // 1. DETECCIÓN DE BORRADO (Hacia abajo)
    // Si arrastramos hacia abajo significativamente
    if (dy > 30) {
        return { type: 'DELETE', data: null, color: '#ef4444' };
    }

    // 2. DETECCIÓN DE MOODS (Arco superior)
    
    // Simplificación: Usar distancia euclidiana a los puntos fijos de los iconos
    let closestMood = null;
    let minDist = Number.MAX_VALUE;

    orderedMoods.forEach((mood, index) => {
        const angleDeg = 180 - (index * 45);
        const rad = angleDeg * (Math.PI / 180);
        
        const ix = Math.cos(rad) * RADIUS;
        const iy = -Math.sin(rad) * RADIUS; 

        const distToIcon = Math.sqrt(Math.pow(dx - ix, 2) + Math.pow(dy - iy, 2));
        
        // Umbral de captura magnética (snapping)
        if (distToIcon < minDist) {
            minDist = distToIcon;
            closestMood = mood;
        }
    });

    // Aumentamos el rango de "hit" para que sea fácil
    if (minDist < 50 && closestMood) {
        return { type: 'MOOD', data: closestMood, color: MOODS[closestMood].color };
    }
    
    return null;
  }, [menuCenter, currentPos]);

  // Color del cursor dinámico
  const cursorColor = activeSelection ? activeSelection.color : '#10b981'; // Default Emerald-500
  
  // Detectar si hay offset (si el menú se ha desplazado respecto al dedo)
  const hasOffset = Math.abs(startPos.x - menuCenter.x) > 5;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none select-none">
      
      {/* 1. Dynamic Background Overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] animate-in fade-in duration-200"
        style={{
            // Si hay selección, añadimos un tinte sutil del color seleccionado al fondo
            backgroundImage: activeSelection 
                ? `radial-gradient(circle at ${menuCenter.x}px ${menuCenter.y}px, ${activeSelection.color}30 0%, transparent 50%)`
                : 'none',
            transition: 'background-image 0.3s ease'
        }}
      />

      {/* Radial Menu Container */}
      <div 
        className="absolute w-0 h-0 flex items-center justify-center transition-[left,top] duration-75 ease-out"
        style={{ 
            left: menuCenter.x, 
            top: menuCenter.y 
        }}
      >
        {/* Visual Line connecting Finger to Menu Center (if offset exists) */}
        {hasOffset && (
            <svg className="absolute overflow-visible top-0 left-0" style={{ width: 0, height: 0 }}>
                <line 
                    x1={startPos.x - menuCenter.x} 
                    y1={startPos.y - menuCenter.y} 
                    x2={0} 
                    y2={0} 
                    stroke="rgba(255,255,255,0.2)" 
                    strokeWidth="2" 
                    strokeDasharray="4 4"
                />
                <circle cx={startPos.x - menuCenter.x} cy={startPos.y - menuCenter.y} r="4" fill="rgba(255,255,255,0.3)" />
            </svg>
        )}

        {/* Center Anchor (Menu Center) */}
        <div className="absolute w-12 h-12 bg-white/5 rounded-full border border-white/10 -translate-x-1/2 -translate-y-1/2 animate-ping opacity-30"></div>
        
        {/* CURSOR DOT DINÁMICO (Sigue al dedo real currentPos) */}
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

        {/* Connection Lines & Arc */}
        <svg className="absolute overflow-visible -translate-x-1/2 -translate-y-1/2" style={{ width: 0, height: 0 }}>
             {/* Lines to Moods */}
             {orderedMoods.map((mood, index) => {
                 const angleDeg = 180 - (index * 45);
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
             
             {/* Line to Trash (Down) */}
             <line 
                x1={0} y1={0} x2={0} y2={60}
                stroke={activeSelection?.type === 'DELETE' ? '#ef4444' : 'rgba(255,255,255,0.05)'}
                strokeWidth={activeSelection?.type === 'DELETE' ? 2 : 1}
                strokeDasharray={activeSelection?.type === 'DELETE' ? "0" : "2 4"}
                className="transition-all duration-200"
             />
        </svg>

        {/* --- MOOD ICONS --- */}
        {orderedMoods.map((mood, index) => {
            const angleDeg = 180 - (index * 45);
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
                    {/* Label flotante */}
                    <div className={`
                        absolute -top-8 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border border-slate-700 whitespace-nowrap
                        transition-all duration-200 shadow-xl
                        ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90 pointer-events-none'}
                    `}>
                        {config.label}
                    </div>
                    
                    {/* Particles (Solo si activo) */}
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

                    {/* Circle Image Container */}
                    <div 
                        className={`
                            rounded-full border-2 overflow-hidden bg-white
                            transition-all duration-300
                            ${isActive ? 'shadow-[0_0_25px_rgba(0,0,0,0.5)]' : 'grayscale opacity-70'}
                        `}
                        style={{
                            width: ITEM_RADIUS * 2,
                            height: ITEM_RADIUS * 2,
                            borderColor: config.color,
                            boxShadow: isActive ? `0 0 20px ${config.color}60` : 'none'
                        }}
                    >
                        <img src={config.image} alt={config.label} className="w-full h-full object-cover" />
                    </div>
                </div>
            );
        })}

        {/* --- DELETE ICON (BOTTOM) --- */}
        <div
            className="absolute flex flex-col items-center justify-center transition-all duration-300"
            style={{
                left: 0,
                top: 60, // Hacia abajo
                transform: `translate(-50%, -50%) scale(${activeSelection?.type === 'DELETE' ? 1.4 : 1})`,
                zIndex: 10
            }}
        >
             {/* Particles para Delete */}
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
            
            <div className={`
                absolute -bottom-6 bg-red-900 text-red-100 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-red-700 whitespace-nowrap
                transition-all duration-200
                ${activeSelection?.type === 'DELETE' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
            `}>
                Borrar Día
            </div>
        </div>

      </div>
      
      {/* Helper Text */}
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