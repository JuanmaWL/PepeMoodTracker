import React, { useState, useEffect } from 'react';
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
    <div className="flex flex-col items-center min-h-screen bg-slate-950 pb-20 overflow-x-hidden text-slate-100">
      
      {/* Header Section */}
      <header className="mt-12 mb-8 text-center animate-in slide-in-from-top duration-700 flex flex-col items-center relative w-full">
        
        {/* Pepe Banner Image Container */}
        <div className="w-full max-w-4xl px-4 mb-8 drop-shadow-[0_20px_60px_rgba(34,197,94,0.45)] pepe-float">
          <div className="relative bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-slate-800/50 shadow-2xl aspect-[21/9] flex items-center justify-center group">
            
            {!bannerError ? (
              <img 
                src={PEPE_BANNER} 
                alt="Pepe Banner" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // Si falla la URL principal, intentamos la local
                  const localPath = "assets/images/pepe_banner.webp";
                  if (target.src !== window.location.origin + "/" + localPath && !target.src.includes(localPath)) {
                    console.log("Cambiando a fallback local...");
                    target.src = localPath;
                  } else {
                    // Si falla la local también, activamos el estado de error para mostrar el fallback visual
                    setBannerError(true);
                  }
                }}
              />
            ) : (
              /* Fallback Visual: Gradiente Pepe si todo falla */
              <div className="w-full h-full bg-gradient-to-br from-green-900 via-slate-900 to-emerald-900 flex flex-col items-center justify-center animate-pulse">
                <span className="text-8xl mb-2 drop-shadow-2xl">🐸</span>
                <span className="text-green-500 font-black tracking-widest text-xl opacity-50 uppercase">Pepe is watching you</span>
              </div>
            )}
            
            {/* Overlay de brillo */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Title: PEPE MOOD YEAR */}
        <div className="relative overflow-visible">
          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-green-400 via-emerald-300 to-green-600 bg-clip-text text-transparent py-4 px-6 leading-tight animate-shimmer tracking-tighter">
            PEPE MOOD YEAR
          </h1>
        </div>
        
        <p className="text-slate-400 font-bold tracking-[0.2em] text-sm md:text-lg mt-2 max-w-2xl mx-auto px-6 italic opacity-90 uppercase">
          Tu mood diario durante {currentYear}
        </p>
      </header>

      {/* Today Button */}
      <div className="relative mb-16">
        <button
          onClick={handleToday}
          className="group relative inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl text-white font-black text-2xl tracking-tight shadow-[0_15px_40px_-10px_rgba(34,197,94,0.6)] hover:shadow-[0_20px_50px_-5px_rgba(34,197,94,0.8)] hover:-translate-y-1 active:scale-95 transition-all duration-300"
        >
          <Plus strokeWidth={4} size={28} className="group-hover:rotate-90 transition-transform duration-300" /> 
          REGISTRAR HOY
        </button>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce shadow-lg shadow-yellow-400/50 border-2 border-slate-950"></div>
      </div>

      <Calendar 
        yearData={yearData} 
        onDayClick={handleDayClick} 
        currentYear={currentYear} 
      />

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