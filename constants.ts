import { MoodConfig, MoodLevel } from './types';
// Importar assets desde el archivo centralizado que usa imports de Vite
import { PEPE_ASSETS, PEPE_MOOD_IMAGES, PEPE_BANNER } from './assets';

// Re-exportar para mantener compatibilidad
export { PEPE_ASSETS, PEPE_MOOD_IMAGES, PEPE_BANNER };

export const MOODS: Record<MoodLevel, MoodConfig> = {
  [MoodLevel.Legendary]: {
    level: MoodLevel.Legendary,
    label: "Legendario",
    subLabel: "HYPE CÓSMICO",
    color: "#06b6d4",
    twColor: "bg-cyan-500",
    image: PEPE_MOOD_IMAGES.LEVEL_6,
  },
  [MoodLevel.MoiBiens]: {
    level: MoodLevel.MoiBiens,
    label: "Moi Biens",
    subLabel: "FeelsGoodMan",
    color: "#22c55e",
    twColor: "bg-green-500",
    image: PEPE_MOOD_IMAGES.LEVEL_5,
  },
  [MoodLevel.Normal]: {
    level: MoodLevel.Normal,
    label: "Normal",
    subLabel: "Not Bad",
    color: "#84cc16",
    twColor: "bg-lime-500",
    image: PEPE_MOOD_IMAGES.LEVEL_4,
  },
  [MoodLevel.Regular]: {
    level: MoodLevel.Regular,
    label: "Meh / Poker",
    subLabel: "NPC Mode",
    color: "#eab308",
    twColor: "bg-yellow-500",
    image: PEPE_MOOD_IMAGES.LEVEL_3,
  },
  [MoodLevel.Sadge]: {
    level: MoodLevel.Sadge,
    label: "Sadge",
    subLabel: "PepeHands",
    color: "#f97316",
    twColor: "bg-orange-500",
    image: PEPE_MOOD_IMAGES.LEVEL_2,
  },
  [MoodLevel.Rage]: {
    level: MoodLevel.Rage,
    label: "Enfadado",
    subLabel: "REEEEEE",
    color: "#ef4444",
    twColor: "bg-red-500",
    image: PEPE_MOOD_IMAGES.LEVEL_1,
  },
  [MoodLevel.None]: {
    level: MoodLevel.None,
    label: "",
    subLabel: "",
    color: "#1e293b",
    twColor: "bg-slate-800",
    image: "",
  },
};

export const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const STORAGE_KEY = `pepe_year_data_${new Date().getFullYear()}`;