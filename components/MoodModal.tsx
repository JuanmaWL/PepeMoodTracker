import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, MessageSquareText } from 'lucide-react';
import { MOODS } from '../constants';
import { MoodLevel, DayData } from '../types';

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DayData) => void;
  initialData: DayData;
  dateStr: string;
}

const SAVE_PHRASES = [
  "REGISTRAR LORE",
  "INMORTALIZAR MOMENTO",
  "ACTUALIZAR STATUS",
  "CHECKEAR VIBES",
  "GUARDAR PROGRESO",
  "CONFIRMAR EXISTENCIA",
  "SUBIR AL ARCHIVO",
  "SINCRONIZAR VIVENCIA",
  "PUBLICAR LORE",
  "ESTABLECER CANON"
];

const MoodModal: React.FC<MoodModalProps> = ({ isOpen, onClose, onSave, initialData, dateStr }) => {
  const [level, setLevel] = useState<MoodLevel>(MoodLevel.None);
  const [note, setNote] = useState('');
  
  // Seleccionar una frase aleatoria cada vez que el modal se abre
  const [buttonText, setButtonText] = useState(SAVE_PHRASES[0]);

  useEffect(() => {
    if (isOpen) {
      setLevel(initialData.level || MoodLevel.None);
      setNote(initialData.note || '');
      // Cambiar el texto del botón al abrir
      const randomPhrase = SAVE_PHRASES[Math.floor(Math.random() * SAVE_PHRASES.length)];
      setButtonText(randomPhrase);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ level, note });
    onClose();
  };

  const formatDateDisplay = (isoDate: string) => {
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const formatted = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const lower = formatted.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const moodLevels = [
    MoodLevel.Legendary,
    MoodLevel.MoiBiens,
    MoodLevel.Normal,
    MoodLevel.Regular,
    MoodLevel.Fatal
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] ring-1 ring-white/10">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight leading-none">
              {formatDateDisplay(dateStr)}
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Status de hoy</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-white"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Mood Selection */}
          <div>
            <div className="flex items-center gap-3 mb-4 px-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest opacity-80">Selecciona tu vibra</span>
              <div className="h-px flex-1 bg-slate-800"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moodLevels.map((moodLvl, index) => {
                const config = MOODS[moodLvl as MoodLevel];
                const isSelected = level === moodLvl;
                const isLastFull = index === moodLevels.length - 1;
                
                return (
                  <button
                    key={moodLvl}
                    onClick={() => setLevel(moodLvl as MoodLevel)}
                    className={`group relative overflow-hidden p-4 rounded-[1.5rem] border-2 transition-all duration-300 flex items-center gap-4 text-left
                      ${isLastFull ? 'md:col-span-2' : ''}
                      ${isSelected 
                        ? 'ring-4 ring-white/5 scale-[1.02] shadow-xl z-10' 
                        : 'hover:scale-[1.01] hover:brightness-110'
                      }
                    `}
                    style={{ 
                      borderColor: isSelected ? config.color : `${config.color}33`, 
                      backgroundColor: isSelected ? `${config.color}25` : `${config.color}10`, 
                    }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden shrink-0 border border-white/10 shadow-lg flex items-center justify-center">
                         <img 
                           src={config.image} 
                           alt={config.label} 
                           className={`w-full h-full object-contain p-1.5 transition-all duration-500
                             ${isSelected ? 'scale-110' : 'opacity-90 group-hover:scale-105 group-hover:opacity-100'}
                           `} 
                         />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm md:text-base leading-tight tracking-tight mb-1 truncate" style={{ color: isSelected ? '#fff' : config.color }}>
                        {config.label}
                      </div>
                      <div className={`text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors truncate ${isSelected ? 'text-slate-100' : 'text-slate-500'}`}>
                        {config.subLabel}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-3 h-3 rounded-full shadow-[0_0_12px_currentColor] shrink-0" style={{ backgroundColor: config.color }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div className="animate-in slide-in-from-bottom duration-500 delay-150">
            <div className="flex justify-between items-center mb-4 px-1">
              <div className="flex items-center gap-2">
                <MessageSquareText size={18} className="text-slate-500" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest opacity-80">Lore del día</span>
              </div>
              <span className="text-[10px] text-slate-600 font-bold uppercase italic tracking-wider">Opcional</span>
            </div>
            <textarea
              className="w-full h-32 bg-slate-950/60 border border-slate-800 rounded-3xl p-5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 placeholder-slate-700 resize-none font-medium transition-all text-base leading-relaxed shadow-inner"
              placeholder="¿Qué ha pasado hoy? Describe el momento..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-7 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
          <button
            onClick={handleSave}
            disabled={level === MoodLevel.None}
            className={`w-full py-5 rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-2xl
              ${level !== MoodLevel.None 
                ? 'bg-gradient-to-br from-green-500 to-emerald-700 text-white hover:brightness-110 active:scale-[0.98] shadow-green-500/30' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }
            `}
          >
            <Save size={24} />
            {buttonText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default MoodModal;