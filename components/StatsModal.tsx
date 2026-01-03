import React, { useState, useMemo } from 'react';
import { X, Sparkles, Music, Trophy, Brain, Quote, Loader2 } from 'lucide-react';
import { YearData, MoodLevel, DayData } from '../types';
import { MOODS, MONTHS } from '../constants';
import Heatmap from './Heatmap';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: YearData;
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, data }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [errorAi, setErrorAi] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

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

    const lineData = validEntries.map(([date, d]) => {
        const [y,m,day] = date.split('-');
        return {
            date: `${m}/${day}`,
            fullDate: date,
            level: d.level,
            month: parseInt(m) - 1
        };
    });

    const filteredLineData = selectedMonth === 'all' 
      ? lineData 
      : lineData.filter(d => d.month === selectedMonth);

    return { totalDays, average, pieData, lineData: filteredLineData, validEntries };
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
            <div className="flex items-center gap-3 bg-pink-500/10 border border-pink-500/20 px-4 py-3 rounded-xl group transition-all hover:bg-pink-500/20 shadow-lg shadow-pink-950/20 cursor-default flex-1 min-w-[250px]">
              {/* Color ROSA para la música */}
              <Music 
                size={28} 
                className="text-pink-400 group-hover:scale-110 transition-transform duration-200 ease-out shrink-0" 
              />
              <span className="text-[11px] font-black text-pink-200 uppercase tracking-wider leading-tight">
                {soundtrack}
              </span>
            </div>
          )}

          {achievement && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl group transition-all hover:bg-amber-500/20 shadow-lg shadow-amber-950/20 cursor-default flex-1 min-w-[250px]">
              {/* Color ÁMBAR/DORADO para el trofeo */}
              <Trophy 
                size={24} 
                className="text-amber-400 group-hover:scale-110 transition-transform duration-200 ease-out shrink-0" 
              />
              <span className="text-[11px] font-black text-amber-200 uppercase tracking-wider leading-tight">
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
            ACTÚA COMO: Pepe the Frog. Sabio, cínico, un poco melancólico pero divertido. Un observador que dice la verdad sin filtros.
            CONTEXTO: Estás analizando el diario personal de un humano: ${filterText}.
            DATOS ESTADÍSTICOS: ${summaryText}

            Misión (RESPUESTA ESTRUCTURADA OBLIGATORIA):
            1. Usa las etiquetas [DIAGNÓSTICO], [SOUNDTRACK] y [LOGRO].
            
            En [DIAGNÓSTICO]:
            - Analiza el mes y defínelo con una frase lapidaria en ESPAÑOL DE ESPAÑA, sé sarcástico y directo.
            - Usa jerga sarcástica, inteligente e irónica relacionada con cultura POP, con jerga de Internet y Twitter y con referencias culturales (no tienes que usarlas todas para no saturar) tales como: 
              - Universo de Harry Potter.
              - Elementos de la serie Stranger Things (como Vecna, el Upside Down, etc)
              - Saga Pokémon (con cualquier mención a cualquier Pokémon o a algún personaje).
              - Anime como Naruto o Boruto o con alguno de sus personajes.
            
            En [SOUNDTRACK]:
            - Usa frases, canciones o vibras de canciones de Linkin Park, Avril Lavigne o Taylor Swift para definir el periodo analizado de forma interesante y perspicaz. Puedes usar otros grupos como Skillet, Nickelback, Green Day, Fall Out Boy, Simple Play, Sum41, etc. Ese tipo de grupos.
            
            En [LOGRO]:
            - Crea un "Logro Desbloqueado" sarcástico de máximo 8 palabras. No tienes que usar todas, es como máximo.

            REGLAS DE ORO:
            - No satures el mensaje con muchísimas referencias, sé elegante.
            - PROHIBIDO: Jerga de Twitch (Pog, MonkaS, OmegaLul).
            - Tono: Como un adolescente "emo" de los 2000 que ahora es sabio, sarcástico e irónico.
            - Longitud: Máximo 80 palabras en total.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        setAiAnalysis(response.text || "[DIAGNÓSTICO] Pepe se ha quedado sin palabras ante semejante lore.");
    } catch (e) {
        setErrorAi("Pepe está AFK (Error API).");
    } finally {
        setLoadingAi(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800">
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
            <>
              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-700">
                <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Brain size={14} className="text-slate-500" /> Mapa de Calor Anual
                </h3>
                <Heatmap data={data} year={new Date().getFullYear()} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/50 p-5 rounded-2xl border border-slate-600 flex flex-col justify-center">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Días</span>
                  <span className="text-4xl font-black text-white">{stats.totalDays}</span>
                </div>
                <div className="bg-slate-700/50 p-5 rounded-2xl border border-slate-600 flex flex-col justify-center">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Promedio</span>
                  <span className="text-4xl font-black" style={{ color: stats.average >= 3.5 ? '#22c55e' : stats.average >= 2.5 ? '#facc15' : '#ef4444' }}>
                    {stats.average.toFixed(1)}
                  </span>
                </div>
                <div className="md:col-span-2 bg-indigo-900/20 p-5 rounded-2xl border border-indigo-500/30">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={12} className="text-indigo-400 animate-pulse" /> Juicio de Pepe
                    </span>
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                      className="bg-slate-900 text-slate-300 text-[10px] font-bold py-1 px-2 rounded-lg border border-slate-700 outline-none hover:border-indigo-500/50 transition-colors"
                    >
                      <option value="all">Todo el año</option>
                      {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                    </select>
                  </div>
                  
                  {loadingAi ? (
                    <div className="h-24 flex flex-col items-center justify-center gap-2 text-indigo-400">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Consultando el Lore...</span>
                    </div>
                  ) : aiAnalysis ? (
                    parseAiResponse(aiAnalysis)
                  ) : (
                    <div className="py-2">
                       <button 
                        onClick={handleAskPepe} 
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                      >
                        <Brain size={16} /> Obtener Veredicto de Pepe
                      </button>
                    </div>
                  )}
                  {errorAi && <p className="text-red-400 text-[10px] mt-2 font-bold">{errorAi}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-3xl border border-slate-700 overflow-hidden">
                  <h3 className="text-slate-400 font-black text-xs uppercase mb-6 tracking-widest">Evolución de Vibra</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.lineData}>
                        <XAxis dataKey="date" stroke="#475569" tick={{fontSize: 10}} />
                        <YAxis domain={[1, 5]} hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                          formatter={(v: number) => [MOODS[v as MoodLevel].label, "Estado"]}
                        />
                        <Line type="stepAfter" dataKey="level" stroke="#22c55e" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700 flex flex-col items-center">
                  <h3 className="text-slate-400 font-black text-xs uppercase mb-4 tracking-widest">Mezcla de Vibes</h3>
                  <div className="h-48 w-full relative flex items-center justify-center">
                    <div className="absolute w-12 h-12 z-0 pointer-events-none mb-1">
                      <img src="https://i.imgur.com/3OaT1ef.png" className="w-full h-full object-contain" alt="Pepe Center" />
                    </div>
                    
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={stats.pieData} 
                          innerRadius={50} 
                          outerRadius={70} 
                          dataKey="value" 
                          paddingAngle={5}
                          animationBegin={0}
                          animationDuration={800}
                        >
                          {stats.pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-1 gap-2 w-full mt-4">
                    {stats.pieData.map(d => (
                      <div key={d.name} className="flex items-center justify-between text-[10px] font-bold">
                        <div className="flex items-center gap-2 text-slate-300">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span>{d.name}</span>
                        </div>
                        <span className="text-slate-500">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsModal;