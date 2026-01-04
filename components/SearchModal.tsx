import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Calendar as CalendarIcon, BookOpen, FileQuestion } from 'lucide-react';
import { YearData, MoodLevel, DayData } from '../types';
import { MOODS } from '../constants';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: YearData;
  onJumpToDate: (dateStr: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, data, onJumpToDate }) => {
  const [query, setQuery] = useState('');

  // Resetear la búsqueda cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  // Fixed the type error by explicitly casting Object.entries(data) to [string, DayData][]
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return (Object.entries(data) as [string, DayData][])
      .filter(([_, entry]) => entry.note.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b[0].localeCompare(a[0]));
  }, [data, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        
        <div className="p-6 border-b border-slate-700 bg-slate-800/50">
          {/* Header Nuevo Estilo */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-xl text-green-400 animate-pulse">
                    <Search size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">Buscador de Lore</h2>
                    <p className="text-[10px] text-green-400/80 font-bold uppercase tracking-widest mt-1">Explorador de Eventos Canónicos</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              autoFocus
              type="text"
              placeholder="¿Qué buscas? (ej: fiesta, examen, gimnasio...)"
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-900/30">
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
                {/* Icono más elegante, sin parpadeo agresivo, con sombra sutil y hover */}
                <div className="bg-slate-800/50 p-6 rounded-full mb-6 border border-slate-700/50 shadow-[0_0_30px_rgba(34,197,94,0.1)] transform hover:scale-105 transition-transform duration-500 group">
                    <BookOpen size={48} className="text-green-400/50 group-hover:text-green-400/80 transition-colors" />
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
                className="w-full text-left p-5 bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 hover:border-green-500/30 rounded-2xl transition-all group animate-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-slate-400 flex items-center gap-2 bg-slate-900/50 px-2 py-1 rounded-lg">
                    <CalendarIcon size={12} /> {date}
                  </span>
                  <div 
                    className="px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg"
                    style={{ backgroundColor: MOODS[entry.level].color, color: '#000' }}
                  >
                    {MOODS[entry.level].label}
                  </div>
                </div>
                <p className="text-slate-200 text-sm italic leading-relaxed pl-2 border-l-2 border-slate-700 group-hover:border-green-500/50 transition-colors">
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