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

  // Helper to get day and month name for display
  const formatDateDisplay = (isoDate: string) => {
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-black text-slate-100 capitalize">
            {formatDateDisplay(dateStr)}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Mood Selection */}
          <div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">Selecciona tu mood</p>
            <div className="space-y-3">
              {[MoodLevel.Legendary, MoodLevel.Fresco, MoodLevel.Normal, MoodLevel.Regular, MoodLevel.Fatal].map((moodLvl) => {
                const config = MOODS[moodLvl as MoodLevel];
                const isSelected = level === moodLvl;
                
                return (
                  <button
                    key={moodLvl}
                    onClick={() => setLevel(moodLvl as MoodLevel)}
                    className={`w-full group relative overflow-hidden p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 text-left
                      ${isSelected 
                        ? `border-[${config.color}] bg-[${config.color}]/10` 
                        : 'border-slate-700 hover:border-slate-500 bg-slate-800'
                      }
                    `}
                    style={{ borderColor: isSelected ? config.color : undefined }}
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-600">
                         <img 
                           src={config.image} 
                           alt={config.label} 
                           className="w-full h-full object-contain p-1 opacity-80 group-hover:opacity-100 transition-opacity" 
                         />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg" style={{ color: isSelected ? config.color : 'white' }}>
                        {config.label}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {config.subLabel}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute right-4 w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: config.color }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Lore del día</p>
            <textarea
              className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-slate-600 resize-none font-medium"
              placeholder="¿Qué pasó hoy, anon?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <button
            onClick={handleSave}
            disabled={level === MoodLevel.None}
            className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg
              ${level !== MoodLevel.None 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-green-500/20' 
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            <Save size={20} />
            GUARDAR PROGRESO
          </button>
        </div>

      </div>
    </div>
  );
};

export default MoodModal;