import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Quote, Zap, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { YearData } from '../types';
import { MOODS } from '../constants';
import SoundManager from '../utils/sounds';

interface PepeOracleProps {
  data: YearData;
}

const ORACLE_FALLBACKS = [
  "Necesito más lore para juzgarte, lince. Registra un par de días más.",
  "Poco lore veo aquí, amigo. Vuelve cuando hayas vivido algo épico.",
  "¿Solo esto? Mi sabiduría requiere al menos dos fragmentos de tu historia.",
  "El archivo está vacío, tú. Dale chicha al diario para que Pepe hable.",
  "Falta contexto. Registra más días o el Oráculo seguirá AFK.",
  "No puedo leer tu destino con tan poco material, ¿sabes?. Escribe más.",
  "Tu vida es un servidor vacío ahora mismo. Necesito datos.",
  "Oye, el Oráculo no hace milagros sin días de registro."
];

const INITIAL_PHRASES = [
  "¿Ansías conocer tu destino? El Oráculo Supremo de Pepe escudriña tu lore para dictar sentencia divina.",
  "Los astros de la memética se alinean. Pepe sintoniza con tu frecuencia vital para revelarte la verdad.",
  "¿Buscas iluminación, pequeño renacuajo? El Ojo que Todo lo Ve de Pepe está analizando tus vibes.",
  "El destino es caprichoso, pero Pepe es absoluto. Deja que el Oráculo procese tu existencia.",
  "Silencio en la sala. El Oráculo Supremo está descargando los paquetes de tu futuro.",
  "No hay secreto que escape a la mirada de Pepe. Tu lore está siendo auditado en este preciso instante.",
  "¿Preparado para la verdad? El algoritmo místico de Pepe está listo para juzgar tu camino."
];

const PepeOracle: React.FC<PepeOracleProps> = ({ data }) => {
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isMagicActive, setIsMagicActive] = useState(false);
  const [initialPhrase] = useState(() => INITIAL_PHRASES[Math.floor(Math.random() * INITIAL_PHRASES.length)]);

  const getRecentLore = () => {
    const sortedDates = Object.keys(data).sort().reverse();
    return sortedDates.slice(0, 5).map(date => ({
      date,
      mood: MOODS[data[date].level].label,
      note: data[date].note
    }));
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-black text-white bg-indigo-500/20 px-1 rounded">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const askOracle = async () => {
    if (loading) return;
    
    // Play Magic Sound instantly
    SoundManager.play('magic');

    const recent = getRecentLore();
    const getRandomFallback = () => ORACLE_FALLBACKS[Math.floor(Math.random() * ORACLE_FALLBACKS.length)];

    if (recent.length < 2) {
      setAdvice(getRandomFallback());
      setIsMagicActive(true);
      setTimeout(() => setIsMagicActive(false), 500);
      return;
    }

    setLoading(true);
    setIsMagicActive(true);

    try {
      const apiKey = (import.meta as any).env?.VITE_PEPE_MOOD_KEY || (process as any).env?.NEXT_PUBLIC_PEPE_MOOD_KEY || process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const prompt = `
        ACTÚA COMO: Pepe el Oráculo Millennial.
        PERSONALIDAD: Eres un sabio de Internet, milleniall, nostálgico, irónico y un poco cansado de la "vida moderna".
        
        CONTEXTO: Vas a dar un "Veredicto de Vida", un oráculo futuro basado en los últimos días del usuario, como algo premonitorio.
        LORE RECIENTE: ${JSON.stringify(recent)}
        
        REGLAS DE ORO:
        1. Sé breve (máximo 50 palabras).
        2. NO USES MARKDOWN. Prohibido usar asteriscos (**), negritas o cursivas. Escribe texto plano natural.
        3. Usa jerga Millennial natural, no forzada): Puedes usar "Cringe", "Mood" o referencias a que "cualquier tiempo pasado fue mejor".
        4. Si el mood es malo, sé sarcásticamente comprensivo (tipo: "te entiendo, tío, ya lo siento."). Si es bueno, celebra pero con ironía (tipo: "aprovéchalo antes de que se rompa algo").
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAdvice(response.text || "Pepe se ha quedado sin palabras.");
    } catch (e) {
      console.error("Oracle Error:", e);
      setAdvice("El Oráculo está saturado o la conexión ha petado. Inténtalo luego.");
    } finally {
      setLoading(false);
      setTimeout(() => setIsMagicActive(false), 1000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-16 px-4">
      <div className={`bg-slate-950/80 backdrop-blur-3xl border border-indigo-500/30 rounded-[4rem] p-10 md:p-16 shadow-[0_0_80px_rgba(99,102,241,0.1)] relative overflow-hidden group transition-all duration-1000
        ${isMagicActive ? 'magic-channeling shadow-[0_0_120px_rgba(167,139,250,0.5)] ring-4 ring-purple-400/50' : 'hover:shadow-[0_0_100px_rgba(99,102,241,0.2)]'}
      `}>
        {/* Imagen de fondo sutil solicitada */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.12] mix-blend-overlay">
          <img 
            src="https://i.imgur.com/0JD4l8Q.png" 
            className="w-full h-full object-cover grayscale brightness-150" 
            alt="" 
          />
        </div>

        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10">
          
          {/* SECCIÓN DE IMAGEN / PORTAL */}
          <div className="shrink-0 relative flex items-center justify-center">
            
            {/* ANILLO 1: Portal Rúnico Exterior (Discontinuo, Lento) */}
            <div className={`
                absolute -inset-[22px] rounded-full border-2 border-dashed border-violet-500/30 
                animate-spin-slow transition-all duration-1000 z-0
                ${isMagicActive ? 'border-violet-400/60 scale-110' : ''}
            `}></div>

            {/* ANILLO 2: Energía Interior (Inverso, Rápido) */}
            <div className={`
                absolute -inset-[10px] rounded-full border border-indigo-400/40 
                animate-spin-reverse-slow transition-all duration-1000 z-0
                ${isMagicActive ? 'border-fuchsia-400/50 scale-105' : ''}
            `}></div>

            {/* PARTÍCULAS ORBITALES (Divs animados con CSS puro) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                {/* Partícula 1 (Orbita CW) */}
                <div className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] animate-[orbit-cw_4s_linear_infinite]"></div>
                {/* Partícula 2 (Orbita CCW) */}
                <div className="absolute w-1.5 h-1.5 bg-fuchsia-500 rounded-full shadow-[0_0_8px_#d946ef] animate-[orbit-ccw_5s_linear_infinite]"></div>
                {/* Partícula 3 (Orbita Lenta) */}
                 <div className="absolute w-1 h-1 bg-yellow-300 rounded-full shadow-[0_0_5px_#fde047] animate-[orbit-cw_7s_linear_infinite]"></div>
            </div>

            {/* GLOW DE FONDO DETRÁS DE LA IMAGEN */}
            <div className={`absolute -inset-6 bg-gradient-to-br from-violet-600/30 via-purple-500/20 to-indigo-600/30 rounded-full blur-2xl transition-opacity duration-1000 ${isMagicActive ? 'opacity-100 scale-125' : 'opacity-60 group-hover:opacity-80'}`}></div>
            
            {/* CONTENEDOR DE IMAGEN PRINCIPAL */}
            <div className={`
              w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden 
              border-4 border-slate-900/50 shadow-[0_0_50px_rgba(139,92,246,0.3)] 
              transition-all duration-1000 relative z-10 bg-slate-900
              ${isMagicActive ? 'scale-105 rotate-3 ring-2 ring-purple-400/40' : 'hover:scale-105 group-hover:-rotate-2'}
            `}>
              <img 
                src="https://assets.foundation.app/0xa797Df356675F459e5Bb81bB2062646A0853e83C/2/nft.jpg" 
                alt="Pepe Oráculo" 
                className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-1000"
              />
              {loading && (
                <div className="absolute inset-0 bg-purple-900/60 backdrop-blur-sm flex items-center justify-center rounded-full overflow-hidden">
                  <Loader2 className="text-white animate-spin" size={64} />
                </div>
              )}
            </div>
            
            {/* ICONO SPARKLE FLOTANTE */}
            <div className="absolute -bottom-4 -right-2 bg-gradient-to-br from-violet-600 to-indigo-700 p-4 rounded-3xl shadow-2xl border-2 border-purple-400/50 z-30 animate-bounce">
              <Sparkles size={24} className="text-white" />
            </div>
          </div>
          
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="space-y-4">
              {/* TITULO CON ANIMACIÓN MÍSTICA REFORZADA */}
              <h3 className="
                text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[1.2] pt-6 
                bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-300
                bg-clip-text text-transparent 
                animate-text-flow
                drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]
                transition-all duration-300 ease-out origin-center
                hover:scale-[1.03] hover:drop-shadow-[0_0_25px_rgba(192,132,252,0.6)] cursor-default
              ">
                Oráculo Supremo
              </h3>
              <div className="flex items-center justify-center lg:justify-start gap-4 text-purple-400/70 font-black text-sm uppercase tracking-[0.5em]">
                <BrainCircuit size={18} /> Pepe Analysis Engine v3.3
              </div>
            </div>
            
            <div className="min-h-[5rem] relative">
              {advice ? (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                  <Quote size={32} className="text-purple-500/20 absolute -top-8 -left-10 hidden lg:block" />
                  <p className="text-slate-100 text-xl md:text-2xl font-bold italic leading-snug drop-shadow-sm">
                    "{renderFormattedText(advice)}"
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 text-lg md:text-xl font-medium opacity-70 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  {initialPhrase}
                </p>
              )}
            </div>
            
            <div className="pt-6 flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <button 
                onClick={askOracle}
                disabled={loading}
                className={`
                  relative overflow-hidden px-12 py-5 rounded-[2rem] font-black text-base uppercase tracking-[0.3em] transition-all duration-700 flex items-center justify-center gap-4 min-w-[280px]
                  ${loading 
                    ? 'bg-slate-800 text-slate-600 cursor-wait' 
                    : 'bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-600 text-white shadow-[0_20px_60px_-15px_rgba(139,92,246,0.5)] hover:shadow-[0_25px_80px_-10px_rgba(167,139,250,0.6)] active:scale-95 hover:-translate-y-2'
                  }
                `}
              >
                {/* Efecto de partículas CSS en el botón */}
                {loading && (
                  <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                       <div 
                         key={i}
                         className="absolute bg-white/30 rounded-full animate-ping"
                         style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${Math.random() * 10 + 2}px`,
                            height: `${Math.random() * 10 + 2}px`,
                            animationDuration: `${Math.random() * 1 + 0.5}s`,
                            animationDelay: `${Math.random() * 0.5}s`
                         }}
                       />
                    ))}
                  </div>
                )}

                {loading ? (
                  <>
                    <Loader2 size={24} className="animate-spin relative z-10" />
                    <span className="relative z-10">Transcendiendo...</span>
                  </>
                ) : (
                  <>
                    <Zap size={24} className="fill-current animate-pulse text-yellow-300 relative z-10" />
                    <span className="relative z-10">Dictar Veredicto</span>
                  </>
                )}
                {!loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PepeOracle;