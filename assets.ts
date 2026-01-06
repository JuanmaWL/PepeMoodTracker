// Imports de imágenes como módulos de Vite
// Esto permite que Vite las procese correctamente en dev y producción

// Imágenes principales
import banner from './public/assets/images/banner.png';
import oracleFace from './public/assets/images/oracle_face.jpg';
import oracleBg from './public/assets/images/oracle_bg.png';
import judge1 from './public/assets/images/judge_1.png';
import judge2 from './public/assets/images/judge_2.png';
import pepeIcon from './public/assets/images/pepe_icon.png';
import pepeChef from './public/assets/images/pepe_chef.png';
import pepeOk from './public/assets/images/pepe_ok.png';

// GIFs animados para loading
import pepeNotes1 from './public/assets/images/pepe_notes_1.gif';
import pepeNotes2 from './public/assets/images/pepe_notes_2.gif';
import pepeNotes3 from './public/assets/images/pepe_notes_3.gif';
import pepeNotes4 from './public/assets/images/pepe_notes_4.gif';

// GIFs de Pepe
import pepeClown from './public/assets/images/pepe_clown.gif';
import pepeCouncil from './public/assets/images/pepe_council.gif';
import pepeGafas from './public/assets/images/PepeGafas.gif';

// GIFs de moods
import moodLegendary from './public/assets/images/mood_legendary.gif';
import moodMeh from './public/assets/images/mood_meh.gif';
import moodRage from './public/assets/images/mood_rage.gif';
import moodSadge from './public/assets/images/mood_sadge.gif';

// Exportar todos los assets
export const PEPE_ASSETS = {
    BANNER: banner,
    ORACLE_AVATAR: oracleFace,
    ORACLE_BG: oracleBg,
    JUDGE_1: judge1,
    JUDGE_2: judge2,
    LOADING_GIF: pepeNotes1,
    CLOWN_GIF: pepeClown,
    CENTER_IMG: pepeIcon,
    ICON: pepeIcon,
    CHEF: pepeChef,
    OK: pepeOk,
    COUNCIL: pepeCouncil,
    GAFAS: pepeGafas,
    // GIFs de loading adicionales
    NOTES_1: pepeNotes1,
    NOTES_2: pepeNotes2,
    NOTES_3: pepeNotes3,
    NOTES_4: pepeNotes4
};

export const PEPE_MOOD_IMAGES = {
    LEVEL_6: moodLegendary,
    LEVEL_5: moodLegendary, // Usando legendary como placeholder
    LEVEL_4: moodMeh,
    LEVEL_3: moodMeh,
    LEVEL_2: moodSadge,
    LEVEL_1: moodRage,
};

export const PEPE_BANNER = PEPE_ASSETS.BANNER;
