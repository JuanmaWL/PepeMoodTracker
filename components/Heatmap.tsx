import React from 'react';
import { YearData, MoodLevel } from '../types';
import { MOODS } from '../constants';

interface HeatmapProps {
  data: YearData;
  year: number;
}

const Heatmap: React.FC<HeatmapProps> = ({ data, year }) => {
  const months = Array.from({ length: 12 }, (_, i) => i); // 0..11
  const days = Array.from({ length: 31 }, (_, i) => i + 1); // 1..31
  
  const monthInitials = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Contenedor adaptativo: max-w-lg en móvil, más ancho en escritorio */}
      <div className="w-full max-w-lg md:max-w-4xl mx-auto bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50 transition-all duration-500">
        
        <div className="grid grid-cols-[auto_repeat(12,_1fr)] gap-x-1 gap-y-[2px]">
          
          {/* Header Row: Month Initials */}
          <div className="h-4"></div> {/* Esquina vacía */}
          {months.map((m) => (
            <div key={m} className="h-4 flex items-center justify-center">
              <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase">
                {monthInitials[m]}
              </span>
            </div>
          ))}

          {/* Rows: Days 1-31 */}
          {days.map((day) => (
            <React.Fragment key={day}>
              {/* Day Label (Left Axis) - Solo mostramos cada 5 días para limpiar visualmente */}
              <div className="w-4 flex items-center justify-end pr-1">
                <span className="text-[8px] font-bold text-slate-600">
                  {day % 5 === 0 || day === 1 ? day : ''}
                </span>
              </div>

              {/* Month Cells for this Day */}
              {months.map((month) => {
                // Verificar si el día es válido para este mes (ej: Feb 30)
                const date = new Date(year, month, day);
                const isValidDate = date.getMonth() === month;

                if (!isValidDate) {
                  return <div key={`${month}-${day}`} className="bg-transparent" />;
                }

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const entry = data[dateStr];
                const level = entry?.level || MoodLevel.None;
                const config = MOODS[level];

                return (
                  <div
                    key={`${month}-${day}`}
                    className={`
                      aspect-square md:aspect-[2.5/1] rounded-[1px] sm:rounded-[2px] transition-all duration-300 relative group
                      ${level === MoodLevel.None ? 'bg-slate-800/40' : ''}
                    `}
                    style={{ 
                      backgroundColor: level !== MoodLevel.None ? config.color : undefined 
                    }}
                  >
                    {/* Tooltip simple en hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 pointer-events-none transition-opacity">
                       <div className="bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow-xl">
                         {dateStr}
                       </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Leyenda mini */}
      <div className="flex flex-wrap justify-center gap-2 mt-4 opacity-60">
        {[MoodLevel.Fatal, MoodLevel.Regular, MoodLevel.Normal, MoodLevel.MoiBiens, MoodLevel.Legendary].map(lvl => (
            <div key={lvl} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MOODS[lvl as MoodLevel].color }} />
            </div>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;