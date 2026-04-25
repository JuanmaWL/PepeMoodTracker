
import React, { useMemo, useState } from 'react';
import { X, BrainCircuit, CalendarRange, Filter, Sparkles, Zap, Network } from 'lucide-react';
import { YearData, DayData } from '../types';
import { MONTHS } from '../constants';
import SoundManager from '../utils/sounds';

interface CloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: YearData;
}

type TimeRange = 'all' | 'last_7' | 'last_30' | string;

// Lista Negra (Stopwords) Ampliada
const SPANISH_STOPWORDS = new Set([
  // Preposiciones y conjunciones
  "a", "ante", "bajo", "cabe", "con", "contra", "de", "desde", "durante",
  "en", "entre", "hacia", "hasta", "mediante", "para", "por", "según", "segun",
  "sin", "so", "sobre", "tras", "versus", "via", "y", "e", "ni", "o", "u",
  "pero", "mas", "sino", "aunque", "porque", "pues", "si", "no",
  
  // Artículos
  "el", "la", "los", "las", "un", "una", "unos", "unas", "lo", "al", "del",
  
  // Pronombres y posesivos
  "yo", "tu", "el", "ella", "ello", "nosotros", "nosotras", "vosotros", "vosotras",
  "ellos", "ellas", "mi", "mis", "tu", "tus", "su", "sus", "nuestro", "nuestra",
  "vuestro", "vuestra", "me", "te", "se", "nos", "os", "le", "les", "migo", "tigo",
  "conmigo", "contigo", "consigo", "que", "qué", "quien", "quién", "cual", "cuál",
  "cuanto", "cuánto", "donde", "dónde", "como", "cómo", "cuando", "cuándo",
  "este", "esta", "esto", "estos", "estas", "ese", "esa", "eso", "esos", "esas",
  "aquel", "aquella", "aquello", "mismo", "misma", "otro", "otra", "otros", "otras",
  "todo", "toda", "todos", "todas", "nada", "algo", "alguien", "nadie",
  
  // Verbos auxiliares / comunes (ser, estar, haber, tener, ir, hacer...)
  "soy", "eres", "es", "somos", "sois", "son", "fui", "fuiste", "fue", "fuimos", "fueron",
  "era", "eras", "eramos", "eran", "sido", "siendo",
  "estoy", "estas", "esta", "estamos", "estais", "estan", "estuve", "estuviste", "estuvo",
  "estuvimos", "estuvieron", "estaba", "estabas", "estabamos", "estaban", "estado", "estando",
  "he", "has", "ha", "hemos", "habeis", "han", "hube", "hubiste", "hubo", "hubimos", "hubieron",
  "habia", "habias", "habiamos", "habian", "habido", "habiendo",
  "tengo", "tienes", "tiene", "tenemos", "teneis", "tienen", "tuve", "tuviste", "tuvo",
  "tuvimos", "tuvieron", "tenia", "tenias", "teniamos", "tenian", "tenido", "teniendo",
  "voy", "vas", "va", "vamos", "vais", "van", "iba", "ibas", "ibamos", "iban", "ido", "yendo",
  "hago", "haces", "hace", "hacemos", "haceis", "hacen", "hice", "hiciste", "hizo",
  "hicimos", "hicieron", "hacia", "hacias", "haciamos", "hacian", "hecho", "haciendo",
  "puedo", "puedes", "puede", "podemos", "podeis", "pueden", "podia", "podias", "podiamos",
  "queria", "querias", "queriamos", "dije", "dijo", "dice", "dicen", "saber", "sabia",
  "creo", "parece", "siento", "veo", "digo", "bueno", "malo", "claro", "vale",
  
  // Adverbios y tiempo
  "muy", "mucho", "poco", "bastante", "tan", "tanto", "asi", "entonces", "luego",
  "ahora", "despues", "mientras", "siempre", "nunca", "jamas", "tambien", "tampoco",
  "quizas", "talvez", "acaso", "aqui", "alli", "alla", "ahi", "cerca", "lejos",
  "arriba", "abajo", "dentro", "fuera", "encima", "debajo", "delante", "detras",
  "hoy", "ayer", "mañana", "dia", "dias", "año", "mes", "semana", "vez", "veces",
  "fin", "principio", "mitad", "lado", "parte", "gran", "solo", "solamente", "super",
  
  // Días y meses
  "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo",
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
]);

// Palabras cortas permitidas (Whitelist)
const WHITELIST_SHORT = new Set(['sol', 'mar', 'luz', 'paz', 'fe', 'ron', 'bar', 'gym', 'gas', 'red', 'gol', 'ojo', 'sed', 'fan', 'zen', 'vip', 'té', 'fe', 'ir']);

const CloudModal: React.FC<CloudModalProps> = ({ isOpen, onClose, data }) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  const getRangeLabel = () => {
    if (timeRange === 'all') return 'Todo el Año';
    if (timeRange === 'last_7') return 'Últimos 7 Días';
    if (timeRange === 'last_30') return 'Últimos 30 Días';
    return MONTHS[parseInt(timeRange)];
  };

  const words = useMemo(() => {
    if (!data) return [];
    
    // 1. Filtrar datos por fecha
    const entries = Object.entries(data) as [string, DayData][];
    const allValidEntries = entries.filter(([_, d]) => d.note && d.note.trim().length > 0).sort((a, b) => a[0].localeCompare(b[0]));
    
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
    }

    if (filteredEntries.length === 0) return [];

    // 2. Procesamiento de texto con preservación de tildes
    const allNotes = filteredEntries.map(([_, d]) => d.note || '').join(' . '); 
    
    // Limpieza básica pero manteniendo tildes para el display
    // Solo quitamos caracteres raros que no sean letras o números
    const cleanText = allNotes
        .toLowerCase()
        .replace(/[^a-záéíóúñü0-9\s]/g, " "); 

    const tokens = cleanText.split(/\s+/);
    
    // Estructura: { "palabra_sin_tilde": { count: 10, variants: { "canción": 8, "cancion": 2 } } }
    const groupedCounts: Record<string, { count: number, variants: Record<string, number> }> = {};

    // 3. Conteo Inteligente
    tokens.forEach(token => {
        if (!token) return;
        // Filtrar números puros
        if (/^\d+$/.test(token)) return;
        // Normalizar clave (sin tildes) para agrupar
        const normalizedKey = token.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Filtrar palabras muy cortas (salvo whitelist)
        if (normalizedKey.length < 3 && !WHITELIST_SHORT.has(token)) return;
        // Filtrar Stopwords (usando la clave normalizada)
        if (SPANISH_STOPWORDS.has(normalizedKey)) return;

        if (!groupedCounts[normalizedKey]) {
            groupedCounts[normalizedKey] = { count: 0, variants: {} };
        }
        
        groupedCounts[normalizedKey].count++;
        groupedCounts[normalizedKey].variants[token] = (groupedCounts[normalizedKey].variants[token] || 0) + 1;
    });

    // 4. Algoritmo de Fusión (Singularización)
    const uniqueKeys = Object.keys(groupedCounts).sort((a, b) => b.length - a.length);

    uniqueKeys.forEach(key => {
        if (!groupedCounts[key]) return; // Ya fue fusionado

        let stem = null;
        
        // Plurales simples (s, es)
        if (key.endsWith('es')) {
            const candidate = key.slice(0, -2);
            if (groupedCounts[candidate]) stem = candidate;
        } else if (key.endsWith('s') && !key.endsWith('ss')) {
            const candidate = key.slice(0, -1);
            if (groupedCounts[candidate]) stem = candidate;
        }

        if (stem) {
            // Fusionar conteos
            groupedCounts[stem].count += groupedCounts[key].count;
            // Fusionar variantes para decidir nombre final
            Object.entries(groupedCounts[key].variants).forEach(([variant, count]) => {
                groupedCounts[stem].variants[variant] = (groupedCounts[stem].variants[variant] || 0) + count;
            });
            delete groupedCounts[key];
        }
    });

    // 5. Determinar Display Name (la variante más usada) y convertir a array
    let result = Object.entries(groupedCounts)
      .map(([key, data]) => {
          // Encontrar la variante más frecuente (ej: "música" vs "musica")
          let bestVariant = key;
          let maxVariantCount = 0;
          
          Object.entries(data.variants).forEach(([v, c]) => {
              if (c > maxVariantCount) {
                  maxVariantCount = c;
                  bestVariant = v;
              }
          });

          return { 
              text: bestVariant, 
              value: data.count,
              animDuration: 3 + (Math.random() * 2), // Pre-calculate random values
              animDelay: -(Math.random() * 5)
          };
      })
      .filter(item => item.value >= 1)
      .sort((a, b) => b.value - a.value);

    // Limitar cantidad mostrada
    const maxItemsToShow = 45;
    return result.slice(0, maxItemsToShow);

  }, [data, timeRange]);

  const maxCount = words.length > 0 ? words[0].value : 1;
  const minCount = words.length > 0 ? words[words.length - 1].value : 0;

  if (!isOpen) return null;

  const handleWordClick = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    if (selectedWord === word) {
        setSelectedWord(null);
    } else {
        SoundManager.play('pop');
        setSelectedWord(word);
    }
  };

  const handleBackgroundClick = () => {
    if (selectedWord) setSelectedWord(null);
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in"
        onClick={handleBackgroundClick}
    >
      <div 
        className="bg-slate-900/90 border border-slate-700/50 w-full max-w-4xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[85vh] max-h-[800px] relative ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* FONDO NEURONAL ANIMADO */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
             {/* Grid Cyberpunk */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            {/* Orbes flotantes */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* HEADER UNIFICADO: NEURAL NET */}
        <div className="p-6 md:p-8 border-b border-white/5 flex flex-col gap-4 bg-slate-900/50 relative z-20 backdrop-blur-xl shrink-0">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20 animate-pulse relative group">
                    <BrainCircuit size={28} className="relative z-10" />
                    <div className="absolute inset-0 bg-white/20 blur-lg group-hover:animate-ping"></div>
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-400 bg-clip-text text-transparent filter drop-shadow-sm">
                        Pepe Neural Net
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <Zap size={12} className="fill-current" />
                            Mapa de Conceptos
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

          {/* FILTRO DE RANGO */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-slate-400 px-3">
                    <Filter size={14} className="text-indigo-400" />
                    <span className="text-[10px] uppercase font-black tracking-widest">Sincronizar Datos:</span>
                </div>
                
                <div className="relative group w-full sm:w-auto flex-1">
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                        <CalendarRange size={14} />
                    </div>
                    <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="w-full bg-slate-800 text-white text-[10px] font-bold py-2.5 px-4 pr-10 rounded-xl outline-none hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700 focus:border-indigo-500 appearance-none uppercase tracking-wide shadow-inner"
                    >
                        <option value="last_7">Últimos 7 días</option>
                        <option value="last_30">Últimos 30 días</option>
                        <option disabled>──────────</option>
                        {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                        <option disabled>──────────</option>
                        <option value="all">Todo el Año</option>
                    </select>
                </div>
          </div>
        </div>

        {/* CONTENT */}
        <div 
            className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10 bg-gradient-to-b from-slate-900/0 to-slate-950/50"
            onClick={handleBackgroundClick}
        >
          {words.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 animate-in fade-in zoom-in duration-300">
                <div className="bg-slate-800/50 p-8 rounded-full mb-6 border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)] transform hover:scale-105 transition-transform duration-500 group relative">
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping opacity-20"></div>
                    <BrainCircuit size={64} className="text-indigo-400/50 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="text-xl font-black text-slate-300 mb-2 uppercase tracking-tight">Sin Señal Neuronal</h3>
                <p className="text-xs uppercase tracking-widest text-slate-500 max-w-xs leading-relaxed">
                  No se detectan patrones en <span className="text-indigo-400 font-bold">{getRangeLabel()}</span>. 
                  Alimenta la IA con más vivencias.
                </p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-3 md:gap-5 content-center min-h-full py-10 perspective-[1000px]">
              {words.map((w, i) => {
                let normalized = 0;
                if (maxCount !== minCount) {
                  normalized = (w.value - minCount) / (maxCount - minCount);
                } else {
                  normalized = 1; 
                }

                // Ajuste de tamaños con penalización por longitud para móviles
                const minSize = 0.9;
                const maxSize = 3.5;
                let size = minSize + (Math.pow(normalized, 1.2) * (maxSize - minSize)); 
                
                const wordLength = w.text.length;
                if (wordLength > 12) size = size * 0.6; 
                else if (wordLength > 8) size = size * 0.8;
                
                const isSelected = selectedWord === w.text;
                const isTop = i < 5;

                // Estilos dinámicos para el "Nodo"
                const nodeColors = [
                    { text: 'text-emerald-200', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
                    { text: 'text-cyan-200', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20' },
                    { text: 'text-indigo-200', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', glow: 'shadow-indigo-500/20' },
                    { text: 'text-fuchsia-200', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', glow: 'shadow-fuchsia-500/20' },
                    { text: 'text-rose-200', bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: 'shadow-rose-500/20' },
                ];
                
                const styleIndex = w.text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % nodeColors.length;
                const style = nodeColors[styleIndex];

                return (
                  <button 
                    key={w.text}
                    onClick={(e) => handleWordClick(e, w.text)}
                    className={`
                      relative group outline-none select-none
                      px-4 py-2 rounded-full border backdrop-blur-sm
                      transition-all duration-500 cursor-pointer
                      flex items-center gap-2
                      ${isSelected ? 'z-50 scale-110 bg-slate-900 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'hover:scale-105 hover:bg-slate-800/60'}
                      ${isSelected ? 'opacity-100' : 'opacity-90 hover:opacity-100'}
                      ${style.bg} ${style.border}
                    `}
                    style={{ 
                      opacity: selectedWord && !isSelected ? 0.3 : 1,
                      transform: isSelected ? 'scale(1.15) translateZ(20px)' : `scale(1) translateZ(0px)`,
                      boxShadow: isSelected || isTop ? `0 0 15px ${style.glow.replace('shadow-', '').replace('/20', '')}` : 'none',
                      animation: isSelected ? 'none' : `float ${w.animDuration}s ease-in-out infinite`,
                      animationDelay: `${w.animDelay}s`
                    }}
                  > 
                    {/* Estilos para animación flotante */}
                    <style>{`
                        @keyframes float {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-5px); }
                        }
                    `}</style>

                    {/* Nodo Dot */}
                    <div className={`
                        w-1.5 h-1.5 rounded-full transition-all duration-500
                        ${isSelected ? 'bg-white scale-150' : style.text.replace('text-', 'bg-').replace('-200', '-400')}
                        ${isTop ? 'animate-pulse' : ''}
                    `}></div>

                    {/* Texto */}
                    <span 
                        className={`
                            font-black uppercase tracking-tight leading-none text-center
                            ${style.text}
                            ${isSelected ? '!text-white' : ''}
                            drop-shadow-sm
                        `}
                        style={{ fontSize: `${size}rem` }}
                    >
                        {w.text}
                    </span>

                    {/* Badge de conteo (Solo visible en hover/select) */}
                    <div className={`
                        absolute -top-3 -right-3 
                        bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-600
                        transition-all duration-300 shadow-xl z-20
                        ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'}
                    `}>
                        {w.value}
                    </div>
                    
                    {/* Brillo interno */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* FOOTER */}
        <div className="p-3 md:p-4 bg-slate-950/80 border-t border-white/5 flex justify-between items-center px-6 md:px-8 relative z-20 backdrop-blur-md">
             <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sistema Online</span>
                 </div>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                <Sparkles size={10} className="text-indigo-300" />
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-[0.2em]">
                    {words.length} Conceptos
                </p>
             </div>
        </div>

      </div>
    </div>
  );
};

export default CloudModal;
