
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
  Database
} from 'lucide-react';

interface StatusWindowProps {
  profile: HunterProfile;
}

const StatusWindow: React.FC<StatusWindowProps> = ({ profile }) => {
  const rankProgression = [
    { rank: Rank.E, minLevel: 1, maxLevel: 19, label: 'CAÇADOR RANK E (O MAIS FRACO)' },
    { rank: Rank.D, minLevel: 20, maxLevel: 39, label: 'CAÇADOR DESPERTO' },
    { rank: Rank.C, minLevel: 40, maxLevel: 59, label: 'MEMBRO DE ELITE' },
    { rank: Rank.B, minLevel: 60, maxLevel: 79, label: 'CAÇADOR DE ALTO NÍVEL' },
    { rank: Rank.A, minLevel: 80, maxLevel: 99, label: 'REI DOS CAÇADORES' },
    { rank: Rank.S, minLevel: 100, maxLevel: 999, label: 'NÍVEL NACIONAL / MONARCA' },
  ];

  const XP_DROP_THRESHOLD = 50000;
  const nextRareDropProgress = (profile.totalXpGained % XP_DROP_THRESHOLD) / XP_DROP_THRESHOLD * 100;
  const xpRemainingForDrop = XP_DROP_THRESHOLD - (profile.totalXpGained % XP_DROP_THRESHOLD);

  const getCurrentRankProgress = () => {
    const current = rankProgression.find(r => r.rank === profile.rank);
    if (!current) return 0;
    if (profile.rank === Rank.S) return 100;

    const range = current.maxLevel - current.minLevel + 1;
    const progress = profile.level - current.minLevel;
    return Math.min(100, Math.max(0, (progress / range) * 100));
  };

  const progressToNext = getCurrentRankProgress();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">

      {/* Registro de XP Acumulado */}
      <div className="system-panel p-6 border-sky-800/50 shadow-[0_0_10px_rgba(56,189,248,0.1)] bg-sky-950/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-transparent"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-sky-900/20 border border-sky-500/30 rounded-lg text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
              <Database size={24} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <h3 className="font-game text-xs text-sky-500 uppercase tracking-widest font-bold">Núcleo de Mana Total</h3>
              <p className="font-game text-3xl text-white tracking-tighter">{profile.totalXpGained.toLocaleString()} <span className="text-xs text-sky-700">XP</span></p>
            </div>
          </div>

          <div className="flex-1 max-w-md space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-game text-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.4)] uppercase tracking-widest font-bold">Próximo Artefato Raro</span>
              <span className="text-[10px] font-game text-sky-400">{Math.floor(nextRareDropProgress)}%</span>
            </div>
            <div className="h-1.5 bg-black border border-sky-800/60 shadow-[0_0_10px_rgba(56,189,248,0.1)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-900 to-sky-400 transition-all duration-1000 shadow-[0_0_10px_#38bdf8]"
                style={{ width: `${nextRareDropProgress}%` }}
              ></div>
            </div>
            <p className="text-[9px] text-slate-600 uppercase font-bold text-right">Faltam {xpRemainingForDrop.toLocaleString()} XP para o próximo drop</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lógica de Rank do Sistema */}
        <div className="space-y-4">
          <h3 className="font-game text-[12px] text-cyan-500 uppercase flex items-center gap-2 border-b border-cyan-900/50 pb-2 font-bold tracking-widest">
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
                  className={`system-bg border rounded-lg p-5 transition-all duration-500 relative overflow-hidden ${isCurrent
                      ? `border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.2)] bg-cyan-950/20`
                      : isAchieved
                        ? 'border-slate-800 opacity-60'
                        : 'border-slate-900 opacity-40 grayscale'
                    }`}
                >
                  {isCurrent && (
                    <div className="absolute top-0 right-0 p-2">
                      <div className="text-[10px] font-game text-cyan-400 animate-pulse uppercase tracking-widest font-bold">VOCÊ ESTÁ AQUI</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={`font-game text-3xl w-14 h-14 flex items-center justify-center border-2 rounded-lg font-black ${isCurrent ? `${RANK_COLORS[item.rank]} bg-slate-900 shadow-lg` : isAchieved ? 'text-slate-500 border-slate-700' : 'text-slate-800 border-slate-900'
                        }`}>
                        {item.rank}
                      </div>
                      <div>
                        <h4 className={`font-game text-[14px] uppercase tracking-tight font-bold ${isCurrent ? 'text-white' : 'text-slate-500'}`}>
                          {item.label}
                        </h4>
                        <p className="text-[10px] font-game text-slate-600 uppercase font-medium">
                          {isLocked ? `REQUISITO: NÍVEL ${item.minLevel}` : `STATUS: ALCANÇADO`}
                        </p>
                      </div>
                    </div>

                    <div>
                      {isCurrent ? (
                        <div className="p-2.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          <Trophy size={24} />
                        </div>
                      ) : isAchieved ? (
                        <CheckCircle2 size={24} className="text-slate-600" />
                      ) : (
                        <Lock size={24} className="text-slate-800" />
                      )}
                    </div>
                  </div>

                  {isCurrent && profile.rank !== Rank.S && (
                    <div className="mt-5 space-y-2 animate-in fade-in duration-1000">
                      <div className="flex justify-between text-[10px] font-game text-cyan-600 uppercase tracking-widest font-bold">
                        <span>EVOLUÇÃO DE MANA</span>
                        <span>{Math.floor(progressToNext)}%</span>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-cyan-900/40">
                        <div
                          className="h-full bg-cyan-500 shadow-[0_0_15px_#22d3ee] transition-all duration-1000"
                          style={{ width: `${progressToNext}%` }}
                        ></div>
                      </div>
                      <p className="text-[9px] text-slate-500 italic text-right uppercase font-bold tracking-tight">
                        FALTAM {item.maxLevel - profile.level + 1} NÍVEIS PARA A PRÓXIMA REAVALIAÇÃO
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Efeitos Ativos (Buffs) */}
        <div className="space-y-4">
          <h3 className="font-game text-[12px] text-sky-500 uppercase flex items-center gap-2 border-b border-sky-900/50 pb-2 font-bold tracking-widest">
            <Sparkles size={14} /> EFEITOS ATIVOS (BUFFS)
          </h3>

          <div className="space-y-3">
            {profile.activeBuffs.length === 0 ? (
              <div className="py-24 flex flex-col items-center opacity-30 border border-dashed border-sky-800/60 shadow-[0_0_10px_rgba(56,189,248,0.1)] rounded-xl text-center p-8">
                <Sparkles size={48} className="text-sky-900 mb-4" />
                <p className="font-game text-sky-800 text-[11px] uppercase tracking-widest font-bold">NENHUM EFEITO DETECTADO</p>
                <p className="text-[10px] text-slate-600 mt-2 uppercase font-medium">ADQUIRA RELÍQUIAS PARA MANIFESTAR NOVOS PODERES.</p>
              </div>
            ) : (
              profile.activeBuffs.map(buff => (
                <div key={buff.id} className="system-bg border border-sky-800/50 shadow-[0_0_10px_rgba(56,189,248,0.1)] p-5 rounded-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-sky-500 group-hover:shadow-[0_0_15px_#38bdf8]"></div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-sky-950/40 rounded-lg border border-sky-500/30 text-sky-400 font-game">
                        {buff.icon || '✨'}
                      </div>
                      <div>
                        <h4 className="font-game text-[14px] text-sky-100 uppercase tracking-tight font-bold">{buff.name}</h4>
                        <p className="text-[11px] text-slate-400 italic leading-tight font-medium">{buff.description}</p>
                      </div>
                    </div>
                    {buff.value && (
                      <div className="font-game text-[12px] text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded bg-sky-950/20 font-bold">
                        {buff.value}
                      </div>
                    )}
                  </div>

                  {buff.endTime && (
                    <div className="flex items-center gap-2 mt-4 text-[10px] font-game text-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.4)] uppercase tracking-widest font-bold">
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
