import { MoodConfig, MoodLevel } from './types';

// Banner principal del App - URL pública de alta fiabilidad como fuente primaria
export const PEPE_BANNER = "https://images3.alphacoders.com/110/1107773.jpg"; 

// Selección de emotes icónicos de Pepe (CDNs de confianza)
export const PEPE_MOOD_IMAGES = {
  LEVEL_5: "https://cdn.frankerfacez.com/emoticon/128054/4", // PepeHype
  LEVEL_4: "https://cdn.frankerfacez.com/emoticon/451433/4", // PepeCool
  LEVEL_3: "https://cdn.frankerfacez.com/emoticon/458025/4", // PepeOkay
  LEVEL_2: "https://cdn.frankerfacez.com/emoticon/446187/4", // PepeSad
  LEVEL_1: "https://cdn.frankerfacez.com/emoticon/436302/4", // PepeHands
};

export const MOODS: Record<MoodLevel, MoodConfig> = {
  [MoodLevel.Legendary]: {
    level: MoodLevel.Legendary,
    label: "Una maravilla para la vista",
    subLabel: "Espectacular",
    color: "#22c55e",
    twColor: "bg-green-500",
    image: PEPE_MOOD_IMAGES.LEVEL_5,
  },
  [MoodLevel.Fresco]: {
    level: MoodLevel.Fresco,
    label: "Moi biens",
    subLabel: "Guay",
    color: "#84cc16",
    twColor: "bg-lime-500",
    image: PEPE_MOOD_IMAGES.LEVEL_4,
  },
  [MoodLevel.Normal]: {
    level: MoodLevel.Normal,
    label: "Buenoooo",
    subLabel: "Notbad",
    color: "#facc15",
    twColor: "bg-yellow-400",
    image: PEPE_MOOD_IMAGES.LEVEL_3,
  },
  [MoodLevel.Regular]: {
    level: MoodLevel.Regular,
    label: "Un poco chof",
    subLabel: "Regular",
    color: "#f97316",
    twColor: "bg-orange-500",
    image: PEPE_MOOD_IMAGES.LEVEL_2,
  },
  [MoodLevel.Fatal]: {
    level: MoodLevel.Fatal,
    label: "Una gran mierda grande",
    subLabel: "Basura",
    color: "#ef4444",
    twColor: "bg-red-500",
    image: PEPE_MOOD_IMAGES.LEVEL_1,
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