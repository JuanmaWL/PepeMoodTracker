import React from 'react';
import { YearData, MoodLevel } from '../types';
import { MOODS } from '../constants';

interface HeatmapProps {
  data: YearData;
  year: number;
}

const Heatmap: React.FC<HeatmapProps> = ({ data, year }) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  // Create an array of all days in the year
  const days = [];
  let curr = new Date(startDate);
  while (curr <= endDate) {
    days.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  // Group days by week (Sunday to Saturday)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  // Fill the first week with empty slots if the year doesn't start on Sunday
  const firstDayOfWeek = startDate.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null as any);
  }

  days.forEach(day => {
    currentWeek.push(day);
    if (day.getDay() === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wIndex) => (
          <div key={wIndex} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, dIndex) => {
              const day = week[dIndex];
              if (!day) return <div key={dIndex} className="w-3 h-3 rounded-[2px] bg-slate-800/20" />;
              
              const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
              const entry = data[dateStr];
              const level = entry?.level || MoodLevel.None;
              const color = level !== MoodLevel.None ? MOODS[level].color : '#1e293b';

              return (
                <div 
                  key={dateStr}
                  className="w-3 h-3 rounded-[2px] transition-colors duration-500"
                  style={{ backgroundColor: color }}
                  title={`${dateStr}: ${level !== MoodLevel.None ? MOODS[level].label : 'Sin registro'}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;