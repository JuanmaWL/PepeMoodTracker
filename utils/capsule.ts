import { DayData, MoodLevel, YearData } from '../types';
import { getLocalDateStr, parseLocalDate } from './date';

export interface TimeCapsuleMemory {
  id: string;
  horizonLabel: string;
  dateStr: string;
  formattedDate: string;
  data: DayData;
  isCurrentYear: boolean;
  year: number;
}

function formatMemoryDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const raw = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function getAllHistoricalYears(currentYear: number, currentData: YearData): Record<number, YearData> {
  const result: Record<number, YearData> = {
    [currentYear]: currentData,
  };

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('pepe_year_data_')) continue;
      const yearNum = Number(key.replace('pepe_year_data_', ''));
      if (!Number.isInteger(yearNum) || yearNum === currentYear) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        result[yearNum] = parsed as YearData;
      }
    }
  } catch {
    // Ignore malformed localStorage entries
  }

  return result;
}

function shiftMonthDate(base: Date, monthsDelta: number): Date {
  const targetMonth = base.getMonth() + monthsDelta;
  const candidate = new Date(base.getFullYear(), targetMonth, 1);
  const maxDay = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate();
  candidate.setDate(Math.min(base.getDate(), maxDay));
  return candidate;
}

export function buildTimeCapsuleMemories(
  yearData: YearData,
  currentYear: number
): TimeCapsuleMemory[] {
  const today = new Date();
  const todayStr = getLocalDateStr(today);
  const allYears = getAllHistoricalYears(currentYear, yearData);
  const seenDates = new Set<string>([todayStr]);
  const memories: TimeCapsuleMemory[] = [];

  const pushIfValid = (
    id: string,
    horizonLabel: string,
    dateStr: string,
    sourceData: YearData,
    year: number
  ) => {
    if (seenDates.has(dateStr)) return;
    const entry = sourceData[dateStr];
    if (!entry || entry.level === MoodLevel.None || entry.level <= 0) return;
    seenDates.add(dateStr);
    memories.push({
      id,
      horizonLabel,
      dateStr,
      formattedDate: formatMemoryDate(dateStr),
      data: entry,
      isCurrentYear: year === currentYear,
      year,
    });
  };

  // 1. Exact same month/day in previous years
  const monthDaySuffix = todayStr.slice(4); // -MM-DD
  const pastYears = Object.keys(allYears)
    .map(Number)
    .filter((y) => y < currentYear)
    .sort((a, b) => b - a);

  for (const year of pastYears) {
    const dateStr = `${year}${monthDaySuffix}`;
    const diff = currentYear - year;
    const label = diff === 1 ? 'Hoy hace 1 año' : `Hoy hace ${diff} años`;
    pushIfValid(`year-${year}`, label, dateStr, allYears[year], year);
  }

  // 2. One month ago
  const oneMonthAgo = shiftMonthDate(today, -1);
  const oneMonthStr = getLocalDateStr(oneMonthAgo);
  const oneMonthYear = oneMonthAgo.getFullYear();
  if (allYears[oneMonthYear]) {
    pushIfValid('month-1', 'Hace 1 mes', oneMonthStr, allYears[oneMonthYear], oneMonthYear);
  }

  // 3. Seven days ago
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysStr = getLocalDateStr(sevenDaysAgo);
  const sevenDaysYear = sevenDaysAgo.getFullYear();
  if (allYears[sevenDaysYear]) {
    pushIfValid('days-7', 'Hace 7 días', sevenDaysStr, allYears[sevenDaysYear], sevenDaysYear);
  }

  // 4. Same day of month earlier this year (e.g., día 21 de otro mes)
  const dayToken = `-${String(today.getDate()).padStart(2, '0')}`;
  const sameDayMatches = Object.keys(yearData)
    .filter((d) => d.endsWith(dayToken) && d < todayStr && !seenDates.has(d))
    .sort()
    .reverse();

  if (sameDayMatches.length > 0) {
    const matchDate = sameDayMatches[0];
    pushIfValid('same-day-month', 'Mismo día de otro mes', matchDate, yearData, currentYear);
  }

  // 5. Notable past lore entry with longest note (excluding last 2 days)
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - 2);
  const cutoffStr = getLocalDateStr(cutoffDate);

  const notedEntries = Object.entries(yearData)
    .filter(([dateStr, entry]) => {
      return (
        dateStr <= cutoffStr &&
        !seenDates.has(dateStr) &&
        entry.level > 0 &&
        Boolean(entry.note && entry.note.trim().length >= 12)
      );
    })
    .sort((a, b) => b[1].note.trim().length - a[1].note.trim().length);

  if (notedEntries.length > 0) {
    const [notableDate] = notedEntries[0];
    pushIfValid('notable-lore', 'Lore destacado del archivo', notableDate, yearData, currentYear);
  }

  return memories;
}
