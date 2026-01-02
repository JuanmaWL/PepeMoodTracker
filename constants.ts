import { MoodConfig, MoodLevel } from './types';

// Using popular emote CDNs for consistent "Pepe" aesthetics
export const PEPE_IMAGES = {
  LEGENDARY: "https://cdn.frankerfacez.com/emoticon/243789/4", // Hypers / Excited
  FRESCO: "https://cdn.frankerfacez.com/emoticon/231552/4",    // EZ / Cool
  NORMAL: "https://cdn.frankerfacez.com/emoticon/263996/4",    // Poker / Neutral
  REGULAR: "https://cdn.frankerfacez.com/emoticon/436302/4",   // Hmm / Skeptical
  FATAL: "https://cdn.frankerfacez.com/emoticon/238634/4",     // PepeHands / Crying
};

export const MOODS: Record<MoodLevel, MoodConfig> = {
  [MoodLevel.Legendary]: {
    level: MoodLevel.Legendary,
    label: "Legendario",
    subLabel: "Absolute Cinema",
    color: "#22c55e",
    twColor: "bg-green-500",
    image: PEPE_IMAGES.LEGENDARY,
  },
  [MoodLevel.Fresco]: {
    level: MoodLevel.Fresco,
    label: "Fresco",
    subLabel: "Feels Good Man",
    color: "#84cc16",
    twColor: "bg-lime-500",
    image: PEPE_IMAGES.FRESCO,
  },
  [MoodLevel.Normal]: {
    level: MoodLevel.Normal,
    label: "NPC",
    subLabel: "Es lo que hay",
    color: "#facc15",
    twColor: "bg-yellow-400",
    image: PEPE_IMAGES.NORMAL,
  },
  [MoodLevel.Regular]: {
    level: MoodLevel.Regular,
    label: "Regular",
    subLabel: "Feels Bad Man",
    color: "#f97316",
    twColor: "bg-orange-500",
    image: PEPE_IMAGES.REGULAR,
  },
  [MoodLevel.Fatal]: {
    level: MoodLevel.Fatal,
    label: "Fatal",
    subLabel: "It's over",
    color: "#ef4444",
    twColor: "bg-red-500",
    image: PEPE_IMAGES.FATAL,
  },
  [MoodLevel.None]: {
    level: MoodLevel.None,
    label: "",
    subLabel: "",
    color: "#334155",
    twColor: "bg-slate-700",
    image: "",
  },
};

export const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const STORAGE_KEY = `pepe_year_data_${new Date().getFullYear()}`;