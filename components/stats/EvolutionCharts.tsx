
import React, { memo } from 'react';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, Brush, CartesianGrid, AreaChart, Area, BarChart, Bar,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { MoodLevel } from '../../types';
import { MOODS } from '../../constants';

export type ChartType = 'area' | 'radar' | 'bar';

interface EvolutionChartsProps {
  type: ChartType;
  lineData: any[];
  radarData: any[];
}

const EvolutionCharts: React.FC<EvolutionChartsProps> = ({ type, lineData, radarData }) => {
    const chartMargins = { top: 10, right: 30, left: 0, bottom: 5 };
    const gradients = (
        <defs>
            <linearGradient id="moodGradientArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="moodGradientLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={1}/>
                <stop offset="50%" stopColor="#84cc16" stopOpacity={1}/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity={1}/>
            </linearGradient>
        </defs>
    );
    const commonAxis = (
        <>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="date" stroke="#475569" tick={{fontSize: 10, fill: '#64748b'}} tickMargin={10} minTickGap={30} />
            <YAxis domain={[0, 7]} ticks={[1, 2, 3, 4, 5, 6]} tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 'bold'}} width={30} tickFormatter={(val) => val} />
            <Tooltip 
                cursor={{ fill: '#334155', opacity: 0.2 }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Brush dataKey="date" height={40} stroke="#64748b" fill="#1e293b" tickFormatter={() => ""} travellerWidth={10} />
        </>
    );

    if (type === 'area') {
        return (
            <AreaChart data={lineData} margin={chartMargins}>
                {gradients} {commonAxis}
                <Area type="monotone" dataKey="level" stroke="url(#moodGradientLine)" fill="url(#moodGradientArea)" strokeWidth={3} activeDot={{ r: 6, fill: '#fff' }} animationDuration={1000} />
            </AreaChart>
        );
    } else if (type === 'bar') {
        return (
            <BarChart data={lineData} margin={chartMargins} barGap={2}>
                {commonAxis}
                <Bar dataKey="level" radius={[6, 6, 0, 0]} animationDuration={1000}>
                    {lineData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={MOODS[entry.level as MoodLevel].color} strokeWidth={0} />
                    ))}
                </Bar>
            </BarChart>
        );
    } else {
        return (
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 6]} tick={false} axisLine={false} />
                <Radar name="Mood Medio" dataKey="A" stroke="#06b6d4" strokeWidth={3} fill="#06b6d4" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} formatter={(value: number) => [value, "Promedio"]} />
            </RadarChart>
        );
    }
};

export default memo(EvolutionCharts);
