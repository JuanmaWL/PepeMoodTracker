import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Quote, Zap, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { YearData, MoodLevel } from '../types';
import { MOODS } from '../constants';

interface PepeOracleProps {
  data: YearData;
}

const ORACLE_FALLBACKS = [
  "Necesito más lore para juzgarte, lince. Registra un par de días más.",
  "Poco lore veo aquí, compañero. Vuelve cuando hayas vivido algo épico.",
  "¿Solo esto, titán? Mi sabiduría requiere al menos dos fragmentos de tu historia.",
  "El archivo está vacío, compañero. Dale chicha al diario para que Pepe hable.",
  "Falta contexto, titán. Registra más días o el Oráculo seguirá AFK.",
  "No puedo leer tu destino con tan poco material, compañero. Escribe más.",
  "Tu vida es un servidor vacío ahora mismo, titán. Necesito datos.",
  "Compañero, el Oráculo no hace milagros sin días de registro."
];

const PepeOracle: React.FC<PepeOracleProps> = ({ data }) => {
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isMagicActive, setIsMagicActive] = useState(false);

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
    if (!process.env.API_KEY || loading) return;
    
    const recent = getRecentLore();
    if (recent.length < 2) {
      const randomFallback = ORACLE_FALLBACKS[Math.floor(Math.random() * ORACLE_FALLBACKS.length)];
      setAdvice(randomFallback);
      return;
    }

    setLoading(true);
    setIsMagicActive(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        ACTÚA COMO: Pepe el Sabio (Pepe the Frog). Eres un filósofo de internet, cínico pero curiosamente motivador.
        CONTEXTO: Vas a dar un "Veredicto de Vida" basado en los últimos días del usuario.
        LORE RECIENTE: ${JSON.stringify(recent)}
        
        REGLAS:
        1. Sé breve (máximo 50 palabras).
        2. Usa español de internet (jerga: lince, crack, Canon, Épico, plot twist, compañero, figura, titán).
        3. NO USES LA PALABRA "BASADO" bajo ninguna circunstancia.
        4. Si el mood es malo, sé sarcásticamente comprensivo. Si es bueno, di que está en su "Prime".
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAdvice(response.text || "Pepe se ha quedado sin palabras.");
    } catch (e) {
      setAdvice("El Oráculo está saturado de normies. Inténtalo luego.");
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
        {/* Luces místicas ambientales */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10">
          
          {/* Imagen del Oráculo con marco místico y PARTÍCULAS VIOLETAS */}
          <div className="shrink-0 relative">
            {/* Partículas violetas estáticas (animadas) */}
            <div className="absolute inset-0 z-0">
               <div className="absolute -top-4 left-1/4 w-3 h-3 bg-purple-500 rounded-full blur-[2px] animate-bounce opacity-60"></div>
               <div className="absolute top-1/2 -right-6 w-2 h-2 bg-violet-400 rounded-full blur-[1px] animate-pulse opacity-80" style={{ animationDelay: '1s' }}></div>
               <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-fuchsia-600 rounded-full blur-[3px] animate-ping opacity-30"></div>
               <div className="absolute top-1/4 -left-8 w-2 h-2 bg-purple-300 rounded-full blur-[1px] animate-bounce opacity-70" style={{ animationDelay: '0.5s' }}></div>
               <div className="absolute bottom-1/4 right-0 w-3 h-3 bg-violet-600 rounded-full blur-[4px] animate-pulse"></div>
            </div>

            <div className={`absolute -inset-6 bg-gradient-to-br from-violet-600/30 via-purple-500/20 to-indigo-600/30 rounded-full blur-2xl transition-opacity duration-1000 ${isMagicActive ? 'opacity-100 scale-125' : 'opacity-60 group-hover:opacity-80'}`}></div>
            
            <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-8 border-purple-500/20 shadow-[0_0_50px_rgba(139,92,246,0.3)] transition-all duration-1000 relative z-10
              ${isMagicActive ? 'scale-110 rotate-12 ring-[12px] ring-purple-400/40' : 'hover:scale-105 group-hover:-rotate-6'}
            `}>
              <img 
                src="https://assets.foundation.app/0xa797Df356675F459e5Bb81bB2062646A0853e83C/2/nft.jpg" 
                alt="Pepe Oráculo" 
                className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-1000"
              />
              {loading && (
                <div className="absolute inset-0 bg-purple-900/70 backdrop-blur-md flex items-center justify-center">
                  <Loader2 className="text-white animate-spin" size={64} />
                </div>
              )}
            </div>
            
            {/* Medallón flotante */}
            <div className="absolute -bottom-4 -right-2 bg-gradient-to-br from-violet-600 to-indigo-700 p-4 rounded-3xl shadow-2xl border-2 border-purple-400/50 z-20 animate-bounce">
              <Sparkles size={24} className="text-white" />
            </div>
          </div>
          
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] bg-gradient-to-r from-violet-300 via-indigo-200 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl transition-all duration-1000 group-hover:tracking-normal">
                El Oráculo Supremo
              </h3>
              <div className="flex items-center justify-center lg:justify-start gap-4 text-purple-400/70 font-black text-sm uppercase tracking-[0.5em]">
                <BrainCircuit size={18} /> Lore Analysis Engine v3.0
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
                <p className="text-slate-400 text-lg md:text-xl font-medium opacity-70 max-w-lg leading-relaxed">
                  ¿Ansías conocer tu destino, compañero? El Oráculo Supremo de Pepe escudriña tu lore para dictar sentencia divina.
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
                {loading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span>Transcendiendo...</span>
                  </>
                ) : (
                  <>
                    <Zap size={24} className="fill-current animate-pulse text-yellow-300" />
                    <span>Dictar Veredicto</span>
                  </>
                )}
                
                {/* Shimmer effect */}
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