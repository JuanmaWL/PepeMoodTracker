import React, { useState, useEffect, useMemo } from 'react';
import Calendar from './components/Calendar';
import MoodModal from './components/MoodModal';
import StatsModal from './components/StatsModal';
import SearchModal from './components/SearchModal';
import FloatingMenu from './components/FloatingMenu';
import PepeOracle from './components/PepeOracle';
import Particles from './components/Particles';
import { YearData, DayData, MoodLevel } from './types';
import { STORAGE_KEY, PEPE_BANNER } from './constants';
import { Plus, Flame } from 'lucide-react';

const APP_TITLES = [
  "Pepe Tracker 2026",
  "Feels Tracker 2026",
  "Pepe Mood Index 2026",
  "Frog Status 2026",
  "Pepe Database 2026",
  "Vibe Check 2026",
  "Pepe Monitor 2026",
  "Mood Pepe 2026",
  "Pepe Control 2026"
];

const App: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [yearData, setYearData] = useState<YearData>({});
  const [bannerError, setBannerError] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Lógica de Racha (Streak)
  const streak = useMemo(() => {
    const dates = Object.keys(yearData).sort().reverse();
    if (dates.length === 0) return 0;

    let count = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Si no ha registrado hoy ni ayer, la racha es 0
    if (!yearData[todayStr] && !yearData[yesterdayStr]) return 0;

    let checkDate = yearData[todayStr] ? today : yesterday;
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (yearData[dateStr] && yearData[dateStr].level > 0) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [yearData]);

  const selectedTitle = useMemo(() => {
    return APP_TITLES[Math.floor(Math.random() * APP_TITLES.length)];
  }, []);

  const dynamicSubtitle = useMemo(() => {
    const phrases = [
      `Pepe está tomando notas de tu ${currentYear}`,
      `Juzgando tus decisiones de vida en ${currentYear}`,
      `El testigo ocular de tus dramas en ${currentYear}`,
      `Gestionando el caos emocional de ${currentYear}`,
      `¿Todo bien en casa? Edición ${currentYear}`,
      `La película de tu vida: Temporada ${currentYear}`,
      `Documentando el lore de tu vida en ${currentYear}`
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }, [currentYear]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setYearData(JSON.parse(stored)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(yearData));
  }, [yearData]);

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsMoodModalOpen(true);
  };

  const handleSaveDay = (data: DayData) => {
    if (!selectedDate) return;
    setYearData(prev => ({ ...prev, [selectedDate]: data }));
  };

  const handleToday = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    handleDayClick(dateStr);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(yearData));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `pepe_mood_backup_${currentYear}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  const handleReset = () => {
    if (window.confirm("Pepe pregunta: ¿Seguro que quieres borrar tus recuerdos?")) {
      setYearData({});
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen pb-24 overflow-x-hidden text-slate-100 relative">
      <Particles />
      
      <header className="mt-8 mb-6 text-center flex flex-col items-center relative w-full px-4">
        {/* Streak Display */}
        {streak > 0 && (
          <div className="absolute top-0 right-4 md:right-12 flex items-center gap-2 bg-slate-900/50 backdrop-blur-sm border border-orange-500/30 px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top duration-700">
            <Flame size={18} className="text-orange-500 fill-orange-500 animate-pulse" />
            <span className="text-sm font-black text-white">{streak} DÍAS DE LORE</span>
          </div>
        )}

        <div className="w-full max-w-[12rem] md:max-w-[16rem] px-4 mb-6 drop-shadow-[0_15px_40px_rgba(34,197,94,0.35)] pepe-float">
          <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-[3rem] overflow-hidden border-2 border-slate-800/50 shadow-2xl aspect-square flex items-center justify-center group">
            {!bannerError ? (
              <img 
                src={PEPE_BANNER} 
                alt="Pepe" 
                className="block w-full h-full object-contain p-2 transition-transform duration-1000 group-hover:scale-110"
                onError={() => setBannerError(true)}
              />
            ) : (
              <span className="text-6xl">🐸</span>
            )}
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-green-400 via-emerald-300 to-green-600 bg-clip-text text-transparent py-2 px-6 leading-tight animate-shimmer tracking-tighter uppercase">
          {selectedTitle}
        </h1>
        <p className="text-slate-400 font-bold tracking-[0.2em] text-[10px] md:text-sm mt-1 italic opacity-90 uppercase">
          {dynamicSubtitle}
        </p>
      </header>

      <PepeOracle data={yearData} />

      <button
        onClick={handleToday}
        className="group relative mb-12 inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl text-white font-black text-xl shadow-[0_10px_30px_-5px_rgba(34,197,94,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(34,197,94,0.7)] transition-all"
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform" /> 
        REGISTRAR HOY
      </button>

      <Calendar yearData={yearData} onDayClick={handleDayClick} currentYear={currentYear} />

      <footer className="mt-auto py-10 opacity-30">
        <p className="text-[10px] font-black tracking-[0.3em] uppercase">developed by <span className="text-green-500">Juasmio</span></p>
      </footer>

      <FloatingMenu 
        onExport={handleExport}
        onStats={() => setIsStatsModalOpen(true)}
        onReset={handleReset}
        onSearch={() => setIsSearchModalOpen(true)}
      />

      <MoodModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        onSave={handleSaveDay}
        dateStr={selectedDate || ''}
        initialData={selectedDate ? yearData[selectedDate] || { level: MoodLevel.None, note: '' } : { level: MoodLevel.None, note: '' }}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        data={yearData}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        data={yearData}
        onJumpToDate={(date) => {
          setSelectedDate(date);
          setIsMoodModalOpen(true);
        }}
      />
    </div>
  );
};

export default App;