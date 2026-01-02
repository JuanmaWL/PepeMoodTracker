import React from 'react';
import { Download, BarChart2, RotateCcw, Search } from 'lucide-react';

interface FloatingMenuProps {
  onExport: () => void;
  onStats: () => void;
  onReset: () => void;
  onSearch: () => void;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ onExport, onStats, onReset, onSearch }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-full shadow-2xl px-6 py-3 flex gap-6 md:gap-8 items-center">
      <button 
        onClick={onExport}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-green-400 transition-colors"
        title="Backup"
      >
        <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
        <span className="hidden md:block text-[10px] font-bold uppercase tracking-wider">Backup</span>
      </button>

      <button 
        onClick={onSearch}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-yellow-400 transition-colors"
        title="Buscar Lore"
      >
        <Search size={20} className="group-hover:-translate-y-1 transition-transform" />
        <span className="hidden md:block text-[10px] font-bold uppercase tracking-wider">Lore</span>
      </button>

      <button 
        onClick={onStats}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors"
        title="Estadísticas"
      >
        <BarChart2 size={24} className="group-hover:-translate-y-1 transition-transform" />
        <span className="hidden md:block text-[10px] font-bold uppercase tracking-wider">Stats</span>
      </button>

      <button 
        onClick={onReset}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
        title="Reset"
      >
        <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        <span className="hidden md:block text-[10px] font-bold uppercase tracking-wider">Reset</span>
      </button>
    </div>
  );
};

export default FloatingMenu;