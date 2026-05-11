
import { Achievement, YearData, MoodLevel, Rarity } from '../types';
import { Flame, BookOpen, Crown, Skull, Zap, TrendingUp, TrendingDown, Gem, Bomb, Rocket, Ghost, Cat, Leaf, Activity, CheckCircle2, Mic2, Medal, Music, Gamepad2, Twitter, Waves, Sun, CloudRain, Shield, Atom, Clock, CloudFog, Dna, Feather, HandMetal, Scroll, Map, Smile, ShieldCheck, Moon, Swords, Droplets, Sprout, Fingerprint } from 'lucide-react';

export const ACHIEVEMENTS: Achievement[] = [
  // --- BASIC ---
  {
    id: 'streak_7',
    title: 'The Eras Tour',
    description: 'Racha de 7 días. Has completado tu primera Era (Taylor\'s Version).',
    icon: Flame,
    color: '#f97316', // Orange
    condition: (data: YearData) => checkStreak(data, 7),
    rarity: Rarity.Common
  },
  {
    id: 'writer_10',
    title: 'All Too Well (10 Min)',
    description: 'Escribe notas en 10 días. "I remember it all too well".',
    icon: BookOpen,
    color: '#ef4444', // Red (Taylor's Red)
    condition: (data: YearData) => Object.values(data).filter(d => d.note && d.note.trim().length > 5).length >= 10,
    rarity: Rarity.Common
  },
  {
    id: 'legendary_5',
    title: 'Shiny Hunter',
    description: 'Consigue 5 días Legendarios. ¡Es un Shiny! ✨ (Probabilidad 1/4096).',
    icon: Crown,
    color: '#fbbf24', // Gold/Yellow
    condition: (data: YearData) => Object.values(data).filter(d => d.level === MoodLevel.Legendary).length >= 5,
    rarity: Rarity.Rare
  },
  {
    id: 'sadge_5',
    title: 'Crawling in my Skin',
    description: '5 días Sadge. Estas heridas no sanarán (Linkin Park Tribute).',
    icon: Skull,
    color: '#94a3b8', // Slate (Grey/Dark)
    condition: (data: YearData) => Object.values(data).filter(d => d.level === MoodLevel.Sadge).length >= 5,
    rarity: Rarity.Rare
  },
  {
    id: 'month_warrior',
    title: 'Fox River',
    description: '20 días registrados. Tienes el mapa tatuado en la piel. "Have a little faith".',
    icon: Map, // Prison Break Blueprints/Map
    color: '#60a5fa', // Blueish/Grey
    condition: (data: YearData) => Object.keys(data).length >= 20,
    rarity: Rarity.Rare
  },
  {
    id: 'balanced',
    title: 'Sheldon\'s Spot',
    description: '5 días Normales. Ese es mi sitio. En un estado de equilibrio perfecto.',
    icon: Atom, // Updated to Atom for science/nerd reference
    color: '#84cc16', // Lime
    condition: (data: YearData) => Object.values(data).filter(d => d.level === MoodLevel.Normal).length >= 5,
    rarity: Rarity.Common
  },

  // --- INTERMEDIATE (Pop Culture) ---

  {
    id: 'we_are_so_back',
    title: 'The Dark Knight Rises',
    description: 'De Sadge/Rage a Legendario. ¿Por qué nos caemos, Bruce? Para aprender a levantarnos.',
    icon: TrendingUp,
    color: '#10b981', // Emerald
    condition: (data: YearData) => checkPattern(data, [MoodLevel.Sadge, MoodLevel.Legendary]) || checkPattern(data, [MoodLevel.Rage, MoodLevel.Legendary]),
    rarity: Rarity.Epic
  },
  {
    id: 'its_over',
    title: 'Complicated',
    description: 'De Legendario a Sadge. Why\'d you have to go and make things so complicated? (Avril).',
    icon: TrendingDown,
    color: '#be123c', // Rose
    condition: (data: YearData) => checkPattern(data, [MoodLevel.Legendary, MoodLevel.Sadge]) || checkPattern(data, [MoodLevel.Legendary, MoodLevel.Rage]),
    rarity: Rarity.Epic
  },
  {
    id: 'mucho_texto',
    title: 'Twitter Blue',
    description: 'Nota > 140 caracteres. Pagaste el verificado para escribir hilos bíblicos.',
    icon: Twitter,
    color: '#3b82f6', // Blue
    condition: (data: YearData) => Object.values(data).some(d => d.note && d.note.length > 140),
    rarity: Rarity.Common
  },
  {
    id: 'harrys_code',
    title: 'The Code',
    description: '5 días seguidos con el mismo mood exacto. Sigues el código al pie de la letra. Don\'t get caught.',
    icon: Fingerprint,
    color: '#0ea5e9', // Cyan/Blue Dexter Style
    condition: (data: YearData) => checkSameMoodStreak(data, 5),
    rarity: Rarity.Epic
  },
  {
    id: 'toxic_waste',
    title: 'Vecna\'s Curse',
    description: '3 días Rage seguidos. El reloj está sonando... Estás en el Upside Down.',
    icon: Clock, // Updated to Clock for Vecna/Stranger Things
    color: '#ef4444', // Red
    condition: (data: YearData) => checkStreakWithCondition(data, 3, (d) => d.level === MoodLevel.Rage),
    rarity: Rarity.Rare
  },
  {
    id: 'wagmi',
    title: 'To The Moon',
    description: '3 días Legendarios acumulados. WAGMI. Stonks only go up.',
    icon: Rocket,
    color: '#06b6d4', // Cyan
    condition: (data: YearData) => Object.values(data).filter(d => d.level === MoodLevel.Legendary).length >= 3,
    rarity: Rarity.Rare
  },
  {
    id: 'ghost_mode',
    title: 'Capa de Invisibilidad',
    description: 'No registraste en >7 días. Juro solemnemente que mis intenciones no son buenas.',
    icon: Ghost,
    color: '#94a3b8', // Slate
    condition: (data: YearData) => {
        const dates = Object.keys(data).sort();
        if (dates.length < 2) return false;
        
        for (let i = 0; i < dates.length - 1; i++) {
            const prev = new Date(dates[i]);
            const curr = new Date(dates[i+1]);
            const diffDays = Math.round(Math.abs(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays > 7) return true;
        }
        return false;
    },
    rarity: Rarity.Rare
  },

  // --- DC UNIVERSE ---
  {
    id: 'why_so_serious',
    title: 'Agent of Chaos',
    description: 'Registra 4 estados de ánimo DIFERENTES en 4 días seguidos. "Introduce a little anarchy".',
    icon: Smile,
    color: '#a855f7', // Joker Purple
    condition: (data: YearData) => checkUniqueMoodsInWindow(data, 4),
    rarity: Rarity.Epic
  },
  {
    id: 'man_of_steel',
    title: 'Man of Steel',
    description: 'Racha de 10 días invencible (Normal o superior). El sol amarillo te da poder.',
    icon: ShieldCheck,
    color: '#3b82f6', // Superman Blue
    condition: (data: YearData) => checkStreakWithCondition(data, 10, (d) => d.level >= MoodLevel.Normal),
    rarity: Rarity.Rare
  },
  {
    id: 'dark_knight',
    title: 'I Am The Shadows',
    description: 'Activa el Modo Ahorro (Eco Mode). "No es quien soy debajo, sino lo que hago lo que me define".',
    icon: Moon,
    color: '#cbd5e1', // Silver / Moonlight (Changed for visibility on dark mode)
    condition: (data, config) => {
        try {
            const isEco = config?.ecoMode ?? (localStorage.getItem('pepe_eco_mode') === 'true');
            const wasUnlocked = localStorage.getItem('pepe_ach_dark_knight_unlocked') === 'true';
            if (isEco && !wasUnlocked) {
                 localStorage.setItem('pepe_ach_dark_knight_unlocked', 'true');
            }
            return isEco || wasUnlocked;
        } catch(e) { return false; }
    },
    rarity: Rarity.Rare
  },
  {
    id: 'speed_force',
    title: 'Speed Force',
    description: 'Configura las partículas a alta velocidad (>400). ¡Corre, Barry, corre!',
    icon: Zap,
    color: '#eab308', // Flash Yellow/Lightning
    condition: (data, config) => {
        try {
            const count = config?.particleCount ?? parseInt(localStorage.getItem('pepe_particle_count') || '0');
            return count >= 400;
        } catch(e) { return false; }
    },
    rarity: Rarity.Common
  },
  {
    id: 'anti_life_equation',
    title: 'Anti-Life Equation',
    description: 'Configura las partículas a 0. La desolación absoluta de Darkseid.',
    icon: Bomb,
    color: '#475569', // Dark Grey
    condition: (data, config) => {
        try {
            const val = config?.particleCount ?? parseInt(localStorage.getItem('pepe_particle_count') || '0');
            return val !== null && val === 0;
        } catch(e) { return false; }
    },
    rarity: Rarity.Epic
  },

  // --- INNOVATIVE / ADVANCED ---

  {
    id: 'sum_41_in_too_deep',
    title: 'In Too Deep',
    description: 'Escribe una nota profunda (>200 caracteres) en un día Triste. "Instead of going under...".',
    icon: Waves,
    color: '#0ea5e9', // Blue/Cyan mix
    condition: (data: YearData) => Object.values(data).some(d => d.level === MoodLevel.Sadge && d.note && d.note.length > 200),
    rarity: Rarity.Rare
  },
  {
    id: 'dark_passenger',
    title: 'Dark Passenger',
    description: '3 días "Normales" (La Máscara) seguidos de 1 día de "Rage". Tonight\'s the night.',
    icon: Droplets, // Blood Spatter
    color: '#9f1239', // Blood Red
    condition: (data: YearData) => checkSpecificPattern(data, [MoodLevel.Normal, MoodLevel.Normal, MoodLevel.Normal, MoodLevel.Rage]),
    rarity: Rarity.Epic
  },
  {
    id: 'talk_no_jutsu',
    title: 'Talk no Jutsu',
    description: 'Escribe tus problemas (>20 chars) en un día malo y mejora al siguiente. Evangelización interna. Dattebayo.',
    icon: Mic2,
    color: '#f97316', // Naruto Orange
    condition: (data: YearData) => {
        const dates = Object.keys(data).sort();
        if (dates.length < 2) return false;

        for (let i = 0; i < dates.length - 1; i++) {
            const d1 = data[dates[i]];
            const d2 = data[dates[i+1]];
            const prev = new Date(dates[i]);
            const curr = new Date(dates[i+1]);
            const diffDays = Math.round(Math.abs(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                const isBadDay = d1.level === MoodLevel.Rage || d1.level === MoodLevel.Sadge;
                const hasSignificantNote = d1.note && d1.note.length > 20;
                const isGoodNext = d2.level >= MoodLevel.Normal;
                if (isBadDay && hasSignificantNote && isGoodNext) return true;
            }
        }
        return false;
    },
    rarity: Rarity.Epic
  },
  {
    id: 'waking_the_demon',
    title: 'Waking The Demon',
    description: 'Pasas de "Moi Biens" a "Rage" de un día para otro. Has despertado al demonio interior (BFMV).',
    icon: Swords,
    color: '#ef4444', // Red
    condition: (data: YearData) => checkPattern(data, [MoodLevel.MoiBiens, MoodLevel.Rage]) || checkPattern(data, [MoodLevel.Legendary, MoodLevel.Rage]),
    rarity: Rarity.Epic
  },
  {
    id: 'tears_dont_fall',
    title: 'Tears Don\'t Fall',
    description: 'Registras un día Sadge, pero al siguiente estás Normal o mejor. Tus lágrimas no cayeron (BFMV).',
    icon: Droplets,
    color: '#3b82f6', // Blue
    condition: (data: YearData) => {
        const dates = Object.keys(data).sort();
        if (dates.length < 2) return false;
        for (let i = 0; i < dates.length - 1; i++) {
            const d1 = data[dates[i]];
            const d2 = data[dates[i+1]];
            const prev = new Date(dates[i]);
            const curr = new Date(dates[i+1]);
            const diffDays = Math.round(Math.abs(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1 && d1.level === MoodLevel.Sadge && d2.level >= MoodLevel.Normal) return true;
        }
        return false;
    },
    rarity: Rarity.Rare
  },
  {
    id: 'take_me_back_to_eden',
    title: 'Take Me Back To Eden',
    description: 'Registras un día Legendario en Domingo. Día de culto. Worship. (Sleep Token).',
    icon: Sprout,
    color: '#a855f7', // Purple/Mystic
    condition: (data: YearData) => {
        return Object.entries(data).some(([dateStr, d]) => {
            if (d.level !== MoodLevel.Legendary) return false;
            const [y, m, day] = dateStr.split('-').map(Number);
            const date = new Date(y, m - 1, day);
            return date.getDay() === 0; // 0 is Sunday
        });
    },
    rarity: Rarity.Rare
  },
  {
    id: 'numb',
    title: 'Numb',
    description: '5 días "Meh" seguidos. I\'ve become so numb, I can\'t feel you there. (LP).',
    icon: CloudRain,
    color: '#eab308', // Yellow
    condition: (data: YearData) => checkStreakWithCondition(data, 5, (d) => d.level === MoodLevel.Regular),
    rarity: Rarity.Rare
  },
  {
    id: 'one_step_closer',
    title: 'One Step Closer',
    description: 'Pasas de "Sadge" a "Rage" directamente. Justo al borde de romperte. (LP)',
    icon: Activity,
    color: '#ef4444', // Red
    condition: (data: YearData) => checkPattern(data, [MoodLevel.Sadge, MoodLevel.Rage]),
    rarity: Rarity.Rare
  },
  {
    id: 'reputation',
    title: 'Reputation Era',
    description: '13 días de baja vibra (Rage/Sadge) en total. "I\'ve got a list of names and yours is in red".',
    icon: Scroll, // Updated to Scroll (List of names)
    color: '#94a3b8', // Metallic/Silver
    condition: (data: YearData) => Object.values(data).filter(d => d.level === MoodLevel.Rage || d.level === MoodLevel.Sadge).length >= 13,
    rarity: Rarity.Epic
  },
  {
    id: 'cruel_summer',
    title: 'Cruel Summer',
    description: 'Registra un día triste o enfadado en verano (Jun-Ago). Ain\'t that the worst thing to do?',
    icon: Sun,
    color: '#f59e0b', // Amber
    condition: (data: YearData) => {
        return Object.entries(data).some(([dateStr, d]) => {
            const [y, m] = dateStr.split('-');
            const month = parseInt(m);
            // Junio (06), Julio (07), Agosto (08)
            const isSummer = month >= 6 && month <= 8; 
            return isSummer && (d.level === MoodLevel.Rage || d.level === MoodLevel.Sadge);
        });
    },
    rarity: Rarity.Rare
  },
  {
    id: 'dementors_kiss',
    title: 'Dementor\'s Kiss',
    description: '3 días Tristes (Sadge) seguidos. Sientes que nunca volverás a ser feliz.',
    icon: CloudFog, // Updated to CloudFog (Mist) for Dementors
    color: '#64748b', // Slate
    condition: (data: YearData) => checkStreakWithCondition(data, 3, (d) => d.level === MoodLevel.Sadge),
    rarity: Rarity.Rare
  },
  {
    id: 'horcruxes',
    title: 'The 7 Horcruxes',
    description: 'Registra 7 días de Furia (Rage) en total. Has dividido tu alma demasiadas veces.',
    icon: Gem,
    color: '#16a34a', // Green (Slytherinish)
    condition: (data: YearData) => Object.values(data).filter(d => d.level === MoodLevel.Rage).length >= 7,
    rarity: Rarity.Epic
  },
  {
    id: 'pump_it',
    title: 'Mega Evolution',
    description: 'Mejora de mood 3 días seguidos. Has usado la Piedra Activadora.',
    icon: Dna, // Updated to DNA for Evolution
    color: '#22c55e', // Green
    condition: (data: YearData) => {
        const dates = Object.keys(data).sort();
        if (dates.length < 3) return false;
        for (let i = 0; i < dates.length - 2; i++) {
            const l1 = data[dates[i]].level;
            const l2 = data[dates[i+1]].level;
            const l3 = data[dates[i+2]].level;
            const d1 = new Date(dates[i]);
            const d2 = new Date(dates[i+1]);
            const d3 = new Date(dates[i+2]);
            const diff1 = Math.round(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
            const diff2 = Math.round(Math.abs(d3.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
            if (diff1 === 1 && diff2 === 1) {
                if (l1 < l2 && l2 < l3) return true;
            }
        }
        return false;
    },
    rarity: Rarity.Epic
  },
  {
    id: 'garfield_mode',
    title: 'Garfield Mode',
    description: 'Odia los lunes. Registra "Rage" o "Sadge" en 3 lunes. ¿Dónde está mi lasaña?',
    icon: Cat,
    color: '#f97316', // Orange
    condition: (data: YearData) => {
        let badMondays = 0;
        Object.entries(data).forEach(([dateStr, dayData]) => {
             const [y, m, d] = dateStr.split('-').map(Number);
             const date = new Date(y, m - 1, d);
             if (date.getDay() === 1) { // 1 es Lunes
                 if (dayData.level === MoodLevel.Rage || dayData.level === MoodLevel.Sadge) {
                     badMondays++;
                 }
             }
        });
        return badMondays >= 3;
    },
    rarity: Rarity.Rare
  },
  {
    id: 'touch_grass',
    title: 'Medalla de Gimnasio',
    description: '5 días "Moi Biens" (Verde). Has vencido al líder del gimnasio de tipo Planta.',
    icon: Leaf,
    color: '#4ade80', // Light Green
    condition: (data: YearData) => Object.values(data).filter(d => d.level === MoodLevel.MoiBiens).length >= 5,
    rarity: Rarity.Common
  },
  {
    id: 'vibe_check',
    title: 'Fortnight',
    description: 'Racha de 14 días. I was supposed to be sent away but they forgot to come and get me (Taylor).',
    icon: CheckCircle2,
    color: '#6366f1', // Indigo
    condition: (data: YearData) => checkStreak(data, 14),
    rarity: Rarity.Rare
  },

  // --- LEGENDARY / ENDGAME ---

  {
    id: 'god_emperor',
    title: 'Pokédex Completa',
    description: '300 días registrados. Gotta Catch \'Em All! Eres el Campeón de la Liga.',
    icon: Gamepad2,
    color: '#f59e0b', // Amber
    condition: (data: YearData) => Object.keys(data).length >= 300,
    rarity: Rarity.Legendary
  },
  {
    id: 'professional_yapper',
    title: 'The Tortured Poets Dept.',
    description: 'Notas en 50 días. Eres el Presidente del Departamento de Poetas Torturados.',
    icon: Feather, // Updated to Feather/Quill
    color: '#ec4899', // Pink
    condition: (data: YearData) => Object.values(data).filter(d => d.note && d.note.trim().length > 5).length >= 50,
    rarity: Rarity.Legendary
  },
  {
    id: 'the_1_percent',
    title: 'Bazinga!',
    description: 'Racha de 30 días. Has caído en una de mis bromas clásicas (o eres un genio constante).',
    icon: Medal,
    color: '#fbbf24', // Gold
    condition: (data: YearData) => checkStreak(data, 30),
    rarity: Rarity.Legendary
  },
  {
    id: 'the_avatar',
    title: 'Infinity Gauntlet',
    description: 'Has registrado los 6 estados de ánimo. "Fine, I\'ll do it myself".',
    icon: HandMetal, // Updated to Hand/Fist
    color: '#6366f1', // Indigo
    condition: (data: YearData) => {
        const counts: Record<number, number> = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0};
        Object.values(data).forEach(d => {
            if (d.level > 0 && d.level <= 6) counts[d.level]++;
        });
        return Object.values(counts).every(count => count >= 1);
    },
    rarity: Rarity.Legendary
  },
  {
    id: 'employee_of_month',
    title: 'Perfect Prefect',
    description: 'Mes completo registrado. 10 puntos para Gryffindor por tu disciplina mágica.',
    icon: Shield,
    color: '#3b82f6', // Blue
    condition: (data: YearData) => {
        const monthCounts: Record<string, number> = {};
        Object.keys(data).forEach(dateStr => {
            const [y, m] = dateStr.split('-');
            const key = `${y}-${m}`;
            monthCounts[key] = (monthCounts[key] || 0) + 1;
        });

        for (const [key, count] of Object.entries(monthCounts)) {
            const [y, m] = key.split('-').map(Number);
            const daysInMonth = new Date(y, m, 0).getDate();
            if (count >= daysInMonth) return true;
        }
        return false;
    },
    rarity: Rarity.Legendary
  },
  {
    id: 'half_life',
    title: 'Blink-182',
    description: '182 días registrados. All the small things... true care, truth brings.',
    icon: Music,
    color: '#f97316', // Orange
    condition: (data: YearData) => Object.keys(data).length >= 182,
    rarity: Rarity.Epic
  }
];

// --- HELPER FUNCTIONS ---

function checkStreak(data: YearData, requiredStreak: number): boolean {
    const dates = Object.keys(data).sort();
    if (dates.length < requiredStreak) return false;
    
    let currentStreak = 0;
    let maxStreak = 0;
    
    for (let i = 0; i < dates.length; i++) {
        if (i === 0) {
            currentStreak = 1;
            continue;
        }
        const prev = new Date(dates[i-1]);
        const curr = new Date(dates[i]);
        const diffDays = Math.round(Math.abs(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            currentStreak++;
        } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
        }
    }
    maxStreak = Math.max(maxStreak, currentStreak);
    return maxStreak >= requiredStreak;
}

function checkStreakWithCondition(data: YearData, requiredStreak: number, predicate: (d: any) => boolean): boolean {
    const dates = Object.keys(data).sort();
    let currentStreak = 0;
    let maxStreak = 0;
    
    for (let i = 0; i < dates.length; i++) {
        const entry = data[dates[i]];
        if (predicate(entry)) {
            if (i > 0) {
                const prev = new Date(dates[i-1]);
                const curr = new Date(dates[i]);
                const diffDays = Math.round(Math.abs(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) currentStreak++;
                else currentStreak = 1;
            } else {
                currentStreak = 1;
            }
        } else {
            currentStreak = 0;
        }
        maxStreak = Math.max(maxStreak, currentStreak);
    }
    return maxStreak >= requiredStreak;
}

function checkPattern(data: YearData, sequence: MoodLevel[]): boolean {
    const dates = Object.keys(data).sort();
    if (dates.length < sequence.length) return false;
    
    for (let i = 0; i <= dates.length - sequence.length; i++) {
        let match = true;
        for (let j = 0; j < sequence.length; j++) {
            if (j > 0) {
                const prev = new Date(dates[i+j-1]);
                const curr = new Date(dates[i+j]);
                const diffDays = Math.round(Math.abs(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays !== 1) { match = false; break; }
            }
            if (data[dates[i+j]].level !== sequence[j]) { match = false; break; }
        }
        if (match) return true;
    }
    return false;
}

function checkSameMoodStreak(data: YearData, length: number): boolean {
    const dates = Object.keys(data).sort();
    if (dates.length < length) return false;
    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i-1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.round(Math.abs(currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1 && data[dates[i]].level === data[dates[i-1]].level) {
            currentStreak++;
        } else {
            currentStreak = 1;
        }
        maxStreak = Math.max(maxStreak, currentStreak);
    }
    return maxStreak >= length;
}

function checkUniqueMoodsInWindow(data: YearData, windowSize: number): boolean {
    const dates = Object.keys(data).sort();
    if (dates.length < windowSize) return false;
    
    for (let i = 0; i <= dates.length - windowSize; i++) {
        const slice = dates.slice(i, i + windowSize);
        const isConsecutive = slice.every((date, idx) => {
            if (idx === 0) return true;
            const prev = new Date(slice[idx-1]);
            const curr = new Date(date);
            const diffDays = Math.round(Math.abs(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays === 1;
        });

        if (isConsecutive) {
            const moods = new Set(slice.map(d => data[d].level));
            if (moods.size === windowSize) return true;
        }
    }
    return false;
}

function checkSpecificPattern(data: YearData, sequence: MoodLevel[]): boolean {
    return checkPattern(data, sequence);
}

// --- HISTORICAL REPLAY LOGIC ---

/**
 * Calculates the exact date an achievement was unlocked by replaying history.
 * Iterates through all recorded dates chronologically, building a partial
 * view of the data, and checks the condition at each step.
 */
export const calculateHistoricalUnlockDate = (achievement: Achievement, fullData: YearData, config?: AchievementConfig): number => {
    // 1. Get all chronological dates
    const dates = Object.keys(fullData).sort();
    
    // 2. Accumulator for partial history
    const partialData: YearData = {};

    // 3. Replay history day by day
    for (const date of dates) {
        partialData[date] = fullData[date]; // Add current day to history
        
        // 4. Check if condition is met with this partial data
        if (achievement.condition(partialData, config)) {
             // Found the trigger date!
             const [y, m, d] = date.split('-').map(Number);
             const resultDate = new Date(y, m - 1, d);
             
             // 5. Assign a realistic "night time" (22:00 - 23:59)
             // Use a pseudo-random seed based on date to be deterministic but varied
             const seed = y + m + d;
             const randomMinutes = seed % 60;
             const randomHour = 22 + (seed % 2); // 22 or 23
             
             resultDate.setHours(randomHour);
             resultDate.setMinutes(randomMinutes);
             
             return resultDate.getTime();
        }
    }

    // Fallback: If condition met in fullData but logic failed (shouldn't happen), return now.
    return Date.now();
};

export const getUnlockedAchievements = (data: YearData, config?: AchievementConfig): string[] => {
    return ACHIEVEMENTS.filter(ach => ach.condition(data, config)).map(ach => ach.id);
};
