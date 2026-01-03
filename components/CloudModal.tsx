import React, { useMemo } from 'react';
import { X, CloudFog } from 'lucide-react';
import { YearData, DayData } from '../types';

interface CloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: YearData;
}

const STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero', 'si', 'no',
  'de', 'del', 'a', 'al', 'en', 'por', 'para', 'con', 'sin', 'sobre', 'entre', 'tras',
  'yo', 'tu', 'el', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas', 'mi', 'tu', 'su',
  'que', 'cual', 'quien', 'como', 'donde', 'cuando', 'cuanto', 'tan', 'muy', 'mas', 'menos',
  'es', 'son', 'fue', 'fueron', 'era', 'eran', 'ser', 'estar', 'haber', 'tener', 'hacer',
  'dia', 'hoy', 'ayer', 'mañana', 'año', 'mes', 'semana', 'hora', 'minuto', 'segundo',
  'todo', 'nada', 'algo', 'alguien', 'nadie', 'algun', 'ningun', 'otro', 'otra', 'otros', 'otras',
  'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella', 'aquellos', 'aquellas',
  'me', 'te', 'se', 'nos', 'os', 'le', 'les', 'lo', 'la', 'los', 'las', 'ha', 'he', 'han', 'hay'
]);

const CloudModal: React.FC<CloudModalProps> = ({ isOpen, onClose, data }) => {
  const words = useMemo(() => {
    if (!data) return [];
    
    const allText = (Object.values(data) as DayData[])
      .map(d => d.note || '')
      .join(' ')
      .toLowerCase();

    // Limpieza agresiva: solo letras y acentos
    const tokens = allText
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOPWORDS.has(w));

    const counts: Record<string, number> = {};
    tokens.forEach(t => {
      counts[t] = (counts[t] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]) // Ordenar por frecuencia
      .slice(0, 60) // Top 60 palabras
      .map(([text, value]) => ({ text, value }));
  }, [data]);

  const maxCount = words.length > 0 ? words[0].value : 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[80vh] max-h-[800px]">
        
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400">
                <CloudFog size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">Pepe Mindset</h2>
                <p className="text-[10px] text-pink-400/80 font-bold uppercase tracking-widest mt-1">Lo que habita en tu cabeza</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-900/50">
          {words.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
              <CloudFog size={64} className="mb-4 text-slate-700" />
              <p className="italic">"Mente vacía, vida tranquila... o falta de datos."</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 content-center min-h-full">
              {words.map((w, i) => {
                // Cálculo de tamaño logarítmico para suavizar diferencias
                const size = Math.max(0.8, Math.min(4, 0.5 + (w.value / maxCount) * 3.5));
                const opacity = Math.max(0.4, Math.min(1, 0.3 + (w.value / maxCount)));
                
                // Asignación de colores basada en índices (no semántica, pero estética)
                const colors = [
                   'text-green-400', 'text-emerald-300', 'text-teal-200', 
                   'text-indigo-400', 'text-violet-300', 'text-purple-200',
                   'text-pink-400', 'text-rose-300' 
                ];
                const colorClass = colors[i % colors.length];
                const isBig = i < 5;

                return (
                  <span 
                    key={w.text}
                    className={`
                      ${colorClass} font-black uppercase tracking-tight transition-all duration-500 hover:scale-110 cursor-default select-none
                      ${isBig ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] z-10' : ''}
                    `}
                    style={{ 
                      fontSize: `${size}rem`,
                      opacity: opacity
                    }}
                    title={`${w.value} veces`}
                  >
                    {w.text}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-800 border-t border-slate-700 text-center">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                {words.length} conceptos extraídos de tu lore
             </p>
        </div>

      </div>
    </div>
  );
};

export default CloudModal;