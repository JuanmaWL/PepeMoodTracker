import React from 'react';

export enum MoodLevel {
  None = 0,
  Rage = 1,     // Enfadado (Alta energía negativa)
  Sadge = 2,    // Triste (Baja energía negativa)
  Regular = 3,  // Poker/Meh (Neutro bajo)
  Normal = 4,   // Ok (Neutro alto)
  MoiBiens = 5, // Good (Positivo)
  Legendary = 6 // God tier (Muy positivo)
}

export interface DayData {
  level: MoodLevel;
  note: string;
}

export interface YearData {
  [date: string]: DayData; // Key format: YYYY-MM-DD
}

export interface MoodConfig {
  level: MoodLevel;
  label: string;
  subLabel: string;
  color: string;
  twColor: string; // Tailwind class equivalent for background
  image: string; // URL for the Pepe image
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  condition: (data: YearData) => boolean;
  color: string;
}