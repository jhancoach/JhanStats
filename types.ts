
export interface KillStat {
  rank: number;
  player: string;
  team: string;
  totalKills: number;
  matches: number;
  kpg: number; // Kills Per Game
  events: string;
  
  // Detailed WB Stats (Make sure they are all optional as they might not exist in LBFF stats)
  headshots?: number;         
  knockdowns?: number;        
  gloowalls?: number;         
  gloowallsDestroyed?: number;
  revives?: number;           
  alliesRevived?: number;     

  // Specific Split Data (Numeric for sorting/columns)
  kills24s1?: number;
  kills24s2?: number;
  kills25s1?: number;
  kills25s2?: number;

  // Season specific stats strings (Legacy format for charts/details)
  lbff1?: string;
  lbff3?: string;
  lbff4?: string;
  lbff5?: string;
  lbff6?: string;
  lbff7?: string;
  lbff8?: string;
  lbff9?: string;
  wb2024s1?: string;
  wb2024s2?: string;
  wb2025s1?: string;
  wb2025s2?: string;
}

export interface EarningStat {
  rank: number;
  player: string;
  earnings: number; // In USD
  gold: number;
  silver: number;
  bronze: number;
  s_tier: number;
  team?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

// Valuation Types
export interface ValuationCompetition {
  name: string;
  type: string;
  tier: string;
}

export interface ValuationTitle {
  name: string;
  count: number;
}

export interface ValuationParticipation {
  name: string;
  count: number;
}

export interface ValuationRecent {
  name: string;
  type: string;
  position: number;
}

export interface ValuationForm {
  playerName: string;
  role: string;
  isCaptain: boolean;
  officialKills: number;
  booyahs: number; // Only if captain
  followers: number;
  engagement: number;
  
  // Lists
  competitionsDisputed: ValuationCompetition[];
  titles: ValuationTitle[];
  participations: ValuationParticipation[];
  
  recentCompetitions: ValuationRecent[];
}