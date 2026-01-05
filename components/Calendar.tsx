
import React, { memo, useRef, useCallback } from 'react';
import { YearData, MoodLevel } from '../types';
import { MONTHS, MOODS } from '../constants';
import { ChevronDown, ChevronUp, MapPin, CalendarRange } from 'lucide-react';

interface CalendarProps {
  yearData: YearData;
  onDayClick: (dateStr: string) => void;
  onDayLongPress: (dateStr: string, x: number, y: number) => void;
  currentYear: number;
  highlightedDates: string[];
}

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// --- SUBCOMPONENTE DAYCELL OPTIMIZADO ---
// Recibe primitivos en lugar de objetos complejos para facilitar la comparación de React.memo
interface DayCellProps {
  day: number;
  monthIndex: number; // 0-11
  currentYear: number;
  level: MoodLevel; // Primitivo: Número
  hasNote: boolean; // Primitivo: Booleano
  isHighlighted: boolean;
  onClick: (dateStr: string) => void;
  onLongPress: (dateStr: string, x: number, y: number) => void;
}

const DayCell = memo(({ 
  day, 
  monthIndex, 
  currentYear, 
  level, 
  hasNote, 
  isHighlighted, 
  onClick, 
  onLongPress 
}: DayCellProps) => {
  
  // Reconstruimos dateStr solo cuando hace falta, o podríamos pasarlo como prop si queremos micro-optimizar más,
  // pero esto es muy rápido.
  const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  const config = MOODS[level];
  const isFilled = level !== MoodLevel.None;
  
  // Calcular si es HOY
  // Usamos new Date() dentro, pero como el componente está memoizado, no se recalcula constantemente.
  const today = new Date();
  const isToday = 
    today.getDate() === day && 
    today.getMonth() === monthIndex && 
    today.getFullYear() === currentYear;

  // Refs para gestión de gestos
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressTriggered = useRef(false);
  const startCoord = useRef({ x: 0, y: 0 });

  // --- GESTIÓN DE EVENTOS TÁCTILES UNIFICADA ---
  
  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // Si es click derecho, ignorar
    if ('button' in e && (e as React.MouseEvent).button !== 0) return;

    isLongPressTriggered.current = false;
    
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }
    
    startCoord.current = { x: clientX, y: clientY };

    // Iniciamos el timer para Long Press (500ms)
    timerRef.current = setTimeout(() => {
        isLongPressTriggered.current = true;
        // Feedback háptico nativo si es posible
        if (navigator.vibrate) navigator.vibrate(50);
        onLongPress(dateStr, startCoord.current.x, startCoord.current.y);
    }, 500);
  }, [dateStr, onLongPress]);

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // Si ya se disparó o no hay timer, no hacemos nada
    if (!timerRef.current || isLongPressTriggered.current) return;

    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    const moveX = Math.abs(clientX - startCoord.current.x);
    const moveY = Math.abs(clientY - startCoord.current.y);

    // CRÍTICO: Si el usuario mueve el dedo más de 15px, asumimos que quiere hacer SCROLL.
    // Cancelamos el long press inmediatamente.
    if (moveX > 15 || moveY > 15) {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }
  }, []);

  const handleEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // Limpiar timer siempre al soltar o cancelar (scroll)
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }

    // Si NO fue un long press (fue un tap corto)
    if (!isLongPressTriggered.current) {
        // Ejecutamos el click normal
        // IMPORTANTE: Evitamos el preventDefault aquí para que los clicks nativos funcionen bien,
        // pero gestionamos la lógica.
        // Solo ejecutamos lógica adicional si es un evento de terminación válido y no una cancelación
        if (e.type === 'mouseup' || e.type === 'touchend') {
           // Delegamos en onClick nativo del botón o llamada directa:
        }
    } else {
        // Si FUE long press, prevenimos que el navegador lance un evento 'click' tardío
        if (e.cancelable && e.type !== 'touchcancel') e.preventDefault();
    }
  }, []);

  const handleActualClick = (e: React.MouseEvent) => {
      // Esta función se ejecuta con el evento 'click' nativo de React/HTML
      if (!isLongPressTriggered.current) {
          onClick(dateStr);
      }
  };

  return (
    <button
      // Eventos Táctiles
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd} // CRUCIAL: Manejar interrupción por scroll nativo
      // Eventos Ratón
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd} // Si saca el ratón, cancelamos
      // Click final
      onClick={handleActualClick}
      onContextMenu={(e) => e.preventDefault()}
      
      // CRÍTICO: 'touch-action: pan-y' permite al navegador hacer scroll vertical 
      // aunque el dedo empiece sobre este botón. 'touch-none' bloqueaba el scroll.
      className={`
        aspect-square rounded-md relative group flex items-center justify-center outline-none overflow-hidden select-none
        
        transition-[transform,background-color,border-color,box-shadow,opacity] duration-300
        
        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-500
        
        ${!isFilled ? 'bg-slate-700/30 hover:bg-slate-600/50' : ''}
        
        ${level === MoodLevel.Legendary ? 'animate-pulse hover:animate-none shadow-[0_0_12px_rgba(34,197,94,0.4)]' : ''}
        
        ${isHighlighted ? 'ring-2 ring-fuchsia-500 shadow-[0_0_15px_#d946ef] z-20 scale-110 !bg-fuchsia-900/30' : ''}

        ${isToday && !isFilled && !isHighlighted ? 'border-2 border-dashed border-cyan-400/70 shadow-[0_0_15px_rgba(34,211,238,0.3)] bg-cyan-900/20 animate-pulse' : ''}
        
        ${isToday && isFilled && !isHighlighted ? 'ring-1 ring-white/80 ring-offset-1 ring-offset-slate-900' : ''}
        
        active:scale-95
      `}
      style={{ 
          backgroundColor: isFilled && !isHighlighted ? config.color : undefined,
          // Optimizaciones CSS para móviles - FORZAR PAN-Y AQUÍ
          touchAction: 'pan-y', 
          WebkitTapHighlightColor: 'transparent',
          WebkitUserSelect: 'none',
          userSelect: 'none'
      }}
      aria-label={`Día ${day}, Estado: ${isFilled ? config.label : 'Sin registro'}`}
    >
      {/* Indicador Visual Long Press (Círculo que se expande) */}
      <div className="absolute inset-0 bg-indigo-500/30 scale-0 transition-transform duration-500 ease-out origin-center group-active:scale-125 rounded-full pointer-events-none z-0" />

      <span className={`
        text-[10px] md:text-sm font-black transition-colors duration-300 pointer-events-none select-none relative z-10
        ${!isFilled ? 'text-slate-500' : 'text-slate-950/80'}
        ${isToday && !isFilled ? 'text-cyan-200' : ''}
        ${isHighlighted ? '!text-white' : ''}
      `}>
        {day}
      </span>

      {isToday && !isFilled && (
        <div className="absolute inset-0 pointer-events-none opacity-50">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-400/10 blur-sm"></div>
        </div>
      )}

      {/* Tooltip Hover (Solo Desktop) */}
      <div className="hidden md:block opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-30 border border-slate-700 shadow-2xl transition-opacity">
        {isToday ? "¡HOY!" : `Día ${day}`}
      </div>

      {hasNote && (
        <div className={`
            absolute top-0 right-0
            w-3 h-3 md:w-3 md:h-3
            bg-white
            border-l-2 border-b-2 border-slate-950
            rounded-bl-md
            z-20 
            pointer-events-none
        `} />
      )}
    </button>
  );
}, (prev, next) => {
  // Función de comparación personalizada y estricta para React.memo
  // Solo re-renderizar si cambian los datos visuales esenciales
  return (
    prev.level === next.level &&
    prev.hasNote === next.hasNote &&
    prev.isHighlighted === next.isHighlighted &&
    prev.currentYear === next.currentYear &&
    prev.monthIndex === next.monthIndex && 
    prev.day === next.day
    // Nota: No comparamos las funciones onClick/onLongPress porque asumimos que son estables 
    // o que no queremos re-renderizar solo porque la función se recreó en el padre.
  );
});

// --- COMPONENTE PRINCIPAL CALENDAR ---
// Memoizado completamente para que los re-renders de App (por el menú radial) no le afecten
const Calendar: React.FC<CalendarProps> = memo(({ yearData, onDayClick, onDayLongPress, currentYear, highlightedDates }) => {
  const [isNavOpen, setIsNavOpen] = React.useState(false);
  
  const scrollToMonth = (index: number) => {
    const el = document.getElementById(`month-${index}`);
    if (el) {
        setIsNavOpen(false); 
        const y = el.getBoundingClientRect().top + window.pageYOffset - 100; 
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative">
      
      {/* MOBILE STICKY MONTH NAV */}
      <div className="md:hidden sticky top-0 z-40 w-full max-w-6xl mx-auto mb-6 px-4">
          <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl transition-all duration-300">
             <button 
                onClick={() => setIsNavOpen(!isNavOpen)}
                className="w-full flex items-center justify-between px-5 py-3 text-slate-300 hover:bg-white/5 transition-colors active:bg-white/10"
             >
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 transition-transform duration-300 ${isNavOpen ? 'rotate-180' : ''}`}>
                       <MapPin size={16} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">
                        {isNavOpen ? "Seleccionar Destino" : "Saltar a Mes..."}
                    </span>
                </div>
                <div className="text-slate-500">
                    {isNavOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
             </button>

             <div className={`
                overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out
                ${isNavOpen ? 'max-h-[400px] opacity-100 border-t border-slate-800' : 'max-h-0 opacity-0'}
             `}>
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/50">
                    {MONTHS.map((m, i) => (
                        <button
                            key={m}
                            onClick={() => scrollToMonth(i)}
                            className="
                                py-3 px-2 rounded-xl 
                                bg-slate-800 hover:bg-indigo-600 active:bg-indigo-500 
                                border border-slate-700 hover:border-indigo-400
                                text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white
                                transition-all shadow-sm
                            "
                        >
                            {m.substring(0, 3)}
                        </button>
                    ))}
                </div>
                <div className="bg-slate-900/80 py-1 flex justify-center border-t border-slate-800">
                     <span className="text-[8px] text-slate-600 uppercase tracking-[0.3em] font-bold flex items-center gap-1">
                        <CalendarRange size={8} /> Navegación Rápida
                     </span>
                </div>
             </div>
          </div>
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 pb-32">
        {MONTHS.map((monthName, mIndex) => {
          const daysInMonth = new Date(currentYear, mIndex + 1, 0).getDate();
          const firstDayOfMonth = new Date(currentYear, mIndex, 1).getDay();
          const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
          const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

          return (
            <div 
                key={monthName} 
                id={`month-${mIndex}`}
                className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-lg hover:border-slate-500/50 transition-all duration-300 scroll-mt-32"
            >
              <h3 className="text-slate-300 font-black text-sm uppercase tracking-[0.2em] mb-4 text-center">
                {monthName}
              </h3>
              
              <div className="grid grid-cols-7 gap-2 mb-2">
                {WEEK_DAYS.map(wd => (
                  <div key={wd} className="text-[10px] font-black text-slate-500 text-center uppercase opacity-80">
                    {wd}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {days.map(d => {
                  const dateStr = `${currentYear}-${String(mIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const entry = yearData[dateStr];
                  // EXTRAEMOS LOS DATOS AQUÍ
                  // Pasamos primitivos al hijo para que la comparación de props sea trivial y rapidísima.
                  const level = entry?.level || MoodLevel.None;
                  const hasNote = !!(entry?.note && entry.note.trim().length > 0);
                  const isHighlighted = highlightedDates.includes(dateStr);

                  return (
                    <DayCell 
                        key={d}
                        day={d}
                        monthIndex={mIndex}
                        currentYear={currentYear}
                        level={level}
                        hasNote={hasNote}
                        isHighlighted={isHighlighted}
                        onClick={onDayClick}
                        onLongPress={onDayLongPress}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default Calendar;
