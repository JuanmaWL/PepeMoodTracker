
export enum MoodLevel {
  None = 0,
  Fatal = 1,
  Regular = 2,
  Normal = 3,
  MoiBiens = 4,
  Legendary = 5,
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
