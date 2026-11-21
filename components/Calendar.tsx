import React, { memo, useRef, useCallback, useMemo, useEffect, useState } from 'react';
import { YearData, MoodLevel } from '../types';
import { MONTHS, MOODS } from '../constants';
import { ChevronDown, ChevronUp, MapPin, CalendarRange, LocateFixed, ArrowUp } from 'lucide-react';
import SoundManager from '../utils/sounds';

interface CalendarProps {
  yearData: YearData;
  onDayClick: (dateStr: string) => void;
  onDayLongPress: (dateStr: string, x: number, y: number) => void;
  currentYear: number;
  realCurrentYear?: number;
  onReturnToCurrentYear?: () => void;
  highlightedDates: string[];
  ecoMode?: boolean;
  deferInitialScroll?: boolean;
}

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// --- SUBCOMPONENTE DAYCELL OPTIMIZADO ---
interface DayCellProps {
  day: number;
  monthIndex: number;
  currentYear: number;
  level: MoodLevel;
  hasNote: boolean;
  isHighlighted: boolean;
  todayStr: string;
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
  todayStr,
  onClick,
  onLongPress
}: DayCellProps) => {
  const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const config = MOODS[level];
  const isFilled = level !== MoodLevel.None;
  const isToday = todayStr === dateStr;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressTriggered = useRef(false);
  const startCoord = useRef({ x: 0, y: 0 });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if ('button' in e && (e as React.MouseEvent).button !== 0) return;

    isLongPressTriggered.current = false;

    let clientX: number;
    let clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    startCoord.current = { x: clientX, y: clientY };

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
      onLongPress(dateStr, startCoord.current.x, startCoord.current.y);
    }, 500);
  }, [dateStr, onLongPress]);

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!timerRef.current || isLongPressTriggered.current) return;

    let clientX: number;
    let clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    if (Math.abs(clientX - startCoord.current.x) > 15 || Math.abs(clientY - startCoord.current.y) > 15) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isLongPressTriggered.current) {
      if (e.cancelable && e.type !== 'touchcancel') e.preventDefault();
    }
  }, []);

  const handleActualClick = useCallback(() => {
    if (!isLongPressTriggered.current) {
      onClick(dateStr);
    }
  }, [onClick, dateStr]);

  return (
    <button
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onClick={handleActualClick}
      onContextMenu={(e) => e.preventDefault()}
      className={`
        aspect-square rounded-md relative group flex items-center justify-center outline-none overflow-hidden select-none
        transition-[transform,background-color,border-color,box-shadow,opacity] duration-300
        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-500
        ${!isFilled ? 'bg-slate-700/30 hover:bg-slate-600/50' : ''}
        ${level === MoodLevel.Legendary ? 'shadow-[0_0_15px_rgba(168,85,247,0.6)] border border-purple-400/50' : ''}
        ${isHighlighted ? 'ring-2 ring-fuchsia-500 shadow-[0_0_15px_#d946ef] z-20 scale-110 !bg-fuchsia-900/30' : ''}
        ${isToday && !isFilled && !isHighlighted ? 'border-2 border-dashed border-cyan-400/70 shadow-[0_0_15px_rgba(34,211,238,0.3)] bg-cyan-900/20 animate-pulse' : ''}
        ${isToday && isFilled && !isHighlighted ? 'ring-1 ring-white/80 ring-offset-1 ring-offset-slate-900' : ''}
        active:scale-95
      `}
      style={{
        backgroundColor: isFilled && !isHighlighted ? config.color : undefined,
        touchAction: 'pan-y',
        WebkitTapHighlightColor: 'transparent',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
      aria-label={`Día ${day}, Estado: ${isFilled ? config.label : 'Sin registro'}`}
    >
      <div className="absolute inset-0 bg-indigo-500/30 scale-0 transition-transform duration-500 ease-out origin-center group-active:scale-125 rounded-full pointer-events-none z-0" />
      <span
        className={`
          text-[10px] md:text-sm font-black transition-colors duration-300 pointer-events-none select-none relative z-10 tabular-nums
          ${!isFilled ? 'text-slate-500' : 'text-slate-950/80'}
          ${isToday && !isFilled ? 'text-cyan-200' : ''}
          ${isHighlighted ? '!text-white' : ''}
        `}
      >
        {day}
      </span>
      {isToday && !isFilled && (
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-400/10 blur-sm"></div>
        </div>
      )}
      <div className="hidden md:block opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-30 border border-slate-700 shadow-2xl transition-opacity">
        {isToday ? '¡HOY!' : `Día ${day}`}
      </div>

      {hasNote && (
        <div
          className={`
            absolute top-0 right-0
            w-2 h-2 bg-white/40 rounded-bl-[4px] backdrop-blur-[0.5px]
            md:w-3.5 md:h-3.5 md:bg-gradient-to-bl md:from-white/95 md:via-white/40 md:to-white/10
            md:backdrop-blur-sm md:border-b-[1.5px] md:border-l-[1.5px] md:border-white/80
            md:rounded-bl-lg md:shadow-[-1px_1px_3px_rgba(0,0,0,0.15)]
            z-20 pointer-events-none
          `}
        />
      )}
    </button>
  );
}, (prev, next) => (
  prev.level === next.level &&
  prev.hasNote === next.hasNote &&
  prev.isHighlighted === next.isHighlighted &&
  prev.currentYear === next.currentYear &&
  prev.monthIndex === next.monthIndex &&
  prev.day === next.day &&
  prev.todayStr === next.todayStr
));

// --- SUBCOMPONENTE MONTHCARD MEMOIZADO (Aísla renders por mes) ---
interface MonthCardProps {
  monthName: string;
  monthIndex: number;
  currentYear: number;
  isCurrentMonth: boolean;
  yearData: YearData;
  highlightedSet: Set<string>;
  todayStr: string;
  onDayClick: (dateStr: string) => void;
  onDayLongPress: (dateStr: string, x: number, y: number) => void;
}

const MonthCard = memo(({
  monthName,
  monthIndex,
  currentYear,
  isCurrentMonth,
  yearData,
  highlightedSet,
  todayStr,
  onDayClick,
  onDayLongPress
}: MonthCardProps) => {
  const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, monthIndex, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);
  const monthPrefix = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-`;

  return (
    <div
      id={`month-${monthIndex}`}
      className={`
        bg-slate-800/40 backdrop-blur-sm rounded-2xl p-5 border shadow-lg transition-all duration-300 scroll-mt-24 md:scroll-mt-10
        ${isCurrentMonth
          ? 'border-emerald-500/40 ring-1 ring-emerald-400/20 shadow-[0_0_25px_-5px_rgba(34,197,94,0.18)]'
          : 'border-slate-700/50 hover:border-slate-500/50'}
      `}
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <h3 className={`font-black text-sm uppercase tracking-[0.2em] text-center ${isCurrentMonth ? 'text-emerald-300' : 'text-slate-300'}`}>
          {monthName}
        </h3>
        {isCurrentMonth && (
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/90">
            · Hoy
          </span>
        )}
      </div>

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
          const dateStr = `${monthPrefix}${String(d).padStart(2, '0')}`;
          const entry = yearData[dateStr];
          const level = entry?.level || MoodLevel.None;
          const hasNote = !!(entry?.note && entry.note.trim().length > 0);
          const isHighlighted = highlightedSet.has(dateStr);

          return (
            <DayCell
              key={d}
              day={d}
              monthIndex={monthIndex}
              currentYear={currentYear}
              level={level}
              hasNote={hasNote}
              isHighlighted={isHighlighted}
              todayStr={todayStr}
              onClick={onDayClick}
              onLongPress={onDayLongPress}
            />
          );
        })}
      </div>
    </div>
  );
}, (prev, next) => {
  if (
    prev.monthIndex !== next.monthIndex ||
    prev.currentYear !== next.currentYear ||
    prev.isCurrentMonth !== next.isCurrentMonth ||
    prev.todayStr !== next.todayStr ||
    prev.onDayClick !== next.onDayClick ||
    prev.onDayLongPress !== next.onDayLongPress
  ) {
    return false;
  }

  const daysInMonth = new Date(next.currentYear, next.monthIndex + 1, 0).getDate();
  const prefix = `${next.currentYear}-${String(next.monthIndex + 1).padStart(2, '0')}-`;

  if (prev.highlightedSet !== next.highlightedSet) {
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${prefix}${String(d).padStart(2, '0')}`;
      if (prev.highlightedSet.has(key) !== next.highlightedSet.has(key)) return false;
    }
  }

  if (prev.yearData !== next.yearData) {
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${prefix}${String(d).padStart(2, '0')}`;
      const pEntry = prev.yearData[key];
      const nEntry = next.yearData[key];
      if (pEntry?.level !== nEntry?.level || pEntry?.note !== nEntry?.note) {
        return false;
      }
    }
  }

  return true;
});

const Calendar: React.FC<CalendarProps> = memo(({
  yearData,
  onDayClick,
  onDayLongPress,
  currentYear,
  realCurrentYear = new Date().getFullYear(),
  onReturnToCurrentYear,
  highlightedDates,
  ecoMode = false,
  deferInitialScroll = false
}) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isTodayMonthOutOfView, setIsTodayMonthOutOfView] = useState(false);
  const hasAutoScrolledRef = useRef(false);

  const highlightedSet = useMemo(() => new Set(highlightedDates), [highlightedDates]);
  const isViewingCurrentYear = currentYear === realCurrentYear;

  const { todayStr, todayMonthIndex } = useMemo(() => {
    const today = new Date();
    return {
      todayStr: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
      todayMonthIndex: today.getMonth()
    };
  }, []);

  const scrollToMonth = useCallback((index: number, useSmooth: boolean = true) => {
    const el = document.getElementById(`month-${index}`);
    if (!el) return;

    setIsNavOpen(false);
    const isMobile = window.innerWidth < 768;
    const stickyOffset = isMobile ? 88 : 32;
    const y = el.getBoundingClientRect().top + window.scrollY - stickyOffset;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = !useSmooth || ecoMode || prefersReducedMotion ? 'auto' : 'smooth';

    window.scrollTo({ top: Math.max(0, y), behavior });
  }, [ecoMode]);

  const handleJumpToToday = useCallback(() => {
    SoundManager.play('click');
    scrollToMonth(todayMonthIndex, true);
  }, [scrollToMonth, todayMonthIndex]);

  // Auto-scroll suave al mes actual al abrir la aplicación en el año en curso
  useEffect(() => {
    if (hasAutoScrolledRef.current || deferInitialScroll || !isViewingCurrentYear) return;

    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToMonth(todayMonthIndex, true);
        hasAutoScrolledRef.current = true;
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [deferInitialScroll, isViewingCurrentYear, scrollToMonth, todayMonthIndex]);

  // Observador para mostrar botón rápido "Ir a Hoy" cuando el mes actual sale de pantalla
  useEffect(() => {
    if (!isViewingCurrentYear) {
      setIsTodayMonthOutOfView(false);
      return;
    }
    const todayEl = document.getElementById(`month-${todayMonthIndex}`);
    if (!todayEl || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTodayMonthOutOfView(!entry.isIntersecting);
      },
      { threshold: 0.12 }
    );

    observer.observe(todayEl);
    return () => observer.disconnect();
  }, [isViewingCurrentYear, todayMonthIndex]);

  return (
    <div className="w-full relative">
      {/* BARRA STICKY MÓVIL: Saltar a Mes + Acceso directo a Hoy */}
      <div className="md:hidden sticky top-2 z-40 w-full max-w-6xl mx-auto mb-6 px-4">
        <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900/85 backdrop-blur-xl border border-slate-700/50 shadow-2xl transition-all duration-300">
          <div className="flex items-stretch">
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="flex-1 min-h-[48px] flex items-center justify-between px-4 py-2.5 text-slate-300 hover:bg-white/5 transition-colors active:bg-white/10"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 transition-transform duration-300 shrink-0 ${isNavOpen ? 'rotate-180' : ''}`}>
                  <MapPin size={16} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest truncate">
                  {isNavOpen ? 'Seleccionar Mes' : 'Saltar a Mes...'}
                </span>
              </div>
              <div className="text-slate-500 shrink-0 ml-2">
                {isNavOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            <div className="w-px bg-slate-800 my-2" />

            <button
              onClick={() => {
                if (isViewingCurrentYear) {
                  handleJumpToToday();
                } else {
                  SoundManager.play('click');
                  onReturnToCurrentYear?.();
                }
              }}
              className="min-h-[48px] px-4 py-2.5 flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 active:scale-95 transition-all whitespace-nowrap shrink-0"
              title={isViewingCurrentYear ? 'Ir al mes actual' : `Volver a ${realCurrentYear}`}
              aria-label={isViewingCurrentYear ? 'Ir al mes de hoy' : `Volver a ${realCurrentYear}`}
            >
              <LocateFixed size={16} />
              <span className="text-xs font-black uppercase tracking-widest">
                {isViewingCurrentYear ? 'Hoy' : realCurrentYear}
              </span>
            </button>
          </div>

          <div
            className={`
              overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out
              ${isNavOpen ? 'max-h-[400px] opacity-100 border-t border-slate-800' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/50">
              {MONTHS.map((m, i) => {
                const isCurrent = isViewingCurrentYear && i === todayMonthIndex;
                return (
                  <button
                    key={m}
                    onClick={() => {
                      SoundManager.play('click');
                      scrollToMonth(i, true);
                    }}
                    className={`
                      min-h-[44px] py-2.5 px-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all shadow-sm
                      ${isCurrent
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                        : 'bg-slate-800 hover:bg-indigo-600 active:bg-indigo-500 border-slate-700 hover:border-indigo-400 text-slate-400 hover:text-white'}
                    `}
                  >
                    {m.substring(0, 3)}
                  </button>
                );
              })}
            </div>
            <div className="bg-slate-900/80 py-1 flex justify-center border-t border-slate-800">
              <span className="text-[8px] text-slate-600 uppercase tracking-[0.3em] font-bold flex items-center gap-1">
                <CalendarRange size={8} /> Navegación Rápida
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTÓN FLOTANTE CONTEXTUAL PARA VOLVER A HOY (Desktop y Móvil al hacer scroll) */}
      {isTodayMonthOutOfView && isViewingCurrentYear && (
        <button
          onClick={handleJumpToToday}
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-28 right-4 md:right-8 z-30 min-h-[44px] px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl flex items-center gap-2 transition-all duration-200 active:scale-95 animate-in fade-in slide-in-from-bottom-4 whitespace-nowrap shrink-0"
          title="Volver al mes actual"
          aria-label="Volver al mes de hoy"
        >
          <LocateFixed size={16} />
          <span className="text-[11px] font-black uppercase tracking-widest">Volver a Hoy</span>
          <ArrowUp size={14} className="opacity-70" />
        </button>
      )}

      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 pb-32">
        {MONTHS.map((monthName, mIndex) => (
          <MonthCard
            key={monthName}
            monthName={monthName}
            monthIndex={mIndex}
            currentYear={currentYear}
            isCurrentMonth={isViewingCurrentYear && mIndex === todayMonthIndex}
            yearData={yearData}
            highlightedSet={highlightedSet}
            todayStr={todayStr}
            onDayClick={onDayClick}
            onDayLongPress={onDayLongPress}
          />
        ))}
      </div>
    </div>
  );
});

export default Calendar;
