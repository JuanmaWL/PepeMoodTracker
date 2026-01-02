import React, { useState, useMemo } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { YearData, MoodLevel, DayData } from '../types';
import { MOODS } from '../constants';
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
        { name: 'Fatal', value: distribution[1], color: MOODS[1 as MoodLevel].color },
        { name: 'Regular', value: distribution[2], color: MOODS[2 as MoodLevel].color },
        { name: 'Normal', value: distribution[3], color: MOODS[3 as MoodLevel].color },
        { name: 'Fresco', value: distribution[4], color: MOODS[4 as MoodLevel].color },
        { name: 'Legendario', value: distribution[5], color: MOODS[5 as MoodLevel].color },
    ].filter(d => d.value > 0);

    const lineData = validEntries.map(([date, d]) => {
        const [y,m,day] = date.split('-');
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
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const recentEntries = stats.validEntries.slice(-20); 
        const summaryText = recentEntries.map(([date, d]) => 
            `Día: ${date}, Mood: ${MOODS[d.level].label}, Lore: ${d.note || "N/A"}`
        ).join("\n");

        const prompt = `
        ACTÚA COMO: Pepe the Frog. Eres un observador cínico, irónico y "basado", pero no un streamer de Twitch. Eres ese amigo que dice las verdades a la cara.
        CONTEXTO: Estás analizando el diario de tu "bro" (el usuario).
        
        DATOS RECIENTES:
        ${summaryText}

        ESTADÍSTICAS GENERALES:
        Días registrados: ${stats.totalDays}
        Promedio de felicidad: ${stats.average.toFixed(2)} / 5

        TU MISIÓN:
        1. Analiza su estado mental con sarcasmo y humor negro suave. Mete bromas sobre Naruto, Boruto, Stranger Things, Taylor Swift, Pokémon y los gatos.
        2. VOCABULARIO: Usa términos generales de internet como "Basado", "Cringe", "NPC", "Main Character", "Lore", "Arco de personaje", "Tocar pasto" o "Plot twist". 
        3. PROHIBIDO: No uses emotes de Twitch (Nada de PogChamp, MonkaS, Sadge, etc.).
        4. Si la media es baja: Dile que su lore es demasiado dramático y que salga a tocar pasto.
        5. Si la media es alta: Dile que está basadísimo y en su "Prime".
        6. Si es neutral: Dile que parece un NPC de relleno.
        7. Idioma: ESPAÑOL CASTELLANO.
        8. Sé breve y directo, máximo 70 palabras.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: prompt,
        });

        setAiAnalysis(response.text || "Pepe está juzgándote en silencio (Error de respuesta).");

    } catch (e) {
        console.error(e);
        setErrorAi("Pepe ha salido del chat (Error API).");
    } finally {
        setLoadingAi(false);
    }
  }

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
                                 <Sparkles size={14} className="text-yellow-400"/> Juicio de Pepe (IA)
                             </span>
                             {process.env.API_KEY && !aiAnalysis && !loadingAi && (
                                 <button 
                                    onClick={handleAskPepe}
                                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-full font-bold transition-colors shadow-lg shadow-indigo-900/40"
                                 >
                                     ¿Cómo me ves, Pepe?
                                 </button>
                             )}
                         </div>
                         {loadingAi ? (
                             <span className="text-indigo-300 animate-pulse text-sm font-medium">Pepe está analizando tu lore...</span>
                         ) : errorAi ? (
                             <span className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12}/> {errorAi}</span>
                         ) : aiAnalysis ? (
                             <p className="text-indigo-100 text-sm italic border-l-2 border-indigo-500 pl-3 leading-relaxed">"{aiAnalysis}"</p>
                         ) : (
                             <span className="text-slate-500 text-sm">Pregúntale a Pepe qué opina de tu vida reciente.</span>
                         )}
                     </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Line Chart */}
                    <div className="lg:col-span-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-700 shadow-inner">
                        <h3 className="text-slate-400 font-bold mb-4 text-sm uppercase">Evolución del Mood</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.lineData}>
                                    <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                                    <YAxis domain={[1, 5]} hide />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#f1f5f9' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#94a3b8' }}
                                        formatter={(value: number) => [MOODS[value as MoodLevel].label, "Mood"]}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="level" 
                                        stroke="#22c55e" 
                                        strokeWidth={4}
                                        dot={{ fill: '#0f172a', stroke: '#22c55e', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 8, fill: '#fff', stroke: '#10b981', strokeWidth: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 flex flex-col items-center shadow-inner">
                        <h3 className="text-slate-400 font-bold mb-2 text-sm uppercase">Distribución</h3>
                        <div className="h-48 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={75}
                                        paddingAngle={4}
                                        dataKey="value"
                                        animationDuration={1500}
                                    >
                                        {stats.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Pepe */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                                <span className="text-4xl filter drop-shadow-md">🐸</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full mt-4">
                            {stats.pieData.map((d) => (
                                <div key={d.name} className="flex items-center gap-2 text-xs text-slate-300">
                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: d.color }}></div>
                                    <span className="font-bold">{d.name}: {d.value}</span>
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