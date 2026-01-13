
import { MoodConfig, MoodLevel } from './types';

// --- ASSETS REMOTOS (VERCEL BLOB) ---
// URL base de tu bucket de Vercel Blob
const BLOB_BASE_URL = "https://sme2zz26xzjq57zw.public.blob.vercel-storage.com";

export const PEPE_ASSETS = {
    FAVICON_1: `${BLOB_BASE_URL}/favicon_1.png`,
    FAVICON_2: `${BLOB_BASE_URL}/favicon_2.png`,
    BANNER: `${BLOB_BASE_URL}/banner.png`,
    ORACLE_AVATAR: `${BLOB_BASE_URL}/oracle_face.jpg`,
    ORACLE_BG: `${BLOB_BASE_URL}/oracle_bg.png`,
    JUDGE_1: `${BLOB_BASE_URL}/judge_1.png`,
    JUDGE_2: `${BLOB_BASE_URL}/judge_2.png`,
    CLOWN_GIF: `${BLOB_BASE_URL}/pepe_clown.gif`,
    CENTER_IMG: `${BLOB_BASE_URL}/pepe_icon.png`,
    ICON: `${BLOB_BASE_URL}/pepe_icon.png`,
    CHEF: `${BLOB_BASE_URL}/pepe_chef.png`,
    OK: `${BLOB_BASE_URL}/pepe_ok.png`,
    COUNCIL: `${BLOB_BASE_URL}/pepe_council.gif`,
    GAFAS: `${BLOB_BASE_URL}/pepe_glasses.gif`,
    SUNGLASSES: `${BLOB_BASE_URL}/pepe_sunglasses.gif`,
    NOTES_1: `${BLOB_BASE_URL}/pepe_notes_1.gif`,
    NOTES_2: `${BLOB_BASE_URL}/pepe_notes_2.gif`,
    NOTES_3: `${BLOB_BASE_URL}/pepe_notes_3.gif`,
    NOTES_4: `${BLOB_BASE_URL}/pepe_notes_4.gif`,
    LOADING: `${BLOB_BASE_URL}/pepe_loading.gif`,
    LOADING_2: `${BLOB_BASE_URL}/pepe_loading_2.gif`,
    LOADING_3: `${BLOB_BASE_URL}/pepe_loading_3.gif`
};

// Secuencia de imágenes para el banner rotativo
export const BANNER_SLIDES = [
    PEPE_ASSETS.FAVICON_2, // Empezamos con el 2 que suele ser impactante
    PEPE_ASSETS.BANNER,    // El clásico
    PEPE_ASSETS.FAVICON_1  // El nuevo oficial
];

// Mantenemos esto por compatibilidad, aunque usaremos el array arriba
export const PEPE_BANNER = PEPE_ASSETS.FAVICON_1; 

// Rutas remotas para las imágenes de los estados de ánimo
export const PEPE_MOOD_IMAGES = {
  LEVEL_6: `${BLOB_BASE_URL}/mood_legendary.gif`,
  LEVEL_5: `${BLOB_BASE_URL}/mood_moibien.gif`, 
  LEVEL_4: `${BLOB_BASE_URL}/mood_normal.gif`,
  LEVEL_3: `${BLOB_BASE_URL}/mood_meh.gif`,
  LEVEL_2: `${BLOB_BASE_URL}/mood_sad.gif`, 
  LEVEL_1: `${BLOB_BASE_URL}/mood_rage.gif`,
};

export const MOODS: Record<MoodLevel, MoodConfig> = {
  [MoodLevel.Legendary]: {
    level: MoodLevel.Legendary,
    label: "Legendario",
    subLabel: "SUPREME",
    description: "Un día absolutamente épico. Todo salió perfecto, te sentiste invencible o ocurrió algo memorable. God Tier.",
    color: "#06b6d4", // Cyan-500
    twColor: "bg-cyan-500",
    image: PEPE_MOOD_IMAGES.LEVEL_6,
  },
  [MoodLevel.MoiBiens]: {
    level: MoodLevel.MoiBiens,
    label: "Moi Biens",
    subLabel: "FEELS GOOD",
    description: "Un buen día. Productivo, alegre o simplemente satisfactorio. Te vas a dormir con una sonrisa.",
    color: "#22c55e", // Green-500
    twColor: "bg-green-500",
    image: PEPE_MOOD_IMAGES.LEVEL_5,
  },
  [MoodLevel.Normal]: {
    level: MoodLevel.Normal,
    label: "Normal",
    subLabel: "NOT BAD",
    description: "Estándar. Ni fu ni fa, pero tirando a bien. Un día tranquilo sin sobresaltos.",
    color: "#84cc16", // Lime-500
    twColor: "bg-lime-500",
    image: PEPE_MOOD_IMAGES.LEVEL_4,
  },
  [MoodLevel.Regular]: {
    level: MoodLevel.Regular,
    label: "Meh",
    subLabel: "NPC Mode",
    description: "Un día gris, aburrido o apático. Modo automático activado. Nada relevante, o ligera molestia.",
    color: "#eab308", // Yellow-500
    twColor: "bg-yellow-500",
    image: PEPE_MOOD_IMAGES.LEVEL_3,
  },
  [MoodLevel.Sadge]: {
    level: MoodLevel.Sadge,
    label: "Triste",
    subLabel: "FEELS BAD",
    description: "Baja energía, melancolía, decepción o tristeza. Un día para olvidar o para escuchar música lenta.",
    color: "#f97316", // Orange-500
    twColor: "bg-orange-500",
    image: PEPE_MOOD_IMAGES.LEVEL_2,
  },
  [MoodLevel.Rage]: {
    level: MoodLevel.Rage,
    label: "Enfadado",
    subLabel: "TRIGGERED",
    description: "Furia, estrés máximo o caos total. El mundo conspiró en tu contra. Necesitas golpear una almohada.",
    color: "#ef4444", // Red-500
    twColor: "bg-red-500",
    image: PEPE_MOOD_IMAGES.LEVEL_1,
  },
  [MoodLevel.None]: {
    level: MoodLevel.None,
    label: "",
    subLabel: "",
    description: "",
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
