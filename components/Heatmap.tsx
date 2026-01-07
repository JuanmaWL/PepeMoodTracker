
import React, { memo } from 'react';
import { YearData, MoodLevel } from '../types';
import { MOODS } from '../constants';

interface HeatmapProps {
  data: YearData;
  year: number;
}

const Heatmap: React.FC<HeatmapProps> = ({ data, year }) => {
  const months = Array.from({ length: 12 }, (_, i) => i); // 0..11
  const days = Array.from({ length: 31 }, (_, i) => i + 1); // 1..31
  
  const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

  const getMoodConfig = (m: number, d: number) => {
    // Validar fecha real (ej: evitar 30 Feb)
    const date = new Date(year, m, d);
    if (date.getMonth() !== m) return null;

    const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const entry = data[dateStr];
    const level = entry?.level || MoodLevel.None;
    return {
        level,
        config: MOODS[level],
        dateStr
    };
  };

  const renderMobileLayout = () => (
    <div className="w-full max-w-[240px] mx-auto">
      {/* Grid: Eje Y (Días), Eje X (Meses) - Compacto Vertical */}
      <div className="grid grid-cols-[auto_repeat(12,1fr)] gap-[1px] w-full">
        
        {/* Header Meses */}
        <div className="h-3"></div>
        {months.map((m) => (
          <div key={m} className="h-3 flex items-center justify-center overflow-hidden">
            <span className="text-[6px] font-black text-slate-500 tracking-tighter scale-90">
              {monthNames[m][0]}
            </span>
          </div>
        ))}

        {/* Filas Días */}
        {days.map((day) => (
          <React.Fragment key={day}>
            {/* Label Día */}
            <div className="w-3 flex items-center justify-end pr-1">
              <span className="text-[6px] font-mono text-slate-600 leading-none">{day}</span>
            </div>
            
            {/* Celdas */}
            {months.map((month) => {
                const info = getMoodConfig(month, day);
                return (
                    <div
                        key={`${month}-${day}`}
                        className={`
                            aspect-square w-full rounded-[1px]
                            ${!info ? 'bg-transparent' : info.level === MoodLevel.None ? 'bg-slate-800/30' : ''}
                        `}
                        style={{ backgroundColor: info && info.level !== MoodLevel.None ? info.config.color : undefined }}
                    />
                );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderDesktopLayout = () => (
    <div className="w-full">
      {/* Grid: Eje Y (Meses), Eje X (Días) - Panorámico Horizontal */}
      <div className="grid grid-cols-[auto_repeat(31,1fr)] gap-1 w-full">
         
         {/* Header Días */}
         <div className="h-6"></div>
         {days.map(d => (
             <div key={d} className="flex items-center justify-center">
                 <span className="text-[9px] font-bold text-slate-500">{d}</span>
             </div>
         ))}

         {/* Filas Meses */}
         {months.map(m => (
             <React.Fragment key={m}>
                 {/* Label Mes */}
                 <div className="flex items-center justify-end pr-3 h-8">
                     <span className="text-[10px] font-black text-slate-400 tracking-wider">{monthNames[m]}</span>
                 </div>
                 
                 {/* Celdas */}
                 {days.map(d => {
                     const info = getMoodConfig(m, d);
                     if (!info) return <div key={d} className="bg-transparent" />;
                     
                     return (
                         <div 
                            key={d}
                            className={`
                                w-full h-full rounded-sm transition-all duration-300 relative group
                                ${info.level === MoodLevel.None ? 'bg-slate-800/40 hover:bg-slate-700' : 'hover:scale-110 hover:brightness-110 z-0 hover:z-10'}
                            `}
                            style={{ backgroundColor: info.level !== MoodLevel.None ? info.config.color : undefined }}
                         >
                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none transition-opacity">
                                <div className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded border border-slate-700 whitespace-nowrap shadow-xl">
                                    <span className="font-bold text-slate-300">{d} {monthNames[m]}</span>
                                    {info.level !== MoodLevel.None && <span className="ml-2 font-bold" style={{ color: info.config.color }}>{info.config.label}</span>}
                                </div>
                            </div>
                         </div>
                     );
                 })}
             </React.Fragment>
         ))}
      </div>
    </div>
  );

  const moodOrder = [
      MoodLevel.Rage, 
      MoodLevel.Sadge, 
      MoodLevel.Regular, 
      MoodLevel.Normal, 
      MoodLevel.MoiBiens, 
      MoodLevel.Legendary
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full bg-slate-950/30 p-2 md:p-6 rounded-3xl border border-slate-800/50 transition-all duration-500">
         <div className="md:hidden">
            {renderMobileLayout()}
         </div>
         <div className="hidden md:block">
            {renderDesktopLayout()}
         </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-4 opacity-70 px-2">
        {moodOrder.map(lvl => (
            <div key={lvl} className="flex items-center gap-1.5 md:gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{ backgroundColor: MOODS[lvl as MoodLevel].color }} />
                <span className="text-[8px] md:text-[9px] font-bold uppercase text-slate-400">{MOODS[lvl as MoodLevel].label}</span>
            </div>
        ))}
      </div>
    </div>
  );
};

// CRITICAL: Export memoized component to prevent re-rendering 750+ nodes on parent state changes
export default memo(Heatmap);
