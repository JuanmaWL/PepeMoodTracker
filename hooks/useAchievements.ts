import { useState, useEffect, useCallback, useRef } from 'react';
import { YearData, Achievement, UnlockedAchievement } from '../types';
import { ACHIEVEMENTS, getUnlockedAchievements, calculateHistoricalUnlockDate } from '../utils/gamification';
import SoundManager from '../utils/sounds';

const ACHIEVEMENTS_STORAGE_KEY_V1 = 'pepe_achievements_unlocked_v1';
const ACHIEVEMENTS_STORAGE_KEY_V2 = 'pepe_achievements_unlocked_v2';

interface UseAchievementsOptions {
  yearData: YearData;
  particleCount: number;
  ecoMode: boolean;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy') => void;
}

export function useAchievements({ yearData, particleCount, ecoMode, triggerHaptic }: UseAchievementsOptions) {
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>(() => {
    try {
      const storedV2 = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY_V2);
      if (storedV2) {
        return JSON.parse(storedV2);
      }
      const storedV1 = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY_V1);
      if (storedV1) {
        const parsedV1 = JSON.parse(storedV1) as string[];
        const migrated: UnlockedAchievement[] = parsedV1.map(id => ({
          id,
          unlockedAt: 0
        }));
        localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY_V2, JSON.stringify(migrated));
        return migrated;
      }
    } catch (e) {
      console.error('Failed to load achievements:', e);
    }
    return [];
  });

  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  const [isClosingToast, setIsClosingToast] = useState(false);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeAnimTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const evalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);

  const closeAchievementToast = useCallback(() => {
    setIsClosingToast(true);
    if (closeAnimTimeoutRef.current) clearTimeout(closeAnimTimeoutRef.current);
    closeAnimTimeoutRef.current = setTimeout(() => {
      setNewlyUnlocked(null);
      setIsClosingToast(false);
    }, 700);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (closeAnimTimeoutRef.current) clearTimeout(closeAnimTimeoutRef.current);
      if (evalTimeoutRef.current) clearTimeout(evalTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    const currentValidIDs = getUnlockedAchievements(yearData, { particleCount, ecoMode });
    const existingIDs = new Set(unlockedAchievements.map(ua => ua.id));
    const newUnlockIDs = currentValidIDs.filter(id => !existingIDs.has(id));

    if (newUnlockIDs.length > 0) {
      if (evalTimeoutRef.current) clearTimeout(evalTimeoutRef.current);
      evalTimeoutRef.current = setTimeout(() => {
        const newUnlocksData: UnlockedAchievement[] = newUnlockIDs.map(id => {
          const definition = ACHIEVEMENTS.find(a => a.id === id);
          const unlockTimestamp = definition
            ? calculateHistoricalUnlockDate(definition, yearData, { particleCount, ecoMode })
            : Date.now();
          return { id, unlockedAt: unlockTimestamp };
        });

        const updatedList = [...unlockedAchievements, ...newUnlocksData];
        setUnlockedAchievements(updatedList);
        try {
          localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY_V2, JSON.stringify(updatedList));
        } catch (e) {
          console.error('Failed to persist achievements:', e);
        }

        const achievementDef = ACHIEVEMENTS.find(ach => ach.id === newUnlockIDs[0]);
        if (achievementDef) {
          if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
          setNewlyUnlocked(achievementDef);
          setIsClosingToast(false);
          SoundManager.play('achievement');
          triggerHaptic('heavy');
          toastTimeoutRef.current = setTimeout(() => {
            closeAchievementToast();
          }, 6000);
        }
      }, 50);
    }
  }, [yearData, unlockedAchievements, ecoMode, particleCount, triggerHaptic, closeAchievementToast]);

  const resetAchievements = useCallback(() => {
    try {
      localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY_V2);
      localStorage.removeItem('pepe_ach_dark_knight_unlocked');
    } catch {
      // Ignore storage errors
    }
    setUnlockedAchievements([]);
  }, []);

  return {
    unlockedAchievements,
    newlyUnlocked,
    isClosingToast,
    closeAchievementToast,
    resetAchievements
  };
}
