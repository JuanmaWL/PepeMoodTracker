
import React, { useState, useMemo, useEffect } from 'react';
import { X, Brain, PieChart as PieChartIcon, BarChart3, Hexagon, Waves, CalendarRange, Filter, ListFilter, TrendingUp } from 'lucide-react';
import { YearData, MoodLevel, DayData } from '../types';
import { MOODS, MONTHS, PEPE_ASSETS } from '../constants';
import Heatmap from './Heatmap';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { usePepeJudge } from '../hooks/usePepeJudge';
import JudgeSection from './stats/JudgeSection';
import EvolutionCharts, { ChartType } from './stats/EvolutionCharts';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: YearData;
}

type TimeRange = 'all' | 'last_7' | 'last_30' | string;
type WeekRange = 'all' | '1' | '2' | '3' | '4'; // 1-7, 8-14, 15-21, 22+

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, data }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('0'); 
  const [weekRange, setWeekRange] = useState<WeekRange>('all'); 
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Reset week when month changes
  useEffect(() => {
    setWeekRange('all');
  }, [timeRange]);

  const getRangeLabel = () => {
    if (timeRange === 'all') return 'Todo el Año';
    if (timeRange === 'last_7') return 'Últimos 7 Días';
    if (timeRange === 'last_30') return 'Últimos 30 Días';
    
    const monthName = MONTHS[parseInt(timeRange)];
    if (weekRange === 'all') return monthName;
    
    if (weekRange === '1') return `${monthName} (Días 1-7)`;
    if (weekRange === '2') return `${monthName} (Días 8-14)`;
    if (weekRange === '3') return `${monthName} (Días 15-21)`;
    if (weekRange === '4') return `${monthName} (Días 22+)`;
    
    return monthName;
  };

  // Heavy calculation memoized
  const stats = useMemo(() => {
    const entries = Object.entries(data) as [string, DayData][];
    const allValidEntries = entries.filter(([_, d]) => d.level > 0).sort((a, b) => a[0].localeCompare(b[0]));
    
    let filteredEntries: [string, DayData][] = [];

    if (timeRange === 'all') {
        filteredEntries = allValidEntries;
    } else if (timeRange === 'last_7') {
        filteredEntries = allValidEntries.slice(-7);
    } else if (timeRange === 'last_30') {
        filteredEntries = allValidEntries.slice(-30);
    } else {
        const monthIndex = parseInt(timeRange);
        filteredEntries = allValidEntries.filter(([date]) => {
             const [_, m] = date.split('-');
             return parseInt(m) - 1 === monthIndex;
        });

        if (weekRange !== 'all') {
            filteredEntries = filteredEntries.filter(([date]) => {
                const day = parseInt(date.split('-')[2]);
                if (weekRange === '1') return day >= 1 && day <= 7;
                if (weekRange === '2') return day >= 8 && day <= 14;
                if (weekRange === '3') return day >= 15 && day <= 21;
                if (weekRange === '4') return day >= 22;
                return true;
            });
        }
    }

    if (filteredEntries.length === 0) return null;

    const totalDays = filteredEntries.length;
    const totalScore = filteredEntries.reduce((acc, [_, d]) => acc + d.level, 0);
    const average = totalScore / totalDays;

    const distribution = [0, 0, 0, 0, 0, 0, 0]; 
    filteredEntries.forEach(([_, d]) => distribution[d.level]++);

    const pieData = [
        { name: 'Rage', value: distribution[MoodLevel.Rage], color: MOODS[MoodLevel.Rage].color },
        { name: 'Sadge', value: distribution[MoodLevel.Sadge], color: MOODS[MoodLevel.Sadge].color },
        { name: 'Poker', value: distribution[MoodLevel.Regular], color: MOODS[MoodLevel.Regular].color },
        { name: 'Normal', value: distribution[MoodLevel.Normal], color: MOODS[MoodLevel.Normal].color },
        { name: 'Moi Biens', value: distribution[MoodLevel.MoiBiens], color: MOODS[MoodLevel.MoiBiens].color },
        { name: 'Legendario', value: distribution[MoodLevel.Legendary], color: MOODS[MoodLevel.Legendary].color },
    ].filter(d => d.value > 0);

    const lineData = filteredEntries.map(([date, d]) => {
        const [y,m,day] = date.split('-');
        return {
            date: `${m}/${day}`,
            fullDate: date,
            level: d.level,
            month: parseInt(m) - 1,
            dayValue: parseInt(day) 
        };
    });

    const weekStats = [0, 0, 0, 0, 0, 0, 0].map(() => ({ sum: 0, count: 0 }));
    filteredEntries.forEach(([date, d]) => {
        const [y, m, day] = date.split('-').map(Number);
        const dayOfWeek = new Date(y, m - 1, day).getDay(); 
        weekStats[dayOfWeek].sum += d.level;
        weekStats[dayOfWeek].count += 1;
    });

    const weekLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const radarData = weekLabels.map((label, i) => ({
        subject: label,
        A: weekStats[i].count > 0 ? parseFloat((weekStats[i].sum / weekStats[i].count).toFixed(2)) : 0,
        fullMark: 6
    }));
    const shiftedRadarData = [...radarData.slice(1), radarData[0]];

    return { totalDays, average, pieData, lineData, radarData: shiftedRadarData, filteredEntries };
  }, [data, timeRange, weekRange]);

  // Hook for AI Judge Logic
  const { 
    aiAnalysis, 
    loadingAi, 
    loadingText, 
    loadingImage,
    errorAi, 
    askPepe, 
    resetVerdict 
  } = usePepeJudge({ stats, getRangeLabel });

  // Reset judge when filters change
  useEffect(() => {
    resetVerdict();
  }, [timeRange, weekRange, resetVerdict]);

  const isMonthSelected = !isNaN(parseInt(timeRange));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900/90 border border-slate-700/50 w-full max-w-[90vw] xl:max-w-7xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[95vh] relative ring-1 ring-white/10">
        
        {/* Background Ambient */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>

        {/* HEADER UNIFICADO: ESTADÍSTICAS */}
        <div className="p-6 md:p-8 border-b border-white/5 flex flex-col gap-4 bg-slate-900/50 relative z-20 backdrop-blur-xl shrink-0">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20 animate-pulse relative group">
                    <BarChart3 size={28} className="relative z-10" />
                    <div className="absolute inset-0 bg-white/20 blur-lg group-hover:animate-ping"></div>
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none bg-gradient-to-r from-indigo-200 via-blue-200 to-indigo-400 bg-clip-text text-transparent filter drop-shadow-sm">
                        Estadísticas
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-bold uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                            <TrendingUp size={12} />
                            Rendimiento
                        </span>
                    </div>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="p-3 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10 shrink-0"
            >
                <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-gradient-to-b from-slate-900/0 to-slate-950/50 relative z-10">
          
          <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-700 flex flex-col items-center justify-center overflow-hidden">
              <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2 self-start w-full">
              <Brain size={14} className="text-slate-500" /> Mapa de Calor Anual
              </h3>
              <Heatmap data={data} year={new Date().getFullYear()} />
          </div>

          {/* FILTROS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 px-2">
                  <Filter size={16} className="text-indigo-400" />
                  <span className="text-[10px] uppercase font-black tracking-widest">Filtrar Análisis y Gráficas:</span>
              </div>
              
              <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row gap-3 justify-end">
                  <div className="relative group w-full sm:w-48">
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                          <CalendarRange size={14} />
                      </div>
                      <select 
                          value={timeRange} 
                          onChange={(e) => setTimeRange(e.target.value)}
                          className="w-full bg-slate-800 text-white text-xs font-bold py-2.5 px-4 pr-10 rounded-xl outline-none hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700 focus:border-indigo-500 appearance-none uppercase tracking-wide shadow-sm"
                      >
                          <option value="last_7">Últimos 7 días</option>
                          <option value="last_30">Últimos 30 días</option>
                          <option disabled>──────────</option>
                          {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                          <option disabled>──────────</option>
                          <option value="all">Todo el Año</option>
                      </select>
                  </div>
                  
                  {isMonthSelected && (
                        <div className="relative group w-full sm:w-56 animate-in slide-in-from-left-2 duration-300">
                          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                              <ListFilter size={14} />
                          </div>
                          <select 
                              value={weekRange} 
                              onChange={(e) => setWeekRange(e.target.value as WeekRange)}
                              className="w-full bg-slate-800 text-indigo-200 text-xs font-bold py-2.5 px-4 pr-10 rounded-xl outline-none hover:bg-slate-700 transition-colors cursor-pointer border border-indigo-500/30 focus:border-indigo-500 appearance-none uppercase tracking-wide shadow-sm"
                          >
                              <option value="all">Todo el Mes</option>
                              <option value="1">Semana 1 (1-7)</option>
                              <option value="2">Semana 2 (8-14)</option>
                              <option value="3">Semana 3 (15-21)</option>
                              <option value="4">Semana 4 (22+)</option>
                          </select>
                        </div>
                  )}
              </div>
          </div>

          {!stats ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-slate-900/20 rounded-3xl border border-slate-800/50 border-dashed animate-in fade-in">
                  <div className="opacity-30 text-6xl grayscale filter">🐸</div>
                  <div className="space-y-1">
                      <p className="text-slate-400 font-bold text-sm">Nada por aquí...</p>
                      <p className="text-slate-500 text-xs italic">"No hay lore registrado en este periodo."</p>
                  </div>
              </div>
          ) : (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Summary + Pie */}
                      <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-700/50 p-4 rounded-2xl border border-slate-600 flex flex-col justify-center items-center text-center">
                                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Días</span>
                                  <span className="text-3xl font-black text-white">{stats.totalDays}</span>
                              </div>
                              <div className="bg-slate-700/50 p-4 rounded-2xl border border-slate-600 flex flex-col justify-center items-center text-center">
                                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Media</span>
                                  <div className="flex items-baseline gap-1">
                                      <span className="text-3xl font-black" style={{ color: stats.average >= 5 ? '#22c55e' : stats.average >= 3 ? '#eab308' : '#ef4444' }}>
                                          {stats.average.toFixed(1)}
                                      </span>
                                      <span className="text-xs text-slate-500 font-bold">/ 6</span>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-700 flex-1 flex flex-col">
                              <h3 className="text-slate-400 font-black text-xs uppercase mb-2 tracking-widest flex items-center gap-2">
                                  <PieChartIcon size={14} /> Distribución
                              </h3>
                              <div className="flex-1 min-h-[160px] relative flex items-center justify-center">
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                                      <img 
                                          src={PEPE_ASSETS.CENTER_IMG} 
                                          alt="Pepe Breath"
                                          className="w-16 h-16 object-contain opacity-90"
                                          style={{ animation: 'pepe-breath 3s ease-in-out infinite' }}
                                      />
                                      <style>{`
                                      @keyframes pepe-breath {
                                          0%, 100% { transform: scale(0.95); opacity: 0.8; }
                                          50% { transform: scale(1.05); opacity: 1; }
                                      }
                                      `}</style>
                                  </div>

                                  <ResponsiveContainer width="100%" height="100%">
                                      <PieChart>
                                          <Pie data={stats.pieData} innerRadius={55} outerRadius={75} dataKey="value" paddingAngle={5} stroke="none">
                                          {stats.pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                                          </Pie>
                                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                                      </PieChart>
                                  </ResponsiveContainer>
                              </div>
                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                                  {stats.pieData.map(d => (
                                  <div key={d.name} className="flex items-center justify-between text-xs font-bold">
                                      <div className="flex items-center gap-1.5 text-slate-300">
                                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                                      <span>{d.name}</span>
                                      </div>
                                      <span className="text-slate-500">{d.value}</span>
                                  </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* ATOMIC JUDGE SECTION */}
                      <JudgeSection 
                          loadingAi={loadingAi}
                          aiAnalysis={aiAnalysis}
                          errorAi={errorAi}
                          loadingText={loadingText}
                          loadingImage={loadingImage}
                          onAskPepe={askPepe}
                          onReset={resetVerdict}
                          rangeLabel={getRangeLabel()}
                      />
                  </div>

                  {/* ATOMIC EVOLUTION CHARTS */}
                  <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700 overflow-hidden w-full">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                          <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                              <TrendingUp size={14} /> Evolución de Vibra ({getRangeLabel()})
                          </h3>
                          <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                                  <button onClick={() => setChartType('bar')} className={`p-1.5 rounded-lg transition-all ${chartType === 'bar' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`} title="Barras Diarias"><BarChart3 size={14} /></button>
                                  <button onClick={() => setChartType('area')} className={`p-1.5 rounded-lg transition-all ${chartType === 'area' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`} title="Área"><Waves size={14} /></button>
                                  <button onClick={() => setChartType('radar')} className={`p-1.5 rounded-lg transition-all ${chartType === 'radar' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`} title="Radar Semanal"><Hexagon size={14} /></button>
                              </div>
                          </div>
                      </div>
                      <div className="w-full h-80 md:h-96">
                          <ResponsiveContainer width="100%" height="100%">
                              <EvolutionCharts 
                                  type={chartType} 
                                  lineData={stats.lineData} 
                                  radarData={stats.radarData} 
                              />
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StatsModal;
