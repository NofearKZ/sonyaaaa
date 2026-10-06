export type MoodTheme = 'blush' | 'sunset' | 'lavender' | 'mint' | 'amber';

export interface NoteItem {
  id: string;
  category: 'compliment' | 'support' | 'reminder' | 'smile' | 'sweet';
  text: string;
  authorNote?: string;
}

export interface CareItem {
  id: string;
  label: string;
  iconName: string;
  done: boolean;
  sweetMessage: string;
}

export interface SoundState {
  rain: boolean;
  cat: boolean;
  fire: boolean;
  chimes: boolean;
  volume: number;
}
