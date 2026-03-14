
import { Rank, QuestDifficulty, StoreItem } from './types';

export const RANK_COLORS: Record<Rank, string> = {
  [Rank.E]: 'text-slate-500 border-slate-500',
  [Rank.D]: 'text-teal-500 border-teal-500 neon-text-green',
  [Rank.C]: 'text-blue-500 border-blue-500 neon-text-blue',
  [Rank.B]: 'text-amber-500 border-amber-500 neon-text-lime',
  [Rank.A]: 'text-orange-500 border-orange-500 neon-text-orange',
  [Rank.S]: 'text-red-500 border-red-500 font-bold neon-text-red animate-pulse',
};

// Valores base sem o buff de 15%
export const DIFFICULTY_XP: Record<QuestDifficulty, number> = {
  [QuestDifficulty.E]: 400,
  [QuestDifficulty.D]: 1200,
  [QuestDifficulty.C]: 3800,
  [QuestDifficulty.B]: 10000,
  [QuestDifficulty.A]: 30000,
  [QuestDifficulty.S]: 85000,
};

// Valores base sem o buff de 15%
export const DIFFICULTY_GOLD: Record<QuestDifficulty, number> = {
  [QuestDifficulty.E]: 80,
  [QuestDifficulty.D]: 280,
  [QuestDifficulty.C]: 850,
  [QuestDifficulty.B]: 2500,
  [QuestDifficulty.A]: 8500,
  [QuestDifficulty.S]: 38000,
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
  return Math.floor(1000 * level + 60 * Math.pow(level, 2));
};

export const getRankByLevel = (level: number): Rank => {
  if (level >= 100) return Rank.S;
  if (level >= 80) return Rank.A;
  if (level >= 60) return Rank.B;
  if (level >= 40) return Rank.C;
  if (level >= 20) return Rank.D;
  return Rank.E;
};

export const calculateStats = (level: number) => {
  const base = 10;
  const growth = 1.2; // Retorno ao crescimento padrão
  return {
    strength: Math.floor(base + level * growth),
    agility: Math.floor(base + level * growth),
    vitality: Math.floor(base + level * growth),
    intelligence: Math.floor(base + level * growth),
    sense: Math.floor(base + level * growth),
  };
};

export const DEFAULT_STORE_ITEMS: StoreItem[] = [
  {
    id: 'potion-1',
    name: 'Poção de Cura de Vida',
    description: 'Um item consumível que remove 20% da corrupção atual instantaneamente.',
    cost: 400,
    purchasedCount: 0
  },
  {
    id: 'key-1',
    name: 'Chave de Dungeon Instantânea',
    description: 'Concede o direito a 30 minutos de lazer total sem culpa. O Sistema entra em modo de espera.',
    cost: 1000,
    purchasedCount: 0
  },
  {
    id: 'scroll-1',
    name: 'Pergaminho de Purificação',
    description: 'Item de emergência. Limpa toda a corrupção e cancela uma Missão de Sobrevivência.',
    cost: 7500,
    purchasedCount: 0
  },
  {
    id: 'armor-1',
    name: 'Manto do Monarca das Sombras',
    description: 'Relíquia Lendária. Reduz o dreno de recursos da Zona de Penalidade em 50%. Acumulável.',
    cost: 50000,
    purchasedCount: 0
  },
  {
    id: 'orb-1',
    name: 'Orbe da Ganância',
    description: 'Aumenta permanentemente o ouro recebido em todas as missões em 10%. Acumulável.',
    cost: 35000,
    purchasedCount: 0
  },
  {
    id: 'potion-2',
    name: 'Poção de Mana Menor',
    description: 'Remove 10% da corrupção atual.',
    cost: 200,
    purchasedCount: 0
  },
  {
    id: 'potion-3',
    name: 'Poção de Mana Mestre',
    description: 'Remove 50% da corrupção atual.',
    cost: 1500,
    purchasedCount: 0
  },
  {
    id: 'xp-boost-1',
    name: 'Incenso de Meditação',
    description: 'Aumenta permanentemente o XP recebido em 5%. Acumulável.',
    cost: 25000,
    purchasedCount: 0
  },
  {
    id: 'crystal-1',
    name: 'Cristal de Mana Puro',
    description: 'Concede 5.000 XP instantaneamente.',
    cost: 2000,
    purchasedCount: 0
  },
  {
    id: 'treasure-1',
    name: 'Baú de Ouro Antigo',
    description: 'Concede 5.000 Gold instantaneamente.',
    cost: 1500,
    purchasedCount: 0
  },
  {
    id: 'hourglass-1',
    name: 'Relógio de Areia do Tempo',
    description: 'Reduz o tempo de purificação atual em 4 horas.',
    cost: 3000,
    purchasedCount: 0
  },
  {
    id: 'feather-1',
    name: 'Pena de Fênix',
    description: 'Restaura 25% da Sincronia (XP) atual.',
    cost: 5000,
    purchasedCount: 0
  },
  {
    id: 'courage-1',
    name: 'Prova de Coragem',
    description: 'Eleva seu nível em +1 instantaneamente.',
    cost: 15000,
    purchasedCount: 0
  },
  {
    id: 'shadow-essence-1',
    name: 'Essência de Sombra',
    description: 'Aumenta permanentemente todos os ganhos em 2%. Acumulável.',
    cost: 40000,
    purchasedCount: 0
  },
  {
    id: 'pendant-1',
    name: 'Pingente do Viajante',
    description: 'Reduz o ganho de corrupção em 5% permanentemente. Acumulável.',
    cost: 20000,
    purchasedCount: 0
  },
  {
    id: 'elixir-1',
    name: 'Elixir do Caçador',
    description: 'Remove 5% de corrupção e concede 1.000 XP.',
    cost: 800,
    purchasedCount: 0
  },
  {
    id: 'ring-1',
    name: 'Anel de Midas',
    description: 'Aumenta permanentemente o ouro recebido em 5%. Acumulável.',
    cost: 15000,
    purchasedCount: 0
  },
  {
    id: 'scroll-2',
    name: 'Pergaminho de Proteção',
    description: 'Bloqueia o próximo aumento de corrupção.',
    cost: 1200,
    purchasedCount: 0
  },
  {
    id: 'stone-1',
    name: 'Pedra de Mana Instável',
    description: 'Concede entre 1.000 e 10.000 XP aleatoriamente.',
    cost: 3000,
    purchasedCount: 0
  },
  {
    id: 'contract-1',
    name: 'Contrato de Sombra',
    description: 'Reduz permanentemente o custo de todos os itens na loja em 1%. Acumulável.',
    cost: 60000,
    purchasedCount: 0
  }
];
