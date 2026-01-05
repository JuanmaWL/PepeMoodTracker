import React, { memo, useState } from 'react';
import { YearData, MoodLevel, DayData } from '../types';
import { MONTHS, MOODS } from '../constants';
import { ChevronDown, ChevronUp, MapPin, CalendarRange } from 'lucide-react';

interface CalendarProps {
  yearData: YearData;
  onDayClick: (dateStr: string) => void;
  currentYear: number;
  highlightedDates: string[];
}

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// Subcomponente Memorizado: Solo se re-renderiza si sus props cambian.
interface DayCellProps {
  day: number;
  monthIndex: number;
  currentYear: number;
  entry: DayData | undefined;
  onClick: (dateStr: string) => void;
  isHighlighted: boolean;
}

const DayCell = memo(({ day, monthIndex, currentYear, entry, onClick, isHighlighted }: DayCellProps) => {
  const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const moodLevel = entry?.level || MoodLevel.None;
  const config = MOODS[moodLevel];
  const hasNote = entry?.note && entry.note.trim().length > 0;
  
  // Calcular si es HOY
  const today = new Date();
  const isToday = 
    today.getDate() === day && 
    today.getMonth() === monthIndex && 
    today.getFullYear() === currentYear;

  // Clases dinámicas
  const isFilled = moodLevel !== MoodLevel.None;

  return (
    <button
      onClick={() => onClick(dateStr)}
      className={`
        aspect-square rounded-md relative group flex items-center justify-center outline-none overflow-hidden
        
        ${/* OPTIMIZACIÓN CRÍTICA: Usamos transición específica en lugar de transition-all para evitar parpadeos negros al redimensionar */ ''}
        transition-[transform,background-color,border-color,box-shadow,opacity] duration-300
        
        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-500
        
        ${/* ESTILO BASE */ ''}
        ${!isFilled ? 'bg-slate-700/30 hover:bg-slate-600/50' : ''}
        
        ${/* ESTILO LEGENDARIO */ ''}
        ${moodLevel === MoodLevel.Legendary ? 'animate-pulse hover:animate-none shadow-[0_0_12px_rgba(34,197,94,0.4)]' : ''}
        
        ${/* ESTILO HIGHLIGHT (BÚSQUEDA) - Prioridad Alta */ ''}
        ${isHighlighted ? 'ring-2 ring-fuchsia-500 shadow-[0_0_15px_#d946ef] z-20 scale-110 !bg-fuchsia-900/30' : ''}

        ${/* ESTILO HOY (Sin registro) - Pulsante "Lléname" */ ''}
        ${isToday && !isFilled && !isHighlighted ? 'border-2 border-dashed border-cyan-400/70 shadow-[0_0_15px_rgba(34,211,238,0.3)] bg-cyan-900/20 animate-pulse' : ''}
        
        ${/* ESTILO HOY (Con registro) - Solo borde sutil */ ''}
        ${isToday && isFilled && !isHighlighted ? 'ring-1 ring-white/80 ring-offset-1 ring-offset-slate-900' : ''}
      `}
      style={{ 
          backgroundColor: isFilled && !isHighlighted ? config.color : undefined,
      }}
      title={`${dateStr}${entry?.note ? ': ' + entry.note : ''}`}
      aria-label={`Día ${day}, Estado: ${isFilled ? config.label : 'Sin registro'}`}
    >
      <span className={`
        text-[10px] md:text-sm font-black transition-colors duration-300 pointer-events-none select-none relative z-10
        ${!isFilled ? 'text-slate-500' : 'text-slate-950/80'}
        ${isToday && !isFilled ? 'text-cyan-200' : ''}
        ${isHighlighted ? '!text-white' : ''}
      `}>
        {day}
      </span>

      {/* Partículas para HOY (si está vacío) */}
      {isToday && !isFilled && (
        <div className="absolute inset-0 pointer-events-none opacity-50">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-400/10 blur-sm"></div>
        </div>
      )}

      {/* Tooltip Hover (Solo Desktop) */}
      <div className="hidden md:block opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-30 border border-slate-700 shadow-2xl transition-opacity">
        {isToday ? "¡HOY!" : `Día ${day}`}
      </div>

      {/* Indicador de Nota (Estilo Esquina High Contrast) */}
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
  const prevEntry = prev.entry;
  const nextEntry = next.entry;
  
  // Comparación optimizada: Incluimos isHighlighted para re-renderizar cuando cambia la búsqueda
  const isSameData = 
    prevEntry?.level === nextEntry?.level && 
    prevEntry?.note === nextEntry?.note &&
    prev.isHighlighted === next.isHighlighted;

  return isSameData;
});

const Calendar: React.FC<CalendarProps> = ({ yearData, onDayClick, currentYear, highlightedDates }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const scrollToMonth = (index: number) => {
    const el = document.getElementById(`month-${index}`);
    if (el) {
        setIsNavOpen(false); // Cerrar automáticamente al seleccionar
        // Ajuste de offset para el header sticky
        const y = el.getBoundingClientRect().top + window.pageYOffset - 100; 
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative">
      
      {/* MOBILE STICKY MONTH NAV (EXPANDABLE HUD) */}
      <div className="md:hidden sticky top-0 z-40 w-full max-w-6xl mx-auto mb-6 px-4">
          <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl transition-all duration-300">
             
             {/* Header / Trigger Button */}
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

             {/* Expandable Grid */}
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

      {/* Main Grid - Updated for bigger cells on Desktop */}
      {/* max-w aumented to 1600px, and grid-cols limited to 3 on XL to ensure big cells */}
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
                {/* Slots vacíos */}
                {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Días Renderizados con Memo */}
                {days.map(d => {
                  const dateStr = `${currentYear}-${String(mIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  return (
                    <DayCell 
                        key={d}
                        day={d}
                        monthIndex={mIndex}
                        currentYear={currentYear}
                        entry={yearData[dateStr]}
                        onClick={onDayClick}
                        isHighlighted={highlightedDates.includes(dateStr)}
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
};

export default Calendar;