
import React, { useState, useMemo } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { YearData, MoodLevel, DayData } from '../types';
import { MOODS } from '../constants';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
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

  const stats = useMemo(() => {
    // Fix: Cast entries to [string, DayData][] to ensure TypeScript correctly identifies the type of 'd' as 'DayData'.
    const entries = Object.entries(data) as [string, DayData][];
    const validEntries = entries.filter(([_, d]) => d.level > 0).sort((a, b) => a[0].localeCompare(b[0]));
    
    if (validEntries.length === 0) return null;

    const totalDays = validEntries.length;
    // Fix: Accessing d.level now works because d is typed as DayData
    const totalScore = validEntries.reduce((acc, [_, d]) => acc + d.level, 0);
    const average = totalScore / totalDays;

    const distribution = [0, 0, 0, 0, 0, 0]; // Index maps to MoodLevel
    // Fix: Accessing d.level now works because d is typed as DayData
    validEntries.forEach(([_, d]) => distribution[d.level]++);

    const pieData = [
        { name: 'Fatal', value: distribution[1], color: MOODS[1 as MoodLevel].color },
        { name: 'Regular', value: distribution[2], color: MOODS[2 as MoodLevel].color },
        { name: 'Normal', value: distribution[3], color: MOODS[3 as MoodLevel].color },
        { name: 'Fresco', value: distribution[4], color: MOODS[4 as MoodLevel].color },
        { name: 'Legendario', value: distribution[5], color: MOODS[5 as MoodLevel].color },
    ].filter(d => d.value > 0);

    const lineData = validEntries.map(([date, d]) => {
        const [y,m,day] = date.split('-');
        // Fix: Accessing d.level and d.note now works because d is typed as DayData
        return {
            date: `${m}/${day}`,
            fullDate: date,
            level: d.level,
            note: d.note
        };
    });

    return { totalDays, average, pieData, lineData, validEntries };
  }, [data]);

  const handleAskPepe = async () => {
    if (!process.env.API_KEY) {
        setErrorAi("No hay API Key configurada.");
        return;
    }
    
    if (!stats || stats.validEntries.length === 0) {
        setErrorAi("Faltan datos para que Pepe te juzgue.");
        return;
    }

    setLoadingAi(true);
    setErrorAi("");
    setAiAnalysis("");

    try {
        // Fix: Initializing GoogleGenAI client according to best practices
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Prepare summary for AI
        const recentEntries = stats.validEntries.slice(-15); // Last 15 entries for context
        const summaryText = recentEntries.map(([date, d]) => 
            `Fecha: ${date}, Mood: ${MOODS[d.level].label}, Nota: ${d.note || "Sin nota"}`
        ).join("\n");

        const prompt = `
        Eres Pepe the Frog (la rana Pepe). Estás viendo el diario de ánimo de un usuario.
        Aquí están los datos recientes (Últimos 15 registros):
        ${summaryText}

        Puntuación media de ánimo: ${stats.average.toFixed(2)} / 5.

        Dame un análisis corto, divertido y lleno de cultura de memes de internet (Twitch, Reddit) sobre su vida reciente.
        Usa jerga de Twitch (Pog, MonkaS, Sadge, FeelsGoodMan) de forma apropiada pero el texto principal debe estar en ESPAÑOL.
        Si el ánimo es bajo, sé comprensivo pero en plan "bro". Si es alto, emociónate (HYPE).
        Máximo 100 palabras.
        `;

        // Fix: Using correct model name and generateContent syntax
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        // Fix: Accessing generated text using the .text property
        setAiAnalysis(response.text || "Pepe se ha quedado sin palabras.");

    } catch (e) {
        console.error(e);
        setErrorAi("Pepe está durmiendo (Error API).");
    } finally {
        setLoadingAi(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Resumen del Año</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          
          {!stats ? (
            <div className="text-center py-20 text-slate-500">
              <p className="text-xl font-bold">Aún no hay datos.</p>
              <p>¡Empieza a registrar días para ver estadísticas!</p>
            </div>
          ) : (
            <>
                {/* Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-700/50 p-4 rounded-2xl border border-slate-600">
                        <span className="text-slate-400 text-sm font-bold uppercase">Días Registrados</span>
                        <span className="block text-3xl font-black text-white mt-1">{stats.totalDays}</span>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-2xl border border-slate-600">
                        <span className="text-slate-400 text-sm font-bold uppercase">Media Mood</span>
                        <span className="block text-3xl font-black" style={{ color: stats.average >= 4 ? '#22c55e' : stats.average >= 2.5 ? '#facc15' : '#ef4444' }}>
                            {stats.average.toFixed(2)}
                        </span>
                    </div>
                     <div className="bg-slate-700/50 p-4 rounded-2xl border border-slate-600 col-span-2 md:col-span-2 flex flex-col justify-center items-start">
                         <div className="flex items-center justify-between w-full mb-2">
                             <span className="text-slate-400 text-sm font-bold uppercase flex items-center gap-2">
                                 <Sparkles size={14} className="text-yellow-400"/> Análisis IA
                             </span>
                             {process.env.API_KEY && !aiAnalysis && !loadingAi && (
                                 <button 
                                    onClick={handleAskPepe}
                                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-full font-bold transition-colors"
                                 >
                                     Preguntar a Pepe
                                 </button>
                             )}
                         </div>
                         {loadingAi ? (
                             <span className="text-indigo-300 animate-pulse text-sm">Pepe está pensando...</span>
                         ) : errorAi ? (
                             <span className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errorAi}</span>
                         ) : aiAnalysis ? (
                             <p className="text-indigo-100 text-sm italic border-l-2 border-indigo-500 pl-3">"{aiAnalysis}"</p>
                         ) : (
                             <span className="text-slate-500 text-sm">Recibe feedback de la IA sobre tu año.</span>
                         )}
                     </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Line Chart */}
                    <div className="lg:col-span-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                        <h3 className="text-slate-400 font-bold mb-4 text-sm uppercase">Evolución del Mood</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.lineData}>
                                    <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                                    <YAxis domain={[1, 5]} hide />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#f1f5f9' }}
                                        itemStyle={{ color: '#22c55e' }}
                                        formatter={(value: number) => [MOODS[value as MoodLevel].label, "Ánimo"]}
                                        labelStyle={{ color: '#94a3b8' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="level" 
                                        stroke="#22c55e" 
                                        strokeWidth={3}
                                        dot={{ fill: '#0f172a', stroke: '#22c55e', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: '#fff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 flex flex-col items-center">
                        <h3 className="text-slate-400 font-bold mb-2 text-sm uppercase">Distribución</h3>
                        <div className="h-48 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Pepe */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                <span className="text-4xl">🐸</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 w-full mt-4">
                            {stats.pieData.map((d) => (
                                <div key={d.name} className="flex items-center gap-2 text-xs text-slate-300">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                                    <span>{d.name}: {d.value}</span>
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
