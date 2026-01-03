import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Calendar from './components/Calendar';
import MoodModal from './components/MoodModal';
import StatsModal from './components/StatsModal';
import SearchModal from './components/SearchModal';
import CloudModal from './components/CloudModal';
import FloatingMenu from './components/FloatingMenu';
import PepeOracle from './components/PepeOracle';
import Particles from './components/Particles';
import { YearData, DayData, MoodLevel } from './types';
import { STORAGE_KEY, PEPE_BANNER } from './constants';
import { Plus, Flame, Trash2, X, AlertTriangle } from 'lucide-react';
import SoundManager from './utils/sounds';

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
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Lógica de Vibración Háptica para móviles
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 30,
        heavy: [50, 30, 50]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Preload sounds on mount
  useEffect(() => {
    SoundManager.preload();
  }, []);

  // Lógica de Racha (Streak) - Memoizada
  const streak = useMemo(() => {
    const entries = Object.entries(yearData)
      .filter(([_, d]) => d.level > 0)
      .sort((a, b) => b[0].localeCompare(a[0]));
    
    if (entries.length === 0) return 0;

    let count = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Si no hay registro hoy ni ayer, la racha es 0
    if (!yearData[todayStr] && !yearData[yesterdayStr]) return 0;

    let currentDate = yearData[todayStr] ? today : yesterday;
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (yearData[dateStr] && yearData[dateStr].level > 0) {
        count++;
        currentDate.setDate(currentDate.getDate() - 1);
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

  const handleDayClick = useCallback((dateStr: string) => {
    triggerHaptic('light');
    SoundManager.play('click');
    setSelectedDate(dateStr);
    setIsMoodModalOpen(true);
  }, [triggerHaptic]);

  const handleSaveDay = (data: DayData) => {
    if (!selectedDate) return;
    triggerHaptic('medium');
    setYearData(prev => ({ ...prev, [selectedDate]: data }));
  };

  const handleDeleteDay = (dateToDelete: string) => {
    if (!dateToDelete) return;
    triggerHaptic('heavy');
    setYearData(prev => {
      const { [dateToDelete]: _, ...rest } = prev;
      return rest;
    });
    setIsMoodModalOpen(false);
    setSelectedDate(null);
  };

  const handleToday = () => {
    triggerHaptic('medium');
    SoundManager.play('open');
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    handleDayClick(dateStr);
  };

  const handleExport = () => {
    triggerHaptic('light');
    SoundManager.play('success');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(yearData));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `pepe_mood_backup_${currentYear}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content);
        if (typeof importedData === 'object' && importedData !== null) {
          triggerHaptic('medium');
          SoundManager.play('success');
          setYearData(importedData);
        }
      } catch (err) {
        console.error("Import error:", err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center min-h-screen pb-24 overflow-x-hidden text-slate-100 relative">
      <Particles />
      
      <header className="mt-8 mb-6 text-center flex flex-col items-center relative w-full px-4">
        {streak > 0 && (
          <div className="mb-4 lg:absolute lg:top-0 lg:right-12 flex items-center gap-2 bg-slate-900/60 backdrop-blur-md border border-orange-500/40 px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.2)] animate-in fade-in slide-in-from-top duration-700 z-30">
            <Flame size={20} className="text-orange-500 fill-orange-500 animate-pulse" />
            <span className="text-xs md:text-sm font-black text-white tracking-widest">{streak} DÍAS DE RACHA</span>
          </div>
        )}

        <div className="w-full max-w-[12rem] md:max-w-[16rem] px-4 mb-6 drop-shadow-[0_15px_40px_rgba(34,197,94,0.35)] pepe-float">
          <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-[3rem] overflow-hidden border-2 border-slate-800/50 shadow-2xl aspect-square flex items-center justify-center group">
            {!bannerError ? (
              <img 
                src={PEPE_BANNER} 
                alt="Pepe" 
                className="block max-w-full max-h-full object-contain p-0 transition-transform duration-1000 scale-[0.8] group-hover:scale-110"
                onError={() => setBannerError(true)}
              />
            ) : (
              <span className="text-6xl">🐸</span>
            )}
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-green-400 via-emerald-300 to-green-600 bg-clip-text text-transparent py-2 px-6 leading-tight animate-shimmer tracking-tighter uppercase text-center">
          {selectedTitle}
        </h1>
        <p className="text-slate-400 font-bold tracking-[0.2em] text-[10px] md:text-sm mt-1 italic opacity-90 uppercase text-center">
          {dynamicSubtitle}
        </p>
      </header>

      <PepeOracle data={yearData} />

      <button
        onClick={handleToday}
        className="group relative mb-12 inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl text-white font-black text-xl shadow-[0_10px_30px_-5px_rgba(34,197,94,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(34,197,94,0.7)] transition-all active:scale-95"
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
        onImport={handleImport}
        onStats={() => { triggerHaptic('light'); setIsStatsModalOpen(true); }}
        onReset={() => { triggerHaptic('medium'); setShowResetConfirm(true); }}
        onSearch={() => { triggerHaptic('light'); setIsSearchModalOpen(true); }}
        onCloud={() => { triggerHaptic('light'); setIsCloudModalOpen(true); }}
      />

      <MoodModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        onSave={handleSaveDay}
        onDelete={handleDeleteDay}
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

      <CloudModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        data={yearData}
      />

      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border-2 border-red-500/50 w-full max-w-md rounded-[2.5rem] shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden p-6 md:p-8 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 animate-pulse">
              <AlertTriangle size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">¿Borrar todo el lore?</h2>
              <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
                Pepe pregunta: ¿Seguro que quieres borrar todos tus recuerdos? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex flex-col w-full gap-3 pt-2">
              <button
                onClick={() => { triggerHaptic('heavy'); SoundManager.play('trash'); setYearData({}); setShowResetConfirm(false); }}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-lg shadow-red-900/40 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> SÍ, BORRAR TODO
              </button>
              <button
                onClick={() => { triggerHaptic('light'); SoundManager.play('click'); setShowResetConfirm(false); }}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all border border-slate-700"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;