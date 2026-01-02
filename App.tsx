import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import MoodModal from './components/MoodModal';
import StatsModal from './components/StatsModal';
import FloatingMenu from './components/FloatingMenu';
import { YearData, DayData, MoodLevel } from './types';
import { STORAGE_KEY } from './constants';
import { Plus } from 'lucide-react';

const App: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [yearData, setYearData] = useState<YearData>({});
  
  // Modals state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Load data on mount
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

  // Save data effect
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
    dl.setAttribute("download", `año_pepe_backup_${currentYear}.json`);
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
    <div className="flex flex-col items-center min-h-screen bg-slate-950 pb-20">
      
      {/* Title */}
      <header className="mt-10 mb-6 text-center animate-in slide-in-from-top duration-500">
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          AÑO PEPE
        </h1>
        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mt-2">
          {currentYear} Diario de Mood
        </p>
      </header>

      {/* Today Button */}
      <button
        onClick={handleToday}
        className="mb-10 group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full text-white font-black text-lg tracking-wide shadow-[0_10px_20px_-5px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 transition-all duration-300"
      >
        <span className="relative z-10 flex items-center gap-2">
          <Plus strokeWidth={4} size={20} /> REGISTRAR HOY
        </span>
        {/* Pulse Ring */}
        <span className="absolute inset-0 rounded-full ring-4 ring-blue-500/30 animate-ping opacity-75"></span>
      </button>

      {/* Calendar Grid */}
      <Calendar 
        yearData={yearData} 
        onDayClick={handleDayClick} 
        currentYear={currentYear} 
      />

      {/* Floating Action Menu */}
      <FloatingMenu 
        onExport={handleExport}
        onStats={() => setIsStatsModalOpen(true)}
        onReset={handleReset}
      />

      {/* Modals */}
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