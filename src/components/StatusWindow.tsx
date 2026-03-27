
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

const CircularProgress: React.FC<{
  progress: number;
  label: string;
  subLabel?: string;
  color: string;
  icon: React.ReactNode;
}> = ({ progress, label, color }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const uniqueId = label.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className="hud-board p-6 flex flex-col items-center justify-center relative overflow-hidden bg-slate-950/40 transition-all duration-700 border-white/5 min-h-[380px] w-full">
      <div className="relative w-60 h-60 mb-8 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 relative z-10 p-2" viewBox="0 0 200 200">
          <defs>
            <mask id={`mask-${uniqueId}`}>
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="white"
                strokeWidth="14"
                strokeDasharray="5 2.5"
              />
            </mask>
          </defs>

          {/* Background Ring (Static Gray Ticks) */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="fill-none stroke-white/[0.05]"
            strokeWidth="14"
            strokeDasharray="5.5 2.5"
          />
          
          {/* Functional Progress Ring (Masked Solid Color) */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className={`fill-none transition-all duration-[1500ms] ease-out ${color.split(' ')[0]}`}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            mask={`url(#mask-${uniqueId})`}
          />

          {/* Solid Inner Border */}
          <circle
            cx="100"
            cy="100"
            r={radius - 14}
            className="fill-none stroke-white/10"
            strokeWidth="1"
          />
        </svg>

        {/* Center Content - Ultra Tight Alignment */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="flex items-baseline justify-center">
            <span className="font-game text-6xl text-white font-black tracking-[-0.1em] text-shadow-glow">
              {Math.floor(progress)}
            </span>
            <span className="font-game text-2xl text-white/40 font-bold -ml-1.5">
              %
            </span>
          </div>
        </div>
      </div>

      <div className="text-center relative z-10 w-full px-4">
        <h4 className="font-game text-[16px] text-white uppercase tracking-[0.5em] font-black drop-shadow-2xl opacity-90 transition-opacity">
          {label}
        </h4>
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
  const levelProgress = (profile.xp / profile.maxXp) * 100;

  const currentRankIdx = rankProgression.findIndex(r => r.rank === profile.rank);
  const nextRank = rankProgression[currentRankIdx + 1];
  const rankProgress = nextRank 
    ? ((profile.level - (rankProgression[currentRankIdx].minLevel)) / (nextRank.minLevel - rankProgression[currentRankIdx].minLevel)) * 100 
    : 100;

  const rareDropProgress = (profile.totalXpGained % XP_DROP_THRESHOLD) / XP_DROP_THRESHOLD * 100;
  const xpRemainingForDrop = XP_DROP_THRESHOLD - (profile.totalXpGained % XP_DROP_THRESHOLD);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* HUD Circular Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CircularProgress 
          progress={Math.min(100, rankProgress)} 
          label="PRÓXIMO RANK" 
          subLabel={nextRank ? `EVOLUÇÃO PARA RANK ${nextRank.rank}` : "RANK MÁXIMO ATINGIDO"}
          color={profile.rank === Rank.S ? "stroke-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]" : "stroke-orange-500"}
          icon={<Trophy size={16} />} 
        />
        <CircularProgress 
          progress={rareDropProgress} 
          label="ITEM RARO" 
          subLabel={`${Math.floor(xpRemainingForDrop / 1000)}K XP PARA O DROP`}
          color="stroke-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
          icon={<Sparkles size={16} />} 
        />
      </div>

      {/* Registro de XP Acumulado */}
      <div className="hud-board p-8 border-white/5 relative overflow-hidden bg-slate-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="relative p-4 bg-black/40 border border-white/10 text-cyan-400">
              <Database size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-3 bg-cyan-600"></div>
                <h3 className="font-game text-[10px] text-cyan-700 uppercase tracking-[0.4em] font-black opacity-80">RESERVA_ESTÁVEL_DE_MANA</h3>
              </div>
              <p className="font-game text-4xl text-white tracking-widest font-black">
                {profile.totalXpGained.toLocaleString()} <span className="text-sm text-cyan-900 font-bold ml-1 opacity-50">XP_TOTAL</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-5 py-2 border border-white/5 text-cyan-600 font-game text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-cyan-900 rounded-full"></span>
              CONEXÃO_ATIVA
            </div>
          </div>
        </div>
      </div>

      {/* Ofensiva do Sistema (Streak) */}
      <div className="hud-board p-8 border-white/5 relative overflow-hidden bg-amber-950/10 group hover:bg-amber-950/20 transition-all duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className={`relative p-4 bg-black/40 border border-white/10 ${getCurrentStreakTier(profile.dailyStreak || 0).color}`}>
              <Flame size={28} className="drop-shadow-[0_0_10px_currentColor]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-3 bg-amber-600"></div>
                <h3 className="font-game text-[10px] text-amber-700 uppercase tracking-[0.4em] font-black opacity-80">TIER_DE_CONSISTÊNCIA</h3>
              </div>
              <p className="font-game text-4xl text-white tracking-widest font-black">
                {getCurrentStreakTier(profile.dailyStreak || 0).name} <span className={`text-sm font-bold ml-1 opacity-50 ${getCurrentStreakTier(profile.dailyStreak || 0).color}`}>{profile.dailyStreak || 0}_DIAS</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="px-5 py-2 border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 font-game text-[14px] uppercase tracking-[0.2em] font-black flex items-center gap-3 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
               BÔNUS: +{Math.round((getStreakMultiplier(profile.dailyStreak || 0) - 1) * 100)}% GERAL
            </div>
          </div>
        </div>
        
        {(() => {
          const currentTier = getCurrentStreakTier(profile.dailyStreak || 0);
          const currentTierIdx = STREAK_TIERS.findIndex(t => t.name === currentTier.name);
          const nextTier = STREAK_TIERS[currentTierIdx + 1];
          if (nextTier) {
            const currentMin = STREAK_TIERS[currentTierIdx].minDays;
            const nextMin = nextTier.minDays;
            const progress = ((profile.dailyStreak || 0) - currentMin) / (nextMin - currentMin) * 100;
            return (
              <div className="mt-6 space-y-1.5 border-t border-white/5 pt-4">
                <div className="flex justify-between text-[8px] font-game text-slate-500 uppercase tracking-widest">
                  <span>PROGRESSO PARA {nextTier.name}</span>
                  <span>{nextMin - (profile.dailyStreak || 0)} DIAS RESTANTES</span>
                </div>
                <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${nextTier.color.replace('text-', 'bg-')}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>

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
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2 relative">
                            <div 
                              className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-1000 shadow-[0_0_10px_white]"
                              style={{ width: `${rankProgress}%` }}
                            ></div>
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
                      <div className="p-3 bg-black/60 border border-white/10 text-cyan-400 font-game shadow-[0_0_15px_rgba(34,211,238,0.1)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all">
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
                      <div className="font-game text-[12px] text-cyan-400 border border-cyan-500/30 px-2.5 py-1 bg-cyan-950/40 font-black shadow-inner">
                        {buff.value}
                      </div>
                    )}
                  </div>

                  {buff.endTime && (
                    <div className="mt-4 space-y-1.5 relative z-10">
                      <div className="flex items-center justify-between text-[8px] font-game text-slate-500 uppercase tracking-[0.2em] font-black">
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} className="text-cyan-600" /> TEMPO_RESTANTE
                        </div>
                        <span className="text-cyan-400">
                          {Math.max(0, Math.floor((buff.endTime - Date.now()) / 60000))} MINUTOS
                        </span>
                      </div>
                      <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] transition-all duration-1000"
                          style={{ width: `${Math.max(0, Math.min(100, ((buff.endTime - Date.now()) / 3600000) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Decorative background element for buff cards */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none group-hover:bg-cyan-500/10 transition-all"></div>
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
