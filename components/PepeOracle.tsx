import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Quote } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { YearData, MoodLevel } from '../types';
import { MOODS } from '../constants';

interface PepeOracleProps {
  data: YearData;
}

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
      setAdvice("Necesito más lore para juzgarte, lince. Registra un par de días más.");
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
        1. Sé breve (máximo 40 palabras).
        2. Usa español de internet (jerga: lince, crack, Canon, Épico, plot twist).
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
    <div className="w-full max-w-2xl mx-auto mb-12 px-4">
      <div className={`bg-slate-900/60 backdrop-blur-md border border-indigo-500/30 rounded-[2rem] p-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden group transition-all duration-500
        ${isMagicActive ? 'magic-channeling shadow-[0_0_50px_rgba(99,102,241,0.5)] ring-2 ring-indigo-400' : ''}
      `}>
        <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <BrainCircuit size={120} className="text-indigo-400" />
        </div>
        
        {isMagicActive && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/20 blur-[60px] animate-pulse"></div>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="shrink-0">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg ring-4 ring-indigo-500/20 transition-transform duration-500
              ${isMagicActive ? 'scale-110 rotate-12' : ''}
            `}>
              <Sparkles className={`text-white transition-all duration-700 ${isMagicActive ? 'scale-125' : 'animate-pulse'}`} size={40} />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-indigo-300 font-black text-xs uppercase tracking-[0.3em] mb-2 flex items-center justify-center md:justify-start gap-2">
              <Quote size={14} /> El Oráculo de Pepe
            </h3>
            
            {advice ? (
              <p className="text-slate-100 text-sm md:text-base font-medium italic leading-relaxed animate-in fade-in slide-in-from-left duration-500">
                "{renderFormattedText(advice)}"
              </p>
            ) : (
              <p className="text-slate-400 text-sm font-medium">
                ¿Quieres saber qué piensa Pepe de tu semana? El Oráculo está listo para juzgarte.
              </p>
            )}
            
            <button 
              onClick={askOracle}
              disabled={loading}
              className={`mt-4 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-2 mx-auto md:mx-0 disabled:opacity-50
                ${isMagicActive ? 'opacity-0' : 'opacity-100'}
              `}
            >
              {loading ? "Canalizando energía cósmica..." : "Consultar Veredicto →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PepeOracle;