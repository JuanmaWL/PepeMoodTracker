import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import SoundManager from '../utils/sounds';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirmReset: () => void;
  onCancel: () => void;
}

const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ isOpen, onConfirmReset, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onCancel}
    >
      <div
        className="bg-slate-900 border-2 border-red-500/50 w-full max-w-md rounded-[2.5rem] shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden p-6 md:p-8 flex flex-col items-center text-center space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 md:w-20 md:h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 animate-pulse">
          <AlertTriangle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">¿Borrar todo el lore?</h2>
          <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
            Pepe pregunta: ¿Seguro que quieres borrar todos tus recuerdos? Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex flex-col w-full gap-3 pt-2">
          <button
            onClick={onConfirmReset}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-lg shadow-red-900/40 flex items-center justify-center gap-2"
          >
            <Trash2 size={16} /> SÍ, BORRAR TODO
          </button>
          <button
            onClick={() => {
              SoundManager.play('click');
              onCancel();
            }}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all border border-slate-700"
          >
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmModal;
