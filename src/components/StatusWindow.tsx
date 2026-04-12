
import React from 'react';
import { HunterProfile, Rank, Quest } from '../types';
import { RANK_COLORS, STREAK_TIERS, getCurrentStreakTier, getStreakMultiplier } from '../constants';
import {
  Sparkles,
  Clock,
  Trophy,
  Database,
  Flame,
  CalendarDays,
  Check,
  X
} from 'lucide-react';

interface StatusWindowProps {
  profile: HunterProfile;
  quests: Quest[];
  compact?: boolean;
}

const StatusCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  mainValue: string;
  subValue?: string;
  bonusText?: string;
  progress: number;
  progressLabel: string;
  remainingLabel: string;
  color: string;
  bgColor?: string;
}> = ({ icon, label, mainValue, subValue, bonusText, progress, progressLabel, remainingLabel, color, bgColor = "bg-slate-950/20" }) => {
  return (
    <div className={`hud-board p-5 border-white/5 relative overflow-hidden ${bgColor} group transition-all duration-500 hover:bg-slate-950/40`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5">
          <div className={`relative p-3 bg-black/60 border border-white/5 ${color}`}>
            {React.cloneElement(icon as any, { size: 24, className: "opacity-80" })}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={`font-game text-[9px] uppercase tracking-[0.3em] font-bold opacity-60 ${color}`}>
                {label}
              </h3>
            </div>
            <p className="font-game text-3xl text-white tracking-widest font-black uppercase leading-tight">
              {mainValue} {subValue && <span className={`text-[12px] font-bold ml-1 opacity-40 ${color}`}>{subValue}</span>}
            </p>
          </div>
        </div>

        {bonusText && (
          <div className="flex flex-col items-end gap-2">
            <div className={`px-4 py-1.5 border ${color.replace('text-', 'border-')}/10 bg-black/40 ${color} font-game text-[11px] uppercase tracking-[0.15em] font-bold flex items-center gap-3 backdrop-blur-md`}>
              {bonusText}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-1.5">
        <div className={`flex justify-between font-game text-[9px] ${color} uppercase tracking-wider opacity-60`}>
          <span>{progressLabel}</span>
          <span>{remainingLabel}</span>
        </div>
        <div className="h-1.5 bg-black/60 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-1000 ${color} relative`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: 'currentColor' }}
          >
            <div className="absolute inset-0 opacity-30 shimmer-gradient shimmer-animated"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusWindow: React.FC<StatusWindowProps> = ({ profile, quests, compact }) => {
  const rankProgression = [
    { rank: Rank.E, minLevel: 1, maxLevel: 19, label: 'CAÇADOR RANK E' },
    { rank: Rank.D, minLevel: 20, maxLevel: 39, label: 'CAÇADOR DESPERTO' },
    { rank: Rank.C, minLevel: 40, maxLevel: 59, label: 'MEMBRO DE ELITE' },
    { rank: Rank.B, minLevel: 60, maxLevel: 79, label: 'CAÇADOR DE ALTO NÍVEL' },
    { rank: Rank.A, minLevel: 80, maxLevel: 99, label: 'REI DOS CAÇADORES' },
    { rank: Rank.S, minLevel: 100, maxLevel: 999, label: 'MONARCA DAS SOMBRAS' },
  ];

  const XP_DROP_THRESHOLD = 50000;
  
  const currentRankIdx = rankProgression.findIndex(r => r.rank === profile.rank);
  const nextRank = rankProgression[currentRankIdx + 1];
  const rankProgress = nextRank 
    ? ((profile.level - (rankProgression[currentRankIdx].minLevel)) / (nextRank.minLevel - rankProgression[currentRankIdx].minLevel)) * 100 
    : 100;

  const rareDropProgress = ((profile.totalXpGained || 0) % XP_DROP_THRESHOLD) / XP_DROP_THRESHOLD * 100;
  const xpRemainingForDrop = XP_DROP_THRESHOLD - ((profile.totalXpGained || 0) % XP_DROP_THRESHOLD);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* HUD Cards Section */}
      <div className={`grid grid-cols-1 ${compact ? '' : 'md:grid-cols-2'} gap-6`}>
        <StatusCard
          icon={<Trophy />}
          label="EVOLUÇÃO_DE_RANK"
          mainValue={profile.rank}
          subValue={nextRank ? `PARA RANK ${nextRank.rank}` : "RANK MÁXIMO"}
          progress={rankProgress}
          progressLabel={nextRank ? `PROGRESSO PARA ${nextRank.label}` : "MONARCA SUPREMO"}
          remainingLabel={nextRank ? `${nextRank.minLevel - profile.level} NÍVEIS RESTANTES` : "EVOLUÇÃO CONCLUÍDA"}
          color={profile.rank === Rank.S ? "text-red-500" : "text-emerald-500"}
        />
        {!compact && (
          <StatusCard
            icon={<Sparkles />}
            label="PROXIMIDADE_DE_DROP"
            mainValue="ITEM RARO"
            subValue={`${Math.floor(rareDropProgress)}%`}
            progress={rareDropProgress}
            progressLabel="PROGRESSO DE RECOMPENSA"
            remainingLabel={`${(xpRemainingForDrop / 1000).toFixed(1)}K XP PARA O DROP`}
            color="text-lime-500"
          />
        )}
      </div>

      {!compact && (
        <div className="hud-board p-8 border-white/5 relative overflow-hidden bg-slate-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="relative p-4 bg-black/40 border border-white/10 text-emerald-400">
                <Database size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-3 bg-emerald-600"></div>
                  <h3 className="font-game text-[10px] text-emerald-700 uppercase tracking-[0.4em] font-black opacity-80">RESERVA_ESTÁVEL_DE_MANA</h3>
                </div>
                <p className="font-game text-4xl text-white tracking-widest font-black">
                  {(profile.totalXpGained || 0).toLocaleString()} <span className="text-sm text-emerald-900 font-bold ml-1 opacity-50">XP_TOTAL</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="px-5 py-2 border border-white/5 text-emerald-600 font-game text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-emerald-900 rounded-full"></span>
                CONEXÃO_ATIVA
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ofensiva do Sistema (Streak) */}
      {(() => {
        const currentTier = getCurrentStreakTier(profile.dailyStreak || 0);
        const currentTierIdx = STREAK_TIERS.findIndex(t => t.name === currentTier.name);
        const nextTier = STREAK_TIERS[currentTierIdx + 1];
        
        const currentMin = STREAK_TIERS[currentTierIdx].minDays;
        const nextMin = nextTier ? nextTier.minDays : currentMin;
        const progress = nextTier ? (((profile.dailyStreak || 0) - currentMin) / (nextMin - currentMin) * 100) : 100;

        return (
          <StatusCard
            icon={<Flame />}
            label="TIER_DE_CONSISTÊNCIA"
            mainValue={currentTier.name}
            subValue={`${profile.dailyStreak || 0}_DIAS`}
            bonusText={`BÔNUS: +${Math.round((getStreakMultiplier(profile.dailyStreak || 0) - 1) * 100)}% GERAL`}
            progress={progress}
            progressLabel={nextTier ? `PROGRESSO PARA ${nextTier.name}` : "TIER MÁXIMO ALCANÇADO"}
            remainingLabel={nextTier ? `${nextMin - (profile.dailyStreak || 0)} DIAS RESTANTES` : "MONARCA DA CONSTÂNCIA"}
            color={currentTier.color}
            bgColor="bg-emerald-950/10"
          />
        );
      })()}

      {/* Efeitos Ativos (Buffs) */}
      <div className="space-y-6 mt-8">
        <h3 className="font-game text-[14px] text-slate-400 uppercase flex items-center gap-3 border-b border-white/10 pb-3 font-black tracking-widest">
          <Sparkles size={16} className="text-emerald-500" /> EFEITOS ATIVOS (BUFFS)
        </h3>

        <div className={`grid grid-cols-1 ${compact ? '' : 'md:grid-cols-2'} gap-4`}>
          {profile.activeBuffs.length === 0 ? (
            <div className={`${compact ? '' : 'md:col-span-2'} py-12 flex flex-col items-center opacity-40 border border-dashed border-emerald-900/30 bg-emerald-950/5 text-center p-6 rounded-xl`}>
              <Sparkles size={32} className="text-emerald-900 mb-4" />
              <p className="font-game text-emerald-800 text-[10px] uppercase tracking-[0.2em] font-bold">SEM BUFFS</p>
            </div>
          ) : (
            profile.activeBuffs.map(buff => (
              <div key={buff.id} className={`hud-board border-white/10 ${compact ? 'p-4' : 'p-6'} relative overflow-hidden group bg-slate-950/40 hover:bg-slate-900/40 transition-all duration-300`}>
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/60 border border-white/10 text-emerald-400 font-game">
                      {buff.icon || '✨'}
                    </div>
                    <div>
                      <h4 className={`font-game ${compact ? 'text-[12px]' : 'text-[14px]'} text-white uppercase tracking-tight font-black`}>{buff.name}</h4>
                      {!compact && <p className="text-[11px] text-slate-500 italic leading-tight font-medium max-w-[200px]">{buff.description}</p>}
                    </div>
                  </div>
                  {buff.value && (
                    <div className="font-game text-[10px] text-emerald-400 border border-emerald-500/30 px-2 py-0.5 bg-emerald-950/40 font-black">
                      {buff.value}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Relatório de Tarefas Diárias e Programadas */}
      {!compact && (
        <div className="space-y-6 mt-8">
          <h3 className="font-game text-[14px] text-slate-400 uppercase flex items-center gap-3 border-b border-white/10 pb-3 font-black tracking-widest">
            <CalendarDays size={16} className="text-cyan-500" /> HISTÓRICO DE TAREFAS RECORRENTES
          </h3>

          <div className="space-y-4">
            {quests.filter(q => q.isDaily || q.isScheduled).length === 0 ? (
               <div className="py-8 text-center text-slate-500 font-game text-[10px] uppercase">
                 NENHUMA TAREFA RECORRENTE REGISTRADA
               </div>
            ) : (
               quests.filter(q => q.isDaily || q.isScheduled).map(quest => {
                 const today = new Date();
                 today.setHours(0, 0, 0, 0); // Normalize time
                 
                 const currentDayOfWeek = today.getDay(); // 0-6 (Sun-Sat)
                 const endOfWeek = new Date(today);
                 endOfWeek.setDate(today.getDate() + (6 - currentDayOfWeek));

                 const WEEKS = 15;
                 const totalDays = WEEKS * 7;
                 const daysArr = Array.from({length: totalDays}).map((_, i) => {
                   const d = new Date(endOfWeek);
                   d.setDate(endOfWeek.getDate() - (totalDays - 1 - i));
                   return d;
                 });

                 // Calcula estatísticas
                 const completedCount = (quest.history || []).filter(h => h.status === 'completed').length + (quest.completed ? 1 : 0);

                 return (
                   <div key={quest.id} className="hud-board bg-slate-950/40 p-5 md:p-6 border-white/10 flex flex-col gap-5 group hover:bg-slate-900/40 transition-colors duration-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-game text-[14px] text-white uppercase tracking-tight font-black flex items-center gap-2">
                            {quest.title} 
                            {quest.isDaily ? <span className="text-[9px] font-game bg-emerald-500/20 text-emerald-400 px-2 py-0.5 border border-emerald-500/30">DIÁRIO</span> : <span className="text-[9px] font-game bg-purple-500/20 text-purple-400 px-2 py-0.5 border border-purple-500/30">PROGRAMADA</span>}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="font-game text-[10px] text-slate-500 uppercase tracking-widest block mb-0.5">CONCLUSÕES TOTAIS</span>
                          <span className="font-game text-xl text-emerald-400 drop-shadow-[0_0_5px_#10b981] leading-none">{completedCount}</span>
                        </div>
                      </div>
                      
                      <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                        <div className="min-w-fit flex flex-col gap-1 w-full items-center md:items-start">
                          <div className="grid grid-rows-7 grid-flow-col gap-[3px] md:gap-[4px]">
                            {daysArr.map((dateObj, idx) => {
                              const dateStr = dateObj.toDateString();
                              const isFuture = dateObj > today;
                              
                              let status: 'completed' | 'ignored' | 'pending' | 'inactive' | 'future' = 'inactive';
                              
                              if (isFuture) {
                                status = 'future';
                              } else {
                                const isToday = dateStr === today.toDateString();
                                
                                if (quest.isDaily) status = 'pending';
                                if (quest.isScheduled && quest.repeatDays?.includes(dateObj.getDay())) status = 'pending';
  
                                const historyEntry = quest.history?.find(h => h.date === dateStr);
                                if (historyEntry) {
                                  status = historyEntry.status as any;
                                } else if (isToday) {
                                  if (status === 'pending') {
                                    if (quest.completed) status = 'completed';
                                  }
                                } else {
                                  if (quest.createdAt && dateObj.getTime() < new Date(new Date(quest.createdAt).toDateString()).getTime()) {
                                     status = 'inactive';
                                  } else if (status === 'pending') {
                                     status = 'ignored';
                                  }
                                }
                              }
  
                              // GitHub Style Colors
                              let colorClass = 'bg-white/5 border border-white/5'; // inactive/future/not scheduled
                              
                              if (status === 'completed') {
                                // varying opacity could depend on how many times completed but quests are binary, so just bright green
                                colorClass = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] border-emerald-400 z-10 relative scale-[1.05]';
                              } else if (status === 'ignored') {
                                colorClass = 'bg-red-950/60 border border-red-900/40 relative group/tile';
                              } else if (status === 'pending') {
                                colorClass = 'bg-cyan-900/50 border border-cyan-500/50 shadow-[inset_0_0_5px_#06b6d4] animate-[pulse_2s_ease-in-out_infinite] relative';
                              }
  
                              return (
                                <div 
                                  key={idx} 
                                  title={`${dateObj.toLocaleDateString()} - ${status.toUpperCase()}`} 
                                  className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-[2px] transition-all duration-300 hover:scale-[1.5] hover:z-20 cursor-crosshair ${colorClass}`}
                                >
                                  {status === 'ignored' && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/tile:opacity-100 transition-opacity"><X size={8} className="text-red-500" /></div>}
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="flex justify-between items-center mt-2 font-game text-[8px] text-slate-600 uppercase tracking-widest pl-1 w-full">
                            <span>{WEEKS} SEMANAS ATRÁS</span>
                            <span>HOJE</span>
                          </div>
                        </div>
                      </div>
                   </div>
                 );
               })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusWindow;
