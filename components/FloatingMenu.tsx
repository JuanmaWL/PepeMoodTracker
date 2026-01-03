import React, { useRef } from 'react';
import { Download, Upload, BarChart2, RotateCcw, Search, Cloud } from 'lucide-react';
import SoundManager from '../utils/sounds';

interface FloatingMenuProps {
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStats: () => void;
  onReset: () => void;
  onSearch: () => void;
  onCloud: () => void;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ onExport, onImport, onStats, onReset, onSearch, onCloud }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    SoundManager.play('click');
    fileInputRef.current?.click();
  };

  const handleClick = (action: () => void) => {
    SoundManager.play('click');
    action();
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-full shadow-2xl px-4 py-3 md:px-6 flex gap-2 md:gap-6 items-center overflow-x-auto max-w-[95vw] custom-scrollbar-hide">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onImport} 
        accept=".json" 
        className="hidden" 
      />
      
      <button 
        onClick={() => handleClick(onExport)}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-green-400 transition-colors min-w-[2.5rem] md:min-w-[3rem]"
        title="Descargar copia de seguridad"
      >
        <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
        <span className="hidden md:block text-[9px] font-bold uppercase tracking-wider text-center">Export</span>
      </button>

      <button 
        onClick={handleImportClick}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors min-w-[2.5rem] md:min-w-[3rem]"
        title="Cargar copia de seguridad"
      >
        <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
        <span className="hidden md:block text-[9px] font-bold uppercase tracking-wider text-center">Import</span>
      </button>

      {/* Separador oculto en móvil */}
      <div className="hidden md:block w-px h-8 bg-slate-700/50 mx-1"></div>

      <button 
        onClick={() => handleClick(onSearch)}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-yellow-400 transition-colors min-w-[2.5rem] md:min-w-[3rem]"
        title="Buscar en el Lore"
      >
        <Search size={20} className="group-hover:-translate-y-1 transition-transform" />
        <span className="hidden md:block text-[9px] font-bold uppercase tracking-wider text-center">Buscar</span>
      </button>

      <button 
        onClick={() => handleClick(onCloud)}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-pink-400 transition-colors min-w-[2.5rem] md:min-w-[3rem]"
        title="Nube de palabras"
      >
        <Cloud size={20} className="group-hover:-translate-y-1 transition-transform" />
        <span className="hidden md:block text-[9px] font-bold uppercase tracking-wider text-center">Nube</span>
      </button>

      {/* Separador oculto en móvil */}
      <div className="hidden md:block w-px h-8 bg-slate-700/50 mx-1"></div>

      <button 
        onClick={() => handleClick(onStats)}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors min-w-[2.5rem] md:min-w-[3rem]"
        title="Estadísticas"
      >
        <BarChart2 size={20} className="group-hover:-translate-y-1 transition-transform" />
        <span className="hidden md:block text-[9px] font-bold uppercase tracking-wider text-center">Stats</span>
      </button>

      <button 
        onClick={() => handleClick(onReset)}
        className="group flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 transition-colors min-w-[2.5rem] md:min-w-[3rem]"
        title="Borrar todo"
      >
        <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        <span className="hidden md:block text-[9px] font-bold uppercase tracking-wider text-center">Reset</span>
      </button>
    </div>
  );
};

export default FloatingMenu;