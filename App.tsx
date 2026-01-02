import React, { useState, useEffect, useMemo } from 'react';
import Calendar from './components/Calendar';
import MoodModal from './components/MoodModal';
import StatsModal from './components/StatsModal';
import FloatingMenu from './components/FloatingMenu';
import { YearData, DayData, MoodLevel } from './types';
import { STORAGE_KEY, PEPE_BANNER } from './constants';
import { Plus } from 'lucide-react';

const App: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [yearData, setYearData] = useState<YearData>({});
  const [bannerError, setBannerError] = useState(false);
  
  // Modals state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Dynamic phrases for Pepe
  const dynamicSubtitle = useMemo(() => {
  const phrases = [
    // Estilo Observador
    `Pepe está tomando notas de tu ${currentYear}`,
    `Juzgando tus decisiones de vida en ${currentYear}`,
    `El testigo ocular de tus dramas en ${currentYear}`,
    `Aquí guardamos tus secretos de ${currentYear}`,
    `Pepe lo ha visto todo en ${currentYear}`,
    `Tu conciencia (en forma de rana) para ${currentYear}`,

    // Estilo Caos Diario
    `Intentando ser adultos funcionales en ${currentYear}`,
    `Gestionando el caos emocional de ${currentYear}`,
    `Tu bitácora de supervivencia para ${currentYear}`,
    `¿Todo bien en casa? Edición ${currentYear}`,
    `Esquivando problemas en ${currentYear}`,
    `La película de tu vida: Temporada ${currentYear}`,
    `La montaña rusa emocional de ${currentYear}`,

    // Estilo Good Vibes / Ironía
    `Buscando los momentos 'Feels Good' de ${currentYear}`,
    `Tu colección de buenos ratos en ${currentYear}`,
    `Manteniendo la calma (o intentándolo) en ${currentYear}`,
    `Crónicas de la charca en ${currentYear}`,
    `Menos drama y más memes en ${currentYear}`,
    `El archivo oficial de tus aventuras en ${currentYear}`,

    // Estilo Resumen
    `Tu historial de dramas y victorias en ${currentYear}`,
    `Documentando el lore de tu vida en ${currentYear}`,
    `Crónicas de una rana moderna en ${currentYear}`,
    `Tu diario antistress para ${currentYear}`
  ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }, [currentYear]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setYearData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse data", e);
      }
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
    setYearData(prev => ({
      ...prev,
      [selectedDate]: data
    }));
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
    dl.setAttribute("download", `pepe_mood_year_backup_${currentYear}.json`);
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
    <div className="flex flex-col items-center min-h-screen pb-20 overflow-x-hidden text-slate-100 relative">
      
      {/* Header Section */}
      <header className="mt-8 mb-6 text-center animate-in slide-in-from-top duration-700 flex flex-col items-center relative w-full">
        
        {/* Pepe Banner Image Container */}
        <div className="w-full max-w-[12rem] md:max-w-[16rem] px-4 mb-6 drop-shadow-[0_15px_40px_rgba(34,197,94,0.35)] pepe-float">
          <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-[2rem] md:rounded-[3rem] overflow-hidden border-2 border-slate-800/50 shadow-2xl aspect-square flex items-center justify-center group">
            
            {!bannerError ? (
              <img 
                src={PEPE_BANNER} 
                alt="Pepe Banner" 
                className="block w-full h-full object-contain p-2 transition-transform duration-1000 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const localPath = "assets/images/pepe_banner.webp";
                  if (target.src !== window.location.origin + "/" + localPath && !target.src.includes(localPath)) {
                    target.src = localPath;
                  } else {
                    setBannerError(true);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-900 via-slate-900 to-emerald-900 flex flex-col items-center justify-center animate-pulse">
                <span className="text-4xl md:text-6xl mb-1 drop-shadow-2xl">🐸</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Title: PEPE MOOD YEAR */}
        <div className="relative overflow-visible">
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-green-400 via-emerald-300 to-green-600 bg-clip-text text-transparent py-2 px-6 leading-tight animate-shimmer tracking-tighter">
            PEPE MOOD YEAR
          </h1>
        </div>
        
        <p className="text-slate-400 font-bold tracking-[0.2em] text-xs md:text-base mt-1 max-w-2xl mx-auto px-6 italic opacity-90 uppercase">
          {dynamicSubtitle}
        </p>
      </header>

      {/* Today Button */}
      <div className="relative mb-12">
        <button
          onClick={handleToday}
          className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl text-white font-black text-xl tracking-tight shadow-[0_10px_30px_-5px_rgba(34,197,94,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(34,197,94,0.7)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
        >
          <Plus strokeWidth={4} size={24} className="group-hover:rotate-90 transition-transform duration-300" /> 
          REGISTRAR HOY
        </button>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full animate-bounce shadow-lg shadow-yellow-400/50 border-2 border-slate-950"></div>
      </div>

      <Calendar 
        yearData={yearData} 
        onDayClick={handleDayClick} 
        currentYear={currentYear} 
      />

      {/* developed by Juasmio */}
      <footer className="mt-auto py-10 opacity-30 hover:opacity-100 transition-opacity duration-500">
        <p className="text-xs font-black tracking-[0.3em] uppercase text-slate-400 flex items-center gap-2">
          developed by <span className="text-green-500">Juasmio</span>
        </p>
      </footer>

      <FloatingMenu 
        onExport={handleExport}
        onStats={() => setIsStatsModalOpen(true)}
        onReset={handleReset}
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

    </div>
  );
};

export default App;