import React, { useState, useMemo, useEffect } from 'react';
import { X, Sparkles, Music, Trophy, Brain, Quote, Loader2, TrendingUp, PieChart as PieChartIcon, BarChart3, Hexagon, Waves } from 'lucide-react';
import { YearData, MoodLevel, DayData } from '../types';
import { MOODS, MONTHS } from '../constants';
import Heatmap from './Heatmap';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Brush, CartesianGrid, AreaChart, Area, BarChart, Bar,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: YearData;
}

type ChartType = 'area' | 'radar' | 'bar';

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, data }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [errorAi, setErrorAi] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(0);
  const [chartType, setChartType] = useState<ChartType>('bar'); // Barras por defecto ahora

  useEffect(() => {
    if (isOpen) {
      setAiAnalysis("");
      setErrorAi("");
      setLoadingAi(false);
    }
  }, [isOpen]);

  const stats = useMemo(() => {
    const entries = Object.entries(data) as [string, DayData][];
    const validEntries = entries.filter(([_, d]) => d.level > 0).sort((a, b) => a[0].localeCompare(b[0]));
    
    if (validEntries.length === 0) return null;

    const totalDays = validEntries.length;
    const totalScore = validEntries.reduce((acc, [_, d]) => acc + d.level, 0);
    const average = totalScore / totalDays;

    const distribution = [0, 0, 0, 0, 0, 0]; 
    validEntries.forEach(([_, d]) => distribution[d.level]++);

    const pieData = [
        { name: 'Fatal', value: distribution[MoodLevel.Fatal], color: MOODS[MoodLevel.Fatal].color },
        { name: 'Regular', value: distribution[MoodLevel.Regular], color: MOODS[MoodLevel.Regular].color },
        { name: 'Normal', value: distribution[MoodLevel.Normal], color: MOODS[MoodLevel.Normal].color },
        { name: 'Moi biens', value: distribution[MoodLevel.MoiBiens], color: MOODS[MoodLevel.MoiBiens].color },
        { name: 'Legendario', value: distribution[MoodLevel.Legendary], color: MOODS[MoodLevel.Legendary].color },
    ].filter(d => d.value > 0);

    // Datos diarios (para Barras y Área)
    const lineData = validEntries.map(([date, d]) => {
        const [y,m,day] = date.split('-');
        return {
            date: `${m}/${day}`,
            fullDate: date,
            level: d.level,
            month: parseInt(m) - 1,
            dayValue: parseInt(day) 
        };
    });

    const filteredLineData = selectedMonth === 'all' 
      ? lineData 
      : lineData.filter(d => d.month === selectedMonth);

    // Datos para Radar (Promedio por día de la semana)
    // 0 = Domingo, 1 = Lunes, ...
    const weekStats = [0, 0, 0, 0, 0, 0, 0].map(() => ({ sum: 0, count: 0 }));
    
    // Filtrar entradas según el mes seleccionado también para el Radar
    const entriesForRadar = selectedMonth === 'all'
        ? validEntries
        : validEntries.filter(([date]) => parseInt(date.split('-')[1]) - 1 === selectedMonth);

    entriesForRadar.forEach(([date, d]) => {
        // Truco: new Date('2024-01-01') a veces da problemas de zona horaria si no se especifica hora
        // Usamos split para asegurar dia local
        const [y, m, day] = date.split('-').map(Number);
        const dayOfWeek = new Date(y, m - 1, day).getDay(); // 0 (Sun) - 6 (Sat)
        weekStats[dayOfWeek].sum += d.level;
        weekStats[dayOfWeek].count += 1;
    });

    const weekLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    // Reordenar para empezar en Lunes si se prefiere, pero dejaremos Dom -> Sáb estándar JS
    const radarData = weekLabels.map((label, i) => ({
        subject: label,
        A: weekStats[i].count > 0 ? parseFloat((weekStats[i].sum / weekStats[i].count).toFixed(2)) : 0,
        fullMark: 5
    }));

    // Movemos Domingo al final para que el gráfico empiece visualmente en Lunes (L M X J V S D)
    const shiftedRadarData = [...radarData.slice(1), radarData[0]];

    return { totalDays, average, pieData, lineData: filteredLineData, radarData: shiftedRadarData, validEntries };
  }, [data, selectedMonth]);

  const parseAiResponse = (text: string) => {
    if (!text) return null;
    
    const diagMatch = text.match(/\[DIAGNÓSTICO\](.*?)(\[|$)/s);
    const soundMatch = text.match(/\[SOUNDTRACK\](.*?)(\[|$)/s);
    const achievementMatch = text.match(/\[LOGRO\](.*?)(\[|$)/s);

    const cleanStr = (s: string) => s.trim().replace(/^[:\s-]+/, '');

    const diagnosis = diagMatch ? cleanStr(diagMatch[1]) : cleanStr(text);
    const soundtrack = soundMatch ? cleanStr(soundMatch[1]) : "";
    const achievement = achievementMatch ? cleanStr(achievementMatch[1]) : "";

    const formatBold = (str: string) => {
      const parts = str.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="text-white font-black">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-indigo-500/20 relative">
          <Quote size={16} className="text-indigo-500/50 absolute top-3 left-3" />
          <p className="text-indigo-100 text-sm leading-relaxed pl-6 italic font-medium">
            {formatBold(diagnosis)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          {soundtrack && (
            <div className="flex items-center gap-3 bg-pink-500/10 border border-pink-500/20 px-4 py-3 rounded-xl group transition-all hover:bg-pink-500/20 shadow-lg shadow-pink-950/20 cursor-default flex-1 min-w-[200px]">
              <Music size={24} className="text-pink-400 group-hover:scale-110 transition-transform duration-200 shrink-0" />
              <span className="text-[10px] font-black text-pink-200 uppercase tracking-wider leading-tight">
                {soundtrack}
              </span>
            </div>
          )}

          {achievement && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl group transition-all hover:bg-amber-500/20 shadow-lg shadow-amber-950/20 cursor-default flex-1 min-w-[200px]">
              <Trophy size={20} className="text-amber-400 group-hover:scale-110 transition-transform duration-200 shrink-0" />
              <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider leading-tight">
                {achievement}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleAskPepe = async () => {
    const apiKey = (import.meta as any).env?.VITE_PEPE_MOOD_KEY || (process as any).env?.NEXT_PUBLIC_PEPE_MOOD_KEY || process.env.API_KEY;
    
    if (!apiKey) {
        setErrorAi("No hay API Key configurada.");
        return;
    }
    
    if (!stats) return;

    setLoadingAi(true);
    setErrorAi("");
    setAiAnalysis("");

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        const filterText = selectedMonth === 'all' ? "reciente" : `de ${MONTHS[selectedMonth as number]}`;
        const relevantEntries = selectedMonth === 'all' 
          ? stats.validEntries.slice(-25) 
          : stats.validEntries.filter(([date]) => parseInt(date.split('-')[1]) - 1 === selectedMonth);

        if (relevantEntries.length === 0) {
          setErrorAi("No hay lore este mes para juzgar.");
          setLoadingAi(false);
          return;
        }

        const summaryText = relevantEntries.map(([date, d]) => 
            `Día: ${date}, Mood: ${MOODS[d.level].label}, Lore: ${d.note || "Sin descripción"}`
        ).join("\n");

        const prompt = `
            ACTÚA COMO: Pepe the Frog versión Millennial.
            CONTEXTO: Analiza el diario: ${filterText}.
            DATOS: ${summaryText}

            Misión (RESPUESTA ESTRUCTURADA OBLIGATORIA):
            1. Usa las etiquetas [DIAGNÓSTICO], [SOUNDTRACK] y [LOGRO].
            
            REGLAS:
            - Texto natural, sarcástico pero nostálgico.
            - SIN Markdown ni asteriscos.
            
            [DIAGNÓSTICO]: Frase lapidaria sobre el mes/periodo.
            [SOUNDTRACK]: Canción (2000s, Nu Metal, Emo, Pop Punk).
            [LOGRO]: Logro desbloqueado sarcástico (max 8 palabras).

            Máximo 90 palabras total.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        setAiAnalysis(response.text || "[DIAGNÓSTICO] Pepe se ha quedado sin palabras.");
    } catch (e) {
        setErrorAi("Pepe está AFK (Error API).");
    } finally {
        setLoadingAi(false);
    }
  };

  const renderEvolutionChart = () => {
    if (!stats) return null;

    const chartMargins = { top: 10, right: 30, left: 0, bottom: 5 };

    const gradients = (
        <defs>
            <linearGradient id="moodGradientArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="moodGradientLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={1}/>
                <stop offset="50%" stopColor="#facc15" stopOpacity={1}/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity={1}/>
            </linearGradient>
        </defs>
    );

    const commonAxis = (
        <>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
                dataKey="date" 
                stroke="#475569" 
                tick={{fontSize: 10, fill: '#64748b'}} 
                tickMargin={10}
                minTickGap={30}
            />
            <YAxis 
                domain={[0, 6]} 
                ticks={[1, 2, 3, 4, 5]} 
                tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 'bold'}} 
                width={30}
                tickFormatter={(val) => val}
            />
            <Tooltip 
                cursor={{ fill: '#334155', opacity: 0.2 }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Brush 
                dataKey="date" 
                height={40} 
                stroke="#64748b" 
                fill="#1e293b" 
                tickFormatter={() => ""}
                travellerWidth={10} 
            />
        </>
    );

    if (chartType === 'area') {
        return (
            <AreaChart data={stats.lineData} margin={chartMargins}>
                {gradients}
                {commonAxis}
                <Area 
                    type="monotone" 
                    dataKey="level" 
                    stroke="url(#moodGradientLine)" 
                    fill="url(#moodGradientArea)" 
                    strokeWidth={3}
                    activeDot={{ r: 6, fill: '#fff' }}
                    animationDuration={1000}
                />
            </AreaChart>
        );
    } else if (chartType === 'bar') {
        return (
            <BarChart data={stats.lineData} margin={chartMargins} barGap={2}>
                {commonAxis}
                <Bar dataKey="level" radius={[6, 6, 0, 0]} animationDuration={1000}>
                    {stats.lineData.map((entry, index) => (
                         <Cell 
                            key={`cell-${index}`} 
                            fill={MOODS[entry.level as MoodLevel].color} 
                            strokeWidth={0}
                         />
                    ))}
                </Bar>
            </BarChart>
        );
    } else {
        // RADAR CHART (Por día de la semana)
        // Eliminado el DIV envoltorio que causaba conflicto con ResponsiveContainer
        return (
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={stats.radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} 
                />
                <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 5]} 
                    tick={false} 
                    axisLine={false} 
                />
                <Radar
                    name="Mood Medio"
                    dataKey="A"
                    stroke="#22c55e"
                    strokeWidth={3}
                    fill="#22c55e"
                    fillOpacity={0.4}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [value, "Promedio"]}
                />
            </RadarChart>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-[90vw] xl:max-w-7xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐸</span>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Archivo de Lore</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {!stats ? (
            <div className="text-center py-20 text-slate-500 italic">"Página en blanco. Escribe tu historia primero."</div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* FILA 1: Heatmap Panorámico */}
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-700 flex flex-col items-center justify-center overflow-hidden">
                <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2 self-start w-full">
                  <Brain size={14} className="text-slate-500" /> Mapa de Calor Anual
                </h3>
                <Heatmap data={data} year={new Date().getFullYear()} />
              </div>

              {/* FILA 2: Grid de 3 columnas para Métricas y Oráculo */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Columna Izquierda: Métricas Numéricas y Tarta */}
                <div className="flex flex-col gap-4">
                    {/* Tarjetas de Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-700/50 p-4 rounded-2xl border border-slate-600 flex flex-col justify-center items-center text-center">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Días</span>
                            <span className="text-3xl font-black text-white">{stats.totalDays}</span>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-2xl border border-slate-600 flex flex-col justify-center items-center text-center">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Media</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black" style={{ color: stats.average >= 3.5 ? '#22c55e' : stats.average >= 2.5 ? '#facc15' : '#ef4444' }}>
                                    {stats.average.toFixed(1)}
                                </span>
                                <span className="text-xs text-slate-500 font-bold">/ 5</span>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de Tarta */}
                    <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-700 flex-1 flex flex-col">
                        <h3 className="text-slate-400 font-black text-xs uppercase mb-2 tracking-widest flex items-center gap-2">
                             <PieChartIcon size={14} /> Distribución
                        </h3>
                        <div className="flex-1 min-h-[160px] relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                                <img 
                                    src="https://i.imgur.com/3OaT1ef.png" 
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
                                    <Pie 
                                    data={stats.pieData} 
                                    innerRadius={55} 
                                    outerRadius={75} 
                                    dataKey="value" 
                                    paddingAngle={5}
                                    stroke="none"
                                    >
                                    {stats.pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                            {stats.pieData.map(d => (
                            <div key={d.name} className="flex items-center justify-between text-[9px] font-bold">
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

                {/* Columna Central y Derecha (Combinadas): Oráculo de Pepe */}
                <div className="lg:col-span-2 bg-indigo-900/10 p-6 rounded-3xl border border-indigo-500/20 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={12} className="text-indigo-400 animate-pulse" /> Juicio de Pepe
                    </span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    {loadingAi ? (
                        <div className="h-32 flex flex-col items-center justify-center gap-3 text-indigo-400">
                        <Loader2 size={32} className="animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Consultando el Lore...</span>
                        </div>
                    ) : aiAnalysis ? (
                        parseAiResponse(aiAnalysis)
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-4">
                           <p className="text-indigo-200/60 text-sm italic max-w-md">
                               "Pepe puede analizar tus datos filtrados y darte un veredicto brutalmente honesto."
                           </p>
                           <button 
                            onClick={handleAskPepe} 
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                        >
                            <Brain size={16} /> Obtener Veredicto
                        </button>
                        </div>
                    )}
                    {errorAi && <p className="text-red-400 text-[10px] mt-4 font-bold text-center">{errorAi}</p>}
                  </div>
                </div>
              </div>

              {/* FILA 3: Evolución de Vibra */}
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700 overflow-hidden w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={14} /> Evolución de Vibra
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-4">
                         {/* Selector de Tipo de Gráfico */}
                         <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                            <button 
                                onClick={() => setChartType('bar')}
                                className={`p-1.5 rounded-lg transition-all ${chartType === 'bar' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}
                                title="Barras Diarias"
                            >
                                <BarChart3 size={14} />
                            </button>
                            <button 
                                onClick={() => setChartType('area')}
                                className={`p-1.5 rounded-lg transition-all ${chartType === 'area' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}
                                title="Área"
                            >
                                <Waves size={14} />
                            </button>
                            <button 
                                onClick={() => setChartType('radar')}
                                className={`p-1.5 rounded-lg transition-all ${chartType === 'radar' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}
                                title="Radar Semanal"
                            >
                                <Hexagon size={14} />
                            </button>
                         </div>

                        {/* Selector de Mes */}
                        <div className="flex items-center gap-3 bg-slate-800 p-1 rounded-xl border border-slate-700">
                            <span className="text-[10px] font-bold text-slate-500 px-2 uppercase hidden sm:inline">Filtrar:</span>
                            <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className="bg-slate-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg outline-none hover:bg-slate-600 transition-colors cursor-pointer"
                            >
                            <option value="all">Todo el año</option>
                            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Gráfico con Brush (Zoom deslizante) */}
                <div className="w-full h-80 md:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderEvolutionChart() as React.ReactElement}
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