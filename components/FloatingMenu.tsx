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
    // Resetear valor para permitir cargar el mismo archivo dos veces si falla
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  };

  const handleClick = (action: () => void) => {
    SoundManager.play('click');
    action();
  }

  // Componente de Botón Reutilizable para consistencia
  const MenuButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    colorClass = "hover:text-white", 
    rotateIcon = false 
  }: { 
    icon: any, 
    label: string, 
    onClick: () => void, 
    colorClass?: string,
    rotateIcon?: boolean
  }) => (
    <button 
      onClick={onClick}
      className={`
        group relative flex flex-col items-center justify-center gap-1 
        w-10 h-10 md:w-16 md:h-auto 
        text-slate-400 ${colorClass} transition-all duration-300 
        active:scale-90 outline-none
      `}
      title={label}
      aria-label={label}
    >
      <div className="p-2 rounded-xl group-hover:bg-white/5 transition-colors">
        <Icon 
          size={20} 
          className={`transition-transform duration-300 ${rotateIcon ? 'group-hover:rotate-180' : 'group-hover:-translate-y-0.5'}`} 
        />
      </div>
      <span className="hidden md:block text-[9px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </span>
    </button>
  );

  const Separator = () => (
    <div className="hidden md:block w-px h-8 bg-slate-700/50 mx-1"></div>
  );

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-max max-w-[95vw]">
      
      {/* Input oculto para importación */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onImport} 
        accept=".json" 
        className="hidden" 
      />

      {/* Contenedor Dock */}
      <div className="
        flex items-center gap-1 md:gap-6 px-2 py-2 md:px-8 md:py-4
        bg-slate-900/90 backdrop-blur-xl 
        border border-slate-700/60 ring-1 ring-white/5
        rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]
        animate-in slide-in-from-bottom-10 fade-in duration-500
      ">
        
        <MenuButton 
          icon={Download} 
          label="Exportar" 
          onClick={() => handleClick(onExport)} 
          colorClass="hover:text-green-400"
        />

        <MenuButton 
          icon={Upload} 
          label="Importar" 
          onClick={handleImportClick} 
          colorClass="hover:text-indigo-400"
        />

        <Separator />

        <MenuButton 
          icon={Search} 
          label="Buscar" 
          onClick={() => handleClick(onSearch)} 
          colorClass="hover:text-yellow-400"
        />

        <MenuButton 
          icon={Cloud} 
          label="Nube" 
          onClick={() => handleClick(onCloud)} 
          colorClass="hover:text-pink-400"
        />

        <Separator />

        <MenuButton 
          icon={BarChart2} 
          label="Stats" 
          onClick={() => handleClick(onStats)} 
          colorClass="hover:text-blue-400"
        />

        <MenuButton 
          icon={RotateCcw} 
          label="Reset" 
          onClick={() => handleClick(onReset)} 
          colorClass="hover:text-red-500"
          rotateIcon={true}
        />

      </div>
    </div>
  );
};

export default FloatingMenu;