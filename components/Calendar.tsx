import React from 'react';
import { YearData, MoodLevel } from '../types';
import { MONTHS, MOODS } from '../constants';

interface CalendarProps {
  yearData: YearData;
  onDayClick: (dateStr: string) => void;
  currentYear: number;
}

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const Calendar: React.FC<CalendarProps> = ({ yearData, onDayClick, currentYear }) => {
  
  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 pb-32">
      {MONTHS.map((monthName, mIndex) => {
        const daysInMonth = new Date(currentYear, mIndex + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, mIndex, 1).getDay();
        // Convert JS day (0=Sun, 1=Mon...) to Spanish week (0=Mon, 6=Sun)
        const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
          <div key={monthName} className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-lg hover:border-slate-500/50 transition-all duration-300">
            <h3 className="text-slate-300 font-black text-sm uppercase tracking-[0.2em] mb-4 text-center">
              {monthName}
            </h3>
            
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {WEEK_DAYS.map(wd => (
                <div key={wd} className="text-[10px] font-black text-slate-500 text-center uppercase opacity-80">
                  {wd}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* Empty slots for month start alignment */}
              {Array.from({ length: adjustedFirstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {days.map(d => {
                const dateStr = `${currentYear}-${String(mIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const entry = yearData[dateStr];
                const moodLevel = entry?.level || MoodLevel.None;
                const config = MOODS[moodLevel];
                const hasNote = entry?.note && entry.note.trim().length > 0;

                return (
                  <button
                    key={d}
                    onClick={() => onDayClick(dateStr)}
                    className={`
                      aspect-square rounded-md relative group transition-all duration-300 flex items-center justify-center
                      ${moodLevel === MoodLevel.None ? 'bg-slate-700/30 hover:bg-slate-600/50' : ''}
                      ${moodLevel === MoodLevel.Legendary ? 'animate-pulse hover:animate-none shadow-[0_0_12px_rgba(34,197,94,0.4)]' : ''}
                    `}
                    style={{ 
                        backgroundColor: moodLevel !== MoodLevel.None ? config.color : undefined,
                    }}
                    title={`${dateStr}${entry?.note ? ': ' + entry.note : ''}`}
                  >
                    {/* Day Number */}
                    <span className={`
                      text-[10px] md:text-xs font-black transition-colors duration-300 pointer-events-none select-none
                      ${moodLevel === MoodLevel.None ? 'text-slate-500' : 'text-slate-950/80'}
                    `}>
                      {d}
                    </span>

                    {/* Hover tooltip effect */}
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 border border-slate-700 shadow-2xl transition-opacity">
                      Día {d}
                    </div>

                    {/* Note Indicator - Reforzado y alineado arriba a la derecha */}
                    {hasNote && (
                      <div className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-yellow-300 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(253,224,71,0.5)] z-20 transition-all group-hover:scale-125 group-hover:rotate-12`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Calendar;