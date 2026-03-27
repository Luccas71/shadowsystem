
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
  ActiveBuff,
  ItemOrigin
} from './types';
import {
  RANK_COLORS,
  DIFFICULTY_XP,
  DIFFICULTY_GOLD,
  calculateMaxXp,
  calculateStats,
  getRankByLevel,
  DEFAULT_STORE_ITEMS,
  STREAK_TIERS,
  getCurrentStreakTier,
  getStreakMultiplier
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
import BackgroundHUD from './components/BackgroundHUD';
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
  Timer,
  X,
  Check,
  Monitor,
  AlertTriangle,
  LogOut,
  Wifi,
  WifiOff,
  GripVertical,
  Flame
} from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
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
  lastItemDropDate: "",
  dailyStreak: 0,
  lastStreakDate: "",
  lastDailyCheckDate: ""
};

const XP_DROP_THRESHOLD = 50000;
const PENALTY_DURATION = 12 * 3600000; // 12 Horas em ms

const DraggableQuestItem: React.FC<{ quest: Quest; children: React.ReactNode }> = ({ quest, children }) => {
  const controls = useDragControls();
  const pressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      pressTimer.current = setTimeout(() => {
        controls.start(e);
        if (navigator.vibrate) navigator.vibrate(50);
      }, 1000);
    }
  };

  const clearTimer = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  return (
    <Reorder.Item
      value={quest}
      dragListener={false}
      dragControls={controls}
      onPointerDown={handlePointerDown}
      onPointerUp={clearTimer}
      onPointerCancel={clearTimer}
      onContextMenu={(e: React.MouseEvent) => {
        if ((e.nativeEvent as PointerEvent).pointerType === 'touch') e.preventDefault();
      }}
    >
      <div className="flex items-center gap-2">
         <div 
           className="cursor-grab active:cursor-grabbing p-2 text-cyan-900/40 hover:text-cyan-600 transition-colors hidden md:block shrink-0"
           onPointerDown={(e: React.PointerEvent) => {
             if (e.pointerType === 'mouse') controls.start(e);
           }}
         >
           <GripVertical size={20} />
         </div>
         <div className="flex-1 min-w-0">
           {children}
         </div>
      </div>
    </Reorder.Item>
  );
};

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
  const [newQuestIsScheduled, setNewQuestIsScheduled] = useState(false);
  const [newQuestRepeatDays, setNewQuestRepeatDays] = useState<number[]>([]);
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
      return [newMessage, ...prev].slice(0, 30);
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
          penaltyType: undefined,
          dailyStreak: 0,
          lastStreakDate: ""
        }));
        addSystemMessage("SISTEMA: PURIFICAÇÃO CONCLUÍDA. ESTABILIDADE DE MANA RESTAURADA. OFENSIVA ZERADA.", "success");
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
      let streakUpdatedToday = false;
      let newStreakValue = profile.dailyStreak || 0;

      const dayChangedSinceLastCheck = profile.lastDailyCheckDate && profile.lastDailyCheckDate !== today;
      
      if (dayChangedSinceLastCheck) {
        // Obter o dia da semana de "ontem" (o dia que estamos verificando)
        const yesterday = new Date(profile.lastDailyCheckDate || '');
        const yesterdayDay = yesterday.getDay();

        // Só quebra a ofensiva se havia missões ATIVAS ontem que não foram concluídas
        const pendingQuests = quests.filter(q => {
          if (q.completed || q.failed) return false;
          
          // Quests diárias e especiais são sempre ativas no dia
          if (q.isDaily || q.isSpecial) return true;
          
          // Quests programadas só contam se ontem era um dia de ativação
          if (q.isScheduled && q.repeatDays?.includes(yesterdayDay)) return true;
          
          // Quests normais com prazo que expirou ontem ou antes
          if (!q.isDaily && !q.isSpecial && !q.isScheduled && q.deadline && q.deadline < now) return true;
          
          return false;
        });

        const anyPending = pendingQuests.length > 0;

        if (!anyPending) {
          // Incremento normal da ofensiva
          newStreakValue += 1;
          const tier = getCurrentStreakTier(newStreakValue);
          addSystemMessage(`SISTEMA: OFENSIVA DIÁRIA MANTIDA! (+1). TIER ATUAL: ${tier.name}`, "success");
          
          // Milestone Reward a cada 7 dias
          if (newStreakValue > 0 && newStreakValue % 7 === 0) {
            const randomItem = storeItems[Math.floor(Math.random() * storeItems.length)];
            setStoreItems(prev => {
              const next = [...prev];
              const existingIdx = next.findIndex(si => si.id === randomItem.id && si.origin === 'diário');
              if (existingIdx > -1) {
                next[existingIdx] = { ...next[existingIdx], purchasedCount: next[existingIdx].purchasedCount + 1 };
              } else {
                next.push({ ...randomItem, purchasedCount: 1, origin: 'diário' });
              }
              return next;
            });
            addSystemMessage(`SISTEMA: RECOMPENSA DE MARCO DE 7 DIAS! RECEBIDO: ${randomItem.name.toUpperCase()}`, "warning");
            setActiveEffect({
              type: 'useItem',
              title: "RECOMPENSA DE CAVALEIRO",
              subtitle: `MARCO DE ${newStreakValue} DIAS ALCANÇADO`,
              icon: <Flame size={48} className="text-amber-500" />
            });
          }
        } else {
          // Salvaguarda de Rank: B ou superior não reseta, apenas mantém
          const isRankProtected = [Rank.B, Rank.A, Rank.S].includes(profile.rank);
          
          if (isRankProtected) {
            addSystemMessage(`SISTEMA: SALVAGUARDA DE RANK ATIVADA (${profile.rank}). OFENSIVA PRESERVADA.`, "info");
            // Mantém o valor atual (newStreakValue já foi inicializado com profile.dailyStreak)
          } else {
            newStreakValue = 0;
            const questTitles = pendingQuests.map(q => q.title.toUpperCase()).join(', ');
            addSystemMessage(`SISTEMA: OFENSIVA QUEBRADA. MISSÕES PENDENTES: ${questTitles}`, "warning");
          }
        }
        streakUpdatedToday = true;
      } else if (!profile.lastDailyCheckDate) {
        streakUpdatedToday = true;
      }

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

        if (q.isScheduled && q.repeatDays) {
          const lastResetDate = q.lastResetAt ? new Date(q.lastResetAt) : (q.createdAt ? new Date(q.createdAt) : null);
          const lastResetDayStr = lastResetDate ? lastResetDate.toDateString() : '';
          
          if (lastResetDayStr !== today) {
            updateRequired = true;
            
            // Verificamos se o dia que acabou de terminar era um dia ativo
            if (lastResetDate) {
              const dayFinished = lastResetDate.getDay();
              const wasFinishedDayActive = q.repeatDays.includes(dayFinished);
              
              if (wasFinishedDayActive && !q.completed && !q.failed) {
                corruptionIncrease += 10;
                addSystemMessage(`SISTEMA: MISSÃO PROGRAMADA "${q.title.toUpperCase()}" NÃO CUMPRIDA. +10% CORRUPÇÃO.`, "error");
              }
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

      if (updateRequired || corruptionIncrease > 0 || streakUpdatedToday) {
        setQuests(updatedQuests);
        updateCorruption(corruptionIncrease, goldPenaltyAtOnce);
        if (streakUpdatedToday) {
          setProfile(p => ({ 
            ...p, 
            dailyStreak: newStreakValue,
            lastStreakDate: newStreakValue > (p.dailyStreak || 0) ? today : p.lastStreakDate,
            lastDailyCheckDate: today
          }));
        }
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
      // EXCEPT for messages which are strictly local
      const localData = persistenceService.loadLocal();
      if (localData && localData.messages) {
        setMessages(localData.messages);
      }
      
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
          // Cleanup legacy items from local store
          const cleanedStore = (localData.storeItems as StoreItem[]).filter((item: StoreItem) => item.id !== 'key-1');
          setStoreItems(cleanedStore);
          setVices(localData.vices);
        }
        addSystemMessage("SISTEMA: MODO OFFLINE ATIVADO. AS ALTERAÇÕES SERÃO SINCRONIZADAS POSTERIORMENTE.", "warning");
      }

      isInitializing.current = false;

      // Protocolo de Reestabelecimento de Ofensiva (Correção Direta no Load)
      const correctionApplied = localStorage.getItem('streak_correction_2026_03_27_v10');
      if (!correctionApplied) {
        setProfile(p => {
          const newStreak = (p.dailyStreak || 0) + 2;
          return { ...p, dailyStreak: newStreak };
        });
        localStorage.setItem('streak_correction_2026_03_27_v10', 'true');
        addSystemMessage("SISTEMA: PROTOCOLO DE REESTABELECIMENTO DE MANA CONCLUÍDO (+2 OFENSIVA).", "success");
      }

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

          const cloudStore: StoreItem[] = (cloudData.store_items || DEFAULT_STORE_ITEMS).filter((item: StoreItem) => item.id !== 'key-1');
          const mergedStore = [...cloudStore];
          DEFAULT_STORE_ITEMS.forEach(defaultItem => {
            if (!mergedStore.some((item: StoreItem) => item.id === defaultItem.id)) mergedStore.push(defaultItem);
          });
          setStoreItems(mergedStore);
          setVices(cloudData.vices || []);
          if (cloudData.messages) {
            setMessages(cloudData.messages);
          }

          persistenceService.saveLocal({
            profile: cloudProfile,
            quests: cloudData.quests || [],
            storeItems: mergedStore,
            vices: cloudData.vices || [],
            messages: messages,
            lastUpdate: cloudData.updated_at
          });
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
            messages: messages,
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
          messages,
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
      messages,
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
  }, [profile, quests, storeItems, vices, messages]);

  const handleToggleComplete = (id: string) => {    if (processingQuestIds.current.has(id)) return;

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
      const streakMultiplier = getStreakMultiplier(profile.dailyStreak || 0);
      const xpMultiplier = (1 + (xpBuffs * 0.05) + (shadowEssenceBuffs * 0.02)) * streakMultiplier;

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
      const goldMultiplier = (1 + (orbBuffs * 0.1) + (ringBuffs * 0.05) + (shadowEssenceBuffs * 0.02)) * streakMultiplier;

      const finalGoldReward = Math.floor(quest.goldReward * goldMultiplier);

      // Random Item Drop System (Max 2 per day)
      const today = new Date().toDateString();
      const lastDropDate = profile.lastItemDropDate || '';
      let dailyDrops = lastDropDate === today ? (profile.dailyItemDropsCount || 0) : 0;

      const questDrops: StoreItem[] = [];
      if (dailyDrops < 2) {
        const commonItems = storeItems.filter(item => item.cost < 5000);
        const pool = commonItems.length > 0 ? commonItems : storeItems;

        if (dailyDrops === 0) {
          // Guaranteed drop on first mission
          const randomIdx = Math.floor(Math.random() * pool.length);
          const droppedItem = pool[randomIdx];
          questDrops.push(droppedItem);
          dailyDrops += 1;
          addSystemMessage(`SISTEMA: DROP DIÁRIO GARANTIDO! ${droppedItem.name.toUpperCase()}`, 'warning');
        } else {
          // Chance of drop on second mission based on difficulty
          const dropChances: Record<QuestDifficulty, number> = {
            [QuestDifficulty.E]: 0.10,
            [QuestDifficulty.D]: 0.15,
            [QuestDifficulty.C]: 0.25,
            [QuestDifficulty.B]: 0.40,
            [QuestDifficulty.A]: 0.60,
            [QuestDifficulty.S]: 0.90,
          };

          const chance = dropChances[quest.difficulty];
          if (Math.random() < chance) {
            const randomIdx = Math.floor(Math.random() * pool.length);
            const droppedItem = pool[randomIdx];
            questDrops.push(droppedItem);
            dailyDrops += 1;
            addSystemMessage(`SISTEMA: ITEM ENCONTRADO! ${droppedItem.name.toUpperCase()}`, 'warning');
          }
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
        setStoreItems(prev => {
          let next = [...prev];
          
          // Helper to add specialized items to inventory
          const addToInventory = (item: StoreItem, origin: ItemOrigin) => {
            const existingIdx = next.findIndex(si => si.id === item.id && si.origin === origin);
            if (existingIdx > -1) {
              next[existingIdx] = { ...next[existingIdx], purchasedCount: next[existingIdx].purchasedCount + 1 };
            } else {
              next.push({ ...item, purchasedCount: 1, origin });
            }
          };

          levelDrops.forEach(d => addToInventory(d, 'nível'));
          rareDrops.forEach(d => addToInventory(d, 'raro'));
          questDrops.forEach(d => addToInventory(d, 'diário'));

          return next;
        });
      }

      setCompletingQuest({
        quest,
        rewards: {
          gold: finalGoldReward,
          xp: finalXpReward,
          items: questDrops // We only show quest drops in the animation to avoid cluttering, or we can show allDrops
        }
      });

      // Trigger Animations Imperatively
      if (newLevel > profile.level) {
        setLevelUpData({ oldLevel: profile.level, newLevel: newLevel });
      }
      const newRank = getRankByLevel(newLevel);
      if (newRank !== profile.rank) {
        setRankUpData({ oldRank: profile.rank, newRank: newRank });
      }

      const nextQuests = quests.map(qu => qu.id === id ? { ...qu, completed: true, completedAt: Date.now() } : qu);

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

      setQuests(nextQuests);
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
      case 'elixir-vida-1': subtitle = "VITALIDADE TOTAL RESTAURADA (+50% XP, 0% CORRUPÇÃO)"; break;
      case 'armor-1': subtitle = "PROTEÇÃO DO MONARCA EQUIPADA"; break;
      case 'orb-1': subtitle = "AVAREZA DO CAÇADOR ATIVADA (+10% OURO)"; break;
      case 'ring-1': subtitle = "ANEL DE MIDAS EQUIPADO (+5% OURO)"; break;
      case 'xp-boost-1': subtitle = "INCENSO DE MEDITAÇÃO ACESO (+5% XP)"; break;
      case 'shadow-essence-1': subtitle = "ESSÊNCIA DE SOMBRA ABSORVIDA (+2% GANHOS)"; break;
      case 'pendant-1': subtitle = "PINGENTE DO VIAJANTE EQUIPADO (-5% CORRUPÇÃO)"; break;
      case 'scroll-2': subtitle = "ESCUDO DE MANA ATIVADO"; break;
      case 'crystal-1': subtitle = "CRISTAL DE MANA CONSUMIDO (+5.000 XP)"; break;
      case 'star-fragment-1': subtitle = "FRAGMENTO ABSORVIDO (+2.000 XP, -10% CORRUPÇÃO)"; break;
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

    setStoreItems(prev => {
      const next = [...prev];
      const targetIdx = next.findIndex(si => si.id === item.id && si.purchasedCount > 0);
      if (targetIdx > -1) {
        next[targetIdx] = { ...next[targetIdx], purchasedCount: next[targetIdx].purchasedCount - 1 };
      }
      return next;
    });

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
          updates.dailyStreak = 0;
          addSystemMessage("SISTEMA: PURIFICAÇÃO COMPLETA. OFENSIVA ZERADA.", "success");
          break;
        case 'elixir-vida-1': {
          updates.corruption = 0;
          let newXp = p.xp + Math.floor(p.maxXp * 0.5);
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
          const newRank = getRankByLevel(newLevel);
          updates.rank = newRank;
          updates.stats = calculateStats(newLevel);

          if (newLevel > p.level) {
            setLevelUpData({ oldLevel: p.level, newLevel: newLevel });
          }
          if (newRank !== p.rank) {
            setRankUpData({ oldRank: p.rank, newRank: newRank });
          }

          addSystemMessage("SISTEMA: ELIXIR DA VIDA CONSUMIDO. POTENCIAL E ESTABILIDADE RESTAURADOS.", "success");
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
          const newRank = getRankByLevel(newLevel);
          updates.rank = newRank;
          updates.stats = calculateStats(newLevel);

          // Trigger Animations Imperatively
          if (newLevel > p.level) {
            setLevelUpData({ oldLevel: p.level, newLevel: newLevel });
          }
          if (newRank !== p.rank) {
            setRankUpData({ oldRank: p.rank, newRank: newRank });
          }

          addSystemMessage("SISTEMA: CRISTAL DE MANA CONSUMIDO (+5.000 XP).", "success");
          break;
        }
        case 'star-fragment-1': {
          updates.corruption = Math.max(0, p.corruption - 10);
          let sfXp = p.xp + 2000;
          let sfLevel = p.level;
          let sfMaxXp = p.maxXp;
          while (sfXp >= sfMaxXp) {
            sfXp -= sfMaxXp;
            sfLevel++;
            sfMaxXp = calculateMaxXp(sfLevel);
          }
          updates.xp = sfXp;
          updates.level = sfLevel;
          updates.maxXp = sfMaxXp;
          const sfRank = getRankByLevel(sfLevel);
          updates.rank = sfRank;
          updates.stats = calculateStats(sfLevel);

          if (sfLevel > p.level) {
            setLevelUpData({ oldLevel: p.level, newLevel: sfLevel });
          }
          if (sfRank !== p.rank) {
            setRankUpData({ oldRank: p.rank, newRank: sfRank });
          }

          addSystemMessage("SISTEMA: FRAGMENTO DE ESTRELA ABSORVIDO (+2.000 XP, -10% CORRUPÇÃO).", "success");
          break;
        }
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
        case 'courage-1': {
          const newLevel = p.level + 1;
          const newRank = getRankByLevel(newLevel);
          updates.level = newLevel;
          updates.maxXp = calculateMaxXp(newLevel);
          updates.rank = newRank;
          updates.stats = calculateStats(newLevel);

          // Trigger Animations Imperatively
          setLevelUpData({ oldLevel: p.level, newLevel: newLevel });
          if (newRank !== p.rank) {
            setRankUpData({ oldRank: p.rank, newRank: newRank });
          }

          addSystemMessage("SISTEMA: PROVA DE CORAGEM SUPERADA. NÍVEL AUMENTADO.", "success");
          break;
        }
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
          const newRank = getRankByLevel(sLevel);
          updates.rank = newRank;
          updates.stats = calculateStats(sLevel);

          // Trigger Animations Imperatively
          if (sLevel > p.level) {
            setLevelUpData({ oldLevel: p.level, newLevel: sLevel });
          }
          if (newRank !== p.rank) {
            setRankUpData({ oldRank: p.rank, newRank: newRank });
          }

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
          const newRank = getRankByLevel(eLevel);
          updates.rank = newRank;
          updates.stats = calculateStats(eLevel);

          // Trigger Animations Imperatively
          if (eLevel > p.level) {
            setLevelUpData({ oldLevel: p.level, newLevel: eLevel });
          }
          if (newRank !== p.rank) {
            setRankUpData({ oldRank: p.rank, newRank: newRank });
          }

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
    setNewQuestIsScheduled(!!quest.isScheduled);
    setNewQuestRepeatDays(quest.repeatDays || []);
    setNewQuestDeadline(quest.deadline ? new Date(quest.deadline).toISOString().slice(0, 16) : '');
    setQuestForm({ isOpen: true });
  };

  const handleSaveQuest = () => {
    if (!newQuestTitle.trim()) return;
    const isFormInvalid = !newQuestTitle.trim() || (!newQuestIsDaily && !newQuestIsSpecial && !newQuestIsScheduled && !newQuestDeadline) || (newQuestIsScheduled && newQuestRepeatDays.length === 0);
    if (isFormInvalid) return;

    if (!newQuestIsDaily && !newQuestIsSpecial && !newQuestIsScheduled && !newQuestDeadline) {
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
      setQuests(prev => prev.map(q => {
        if (q.id === editingQuest.id) {
          const deadlineChanged = q.deadline !== resolvedDeadline;
          return {
            ...q,
            title: newQuestTitle.toUpperCase(),
            difficulty: newQuestDifficulty,
            deadline: resolvedDeadline,
            deadlineEdits: deadlineChanged ? (q.deadlineEdits || 0) + 1 : (q.deadlineEdits || 0),
            xpReward: DIFFICULTY_XP[newQuestDifficulty],
            goldReward: DIFFICULTY_GOLD[newQuestDifficulty],
          };
        }
        return q;
      }));
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
        isScheduled: newQuestIsScheduled,
        repeatDays: newQuestIsScheduled ? newQuestRepeatDays : undefined,
        deadline: resolvedDeadline,
        deadlineEdits: 0,
        lastResetAt: (newQuestIsDaily || newQuestIsScheduled) ? Date.now() : undefined,
        createdAt: Date.now(),
        subQuests: []
      };
      setQuests(prev => [newQuest, ...prev]);
      let categoryName = "QUEST ÚNICA";
      if (newQuestIsDaily) categoryName = "QUEST DIÁRIA";
      if (newQuestIsSpecial) categoryName = "QUEST ESPECIAL";
      if (newQuestIsScheduled) categoryName = "QUEST PROGRAMADA";
      addSystemMessage(`SISTEMA: NOVA ${categoryName} REGISTRADA.`, "success");
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
    setNewQuestIsScheduled(false);
    setNewQuestRepeatDays([]);
    setNewQuestDeadline('');
    setNewQuestDifficulty(QuestDifficulty.E);
  };

  const xpPercentage = Math.min(100, Math.floor((profile.xp / profile.maxXp) * 100));
  const nextRareDropProgress = (profile.totalXpGained % XP_DROP_THRESHOLD) / XP_DROP_THRESHOLD * 100;
  const xpRemainingForDrop = XP_DROP_THRESHOLD - (profile.totalXpGained % XP_DROP_THRESHOLD);

  const isFormInvalid = !newQuestTitle.trim() || 
    (!newQuestIsDaily && !newQuestIsSpecial && !newQuestIsScheduled && !newQuestDeadline) || 
    (newQuestIsScheduled && newQuestRepeatDays.length === 0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-cyan-800 border-t-cyan-400 animate-spin"></div>
          <p className="font-game text-[11px] text-cyan-700 tracking-[0.3em] uppercase">INICIALIZANDO SISTEMA...</p>
        </div>
      </div>
    );
  }

  // Auth screen if not logged in
  if (!session) {
    return <AuthScreen />;
  }

  return (
    <>
      <BackgroundHUD />

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
          <Monitor size={14} className="text-cyan-500" />
          <span className="font-game text-[10px] tracking-[0.3em] text-cyan-700">SHADOW SYSTEM // NÚCLEO V1.2.0</span>
        </div>

        <div className="flex items-center gap-3">
        </div>
      </div>

      <header className={`relative mb-12 overflow-hidden transition-all duration-700 bg-black/20 border-y border-white/5 ${profile.isPenaltyZoneActive ? 'border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.1)]' : 'border-cyan-500/10'}`}>
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none"></div>
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-cyan-600/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="hud-board p-1 md:p-1.5 bg-black/40 backdrop-blur-md relative z-10 border-none shadow-none">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center p-6 md:p-8 gap-10">
            
            {/* Profile Avatar & Rank Section */}
            <div className="relative shrink-0 self-center lg:self-auto">
              <div className="relative group">
                {/* Hexagonal style border */}
                <div className="relative w-44 h-44 md:w-56 md:h-56">
                  {/* Outer hex border */}
                  <div className="absolute inset-0 bg-cyan-500/20 clip-hex rotate-3 group-hover:rotate-0 transition-transform duration-700"></div>
                  {/* Inner container */}
                  <div className="absolute inset-2 bg-slate-900 overflow-hidden clip-hex border border-white/5">
                    <img 
                      src={profile.avatar} 
                      alt="Hunter" 
                      className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.2] grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                    />
                    {/* Scanline effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
                  </div>
                </div>
                
                {/* Rank Badge - Floating style */}
                <div className={`absolute -bottom-2 -right-2 font-game text-5xl md:text-7xl px-6 py-2 bg-black border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20 transition-all duration-500 ${RANK_COLORS[profile.rank]} drop-shadow-[0_0_15px_currentColor]`}>
                  {profile.rank}
                </div>
              </div>
            </div>

            {/* Profile Info & Core Stats */}
            <div className="flex-1 flex flex-col justify-between gap-10 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
                    <h1 className="font-game text-3xl md:text-5xl text-white tracking-widest leading-none uppercase truncate drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                      {profile.name}
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 ml-4">
                    <span className="text-[11px] font-game text-cyan-400 bg-cyan-950/60 px-3 py-1 border-y border-cyan-500/40 tracking-[0.2em]">{profile.title}</span>
                    <div className="flex items-center gap-1.5 opacity-40">
                      <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse"></div>
                      <span className="text-[9px] font-game text-slate-500 uppercase tracking-widest">SISTEMA_V1.2_SINCRONIZADO</span>
                    </div>
                  </div>
                </div>

                {/* Control Icons */}
                <div className="flex gap-2 self-end md:self-auto">
                  <button onClick={() => setIsEditingProfile(true)} className="p-3 bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-500 hover:text-cyan-400 transition-all group shadow-sm">
                    <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                  </button>
                  <button onClick={handleLogout} className="p-3 bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all shadow-sm">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>

              {/* Status Modules Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {/* Level Module */}
                <div className="hud-board p-4 border-white/5 bg-slate-900/40 relative group overflow-hidden">
                  <div className="absolute bottom-0 right-0 p-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-110">
                    <Zap size={40} className="text-cyan-500" />
                  </div>
                  <span className="block text-[8px] font-game text-slate-500 uppercase tracking-widest mb-1">NÍVEL_ATUAL</span>
                  <p className="font-game text-2xl md:text-3xl text-white neon-text-cyan-strong">{profile.level}</p>
                </div>

                {/* Gold Module */}
                <div className="hud-board p-4 border-white/5 bg-slate-900/40 relative group overflow-hidden">
                  <div className="absolute bottom-0 right-0 p-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-110">
                    <Coins size={40} className="text-orange-500" />
                  </div>
                  <span className="block text-[8px] font-game text-slate-500 uppercase tracking-widest mb-1">RESERVA_DE_OURO</span>
                  <p className="font-game text-2xl md:text-3xl text-orange-400">{profile.gold.toLocaleString()}</p>
                </div>

                {/* Streak Module */}
                <div className="hud-board p-4 border-amber-500/20 bg-amber-950/10 relative group overflow-hidden col-span-2 md:col-span-1 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]">
                   <div className="flex items-center justify-between">
                     <div>
                       <span className="block text-[8px] font-game text-amber-600 uppercase tracking-widest mb-1">OFENSIVA_ATIVA</span>
                       <div className="flex items-baseline gap-2">
                         <p className="font-game text-3xl text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">{profile.dailyStreak || 0}</p>
                         <span className="text-[10px] font-game text-slate-500 uppercase tracking-tighter">DIAS</span>
                       </div>
                     </div>
                     <div className={`p-2 bg-black/40 border border-white/5 ${getCurrentStreakTier(profile.dailyStreak || 0).color}`}>
                       <Flame size={20} className="animate-pulse" />
                     </div>
                   </div>
                   <div className="mt-2 text-[8px] font-game flex justify-between uppercase tracking-tighter italic">
                     <span className={getCurrentStreakTier(profile.dailyStreak || 0).color}>{getCurrentStreakTier(profile.dailyStreak || 0).name}</span>
                     {(profile.dailyStreak || 0) >= 7 && (
                       <span className="text-cyan-400">+{Math.round((getStreakMultiplier(profile.dailyStreak || 0) - 1) * 100)}% BÔNUS</span>
                     )}
                   </div>
                </div>
              </div>

              {/* XP Sync Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 animate-ping"></div>
                    <span className="text-[10px] font-game text-cyan-500 tracking-[0.2em] font-black uppercase">TAXA_DE_SINCRONIZAÇÃO_DO_SISTEMA</span>
                  </div>
                  <span className="text-[12px] font-game text-cyan-400 font-bold tracking-widest">{xpPercentage}%</span>
                </div>
                <div className="h-2 bg-black/60 border border-white/5 relative overflow-hidden">
                  <div
                    className={`h-full transition-all duration-[1.5s] ease-[cubic-bezier(0.19,1,0.22,1)] ${profile.isPenaltyZoneActive ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-gradient-to-r from-cyan-950 via-cyan-500 to-white'}`}
                    style={{ width: `${xpPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_3s_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:relative md:bottom-auto md:left-auto md:right-auto md:z-0 grid grid-cols-5 gap-1 md:gap-4 p-2 md:p-1 bg-slate-950/95 md:bg-transparent backdrop-blur-2xl md:backdrop-blur-none border-t border-cyan-500/30 md:border-none mb-0 md:mb-12">
        {[
          { id: 'quests', label: 'MISSÕES', icon: Target, color: 'cyan' },
          { id: 'status', label: 'STATUS', icon: Activity, color: 'green' },
          { id: 'inventory', label: 'INVENTÁRIO', icon: Package, color: 'purple' },
          { id: 'store', label: 'LOJA', icon: ShoppingBag, color: 'orange' },
          { id: 'penalties', label: 'PURIFICAÇÃO', icon: HeartPulse, color: 'red' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const colorClasses: Record<string, string> = {
            cyan: isActive ? 'text-cyan-400 border-cyan-500 bg-cyan-500/10' : 'text-slate-500 border-cyan-900/40 hover:text-cyan-400 hover:border-cyan-500/50',
            green: isActive ? 'text-emerald-400 border-emerald-500 bg-emerald-500/10' : 'text-slate-500 border-emerald-900/40 hover:text-emerald-400 hover:border-emerald-500/50',
            purple: isActive ? 'text-purple-400 border-purple-500 bg-purple-500/10' : 'text-slate-500 border-purple-900/40 hover:text-purple-400 hover:border-purple-500/50',
            orange: isActive ? 'text-orange-400 border-orange-500 bg-orange-500/10' : 'text-slate-500 border-orange-900/40 hover:text-orange-400 hover:border-orange-500/50',
            red: isActive ? 'text-red-400 border-red-500 bg-red-500/10' : 'text-slate-500 border-red-900/40 hover:text-red-400 hover:border-red-500/50',
          };

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`group/nav p-3 md:p-5 font-game text-[9px] md:text-[13px] flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 transition-all duration-500 border relative overflow-hidden ${colorClasses[tab.color]} ${isActive ? 'shadow-[inset_0_0_20px_rgba(0,0,0,0.4),0_0_15px_rgba(0,229,255,0.1)] scale-[1.02] z-10' : 'bg-black/40 hover:bg-black/60'}`}
            >
              {/* Active indicator line */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-current animate-pulse shadow-[0_0_10px_currentColor]"></div>
              )}
              
              <tab.icon size={isActive ? 20 : 18} className={`shrink-0 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover/nav:scale-110 opacity-60 group-hover/nav:opacity-100'}`} />
              <span className={`truncate max-w-full tracking-[0.2em] font-black ${isActive ? 'opacity-100' : 'opacity-40 group-hover/nav:opacity-80'}`}>
                {tab.label}
              </span>

              {/* Decorative scanline for active tab */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none"></div>
              )}
            </button>
          );
        })}
      </nav>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <aside className="lg:col-span-3 space-y-6">
          <div className="hud-board p-6 min-h-[200px] lg:min-h-[300px] border-cyan-500/20">
            <h2 className="font-game text-[11px] md:text-[12px] text-cyan-500 mb-6 flex items-center gap-2 border-b border-cyan-900/40 pb-4 uppercase tracking-widest font-bold"><Bell size={14} /> ALERTAS</h2>
            <div className="space-y-4 max-h-[150px] md:max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {messages.map((m: SystemMessage) => {
                const messageDate = new Date(m.timestamp);
                const isToday = messageDate.toDateString() === new Date().toDateString();
                const dateStr = isToday 
                  ? messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit' }) + ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={m.id} className={`text-[12px] md:text-[13px] font-medium animate-in slide-in-from-left duration-200 ${m.type === 'success' ? 'text-cyan-500' : m.type === 'error' ? 'text-red-500' : 'text-cyan-600'}`}>
                    <span className="opacity-30 text-[9px]">[{dateStr}]</span> <br />
                    <span className="font-game uppercase tracking-tight break-words">&gt; {m.text}</span>
                  </div>
                );
              })}
              {messages.length === 0 && <p className="text-[11px] text-slate-700 italic font-game uppercase">SINCRONIZANDO...</p>}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9 min-w-0">
          {activeTab === 'quests' ? (
            <>
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="font-game text-2xl md:text-3xl flex items-center gap-4 text-slate-200 uppercase tracking-tight">
                  <ScrollText size={24} className="text-cyan-500" /> Missões Ativas
                </h2>
                <button
                  onClick={() => { resetForm(); setQuestForm({ isOpen: true }); }}
                  className="w-full sm:w-auto px-6 py-3 hud-board border border-cyan-900 text-cyan-500 hover:hud-board-glow hover:text-cyan-400 font-game text-[12px] tracking-widest transition-all flex items-center justify-center gap-2 font-bold uppercase"
                >
                  <Plus size={16} /> Nova Missão
                </button>
              </div>

              <Reorder.Group axis="y" values={quests.filter(q => {
                if (q.completed || q.failed) return false;
                if (q.isScheduled && q.repeatDays) {
                  return q.repeatDays.includes(new Date().getDay());
                }
                return true;
              })} onReorder={(newOrder) => {
                const activeIds = new Set(newOrder.map(q => q.id));
                const completedOrFailed = quests.filter(q => q.completed || q.failed);
                setQuests([...newOrder, ...completedOrFailed]);
              }} className="space-y-4">
                {quests.filter(q => {
                  if (q.completed || q.failed) return false;
                  if (q.isScheduled && q.repeatDays) {
                    return q.repeatDays.includes(new Date().getDay());
                  }
                  return true;
                }).map(q => (
                  <DraggableQuestItem key={q.id} quest={q}>
                    <QuestCard
                      quest={q}
                      onToggleComplete={handleToggleComplete}
                      onToggleSubQuest={handleToggleSubQuest}
                      onDelete={handleDeleteQuest}
                      onEdit={handleEditQuest}
                      onAddSubQuest={handleAddSubQuest}
                      onRemoveSubQuest={handleRemoveSubQuest}
                    />
                  </DraggableQuestItem>
                ))}
              </Reorder.Group>
                {quests.filter(q => {
                  if (q.completed || q.failed) return false;
                  if (q.isScheduled && q.repeatDays) {
                    return q.repeatDays.includes(new Date().getDay());
                  }
                  return true;
                }).length === 0 && (
                  <div className="text-center py-20 hud-board border-dashed border border-cyan-900/30 opacity-40">
                    <p className="font-game text-[12px] text-cyan-700 tracking-widest uppercase">AGUARDANDO NOVAS MISSÕES...</p>
                  </div>
                )}

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
                        <Check size={20} className="text-cyan-800" /> Missões Concluídas (Hoje)
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
            </>
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
                  setStoreItems(prev => {
                    const existingIdx = prev.findIndex(si => si.id === i.id && si.origin === 'compra');
                    if (existingIdx > -1) {
                      return prev.map((si, idx) => idx === existingIdx ? { ...si, purchasedCount: si.purchasedCount + 1 } : si);
                    } else {
                      return [...prev, { ...i, purchasedCount: 1, origin: 'compra' }];
                    }
                  });
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
          <div className="hud-board hud-board-glow p-6 md:p-10 w-full max-w-2xl min-h-screen md:min-h-0 md:border-2 shadow-2xl relative border-cyan-900/50 flex flex-col">
            <div className="hidden md:block hud-tl hud-corner"></div><div className="hidden md:block hud-tr hud-corner"></div>
            <div className="hidden md:block hud-bl hud-corner"></div><div className="hidden md:block hud-br hud-corner"></div>

            <div className="flex justify-between items-center mb-6 md:mb-8 border-b border-cyan-900/30 pb-4 relative z-10">
              <h2 className="font-game text-xl md:text-2xl text-slate-100 uppercase font-bold tracking-tight">
                {editingQuest ? "Recalibrar Diretriz" : "Manifestação de Nova Quest"}
              </h2>
              <button onClick={() => { setQuestForm({ isOpen: false }); resetForm(); }} className="text-cyan-600 hover:text-cyan-400 md:hidden">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 md:space-y-8 relative z-10 flex-1">
              <div className="space-y-2">
                <label className="block text-[10px] md:text-[11px] font-game text-cyan-600 uppercase tracking-widest font-bold">Identificador de Objetivo</label>
                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    value={newQuestTitle}
                    onChange={e => setNewQuestTitle(e.target.value)}
                    placeholder="EX: EXTERMÍNIO DA PROCRASTINAÇÃO..."
                    className="w-full bg-black border border-cyan-900/30 p-3 md:p-4 text-slate-100 font-game text-base md:text-xl outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`flex flex-col gap-2`}>
                  <div className={`flex items-center gap-4 bg-cyan-950/10 p-4 border border-cyan-900/20 rounded-lg transition-all ${editingQuest || newQuestIsSpecial ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-900/20 cursor-pointer'}`}
                    onClick={() => !editingQuest && !newQuestIsSpecial && setNewQuestIsDaily(!newQuestIsDaily)}>
                    <button
                      disabled={!!editingQuest || newQuestIsSpecial}
                      type="button"
                      className={`p-3 border-2 transition-all flex items-center justify-center ${newQuestIsDaily ? 'bg-cyan-900/40 border-cyan-400 text-cyan-300 shadow-[0_0_10px_#10b981]' : 'bg-black border-slate-800 text-slate-700'} ${editingQuest || newQuestIsSpecial ? 'cursor-not-allowed' : ''}`}
                    >
                      {editingQuest ? <Lock size={20} /> : <CalendarDays size={20} />}
                    </button>
                    <div className="min-w-0">
                      <p className="font-game text-[11px] text-cyan-400 uppercase font-bold truncate">Quest Diária</p>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">{editingQuest ? 'Sincronizado' : (newQuestIsDaily ? 'Reset Diário Ativado' : 'Ciclo Único')}</p>
                    </div>
                  </div>
                </div>

                <div className={`flex flex-col gap-2`}>
                  <div className={`flex items-center gap-4 p-4 border rounded-lg transition-all ${editingQuest || newQuestIsDaily ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-900/10' : newQuestIsSpecial ? 'border-orange-500/50 bg-orange-900/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-orange-900/30 bg-orange-950/10 hover:border-orange-700/50 cursor-pointer'}`}
                    onClick={() => !editingQuest && !newQuestIsDaily && setNewQuestIsSpecial(!newQuestIsSpecial)}>
                    <button
                      disabled={!!editingQuest || newQuestIsDaily}
                      type="button"
                      className={`p-3 border-2 transition-all flex items-center justify-center ${newQuestIsSpecial ? 'bg-orange-900/40 border-orange-400 text-orange-300 shadow-[0_0_10px_#a855f7]' : 'bg-black border-slate-800 text-slate-700'} ${editingQuest || newQuestIsDaily ? 'cursor-not-allowed' : ''}`}
                    >
                      {editingQuest ? <Lock size={20} /> : <Zap size={20} />}
                    </button>
                    <div className="min-w-0">
                      <p className={`font-game text-[11px] uppercase font-bold truncate ${newQuestIsSpecial ? 'text-orange-400' : 'text-orange-600'}`}>Quest Especial</p>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">{newQuestIsSpecial ? 'Expira Meia-Noite' : 'Opcional'}</p>
                    </div>
                  </div>
                </div>

                <div className={`flex flex-col gap-2`}>
                  <div className={`flex items-center gap-4 bg-indigo-950/10 p-4 border border-indigo-900/20 rounded-lg transition-all ${editingQuest || newQuestIsDaily || newQuestIsSpecial ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-900/20 cursor-pointer'}`}
                    onClick={() => !editingQuest && !newQuestIsDaily && !newQuestIsSpecial && setNewQuestIsScheduled(!newQuestIsScheduled)}>
                    <button
                      disabled={!!editingQuest || newQuestIsDaily || newQuestIsSpecial}
                      type="button"
                      className={`p-3 border-2 transition-all flex items-center justify-center ${newQuestIsScheduled ? 'bg-indigo-900/40 border-indigo-400 text-indigo-300 shadow-[0_0_10px_#818cf8]' : 'bg-black border-slate-800 text-slate-700'} ${editingQuest || newQuestIsDaily || newQuestIsSpecial ? 'cursor-not-allowed' : ''}`}
                    >
                      {editingQuest ? <Lock size={20} /> : <Timer size={20} />}
                    </button>
                    <div className="min-w-0">
                      <p className="font-game text-[11px] text-indigo-400 uppercase font-bold truncate">Quest Programada</p>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">{newQuestIsScheduled ? 'Repetição Semanal' : 'Não Selecionado'}</p>
                    </div>
                  </div>
                </div>

                {newQuestIsScheduled && (
                  <div className="col-span-1 sm:col-span-2 space-y-3 bg-indigo-950/20 p-4 border border-indigo-900/30 rounded-lg">
                    <label className="block text-[10px] font-game text-indigo-500 uppercase tracking-widest font-bold mb-2">Dias de Ativação</label>
                    <div className="flex justify-between gap-1">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                        <button
                          key={day}
                          onClick={() => {
                            if (newQuestRepeatDays.includes(index)) {
                              setNewQuestRepeatDays(newQuestRepeatDays.filter(d => d !== index));
                            } else {
                              setNewQuestRepeatDays([...newQuestRepeatDays, index].sort());
                            }
                          }}
                          className={`flex-1 py-2 font-game text-[10px] border transition-all ${newQuestRepeatDays.includes(index) ? 'bg-indigo-500 border-indigo-400 text-black font-bold shadow-[0_0_10px_rgba(129,140,248,0.5)]' : 'bg-black border-indigo-900/30 text-indigo-900 hover:border-indigo-700'}`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!newQuestIsDaily && !newQuestIsSpecial && !newQuestIsScheduled && (
                  <div className={`p-4 border flex flex-col justify-center transition-all bg-red-900/20 ${newQuestDeadline ? 'border-red-500/50' : 'border-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}>
                    <label className="block text-[10px] md:text-[11px] font-game text-red-400 uppercase font-bold mb-1 flex items-center gap-2">
                      <CalendarDays size={16} className="text-red-500" /> Quest Única {editingQuest && (editingQuest?.deadlineEdits || 0) >= 1 ? '(LIMITE DE EDIÇÃO ATINGIDO)' : editingQuest ? '(APENAS UMA EDIÇÃO PERMITIDA)' : '(PRAZO OBRIGATÓRIO)'}
                    </label>
                    <input
                      disabled={!!editingQuest && (editingQuest?.deadlineEdits || 0) >= 1}
                      type="datetime-local"
                      value={newQuestDeadline}
                      onChange={e => setNewQuestDeadline(e.target.value)}
                      className={`bg-black/60 border border-red-900/60 text-red-400 p-2 text-[10px] md:text-xs font-game outline-none focus:border-red-500 transition-all ${!!editingQuest && (editingQuest?.deadlineEdits || 0) >= 1 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    />
                  </div>
                )}

                {newQuestIsSpecial && (
                  <div className="p-4 border border-orange-900/30 bg-orange-950/20 flex items-center gap-3 md:col-span-2">
                    <AlertTriangle size={16} className="text-orange-500 shrink-0 animate-pulse" />
                    <p className="text-[9px] text-orange-200 uppercase leading-tight font-medium font-game tracking-wider">
                      Operações urgentes expiram e desaparecem às 23:59:59 do mesmo dia. Falhar gera uma punição (+10% Corrupção).
                    </p>
                  </div>
                )}

                {newQuestIsDaily && (
                  <div className="p-4 border border-orange-900/20 bg-orange-950/5 flex items-center gap-3">
                    <AlertTriangle size={16} className="text-orange-600 shrink-0" />
                    <p className="text-[9px] text-slate-500 uppercase leading-tight font-medium">
                      Quests diárias resetam à meia-noite. Falha em completar resulta em punição de mana.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="block text-[10px] md:text-[11px] font-game text-cyan-600 uppercase tracking-widest font-bold">Rank do Portal</label>
                  <span className="text-[9px] md:text-[10px] font-game text-slate-600 uppercase font-bold">VOCÊ É {profile.rank}</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Object.values(QuestDifficulty).map(d => {
                    // PROTOCOLO 1.2: Apenas Rank S requer Rank S. Outros estão liberados até Rank A.
                    const isLocked = d === QuestDifficulty.S && profile.rank !== Rank.S;
                    const isActive = d === newQuestDifficulty;
                    const rankStyle = RANK_COLORS[d as unknown as Rank] || '';
                    const textClass = rankStyle.split(' ').find(c => c.startsWith('text-')) || 'text-slate-500';
                    const borderClass = rankStyle.split(' ').find(c => c.startsWith('border-')) || 'border-slate-500';
                    const neonClass = rankStyle.split(' ').find(c => c.startsWith('neon-text-')) || '';

                    return (
                      <button
                        key={d}
                        disabled={isLocked}
                        onClick={() => setNewQuestDifficulty(d)}
                        className={`rank-cell h-14 md:h-16 border flex flex-col items-center justify-center gap-1 transition-all ${isLocked
                          ? 'border-red-950/10 bg-red-950/5 text-red-900/20 cursor-not-allowed'
                          : isActive
                            ? `rank-cell-active ${borderClass} bg-black/60 ${textClass} shadow-[0_0_15px_rgba(0,0,0,0.3)] ${neonClass}`
                            : `border-slate-800 bg-black/40 ${textClass} opacity-40 hover:opacity-100 hover:${borderClass}`
                          }`}
                      >
                        {isLocked ? (
                          <Lock size={12} />
                        ) : (
                          <>
                            <span className={`font-game text-lg md:text-xl font-black ${isActive ? textClass : 'text-slate-500'}`}>{d}</span>
                            <span className="font-game text-[8px] tracking-tighter font-bold uppercase hidden md:inline">RANK {d}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-900 mt-auto">
                <button onClick={() => { setQuestForm({ isOpen: false }); resetForm(); }} className="hidden sm:block flex-1 py-4 font-game text-[11px] text-slate-600 hover:text-red-500 hover:bg-red-950/20 border border-transparent hover:border-red-900/40 transition-all uppercase font-bold tracking-widest">Cancelar</button>
                <button
                  onClick={handleSaveQuest}
                  disabled={isFormInvalid}
                  className={`flex-1 py-4 border-2 font-game text-[12px] md:text-[13px] transition-all font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 ${isFormInvalid
                    ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed grayscale'
                    : 'bg-slate-900 border-cyan-800 text-cyan-400 hover:bg-cyan-800 hover:border-cyan-400'
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
    </>
  );
};

export default App;
