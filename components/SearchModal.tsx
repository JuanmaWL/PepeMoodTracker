import React, { useState, useMemo } from 'react';
import { X, Search, Calendar as CalendarIcon } from 'lucide-react';
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

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {query && results.length === 0 ? (
            <div className="text-center py-20 text-slate-500 italic">
              "No hay rastro de ese lore en la base de datos."
            </div>
          ) : !query ? (
            <div className="text-center py-20 text-slate-500">
              Escribe algo para empezar a excavar en tus recuerdos.
            </div>
          ) : (
            results.map(([date, entry]) => (
              <button 
                key={date}
                onClick={() => { onJumpToDate(date); onClose(); }}
                className="w-full text-left p-4 bg-slate-700/30 hover:bg-slate-700/60 border border-slate-700 rounded-2xl transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black text-slate-400 flex items-center gap-1">
                    <CalendarIcon size={12} /> {date}
                  </span>
                  <div 
                    className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                    style={{ backgroundColor: MOODS[entry.level].color, color: '#000' }}
                  >
                    {MOODS[entry.level].label}
                  </div>
                </div>
                <p className="text-slate-200 text-sm italic line-clamp-2">"{entry.note}"</p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;