import { MoodConfig, MoodLevel } from './types';

export const PEPE_BANNER = "https://i.imgur.com/KJSjEue.png"; 

export const PEPE_MOOD_IMAGES = {
  LEVEL_5: "https://media.tenor.com/tthMwilLM8UAAAAj/pepe-meme.gif",
  LEVEL_4: "https://media.tenor.com/AmwATYlrR-UAAAAj/thinkge-pepega.gif",
  LEVEL_3: "https://media1.tenor.com/m/s382PAkSepsAAAAC/pepe-the-frog-pepe.gif",
  LEVEL_2: "https://media1.tenor.com/m/vbFbEEXZZvkAAAAd/pepocry-pepe.gif",
  LEVEL_1: "https://i.pinimg.com/originals/17/89/2a/17892a4da93c7a712a008b1c31ca1b27.gif",
};

// Colección de Pepes para el generador de memes
export const MEME_TEMPLATES = {
  HAPPY: [
    "https://i.imgur.com/7d36j.jpg", // Feels Good Man
    "https://i.imgur.com/e2h2X.jpg", // Smug Pepe
    "https://i.imgur.com/U22X7.jpg", // Pepe Suit
  ],
  SAD: [
    "https://i.imgur.com/R211w.jpg", // Sad Pepe
    "https://i.imgur.com/3OaT1ef.png", // Pepe Hands (aprox)
    "https://i.imgur.com/P5r2q.png", // Pepe Bed
  ],
  ANGRY: [
    "https://i.imgur.com/v8tT4.jpg", // Angry Pepe
    "https://i.imgur.com/G5Z1R.jpg", // Punching Pepe
  ],
  CLOWN: [
    "https://i.imgur.com/idYAqJq.png", // Pepe Clown / Wine
    "https://i.imgur.com/T0bF2.jpg", // Honk Honk
  ],
  NEUTRAL: [
    "https://i.imgur.com/KJSjEue.png", // Standard Pepe
    "https://i.imgur.com/5S1qf.jpg", // Thinking Pepe
  ]
};

export const MOODS: Record<MoodLevel, MoodConfig> = {
  [MoodLevel.Legendary]: {
    level: MoodLevel.Legendary,
    label: "Legendario",
    subLabel: "HYPE ABSOLUTO",
    color: "#22c55e",
    twColor: "bg-green-500",
    image: PEPE_MOOD_IMAGES.LEVEL_5,
  },
  [MoodLevel.MoiBiens]: {
    level: MoodLevel.MoiBiens,
    label: "Moi biens",
    subLabel: "FeelsGoodMan",
    color: "#84cc16",
    twColor: "bg-lime-500",
    image: PEPE_MOOD_IMAGES.LEVEL_4,
  },
  [MoodLevel.Normal]: {
    level: MoodLevel.Normal,
    label: "Normal",
    subLabel: "NotBad",
    color: "#facc15",
    twColor: "bg-yellow-400",
    image: PEPE_MOOD_IMAGES.LEVEL_3,
  },
  [MoodLevel.Regular]: {
    level: MoodLevel.Regular,
    label: "Regular",
    subLabel: "FeelsOkayMan",
    color: "#f97316",
    twColor: "bg-orange-500",
    image: PEPE_MOOD_IMAGES.LEVEL_2,
  },
  [MoodLevel.Fatal]: {
    level: MoodLevel.Fatal,
    label: "Fatal",
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