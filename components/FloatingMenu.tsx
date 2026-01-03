import React, { useRef } from 'react';
import { Download, Upload, BarChart2, RotateCcw, Search } from 'lucide-react';

interface FloatingMenuProps {
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStats: () => void;
  onReset: () => void;
  onSearch: () => void;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ onExport, onImport, onStats, onReset, onSearch }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-full shadow-2xl px-6 py-3 flex gap-4 md:gap-8 items-center">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onImport} 
        accept=".json" 
        className="hidden" 
      />
      
      <button 
        onClick={onExport}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-green-400 transition-colors w-12 md:w-16"
        title="Descargar copia de seguridad"
      >
        <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
        <span className="hidden md:block text-[10px] font-bold uppercase tracking-wider text-center">Exportar</span>
      </button>

      <button 
        onClick={handleImportClick}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors w-12 md:w-16"
        title="Cargar copia de seguridad"
      >
        <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
        <span className="hidden md:block text-[10px] font-bold uppercase tracking-wider text-center">Cargar</span>
      </button>

      <button 
        onClick={onSearch}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-yellow-400 transition-colors w-12 md:w-16"
        title="Buscar en el Lore"
      >
        <Search size={20} className="group-hover:-translate-y-1 transition-transform" />
        <span className="hidden md:block text-[10px] font-bold uppercase tracking-wider text-center">Buscar</span>
      </button>

      <button 
        onClick={onStats}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors w-12 md:w-16"
        title="Estadísticas"
      >
        <BarChart2 size={20} className="group-hover:-translate-y-1 transition-transform" />
        <span className="hidden md:block text-[10px] font-bold uppercase tracking-wider text-center">Stats</span>
      </button>

      <button 
        onClick={onReset}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 transition-colors w-12 md:w-16"
        title="Borrar todo"
      >
        <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        <span className="hidden md:block text-[10px] font-bold uppercase tracking-wider text-center">Borrar</span>
      </button>
    </div>
  );
};

export default FloatingMenu;