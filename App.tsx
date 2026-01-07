
import React, { useState, useEffect, useMemo, useCallback, Suspense, useRef } from 'react';
import Calendar from './components/Calendar';
import FloatingMenu from './components/FloatingMenu';
import PepeOracle from './components/PepeOracle';
import Particles from './components/Particles';
import QuickLogMenu from './components/QuickLogMenu'; 
import { YearData, DayData, MoodLevel } from './types';
import { STORAGE_KEY, PEPE_BANNER } from './constants';
import { Plus, Flame, Trash2, AlertTriangle, Settings, Sliders, Loader2, BatteryCharging, Download, Upload, FileJson, Save } from 'lucide-react';
import SoundManager from './utils/sounds';

const MoodModal = React.lazy(() => import('./components/MoodModal'));
const StatsModal = React.lazy(() => import('./components/StatsModal'));
const SearchModal = React.lazy(() => import('./components/SearchModal'));
const CloudModal = React.lazy(() => import('./components/CloudModal'));

const ModalLoader = () => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
          <Loader2 size={40} className="text-green-500 animate-spin" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Cargando módulo...</span>
      </div>
  </div>
);

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Configuración
  const [ecoMode, setEcoMode] = useState(false);
  const [particleCount, setParticleCount] = useState(() => window.innerWidth < 768 ? 40 : 150);

  const [quickLogState, setQuickLogState] = useState<{
    isActive: boolean;
    dateStr: string | null;
    startPos: { x: number; y: number } | null;
    currentPos: { x: number; y: number } | null;
  }>({
    isActive: false,
    dateStr: null,
    startPos: null,
    currentPos: null
  });
  
  const quickLogStateRef = useRef(quickLogState);
  
  useEffect(() => {
    quickLogStateRef.current = quickLogState;
  }, [quickLogState]);

  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);

  // Efecto para Modo Eco (Body Class)
  useEffect(() => {
      if (ecoMode) {
          document.body.classList.add('eco-mode');
      } else {
          document.body.classList.remove('eco-mode');
      }
  }, [ecoMode]);

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

  useEffect(() => {
    SoundManager.preload();
  }, []);

  const handleGlobalMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!quickLogStateRef.current.isActive) return;
    if (e.cancelable) e.preventDefault();

    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
    }

    setQuickLogState(prev => ({
        ...prev,
        currentPos: { x: clientX, y: clientY }
    }));
  }, []);

  const handleGlobalEnd = useCallback((e: TouchEvent | MouseEvent) => {
    if (!quickLogStateRef.current.isActive) return;
    
    const state = quickLogStateRef.current;
    
    if (state.startPos && state.currentPos && state.dateStr) {
        const SAFE_MARGIN = 110;
        const clampedX = Math.max(SAFE_MARGIN, Math.min(state.startPos.x, window.innerWidth - SAFE_MARGIN));
        const menuCenter = { x: clampedX, y: state.startPos.y };

        const dx = state.currentPos.x - menuCenter.x;
        const dy = state.currentPos.y - menuCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist >= 15) { 
            if (dy > 30) {
                 SoundManager.play('trash');
                 triggerHaptic('heavy');
                 setYearData(prev => {
                    const { [state.dateStr!]: _, ...rest } = prev;
                    return rest;
                 });
            } else {
                const orderedMoods = [
                    MoodLevel.Rage,
                    MoodLevel.Sadge,
                    MoodLevel.Regular,
                    MoodLevel.Normal,
                    MoodLevel.MoiBiens,
                    MoodLevel.Legendary
                ];
                let closestMood: MoodLevel | null = null;
                let minDist = Number.MAX_VALUE;
                const RADIUS = 85; 
                const totalSpan = 180;
                const step = totalSpan / (orderedMoods.length - 1);
                
                orderedMoods.forEach((mood, index) => {
                     const angleDeg = 180 - (index * step);
                     const rad = angleDeg * (Math.PI / 180);
                     const ix = Math.cos(rad) * RADIUS;
                     const iy = -Math.sin(rad) * RADIUS;
                     const distToIcon = Math.sqrt(Math.pow(dx - ix, 2) + Math.pow(dy - iy, 2));
                     
                     if (distToIcon < minDist) {
                         minDist = distToIcon;
                         closestMood = mood;
                     }
                });
    
                if (closestMood && minDist < 50) {
                    SoundManager.play('success');
                    triggerHaptic('medium');
                    
                    setYearData(prev => ({
                        ...prev,
                        [state.dateStr!]: {
                            level: closestMood as MoodLevel,
                            note: prev[state.dateStr!]?.note || '' 
                        }
                    }));
                }
            }
        }
    }

    setQuickLogState({
        isActive: false,
        dateStr: null,
        startPos: null,
        currentPos: null
    });

  }, [triggerHaptic]);

  useEffect(() => {
    if (quickLogState.isActive) {
        window.addEventListener('touchmove', handleGlobalMove, { passive: false });
        window.addEventListener('touchend', handleGlobalEnd);
        window.addEventListener('mousemove', handleGlobalMove);
        window.addEventListener('mouseup', handleGlobalEnd);
    } else {
        window.removeEventListener('touchmove', handleGlobalMove);
        window.removeEventListener('touchend', handleGlobalEnd);
        window.removeEventListener('mousemove', handleGlobalMove);
        window.removeEventListener('mouseup', handleGlobalEnd);
    }
    return () => {
        window.removeEventListener('touchmove', handleGlobalMove);
        window.removeEventListener('touchend', handleGlobalEnd);
        window.removeEventListener('mousemove', handleGlobalMove);
        window.removeEventListener('mouseup', handleGlobalEnd);
    };
  }, [quickLogState.isActive, handleGlobalMove, handleGlobalEnd]);

  const handleDayLongPress = useCallback((dateStr: string, x: number, y: number) => {
      SoundManager.play('pop'); 
      setQuickLogState({
          isActive: true,
          dateStr: dateStr,
          startPos: { x, y },
          currentPos: { x, y }
      });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            if (isMoodModalOpen) setIsMoodModalOpen(false);
            if (isStatsModalOpen) setIsStatsModalOpen(false);
            if (isSearchModalOpen) setIsSearchModalOpen(false);
            if (isCloudModalOpen) setIsCloudModalOpen(false);
            if (isSettingsOpen) setIsSettingsOpen(false);
            if (showResetConfirm) setShowResetConfirm(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMoodModalOpen, isStatsModalOpen, isSearchModalOpen, isCloudModalOpen, isSettingsOpen, showResetConfirm]);

  useEffect(() => {
    const isAnyModalOpen = isMoodModalOpen || isStatsModalOpen || isSearchModalOpen || isCloudModalOpen || isSettingsOpen || showResetConfirm || quickLogState.isActive;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMoodModalOpen, isStatsModalOpen, isSearchModalOpen, isCloudModalOpen, isSettingsOpen, showResetConfirm, quickLogState.isActive]);

  const streak = useMemo(() => {
    const entries = (Object.entries(yearData) as [string, DayData][])
      .filter(([_, d]) => d.level > 0)
      .sort((a, b) => b[0].localeCompare(a[0]));
    
    if (entries.length === 0) return 0;

    let count = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

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

  const selectedTitle = useMemo(() => APP_TITLES[Math.floor(Math.random() * APP_TITLES.length)], []);
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
    
    // Cargar config
    const storedEco = localStorage.getItem('pepe_eco_mode');
    if (storedEco) setEcoMode(storedEco === 'true');
    // Note: particleCount not loaded to avoid complexity, defaults to screen size based
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(yearData));
  }, [yearData]);
  
  // Guardar config al cambiar
  useEffect(() => {
      localStorage.setItem('pepe_eco_mode', String(ecoMode));
      localStorage.setItem('pepe_particle_count', String(particleCount));
  }, [ecoMode, particleCount]);

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
  
  const handleImportClick = () => {
     if (fileInputRef.current) fileInputRef.current.value = '';
     fileInputRef.current?.click();
  }

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
          setIsSettingsOpen(false); // Close modal on success
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
      <Particles count={particleCount} enabled={!ecoMode} />
      
      {/* Input oculto para importación - se mantiene en el DOM para funcionar */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImport} 
        accept=".json" 
        className="hidden" 
      />

      <QuickLogMenu 
        isOpen={quickLogState.isActive}
        startPos={quickLogState.startPos}
        currentPos={quickLogState.currentPos}
      />
      
      <header className="mt-8 mb-6 text-center flex flex-col items-center relative w-full px-4">
        {streak > 0 && (
          <div className="mb-4 lg:absolute lg:top-0 lg:right-12 flex items-center gap-2 bg-slate-900/60 backdrop-blur-md border border-orange-500/40 px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.2)] animate-in fade-in slide-in-from-top duration-700 z-30">
            <Flame size={20} className="text-orange-500 fill-orange-500 animate-pulse" />
            <span className="text-xs md:text-sm font-black text-white tracking-widest">{streak} DÍAS DE RACHA</span>
          </div>
        )}

        <div className="relative group mb-8 mt-4">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] pointer-events-none opacity-80 ${ecoMode ? 'hidden' : ''}`}>
                 <div className="absolute inset-0 border-2 border-green-500/30 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>
                 <div className="absolute inset-8 border-2 border-emerald-400/40 rounded-full border-dotted animate-[spin_15s_linear_infinite_reverse]"></div>
                 <div className="absolute inset-4 bg-green-500/20 blur-[50px] rounded-full animate-pulse"></div>
            </div>

            <div className="relative w-48 h-48 md:w-64 md:h-64 bg-gradient-to-b from-slate-800/80 to-slate-900/90 backdrop-blur-xl rounded-[3rem] border border-slate-700/50 shadow-[0_25px_60px_-15px_rgba(34,197,94,0.3)] flex items-center justify-center overflow-hidden pepe-float z-10 transition-all duration-500 hover:scale-105 group-hover:shadow-[0_30px_70px_-10px_rgba(34,197,94,0.4)]">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20"></div>
                {!bannerError ? (
                <img 
                    src={PEPE_BANNER} 
                    alt="Pepe" 
                    className="w-[85%] h-[85%] object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105 group-hover:rotate-2 relative z-10"
                    onError={() => setBannerError(true)}
                />
                ) : (
                <span className="text-6xl animate-bounce">🐸</span>
                )}
            </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-green-400 via-emerald-300 to-green-600 bg-clip-text text-transparent py-2 px-6 leading-tight animate-shimmer tracking-tighter uppercase text-center drop-shadow-lg">
          {selectedTitle}
        </h1>
        <p className="text-slate-400 font-bold tracking-[0.2em] text-[10px] md:text-sm mt-1 italic opacity-90 uppercase text-center max-w-lg mx-auto">
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

      <Calendar 
        yearData={yearData} 
        onDayClick={handleDayClick} 
        onDayLongPress={handleDayLongPress}
        currentYear={currentYear} 
        highlightedDates={highlightedDates}
      />

      <footer className="mt-auto py-10 opacity-30">
        <p className="text-[10px] font-black tracking-[0.3em] uppercase">developed by <span className="text-green-500">Juasmio</span></p>
      </footer>

      <FloatingMenu 
        onStats={() => { triggerHaptic('light'); setIsStatsModalOpen(true); }}
        onReset={() => { triggerHaptic('medium'); setShowResetConfirm(true); }}
        onSearch={() => { triggerHaptic('light'); setIsSearchModalOpen(true); }}
        onCloud={() => { triggerHaptic('light'); setIsCloudModalOpen(true); }}
        onSettings={() => { triggerHaptic('light'); setIsSettingsOpen(true); }}
      />

      <Suspense fallback={<ModalLoader />}>
        {isMoodModalOpen && (
            <MoodModal
            isOpen={isMoodModalOpen}
            onClose={() => setIsMoodModalOpen(false)}
            onSave={handleSaveDay}
            onDelete={handleDeleteDay}
            dateStr={selectedDate || ''}
            initialData={selectedDate ? yearData[selectedDate] || { level: MoodLevel.None, note: '' } : { level: MoodLevel.None, note: '' }}
            />
        )}
        {isStatsModalOpen && <StatsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} data={yearData} />}
        {isSearchModalOpen && <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} data={yearData} onJumpToDate={(date) => { setSelectedDate(date); setIsMoodModalOpen(true); }} onHighlightResults={(dates) => setHighlightedDates(dates)} />}
        {isCloudModalOpen && <CloudModal isOpen={isCloudModalOpen} onClose={() => setIsCloudModalOpen(false)} data={yearData} />}
      </Suspense>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsSettingsOpen(false)}>
           <div 
            className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden p-6 relative" 
            onClick={(e) => e.stopPropagation()}
           >
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-slate-800 rounded-xl text-slate-300">
                    <Sliders size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Configuración</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ajustes & Datos</p>
                 </div>
              </div>

              <div className="space-y-6">
                  {/* ECO MODE TOGGLE */}
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${ecoMode ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                              <BatteryCharging size={18} />
                          </div>
                          <div>
                              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Modo Ahorro</div>
                              <div className="text-[9px] text-slate-500 font-medium">Desactiva partículas y blur</div>
                          </div>
                      </div>
                      <button 
                        onClick={() => setEcoMode(!ecoMode)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${ecoMode ? 'bg-green-500' : 'bg-slate-700'}`}
                      >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${ecoMode ? 'translate-x-4' : ''}`}></div>
                      </button>
                  </div>

                  {!ecoMode && (
                  <div className="space-y-3 opacity-100 transition-opacity">
                      <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Intensidad del Pantano</label>
                          <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded">{particleCount}</span>
                      </div>
                      
                      <div className="relative h-6 flex items-center">
                          <input 
                            type="range" 
                            min="0" 
                            max="800" 
                            step="10" 
                            value={particleCount} 
                            onChange={(e) => setParticleCount(Number(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-all"
                          />
                      </div>
                  </div>
                  )}

                  <div className="pt-4 border-t border-slate-700 mt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">Gestión de Datos</h4>
                    <div className="grid grid-cols-2 gap-3">
                         {/* EXPORT BUTTON */}
                         <button 
                            onClick={handleExport}
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-4 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/40 active:scale-95"
                        >
                            <div className="relative z-10 flex flex-col items-center gap-1">
                                <Save size={24} className="text-emerald-100 group-hover:scale-110 transition-transform duration-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">Exportar</span>
                            </div>
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        </button>
                        
                        {/* IMPORT BUTTON */}
                        <button 
                            onClick={handleImportClick}
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-95"
                        >
                            <div className="relative z-10 flex flex-col items-center gap-1">
                                <FileJson size={24} className="text-blue-100 group-hover:scale-110 transition-transform duration-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">Importar</span>
                            </div>
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase text-xs rounded-xl transition-colors"
                  >
                    Listo
                  </button>
              </div>
           </div>
        </div>
      )}

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
