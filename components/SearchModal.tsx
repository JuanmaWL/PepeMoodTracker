
import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Calendar as CalendarIcon, BookOpen, FileQuestion } from 'lucide-react';
import { YearData, DayData } from '../types';
import { MOODS } from '../constants';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: YearData;
  onJumpToDate: (dateStr: string) => void;
  onHighlightResults: (dates: string[]) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, data, onJumpToDate, onHighlightResults }) => {
  const [query, setQuery] = useState('');

  // Fixed the type error by explicitly casting Object.entries(data) to [string, DayData][]
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return (Object.entries(data) as [string, DayData][])
      .filter(([_, entry]) => entry.note.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b[0].localeCompare(a[0]));
  }, [data, query]);

  // Efecto para actualizar los highlights en el calendario principal en tiempo real
  useEffect(() => {
      const dates = results.map(([date]) => date);
      onHighlightResults(dates);
  }, [results, onHighlightResults]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900/90 border border-slate-700/50 w-full max-w-[90vw] xl:max-w-4xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[85vh] relative ring-1 ring-white/10">
        
        {/* Background Ambient */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]"></div>
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>

        {/* HEADER UNIFICADO: BUSCADOR */}
        <div className="p-6 md:p-8 border-b border-white/5 flex flex-col gap-4 bg-slate-900/50 relative z-20 backdrop-blur-xl shrink-0">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20 animate-pulse relative group">
                    <Search size={28} className="relative z-10" />
                    <div className="absolute inset-0 bg-white/20 blur-lg group-hover:animate-ping"></div>
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none bg-gradient-to-r from-emerald-200 via-green-200 to-emerald-400 bg-clip-text text-transparent filter drop-shadow-sm">
                        Buscador
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-bold uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                            <BookOpen size={12} />
                            Archivo
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

          <div className="relative mt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              autoFocus
              type="text"
              placeholder="¿Qué buscas? (ej: fiesta, examen, gimnasio...)"
              className="w-full bg-slate-800/80 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all placeholder:text-slate-600 font-medium"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-slate-900/0 to-slate-950/50 relative z-10">
          {query && results.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 animate-in fade-in zoom-in duration-300">
                <div className="bg-slate-800/80 p-6 rounded-full mb-4 border border-slate-700 shadow-xl">
                    <FileQuestion size={48} className="text-slate-600" />
                </div>
                <div className="text-4xl mb-2 opacity-50 grayscale">🐸</div>
                <h3 className="text-lg font-black text-slate-300 mb-1">Lore 404: Not Found</h3>
                <p className="text-xs uppercase tracking-widest text-slate-500 max-w-xs leading-relaxed">
                  Pepe no encuentra rastro de eso en los archivos. ¿Quizás lo soñaste?
                </p>
            </div>
          ) : !query ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 animate-in fade-in duration-500">
                <div className="bg-slate-800/50 p-6 rounded-full mb-6 border border-slate-700/50 shadow-[0_0_30px_rgba(34,197,94,0.1)] transform hover:scale-105 transition-transform duration-500 group">
                    <BookOpen size={48} className="text-emerald-400/50 group-hover:text-emerald-400/80 transition-colors" />
                </div>
                <h3 className="text-xl font-black text-slate-400 mb-2 uppercase tracking-tight">El Archivo te espera</h3>
                <p className="text-xs uppercase tracking-widest text-slate-500 max-w-xs leading-relaxed">
                  Escribe una palabra clave para invocar los recuerdos del pasado.
                </p>
            </div>
          ) : (
            results.map(([date, entry]) => (
              <button 
                key={date}
                onClick={() => { onJumpToDate(date); onClose(); }}
                className="w-full text-left p-5 bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 hover:border-emerald-500/30 rounded-2xl transition-all group animate-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-slate-400 flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded-lg border border-white/5">
                    <CalendarIcon size={12} /> {date}
                  </span>
                  <div 
                    className="px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg"
                    style={{ backgroundColor: MOODS[entry.level].color, color: '#000' }}
                  >
                    {MOODS[entry.level].label}
                  </div>
                </div>
                <p className="text-slate-200 text-sm italic leading-relaxed pl-2 border-l-2 border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                    "{entry.note}"
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
