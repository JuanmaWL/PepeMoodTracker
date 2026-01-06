
import { MoodConfig, MoodLevel } from './types';

// --- ASSETS LOCALES ---
// Referencias a archivos en /public/assets/images/
export const PEPE_ASSETS = {
    BANNER: "/assets/images/banner.png",
    ORACLE_AVATAR: "/assets/images/oracle_avatar.jpg",
    ORACLE_BG: "/assets/images/oracle_bg.png",
    JUDGE_1: "/assets/images/judge_1.png",
    JUDGE_2: "/assets/images/judge_2.png",
    LOADING_GIF: "/assets/images/pepe_noting.gif",
    CLOWN_GIF: "/assets/images/pepe_clown.gif",
    CENTER_IMG: "/assets/images/pepe_center.png", // Imagen central del PieChart
    ICON: "/assets/images/pepe_icon.png"
};

export const PEPE_BANNER = PEPE_ASSETS.BANNER;

// GIFs animados locales para los moods
export const PEPE_MOOD_IMAGES = {
  LEVEL_6: "/assets/images/mood_legendary.gif",
  LEVEL_5: "/assets/images/mood_moibiens.gif",
  LEVEL_4: "/assets/images/mood_normal.gif",
  LEVEL_3: "/assets/images/mood_regular.gif",
  LEVEL_2: "/assets/images/mood_sadge.gif",
  LEVEL_1: "/assets/images/mood_rage.gif",
};

export const MOODS: Record<MoodLevel, MoodConfig> = {
  [MoodLevel.Legendary]: {
    level: MoodLevel.Legendary,
    label: "Legendario",
    subLabel: "HYPE CÓSMICO",
    color: "#06b6d4", // Cyan-500
    twColor: "bg-cyan-500",
    image: PEPE_MOOD_IMAGES.LEVEL_6,
  },
  [MoodLevel.MoiBiens]: {
    level: MoodLevel.MoiBiens,
    label: "Moi Biens",
    subLabel: "FeelsGoodMan",
    color: "#22c55e", // Green-500
    twColor: "bg-green-500",
    image: PEPE_MOOD_IMAGES.LEVEL_5,
  },
  [MoodLevel.Normal]: {
    level: MoodLevel.Normal,
    label: "Normal",
    subLabel: "Not Bad",
    color: "#84cc16", // Lime-500
    twColor: "bg-lime-500",
    image: PEPE_MOOD_IMAGES.LEVEL_4,
  },
  [MoodLevel.Regular]: {
    level: MoodLevel.Regular,
    label: "Meh / Poker",
    subLabel: "NPC Mode",
    color: "#eab308", // Yellow-500
    twColor: "bg-yellow-500",
    image: PEPE_MOOD_IMAGES.LEVEL_3,
  },
  [MoodLevel.Sadge]: {
    level: MoodLevel.Sadge,
    label: "Sadge",
    subLabel: "PepeHands",
    color: "#f97316", // Orange-500
    twColor: "bg-orange-500",
    image: PEPE_MOOD_IMAGES.LEVEL_2,
  },
  [MoodLevel.Rage]: {
    level: MoodLevel.Rage,
    label: "Enfadado",
    subLabel: "REEEEEE",
    color: "#ef4444", // Red-500
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
