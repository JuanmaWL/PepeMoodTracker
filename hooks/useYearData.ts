import { useState, useEffect, useCallback } from 'react';
import { YearData, DayData, MoodLevel } from '../types';
import { STORAGE_KEY } from '../constants';
import SoundManager from '../utils/sounds';

interface UseYearDataOptions {
  currentYear: number;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy') => void;
}

export function useYearData({ currentYear, triggerHaptic }: UseYearDataOptions) {
  const [yearData, setYearData] = useState<YearData>(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading year data:', e);
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(yearData));
    } catch (e) {
      console.error('Error saving year data:', e);
    }
  }, [yearData]);

  const saveDay = useCallback((dateStr: string, data: DayData) => {
    triggerHaptic('medium');
    setYearData(prev => ({ ...prev, [dateStr]: data }));
  }, [triggerHaptic]);

  const deleteDay = useCallback((dateToDelete: string) => {
    triggerHaptic('heavy');
    setYearData(prev => {
      const { [dateToDelete]: _, ...rest } = prev;
      return rest;
    });
  }, [triggerHaptic]);

  const quickSetMood = useCallback((dateStr: string, level: MoodLevel) => {
    SoundManager.play('success');
    triggerHaptic('medium');
    setYearData(prev => ({
      ...prev,
      [dateStr]: {
        level,
        note: prev[dateStr]?.note || ''
      }
    }));
  }, [triggerHaptic]);

  const clearAllData = useCallback(() => {
    setYearData({});
  }, []);

  const exportData = useCallback(() => {
    triggerHaptic('light');
    SoundManager.play('success');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(yearData));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `pepe_mood_backup_${currentYear}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  }, [yearData, currentYear, triggerHaptic]);

  const importData = useCallback((file: File, onSuccess?: () => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content);
        if (typeof importedData === 'object' && importedData !== null && !Array.isArray(importedData)) {
          triggerHaptic('medium');
          SoundManager.play('success');
          setYearData(importedData);
          onSuccess?.();
        }
      } catch (err) {
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
  }, [triggerHaptic]);

  return {
    yearData,
    saveDay,
    deleteDay,
    quickSetMood,
    clearAllData,
    exportData,
    importData
  };
}
