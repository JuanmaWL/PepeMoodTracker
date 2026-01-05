
import { Achievement, YearData, MoodLevel } from '../types';
import { Flame, BookOpen, Crown, Umbrella, Skull, CalendarCheck, Zap, Heart } from 'lucide-react';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'streak_7',
    title: 'Racha de Hierro',
    description: 'Registra tu mood durante 7 días seguidos.',
    icon: Flame,
    color: '#f97316', // Orange
    condition: (data: YearData) => {
        const dates = Object.keys(data).sort();
        if (dates.length < 7) return false;
        
        // Algoritmo simple de racha máxima
        let maxStreak = 0;
        let currentStreak = 0;
        
        for (let i = 0; i < dates.length; i++) {
            if (i === 0) {
                currentStreak = 1;
                continue;
            }
            const prev = new Date(dates[i-1]);
            const curr = new Date(dates[i]);
            const diffTime = Math.abs(curr.getTime() - prev.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                currentStreak++;
            } else {
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
            }
        }
        maxStreak = Math.max(maxStreak, currentStreak);
        return maxStreak >= 7;
    }
  },
  {
    id: 'writer_10',
    title: 'Cronista del Lore',
    description: 'Escribe notas en al menos 10 días distintos.',
    icon: BookOpen,
    color: '#3b82f6', // Blue
    condition: (data: YearData) => {
        return Object.values(data).filter(d => d.note && d.note.trim().length > 5).length >= 10;
    }
  },
  {
    id: 'legendary_5',
    title: 'Based God',
    description: 'Consigue 5 días Legendarios en total.',
    icon: Crown,
    color: '#22c55e', // Green
    condition: (data: YearData) => {
        return Object.values(data).filter(d => d.level === MoodLevel.Legendary).length >= 5;
    }
  },
  {
    id: 'sadge_5',
    title: 'Guerrero Sadge',
    description: 'Sobrevive a 5 días Fatales. El dolor te hace fuerte.',
    icon: Skull,
    color: '#ef4444', // Red
    condition: (data: YearData) => {
        return Object.values(data).filter(d => d.level === MoodLevel.Rage).length >= 5;
    }
  },
  {
    id: 'month_warrior',
    title: 'Mes Completo',
    description: 'Registra al menos 20 días en el total del año.',
    icon: CalendarCheck,
    color: '#a855f7', // Purple
    condition: (data: YearData) => {
        return Object.keys(data).length >= 20;
    }
  },
  {
    id: 'balanced',
    title: 'Zen Master',
    description: 'Ten al menos 5 días "Normales". El equilibrio perfecto.',
    icon: Umbrella,
    color: '#facc15', // Yellow
    condition: (data: YearData) => {
         return Object.values(data).filter(d => d.level === MoodLevel.Normal).length >= 5;
    }
  }
];

export const getUnlockedAchievements = (data: YearData): string[] => {
    return ACHIEVEMENTS.filter(ach => ach.condition(data)).map(ach => ach.id);
};
