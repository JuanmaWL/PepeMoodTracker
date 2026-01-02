import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { MOODS } from '../constants';
import { MoodLevel, DayData } from '../types';

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DayData) => void;
  initialData: DayData;
  dateStr: string;
}

const MoodModal: React.FC<MoodModalProps> = ({ isOpen, onClose, onSave, initialData, dateStr }) => {
  const [level, setLevel] = useState<MoodLevel>(MoodLevel.None);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLevel(initialData.level || MoodLevel.None);
      setNote(initialData.note || '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ level, note });
    onClose();
  };

  // Helper to get day and month name for display with specific capitalization
  const formatDateDisplay = (isoDate: string) => {
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const formatted = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    // Convert to lowercase first, then capitalize only the very first letter
    const lower = formatted.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/80">
          <h2 className="text-xl font-black text-slate-100 tracking-tight">
            {formatDateDisplay(dateStr)}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          
          {/* Mood Selection */}
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4 opacity-70">¿Cómo ha sido el día?</p>
            <div className="space-y-3">
              {[MoodLevel.Legendary, MoodLevel.Fresco, MoodLevel.Normal, MoodLevel.Regular, MoodLevel.Fatal].map((moodLvl) => {
                const config = MOODS[moodLvl as MoodLevel];
                const isSelected = level === moodLvl;
                
                return (
                  <button
                    key={moodLvl}
                    onClick={() => setLevel(moodLvl as MoodLevel)}
                    className={`w-full group relative overflow-hidden p-3 rounded-2xl border-2 transition-all duration-300 flex items-center gap-5 text-left
                      ${isSelected 
                        ? 'ring-4 ring-white/10 scale-[1.02] shadow-xl z-10' 
                        : 'hover:scale-[1.01] hover:brightness-110'
                      }
                    `}
                    style={{ 
                      borderColor: isSelected ? config.color : `${config.color}44`, 
                      backgroundColor: isSelected ? `${config.color}33` : `${config.color}22`, 
                    }}
                  >
                    {/* Larger Image Container with White Background */}
                    <div className="w-24 h-24 rounded-xl bg-white overflow-hidden shrink-0 border-2 border-white/20 shadow-lg flex items-center justify-center">
                         <img 
                           src={config.image} 
                           alt={config.label} 
                           className={`w-full h-full object-contain p-1 transition-all duration-500
                             ${isSelected ? 'scale-110' : 'opacity-90 group-hover:scale-105'}
                           `} 
                         />
                    </div>

                    <div className="flex-1">
                      <div className="font-black text-lg leading-tight tracking-tight mb-1" style={{ color: isSelected ? '#fff' : config.color }}>
                        {config.label}
                      </div>
                      <div className={`text-xs font-bold uppercase tracking-wider transition-colors ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                        {config.subLabel}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute right-4 w-4 h-4 rounded-full shadow-[0_0_15px_currentColor]" style={{ backgroundColor: config.color }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <div className="flex justify-between items-center mb-2 px-1">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest opacity-70">Lore del día</p>
              <span className="text-[10px] text-slate-500 font-bold uppercase italic tracking-tighter">Opcional</span>
            </div>
            <textarea
              className="w-full h-32 bg-slate-900/40 border border-slate-700 rounded-2xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-slate-600 resize-none font-medium transition-all"
              placeholder="¿Qué ha pasado hoy?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-700 bg-slate-800/80">
          <button
            onClick={handleSave}
            disabled={level === MoodLevel.None}
            className={`w-full py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl
              ${level !== MoodLevel.None 
                ? 'bg-gradient-to-br from-green-500 to-emerald-700 text-white hover:brightness-110 active:scale-[0.98] shadow-green-500/20' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            <Save size={24} />
            SELLAR DESTINO
          </button>
        </div>

      </div>
    </div>
  );
};

export default MoodModal;