import React, { useState, useEffect, useCallback, Suspense, useRef, useMemo } from 'react';
import Calendar from './components/Calendar';
import FloatingMenu from './components/FloatingMenu';
import PepeOracle from './components/PepeOracle';
import Particles from './components/Particles';
import QuickLogMenu from './components/QuickLogMenu'; 
import WelcomeModal from './components/WelcomeModal'; 
import { YearData, DayData, MoodLevel, Achievement } from './types';
import { STORAGE_KEY, BANNER_SLIDES, PEPE_ASSETS } from './constants';
import { Plus, Trash2, AlertTriangle, Sliders, Loader2, BatteryCharging, FileJson, Save, Trophy, HelpCircle, BookOpen, BoxSelect } from 'lucide-react';
import SoundManager from './utils/sounds';
import { ACHIEVEMENTS, getUnlockedAchievements } from './utils/gamification';

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

const TUTORIAL_KEY = 'pepe_tutorial_seen_v1';
const ACHIEVEMENTS_STORAGE_KEY = 'pepe_achievements_unlocked_v1';

const App: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [yearData, setYearData] = useState<YearData>({});
  
  // Banner Slideshow State
  const [bannerIndex, setBannerIndex] = useState(0);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false); // Estado elevado
  
  // Real-time achievement notifications
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  const [isClosingToast, setIsClosingToast] = useState(false); 
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prevUnlockedRef = useRef<string[]>([]);
  const notifiedAchievementsRef = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Configuración
  const [ecoMode, setEcoMode] = useState(false);
  const [pixelMode, setPixelMode] = useState(false); // NUEVO: Modo Píxel
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
  
  // GENERACIÓN DE PÍXELES ACTIVOS PARA EL BANNER
  // Calculamos posiciones alineadas al grid de 14px
  const activePixels = useMemo(() => {
    const colors = [
        '#4ade80', // Green (Pepe base)
        '#22c55e', // Green strong
        '#60a5fa', // Blue
        '#818cf8', // Indigo
        '#c084fc', // Purple
        '#f472b6', // Pink (Requested)
        '#fb7185', // Rose (Requested)
        '#fbbf24', // Amber
        '#38bdf8'  // Sky
    ];

    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      // Grid size is 14px. Max width roughly 18 cols for w-64
      left: Math.floor(Math.random() * 18) * 14, 
      top: Math.floor(Math.random() * 18) * 14,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4
    }));
  }, []);
  
  useEffect(() => {
    quickLogStateRef.current = quickLogState;
  }, [quickLogState]);

  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);

  // OPTIMIZACIÓN: Detectar si hay modales abiertos para pausar animaciones de fondo
  const isAnyModalOpen = isMoodModalOpen || isStatsModalOpen || isSearchModalOpen || isCloudModalOpen || isSettingsOpen || showResetConfirm || quickLogState.isActive || isWelcomeModalOpen;

  // Fix for infinite loop: Stable callback for highlighting results
  const handleHighlightResults = useCallback((dates: string[]) => {
      setHighlightedDates(dates);
  }, []);

  // Efecto para Modo Eco (Body Class)
  useEffect(() => {
      if (ecoMode) {
          document.body.classList.add('eco-mode');
      } else {
          document.body.classList.remove('eco-mode');
      }
  }, [ecoMode]);

  // Efecto para rotar el Banner
  useEffect(() => {
    // Si hay un modal abierto, detenemos el intervalo para evitar re-renderizados en App
    if (isAnyModalOpen) return;

    const interval = setInterval(() => {
        setBannerIndex((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 4000); // Cambiar cada 4 segundos
    return () => clearInterval(interval);
  }, [isAnyModalOpen]);

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
    
    // Check Tutorial Logic
    const hasSeenTutorial = localStorage.getItem(TUTORIAL_KEY);
    if (!hasSeenTutorial) {
        setTimeout(() => setIsWelcomeModalOpen(true), 1000);
    }

    // Load persisted achievements
    try {
        const storedAchievements = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
        if (storedAchievements) {
            const parsed = JSON.parse(storedAchievements);
            if (Array.isArray(parsed)) {
                notifiedAchievementsRef.current = new Set(parsed);
            }
        }
    } catch (e) {
        console.error("Failed to load achievements", e);
    }
  }, []);

  // Función para cerrar el toast con animación
  const closeAchievementToast = useCallback(() => {
      setIsClosingToast(true);
      // Esperar a que termine la animación de salida (700ms)
      setTimeout(() => {
          setNewlyUnlocked(null);
          setIsClosingToast(false);
      }, 700);
  }, []);

  // Achievement Logic
  useEffect(() => {
    const currentUnlocked = getUnlockedAchievements(yearData);
    
    if (isFirstLoad.current) {
        prevUnlockedRef.current = currentUnlocked;
        isFirstLoad.current = false;
        return;
    }

    // Identificar nuevos logros que NO hayan sido notificados previamente
    const newIds = currentUnlocked.filter(id => 
        !prevUnlockedRef.current.includes(id) && 
        !notifiedAchievementsRef.current.has(id)
    );

    if (newIds.length > 0) {
        // Find the full achievement object for the first new one
        const achievement = ACHIEVEMENTS.find(ach => ach.id === newIds[0]);
        if (achievement) {
            // Si ya hay uno mostrándose, lo reemplazamos inmediatamente (o podríamos ponerlo en cola)
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
            
            setNewlyUnlocked(achievement);
            setIsClosingToast(false);
            
            // Play the new EPIC achievement sound
            SoundManager.play('achievement'); 
            triggerHaptic('heavy');
            
            // Auto-hide after 6 seconds (longer duration for better visibility)
            toastTimeoutRef.current = setTimeout(() => {
                closeAchievementToast();
            }, 6000);

            // Persistir los logros notificados
            newIds.forEach(id => notifiedAchievementsRef.current.add(id));
            localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(Array.from(notifiedAchievementsRef.current)));
        }
    }
    
    prevUnlockedRef.current = currentUnlocked;
  }, [yearData, triggerHaptic, closeAchievementToast]);


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
            if (isWelcomeModalOpen) setIsWelcomeModalOpen(false);
            if (newlyUnlocked) closeAchievementToast();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMoodModalOpen, isStatsModalOpen, isSearchModalOpen, isCloudModalOpen, isSettingsOpen, showResetConfirm, newlyUnlocked, closeAchievementToast, isWelcomeModalOpen]);

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isAnyModalOpen]);

  // Titulo Fijo para mayor claridad
  const MAIN_TITLE = "PEPE PIXEL YEAR";
  const SUBTITLE = `${currentYear} EDITION`;

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setYearData(JSON.parse(stored)); } catch (e) { console.error(e); }
    }
    
    // Cargar config
    const storedEco = localStorage.getItem('pepe_eco_mode');
    if (storedEco) setEcoMode(storedEco === 'true');
    
    const storedPixel = localStorage.getItem('pepe_pixel_mode');
    if (storedPixel) setPixelMode(storedPixel === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(yearData));
  }, [yearData]);
  
  // Guardar config al cambiar
  useEffect(() => {
      localStorage.setItem('pepe_eco_mode', String(ecoMode));
      localStorage.setItem('pepe_pixel_mode', String(pixelMode));
      localStorage.setItem('pepe_particle_count', String(particleCount));
  }, [ecoMode, particleCount, pixelMode]);

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
      <Particles count={particleCount} enabled={!ecoMode} pixelMode={pixelMode} />
      
      {/* Componente de Tutorial Inicial */}
      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} />

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

      {/* ENHANCED ACHIEVEMENT TOAST NOTIFICATION (ULTIMATE VERSION) */}
      {newlyUnlocked && (
          <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-8 pointer-events-none px-4">
              <style>{`
                @keyframes bounceIn {
                    0% { opacity: 0; transform: translateY(-100px) scale(0.5); }
                    60% { opacity: 1; transform: translateY(20px) scale(1.1); }
                    80% { transform: translateY(-5px) scale(0.95); }
                    100% { transform: translateY(0) scale(1); }
                }
                @keyframes implodeOut {
                    0% { opacity: 1; transform: translateY(0) scale(1); filter: brightness(1); }
                    30% { opacity: 1; transform: translateY(0) scale(1.1); filter: brightness(1.5); }
                    100% { opacity: 0; transform: translateY(0) scale(0) rotate(720deg); filter: brightness(3) blur(20px); }
                }
                @keyframes spin-border {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes god-rays {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse-shadow {
                    0%, 100% { box-shadow: 0 0 20px ${newlyUnlocked.color}40, 0 0 40px ${newlyUnlocked.color}20; }
                    50% { box-shadow: 0 0 50px ${newlyUnlocked.color}80, 0 0 80px ${newlyUnlocked.color}40; }
                }
                @keyframes shimmer-fast {
                    0% { transform: translateX(-150%) skewX(-15deg); }
                    100% { transform: translateX(150%) skewX(-15deg); }
                }
              `}</style>
              
              {/* Main Animation Container */}
              <div 
                  className="w-full max-w-sm relative pointer-events-auto"
                  style={{ 
                      animation: isClosingToast 
                        ? 'implodeOut 0.7s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards' 
                        : 'bounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                  }}
                  onClick={() => {
                      if (!isClosingToast) {
                          closeAchievementToast();
                          setTimeout(() => setIsStatsModalOpen(true), 700);
                      }
                  }}
              >
                 
                 {/* God Rays Background - Fixed to be soft and circular */}
                 <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
                      <div 
                          className="w-[500px] h-[500px] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.2),transparent)] rounded-full"
                          style={{ 
                              animation: 'god-rays 10s linear infinite',
                              maskImage: 'radial-gradient(closest-side, black 40%, transparent 100%)',
                              WebkitMaskImage: 'radial-gradient(closest-side, black 40%, transparent 100%)'
                          }}
                      />
                 </div>

                 {/* Explosion Particles */}
                 {!isClosingToast && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible w-full h-full pointer-events-none">
                     {[...Array(20)].map((_, i) => (
                         <div key={i} className="absolute w-2 h-2 rounded-full animate-ping"
                             style={{
                                 backgroundColor: i % 2 === 0 ? newlyUnlocked.color : '#fff',
                                 top: '50%', left: '50%',
                                 transform: `rotate(${i * 18}deg) translate(${80 + Math.random()*60}px)`,
                                 animationDuration: `${0.6 + Math.random() * 0.8}s`,
                                 animationDelay: `0.1s`
                             }}
                         />
                     ))}
                 </div>
                 )}

                 {/* Card Wrapper with Rotating Border */}
                 <div className="relative z-10 p-[3px] rounded-3xl overflow-hidden group">
                     {/* Spinning Gradient Border */}
                     <div 
                        className="absolute inset-[-50%] animate-[spin-border_3s_linear_infinite]"
                        style={{ 
                            background: `conic-gradient(from 0deg, transparent 0deg, ${newlyUnlocked.color} 90deg, transparent 180deg, ${newlyUnlocked.color} 270deg, transparent 360deg)`
                        }}
                     />
                     
                     {/* The Card Itself */}
                     <div 
                        className="relative bg-slate-900 rounded-[22px] overflow-hidden backdrop-blur-3xl"
                        style={{ animation: 'pulse-shadow 2s infinite ease-in-out' }}
                     >
                        <div className="absolute inset-0 bg-slate-900/90 z-0" />
                        
                        {/* Dynamic Background Noise/Texture */}
                        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')] z-0" />
                        
                        <div className="relative z-10 p-5 flex items-center gap-5">
                            {/* Icon Container */}
                            <div className="shrink-0 relative">
                                <div className="absolute inset-0 blur-2xl opacity-60 animate-pulse" style={{ backgroundColor: newlyUnlocked.color }}></div>
                                <div 
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center relative shadow-lg border border-white/20 overflow-hidden"
                                    style={{ backgroundColor: `${newlyUnlocked.color}20` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    <newlyUnlocked.icon size={36} style={{ color: newlyUnlocked.color }} className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-[spin_3s_ease-in-out_infinite_alternate]" />
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="px-2 py-0.5 rounded-md bg-yellow-500/20 border border-yellow-500/40 flex items-center gap-1 shadow-sm">
                                        <Trophy size={10} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">Logro Desbloqueado</span>
                                    </div>
                                </div>
                                <h4 className="text-xl font-black text-white leading-tight mb-1 drop-shadow-md tracking-tight">
                                    {newlyUnlocked.title}
                                </h4>
                                <p className="text-xs text-slate-300 font-medium leading-relaxed opacity-90 line-clamp-2">
                                    {newlyUnlocked.description}
                                </p>
                            </div>
                        </div>

                        {/* Hyper Shimmer Overlay */}
                        <div 
                            className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/30 to-transparent z-20"
                            style={{ animation: 'shimmer-fast 2s infinite linear' }}
                        />
                     </div>
                 </div>
              </div>
          </div>
      )}
      
      <header className="mt-8 mb-6 text-center flex flex-col items-center relative w-full px-4">
        
        <div className="relative group mb-8 mt-4">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] pointer-events-none opacity-80 ${ecoMode ? 'hidden' : ''}`}>
                 <div className="absolute inset-0 border-2 border-green-500/30 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>
                 <div className="absolute inset-8 border-2 border-emerald-400/40 rounded-full border-dotted animate-[spin_15s_linear_infinite_reverse]"></div>
                 <div className="absolute inset-4 bg-green-500/20 blur-[50px] rounded-full animate-pulse"></div>
            </div>

            {/* NEW RETRO/PIXEL STYLE BANNER CONTAINER */}
            <div 
                className="relative w-48 h-48 md:w-64 md:h-64 rounded-[3rem] overflow-hidden pepe-float z-10 transition-all duration-500 hover:scale-105 group-hover:shadow-[0_30px_70px_-10px_rgba(34,197,94,0.4)] border-4 border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900"
            >
                {/* 1. Pixel Grid Background (Fixed: No rotating square) */}
                <div 
                    className="absolute inset-0 z-0 pointer-events-none" 
                    style={{
                        backgroundImage: `linear-gradient(rgba(34, 197, 94, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.2) 1px, transparent 1px)`,
                        backgroundSize: '14px 14px',
                        imageRendering: 'pixelated',
                        // MASCARA RADIAL: Evita el efecto de bordes duros/cuadrados
                        maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
                    }}
                >
                    {/* NEW: Pixel Breathing Animation (By Parts) */}
                    {!ecoMode && activePixels.map((p) => (
                        <div
                            key={p.id}
                            className="absolute"
                            style={{
                                width: '14px',
                                height: '14px',
                                top: `${p.top}px`,
                                left: `${p.left}px`,
                                backgroundColor: p.color,
                                animation: `pixel-breath ${p.duration}s infinite ${p.delay}s`,
                                boxShadow: `0 0 10px ${p.color}`,
                                opacity: 0 // Start hidden
                            }}
                        />
                    ))}
                    <style>{`
                        @keyframes pixel-breath {
                            0% { opacity: 0; transform: scale(0.5); }
                            30% { opacity: 0.8; transform: scale(1); box-shadow: 0 0 15px currentColor; }
                            70% { opacity: 0.8; transform: scale(1); }
                            100% { opacity: 0; transform: scale(0.5); }
                        }
                    `}</style>
                </div>
                
                {/* 2. CRT Scanline Effect */}
                <div className="absolute inset-0 z-20 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px]"></div>
                <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-[scan_3s_linear_infinite] h-full opacity-30"></div>
                <style>{`@keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }`}</style>
                
                {/* 3. Rotating Images with Cross-Fade */}
                <div className="absolute inset-0 z-10 p-6 flex items-center justify-center">
                    {BANNER_SLIDES.map((src, index) => {
                        const isFavicon1 = src === PEPE_ASSETS.FAVICON_1;
                        const isActive = index === bannerIndex;
                        
                        return (
                            <img 
                                key={src}
                                src={src} 
                                alt="Pepe Banner" 
                                className={`
                                    absolute inset-0 w-full h-full object-contain p-6 transition-all duration-1000 ease-in-out
                                    ${isActive 
                                        ? (isFavicon1 ? 'opacity-100 scale-125 blur-0' : 'opacity-100 scale-100 blur-0') 
                                        : 'opacity-0 scale-90 blur-sm'
                                    }
                                `}
                            />
                        );
                    })}
                </div>

                {/* 4. Glare Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-30"></div>
            </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-green-400 via-emerald-300 to-green-600 bg-clip-text text-transparent py-2 px-6 leading-tight animate-shimmer tracking-tighter uppercase text-center drop-shadow-lg">
          {MAIN_TITLE}
        </h1>
        <p className="text-slate-400 font-bold tracking-[0.2em] text-[10px] md:text-sm mt-1 italic opacity-90 uppercase text-center max-w-lg mx-auto">
          {SUBTITLE}
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
        {isSearchModalOpen && <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} data={yearData} onJumpToDate={(date) => { setSelectedDate(date); setIsMoodModalOpen(true); }} onHighlightResults={handleHighlightResults} />}
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
                  {/* TUTORIAL RELOAD BUTTON - NEW */}
                  <button 
                    onClick={() => {
                        SoundManager.play('click');
                        setIsSettingsOpen(false);
                        setIsWelcomeModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-3 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl border border-indigo-500/30 group transition-all"
                  >
                     <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                             <BookOpen size={18} />
                         </div>
                         <div className="text-left">
                             <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Ver Tutorial / Guía</div>
                             <div className="text-[9px] text-indigo-400/70 font-medium">Instrucciones y trucos</div>
                         </div>
                     </div>
                     <HelpCircle size={18} className="text-indigo-400 opacity-50 group-hover:opacity-100" />
                  </button>

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
                  
                  {/* PIXEL MODE TOGGLE - NEW */}
                  {!ecoMode && (
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                          <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${pixelMode ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                  <BoxSelect size={18} />
                              </div>
                              <div>
                                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Partículas Pixel Art</div>
                                  <div className="text-[9px] text-slate-500 font-medium">Vibra 8-bits retro</div>
                              </div>
                          </div>
                          <button 
                            onClick={() => setPixelMode(!pixelMode)}
                            className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${pixelMode ? 'bg-purple-500' : 'bg-slate-700'}`}
                          >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${pixelMode ? 'translate-x-4' : ''}`}></div>
                          </button>
                      </div>
                  )}

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
                onClick={() => { 
                    triggerHaptic('heavy'); 
                    SoundManager.play('trash'); 
                    // 1. Clear Data
                    setYearData({}); 
                    // 2. Clear Achievement Memory
                    localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
                    notifiedAchievementsRef.current = new Set();
                    prevUnlockedRef.current = [];
                    // 3. Optional: Clear specific achievements if needed
                    localStorage.removeItem('pepe_ach_dark_knight_unlocked');
                    
                    setShowResetConfirm(false); 
                }}
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