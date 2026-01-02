import { MoodConfig, MoodLevel } from './types';

// Banner principal del App - URL pública de alta fiabilidad como fuente primaria
export const PEPE_BANNER = "https://i.imgur.com/KJSjEue.png"; 

// Selección de emotes icónicos de Pepe (CDNs de confianza)
export const PEPE_MOOD_IMAGES = {
  LEVEL_5: "https://media.tenor.com/tthMwilLM8UAAAAj/pepe-meme.gif", // PepeHype
  LEVEL_4: "https://media.tenor.com/AmwATYlrR-UAAAAj/thinkge-pepega.gif", // PepeCool
  LEVEL_3: "https://media1.tenor.com/m/s382PAkSepsAAAAC/pepe-the-frog-pepe.gif", // PepeOkay
  LEVEL_2: "https://media1.tenor.com/m/vbFbEEXZZvkAAAAd/pepocry-pepe.gif", // PepeSad
  LEVEL_1: "https://i.pinimg.com/originals/17/89/2a/17892a4da93c7a712a008b1c31ca1b27.gif", // PepeHands
};

export const MOODS: Record<MoodLevel, MoodConfig> = {
  [MoodLevel.Legendary]: {
    level: MoodLevel.Legendary,
    label: "Una maravilla para la vista",
    subLabel: "HYPE ABSOLUTO",
    color: "#22c55e",
    twColor: "bg-green-500",
    image: PEPE_MOOD_IMAGES.LEVEL_5,
  },
  [MoodLevel.Fresco]: {
    level: MoodLevel.Fresco,
    label: "Moooi biens",
    subLabel: "FeelsGoodMan",
    color: "#84cc16",
    twColor: "bg-lime-500",
    image: PEPE_MOOD_IMAGES.LEVEL_4,
  },
  [MoodLevel.Normal]: {
    level: MoodLevel.Normal,
    label: "Buenooo...",
    subLabel: "NotBad",
    color: "#facc15",
    twColor: "bg-yellow-400",
    image: PEPE_MOOD_IMAGES.LEVEL_3,
  },
  [MoodLevel.Regular]: {
    level: MoodLevel.Regular,
    label: "Un poco punto es",
    subLabel: "FeelsOkayMan",
    color: "#f97316",
    twColor: "bg-orange-500",
    image: PEPE_MOOD_IMAGES.LEVEL_2,
  },
  [MoodLevel.Fatal]: {
    level: MoodLevel.Fatal,
    label: "Una gran mierda",
    subLabel: "Sadge",
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