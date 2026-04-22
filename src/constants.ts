
import { Rank, QuestDifficulty, StoreItem, ItemRarity, HunterStats, DetailedStat } from './types';

export const RANK_COLORS: Record<Rank, string> = {
  [Rank.E]: 'text-slate-500 border-slate-500',
  [Rank.D]: 'text-teal-400 border-teal-500/50',
  [Rank.C]: 'text-sky-400 border-sky-500/50',
  [Rank.B]: 'text-amber-400 border-amber-500/50',
  [Rank.A]: 'text-orange-400 border-orange-500/50',
  [Rank.S]: 'text-rose-500 border-rose-500/50 font-bold',
};

export const ITEM_RARITY_CONFIG: Record<ItemRarity, { color: string, label: string }> = {
  [ItemRarity.COMUM]: { color: 'border-slate-500/50 text-slate-400 bg-slate-950/20', label: 'COMUM' },
  [ItemRarity.INCOMUM]: { color: 'border-teal-500/50 text-teal-400 bg-teal-950/20', label: 'INCOMUM' },
  [ItemRarity.RARO]: { color: 'border-blue-500/50 text-blue-400 bg-blue-950/20', label: 'RARO' },
  [ItemRarity.ÉPICO]: { color: 'border-purple-500/50 text-purple-400 bg-purple-950/20', label: 'ÉPICO' },
  [ItemRarity.LENDÁRIO]: { color: 'border-orange-500/50 text-orange-400 bg-orange-950/20', label: 'LENDÁRIO' },
  [ItemRarity.MÍTICO]: { color: 'border-rose-500/50 text-rose-500 bg-rose-950/20', label: 'MÍTICO' },
};

export interface StreakTier {
  name: string;
  minDays: number;
  multiplier: number;
  color: string;
}

export const STREAK_TIERS: StreakTier[] = [
  { name: 'BRONZE', minDays: 0, multiplier: 1.0, color: 'text-orange-700' },
  { name: 'PRATA', minDays: 7, multiplier: 1.05, color: 'text-slate-400' },
  { name: 'OURO', minDays: 15, multiplier: 1.10, color: 'text-amber-400' },
  { name: 'PLATINA', minDays: 30, multiplier: 1.20, color: 'text-cyan-400' },
  { name: 'MONARCA', minDays: 60, multiplier: 1.30, color: 'text-purple-500' },
];

export const getCurrentStreakTier = (streak: number) => {
  return [...STREAK_TIERS].reverse().find(tier => (streak || 0) >= tier.minDays) || STREAK_TIERS[0];
};

export const getStreakMultiplier = (streak: number) => {
  return getCurrentStreakTier(streak).multiplier;
};

// Valores base (agora com o buff de 15% aplicado)
export const DIFFICULTY_XP: Record<QuestDifficulty, number> = {
  [QuestDifficulty.E]: 750,
  [QuestDifficulty.D]: 2300,
  [QuestDifficulty.C]: 6900,
  [QuestDifficulty.B]: 18400,
  [QuestDifficulty.A]: 57500,
  [QuestDifficulty.S]: 172500,
};

// Valores base (agora com o buff de 15% aplicado)
export const DIFFICULTY_GOLD: Record<QuestDifficulty, number> = {
  [QuestDifficulty.E]: 115,
  [QuestDifficulty.D]: 400,
  [QuestDifficulty.C]: 1265,
  [QuestDifficulty.B]: 3680,
  [QuestDifficulty.A]: 12650,
  [QuestDifficulty.S]: 55200,
};

export const DIFFICULTY_PENALTY: Record<QuestDifficulty, number> = {
  [QuestDifficulty.E]: 100,
  [QuestDifficulty.D]: 300,
  [QuestDifficulty.C]: 1000,
  [QuestDifficulty.B]: 4000,
  [QuestDifficulty.A]: 12000,
  [QuestDifficulty.S]: 50000,
};

/**
 * Fórmula de Progressão de Sincronia
 * f(x) = 1000x + 60x^2
 */
export const calculateMaxXp = (level: number) => {
  return Math.floor(700 * level + 45 * Math.pow(level, 2));
};

export const RANK_PROGRESSION_CONFIG = [
  { rank: Rank.E, minLevel: 1, maxLevel: 19, label: 'CAÇADOR INICIANTE' },
  { rank: Rank.D, minLevel: 20, maxLevel: 39, label: 'CAÇADOR DESPERTO' },
  { rank: Rank.C, minLevel: 40, maxLevel: 59, label: 'MEMBRO DE ELITE' },
  { rank: Rank.B, minLevel: 60, maxLevel: 79, label: 'CAÇADOR DE ALTO NÍVEL' },
  { rank: Rank.A, minLevel: 80, maxLevel: 99, label: 'REI DOS CAÇADORES' },
  { rank: Rank.S, minLevel: 100, maxLevel: 999, label: 'MONARCA DAS SOMBRAS' },
];

export const getRankByLevel = (level: number): Rank => {
  if (level >= 100) return Rank.S;
  if (level >= 80) return Rank.A;
  if (level >= 60) return Rank.B;
  if (level >= 40) return Rank.C;
  if (level >= 20) return Rank.D;
  return Rank.E;
};

// ─── RANK BENEFITS SYSTEM ─────────────────────────────────────────────

export interface RankBenefits {
  label: string;
  xpMultiplier: number;       // 1.0 = no bonus, 1.05 = +5%
  goldMultiplier: number;
  corruptionReduction: number; // 0 = no reduction, 0.05 = -5%
  maxDailyDrops: number;
  shopDiscount: number;        // 0 = no discount, 0.05 = -5%
  penaltyDurationReduction: number; // 0 = no reduction, 0.15 = -15%
  statBonus: number;           // 0 = no bonus, 0.05 = +5%
  rareDropThreshold: number;   // XP needed for rare drop
  passiveGoldPerQuest: number; // Flat gold bonus per quest
  corruptionRegen: number;     // Passive corruption regen per cycle (0 = none)
  immunities: string[];        // Penalty types immune to
  doubleDropChance: boolean;   // Whether drop chances are doubled
  streakFreeze: boolean;       // Whether streak freezes instead of breaking
  streakSafeguard: boolean;    // Whether streak is never zeroed (rank B+)
}

export const RANK_BENEFITS: Record<Rank, RankBenefits> = {
  [Rank.E]: {
    label: 'CAÇADOR INICIANTE',
    xpMultiplier: 1.0,
    goldMultiplier: 1.0,
    corruptionReduction: 0,
    maxDailyDrops: 2,
    shopDiscount: 0,
    penaltyDurationReduction: 0,
    statBonus: 0,
    rareDropThreshold: 50000,
    passiveGoldPerQuest: 0,
    corruptionRegen: 0,
    immunities: [],
    doubleDropChance: false,
    streakFreeze: false,
    streakSafeguard: false,
  },
  [Rank.D]: {
    label: 'CAÇADOR DESPERTO',
    xpMultiplier: 1.05,
    goldMultiplier: 1.05,
    corruptionReduction: 0.05,
    maxDailyDrops: 3,
    shopDiscount: 0,
    penaltyDurationReduction: 0,
    statBonus: 0.05,
    rareDropThreshold: 50000,
    passiveGoldPerQuest: 0,
    corruptionRegen: 0,
    immunities: [],
    doubleDropChance: false,
    streakFreeze: true,
    streakSafeguard: false,
  },
  [Rank.C]: {
    label: 'MEMBRO DE ELITE',
    xpMultiplier: 1.10,
    goldMultiplier: 1.10,
    corruptionReduction: 0.10,
    maxDailyDrops: 4,
    shopDiscount: 0.05,
    penaltyDurationReduction: 0.15,
    statBonus: 0.10,
    rareDropThreshold: 40000,
    passiveGoldPerQuest: 0,
    corruptionRegen: 0,
    immunities: [],
    doubleDropChance: false,
    streakFreeze: true,
    streakSafeguard: false,
  },
  [Rank.B]: {
    label: 'CAÇADOR DE ALTO NÍVEL',
    xpMultiplier: 1.15,
    goldMultiplier: 1.20,
    corruptionReduction: 0.15,
    maxDailyDrops: 5,
    shopDiscount: 0.10,
    penaltyDurationReduction: 0.25,
    statBonus: 0.15,
    rareDropThreshold: 35000,
    passiveGoldPerQuest: 50,
    corruptionRegen: 0,
    immunities: [],
    doubleDropChance: false,
    streakFreeze: true,
    streakSafeguard: true,
  },
  [Rank.A]: {
    label: 'REI DOS CAÇADORES',
    xpMultiplier: 1.25,
    goldMultiplier: 1.30,
    corruptionReduction: 0.25,
    maxDailyDrops: 6,
    shopDiscount: 0.15,
    penaltyDurationReduction: 0.40,
    statBonus: 0.20,
    rareDropThreshold: 30000,
    passiveGoldPerQuest: 150,
    corruptionRegen: 2,
    immunities: ['block_rewards'],
    doubleDropChance: false,
    streakFreeze: true,
    streakSafeguard: true,
  },
  [Rank.S]: {
    label: 'MONARCA DAS SOMBRAS',
    xpMultiplier: 1.35,
    goldMultiplier: 1.40,
    corruptionReduction: 0.35,
    maxDailyDrops: 8,
    shopDiscount: 0.20,
    penaltyDurationReduction: 0.50,
    statBonus: 0.30,
    rareDropThreshold: 25000,
    passiveGoldPerQuest: 300,
    corruptionRegen: 5,
    immunities: ['block_rewards', 'corruption_spike'],
    doubleDropChance: true,
    streakFreeze: true,
    streakSafeguard: true,
  },
};

export const getRankBenefits = (rank: Rank): RankBenefits => RANK_BENEFITS[rank];

// ─── STATS CALCULATION ────────────────────────────────────────────────

export const calculateStats = (
  level: number, 
  allocatedStats: { strength: number; agility: number; vitality: number; intelligence: number; sense: number } = { strength: 0, agility: 0, vitality: 0, intelligence: 0, sense: 0 }
): HunterStats => {
  const baseValue = level;
  const rank = getRankByLevel(level);
  const rankBonusMultiplier = RANK_BENEFITS[rank].statBonus;

  const buildDetailedStat = (base: number, allocated: number): DetailedStat => {
    const rawTotal = base + allocated;
    const rankBonus = Math.floor(rawTotal * rankBonusMultiplier);
    return {
      base: rawTotal,
      bonus: rankBonus,
      total: rawTotal + rankBonus
    };
  };

  return {
    strength: buildDetailedStat(baseValue, allocatedStats.strength),
    agility: buildDetailedStat(baseValue, allocatedStats.agility),
    vitality: buildDetailedStat(baseValue, allocatedStats.vitality),
    intelligence: buildDetailedStat(baseValue, allocatedStats.intelligence),
    sense: buildDetailedStat(baseValue, allocatedStats.sense),
  };
};

// ─── REWARDS CALCULATION ──────────────────────────────────────────────

export const calculateQuestRewards = (quest: Quest, profile: HunterProfile) => {
  const rankBenefits = RANK_BENEFITS[profile.rank];
  const streakMultiplier = getStreakMultiplier(profile.dailyStreak || 0);
  
  // Buffs de XP
  const xpBuffs = profile.activeBuffs.filter(b => b.slug === 'buff-xp-boost').length;
  const shadowEssenceBuffs = profile.activeBuffs.filter(b => b.slug === 'buff-shadow-essence').length;
  const intTotal = (profile.stats.intelligence?.base || 0) + (profile.stats.intelligence?.bonus || 0);
  const statXpBoost = intTotal * 0.01;
  
  const xpMultiplier = (rankBenefits.xpMultiplier + (xpBuffs * 0.05) + (shadowEssenceBuffs * 0.02) + statXpBoost) * streakMultiplier;
  const xpReward = Math.floor(quest.xpReward * xpMultiplier);

  // Buffs de Gold
  const orbBuffs = profile.activeBuffs.filter(b => b.slug === 'buff-orb').length;
  const ringBuffs = profile.activeBuffs.filter(b => b.slug === 'buff-ring').length;
  const strTotal = (profile.stats.strength?.base || 0) + (profile.stats.strength?.bonus || 0);
  const statGoldBoost = strTotal * 0.01;
  
  const goldMultiplier = (rankBenefits.goldMultiplier + (orbBuffs * 0.1) + (ringBuffs * 0.05) + (shadowEssenceBuffs * 0.02) + statGoldBoost) * streakMultiplier;
  const goldReward = Math.floor(quest.goldReward * goldMultiplier);

  return { xpReward, goldReward, xpMultiplier, goldMultiplier };
};

export const DEFAULT_STORE_ITEMS: StoreItem[] = [
  {
    id: 'potion-1',
    name: 'Poção de Cura de Vida',
    description: 'Um item consumível que remove 20% da corrupção atual instantaneamente.',
    cost: 400,
    purchasedCount: 0,
    rarity: ItemRarity.COMUM
  },
  {
    id: 'elixir-vida-1',
    name: 'Elixir da Vida',
    description: 'Restaura instantaneamente 50% da Sincronia (XP) e remove toda a corrupção.',
    cost: 10000,
    purchasedCount: 0,
    rarity: ItemRarity.ÉPICO
  },
  {
    id: 'scroll-1',
    name: 'Pergaminho de Purificação',
    description: 'Item de emergência. Limpa toda a corrupção e cancela uma Missão de Sobrevivência.',
    cost: 7500,
    purchasedCount: 0,
    rarity: ItemRarity.RARO
  },
  {
    id: 'armor-1',
    name: 'Manto do Monarca das Sombras',
    description: 'Relíquia Lendária. Reduz o dreno de recursos da Zona de Penalidade em 50%. Acumulável.',
    cost: 50000,
    purchasedCount: 0,
    rarity: ItemRarity.LENDÁRIO
  },
  {
    id: 'orb-1',
    name: 'Orbe da Ganância',
    description: 'Aumenta permanentemente o ouro recebido em todas as missões em 10%. Acumulável.',
    cost: 35000,
    purchasedCount: 0,
    rarity: ItemRarity.RARO
  },
  {
    id: 'potion-2',
    name: 'Poção de Mana Menor',
    description: 'Remove 10% da corrupção atual.',
    cost: 200,
    purchasedCount: 0,
    rarity: ItemRarity.COMUM
  },
  {
    id: 'potion-3',
    name: 'Poção de Mana Mestre',
    description: 'Remove 50% da corrupção atual.',
    cost: 1500,
    purchasedCount: 0,
    rarity: ItemRarity.INCOMUM
  },
  {
    id: 'xp-boost-1',
    name: 'Incenso de Meditação',
    description: 'Aumenta permanentemente o XP recebido em 5%. Acumulável.',
    cost: 25000,
    purchasedCount: 0,
    rarity: ItemRarity.RARO
  },
  {
    id: 'crystal-1',
    name: 'Cristal de Mana Puro',
    description: 'Concede 5.000 XP instantaneamente.',
    cost: 2000,
    purchasedCount: 0,
    rarity: ItemRarity.INCOMUM
  },
  {
    id: 'star-fragment-1',
    name: 'Fragmento de Estrela',
    description: 'Concede 2.000 XP e remove 10% de corrupção instantaneamente.',
    cost: 1500,
    purchasedCount: 0,
    rarity: ItemRarity.INCOMUM
  },
  {
    id: 'hourglass-1',
    name: 'Relógio de Areia do Tempo',
    description: 'Reduz o tempo de purificação atual em 4 horas.',
    cost: 3000,
    purchasedCount: 0,
    rarity: ItemRarity.RARO
  },
  {
    id: 'feather-1',
    name: 'Pena de Fênix',
    description: 'Restaura 25% da Sincronia (XP) atual.',
    cost: 5000,
    purchasedCount: 0,
    rarity: ItemRarity.RARO
  },
  {
    id: 'courage-1',
    name: 'Prova de Coragem',
    description: 'Eleva seu nível em +1 instantaneamente.',
    cost: 15000,
    purchasedCount: 0,
    rarity: ItemRarity.ÉPICO
  },
  {
    id: 'shadow-essence-1',
    name: 'Essência de Sombra',
    description: 'Aumenta permanentemente todos os ganhos em 2%. Acumulável.',
    cost: 40000,
    purchasedCount: 0,
    rarity: ItemRarity.LENDÁRIO
  },
  {
    id: 'pendant-1',
    name: 'Pingente do Viajante',
    description: 'Reduz o ganho de corrupção em 5% permanentemente. Acumulável.',
    cost: 20000,
    purchasedCount: 0,
    rarity: ItemRarity.RARO
  },
  {
    id: 'elixir-1',
    name: 'Elixir do Caçador',
    description: 'Remove 5% de corrupção e concede 1.000 XP.',
    cost: 800,
    purchasedCount: 0,
    rarity: ItemRarity.COMUM
  },
  {
    id: 'ring-1',
    name: 'Anel de Midas',
    description: 'Aumenta permanentemente o ouro recebido em 5%. Acumulável.',
    cost: 15000,
    purchasedCount: 0,
    rarity: ItemRarity.RARO
  },
  {
    id: 'scroll-2',
    name: 'Pergaminho de Proteção',
    description: 'Bloqueia o próximo aumento de corrupção.',
    cost: 1200,
    purchasedCount: 0,
    rarity: ItemRarity.COMUM
  },
  {
    id: 'stone-1',
    name: 'Pedra de Mana Instável',
    description: 'Concede entre 1.000 e 10.000 XP aleatoriamente.',
    cost: 3000,
    purchasedCount: 0,
    rarity: ItemRarity.RARO
  },
  {
    id: 'contract-1',
    name: 'Contrato de Sombra',
    description: 'Reduz permanentemente o custo de todos os itens na loja em 1%. Acumulável.',
    cost: 60000,
    purchasedCount: 0,
    rarity: ItemRarity.MÍTICO
  },
  {
    id: 'elixir-str',
    name: 'Elixir da Força',
    description: 'Aumenta permanentemente sua FORÇA base em +1 ponto.',
    cost: 10000,
    purchasedCount: 0,
    rarity: ItemRarity.ÉPICO
  },
  {
    id: 'elixir-agi',
    name: 'Elixir da Agilidade',
    description: 'Aumenta permanentemente sua AGILIDADE base em +1 ponto.',
    cost: 10000,
    purchasedCount: 0,
    rarity: ItemRarity.ÉPICO
  },
  {
    id: 'elixir-vit',
    name: 'Elixir da Vitalidade',
    description: 'Aumenta permanentemente sua VITALIDADE base em +1 ponto.',
    cost: 10000,
    purchasedCount: 0,
    rarity: ItemRarity.ÉPICO
  },
  {
    id: 'elixir-int',
    name: 'Elixir da Inteligência',
    description: 'Aumenta permanentemente sua INTELIGÊNCIA base em +1 ponto.',
    cost: 10000,
    purchasedCount: 0,
    rarity: ItemRarity.ÉPICO
  },
  {
    id: 'elixir-per',
    name: 'Elixir da Percepção',
    description: 'Aumenta permanentemente sua PERCEPÇÃO base em +1 ponto.',
    cost: 10000,
    purchasedCount: 0,
    rarity: ItemRarity.ÉPICO
  }
];
