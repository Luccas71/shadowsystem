
import React, { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import {
  HunterProfile,
  Quest,
  Rank,
  QuestDifficulty,
  SystemMessage,
  StoreItem,
  Vice,
  ActiveBuff
} from './types';
import {
  RANK_COLORS,
  DIFFICULTY_XP,
  DIFFICULTY_GOLD,
  calculateMaxXp,
  calculateStats,
  getRankByLevel,
  DEFAULT_STORE_ITEMS
} from './constants';
import QuestCard from './components/QuestCard';
import ProfileEditor from './components/ProfileEditor';
import Store from './components/Store';
import Inventory from './components/Inventory';
import PenaltySystem from './components/PenaltySystem';
import StatusWindow from './components/StatusWindow';
import QuestCompletionOverlay from './components/QuestCompletionOverlay';
import SystemEffectOverlay, { EffectData } from './components/SystemEffectOverlay';
import LevelUpOverlay from './components/LevelUpOverlay';
import RankUpOverlay from './components/RankUpOverlay';
import AuthScreen from './components/AuthScreen';
import {
  Bell,
  Plus,
  Settings,
  Target,
  Activity,
  CalendarDays,
  Lock,
  Zap,
  ScrollText,
  HeartPulse,
  Coins,
  Package,
  ShoppingBag,
  Database,
  Clock,
  X,
  Check,
  Monitor,
  AlertTriangle,
  LogOut,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { persistenceService, AppData } from './services/persistenceService';

const INITIAL_PROFILE: HunterProfile = {
  name: "MONARCA ADORMECIDO",
  avatar: "https://picsum.photos/seed/monarch/400",
  level: 1,
  xp: 0,
  maxXp: calculateMaxXp(1),
  rank: Rank.E,
  title: "FRAGMENTO DE SOMBRA",
  gold: 0,
  corruption: 0,
  totalXpGained: 0,
  isPenaltyZoneActive: false,
  storeLockedUntil: 0,
  stats: calculateStats(1),
  activeBuffs: [],
  dailyItemDropsCount: 0,
  lastItemDropDate: ""
};

const XP_DROP_THRESHOLD = 50000;
const PENALTY_DURATION = 12 * 3600000; // 12 Horas em ms

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [profile, setProfile] = useState<HunterProfile>(INITIAL_PROFILE);

  const [quests, setQuests] = useState<Quest[]>([]);

  const [storeItems, setStoreItems] = useState<StoreItem[]>(DEFAULT_STORE_ITEMS);

  const [vices, setVices] = useState<Vice[]>([]);

  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'quests' | 'status' | 'penalties' | 'inventory' | 'store'>('quests');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [questForm, setQuestForm] = useState<{ isOpen: boolean }>({ isOpen: false });
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestDifficulty, setNewQuestDifficulty] = useState<QuestDifficulty>(QuestDifficulty.E);
  const [newQuestIsDaily, setNewQuestIsDaily] = useState(false);
  const [newQuestIsSpecial, setNewQuestIsSpecial] = useState(false);
  const [newQuestDeadline, setNewQuestDeadline] = useState<string>('');
  const [completingQuest, setCompletingQuest] = useState<{
    quest: Quest;
    rewards: { gold: number; xp: number; items: StoreItem[] };
  } | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number } | null>(null);
  const [rankUpData, setRankUpData] = useState<{ oldRank: Rank; newRank: Rank } | null>(null);
  const [activeEffect, setActiveEffect] = useState<EffectData | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const isOnline = useNetworkStatus();
  const processingQuestIds = React.useRef<Set<string>>(new Set());
  const hasUnsavedChanges = React.useRef(false);
  const isInitializing = React.useRef(true);
  const prevLevel = React.useRef<number>(profile.level);
  const prevRank = React.useRef<Rank>(profile.rank);

  // Watch for Level and Rank changes
  useEffect(() => {
    if (isInitializing.current || !dataLoaded) {
      prevLevel.current = profile.level;
      prevRank.current = profile.rank;
      return;
    }

    if (profile.level > prevLevel.current) {
      setLevelUpData({ oldLevel: prevLevel.current, newLevel: profile.level });
      prevLevel.current = profile.level;
    }

    if (profile.rank !== prevRank.current) {
      // Check if it's a rank UP (using simple logic or constants if needed, but here simple != is enough for trigger)
      setRankUpData({ oldRank: prevRank.current, newRank: profile.rank });
      prevRank.current = profile.rank;
    }
  }, [profile.level, profile.rank, dataLoaded]);

  const addSystemMessage = useCallback((text: string, type: SystemMessage['type'] = 'info') => {
    setMessages(prev => {
      // Prevent duplicate messages within 1 second
      if (prev.some(m => m.text === text && (Date.now() - m.timestamp < 1000))) {
        return prev;
      }
      const newMessage: SystemMessage = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        type,
        timestamp: Date.now()
      };
      return [newMessage, ...prev].slice(0, 4);
    });
  }, []);

  const updateCorruption = useCallback((increase: number, goldPenalty: number = 0) => {
    if (increase === 0 && goldPenalty === 0) return;

    setProfile(p => {
      // Check for protection scroll
      const hasProtection = p.activeBuffs.some(b => b.slug === 'buff-protection');
      if (hasProtection && increase > 0) {
        addSystemMessage("SISTEMA: PERGAMINHO DE PROTEÇÃO CONSUMIDO. CORRUPÇÃO BLOQUEADA.", "info");
        return {
          ...p,
          activeBuffs: p.activeBuffs.filter(b => b.slug !== 'buff-protection')
        };
      }

      // Pendant reduction
      const pendantBuffs = p.activeBuffs.filter(b => b.slug === 'buff-pendant').length;
      const reduction = 1 - (pendantBuffs * 0.05);
      const finalIncrease = Math.max(0, increase * reduction);

      const newCorruption = Math.min(100, p.corruption + finalIncrease);
      const shouldActivatePenalty = newCorruption >= 100;
      const now = Date.now();

      if (shouldActivatePenalty && !p.isPenaltyZoneActive) {
        const penalties: HunterProfile['penaltyType'][] = ['gold_drain', 'xp_drain', 'block_rewards', 'corruption_spike'];
        const randomPenalty = penalties[Math.floor(Math.random() * penalties.length)];

        addSystemMessage(`ALERTA: NÍVEL CRÍTICO DE CORRUPÇÃO. PROTOCOLO DE PURIFICAÇÃO ATIVADO: ${randomPenalty?.toUpperCase().replace('_', ' ')}`, "error");
        setActiveEffect({ type: 'penalty' });

        return {
          ...p,
          corruption: 100,
          gold: Math.max(0, p.gold - goldPenalty),
          isPenaltyZoneActive: true,
          penaltyEndTime: now + PENALTY_DURATION,
          penaltyType: randomPenalty
        };
      }

      return {
        ...p,
        corruption: newCorruption,
        gold: Math.max(0, p.gold - goldPenalty)
      };
    });
  }, [addSystemMessage]);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = Date.now();
      const today = new Date().toDateString();

      if (profile.isPenaltyZoneActive && profile.penaltyEndTime && now > profile.penaltyEndTime) {
        setProfile(p => ({
          ...p,
          isPenaltyZoneActive: false,
          corruption: 0,
          penaltyEndTime: undefined,
          penaltyType: undefined
        }));
        addSystemMessage("SISTEMA: PURIFICAÇÃO CONCLUÍDA. ESTABILIDADE DE MANA RESTAURADA.", "success");
        return;
      }

      if (profile.isPenaltyZoneActive) {
        setProfile(p => {
          const armorBuffs = p.activeBuffs.filter(b => b.slug === 'buff-armor').length;
          const drainReduction = Math.pow(0.5, armorBuffs); // Cada manto reduz em 50% o dreno restante

          switch (p.penaltyType) {
            case 'gold_drain': {
              const goldDrains = Math.ceil(p.gold * 0.0003 * drainReduction);
              return { ...p, gold: Math.max(0, p.gold - goldDrains) };
            }
            case 'xp_drain': {
              const xpDrains = Math.ceil(p.maxXp * 0.0003 * drainReduction);
              return { ...p, xp: Math.max(0, p.xp - xpDrains) };
            }
            case 'corruption_spike': {
              const corruptionIncrease = 0.1;
              return { ...p, corruption: Math.min(100, p.corruption + corruptionIncrease) };
            }
            default:
              return p;
          }
        });
      }

      let updateRequired = false;
      let corruptionIncrease = 0;
      let goldPenaltyAtOnce = 0;

      const updatedQuests = quests.reduce((acc, q) => {
        // Special Quests Expiration Logic
        if (q.isSpecial && !q.completed && !q.failed) {
          const lastReset = q.createdAt ? new Date(q.createdAt).toDateString() : '';
          if (lastReset !== today) {
            updateRequired = true;
            corruptionIncrease += 10;
            addSystemMessage(`OPERAÇÃO URGENTE FALHA: ${q.title}. PUNIÇÃO DE MANA APLICADA.`, "error");
            // The quest just drops out of the array
            return acc;
          }
        } else if (q.isSpecial && q.completed) {
          const lastReset = q.createdAt ? new Date(q.createdAt).toDateString() : '';
          if (lastReset !== today) {
            updateRequired = true;
            // Just drops out of the array quietly
            return acc;
          }
        }

        if (!q.isDaily && !q.completed && !q.failed && !q.isSpecial && q.deadline && now > q.deadline) {
          updateRequired = true;
          corruptionIncrease += 12;
          goldPenaltyAtOnce += Math.floor(profile.gold * 0.05);
          addSystemMessage(`DIRETRIZ FALHA: ${q.title}. PUNIÇÃO DE MANA APLICADA.`, "error");
          acc.push({ ...q, failed: true });
          return acc;
        }

        if (q.isDaily) {
          const lastReset = q.lastResetAt ? new Date(q.lastResetAt).toDateString() : '';
          if (lastReset !== today) {
            updateRequired = true;
            if (!q.completed) {
              corruptionIncrease += 10;
              addSystemMessage(`SISTEMA: TREINAMENTO DIÁRIO "${q.title}" NEGLIGENCIADO.`, "error");
            } else {
              addSystemMessage(`SISTEMA: CICLO DIÁRIO REINICIADO PARA "${q.title}".`, "info");
            }

            acc.push({
              ...q,
              completed: false,
              failed: false,
              lastResetAt: now,
              subQuests: q.subQuests?.map(sq => ({ ...sq, completed: false })) || []
            });
            return acc;
          }
        }

        acc.push(q);
        return acc;
      }, [] as Quest[]);

      if (updateRequired || corruptionIncrease > 0) {
        setQuests(updatedQuests);
        updateCorruption(corruptionIncrease, goldPenaltyAtOnce);
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [quests, profile, updateCorruption, addSystemMessage]);

  // Load Initial Data (Offline First)
  useEffect(() => {
    if (authLoading) return;

    const initializeData = async () => {
      isInitializing.current = true;
      setDataLoaded(false);

      // 1. skip local storage immediately to ensure cloud data is the only source
      /* 
      const localData = persistenceService.loadLocal();
      if (localData) {
        setProfile(localData.profile);
        setQuests(localData.quests);
        setStoreItems(localData.storeItems);
        setVices(localData.vices);
        addSystemMessage("SISTEMA: DADOS LOCAIS CARREGADOS.", "info");
      }
      */

      if (!session?.user) {
        // For guest users, we still use local data but clearly it's not "cloud"
        const localData = persistenceService.loadLocal();
        if (localData) {
          setProfile(localData.profile);
          setQuests(localData.quests);
          setStoreItems(localData.storeItems);
          setVices(localData.vices);
        }
        isInitializing.current = false;
        setDataLoaded(true);
        return;
      }

      // 2. If online, sync with cloud
      if (isOnline) {
        await syncWithCloud();
      } else {
        const localData = persistenceService.loadLocal();
        if (localData) {
          setProfile(localData.profile);
          setQuests(localData.quests);
          setStoreItems(localData.storeItems);
          setVices(localData.vices);
        }
        addSystemMessage("SISTEMA: MODO OFFLINE ATIVADO. AS ALTERAÇÕES SERÃO SINCRONIZADAS POSTERIORMENTE.", "warning");
      }

      isInitializing.current = false;
      setDataLoaded(true);
    };

    const syncWithCloud = async () => {
      if (!session?.user) return;

      try {
        setIsSyncing(true);
        const { data: cloudData, error } = await supabase
          .from('user_saves')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("SISTEMA ERRO: Falha ao buscar dados na nuvem", error);
          return;
        }

        if (cloudData) {
          // Cloud is the absolute source of truth
          const cloudProfile = cloudData.profile || INITIAL_PROFILE;
          setProfile(cloudProfile);
          setQuests(cloudData.quests || []);

          const cloudStore: StoreItem[] = cloudData.store_items || DEFAULT_STORE_ITEMS;
          const mergedStore = [...cloudStore];
          DEFAULT_STORE_ITEMS.forEach(defaultItem => {
            if (!mergedStore.some(item => item.id === defaultItem.id)) mergedStore.push(defaultItem);
          });
          setStoreItems(mergedStore);
          setVices(cloudData.vices || []);

          persistenceService.saveLocal({
            profile: cloudProfile,
            quests: cloudData.quests || [],
            storeItems: mergedStore,
            vices: cloudData.vices || [],
            lastUpdate: cloudData.updated_at
          });

          addSystemMessage("SISTEMA: DADOS SINCRONIZADOS COM A NUVEM.", "success");
        } else {
          // No cloud data exists: Initialize new clean save
          const initialData = {
            user_id: session.user.id,
            profile: INITIAL_PROFILE,
            quests: [],
            store_items: DEFAULT_STORE_ITEMS,
            vices: [],
            updated_at: new Date().toISOString()
          };
          await supabase.from('user_saves').insert(initialData);
          setProfile(INITIAL_PROFILE);
          setQuests([]);
          setStoreItems(DEFAULT_STORE_ITEMS);
          setVices([]);
          persistenceService.saveLocal({
            profile: INITIAL_PROFILE,
            quests: [],
            storeItems: DEFAULT_STORE_ITEMS as StoreItem[],
            vices: [],
            lastUpdate: initialData.updated_at
          });
          addSystemMessage("SISTEMA: NOVO REGISTRO DE CAÇADOR INICIALIZADO.", "success");
        }
      } catch (err) {
        console.error("SISTEMA ERRO", err);
      } finally {
        setIsSyncing(false);
      }
    };

    initializeData();
  }, [session, authLoading]);

  // Handle auto-sync when back online
  useEffect(() => {
    if (isOnline && dataLoaded && session?.user && hasUnsavedChanges.current) {
      addSystemMessage("SISTEMA: CONEXÃO RESTAURADA. SINCRONIZANDO...", "info");
      saveToCloud();
    } else if (!isOnline && dataLoaded) {
      addSystemMessage("SISTEMA: CONEXÃO PERDIDA. MODO OFFLINE ATIVADO.", "warning");
    }
  }, [isOnline, dataLoaded, session]);

  // Save to Cloud Function
  const saveToCloud = async () => {
    if (!session?.user || isInitializing.current) return;

    // Safety check: Don't overwrite if local data is Level 1 but we suspect we have cloud data
    // This is a secondary guard in case sync failed or is still pending
    if (profile.level === 1 && quests.length === 0) {
      console.warn("SISTEMA: Tentativa de salvar perfil inicial bloqueada por segurança.");
      return;
    }

    try {
      setIsSyncing(true);
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('user_saves')
        .upsert({
          user_id: session.user.id,
          profile: { ...profile, lastUpdate: now },
          quests,
          store_items: storeItems,
          vices,
          updated_at: now
        });

      if (error) throw error;
      setLastSynced(new Date());
      hasUnsavedChanges.current = false;
    } catch (err) {
      console.error("SISTEMA ERRO: Falha ao salvar na nuvem.", err);
      hasUnsavedChanges.current = true;
    } finally {
      setIsSyncing(false);
    }
  };

  // Local Save + Mark for Cloud Sync
  useEffect(() => {
    if (!dataLoaded || isInitializing.current || isSyncing) return;

    persistenceService.saveLocal({
      profile,
      quests,
      storeItems,
      vices,
      lastUpdate: new Date().toISOString()
    });

    if (session?.user) {
      hasUnsavedChanges.current = true;
      const handler = setTimeout(() => {
        if (isOnline) {
          saveToCloud();
        }
      }, 2000); // 2 second debounce for cloud sync
      return () => clearTimeout(handler);
    }
  }, [profile, quests, storeItems, vices]);

  const handleToggleComplete = (id: string) => {
    if (processingQuestIds.current.has(id)) return;

    const quest = quests.find(qu => qu.id === id);
    if (quest && !quest.completed && !quest.failed) {
      // Check for block_rewards penalty
      if (profile.isPenaltyZoneActive && profile.penaltyType === 'block_rewards') {
        addSystemMessage("SISTEMA: PENALIDADE ATIVA. GANHO DE RECOMPENSAS BLOQUEADO.", "error");
        return;
      }

      processingQuestIds.current.add(id);

      const currentTotalXp = profile.totalXpGained;

      // Calculate XP Multiplier from buffs
      const xpBuffs = profile.activeBuffs.filter(b => b.slug === 'buff-xp-boost').length;
      const shadowEssenceBuffs = profile.activeBuffs.filter(b => b.slug === 'buff-shadow-essence').length;
      const xpMultiplier = 1 + (xpBuffs * 0.05) + (shadowEssenceBuffs * 0.02);

      const finalXpReward = Math.floor(quest.xpReward * xpMultiplier);
      const newTotalXp = currentTotalXp + finalXpReward;

      let newXp = profile.xp + finalXpReward;
      let newLevel = profile.level;
      let newMaxXp = profile.maxXp;
      let levelsGained = 0;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel++;
        newMaxXp = calculateMaxXp(newLevel);
        levelsGained++;
      }

      // Calculate Gold Multiplier from buffs
      const orbBuffs = profile.activeBuffs.filter(b => b.slug === 'buff-orb').length;
      const ringBuffs = profile.activeBuffs.filter(b => b.slug === 'buff-ring').length;
      const goldMultiplier = 1 + (orbBuffs * 0.1) + (ringBuffs * 0.05) + (shadowEssenceBuffs * 0.02);

      const finalGoldReward = Math.floor(quest.goldReward * goldMultiplier);

      // Random Item Drop System (Max 2 per day)
      const today = new Date().toDateString();
      const lastDropDate = profile.lastItemDropDate || '';
      let dailyDrops = lastDropDate === today ? (profile.dailyItemDropsCount || 0) : 0;

      const questDrops: StoreItem[] = [];
      if (dailyDrops < 2) {
        // Chance of drop based on difficulty
        const dropChances: Record<QuestDifficulty, number> = {
          [QuestDifficulty.E]: 0.05,
          [QuestDifficulty.D]: 0.10,
          [QuestDifficulty.C]: 0.20,
          [QuestDifficulty.B]: 0.35,
          [QuestDifficulty.A]: 0.50,
          [QuestDifficulty.S]: 0.80,
        };

        const chance = dropChances[quest.difficulty];
        if (Math.random() < chance) {
          const randomIdx = Math.floor(Math.random() * storeItems.length);
          const droppedItem = storeItems[randomIdx];
          questDrops.push(droppedItem);
          dailyDrops += 1;
          addSystemMessage(`SISTEMA: ITEM ENCONTRADO! ${droppedItem.name.toUpperCase()}`, 'warning');
        }
      }

      const levelDrops: StoreItem[] = [];
      if (levelsGained > 0) {
        for (let i = 0; i < levelsGained; i++) {
          const randomIdx = Math.floor(Math.random() * storeItems.length);
          levelDrops.push(storeItems[randomIdx]);
        }
        levelDrops.forEach(d => addSystemMessage(`DROP DO SISTEMA: ${d.name.toUpperCase()} ADQUIRIDO!`, 'success'));
        addSystemMessage(`VOCÊ SUBIU DE NÍVEL! NÍVEL ATUAL: ${newLevel}`, 'success');
      }

      const oldMilestones = Math.floor(currentTotalXp / XP_DROP_THRESHOLD);
      const newMilestones = Math.floor(newTotalXp / XP_DROP_THRESHOLD);
      const rareDrops: StoreItem[] = [];

      if (newMilestones > oldMilestones) {
        const milestonesEarned = newMilestones - oldMilestones;
        const rarePool = storeItems.filter(item => item.cost >= 5000);
        const fallbackPool = storeItems;

        for (let i = 0; i < milestonesEarned; i++) {
          const pool = rarePool.length > 0 ? rarePool : fallbackPool;
          const randomIdx = Math.floor(Math.random() * pool.length);
          rareDrops.push(pool[randomIdx]);
        }
        rareDrops.forEach(d => addSystemMessage(`SISTEMA: RECOMPENSA DE XP ACUMULADO! ARTEFATO RARO ENCONTRADO: ${d.name.toUpperCase()}!`, 'warning'));
      }

      const allDrops = [...levelDrops, ...rareDrops, ...questDrops];
      if (allDrops.length > 0) {
        setStoreItems(prev => prev.map(si => {
          const count = allDrops.filter(d => d.id === si.id).length;
          return count > 0 ? { ...si, purchasedCount: si.purchasedCount + count } : si;
        }));
      }

      setCompletingQuest({
        quest,
        rewards: {
          gold: finalGoldReward,
          xp: finalXpReward,
          items: questDrops // We only show quest drops in the animation to avoid cluttering, or we can show allDrops
        }
      });

      setProfile(p => ({
        ...p,
        xp: newXp,
        level: newLevel,
        maxXp: newMaxXp,
        totalXpGained: newTotalXp,
        rank: getRankByLevel(newLevel),
        stats: calculateStats(newLevel),
        gold: p.gold + finalGoldReward,
        dailyItemDropsCount: dailyDrops,
        lastItemDropDate: today
      }));

      setQuests(prev => prev.map(qu => qu.id === id ? { ...qu, completed: true, completedAt: Date.now() } : qu));
      addSystemMessage(`QUEST CONCLUÍDA. RECOMPENSA: +${finalGoldReward} OURO.`, 'success');
    }
  };

  const handleDeleteQuest = (id: string) => {
    const questToDelete = quests.find(q => q.id === id);
    if (questToDelete && !questToDelete.completed && !questToDelete.failed) {
      updateCorruption(5);
      addSystemMessage("SISTEMA: DIRETRIZ ABANDONADA. INSTABILIDADE DE MANA DETECTADA (+5%).", "warning");
    }
    setQuests(prev => prev.filter(qu => qu.id !== id));
  };

  const handleUseItem = (item: StoreItem) => {
    if (item.purchasedCount <= 0) {
      addSystemMessage("SISTEMA: QUANTIDADE INSUFICIENTE.", "error");
      return;
    }

    let subtitle = "";
    switch (item.id) {
      case 'potion-1': subtitle = "VITALIDADE RESTAURADA (-20% CORRUPÇÃO)"; break;
      case 'potion-2': subtitle = "MANA ESTABILIZADA (-10% CORRUPÇÃO)"; break;
      case 'potion-3': subtitle = "PURIFICAÇÃO PARCIAL (-50% CORRUPÇÃO)"; break;
      case 'scroll-1': subtitle = "PURIFICAÇÃO COMPLETA REALIZADA"; break;
      case 'key-1': subtitle = "MODO DE ESPERA ATIVADO (30 MIN)"; break;
      case 'armor-1': subtitle = "PROTEÇÃO DO MONARCA EQUIPADA"; break;
      case 'orb-1': subtitle = "AVAREZA DO CAÇADOR ATIVADA (+10% OURO)"; break;
      case 'ring-1': subtitle = "ANEL DE MIDAS EQUIPADO (+5% OURO)"; break;
      case 'xp-boost-1': subtitle = "INCENSO DE MEDITAÇÃO ACESO (+5% XP)"; break;
      case 'shadow-essence-1': subtitle = "ESSÊNCIA DE SOMBRA ABSORVIDA (+2% GANHOS)"; break;
      case 'pendant-1': subtitle = "PINGENTE DO VIAJANTE EQUIPADO (-5% CORRUPÇÃO)"; break;
      case 'scroll-2': subtitle = "ESCUDO DE MANA ATIVADO"; break;
      case 'crystal-1': subtitle = "CRISTAL DE MANA CONSUMIDO (+5.000 XP)"; break;
      case 'treasure-1': subtitle = "TESOURO REIVINDICADO (+5.000 GOLD)"; break;
      case 'hourglass-1': subtitle = "TEMPO DE PURIFICAÇÃO ACELERADO (-4H)"; break;
      case 'feather-1': subtitle = "SINCRONIA RESTAURADA (+25% XP)"; break;
      case 'courage-1': subtitle = "PROVA DE CORAGEM SUPERADA (NÍVEL +1)"; break;
      case 'stone-1': subtitle = "PEDRA INSTÁVEL CONSUMIDA (XP ALEATÓRIO)"; break;
      case 'elixir-1': subtitle = "ELIXIR DO CAÇADOR CONSUMIDO"; break;
      case 'contract-1': subtitle = "CONTRATO DE SOMBRA ASSINADO (-1% CUSTO)"; break;
      default: subtitle = "ARTEFATO ATIVADO COM SUCESSO";
    }

    setActiveEffect({
      type: 'useItem',
      title: item.name,
      subtitle: subtitle,
      icon: <span className="text-4xl">{item.icon || '✨'}</span>
    });

    setStoreItems(prev => prev.map(si =>
      si.id === item.id ? { ...si, purchasedCount: si.purchasedCount - 1 } : si
    ));

    setProfile(p => {
      const updates: Partial<HunterProfile> = {};
      const buffs = [...p.activeBuffs];

      switch (item.id) {
        case 'potion-1':
          updates.corruption = Math.max(0, p.corruption - 20);
          addSystemMessage("SISTEMA: VITALIDADE RESTAURADA (-20% CORRUPÇÃO).", "success");
          break;
        case 'potion-2':
          updates.corruption = Math.max(0, p.corruption - 10);
          addSystemMessage("SISTEMA: MANA ESTABILIZADA (-10% CORRUPÇÃO).", "success");
          break;
        case 'potion-3':
          updates.corruption = Math.max(0, p.corruption - 50);
          addSystemMessage("SISTEMA: PURIFICAÇÃO PARCIAL (-50% CORRUPÇÃO).", "success");
          break;
        case 'scroll-1':
          updates.corruption = 0;
          updates.isPenaltyZoneActive = false;
          updates.penaltyEndTime = undefined;
          updates.penaltyType = undefined;
          addSystemMessage("SISTEMA: PURIFICAÇÃO COMPLETA REALIZADA.", "success");
          break;
        case 'key-1': {
          const timedBuff: ActiveBuff = {
            id: `timed-key-${Date.now()}`,
            name: "MODO DE ESPERA",
            description: "Punições suspensas temporariamente.",
            type: 'timed',
            icon: '⌛',
            endTime: Date.now() + (30 * 60 * 1000)
          };
          buffs.push(timedBuff);
          addSystemMessage("SISTEMA: MODO DE ESPERA ATIVADO (30 MIN).", "info");
          break;
        }
        case 'armor-1': {
          buffs.push({
            id: `buff-armor-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            slug: 'buff-armor',
            name: "PROTEÇÃO DO MONARCA",
            description: "Reduz o dreno da zona de penalidade.",
            type: 'passive',
            icon: '🛡️'
          });
          addSystemMessage("SISTEMA: MANTO EQUIPADO. PROTEÇÃO AUMENTADA.", "success");
          break;
        }
        case 'orb-1':
          buffs.push({
            id: `buff-orb-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            slug: 'buff-orb',
            name: "AVAREZA DO CAÇADOR",
            description: "Bônus de +10% de ouro em todas as quests.",
            type: 'passive',
            icon: '💎'
          });
          addSystemMessage("SISTEMA: ORBE INTEGRADO. GANHOS DE OURO AUMENTADOS.", "success");
          break;
        case 'ring-1':
          buffs.push({
            id: `buff-ring-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            slug: 'buff-ring',
            name: "ANEL DE MIDAS",
            description: "Bônus de +5% de ouro em todas as quests.",
            type: 'passive',
            icon: '💍'
          });
          addSystemMessage("SISTEMA: ANEL EQUIPADO. GANHOS DE OURO AUMENTADOS.", "success");
          break;
        case 'xp-boost-1':
          buffs.push({
            id: `buff-xp-boost-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            slug: 'buff-xp-boost',
            name: "INCENSO DE MEDITAÇÃO",
            description: "Bônus de +5% de XP em todas as quests.",
            type: 'passive',
            icon: '🕯️'
          });
          addSystemMessage("SISTEMA: INCENSO ACESO. FOCO AUMENTADO.", "success");
          break;
        case 'shadow-essence-1':
          buffs.push({
            id: `buff-shadow-essence-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            slug: 'buff-shadow-essence',
            name: "ESSÊNCIA DE SOMBRA",
            description: "Bônus de +2% em todos os ganhos.",
            type: 'passive',
            icon: '🌑'
          });
          addSystemMessage("SISTEMA: ESSÊNCIA ABSORVIDA. PODER LATENTE DESPERTADO.", "success");
          break;
        case 'pendant-1':
          buffs.push({
            id: `buff-pendant-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            slug: 'buff-pendant',
            name: "PINGENTE DO VIAJANTE",
            description: "Reduz ganho de corrupção em 5%.",
            type: 'passive',
            icon: '📿'
          });
          addSystemMessage("SISTEMA: PINGENTE EQUIPADO. RESISTÊNCIA À CORRUPÇÃO AUMENTADA.", "success");
          break;
        case 'scroll-2':
          buffs.push({
            id: `buff-protection-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            slug: 'buff-protection',
            name: "ESCUDO DE MANA",
            description: "Bloqueia o próximo aumento de corrupção.",
            type: 'passive',
            icon: '📜'
          });
          addSystemMessage("SISTEMA: PERGAMINHO DE PROTEÇÃO ATIVADO.", "success");
          break;
        case 'crystal-1': {
          const xpGain = 5000;
          let newXp = p.xp + xpGain;
          let newLevel = p.level;
          let newMaxXp = p.maxXp;
          while (newXp >= newMaxXp) {
            newXp -= newMaxXp;
            newLevel++;
            newMaxXp = calculateMaxXp(newLevel);
          }
          updates.xp = newXp;
          updates.level = newLevel;
          updates.maxXp = newMaxXp;
          updates.rank = getRankByLevel(newLevel);
          updates.stats = calculateStats(newLevel);
          addSystemMessage("SISTEMA: CRISTAL DE MANA CONSUMIDO (+5.000 XP).", "success");
          break;
        }
        case 'treasure-1':
          updates.gold = p.gold + 5000;
          addSystemMessage("SISTEMA: TESOURO REIVINDICADO (+5.000 GOLD).", "success");
          break;
        case 'hourglass-1':
          if (p.isPenaltyZoneActive && p.penaltyEndTime) {
            updates.penaltyEndTime = p.penaltyEndTime - (4 * 3600000);
            addSystemMessage("SISTEMA: TEMPO DE PURIFICAÇÃO ACELERADO (-4H).", "info");
          } else {
            addSystemMessage("SISTEMA: O TEMPO FLUI NORMALMENTE AGORA.", "warning");
          }
          break;
        case 'feather-1':
          updates.xp = Math.min(p.maxXp, p.xp + Math.floor(p.maxXp * 0.25));
          addSystemMessage("SISTEMA: PENA DE FÊNIX CONSUMIDA. SINCRONIA RESTAURADA.", "success");
          break;
        case 'courage-1':
          updates.level = p.level + 1;
          updates.maxXp = calculateMaxXp(updates.level);
          updates.rank = getRankByLevel(updates.level);
          updates.stats = calculateStats(updates.level);
          addSystemMessage("SISTEMA: PROVA DE CORAGEM SUPERADA. NÍVEL AUMENTADO.", "success");
          break;
        case 'stone-1': {
          const randXp = Math.floor(Math.random() * 9001) + 1000;
          let sXp = p.xp + randXp;
          let sLevel = p.level;
          let sMaxXp = p.maxXp;
          while (sXp >= sMaxXp) {
            sXp -= sMaxXp;
            sLevel++;
            sMaxXp = calculateMaxXp(sLevel);
          }
          updates.xp = sXp;
          updates.level = sLevel;
          updates.maxXp = sMaxXp;
          updates.rank = getRankByLevel(sLevel);
          updates.stats = calculateStats(sLevel);
          addSystemMessage(`SISTEMA: PEDRA INSTÁVEL CONSUMIDA (+${randXp.toLocaleString()} XP).`, "warning");
          break;
        }
        case 'elixir-1': {
          updates.corruption = Math.max(0, p.corruption - 5);
          let eXp = p.xp + 1000;
          let eLevel = p.level;
          let eMaxXp = p.maxXp;
          while (eXp >= eMaxXp) {
            eXp -= eMaxXp;
            eLevel++;
            eMaxXp = calculateMaxXp(eLevel);
          }
          updates.xp = eXp;
          updates.level = eLevel;
          updates.maxXp = eMaxXp;
          updates.rank = getRankByLevel(eLevel);
          updates.stats = calculateStats(eLevel);
          addSystemMessage("SISTEMA: ELIXIR DO CAÇADOR CONSUMIDO.", "success");
          break;
        }
        case 'contract-1':
          buffs.push({
            id: `buff-contract-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            slug: 'buff-contract',
            name: "CONTRATO DE SOMBRA",
            description: "Reduz custo da loja em 1%.",
            type: 'passive',
            icon: '📜'
          });
          addSystemMessage("SISTEMA: CONTRATO ASSINADO. PRIVILÉGIOS DE COMPRA ATUALIZADOS.", "success");
          break;
        default:
          addSystemMessage(`SISTEMA: ARTEFATO ${item.name.toUpperCase()} CONSUMIDO.`, "info");
      }

      return { ...p, ...updates, activeBuffs: buffs };
    });
  };

  const handleAddItem = (newItem: Omit<StoreItem, 'id' | 'purchasedCount'>) => {
    const item: StoreItem = {
      ...newItem,
      id: Math.random().toString(36).substr(2, 9),
      purchasedCount: 0
    };
    setStoreItems(prev => [...prev, item]);
    addSystemMessage(`SISTEMA: ARTEFATO "${item.name.toUpperCase()}" REGISTRADO NO BANCO DE DADOS.`, 'success');
  };

  const handleRemoveItem = (id: string) => {
    setStoreItems(prev => prev.filter(item => item.id !== id));
    addSystemMessage("SISTEMA: ITEM REMOVIDO DO REGISTRO.", "info");
  };

  const handleToggleSubQuest = (questId: string, subId: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return {
          ...q,
          subQuests: q.subQuests.map(sq => sq.id === subId ? { ...sq, completed: !sq.completed } : sq)
        };
      }
      return q;
    }));
  };

  const handleAddSubQuest = (questId: string, title: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return {
          ...q,
          subQuests: [...(q.subQuests || []), { id: Math.random().toString(36).substr(2, 9), title, completed: false }]
        };
      }
      return q;
    }));
  };

  const handleRemoveSubQuest = (questId: string, subId: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return {
          ...q,
          subQuests: q.subQuests.filter(sq => sq.id !== subId)
        };
      }
      return q;
    }));
  };

  const handleEditQuest = (quest: Quest) => {
    setEditingQuest(quest);
    setNewQuestTitle(quest.title);
    setNewQuestDifficulty(quest.difficulty);
    setNewQuestIsDaily(!!quest.isDaily);
    setNewQuestIsSpecial(!!quest.isSpecial);
    setNewQuestDeadline(quest.deadline ? new Date(quest.deadline).toISOString().slice(0, 16) : '');
    setQuestForm({ isOpen: true });
  };

  const handleSaveQuest = () => {
    if (!newQuestTitle.trim()) return;

    if (!newQuestIsDaily && !newQuestIsSpecial && !newQuestDeadline) {
      addSystemMessage("SISTEMA: ERRO DE PROTOCOLO. QUESTS ÚNICAS EXIGEM UM PRAZO FINAL.", "error");
      return;
    }

    // PROTOCOLO 1.2: Restrição de Rank S
    if (newQuestDifficulty === QuestDifficulty.S && profile.rank !== Rank.S) {
      addSystemMessage("SISTEMA: APENAS UM MONARCA (RANK S) PODE MANIFESTAR DIRETRIZES DE RANK S.", "error");
      return;
    }

    let resolvedDeadline: number | undefined;
    if (newQuestIsSpecial) {
      // Set to 23:59:59 of today
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      resolvedDeadline = endOfDay.getTime();
    } else if (!newQuestIsDaily && newQuestDeadline) {
      resolvedDeadline = new Date(newQuestDeadline).getTime();
    }

    if (editingQuest) {
      setQuests(prev => prev.map(q => q.id === editingQuest.id ? {
        ...q,
        title: newQuestTitle.toUpperCase(),
        difficulty: newQuestDifficulty,
        deadline: resolvedDeadline,
        xpReward: DIFFICULTY_XP[newQuestDifficulty],
        goldReward: DIFFICULTY_GOLD[newQuestDifficulty],
      } : q));
      addSystemMessage("SISTEMA: DIRETRIZ RECALIBRADA.", "success");
    } else {
      const newQuest: Quest = {
        id: Math.random().toString(36).substr(2, 9),
        title: newQuestTitle.toUpperCase(),
        description: newQuestIsSpecial ? "Operação urgente (como ir ao mercado, pagar contas, etc) que expira hoje." : newQuestIsDaily ? "Treinamento diário de condicionamento." : "Desafio único de superação.",
        difficulty: newQuestDifficulty,
        xpReward: DIFFICULTY_XP[newQuestDifficulty],
        goldReward: DIFFICULTY_GOLD[newQuestDifficulty],
        completed: false,
        failed: false,
        isDaily: newQuestIsDaily,
        isSpecial: newQuestIsSpecial,
        deadline: resolvedDeadline,
        lastResetAt: newQuestIsDaily ? Date.now() : undefined,
        createdAt: Date.now(),
        subQuests: []
      };
      setQuests(prev => [newQuest, ...prev]);
      addSystemMessage(newQuestIsSpecial ? "SISTEMA: OPERAÇÃO URGENTE REGISTRADA." : "SISTEMA: NOVA DIRETRIZ REGISTRADA.", "success");
    }

    setQuestForm({ isOpen: false });
    resetForm();
  };

  const handleResetSystem = async () => {
    try {
      setProfile(INITIAL_PROFILE);
      setQuests([]);
      setStoreItems(DEFAULT_STORE_ITEMS.map(item => ({ ...item, purchasedCount: 0 })));
      setVices([]);

      if (session?.user) {
        await supabase
          .from('user_saves')
          .update({
            profile: INITIAL_PROFILE,
            quests: [],
            store_items: DEFAULT_STORE_ITEMS.map(item => ({ ...item, purchasedCount: 0 })),
            vices: [],
            updated_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id);
      }

      addSystemMessage("SISTEMA: REINICIALIZAÇÃO COMPLETA EXECUTADA. TODOS OS DADOS FORAM ZERADOS.", "error");
      setActiveEffect({ type: 'penalty' }); // Using penalty effect for dramatic reset feel
      setIsEditingProfile(false);
    } catch (err) {
      console.error("ERRO AO REINICIAR SISTEMA", err);
      addSystemMessage("SISTEMA: FALHA CRÍTICA NA REINICIALIZAÇÃO.", "error");
    }
  };

  const resetForm = () => {
    setEditingQuest(null);
    setNewQuestTitle('');
    setNewQuestIsDaily(false);
    setNewQuestIsSpecial(false);
    setNewQuestDeadline('');
    setNewQuestDifficulty(QuestDifficulty.E);
  };

  const xpPercentage = Math.min(100, Math.floor((profile.xp / profile.maxXp) * 100));
  const nextRareDropProgress = (profile.totalXpGained % XP_DROP_THRESHOLD) / XP_DROP_THRESHOLD * 100;
  const xpRemainingForDrop = XP_DROP_THRESHOLD - (profile.totalXpGained % XP_DROP_THRESHOLD);

  const isFormInvalid = !newQuestTitle.trim() || (!newQuestIsDaily && !newQuestIsSpecial && !newQuestDeadline);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-800 border-t-emerald-400 rounded-full animate-spin"></div>
          <p className="font-game text-[11px] text-emerald-700 tracking-[0.3em] uppercase">INICIALIZANDO SISTEMA...</p>
        </div>
      </div>
    );
  }

  // Auth screen if not logged in
  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen pb-24 pt-6 md:pt-10 px-4 md:px-12 max-w-[95%] lg:max-w-[1300px] mx-auto relative z-10 overflow-x-hidden">

      {completingQuest && (
        <QuestCompletionOverlay
          difficulty={completingQuest.quest.difficulty}
          title={completingQuest.quest.title}
          rewards={completingQuest.rewards}
          onComplete={() => setCompletingQuest(null)}
        />
      )}

      {isEditingProfile && (
        <ProfileEditor
          profile={profile}
          onSave={(updates) => setProfile(p => ({ ...p, ...updates }))}
          onReset={handleResetSystem}
          onClose={() => setIsEditingProfile(false)}
        />
      )}

      <SystemEffectOverlay
        effect={activeEffect}
        onComplete={() => setActiveEffect(null)}
      />

      {levelUpData && (
        <LevelUpOverlay
          oldLevel={levelUpData.oldLevel}
          newLevel={levelUpData.newLevel}
          onComplete={() => setLevelUpData(null)}
        />
      )}

      {rankUpData && (
        <RankUpOverlay
          oldRank={rankUpData.oldRank}
          newRank={rankUpData.newRank}
          onComplete={() => setRankUpData(null)}
        />
      )}


      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
          <Monitor size={14} className="text-emerald-500" />
          <span className="font-game text-[10px] tracking-[0.3em] text-emerald-700">SHADOW SYSTEM // NÚCLEO V1.2.0</span>
        </div>

        <div className="flex items-center gap-3">
        </div>
      </div>

      <header className={`mb-12 p-6 md:p-10 system-panel rounded-2xl flex flex-col lg:flex-row items-center gap-8 md:gap-10 transition-all duration-700 ${profile.isPenaltyZoneActive ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.2)]' : 'border-green-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]'}`}>
        <div className="hud-tl hud-corner"></div><div className="hud-tr hud-corner"></div>
        <div className="hud-bl hud-corner"></div><div className="hud-br hud-corner"></div>

        <div className="relative shrink-0 flex flex-col items-center">
          <div className="relative group">
            <div className="w-40 h-40 md:w-52 md:h-52 bg-slate-900 border border-slate-800 p-1.5 overflow-hidden shadow-2xl relative rounded">
              <img src={profile.avatar} alt="Caçador" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className={`absolute -bottom-4 -right-4 font-game text-4xl md:text-6xl px-4 py-1.5 bg-black border border-slate-800 shadow-2xl rank-label ${RANK_COLORS[profile.rank]}`}>
              {profile.rank}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 w-full min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1 min-w-0">
              <h1 className="font-game text-2xl md:text-4xl text-slate-100 tracking-tight leading-none uppercase truncate neon-text-green-strong">{profile.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] md:text-[11px] font-game text-emerald-400 bg-emerald-950/40 px-2 py-0.5 border border-emerald-500/20 whitespace-nowrap">{profile.title}</span>
                <span className="text-[9px] md:text-[10px] font-game text-slate-600 uppercase">Sistema Ativo: V1.2</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="p-2.5 bg-black/40 hover:bg-black/40 border border-slate-800 text-slate-500 hover:text-emerald-400 transition-all group/btn rounded shadow-lg"
                  title="CONFIGURAÇÕES"
                >
                  <Settings size={18} className="group-hover/btn:rotate-45 transition-transform" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2.5 bg-black/40 hover:bg-black/40 border border-slate-800 text-slate-500 hover:text-red-400 transition-all rounded shadow-lg"
                  title="DESCONECTAR DO SISTEMA"
                >
                  <LogOut size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-4 justify-center md:justify-end">
                <div className="flex flex-col items-center justify-center min-w-[70px] md:min-w-[80px] p-2 system-panel border-emerald-900/30 bg-emerald-950/10 rounded-lg group hover:border-emerald-500/50 transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Zap size={12} className="text-emerald-500 mb-1" />
                  <p className="text-[8px] font-game text-emerald-700 mb-0.5 uppercase tracking-tighter">Nível</p>
                  <p className="font-game text-xl md:text-2xl text-white leading-none neon-text-green-strong">{profile.level}</p>
                </div>
                <div className="flex flex-col items-center justify-center min-w-[90px] md:min-w-[110px] p-2 system-panel border-amber-900/30 bg-amber-950/10 rounded-lg group hover:border-amber-500/50 transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Coins size={12} className="text-amber-500 mb-1" />
                  <p className="text-[8px] font-game text-amber-700 mb-0.5 uppercase tracking-tighter">Ouro</p>
                  <p className="font-game text-xl md:text-2xl text-amber-500 leading-none">{profile.gold.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-center justify-center min-w-[90px] md:min-w-[110px] p-2 system-panel border-purple-900/30 bg-purple-950/10 rounded-lg group hover:border-purple-500/50 transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Database size={12} className="text-purple-500 mb-1" />
                  <p className="text-[8px] font-game text-purple-700 mb-0.5 uppercase tracking-tighter">XP Total</p>
                  <p className="font-game text-xl md:text-2xl text-purple-400 leading-none neon-text-purple">{profile.totalXpGained.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-game text-emerald-600 tracking-wider">TAXA DE SINCRONIA</span>
              <span className="text-[11px] font-game text-emerald-400">{xpPercentage}%</span>
            </div>
            <div className="h-1.5 bg-black border border-slate-900 relative rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-[1s] ease-out ${profile.isPenaltyZoneActive ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-900 to-emerald-400'}`}
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-game text-purple-600 tracking-wider">PRÓXIMA RECOMPENSA RARA</span>
              <span className="text-[10px] font-game text-purple-400">{Math.floor(nextRareDropProgress)}%</span>
            </div>
            <div className="h-1 bg-black border border-slate-900 relative rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-900 to-purple-400 transition-all duration-[1s] ease-out"
                style={{ width: `${nextRareDropProgress}%` }}
              />
            </div>
            <p className="text-[8px] text-slate-600 uppercase text-right tracking-tighter">Faltam {xpRemainingForDrop.toLocaleString()} XP para o próximo drop</p>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:relative md:bottom-auto md:left-auto md:right-auto md:z-0 grid grid-cols-5 gap-1 md:gap-3 p-2 md:p-0 bg-slate-950/90 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-t border-green-500/20 md:border-none mb-0 md:mb-12">
        {[
          { id: 'quests', label: 'MISSÕES', icon: Target, color: 'emerald' },
          { id: 'status', label: 'STATUS', icon: Activity, color: 'emerald' },
          { id: 'inventory', label: 'INVENTÁRIO', icon: Package, color: 'green' },
          { id: 'store', label: 'LOJA', icon: ShoppingBag, color: 'green' },
          { id: 'penalties', label: 'PURIFICAÇÃO', icon: HeartPulse, color: 'red' },
        ].map(tab => {
          const colorClasses: Record<string, string> = {
            emerald: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/50',
            green: 'bg-green-600/10 text-green-400 border-green-500/50',
            red: 'bg-red-600/10 text-red-400 border-red-500/50',
          };

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'quests' | 'status' | 'inventory' | 'store' | 'penalties')}
              className={`p-2 md:p-4 system-panel font-game text-[9px] md:text-[13px] flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 transition-all border ${activeTab === tab.id
                ? `${colorClasses[tab.color]} shadow-lg z-10 scale-[1.02]`
                : 'text-slate-500 border-slate-900 hover:text-slate-300'
                }`}
            >
              <tab.icon size={18} className="shrink-0" /> <span className="truncate max-w-full">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <aside className="lg:col-span-3 space-y-6">
          <div className="system-panel p-6 min-h-[200px] lg:min-h-[300px] border-emerald-950/40">
            <h2 className="font-game text-[11px] md:text-[12px] text-emerald-800 mb-6 flex items-center gap-2 border-b border-emerald-950 pb-4 uppercase tracking-widest font-bold"><Bell size={14} /> ALERTAS</h2>
            <div className="space-y-4">
              {messages.map((m: SystemMessage) => (
                <div key={m.id} className={`text-[12px] md:text-[13px] font-medium animate-in slide-in-from-left duration-200 ${m.type === 'success' ? 'text-green-500' : m.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                  <span className="opacity-30 text-[9px]">[{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span> <br />
                  <span className="font-game uppercase tracking-tight break-words">&gt; {m.text}</span>
                </div>
              ))}
              {messages.length === 0 && <p className="text-[11px] text-slate-700 italic font-game uppercase">SINCRONIZANDO...</p>}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9 min-w-0">
          {activeTab === 'quests' ? (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="font-game text-2xl md:text-3xl flex items-center gap-4 text-slate-200 uppercase tracking-tight">
                  <ScrollText size={24} className="text-emerald-500" /> Missões Ativas
                </h2>
                <button
                  onClick={() => { resetForm(); setQuestForm({ isOpen: true }); }}
                  className="w-full sm:w-auto px-6 py-3 system-panel border border-emerald-900 text-emerald-500 hover:bg-emerald-950 hover:text-emerald-400 font-game text-[12px] tracking-widest transition-all flex items-center justify-center gap-2 font-bold uppercase"
                >
                  <Plus size={16} /> Nova Missão
                </button>
              </div>

              <div className="space-y-4">
                {quests.filter(q => !q.completed && !q.failed).map(q => (
                  <QuestCard
                    key={q.id}
                    quest={q}
                    onToggleComplete={handleToggleComplete}
                    onToggleSubQuest={handleToggleSubQuest}
                    onDelete={handleDeleteQuest}
                    onEdit={handleEditQuest}
                    onAddSubQuest={handleAddSubQuest}
                    onRemoveSubQuest={handleRemoveSubQuest}
                  />
                ))}
                {quests.filter(q => !q.completed && !q.failed).length === 0 && (
                  <div className="text-center py-20 system-panel border-dashed border border-emerald-900/30 rounded-xl opacity-40">
                    <p className="font-game text-[12px] text-emerald-700 tracking-widest uppercase">AGUARDANDO NOVAS MISSÕES...</p>
                  </div>
                )}
              </div>

              {/* Seção de Missões Concluídas Hoje */}
              {quests.filter(q => {
                if (!q.completed || !q.completedAt) return false;
                const today = new Date().toDateString();
                const completedDate = new Date(q.completedAt).toDateString();
                return today === completedDate;
              }).length > 0 && (
                  <div className="mt-12 space-y-8 animate-in fade-in duration-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 opacity-60">
                      <h2 className="font-game text-xl md:text-2xl flex items-center gap-4 text-slate-400 uppercase tracking-tight">
                        <Check size={20} className="text-emerald-800" /> Missões Concluídas (Hoje)
                      </h2>
                    </div>

                    <div className="space-y-4 opacity-40 hover:opacity-100 transition-opacity duration-500">
                      {quests.filter(q => {
                        if (!q.completed || !q.completedAt) return false;
                        const today = new Date().toDateString();
                        const completedDate = new Date(q.completedAt).toDateString();
                        return today === completedDate;
                      })
                        .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
                        .map(q => (
                          <QuestCard
                            key={q.id}
                            quest={q}
                            onToggleComplete={handleToggleComplete}
                            onToggleSubQuest={handleToggleSubQuest}
                            onDelete={handleDeleteQuest}
                            onEdit={handleEditQuest}
                            onAddSubQuest={handleAddSubQuest}
                            onRemoveSubQuest={handleRemoveSubQuest}
                          />
                        ))}
                    </div>
                  </div>
                )}
            </div>
          ) : activeTab === 'status' ? (
            <StatusWindow profile={profile} />
          ) : activeTab === 'penalties' ? (
            <PenaltySystem
              profile={profile}
              vices={vices}
              onAddVice={(title, corruption) => setVices(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), title, corruptionIncrease: corruption, penaltyXp: 0 }])}
              onRemoveVice={id => setVices(prev => prev.filter(v => v.id !== id))}
              onSuccumb={v => updateCorruption(v.corruptionIncrease)}
              onStartSurvival={() => {
                if (profile.corruption >= 100) {
                  const now = Date.now();
                  const penalties: HunterProfile['penaltyType'][] = ['gold_drain', 'xp_drain', 'block_rewards', 'corruption_spike'];
                  const randomPenalty = penalties[Math.floor(Math.random() * penalties.length)];

                  setProfile(p => ({
                    ...p,
                    isPenaltyZoneActive: true,
                    penaltyEndTime: now + PENALTY_DURATION,
                    penaltyType: randomPenalty,
                    corruption: 100
                  }));
                  addSystemMessage(`SISTEMA: PROTOCOLO DE PURIFICAÇÃO VOLUNTÁRIO ATIVADO: ${randomPenalty?.toUpperCase().replace('_', ' ')}`, "warning");
                } else {
                  addSystemMessage("SISTEMA: ESTADO DE MANA ESTÁVEL. PURIFICAÇÃO NEGADA.", "info");
                }
              }}
            />
          ) : activeTab === 'inventory' ? (
            <Inventory items={storeItems} onUseItem={handleUseItem} />
          ) : (
            <Store
              gold={profile.gold}
              items={storeItems}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onPurchaseItem={i => {
                const contractBuffs = profile.activeBuffs.filter(b => b.slug === 'buff-contract').length;
                const discount = 1 - (contractBuffs * 0.01);
                const finalCost = Math.floor(i.cost * discount);

                if (profile.gold >= finalCost) {
                  setProfile(p => ({ ...p, gold: p.gold - finalCost }));
                  setStoreItems(prev => prev.map(si => si.id === i.id ? { ...si, purchasedCount: si.purchasedCount + 1 } : si));
                  addSystemMessage(`SISTEMA: ARTEFATO "${i.name.toUpperCase()}" ADQUIRIDO.`, 'success');
                  setActiveEffect({ type: 'purchase' });
                } else {
                  addSystemMessage("SISTEMA: OURO INSUFICIENTE.", "error");
                }
              }}
            />
          )}
        </div>
      </main>

      {/* Modal de Criação / Edição */}
      {questForm.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-start md:items-center justify-center p-0 md:p-4 backdrop-blur-md overflow-y-auto">
          <div className="system-panel p-6 md:p-10 w-full max-w-2xl min-h-screen md:min-h-0 md:rounded-2xl shadow-2xl relative border-emerald-900/50 flex flex-col">
            <div className="hidden md:block hud-tl hud-corner"></div><div className="hidden md:block hud-tr hud-corner"></div>
            <div className="hidden md:block hud-bl hud-corner"></div><div className="hidden md:block hud-br hud-corner"></div>

            <div className="flex justify-between items-center mb-6 md:mb-8 border-b border-emerald-900/30 pb-4 relative z-10">
              <h2 className="font-game text-xl md:text-2xl text-slate-100 uppercase font-bold tracking-tight">
                {editingQuest ? "Recalibrar Diretriz" : "Manifestação de Nova Quest"}
              </h2>
              <button onClick={() => { setQuestForm({ isOpen: false }); resetForm(); }} className="text-emerald-600 hover:text-emerald-400 md:hidden">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 md:space-y-8 relative z-10 flex-1">
              <div className="space-y-2">
                <label className="block text-[10px] md:text-[11px] font-game text-emerald-600 uppercase tracking-widest font-bold">Identificador de Objetivo</label>
                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    value={newQuestTitle}
                    onChange={e => setNewQuestTitle(e.target.value)}
                    placeholder="EX: EXTERMÍNIO DA PROCRASTINAÇÃO..."
                    className="w-full bg-black border border-emerald-900/30 p-3 md:p-4 text-slate-100 font-game text-base md:text-xl outline-none focus:border-emerald-500 transition-all rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`flex flex-col gap-2`}>
                  <div className={`flex items-center gap-4 bg-emerald-950/10 p-4 border border-emerald-900/20 rounded-lg transition-all ${editingQuest || newQuestIsSpecial ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-900/20 cursor-pointer'}`}
                    onClick={() => !editingQuest && !newQuestIsSpecial && setNewQuestIsDaily(!newQuestIsDaily)}>
                    <button
                      disabled={!!editingQuest || newQuestIsSpecial}
                      type="button"
                      className={`p-3 border-2 transition-all rounded-lg flex items-center justify-center ${newQuestIsDaily ? 'bg-emerald-900/40 border-emerald-400 text-emerald-300 shadow-[0_0_10px_#10b981]' : 'bg-black border-slate-800 text-slate-700'} ${editingQuest || newQuestIsSpecial ? 'cursor-not-allowed' : ''}`}
                    >
                      {editingQuest ? <Lock size={20} /> : <CalendarDays size={20} />}
                    </button>
                    <div className="min-w-0">
                      <p className="font-game text-[11px] text-emerald-400 uppercase font-bold truncate">Quest Diária</p>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">{editingQuest ? 'Sincronizado' : (newQuestIsDaily ? 'Reset Diário Ativado' : 'Ciclo Único')}</p>
                    </div>
                  </div>
                </div>

                <div className={`flex flex-col gap-2`}>
                  <div className={`flex items-center gap-4 p-4 border rounded-lg transition-all ${editingQuest || newQuestIsDaily ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-900/10' : newQuestIsSpecial ? 'border-purple-500/50 bg-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-purple-900/30 bg-purple-950/10 hover:border-purple-700/50 cursor-pointer'}`}
                    onClick={() => !editingQuest && !newQuestIsDaily && setNewQuestIsSpecial(!newQuestIsSpecial)}>
                    <button
                      disabled={!!editingQuest || newQuestIsDaily}
                      type="button"
                      className={`p-3 border-2 transition-all rounded-lg flex items-center justify-center ${newQuestIsSpecial ? 'bg-purple-900/40 border-purple-400 text-purple-300 shadow-[0_0_10px_#a855f7]' : 'bg-black border-slate-800 text-slate-700'} ${editingQuest || newQuestIsDaily ? 'cursor-not-allowed' : ''}`}
                    >
                      {editingQuest ? <Lock size={20} /> : <Zap size={20} />}
                    </button>
                    <div className="min-w-0">
                      <p className={`font-game text-[11px] uppercase font-bold truncate ${newQuestIsSpecial ? 'text-purple-400' : 'text-purple-600'}`}>Op. Urgente (Hoje)</p>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">{newQuestIsSpecial ? 'Expira Meia-Noite' : 'Opcional'}</p>
                    </div>
                  </div>
                </div>

                {!newQuestIsDaily && !newQuestIsSpecial && (
                  <div className={`p-4 border rounded-lg flex flex-col justify-center transition-all bg-red-950/10 ${newQuestDeadline ? 'border-red-900/60' : 'border-red-600 animate-pulse'}`}>
                    <label className="block text-[9px] font-game text-red-500 uppercase font-bold mb-1 flex items-center gap-2">
                      <Clock size={12} /> Prazo Final {editingQuest ? '(IMUTÁVEL)' : '(OBRIGATÓRIO)'}
                    </label>
                    <input
                      disabled={!!editingQuest}
                      type="datetime-local"
                      value={newQuestDeadline}
                      onChange={e => setNewQuestDeadline(e.target.value)}
                      className={`bg-black/40 border border-red-900/40 text-red-400 p-2 rounded text-[10px] md:text-xs font-game outline-none focus:border-red-500 transition-all ${editingQuest ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    />
                  </div>
                )}

                {newQuestIsSpecial && (
                  <div className="p-4 border border-purple-900/30 bg-purple-950/20 rounded-lg flex items-center gap-3 md:col-span-2">
                    <AlertTriangle size={16} className="text-purple-500 shrink-0 animate-pulse" />
                    <p className="text-[9px] text-purple-200 uppercase leading-tight font-medium font-game tracking-wider">
                      Operações urgentes expiram e desaparecem às 23:59:59 do mesmo dia. Falhar gera uma punição (+10% Corrupção).
                    </p>
                  </div>
                )}

                {newQuestIsDaily && (
                  <div className="p-4 border border-lime-900/20 bg-lime-950/5 rounded-lg flex items-center gap-3">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    <p className="text-[9px] text-slate-500 uppercase leading-tight font-medium">
                      Quests diárias resetam à meia-noite. Falha em completar resulta em punição de mana.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="block text-[10px] md:text-[11px] font-game text-emerald-600 uppercase tracking-widest font-bold">Rank do Portal</label>
                  <span className="text-[9px] md:text-[10px] font-game text-slate-600 uppercase font-bold">VOCÊ É {profile.rank}</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Object.values(QuestDifficulty).map(d => {
                    // PROTOCOLO 1.2: Apenas Rank S requer Rank S. Outros estão liberados até Rank A.
                    const isLocked = d === QuestDifficulty.S && profile.rank !== Rank.S;
                    const isActive = d === newQuestDifficulty;

                    return (
                      <button
                        key={d}
                        disabled={isLocked}
                        onClick={() => setNewQuestDifficulty(d)}
                        className={`rank-cell h-14 md:h-16 border flex flex-col items-center justify-center gap-1 transition-all ${isLocked
                          ? 'border-red-950/10 bg-red-950/5 text-red-900/20 cursor-not-allowed'
                          : isActive
                            ? 'rank-cell-active border-emerald-400 bg-emerald-900/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                            : 'border-slate-800 bg-black/40 text-slate-600 hover:border-emerald-700 hover:text-emerald-300'
                          }`}
                      >
                        {isLocked ? (
                          <Lock size={12} />
                        ) : (
                          <>
                            <span className={`font-game text-lg md:text-xl font-black ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>{d}</span>
                            <span className="font-game text-[8px] tracking-tighter font-bold uppercase hidden md:inline">RANK {d}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-900 mt-auto">
                <button onClick={() => { setQuestForm({ isOpen: false }); resetForm(); }} className="hidden sm:block flex-1 py-4 font-game text-[11px] text-slate-600 hover:text-slate-300 transition-colors uppercase font-bold tracking-widest">Cancelar</button>
                <button
                  onClick={handleSaveQuest}
                  disabled={isFormInvalid}
                  className={`flex-1 py-4 border-2 font-game text-[12px] md:text-[13px] transition-all rounded font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 ${isFormInvalid
                    ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed grayscale'
                    : 'bg-slate-900 border-emerald-800 text-emerald-400 hover:bg-emerald-800 hover:border-emerald-400'
                    }`}
                >
                  {isFormInvalid && <Lock size={14} />}
                  {editingQuest ? "Atualizar Diretriz" : "Iniciar Missão"}
                </button>
              </div>

              {isFormInvalid && !newQuestIsDaily && !newQuestDeadline && newQuestTitle.trim() !== '' && (
                <p className="text-[10px] text-red-500 font-game uppercase text-center animate-pulse">
                  ALERTA: DEFINA UM PRAZO PARA MANIFESTAR ESTA DIRETRIZ.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sync and Connection Overlay Removed */}

      {activeEffect && (
        <SystemEffectOverlay
          effect={activeEffect}
          onComplete={() => setActiveEffect(null)}
        />
      )}
    </div>
  );
};

export default App;
