
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Music, Trophy, Brain, Quote, Loader2, TrendingUp, PieChart as PieChartIcon, BarChart3, Hexagon, Waves, CalendarRange, Filter, RefreshCw, Zap, Lock, Gavel, Skull, Heart, Sparkles, Undo2, Flame, ListFilter, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { YearData, MoodLevel, DayData } from '../types';
import { MOODS, MONTHS, PEPE_ASSETS } from '../constants';
import Heatmap from './Heatmap';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Brush, CartesianGrid, AreaChart, Area, BarChart, Bar,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";
import SoundManager from '../utils/sounds';
import { ACHIEVEMENTS, getUnlockedAchievements } from '../utils/gamification';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: YearData;
}

type ChartType = 'area' | 'radar' | 'bar';
type TimeRange = 'all' | 'last_7' | 'last_30' | string;
type WeekRange = 'all' | '1' | '2' | '3' | '4'; // 1-7, 8-14, 15-21, 22+
type Tab = 'stats' | 'achievements';
type JudgeMood = 'roast' | 'wholesome';

const JUDGE_POOL = [
  PEPE_ASSETS.JUDGE_1, 
  PEPE_ASSETS.JUDGE_2
];

const LOADING_POOL = [
    PEPE_ASSETS.NOTES_1,
    PEPE_ASSETS.NOTES_2,
    PEPE_ASSETS.NOTES_3,
    PEPE_ASSETS.NOTES_4
];

const LOADING_PHRASES = [
  "PROCESANDO PECADOS...",
  "JUZGANDO TUS DECISIONES...",
  "REVISANDO EL HISTORIAL DE CRINGE...",
  "CONSULTANDO EL LIBRO GORDO...",
  "APLICANDO LEY MARCIAL...",
  "CALCULANDO EL NIVEL DE AURA...",
  "AUDITANDO TUS EMOCIONES...",
  "EMITIENDO SENTENCIA FINAL..."
];

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, data }) => {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingText, setLoadingText] = useState("PROCESANDO PECADOS...");
  const [errorAi, setErrorAi] = useState("");
  
  // Estado para la imagen del Juez y del Loading
  const [judgeImage, setJudgeImage] = useState(JUDGE_POOL[0]);
  const [loadingImage, setLoadingImage] = useState(LOADING_POOL[0]);
  
  const [timeRange, setTimeRange] = useState<TimeRange>('0'); 
  const [weekRange, setWeekRange] = useState<WeekRange>('all'); // Sub-filtro para semanas

  const [chartType, setChartType] = useState<ChartType>('bar');
  const [judgeMood, setJudgeMood] = useState<JudgeMood>('roast');
  
  // Nuevo estado para colapsar/expandir el tribunal
  const [isJudgeCollapsed, setIsJudgeCollapsed] = useState(false);

  // Referencia para mantener el scroll fijo en la sección del juez
  const judgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAiAnalysis("");
      setErrorAi("");
      setLoadingAi(false);
      // Seleccionar Juez aleatorio al abrir
      setJudgeImage(JUDGE_POOL[Math.floor(Math.random() * JUDGE_POOL.length)]);
      setActiveTab('stats');
      setJudgeMood('roast'); // Default to roast
      setIsJudgeCollapsed(false); // Reset collapse state
    }
  }, [isOpen]);

  // Resetear semana al cambiar de mes
  useEffect(() => {
    setWeekRange('all');
  }, [timeRange]);

  useEffect(() => {
    setAiAnalysis("");
    setErrorAi("");
  }, [timeRange, weekRange, judgeMood]);

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

  // Check achievements on mount or data change
  const unlockedIds = useMemo(() => getUnlockedAchievements(data), [data, isOpen]);

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

        // Aplicar sub-filtro de semana si estamos en modo mes
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
    // Ajustar el cálculo de promedio para que tenga sentido con la nueva escala
    const totalScore = filteredEntries.reduce((acc, [_, d]) => acc + d.level, 0);
    const average = totalScore / totalDays;

    // Distribution array size = 7 (0 to 6)
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

  const handleResetVerdict = () => {
    SoundManager.play('click');
    setAiAnalysis("");
    setErrorAi("");
    // Scroll back to top of judge section gently
    setTimeout(() => {
        judgeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const toggleJudgeCollapse = () => {
      SoundManager.play('click');
      setIsJudgeCollapsed(!isJudgeCollapsed);
  };

  const handleAskPepe = async (e?: React.MouseEvent) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (loadingAi) return;

    // Asegurar que está expandido al preguntar
    if (isJudgeCollapsed) setIsJudgeCollapsed(false);

    // SCROLL FIX: Ensure we stay on the judge section
    if (judgeRef.current) {
        judgeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    SoundManager.play('magic');
    setLoadingAi(true);
    
    // Seleccionar GIF de carga aleatorio para esta sesión
    setLoadingImage(LOADING_POOL[Math.floor(Math.random() * LOADING_POOL.length)]);
    
    setErrorAi("");
    setAiAnalysis("");
    
    const textInterval = setInterval(() => {
        setLoadingText(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
    }, 2000);

    try {
        const apiKey = (import.meta as any).env?.VITE_PEPE_MOOD_KEY || (process as any).env?.NEXT_PUBLIC_PEPE_MOOD_KEY || process.env.API_KEY;
        
        if (!apiKey) throw new Error("API Key no configurada");

        if (!stats || stats.totalDays === 0) {
            throw new Error("No hay datos suficientes para juzgarte.");
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });

        // LÓGICA DE FILTRADO PARA EL TRIBUNAL
        let daysToAnalyze = [...stats.filteredEntries];
        let contextLabel = getRangeLabel();

        // Sampling para no exceder tokens si son muchos días
        if (daysToAnalyze.length > 20) {
             const step = Math.floor(daysToAnalyze.length / 20);
             daysToAnalyze = daysToAnalyze.filter((_, i) => i % step === 0).slice(0, 20);
        }

        const contextData = {
            range: contextLabel,
            totalDaysAnalyzed: daysToAnalyze.length,
            averageMood: stats.average.toFixed(2),
            topMoods: stats.pieData.map(d => `${d.name} (${d.value})`).join(', '),
            days: daysToAnalyze.map(([date, d]) => ({ 
                date, 
                mood: MOODS[d.level as MoodLevel].label, 
                note: d.note || "Sin nota" 
            }))
        };

        const toneInstruction = judgeMood === 'roast' 
            ? 'sarcástico, lapidario y ácido (pero nostálgico)' 
            : 'motivador, optimista, épico y legendario (wholesome)';
        
        const diagnosisInstruction = judgeMood === 'roast'
            ? 'Frase lapidaria y sarcástica'
            : 'Frase motivadora y épica';

        const musicInstruction = judgeMood === 'roast'
            ? '[Argumento gracioso/ácido]'
            : '[Argumento inspirador/positivo]';

        const achievementInstruction = judgeMood === 'roast'
            ? 'sarcástico'
            : 'épico/glorioso';

        const prompt = `
            ACTÚA COMO: Pepe the Frog versión Millennial.
            MODO: ${judgeMood.toUpperCase()} (${toneInstruction}).
            CONTEXTO: Analiza el diario del usuario: "${contextLabel}".
            DATOS: ${JSON.stringify(contextData)}
            
            Misión: Genera un veredicto en formato JSON estricto.
            Instrucciones para los campos:
            - diagnosis: ${diagnosisInstruction} sobre el periodo.
            - soundtrack: "Titulo - Artista. Por qué: ${musicInstruction}".
            - achievement: Logro desbloqueado ${achievementInstruction} (max 10 palabras).

            REGLAS:
            - Texto natural, ${toneInstruction}.
            - Soundtrack: Elige UNA canción (2000s, 2010s, Nu Metal, Emo, Pop Punk, Rock Alternativo, Pop Rock, o incluso Taylor Swift o Avril Lavigne etc) que defina este periodo.
            - Usa referencias cultura pop (2000s, series, anime, etc). Como Dexter, Prison Break, Naruto, Pokemon, Stranger Things, Taylor Swift, Linkin Park, etc.
            - TERMINANTEMENTE PROHIBIDO usar "basado", usa "auténtico" o "con aura" en su lugar. También está prohibido usar crack, fiera, figura, socio, máquina, titán, etc
            - Máximo 130 palabras total.
        `;

        // USO DE JSON SCHEMA PARA GARANTIZAR RESPUESTA ESTRUCTURADA
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        diagnosis: { type: Type.STRING },
                        soundtrack: { type: Type.STRING },
                        achievement: { type: Type.STRING }
                    },
                    required: ["diagnosis", "soundtrack", "achievement"]
                }
            }
        });

        const text = response.text;

        if (text) {
             setAiAnalysis(text);
             SoundManager.play('success');
             // Asegurar que seguimos viendo al juez tras la carga
             setTimeout(() => {
                 judgeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
             }, 100);
        } else {
             throw new Error("Pepe se quedó mudo.");
        }

    } catch (e) {
        console.error(e);
        setErrorAi("Error conectando con el tribunal supremo.");
        SoundManager.play('trash');
    } finally {
        clearInterval(textInterval);
        setLoadingAi(false);
    }
  };

  const parseAiResponse = (rawText: string) => {
    if (!rawText) return null;
    
    let diagnosis = "";
    let soundtrackFull = "";
    let achievement = "";

    try {
        const json = JSON.parse(rawText);
        diagnosis = json.diagnosis || "";
        soundtrackFull = json.soundtrack || "";
        achievement = json.achievement || "";
    } catch (e) {
        // Fallback en caso de que (raramente) el modelo no devuelva JSON válido
        const cleanStr = (s: string) => s.trim().replace(/^[:\s-]+/, '');
        const diagMatch = rawText.match(/\[?DIAGNÓSTICO\]?:?(.*?)(\[|$)/is);
        const soundMatch = rawText.match(/\[?SOUNDTRACK\]?:?(.*?)(\[|$)/is);
        const achievementMatch = rawText.match(/\[?LOGRO\]?:?(.*?)(\[|$)/is);
        diagnosis = diagMatch ? cleanStr(diagMatch[1]) : "";
        soundtrackFull = soundMatch ? cleanStr(soundMatch[1]) : "";
        achievement = achievementMatch ? cleanStr(achievementMatch[1]) : "";
    }

    const renderSoundtrackContent = (fullText: string) => {
        const separatorRegex = /Por qué:|Why:|Because:/i;
        const splitIndex = fullText.search(separatorRegex);

        let songPart = fullText;
        let reasonPart = "";

        if (splitIndex !== -1) {
            songPart = fullText.substring(0, splitIndex).replace(/[.-]+$/, '').trim();
            reasonPart = fullText.substring(splitIndex).replace(/Por qué:|Why:|Because:/i, '').trim();
        }

        const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(songPart)}`;

        return (
            <a 
                href={spotifyUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group/card relative p-4 rounded-2xl bg-pink-500/5 border border-pink-500/10 hover:bg-pink-500/10 hover:border-pink-500/30 transition-all duration-300 cursor-pointer flow-root block"
            >
                <div className="float-left mr-4 mb-1 relative">
                    <div className="absolute inset-0 bg-pink-500 rounded-full blur-md opacity-0 group-hover/card:opacity-30 transition-opacity duration-300"></div>
                    <div className="relative p-2 rounded-xl bg-pink-500/10 text-pink-400 group-hover/card:scale-110 group-hover/card:rotate-3 transition-transform duration-300">
                        <Music size={18} />
                    </div>
                </div>
                <div className="text-[10px] font-black text-pink-400/60 uppercase tracking-widest mb-1 group-hover/card:text-pink-400 transition-colors flex items-center gap-2">
                    Now Playing <ExternalLink size={10} className="opacity-50" />
                </div>
                <p className="text-pink-100 text-sm font-bold leading-tight break-words group-hover/card:underline decoration-pink-500/50 underline-offset-2 transition-colors">
                    {songPart}
                </p>
                {reasonPart && (
                    <div className="text-pink-200/80 text-xs italic leading-relaxed mt-2 border-l-2 border-pink-500/30 pl-2">
                        "{reasonPart}"
                    </div>
                )}
            </a>
        );
    };

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right duration-700 w-full relative">
        {diagnosis && (
        <div className="group/card relative p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 cursor-default flow-root">
           <div className="float-left mr-4 mb-1 relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-0 group-hover/card:opacity-30 transition-opacity duration-300"></div>
              <div className="relative p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover/card:scale-110 group-hover/card:rotate-3 transition-transform duration-300">
                  <Quote size={18} />
              </div>
           </div>
           <div className="text-[10px] font-black text-indigo-400/60 uppercase tracking-widest mb-1 group-hover/card:text-indigo-400 transition-colors">
              Diagnóstico
           </div>
           <p className="text-indigo-100 text-sm leading-relaxed font-medium italic text-justify md:text-left">
              {diagnosis}
           </p>
        </div>
        )}
        {soundtrackFull && renderSoundtrackContent(soundtrackFull)}
        {achievement && (
          <div className="group/card relative p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all duration-300 cursor-default flow-root">
             <div className="float-left mr-4 mb-1 relative">
                <div className="absolute inset-0 bg-amber-500 rounded-full blur-md opacity-0 group-hover/card:opacity-30 transition-opacity duration-300"></div>
                <div className="relative p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover/card:scale-110 group-hover/card:rotate-3 transition-transform duration-300">
                    <Trophy size={18} />
                </div>
             </div>
             <div className="text-[10px] font-black text-amber-400/60 uppercase tracking-widest mb-1 group-hover/card:text-amber-400 transition-colors">
                Logro Desbloqueado
             </div>
             <p className="text-amber-100 text-sm font-bold leading-snug text-justify md:text-left">
                {achievement}
             </p>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-6">
            <button 
                onClick={(e) => handleAskPepe(e)}
                className="w-full group/card relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-[0_4px_20px_-5px_rgba(79,70,229,0.4)] hover:shadow-[0_10px_30px_-5px_rgba(79,70,229,0.5)] transition-all duration-300 active:scale-98 overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/card:opacity-20 transition-opacity duration-300"></div>
                <RefreshCw size={18} className="group-hover/card:rotate-180 transition-transform duration-700" />
                <span className="font-black text-xs uppercase tracking-widest">Apelar Sentencia (Regenerar)</span>
            </button>
            
            <button 
                onClick={handleResetVerdict}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200 border border-slate-700 hover:border-slate-500 mt-2 group"
            >
                <Undo2 size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-[10px] uppercase tracking-widest">Nuevo Juicio (Volver)</span>
            </button>
        </div>
      </div>
    );
  };

  const renderEvolutionChart = () => {
    if (!stats) return null;
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

    if (chartType === 'area') {
        return (
            <AreaChart data={stats.lineData} margin={chartMargins}>
                {gradients} {commonAxis}
                <Area type="monotone" dataKey="level" stroke="url(#moodGradientLine)" fill="url(#moodGradientArea)" strokeWidth={3} activeDot={{ r: 6, fill: '#fff' }} animationDuration={1000} />
            </AreaChart>
        );
    } else if (chartType === 'bar') {
        return (
            <BarChart data={stats.lineData} margin={chartMargins} barGap={2}>
                {commonAxis}
                <Bar dataKey="level" radius={[6, 6, 0, 0]} animationDuration={1000}>
                    {stats.lineData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={MOODS[entry.level as MoodLevel].color} strokeWidth={0} />
                    ))}
                </Bar>
            </BarChart>
        );
    } else {
        return (
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={stats.radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 6]} tick={false} axisLine={false} />
                <Radar name="Mood Medio" dataKey="A" stroke="#06b6d4" strokeWidth={3} fill="#06b6d4" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} formatter={(value: number) => [value, "Promedio"]} />
            </RadarChart>
        );
    }
  };

  const renderAchievements = () => {
    // SORTING LOGIC: Unlocked first
    const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
        const aUnlocked = unlockedIds.includes(a.id);
        const bUnlocked = unlockedIds.includes(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0; // Maintain original order otherwise
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
             {sortedAchievements.map((ach) => {
                 const isUnlocked = unlockedIds.includes(ach.id);
                 const particles = isUnlocked ? [...Array(4)].map((_, i) => ({
                    top: Math.random() * 80 + 10 + '%',
                    left: Math.random() * 80 + 10 + '%',
                    delay: Math.random() * 2 + 's',
                    duration: Math.random() * 3 + 2 + 's'
                 })) : [];

                 return (
                     <div 
                        key={ach.id} 
                        className={`
                            relative p-5 rounded-3xl border transition-all duration-500 flex items-start gap-4 overflow-hidden group
                            ${isUnlocked 
                                ? 'bg-slate-800/80 border-slate-700/50 hover:border-slate-500/50 hover:shadow-2xl hover:-translate-y-1' 
                                : 'bg-slate-900/40 border-slate-800 opacity-50 grayscale hover:opacity-70'
                            }
                        `}
                        style={{
                            boxShadow: isUnlocked ? `0 4px 20px -5px ${ach.color}20` : 'none'
                        }}
                     >
                        {isUnlocked && (
                            <>
                                <div 
                                    className="absolute inset-0 opacity-[0.08] pointer-events-none group-hover:opacity-[0.15] transition-opacity duration-500"
                                    style={{ background: `radial-gradient(circle at top right, ${ach.color}, transparent 80%)` }}
                                />
                                {particles.map((p, i) => (
                                    <div 
                                        key={i}
                                        className="absolute w-1 h-1 rounded-full animate-pulse opacity-40 pointer-events-none"
                                        style={{
                                            backgroundColor: ach.color,
                                            top: p.top,
                                            left: p.left,
                                            animationDuration: p.duration,
                                            animationDelay: p.delay,
                                            boxShadow: `0 0 4px ${ach.color}`
                                        }}
                                    />
                                ))}
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none z-10" />
                            </>
                        )}

                        <div 
                            className={`
                                p-3 rounded-2xl shrink-0 transition-all duration-500 group-hover:scale-110 relative z-20
                                ${isUnlocked ? 'shadow-inner' : ''}
                            `}
                            style={{ 
                                backgroundColor: isUnlocked ? `${ach.color}15` : '#1e293b', 
                                color: isUnlocked ? ach.color : '#64748b',
                                boxShadow: isUnlocked ? `0 0 15px ${ach.color}30` : 'none'
                            }}
                        >
                            {isUnlocked ? <ach.icon size={26} className="drop-shadow-sm filter" /> : <Lock size={26} />}
                            {isUnlocked && <div className="absolute inset-0 rounded-2xl opacity-20 blur-md animate-pulse" style={{ backgroundColor: ach.color }}></div>}
                        </div>

                        <div className="flex-1 relative z-20">
                            <h4 className={`text-sm font-black uppercase tracking-wide mb-1 leading-tight ${isUnlocked ? 'text-slate-100 group-hover:text-white' : 'text-slate-600'}`}>
                                {ach.title}
                            </h4>
                            <p className="text-[10px] text-slate-400/80 font-medium leading-relaxed group-hover:text-slate-300 transition-colors">
                                {ach.description}
                            </p>
                            {isUnlocked && (
                                <div className="mt-3 inline-flex items-center gap-1.5 bg-slate-950/30 px-2 py-1 rounded-lg border border-slate-700/50">
                                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ach.color }}></div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: ach.color }}>Desbloqueado</span>
                                </div>
                            )}
                        </div>
                     </div>
                 );
             })}
        </div>
    );
  };

  if (!isOpen) return null;
  
  // Helper para saber si el timeRange es un mes numérico
  const isMonthSelected = !isNaN(parseInt(timeRange));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-[90vw] xl:max-w-7xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-slate-800 shrink-0 relative z-10">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 animate-pulse">
                {activeTab === 'stats' ? <BarChart3 size={24} /> : <Trophy size={24} />}
            </div>
            <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">
                    {activeTab === 'stats' ? 'Estadísticas' : 'Sala de Trofeos'}
                </h2>
                <p className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest mt-1">
                    {activeTab === 'stats' ? 'Análisis de rendimiento vital' : 'Hitos y Logros Desbloqueados'}
                </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-700/50">
                <button 
                    onClick={() => { setActiveTab('stats'); SoundManager.play('click'); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    Gráficas
                </button>
                <button 
                    onClick={() => { setActiveTab('achievements'); SoundManager.play('click'); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'achievements' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <Trophy size={14} /> Logros
                    <span className="bg-slate-900/50 px-1.5 py-0.5 rounded text-[9px]">{unlockedIds.length}</span>
                </button>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-colors shrink-0">
                <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
          
          {activeTab === 'stats' ? (
              <>
                <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-700 flex flex-col items-center justify-center overflow-hidden">
                    <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2 self-start w-full">
                    <Brain size={14} className="text-slate-500" /> Mapa de Calor Anual
                    </h3>
                    <Heatmap data={data} year={new Date().getFullYear()} />
                </div>

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

                            <div 
                                className="lg:col-span-2 flex flex-col relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-900 group"
                                ref={judgeRef}
                            >
                                <div className="absolute inset-0 z-0">
                                    <div className="absolute inset-0 opacity-[0.07] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                                         <img src={PEPE_ASSETS.COUNCIL} className="w-full h-full object-cover grayscale" />
                                    </div>

                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="absolute rounded-full bg-indigo-500/10 blur-xl animate-pulse" style={{
                                                top: `${Math.random() * 100}%`,
                                                left: `${Math.random() * 100}%`,
                                                width: `${Math.random() * 100 + 50}px`,
                                                height: `${Math.random() * 100 + 50}px`,
                                                animationDuration: `${Math.random() * 3 + 2}s`,
                                                animationDelay: `${Math.random() * 2}s`
                                            }}
                                        />
                                    ))}
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 z-0"></div>
                                </div>

                                <div className={`relative z-20 flex flex-row justify-between items-center px-6 pt-6 transition-[padding] duration-300 ${isJudgeCollapsed ? 'pb-6' : 'pb-2'}`}>
                                    <span className="text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Gavel size={18} className="text-indigo-400" />
                                        <span className="md:hidden">Tribunal de Pepe</span>
                                        <span className="hidden md:inline">Tribunal Supremo de Pepe</span>
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-white bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/40 shadow-sm animate-in fade-in flex items-center gap-2">
                                            <CalendarRange size={12} className="text-indigo-300" />
                                            <span className="hidden sm:inline">Juzgando:</span>
                                            <span className="text-indigo-300 uppercase tracking-wider">{getRangeLabel()}</span>
                                        </span>
                                        {/* BOTON MINIMIZAR / EXPANDIR ORGÁNICO */}
                                        <button 
                                            onClick={toggleJudgeCollapse}
                                            className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 border border-transparent hover:border-indigo-500/30 transition-all"
                                        >
                                            {isJudgeCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                                        </button>
                                    </div>
                                </div>
                            
                                {/* Contenedor Colapsable para el cuerpo del tribunal */}
                                <div 
                                    className={`
                                        flex-1 flex flex-col lg:flex-row items-center justify-center p-6 gap-8 relative z-10 
                                        transition-all duration-500 ease-in-out overflow-hidden
                                        ${isJudgeCollapsed ? 'max-h-0 opacity-0 py-0' : 'max-h-[800px] opacity-100'}
                                    `}
                                >
                                    <div className={`relative transition-all duration-700 ${loadingAi ? 'w-32 h-32 lg:w-40 lg:h-40' : aiAnalysis ? 'w-24 h-24 lg:w-32 lg:h-32' : 'w-40 h-40 lg:w-48 lg:h-48'}`}>
                                        <div className={`absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl transition-all duration-500 ${loadingAi ? 'animate-pulse scale-110' : 'opacity-50'}`}></div>
                                        <div className={`w-full h-full rounded-full overflow-hidden border-4 shadow-2xl relative transition-all duration-500 ${loadingAi ? 'border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.5)] bg-slate-950' : 'border-slate-700 shadow-xl bg-slate-800'} ${!loadingAi && !aiAnalysis ? 'animate-[float_4s_ease-in-out_infinite]' : ''}`}>
                                            <img 
                                                src={loadingAi ? loadingImage : judgeImage} 
                                                alt="Pepe Judge" 
                                                className={`w-full h-full transition-all duration-500 ${loadingAi ? 'object-contain p-1 opacity-90 animate-[color-pulse_2s_ease-in-out_infinite]' : 'object-contain p-2 bg-slate-900'}`} 
                                            />
                                            <style>{`@keyframes color-pulse { 0%, 100% { filter: grayscale(100%); opacity: 0.8; } 50% { filter: grayscale(0%); opacity: 1; } }`}</style>
                                            {loadingAi && (
                                                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10 rounded-full">
                                                    <div className="w-full h-[2px] bg-green-400 shadow-[0_0_10px_#4ade80] absolute top-0 animate-[scan_1.5s_ease-in-out_infinite]"></div>
                                                    <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
                                                    <style>{`@keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 z-20">
                                            {loadingAi ? (
                                                <div className="bg-slate-900 rounded-full p-2 border border-indigo-500 shadow-lg animate-spin">
                                                    <Loader2 size={20} className="text-indigo-400" />
                                                </div>
                                            ) : aiAnalysis ? (
                                                <div className="bg-green-600 rounded-full p-2 border-2 border-slate-900 shadow-lg animate-in zoom-in">
                                                    <Zap size={20} className="text-white fill-white" />
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left transition-all duration-500">
                                        {loadingAi ? (
                                            <div className="flex flex-col gap-2 items-center lg:items-start w-full animate-pulse">
                                                <div className="h-4 w-3/4 bg-indigo-500/20 rounded"></div>
                                                <div className="h-4 w-1/2 bg-indigo-500/20 rounded"></div>
                                                <div className="h-10 w-full bg-indigo-500/10 rounded-xl mt-4 border border-indigo-500/20 flex items-center justify-center text-indigo-300 text-xs font-mono uppercase tracking-widest px-4">
                                                    {loadingText}
                                                </div>
                                            </div>
                                        ) : aiAnalysis ? (
                                            parseAiResponse(aiAnalysis)
                                        ) : (
                                            <div className="flex flex-col gap-4 items-center lg:items-start max-w-md w-full">
                                                <h4 className="text-indigo-200 font-bold text-lg leading-tight">¿Listo para la sentencia?</h4>
                                                <p className="text-indigo-200/50 text-xs leading-relaxed">
                                                    Pepe analizará tus patrones del periodo <b>{getRangeLabel()}</b>. Elige la vibra del juez.
                                                </p>
                                                
                                                {/* NEW REDESIGNED JUDGE MOOD SELECTOR */}
                                                <div className="w-full grid grid-cols-2 gap-4 my-2">
                                                    <button 
                                                        onClick={() => setJudgeMood('roast')}
                                                        className={`
                                                            group relative overflow-hidden rounded-2xl p-4 border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3
                                                            ${judgeMood === 'roast' 
                                                                ? 'bg-gradient-to-br from-red-950/40 to-red-600/10 border-red-500 text-red-100 shadow-[0_0_25px_rgba(239,68,68,0.25)] scale-[1.02]' 
                                                                : 'bg-slate-900/40 border-slate-700 text-slate-500 hover:border-red-500/50 hover:text-red-300 hover:bg-red-900/10'
                                                            }
                                                        `}
                                                    >
                                                        <div className={`
                                                            p-3 rounded-full transition-transform duration-300 shadow-lg
                                                            ${judgeMood === 'roast' 
                                                                ? 'bg-red-500 text-white scale-110 shadow-red-500/30' 
                                                                : 'bg-slate-800 group-hover:bg-red-500/20 group-hover:scale-110'
                                                            }
                                                        `}>
                                                            <Skull size={24} className={judgeMood === 'roast' ? 'animate-[tada_1.5s_infinite]' : 'group-hover:text-red-400'} />
                                                        </div>
                                                        <div className="flex flex-col items-center gap-0.5 z-10">
                                                            <span className="text-[11px] font-black uppercase tracking-widest group-hover:text-red-200 transition-colors">Roast Mode</span>
                                                            <span className="text-[9px] font-medium opacity-60">Sin piedad</span>
                                                        </div>
                                                        {judgeMood === 'roast' && (
                                                            <>
                                                                <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
                                                                <Flame size={100} className="absolute -bottom-8 -right-8 text-red-500/10 blur-sm animate-pulse pointer-events-none" />
                                                            </>
                                                        )}
                                                    </button>

                                                    <button 
                                                        onClick={() => setJudgeMood('wholesome')}
                                                        className={`
                                                            group relative overflow-hidden rounded-2xl p-4 border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3
                                                            ${judgeMood === 'wholesome' 
                                                                ? 'bg-gradient-to-br from-pink-950/40 to-pink-600/10 border-pink-500 text-pink-100 shadow-[0_0_25px_rgba(236,72,153,0.25)] scale-[1.02]' 
                                                                : 'bg-slate-900/40 border-slate-700 text-slate-500 hover:border-pink-500/50 hover:text-pink-300 hover:bg-pink-900/10'
                                                            }
                                                        `}
                                                    >
                                                        <div className={`
                                                            p-3 rounded-full transition-transform duration-300 shadow-lg
                                                            ${judgeMood === 'wholesome' 
                                                                ? 'bg-pink-500 text-white scale-110 shadow-pink-500/30' 
                                                                : 'bg-slate-800 group-hover:bg-pink-500/20 group-hover:scale-110'
                                                            }
                                                        `}>
                                                            <Heart size={24} className={judgeMood === 'wholesome' ? 'animate-[bounce_2s_infinite]' : 'group-hover:text-pink-400'} />
                                                        </div>
                                                        <div className="flex flex-col items-center gap-0.5 z-10">
                                                            <span className="text-[11px] font-black uppercase tracking-widest group-hover:text-pink-200 transition-colors">Love Mode</span>
                                                            <span className="text-[9px] font-medium opacity-60">Amor duro</span>
                                                        </div>
                                                        {judgeMood === 'wholesome' && (
                                                            <>
                                                                <div className="absolute inset-0 bg-pink-500/5 animate-pulse pointer-events-none"></div>
                                                                <Sparkles size={16} className="absolute top-3 right-3 text-yellow-300 animate-[spin_3s_linear_infinite]" />
                                                                <Sparkles size={10} className="absolute bottom-4 left-4 text-pink-300 animate-pulse" />
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                <button onClick={(e) => handleAskPepe(e)} className="w-full group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] overflow-hidden mt-2 active:scale-95">
                                                    <span className="relative z-10 flex items-center gap-2"><Brain size={18} /> SOLICITAR VEREDICTO</span>
                                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 skew-y-12 transition-transform duration-500"></div>
                                                </button>
                                            </div>
                                        )}
                                        {errorAi && <p className="text-red-400 text-[10px] mt-4 font-bold bg-red-900/20 px-3 py-1 rounded-lg animate-in fade-in">{errorAi}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                    {renderEvolutionChart() as React.ReactElement}
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
              </>
          ) : (
            renderAchievements()
          )}

        </div>
      </div>
    </div>
  );
};

export default StatsModal;
