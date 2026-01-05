
import { MoodConfig, MoodLevel } from './types';

export const PEPE_BANNER = "https://i.imgur.com/KJSjEue.png"; 

export const PEPE_MOOD_IMAGES = {
  LEVEL_6: "https://media.tenor.com/tthMwilLM8UAAAAj/pepe-meme.gif", // Hypers
  LEVEL_5: "https://media.tenor.com/AmwATYlrR-UAAAAj/thinkge-pepega.gif", // FeelsGoodMan
  LEVEL_4: "https://media1.tenor.com/m/s382PAkSepsAAAAC/pepe-the-frog-pepe.gif", // Smug/Normal
  LEVEL_3: "https://media.tenor.com/8p12Jv_R32kAAAAj/pepe-poker.gif", // Poker Face / Meh
  LEVEL_2: "https://media.tenor.com/2c93bF3320YAAAAj/pepe-cry-pepe.gif", // Sadge / Blanket
  LEVEL_1: "https://media.tenor.com/1-ZJ6w4hEpsAAAAj/pepe-froggie.gif", // Rage / Ree
};

export const MOODS: Record<MoodLevel, MoodConfig> = {
  [MoodLevel.Legendary]: {
    level: MoodLevel.Legendary,
    label: "Legendario",
    subLabel: "HYPE CÓSMICO",
    color: "#06b6d4", // Cyan-500 (Diamond/God Tier) - El tope de la escala
    twColor: "bg-cyan-500",
    image: PEPE_MOOD_IMAGES.LEVEL_6,
  },
  [MoodLevel.MoiBiens]: {
    level: MoodLevel.MoiBiens,
    label: "Moi Biens",
    subLabel: "FeelsGoodMan",
    color: "#22c55e", // Green-500 (Classic Pepe)
    twColor: "bg-green-500",
    image: PEPE_MOOD_IMAGES.LEVEL_5,
  },
  [MoodLevel.Normal]: {
    level: MoodLevel.Normal,
    label: "Normal",
    subLabel: "Not Bad",
    color: "#84cc16", // Lime-500 (Bridge Green-Yellow)
    twColor: "bg-lime-500",
    image: PEPE_MOOD_IMAGES.LEVEL_4,
  },
  [MoodLevel.Regular]: {
    level: MoodLevel.Regular,
    label: "Meh / Poker",
    subLabel: "NPC Mode",
    color: "#eab308", // Yellow-500 (Neutral Center) - Reemplaza al Gris
    twColor: "bg-yellow-500",
    image: PEPE_MOOD_IMAGES.LEVEL_3,
  },
  [MoodLevel.Sadge]: {
    level: MoodLevel.Sadge,
    label: "Sadge",
    subLabel: "PepeHands",
    color: "#f97316", // Orange-500 (Warning) - Reemplaza al Azul/Indigo para mantener gradiente
    twColor: "bg-orange-500",
    image: PEPE_MOOD_IMAGES.LEVEL_2,
  },
  [MoodLevel.Rage]: {
    level: MoodLevel.Rage,
    label: "Enfadado",
    subLabel: "REEEEEE",
    color: "#ef4444", // Red-500 (Danger)
    twColor: "bg-red-500",
    image: PEPE_MOOD_IMAGES.LEVEL_1,
  },
  [MoodLevel.None]: {
    level: MoodLevel.None,
    label: "",
    subLabel: "",
    color: "#1e293b", // Slate-800
    twColor: "bg-slate-800",
    image: "",
  },
};

export const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const STORAGE_KEY = `pepe_year_data_${new Date().getFullYear()}`;
