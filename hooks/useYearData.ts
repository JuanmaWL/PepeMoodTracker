import { useState, useEffect, useCallback } from 'react';
import { YearData, DayData, MoodLevel, UnlockedAchievement } from '../types';
import SoundManager from '../utils/sounds';
import {
  buildFullBackupPayload,
  clearAllAppStorage,
  readYearDataFromStorage,
  sanitizeYearDataObject,
  writeYearDataToStorage
} from '../utils/years';

interface UseYearDataOptions {
  activeYear: number;
  realCurrentYear: number;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy') => void;
}

export function useYearData({ activeYear, realCurrentYear, triggerHaptic }: UseYearDataOptions) {
  const [yearData, setYearData] = useState<YearData>(() => readYearDataFromStorage(activeYear));
  const [storageRevision, setStorageRevision] = useState(0);

  useEffect(() => {
    setYearData(readYearDataFromStorage(activeYear));
  }, [activeYear]);

  const bumpRevision = useCallback(() => {
    setStorageRevision((prev) => prev + 1);
  }, []);

  const saveDay = useCallback((dateStr: string, data: DayData) => {
    triggerHaptic('medium');
    setYearData((prev) => {
      const next = { ...prev, [dateStr]: data };
      writeYearDataToStorage(activeYear, next);
      return next;
    });
    bumpRevision();
  }, [activeYear, triggerHaptic, bumpRevision]);

  const deleteDay = useCallback((dateToDelete: string) => {
    triggerHaptic('heavy');
    setYearData((prev) => {
      const { [dateToDelete]: _, ...rest } = prev;
      writeYearDataToStorage(activeYear, rest);
      return rest;
    });
    bumpRevision();
  }, [activeYear, triggerHaptic, bumpRevision]);

  const quickSetMood = useCallback((dateStr: string, level: MoodLevel) => {
    SoundManager.play('success');
    triggerHaptic('medium');
    setYearData((prev) => {
      const next = {
        ...prev,
        [dateStr]: {
          level,
          note: prev[dateStr]?.note || ''
        }
      };
      writeYearDataToStorage(activeYear, next);
      return next;
    });
    bumpRevision();
  }, [activeYear, triggerHaptic, bumpRevision]);

  const clearAllData = useCallback(() => {
    clearAllAppStorage();
    setYearData({});
    bumpRevision();
  }, [bumpRevision]);

  const exportData = useCallback((unlockedAchievements: UnlockedAchievement[] = []) => {
    triggerHaptic('light');
    SoundManager.play('success');
    const payload = buildFullBackupPayload(activeYear, yearData, unlockedAchievements);
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const dl = document.createElement('a');
    dl.href = url;
    dl.download = `pepe_mood_backup_completo_${realCurrentYear}.json`;
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [activeYear, yearData, realCurrentYear, triggerHaptic]);

  const importData = useCallback((
    file: File,
    onSuccess?: (restoredAchievements?: UnlockedAchievement[]) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content);
        if (typeof imported !== 'object' || imported === null || Array.isArray(imported)) {
          return;
        }

        // Format v2: Multi-year + achievements full backup
        if (imported.formatVersion === 2 && imported.years && typeof imported.years === 'object') {
          let restoredAchievements: UnlockedAchievement[] | undefined;

          for (const [yearKey, rawYearObj] of Object.entries(imported.years as Record<string, unknown>)) {
            const yearNum = Number(yearKey);
            if (!Number.isInteger(yearNum) || yearNum < 2020 || yearNum > realCurrentYear + 1) continue;
            const sanitized = sanitizeYearDataObject(rawYearObj);
            writeYearDataToStorage(yearNum, sanitized);
          }

          if (Array.isArray(imported.achievements)) {
            restoredAchievements = imported.achievements.filter(
              (a: unknown): a is UnlockedAchievement =>
                Boolean(a && typeof a === 'object' && typeof (a as UnlockedAchievement).id === 'string')
            );
          }

          setYearData(readYearDataFromStorage(activeYear));
          bumpRevision();
          triggerHaptic('medium');
          SoundManager.play('success');
          onSuccess?.(restoredAchievements);
          return;
        }

        // Format v1 legacy: flat YYYY-MM-DD -> DayData map
        const sanitizedV1 = sanitizeYearDataObject(imported);
        const groupedByYear: Record<number, YearData> = {};
        for (const [dateStr, entry] of Object.entries(sanitizedV1)) {
          const yr = Number(dateStr.slice(0, 4));
          if (!Number.isInteger(yr)) continue;
          if (!groupedByYear[yr]) groupedByYear[yr] = {};
          groupedByYear[yr][dateStr] = entry;
        }

        const importedYears = Object.keys(groupedByYear).map(Number);
        if (importedYears.length === 0) {
          writeYearDataToStorage(activeYear, {});
          setYearData({});
        } else {
          for (const yr of importedYears) {
            writeYearDataToStorage(yr, groupedByYear[yr]);
          }
          setYearData(readYearDataFromStorage(activeYear));
        }

        bumpRevision();
        triggerHaptic('medium');
        SoundManager.play('success');
        onSuccess?.();
      } catch (err) {
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
  }, [activeYear, realCurrentYear, triggerHaptic, bumpRevision]);

  return {
    yearData,
    storageRevision,
    saveDay,
    deleteDay,
    quickSetMood,
    clearAllData,
    exportData,
    importData
  };
}
