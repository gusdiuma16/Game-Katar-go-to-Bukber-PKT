export enum ViewState {
  LOGIN = 'LOGIN',
  MENU = 'MENU',
  GAME_WAR_TAKJIL = 'GAME_WAR_TAKJIL',
  GAME_SLIDE_JANNAH = 'GAME_SLIDE_JANNAH',
  GAME_DILEMA = 'GAME_DILEMA',
  LEADERBOARD = 'LEADERBOARD'
}

export interface User {
  id: string;
  username: string;
  phone: string;
  scores: {
    warTakjil: number;
    slideJannah: number;
    dilema: number;
  }
}

export interface LeaderboardEntry {
  username: string;
  totalScore: number;
  game: string; // "All" or specific game
}

// Dilema Ramadan Types
export interface DilemaOption {
  text: string;
  effect: {
    iman: number;
    social: number;
  };
  nextScenarioId: number | 'WIN' | 'LOSE';
}

export interface DilemaScenario {
  id: number;
  sender: string;
  text: string;
  options: DilemaOption[];
}
