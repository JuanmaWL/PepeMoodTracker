import React, { memo } from 'react';
import {
  BarChart2,
  RotateCcw,
  Search,
  Cloud,
  Settings,
  Trophy,
  History,
  Sparkles
} from 'lucide-react';
import SoundManager from '../utils/sounds';

interface FloatingMenuProps {
  onStats: () => void;
  onReset: () => void;
  onSearch: () => void;
  onCloud: () => void;
  onSettings: () => void;
  onAchievements: () => void;
  onTimeCapsule: () => void;
  onWrapped: () => void;
}

const FloatingMenu: React.FC<FloatingMenuProps> = memo(({
  onStats,
  onReset,
  onSearch,
  onCloud,
  onSettings,
  onAchievements,
  onTimeCapsule,
  onWrapped
}) => {
  const handleClick = (action: () => void) => {
    SoundManager.play('click');
    action();
  };

  const MenuButton = ({
    icon: Icon,
    label,
    onClick,
    colorClass = 'hover:text-white',
    rotateIcon = false
  }: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    colorClass?: string;
    rotateIcon?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative flex flex-col items-center justify-center gap-1 shrink-0
        min-w-[44px] min-h-[44px] w-11 h-11 md:w-14 md:h-auto
        text-slate-400 ${colorClass} transition-all duration-300
        active:scale-90 outline-none
      `}
      title={label}
      aria-label={label}
    >
      <div className="p-2 rounded-xl group-hover:bg-white/5 transition-colors">
        <Icon
          size={19}
          className={`transition-transform duration-300 ${rotateIcon ? 'group-hover:rotate-180' : 'group-hover:-translate-y-0.5'}`}
        />
      </div>
      <span className="hidden md:block text-[9px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </span>
    </button>
  );

  const Separator = () => (
    <div className="hidden md:block w-px h-8 bg-slate-700/50 mx-1 shrink-0"></div>
  );

  return (
    <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-max max-w-[95vw]">
      <div className="
        flex items-center gap-0.5 md:gap-2 px-2 py-1.5 md:px-6 md:py-3.5
        bg-slate-900/90 backdrop-blur-xl
        border border-slate-700/60 ring-1 ring-white/5
        rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]
        overflow-x-auto no-scrollbar
        animate-in slide-in-from-bottom-10 fade-in duration-500
      ">
        <MenuButton
          icon={BarChart2}
          label="Stats"
          onClick={() => handleClick(onStats)}
          colorClass="hover:text-blue-400"
        />

        <MenuButton
          icon={Trophy}
          label="Logros"
          onClick={() => handleClick(onAchievements)}
          colorClass="hover:text-amber-400"
        />

        <MenuButton
          icon={History}
          label="Cápsula"
          onClick={() => handleClick(onTimeCapsule)}
          colorClass="hover:text-cyan-400"
        />

        <MenuButton
          icon={Sparkles}
          label="Wrapped"
          onClick={() => handleClick(onWrapped)}
          colorClass="hover:text-purple-400"
        />

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
          icon={RotateCcw}
          label="Reset"
          onClick={() => handleClick(onReset)}
          colorClass="hover:text-red-500"
        />

        <MenuButton
          icon={Settings}
          label="Config"
          onClick={() => handleClick(onSettings)}
          colorClass="hover:text-slate-200"
          rotateIcon={true}
        />
      </div>
    </div>
  );
});

export default FloatingMenu;
