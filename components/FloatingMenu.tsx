import React from 'react';
import { Download, BarChart2, RotateCcw } from 'lucide-react';

interface FloatingMenuProps {
  onExport: () => void;
  onStats: () => void;
  onReset: () => void;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ onExport, onStats, onReset }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-full shadow-2xl px-6 py-3 flex gap-8 items-center">
      <button 
        onClick={onExport}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-green-400 transition-colors"
        title="Copia de seguridad"
      >
        <Download size={20} className="group-hover:-translate-y-1 transition-transform duration-300" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Guardar</span>
      </button>

      <button 
        onClick={onStats}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors"
        title="Ver Estadísticas"
      >
        <BarChart2 size={24} className="group-hover:-translate-y-1 transition-transform duration-300" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Stats</span>
      </button>

      <button 
        onClick={onReset}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
        title="Borrar todo"
      >
        <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Borrar</span>
      </button>
    </div>
  );
};

export default FloatingMenu;