import React from 'react';
import { YearData, MoodLevel } from '../types';
import { MONTHS, MOODS } from '../constants';

interface CalendarProps {
  yearData: YearData;
  onDayClick: (dateStr: string) => void;
  currentYear: number;
}

const Calendar: React.FC<CalendarProps> = ({ yearData, onDayClick, currentYear }) => {
  
  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 pb-32">
      {MONTHS.map((monthName, mIndex) => {
        const daysInMonth = new Date(currentYear, mIndex + 1, 0).getDate();
        // Calculate offset for the first day of the month to align correctly in grid (optional, but looks nice)
        // For simplicity in this specific "Habit Tracker" style, usually just a flex grid of squares is preferred over a real calendar alignment.
        // We will stick to the 'GitHub contributions' style block grid as per original reference.

        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
          <div key={monthName} className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 shadow-sm hover:border-slate-600 transition-colors">
            <h3 className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] mb-4 text-center">
              {monthName}
            </h3>
            
            <div className="grid grid-cols-7 gap-2">
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
                      aspect-square rounded-md relative group transition-all duration-300
                      ${moodLevel === MoodLevel.None ? 'bg-slate-700/50 hover:bg-slate-600' : ''}
                      ${moodLevel === MoodLevel.Legendary ? 'animate-pulse hover:animate-none shadow-[0_0_10px_rgba(34,197,94,0.4)]' : ''}
                    `}
                    style={{ 
                        backgroundColor: moodLevel !== MoodLevel.None ? config.color : undefined,
                    }}
                    title={`${dateStr}${entry?.note ? ': ' + entry.note : ''}`}
                  >
                    {/* Hover tooltip effect */}
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 border border-slate-700">
                      Day {d}
                    </div>

                    {/* Note Indicator */}
                    {hasNote && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
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