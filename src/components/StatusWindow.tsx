
import React from 'react';
import { HunterProfile, Rank } from '../types';
import { RANK_COLORS } from '../constants';
import {
  Sparkles,
  Clock,
  Lock,
  CheckCircle2,
  Trophy,
  Dna,
  Database,
  Zap
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
          color="stroke-orange-500"
          icon={<Trophy size={16} />} 
        />
        <CircularProgress 
          progress={rareDropProgress} 
          label="ITEM RARO" 
          subLabel={`${Math.floor(xpRemainingForDrop / 1000)}K XP PARA O DROP`}
          color="stroke-purple-500"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  className={`hud-board p-5 transition-all duration-500 relative overflow-hidden ${isCurrent
                    ? `border-white/20 bg-white/5`
                    : isAchieved
                      ? 'border-white/5 opacity-60 bg-slate-900/20'
                      : 'border-white/5 opacity-20'
                    }`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className={`font-game text-3xl w-16 h-16 flex flex-col items-center justify-center border font-black relative overflow-hidden ${isCurrent 
                          ? `text-white border-white/40 bg-white/5` 
                          : isAchieved 
                            ? 'text-slate-500 border-white/10 bg-slate-800/20' 
                            : 'text-slate-900 border-white/5 bg-black/10'
                          }`}>
                          <span className="relative z-10">{item.rank}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className={`font-game text-[14px] uppercase tracking-[0.1em] font-black ${isCurrent ? 'text-white' : 'text-slate-600'}`}>
                            {item.label}
                          </h4>
                          {isCurrent && (
                            <span className="text-[8px] font-game bg-white/20 text-white px-1.5 py-0.5 font-black uppercase tracking-widest">
                              ATUAL
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-1 h-2 ${isLocked ? 'bg-slate-900' : 'bg-slate-700'}`}></div>
                          <p className={`text-[10px] font-game uppercase font-black tracking-widest ${isLocked ? 'text-slate-800' : 'text-slate-700'}`}>
                            {isLocked ? `REQUISITO: NÍVEL ${item.minLevel}` : `STATUS: CLASSIFICAÇÃO_CONFIRMADA`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {isCurrent ? (
                        <div className="flex flex-col items-end">
                        </div>
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
                <div key={buff.id} className="hud-board border-white/10 p-5 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-black/40 border border-white/10 text-slate-400 font-game">
                        {buff.icon || '✨'}
                      </div>
                      <div>
                        <h4 className="font-game text-[14px] text-white uppercase tracking-tight font-bold">{buff.name}</h4>
                        <p className="text-[11px] text-slate-500 italic leading-tight font-medium">{buff.description}</p>
                      </div>
                    </div>
                    {buff.value && (
                      <div className="font-game text-[12px] text-sky-400 border border-sky-500/30 px-2.5 py-0.5 bg-sky-950/20 font-bold">
                        {buff.value}
                      </div>
                    )}
                  </div>

                  {buff.endTime && (
                    <div className="flex items-center gap-2 mt-4 text-[10px] font-game text-sky-600 uppercase tracking-widest font-bold">
                      <Clock size={12} /> TEMPO RESTANTE:
                      <span className="text-sky-400">
                        {Math.max(0, Math.floor((buff.endTime - Date.now()) / 60000))} MINUTOS
                      </span>
                    </div>
                  )}
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
