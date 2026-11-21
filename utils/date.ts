import { DayData, YearData } from '../types';

export function getLocalDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getLocalDayIndex(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

export function filterEntriesByRange(
  data: YearData,
  timeRange: string,
  weekRange: string = 'all',
  requireNote: boolean = false
): [string, DayData][] {
  const entries = Object.entries(data) as [string, DayData][];
  const validEntries = entries
    .filter(([_, d]) => (requireNote ? !!(d.note && d.note.trim().length > 0) : d.level > 0))
    .sort((a, b) => a[0].localeCompare(b[0]));

  if (timeRange === 'all') return validEntries;
  if (timeRange === 'last_7') return validEntries.slice(-7);
  if (timeRange === 'last_30') return validEntries.slice(-30);

  const monthIndex = parseInt(timeRange, 10);
  if (Number.isNaN(monthIndex)) return validEntries;

  let monthEntries = validEntries.filter(([date]) => {
    const [, m] = date.split('-');
    return parseInt(m, 10) - 1 === monthIndex;
  });

  if (weekRange !== 'all') {
    monthEntries = monthEntries.filter(([date]) => {
      const day = parseInt(date.split('-')[2], 10);
      if (weekRange === '1') return day >= 1 && day <= 7;
      if (weekRange === '2') return day >= 8 && day <= 14;
      if (weekRange === '3') return day >= 15 && day <= 21;
      if (weekRange === '4') return day >= 22;
      return true;
    });
  }

  return monthEntries;
}
