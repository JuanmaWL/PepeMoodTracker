import { MoodLevel, UnlockedAchievement, YearData } from '../types';
import { APP_VERSION } from './changelog';

export const YEAR_STORAGE_PREFIX = 'pepe_year_data_';

export interface YearCompletionStats {
  year: number;
  loggedDays: number;
  totalDaysInYear: number;
  remainingDays: number;
  percent: number;
  isComplete: boolean;
}

export interface FullBackupPayloadV2 {
  formatVersion: 2;
  appVersion: string;
  exportedAt: string;
  years: Record<string, YearData>;
  achievements: UnlockedAchievement[];
}

export function getYearStorageKey(year: number): string {
  return `${YEAR_STORAGE_PREFIX}${year}`;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getTotalDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

export function sanitizeYearDataObject(raw: unknown): YearData {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const result: YearData = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !val || typeof val !== 'object') continue;
    const entry = val as Record<string, unknown>;
    const level = Number(entry.level);
    if (!Number.isInteger(level) || level < MoodLevel.None || level > MoodLevel.Legendary) continue;
    result[key] = {
      level: level as MoodLevel,
      note: typeof entry.note === 'string' ? entry.note : '',
    };
  }
  return result;
}

export function readYearDataFromStorage(year: number): YearData {
  try {
    const raw = localStorage.getItem(getYearStorageKey(year));
    if (!raw) return {};
    return sanitizeYearDataObject(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function writeYearDataToStorage(year: number, data: YearData): void {
  try {
    localStorage.setItem(getYearStorageKey(year), JSON.stringify(data));
  } catch (e) {
    console.error('Error saving year data:', e);
  }
}

export function listStoredYears(realCurrentYear: number): number[] {
  const yearSet = new Set<number>([realCurrentYear]);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(YEAR_STORAGE_PREFIX)) continue;
      const parsedYear = Number(key.slice(YEAR_STORAGE_PREFIX.length));
      if (
        Number.isInteger(parsedYear) &&
        parsedYear >= 2020 &&
        parsedYear <= realCurrentYear + 1
      ) {
        const data = readYearDataFromStorage(parsedYear);
        const hasValidEntries = Object.values(data).some((d) => d.level > MoodLevel.None);
        if (hasValidEntries || parsedYear === realCurrentYear) {
          yearSet.add(parsedYear);
        }
      }
    }
  } catch {
    // Ignore storage enumeration failures
  }
  return Array.from(yearSet).sort((a, b) => b - a);
}

export function getYearCompletionStats(data: YearData, year: number): YearCompletionStats {
  const totalDaysInYear = getTotalDaysInYear(year);
  const yearPrefix = `${year}-`;
  let loggedDays = 0;

  for (const [dateStr, entry] of Object.entries(data)) {
    if (
      dateStr.startsWith(yearPrefix) &&
      entry &&
      entry.level > MoodLevel.None
    ) {
      loggedDays += 1;
    }
  }

  const clampedLogged = Math.min(totalDaysInYear, loggedDays);
  const remainingDays = Math.max(0, totalDaysInYear - clampedLogged);
  const percent = Math.min(100, Math.round((clampedLogged / totalDaysInYear) * 100));

  return {
    year,
    loggedDays: clampedLogged,
    totalDaysInYear,
    remainingDays,
    percent,
    isComplete: clampedLogged >= totalDaysInYear,
  };
}

export function countArchiveSummary(
  activeYear: number,
  activeYearData: YearData
): { yearsCount: number; entriesCount: number } {
  const yearsMap: Record<number, YearData> = {
    [activeYear]: activeYearData,
  };

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(YEAR_STORAGE_PREFIX)) continue;
      const yearNum = Number(key.slice(YEAR_STORAGE_PREFIX.length));
      if (!Number.isInteger(yearNum) || yearNum === activeYear) continue;
      yearsMap[yearNum] = readYearDataFromStorage(yearNum);
    }
  } catch {
    // Ignore storage enumeration errors
  }

  let yearsCount = 0;
  let entriesCount = 0;

  for (const data of Object.values(yearsMap)) {
    const valid = Object.values(data).filter((d) => d.level > MoodLevel.None).length;
    if (valid > 0) {
      yearsCount += 1;
      entriesCount += valid;
    }
  }

  return { yearsCount, entriesCount };
}

export function buildFullBackupPayload(
  activeYear: number,
  activeYearData: YearData,
  unlockedAchievements: UnlockedAchievement[]
): FullBackupPayloadV2 {
  const years: Record<string, YearData> = {
    [String(activeYear)]: activeYearData,
  };

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(YEAR_STORAGE_PREFIX)) continue;
      const yearStr = key.slice(YEAR_STORAGE_PREFIX.length);
      if (!/^\d{4}$/.test(yearStr) || yearStr === String(activeYear)) continue;
      const data = readYearDataFromStorage(Number(yearStr));
      if (Object.keys(data).length > 0) {
        years[yearStr] = data;
      }
    }
  } catch {
    // Ignore storage errors
  }

  return {
    formatVersion: 2,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    years,
    achievements: unlockedAchievements,
  };
}

export function clearAllAppStorage(): void {
  try {
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pepe_')) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.error('Error clearing local storage:', e);
  }
}
