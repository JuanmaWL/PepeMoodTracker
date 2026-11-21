import React, { useState, useEffect, useCallback, Suspense, useRef, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Calendar from './components/Calendar';
import FloatingMenu from './components/FloatingMenu';
import PepeOracle from './components/PepeOracle';
import GeminiStatusBulb from './components/GeminiStatusBulb';
import Particles from './components/Particles';
import QuickLogMenu from './components/QuickLogMenu';
import WelcomeModal from './components/WelcomeModal';
import BannerShowcase from './components/BannerShowcase';
import AchievementToast from './components/AchievementToast';
import InAppNotificationBanner from './components/InAppNotificationBanner';
import { DayData, MoodLevel } from './types';
import { PEPE_ASSETS } from './constants';
import SoundManager from './utils/sounds';
import { getLocalDateStr } from './utils/date';
import { useAppSettings } from './hooks/useAppSettings';
import { useYearData } from './hooks/useYearData';
import { useAchievements } from './hooks/useAchievements';
import { useNotifications } from './hooks/useNotifications';

const MoodModal = React.lazy(() => import('./components/MoodModal'));
const StatsModal = React.lazy(() => import('./components/StatsModal'));
const SearchModal = React.lazy(() => import('./components/SearchModal'));
const CloudModal = React.lazy(() => import('./components/CloudModal'));
const AchievementsModal = React.lazy(() => import('./components/AchievementsModal'));
const SettingsModal = React.lazy(() => import('./components/SettingsModal'));
const ResetConfirmModal = React.lazy(() => import('./components/ResetConfirmModal'));

const TUTORIAL_KEY = 'pepe_tutorial_seen_v1';

const ModalLoader = () => {
  const gif = useMemo(() => {
    const gifs = [PEPE_ASSETS.LOADING, PEPE_ASSETS.LOADING_2, PEPE_ASSETS.LOADING_3];
    return gifs[Math.floor(Math.random() * gifs.length)];
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
        <div className="relative w-28 h-28">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-800 bg-slate-900 shadow-2xl relative z-10">
            <img src={gif} alt="Loading..." className="w-full h-full object-cover" />
          </div>
          <div className="absolute -inset-2 border-2 border-dashed border-green-500/30 rounded-full animate-[spin_4s_linear_infinite]"></div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-xs font-black text-green-400 uppercase tracking-[0.25em] animate-pulse">Cargando...</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Procesando Lore</span>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);

  const [quickLogState, setQuickLogState] = useState<{
    isActive: boolean;
    dateStr: string | null;
    startPos: { x: number; y: number } | null;
  }>({
    isActive: false,
    dateStr: null,
    startPos: null
  });
  const quickLogStateRef = useRef(quickLogState);
  useEffect(() => {
    quickLogStateRef.current = quickLogState;
  }, [quickLogState]);

  const {
    ecoMode,
    setEcoMode,
    pixelMode,
    setPixelMode,
    particleCount,
    setParticleCount,
    triggerHaptic
  } = useAppSettings();

  const {
    yearData,
    saveDay,
    deleteDay,
    quickSetMood,
    clearAllData,
    exportData,
    importData
  } = useYearData({ currentYear, triggerHaptic });

  const {
    unlockedAchievements,
    newlyUnlocked,
    isClosingToast,
    closeAchievementToast,
    resetAchievements
  } = useAchievements({ yearData, particleCount, ecoMode, triggerHaptic });

  const {
    notificationsEnabled,
    nextScheduledInfo,
    activeInAppNotification,
    notificationFeedback,
    dismissInAppNotification,
    clearNotificationFeedback,
    sendPepeNotification,
    toggleNotifications,
    testLocalNotification
  } = useNotifications({ yearData, triggerHaptic });

  useEffect(() => {
    SoundManager.preload();
    const hasSeenTutorial = localStorage.getItem(TUTORIAL_KEY);
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setIsWelcomeModalOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const isAnyModalOpen =
    isMoodModalOpen ||
    isStatsModalOpen ||
    isSearchModalOpen ||
    isCloudModalOpen ||
    isSettingsOpen ||
    showResetConfirm ||
    quickLogState.isActive ||
    isWelcomeModalOpen ||
    isAchievementsModalOpen;

  useEffect(() => {
    document.body.style.overflow = isAnyModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isMoodModalOpen) setIsMoodModalOpen(false);
      if (isStatsModalOpen) setIsStatsModalOpen(false);
      if (isSearchModalOpen) setIsSearchModalOpen(false);
      if (isCloudModalOpen) setIsCloudModalOpen(false);
      if (isAchievementsModalOpen) setIsAchievementsModalOpen(false);
      if (isSettingsOpen) setIsSettingsOpen(false);
      if (showResetConfirm) setShowResetConfirm(false);
      if (isWelcomeModalOpen) setIsWelcomeModalOpen(false);
      if (newlyUnlocked) closeAchievementToast();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isMoodModalOpen,
    isStatsModalOpen,
    isSearchModalOpen,
    isCloudModalOpen,
    isAchievementsModalOpen,
    isSettingsOpen,
    showResetConfirm,
    isWelcomeModalOpen,
    newlyUnlocked,
    closeAchievementToast
  ]);

  const handleDayClick = useCallback((dateStr: string) => {
    triggerHaptic('light');
    SoundManager.play('click');
    setSelectedDate(dateStr);
    setIsMoodModalOpen(true);
  }, [triggerHaptic]);

  const handleDayLongPress = useCallback((dateStr: string, x: number, y: number) => {
    SoundManager.play('pop');
    setQuickLogState({
      isActive: true,
      dateStr,
      startPos: { x, y }
    });
  }, []);

  const handleQuickLogComplete = useCallback((result: { type: 'MOOD' | 'DELETE' | null; data?: any }) => {
    const state = quickLogStateRef.current;
    if (state.dateStr && result) {
      if (result.type === 'DELETE') {
        SoundManager.play('trash');
        deleteDay(state.dateStr);
      } else if (result.type === 'MOOD' && result.data) {
        quickSetMood(state.dateStr, result.data as MoodLevel);
      }
    }
    setQuickLogState({ isActive: false, dateStr: null, startPos: null });
  }, [deleteDay, quickSetMood]);

  const handleSaveDay = useCallback((data: DayData) => {
    if (!selectedDate) return;
    saveDay(selectedDate, data);
  }, [selectedDate, saveDay]);

  const handleDeleteDay = useCallback((dateToDelete: string) => {
    if (!dateToDelete) return;
    deleteDay(dateToDelete);
    setIsMoodModalOpen(false);
    setSelectedDate(null);
  }, [deleteDay]);

  const handleToday = useCallback(() => {
    triggerHaptic('medium');
    SoundManager.play('open');
    handleDayClick(getLocalDateStr());
  }, [triggerHaptic, handleDayClick]);

  const handleHighlightResults = useCallback((dates: string[]) => {
    setHighlightedDates(dates);
  }, []);

  const handleJumpToDate = useCallback((date: string) => {
    setSelectedDate(date);
    setIsMoodModalOpen(true);
  }, []);

  const handleImportClick = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  }, []);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importData(file, () => {
      resetAchievements();
      setIsSettingsOpen(false);
    });
    e.target.value = '';
  }, [importData, resetAchievements]);

  const handleConfirmReset = useCallback(() => {
    triggerHaptic('heavy');
    SoundManager.play('trash');
    clearAllData();
    resetAchievements();
    setShowResetConfirm(false);
  }, [triggerHaptic, clearAllData, resetAchievements]);

  const handleOpenStats = useCallback(() => {
    triggerHaptic('light');
    setIsStatsModalOpen(true);
  }, [triggerHaptic]);

  const handleOpenReset = useCallback(() => {
    triggerHaptic('medium');
    setShowResetConfirm(true);
  }, [triggerHaptic]);

  const handleOpenSearch = useCallback(() => {
    triggerHaptic('light');
    setIsSearchModalOpen(true);
  }, [triggerHaptic]);

  const handleOpenCloud = useCallback(() => {
    triggerHaptic('light');
    setIsCloudModalOpen(true);
  }, [triggerHaptic]);

  const handleOpenAchievements = useCallback(() => {
    triggerHaptic('light');
    setIsAchievementsModalOpen(true);
  }, [triggerHaptic]);

  const handleOpenSettings = useCallback(() => {
    triggerHaptic('light');
    clearNotificationFeedback();
    setIsSettingsOpen(true);
  }, [triggerHaptic, clearNotificationFeedback]);

  const handleToastClick = useCallback(() => {
    closeAchievementToast();
    setTimeout(() => setIsAchievementsModalOpen(true), 700);
  }, [closeAchievementToast]);

  const handlePreviewNotification = useCallback(() => {
    SoundManager.play('click');
    triggerHaptic('medium');
    sendPepeNotification(
      '🐸 Recordatorio de Pepe (Preview)',
      '¿Cómo te ha ido el día? No olvides registrar tu humor diario.'
    );
  }, [triggerHaptic, sendPepeNotification]);

  return (
    <div className="flex flex-col items-center min-h-screen pb-24 overflow-x-hidden text-slate-100 relative">
      <Particles count={particleCount} enabled={!ecoMode} pixelMode={pixelMode} />

      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} />

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
        onComplete={handleQuickLogComplete}
      />

      {newlyUnlocked && (
        <AchievementToast
          achievement={newlyUnlocked}
          isClosing={isClosingToast}
          onOpenAchievements={handleToastClick}
        />
      )}

      <BannerShowcase
        currentYear={currentYear}
        ecoMode={ecoMode}
        isPaused={isAnyModalOpen}
      />

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
        ecoMode={ecoMode}
        deferInitialScroll={isWelcomeModalOpen}
      />

      <footer className="mt-auto py-10 flex items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
        <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-70">
          developed by <span className="text-green-500">Juasmio</span>
        </p>
        <div className="w-1 h-1 rounded-full bg-slate-700"></div>
        <GeminiStatusBulb />
      </footer>

      <FloatingMenu
        onStats={handleOpenStats}
        onReset={handleOpenReset}
        onSearch={handleOpenSearch}
        onCloud={handleOpenCloud}
        onAchievements={handleOpenAchievements}
        onSettings={handleOpenSettings}
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
        {isStatsModalOpen && (
          <StatsModal
            isOpen={isStatsModalOpen}
            onClose={() => setIsStatsModalOpen(false)}
            data={yearData}
          />
        )}
        {isSearchModalOpen && (
          <SearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            data={yearData}
            onJumpToDate={handleJumpToDate}
            onHighlightResults={handleHighlightResults}
          />
        )}
        {isCloudModalOpen && (
          <CloudModal
            isOpen={isCloudModalOpen}
            onClose={() => setIsCloudModalOpen(false)}
            data={yearData}
          />
        )}
        {isAchievementsModalOpen && (
          <AchievementsModal
            isOpen={isAchievementsModalOpen}
            onClose={() => setIsAchievementsModalOpen(false)}
            unlockedItems={unlockedAchievements}
          />
        )}
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onOpenTutorial={() => setIsWelcomeModalOpen(true)}
            ecoMode={ecoMode}
            onToggleEcoMode={() => setEcoMode(prev => !prev)}
            pixelMode={pixelMode}
            onTogglePixelMode={() => setPixelMode(prev => !prev)}
            particleCount={particleCount}
            onChangeParticleCount={setParticleCount}
            notificationsEnabled={notificationsEnabled}
            nextScheduledInfo={nextScheduledInfo}
            notificationFeedback={notificationFeedback}
            onToggleNotifications={toggleNotifications}
            onPreviewNotification={handlePreviewNotification}
            onTestDelayedNotification={testLocalNotification}
            onExport={exportData}
            onImportClick={handleImportClick}
          />
        )}
        {showResetConfirm && (
          <ResetConfirmModal
            isOpen={showResetConfirm}
            onConfirmReset={handleConfirmReset}
            onCancel={() => setShowResetConfirm(false)}
          />
        )}
      </Suspense>

      {activeInAppNotification && (
        <InAppNotificationBanner
          notification={activeInAppNotification}
          onDismiss={dismissInAppNotification}
        />
      )}
    </div>
  );
};

export default App;
