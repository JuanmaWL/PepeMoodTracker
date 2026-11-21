import React, { useMemo, useState } from 'react';
import { History, X, Calendar, ArrowUpRight, Plus } from 'lucide-react';
import { MOODS } from '../constants';
import { YearData } from '../types';
import { buildTimeCapsuleMemories } from '../utils/capsule';
import SoundManager from '../utils/sounds';

interface TimeCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: YearData;
  currentYear: number;
  onSelectDate: (dateStr: string) => void;
  onLogToday: () => void;
}

const MemoryMoodThumb: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
        🐸
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-slate-700/80 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

const TimeCapsuleModal: React.FC<TimeCapsuleModalProps> = ({
  isOpen,
  onClose,
  data,
  currentYear,
  onSelectDate,
  onLogToday,
}) => {
  const memories = useMemo(
    () => (isOpen ? buildTimeCapsuleMemories(data, currentYear) : []),
    [isOpen, data, currentYear]
  );

  if (!isOpen) return null;

  const handleClose = () => {
    SoundManager.play('click');
    onClose();
  };

  const handleOpenMemory = (dateStr: string) => {
    SoundManager.play('click');
    onClose();
    onSelectDate(dateStr);
  };

  const handleLogTodayClick = () => {
    SoundManager.play('click');
    onClose();
    onLogToday();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[88vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 md:p-6 pb-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/15 border border-cyan-500/30 rounded-xl text-cyan-400">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight leading-none">
                Cápsula del Tiempo
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                Un día como hoy en tu archivo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
            aria-label="Cerrar cápsula del tiempo"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 md:p-6 space-y-4 flex-1 custom-scrollbar">
          {memories.length === 0 ? (
            <div className="py-10 px-4 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 mb-4">
                <Calendar size={28} />
              </div>
              <h4 className="text-base font-black text-white mb-2">
                Aún no hay ecos del pasado
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mb-6">
                Cuando acumules registros de hace una semana, un mes o años anteriores, aquí aparecerá lo que sentías exactamente en fechas espejo.
              </p>
              <button
                type="button"
                onClick={handleLogTodayClick}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
              >
                <Plus size={16} />
                <span>Registrar hoy</span>
              </button>
            </div>
          ) : (
            memories.map((memory) => {
              const mood = MOODS[memory.data.level] || MOODS[4];
              return (
                <article
                  key={memory.id}
                  className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/70 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <MemoryMoodThumb src={mood.image} alt={mood.label} />
                      <div className="min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
                          {memory.horizonLabel}
                        </p>
                        <p className="text-xs font-bold text-slate-200 truncate mt-0.5">
                          {memory.formattedDate}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-extrabold text-slate-300">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: mood.color }}
                            aria-hidden="true"
                          />
                          <span>{mood.label}</span>
                        </div>
                      </div>
                    </div>

                    {memory.isCurrentYear && (
                      <button
                        type="button"
                        onClick={() => handleOpenMemory(memory.dateStr)}
                        className="min-h-[44px] px-3 rounded-xl bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors whitespace-nowrap"
                      >
                        <span>Ver día</span>
                        <ArrowUpRight size={14} />
                      </button>
                    )}
                  </div>

                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
                    {memory.data.note?.trim()
                      ? memory.data.note.trim()
                      : 'Sin nota escrita aquel día; solo quedó el estado emocional.'}
                  </p>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeCapsuleModal;
