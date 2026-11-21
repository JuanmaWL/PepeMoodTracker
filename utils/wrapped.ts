import { MOODS, MONTHS } from '../constants';
import { DayData, MoodConfig, MoodLevel, Rarity, UnlockedAchievement, YearData } from '../types';
import { getLocalDateStr, getLocalDayIndex } from './date';
import { ACHIEVEMENTS } from './gamification';

export type WrappedScope = 'month' | 'year';

export interface WrappedMoodSlice {
  level: MoodLevel;
  label: string;
  color: string;
  count: number;
  percent: number;
}

export interface WrappedSummary {
  scope: WrappedScope;
  periodTitle: string;
  subtitle: string;
  totalDays: number;
  possibleDays: number;
  coveragePercent: number;
  averageScore: number;
  bestStreak: number;
  dominantMood: MoodConfig;
  dominantCount: number;
  dominantPercent: number;
  distribution: WrappedMoodSlice[];
  topWords: string[];
  topAchievementTitle: string | null;
  topAchievementRarity: Rarity | null;
  defaultTagline: string;
}

const STOP_WORDS = new Set([
  'para', 'como', 'pero', 'porque', 'cuando', 'donde', 'quien', 'todo', 'toda',
  'todos', 'todas', 'esta', 'este', 'esto', 'estos', 'estas', 'ese', 'eso', 'esos',
  'esas', 'aquel', 'algo', 'nada', 'mucho', 'poco', 'muy', 'mas', 'menos', 'bien',
  'mal', 'hoy', 'ayer', 'manana', 'mañana', 'siempre', 'nunca', 'ahora', 'despues',
  'después', 'antes', 'luego', 'entonces', 'tambien', 'también', 'solo', 'aquí',
  'aqui', 'alli', 'allí', 'cosa', 'cosas', 'hecho', 'hacer', 'hice', 'hizo', 'sido',
  'estoy', 'estaba', 'tengo', 'tuve', 'tenia', 'tenía', 'puedo', 'pude', 'puede',
  'quiero', 'quise', 'creo', 'parece', 'siento', 'sobre', 'entre', 'hacia', 'desde',
  'hasta', 'contra', 'durante', 'mediante', 'aunque', 'mientras', 'sino', 'pues',
  'bueno', 'mejor', 'peor', 'gran', 'grande', 'dias', 'días', 'rato', 'vez', 'veces',
  'otra', 'otro', 'otros', 'otras', 'mismo', 'misma', 'cada', 'unos', 'unas', 'unos',
  'con', 'sin', 'por', 'los', 'las', 'del', 'una', 'uno', 'que', 'sus', 'mis', 'tus',
]);

const RARITY_ORDER: Record<Rarity, number> = {
  [Rarity.Legendary]: 4,
  [Rarity.Epic]: 3,
  [Rarity.Rare]: 2,
  [Rarity.Common]: 1,
};

const FALLBACK_TAGLINES: Record<MoodLevel, string> = {
  [MoodLevel.Legendary]: 'Modo protagonista activado: has coleccionado más aura que problemas.',
  [MoodLevel.MoiBiens]: 'Un balance sólido y sano; Pepe aprueba tu gestión emocional sin memes irónicos.',
  [MoodLevel.Normal]: 'Estabilidad de manual: ni montaña rusa ni drama innecesario.',
  [MoodLevel.Regular]: 'Supervivencia en piloto automático; toca añadir algo de chispa al lore.',
  [MoodLevel.Sadge]: 'Temporada melancólica con banda sonora lenta; resistir también cuenta.',
  [MoodLevel.Rage]: 'Energía volcánica pura; menos mal que lo canalizaste aquí y no contra el router.',
  [MoodLevel.None]: 'Aún queda mucha historia por escribir en tu calendario.',
};

export function computeWrappedSummary(
  yearData: YearData,
  unlockedAchievements: UnlockedAchievement[],
  currentYear: number,
  scope: WrappedScope
): WrappedSummary {
  const today = new Date();
  const monthIdx = today.getMonth();
  const monthPrefix = `${currentYear}-${String(monthIdx + 1).padStart(2, '0')}-`;

  const filteredEntries = (Object.entries(yearData) as [string, DayData][])
    .filter(([dateStr, d]) => {
      if (!d || d.level === MoodLevel.None || d.level <= 0) return false;
      if (scope === 'month') return dateStr.startsWith(monthPrefix);
      return dateStr.startsWith(`${currentYear}-`);
    })
    .sort((a, b) => a[0].localeCompare(b[0]));

  const totalDays = filteredEntries.length;
  const possibleDays =
    scope === 'month'
      ? today.getDate()
      : Math.max(
          1,
          getLocalDayIndex(getLocalDateStr(today)) - getLocalDayIndex(`${currentYear}-01-01`) + 1
        );
  const coveragePercent = Math.min(100, Math.round((totalDays / Math.max(1, possibleDays)) * 100));

  const counts: Record<number, number> = {
    [MoodLevel.Legendary]: 0,
    [MoodLevel.MoiBiens]: 0,
    [MoodLevel.Normal]: 0,
    [MoodLevel.Regular]: 0,
    [MoodLevel.Sadge]: 0,
    [MoodLevel.Rage]: 0,
  };

  let scoreSum = 0;
  let bestStreak = 0;
  let running = 0;
  let prevIdx: number | null = null;
  const wordFreq: Record<string, number> = {};

  for (const [dateStr, entry] of filteredEntries) {
    counts[entry.level] = (counts[entry.level] || 0) + 1;
    scoreSum += entry.level;

    const idx = getLocalDayIndex(dateStr);
    if (prevIdx !== null && idx - prevIdx === 1) {
      running += 1;
    } else {
      running = 1;
    }
    if (running > bestStreak) bestStreak = running;
    prevIdx = idx;

    if (entry.note) {
      const words = entry.note
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
      for (const word of words) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    }
  }

  const averageScore = totalDays > 0 ? Number((scoreSum / totalDays).toFixed(2)) : 0;

  const levelsOrder: MoodLevel[] = [
    MoodLevel.Legendary,
    MoodLevel.MoiBiens,
    MoodLevel.Normal,
    MoodLevel.Regular,
    MoodLevel.Sadge,
    MoodLevel.Rage,
  ];

  const distribution: WrappedMoodSlice[] = levelsOrder.map((lvl) => {
    const count = counts[lvl] || 0;
    return {
      level: lvl,
      label: MOODS[lvl].label,
      color: MOODS[lvl].color,
      count,
      percent: totalDays > 0 ? Math.round((count / totalDays) * 100) : 0,
    };
  });

  let dominantLevel = MoodLevel.Normal;
  let dominantCount = 0;
  for (const slice of distribution) {
    if (slice.count > dominantCount) {
      dominantCount = slice.count;
      dominantLevel = slice.level;
    }
  }
  const dominantMood = totalDays > 0 ? MOODS[dominantLevel] : MOODS[MoodLevel.MoiBiens];
  const dominantPercent = totalDays > 0 ? Math.round((dominantCount / totalDays) * 100) : 0;

  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([w]) => w);

  let topAchievementTitle: string | null = null;
  let topAchievementRarity: Rarity | null = null;
  let highestRank = 0;

  for (const item of unlockedAchievements) {
    const def = ACHIEVEMENTS.find((a) => a.id === item.id);
    if (!def) continue;
    const rarity = def.rarity || Rarity.Common;
    const rank = RARITY_ORDER[rarity] || 1;
    if (rank >= highestRank) {
      highestRank = rank;
      topAchievementTitle = def.title;
      topAchievementRarity = rarity;
    }
  }

  const periodTitle =
    scope === 'month' ? `${MONTHS[monthIdx]} ${currentYear}` : `Pepe Wrapped ${currentYear}`;
  const subtitle =
    scope === 'month' ? 'Radiografía mensual de vibes' : 'Resumen anual de tu lore';

  const defaultTagline =
    totalDays === 0 ? FALLBACK_TAGLINES[MoodLevel.None] : FALLBACK_TAGLINES[dominantLevel];

  return {
    scope,
    periodTitle,
    subtitle,
    totalDays,
    possibleDays,
    coveragePercent,
    averageScore,
    bestStreak,
    dominantMood,
    dominantCount,
    dominantPercent,
    distribution,
    topWords,
    topAchievementTitle,
    topAchievementRarity,
    defaultTagline,
  };
}

export function buildWrappedShareText(summary: WrappedSummary, tagline: string): string {
  const wordsLine = summary.topWords.length > 0 ? summary.topWords.join(', ') : 'Sin palabras clave';
  return [
    `🐸 ${summary.periodTitle} — Pepe Pixel Year`,
    `• Días registrados: ${summary.totalDays} (${summary.coveragePercent}% del periodo)`,
    `• Mood dominante: ${summary.dominantMood.label} (${summary.dominantPercent}%)`,
    `• Racha récord: ${summary.bestStreak} días · Media: ${summary.averageScore}/6`,
    `• Temas del lore: ${wordsLine}`,
    `• Veredicto: "${tagline}"`,
  ].join('\n');
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.closePath();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function loadImageWithTimeout(src: string, timeoutMs = 4500): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => resolve(null), timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

export async function renderWrappedCanvas(
  summary: WrappedSummary,
  tagline: string
): Promise<HTMLCanvasElement> {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo inicializar el lienzo.');

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#020617');
  bg.addColorStop(0.55, '#0f172a');
  bg.addColorStop(1, '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle accent radial glow behind hero
  const accentColor = summary.dominantMood.color || '#2ECC71';
  const radial = ctx.createRadialGradient(width / 2, 340, 20, width / 2, 340, 420);
  radial.addColorStop(0, `${accentColor}44`);
  radial.addColorStop(1, 'transparent');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  // Subtle pixel grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < width; gx += 36) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, height);
    ctx.stroke();
  }
  for (let gy = 0; gy < height; gy += 36) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(width, gy);
    ctx.stroke();
  }

  // Card frame
  drawRoundedRect(ctx, 48, 48, width - 96, height - 96, 44);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Top Header
  ctx.fillStyle = '#94a3b8';
  ctx.font = '800 22px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PEPE PIXEL YEAR · ARCHIVO PERSONAL', width / 2, 118);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 56px Nunito, sans-serif';
  ctx.fillText(summary.periodTitle.toUpperCase(), width / 2, 182);

  ctx.fillStyle = accentColor;
  ctx.font = '700 24px Nunito, sans-serif';
  ctx.fillText(summary.subtitle, width / 2, 222);

  // Pepe Avatar Ring
  const centerX = width / 2;
  const centerY = 385;
  const avatarRadius = 112;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, avatarRadius + 8, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = accentColor;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, avatarRadius, 0, Math.PI * 2);
  ctx.clip();

  const img = await loadImageWithTimeout(summary.dominantMood.image);
  if (img) {
    ctx.drawImage(img, centerX - avatarRadius, centerY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(centerX - avatarRadius, centerY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 72px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐸', centerX, centerY);
  }
  ctx.restore();

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '800 20px Nunito, sans-serif';
  ctx.fillText('VIBE DOMINANTE', centerX, 548);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px Nunito, sans-serif';
  ctx.fillText(
    summary.totalDays > 0
      ? `${summary.dominantMood.label.toUpperCase()} (${summary.dominantPercent}%)`
      : 'SIN DATOS AÚN',
    centerX,
    604
  );

  // 3 KPI Boxes
  const kpis = [
    { label: 'DÍAS REGISTRADOS', value: `${summary.totalDays}` },
    { label: 'RACHA RÉCORD', value: `${summary.bestStreak} días` },
    { label: 'MEDIA EMOCIONAL', value: `${summary.averageScore}/6` },
  ];
  const cardWidth = 286;
  const gap = 24;
  const startX = (width - (cardWidth * 3 + gap * 2)) / 2;

  kpis.forEach((kpi, i) => {
    const x = startX + i * (cardWidth + gap);
    const y = 656;
    drawRoundedRect(ctx, x, y, cardWidth, 134, 24);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 17px Nunito, sans-serif';
    ctx.fillText(kpi.label, x + cardWidth / 2, y + 48);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 42px Nunito, sans-serif';
    ctx.fillText(kpi.value, x + cardWidth / 2, y + 104);
  });

  // Mood Spectrum Bar
  const barX = startX;
  const barY = 834;
  const barW = width - startX * 2;
  const barH = 26;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '800 18px Nunito, sans-serif';
  ctx.fillText('ESPECTRO EMOCIONAL', barX, barY - 14);

  drawRoundedRect(ctx, barX, barY, barW, barH, 13);
  ctx.fillStyle = '#1e293b';
  ctx.fill();

  if (summary.totalDays > 0) {
    ctx.save();
    drawRoundedRect(ctx, barX, barY, barW, barH, 13);
    ctx.clip();
    let offsetX = barX;
    for (const slice of summary.distribution) {
      if (slice.count === 0) continue;
      const sliceW = (slice.count / summary.totalDays) * barW;
      ctx.fillStyle = slice.color;
      ctx.fillRect(offsetX, barY, sliceW + 1, barH);
      offsetX += sliceW;
    }
    ctx.restore();
  }

  // Words & Achievement row
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '700 22px Nunito, sans-serif';
  const wordsText =
    summary.topWords.length > 0
      ? `Palabras clave: ${summary.topWords.join(' · ')}`
      : 'Palabras clave: sigue escribiendo tus notas diarias';
  ctx.fillText(wordsText, barX, 912);

  if (summary.topAchievementTitle) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 22px Nunito, sans-serif';
    ctx.fillText(`Logro destacado: ${summary.topAchievementTitle}`, barX, 954);
  }

  // Tagline Verdict Box
  drawRoundedRect(ctx, barX, 996, barW, 200, 28);
  ctx.fillStyle = 'rgba(30, 41, 59, 0.55)';
  ctx.fill();
  ctx.strokeStyle = `${accentColor}66`;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 30px Nunito, sans-serif';
  const lines = wrapTextLines(ctx, `"${tagline}"`, barW - 80).slice(0, 3);
  const lineStartY = 1074 - ((lines.length - 1) * 42) / 2 + 24;
  lines.forEach((line, idx) => {
    ctx.fillText(line, centerX, lineStartY + idx * 42);
  });

  // Footer
  ctx.fillStyle = '#64748b';
  ctx.font = '800 20px Nunito, sans-serif';
  ctx.fillText('PEPE PIXEL YEAR · SENTENCIA OFICIAL', centerX, 1265);

  return canvas;
}
