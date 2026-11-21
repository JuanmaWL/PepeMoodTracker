import { MoodLevel, YearData } from '../types';
import { getLocalDateStr, getLocalDayIndex } from './date';

export interface StreakStats {
  currentStreak: number;
  bestStreak: number;
  totalLogged: number;
  isTodayLogged: boolean;
  isAtRisk: boolean;
  todayStr: string;
}

function readPreviousYearData(year: number): YearData {
  try {
    const raw = localStorage.getItem(`pepe_year_data_${year}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as YearData) : {};
  } catch {
    return {};
  }
}

function hasValidMood(data: YearData, dateStr: string): boolean {
  const entry = data[dateStr];
  return Boolean(entry && entry.level !== MoodLevel.None && entry.level > 0);
}

export function computeStreakStats(yearData: YearData, currentYear: number): StreakStats {
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

  const isTodayLogged = hasValidMood(yearData, todayStr);
  const prevYearData = readPreviousYearData(currentYear - 1);

  const isDateLoggedAnyYear = (dateStr: string): boolean => {
    const yearPrefix = Number(dateStr.slice(0, 4));
    if (yearPrefix === currentYear) return hasValidMood(yearData, dateStr);
    if (yearPrefix === currentYear - 1) return hasValidMood(prevYearData, dateStr);
    return false;
  };

  let currentStreak = 0;
  const cursor = new Date(today);
  if (!isTodayLogged) {
    cursor.setDate(cursor.getDate() - 1);
  }

  if (isDateLoggedAnyYear(getLocalDateStr(cursor))) {
    while (currentStreak < 730) {
      const key = getLocalDateStr(cursor);
      if (!isDateLoggedAnyYear(key)) break;
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  const isAtRisk = !isTodayLogged && currentStreak > 0 && isDateLoggedAnyYear(yesterdayStr);

  return {
    currentStreak,
    bestStreak,
    totalLogged,
    isTodayLogged,
    isAtRisk,
    todayStr,
  };
}
