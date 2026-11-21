import { MoodLevel, YearData } from '../types';
import { getLocalDateStr, getLocalDayIndex } from './date';
import { readYearDataFromStorage } from './years';

export type StreakTier = 0 | 1 | 2 | 3 | 4 | 5;

export interface StreakStats {
  currentStreak: number;
  bestStreak: number;
  totalLogged: number;
  isTodayLogged: boolean;
  isAtRisk: boolean;
  todayStr: string;
  tier: StreakTier;
  tierLabel: string;
  isNewRecord: boolean;
  streakAvgMood: number;
  isHistoricalYear: boolean;
}

function hasValidMood(data: YearData, dateStr: string): boolean {
  const entry = data[dateStr];
  return Boolean(entry && entry.level !== MoodLevel.None && entry.level > 0);
}

function getTierInfo(streak: number): { tier: StreakTier; tierLabel: string } {
  if (streak >= 30) return { tier: 5, tierLabel: 'Leyenda del Pantano' };
  if (streak >= 14) return { tier: 4, tierLabel: 'Modo Titán' };
  if (streak >= 7) return { tier: 3, tierLabel: 'Imparable' };
  if (streak >= 3) return { tier: 2, tierLabel: 'En marcha' };
  if (streak >= 1) return { tier: 1, tierLabel: 'Chispa inicial' };
  return { tier: 0, tierLabel: 'Pantano en calma' };
}

export function computeStreakStats(
  yearData: YearData,
  targetYear: number,
  realCurrentYear: number = new Date().getFullYear()
): StreakStats {
  const today = new Date();
  const todayStr = getLocalDateStr(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateStr(yesterday);

  const validDates = Object.keys(yearData)
    .filter((d) => hasValidMood(yearData, d))
    .sort();

  const totalLogged = validDates.length;

  let bestStreak = 0;
  let running = 0;
  let prevDayIdx: number | null = null;

  for (const dateStr of validDates) {
    const idx = getLocalDayIndex(dateStr);
    if (prevDayIdx !== null && idx - prevDayIdx === 1) {
      running += 1;
    } else {
      running = 1;
    }
    if (running > bestStreak) bestStreak = running;
    prevDayIdx = idx;
  }

  const isHistoricalYear = targetYear !== realCurrentYear;
  if (isHistoricalYear) {
    return {
      currentStreak: 0,
      bestStreak,
      totalLogged,
      isTodayLogged: false,
      isAtRisk: false,
      todayStr,
      tier: 0,
      tierLabel: 'Archivo histórico',
      isNewRecord: false,
      streakAvgMood: 0,
      isHistoricalYear: true,
    };
  }

  const isTodayLogged = hasValidMood(yearData, todayStr);
  const prevYearData = readYearDataFromStorage(targetYear - 1);

  const getMoodEntryAnyYear = (dateStr: string) => {
    const yearPrefix = Number(dateStr.slice(0, 4));
    if (yearPrefix === targetYear) return yearData[dateStr];
    if (yearPrefix === targetYear - 1) return prevYearData[dateStr];
    return undefined;
  };

  const isDateLoggedAnyYear = (dateStr: string): boolean => {
    const entry = getMoodEntryAnyYear(dateStr);
    return Boolean(entry && entry.level !== MoodLevel.None && entry.level > 0);
  };

  let currentStreak = 0;
  let moodSum = 0;
  const cursor = new Date(today);
  if (!isTodayLogged) {
    cursor.setDate(cursor.getDate() - 1);
  }

  if (isDateLoggedAnyYear(getLocalDateStr(cursor))) {
    while (currentStreak < 730) {
      const key = getLocalDateStr(cursor);
      const entry = getMoodEntryAnyYear(key);
      if (!entry || entry.level === MoodLevel.None || entry.level <= 0) break;
      currentStreak += 1;
      moodSum += entry.level;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  const isAtRisk = !isTodayLogged && currentStreak > 0 && isDateLoggedAnyYear(yesterdayStr);
  const { tier, tierLabel } = getTierInfo(currentStreak);
  const isNewRecord = currentStreak >= 2 && currentStreak >= bestStreak;
  const streakAvgMood = currentStreak > 0 ? Number((moodSum / currentStreak).toFixed(1)) : 0;

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    totalLogged,
    isTodayLogged,
    isAtRisk,
    todayStr,
    tier,
    tierLabel,
    isNewRecord,
    streakAvgMood,
    isHistoricalYear: false,
  };
}
