
import React from 'react';
import { HunterProfile, Rank } from '../types';
import { RANK_COLORS, STREAK_TIERS, getCurrentStreakTier, getStreakMultiplier } from '../constants';
import {
  Sparkles,
  Clock,
  Lock,
  CheckCircle2,
  Trophy,
  Dna,
  Database,
  Zap,
  Flame
} from 'lucide-react';

interface StatusWindowProps {
  profile: HunterProfile;
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
}> = ({ icon, label, mainValue, subValue, bonusText, progress, progressLabel, remainingLabel, color, bgColor = "bg-slate-950/40" }) => {
  return (
    <div className={`hud-board p-8 border-white/5 relative overflow-hidden ${bgColor} group transition-all duration-500`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
        <div className="flex items-center gap-6">
          <div className={`relative p-4 bg-black/40 border border-white/10 ${color}`}>
            {React.cloneElement(icon as any, { size: 28, className: "drop-shadow-[0_0_10px_currentColor]" })}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-1 h-3 ${color.replace('text-', 'bg-')}`}></div>
              <h3 className={`font-game text-[10px] uppercase tracking-[0.4em] font-black opacity-80 ${color}`}>
                {label}
              </h3>
            </div>
            <p className="font-game text-4xl text-white tracking-widest font-black uppercase">
              {mainValue} {subValue && <span className={`text-sm font-bold ml-1 opacity-50 ${color}`}>{subValue}</span>}
            </p>
          </div>
        </div>

        {bonusText && (
          <div className="flex flex-col items-end gap-2">
            <div className={`px-5 py-2 border ${color.replace('text-', 'border-')}/20 ${color.replace('text-', 'bg-')}/10 ${color} font-game text-[14px] uppercase tracking-[0.2em] font-black flex items-center gap-3 shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
              {bonusText}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2 border-t border-white/5 pt-4">
        <div className={`flex justify-between font-game text-[10px] ${color} uppercase`}>
          <span>{progressLabel}</span>
          <span className="font-bold">{remainingLabel}</span>
        </div>
        <div className={`h-8 bg-black border border-current overflow-hidden p-1 ${color} shadow-sm`}>
          <div
            className={`h-full transition-all duration-1000 ${color} relative overflow-hidden`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: 'currentColor' }}
          >
            <div className="absolute inset-0 shimmer-gradient shimmer-animated"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusWindow: React.FC<StatusWindowProps> = ({ profile }) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      {/* Registro de XP Acumulado */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Lógica de Rank do Sistema */}
        <div className="space-y-4">
          <h3 className="font-game text-[12px] text-slate-500 uppercase flex items-center gap-2 border-b border-white/5 pb-2 font-bold tracking-widest">
            <Dna size={14} /> HIERARQUIA DO DESPERTAR
          </h3>

          <div className="space-y-3">
            {rankProgression.map((item) => {
              const isCurrent = profile.rank === item.rank;
              const isAchieved = profile.level >= item.minLevel;
              const isLocked = profile.level < item.minLevel;

              return (
                <div
                  key={item.rank}
                  className={`hud-board p-6 md:p-7 transition-all duration-500 relative overflow-hidden group/rank ${isCurrent
                    ? `border-white/20 bg-white/5 shadow-[0_0_25px_rgba(255,255,255,0.05)]`
                    : isAchieved
                      ? 'border-white/5 opacity-60 bg-slate-900/20'
                      : 'border-white/5 opacity-20'
                    }`}
                >
                  {/* Background Rank Letter */}
                  <span className={`absolute -right-4 -bottom-8 font-game text-[120px] font-black pointer-events-none transition-all duration-1000 select-none ${
                    isCurrent ? 'opacity-10 scale-110' : 'opacity-5'
                  }`}>
                    {item.rank}
                  </span>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6 w-full">
                      <div className="relative">
                        <div className={`font-game text-3xl w-16 h-16 flex flex-col items-center justify-center border font-black relative overflow-hidden transition-all duration-500 ${isCurrent 
                          ? `text-white border-white/40 bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)]` 
                          : isAchieved 
                            ? 'text-slate-500 border-white/10 bg-slate-800/20' 
                            : 'text-slate-900 border-white/5 bg-black/10'
                          }`}>
                          <span className="relative z-10">{item.rank}</span>
                          {isCurrent && (
                             <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className={`font-game text-[14px] uppercase tracking-[0.1em] font-black ${isCurrent ? 'text-white' : 'text-slate-600'}`}>
                            {item.label}
                          </h4>
                          {isCurrent && (
                            <span className="text-[8px] font-game bg-white/20 text-white px-1.5 py-0.5 font-black uppercase tracking-widest animate-pulse">
                              ATUAL
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-1 h-2 ${isLocked ? 'bg-slate-900' : isCurrent ? 'bg-white/40' : 'bg-slate-700'}`}></div>
                          <p className={`text-[10px] font-game uppercase font-black tracking-widest ${isLocked ? 'text-slate-800' : isCurrent ? 'text-white/60' : 'text-slate-700'}`}>
                            {isLocked ? `REQUISITO: NÍVEL ${item.minLevel}` : `STATUS: CLASSIFICAÇÃO_CONFIRMADA`}
                          </p>
                        </div>
                        
                        {isCurrent && nextRank && (
                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between font-game text-[10px] text-white/50 uppercase">
                              <span>PROGRESSO PARA {nextRank.label}</span>
                              <span className="font-bold">{nextRank.minLevel - profile.level} NÍVEIS RESTANTES</span>
                            </div>
                            <div className={`h-8 bg-black border border-current overflow-hidden p-1 text-white/40`}>
                              <div 
                                className={`h-full transition-all duration-1000 text-white shadow-[0_0_10px_currentColor] relative overflow-hidden`}
                                style={{ width: `${rankProgress}%`, backgroundColor: 'currentColor' }}
                              >
                                <div className="absolute inset-0 shimmer-gradient shimmer-animated opacity-30"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      {isCurrent ? (
                        <Zap size={20} className="text-white animate-pulse" />
                      ) : isAchieved ? (
                        <CheckCircle2 size={24} className="text-slate-700 opacity-50" />
                      ) : (
                        <Lock size={20} className="text-slate-800" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Efeitos Ativos (Buffs) */}
        <div className="space-y-4">
          <h3 className="font-game text-[12px] text-slate-500 uppercase flex items-center gap-2 border-b border-white/5 pb-2 font-bold tracking-widest">
            <Sparkles size={14} /> EFEITOS ATIVOS (BUFFS)
          </h3>

          <div className="space-y-3">
            {profile.activeBuffs.length === 0 ? (
              <div className="py-24 flex flex-col items-center opacity-30 border border-dashed border-sky-900/30 shadow-none text-center p-8">
                <Sparkles size={48} className="text-sky-900 mb-4" />
                <p className="font-game text-sky-800 text-[11px] uppercase tracking-widest font-bold">NENHUM EFEITO DETECTADO</p>
                <p className="text-[10px] text-slate-600 mt-2 uppercase font-medium">ADQUIRA RELÍQUIAS PARA MANIFESTAR NOVOS PODERES.</p>
              </div>
            ) : (
              profile.activeBuffs.map(buff => (
                <div key={buff.id} className="hud-board border-white/10 p-6 md:p-7 relative overflow-hidden group bg-slate-950/40 hover:bg-slate-900/40 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-black/60 border border-white/10 text-emerald-400 font-game shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">
                        {buff.icon || '✨'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-game text-[14px] text-white uppercase tracking-tight font-black">{buff.name}</h4>
                          <span className={`text-[8px] font-game px-1.5 py-0.5 font-black uppercase tracking-tighter shadow-sm ${
                            buff.type === 'timed' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                            buff.type === 'passive' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}>
                            {buff.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 italic leading-tight font-medium max-w-[200px]">{buff.description}</p>
                      </div>
                    </div>
                    {buff.value && (
                      <div className="font-game text-[12px] text-emerald-400 border border-emerald-500/30 px-2.5 py-1 bg-emerald-950/40 font-black shadow-inner">
                        {buff.value}
                      </div>
                    )}
                  </div>

                  {buff.endTime && (
                    <div className="mt-4 space-y-2 relative z-10">
                      <div className="flex justify-between font-game text-[10px] text-emerald-400 uppercase">
                        <span>TEMPO RESTANTE</span>
                        <span className="font-bold">{Math.max(0, Math.floor((buff.endTime - Date.now()) / 60000))} MINUTOS</span>
                      </div>
                      <div className="h-8 bg-black border border-emerald-900/50 overflow-hidden p-1">
                        <div 
                          className="h-full transition-all duration-1000 bg-emerald-500 shadow-[0_0_10px_#10b981] relative overflow-hidden"
                          style={{ width: `${Math.max(0, Math.min(100, ((buff.endTime - Date.now()) / 3600000) * 100))}%` }}
                        >
                          <div className="absolute inset-0 shimmer-gradient shimmer-animated"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Decorative background element for buff cards */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none group-hover:bg-emerald-500/10 transition-all"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusWindow;
