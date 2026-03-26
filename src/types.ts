
export enum Rank {
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S'
}

export interface HunterStats {
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  sense: number;
}

export interface ActiveBuff {
  id: string;
  slug?: string;
  name: string;
  description: string;
  type: 'stat' | 'passive' | 'timed';
  icon: string;
  value?: string;
  endTime?: number;
}

export interface HunterProfile {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  maxXp: number;
  rank: Rank;
  title: string;
  gold: number;
  corruption: number; // 0 a 100
  totalXpGained: number; // Novo campo para rastrear drops a cada 50k
  isPenaltyZoneActive: boolean;
  penaltyEndTime?: number;
  penaltyType?: 'gold_drain' | 'xp_drain' | 'block_rewards' | 'corruption_spike';
  storeLockedUntil?: number;
  stats: HunterStats;
  activeBuffs: ActiveBuff[];
  dailyItemDropsCount?: number;
  lastItemDropDate?: string;
  dailyStreak?: number; // Contador de ofensivas (dias consecutivos)
  lastStreakDate?: string; // Data da ultima ofensiva incrementada
  lastDailyCheckDate?: string; // Data da última verificação diária de streak
  lastUpdate?: string; // ISO timestamp
}

export interface SubQuest {
  id: string;
  title: string;
  completed: boolean;
}

export enum QuestDifficulty {
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S'
}

export interface Vice {
  id: string;
  title: string;
  penaltyXp: number;
  corruptionIncrease: number;
  lastSuccumbed?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  xpReward: number;
  goldReward: number;
  completed: boolean;
  failed: boolean;
  isNegative?: boolean;
  deadline?: number;
  deadlineEdits?: number; // Contador de edições do deadline
  subQuests: SubQuest[];
  createdAt: number;
  isDaily?: boolean; // Nova propriedade
  lastResetAt?: number; // Nova propriedade
  isSpecial?: boolean; // Expira a meia noite, gera punicao se nao completada e desaparece
  completedAt?: number; // Data de conclusão da missão
}

export type ItemOrigin = 'diário' | 'compra' | 'rank' | 'nível' | 'raro';

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  purchasedCount: number;
  icon?: string;
  origin?: ItemOrigin;
}

export interface SystemMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}
