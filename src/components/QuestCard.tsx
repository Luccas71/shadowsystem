
import React, { useState, useEffect } from 'react';
import { Quest, Rank, HunterProfile } from '../types';
import { RANK_COLORS, calculateQuestRewards } from '../constants';
import {
  Check,
  Trash2,
  RefreshCw,
  Flame,
  Coins,
  Plus,
  X,
  ChevronDown,
  Clock,
  AlertCircle,
  Edit2,
  Zap,
  Timer
} from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  profile: HunterProfile;
  onToggleComplete: (questId: string) => void;
  onToggleSubQuest: (questId: string, subId: string) => void;
  onDelete: (questId: string) => void;
  onEdit: (quest: Quest) => void;
  onAddSubQuest: (questId: string, title: string) => void;
  onRemoveSubQuest: (questId: string, subId: string) => void;
}

const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  profile,
  onToggleComplete,
  onToggleSubQuest,
  onDelete,
  onEdit,
  onAddSubQuest,
  onRemoveSubQuest
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubTitle, setNewSubTitle] = useState('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!quest.deadline || quest.completed || quest.failed) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = quest.deadline! - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRADO');
        setIsUrgent(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setIsUrgent(diff < 3600000); // Urgente se < 1 hora
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [quest.deadline, quest.completed, quest.failed]);

  const rankData = RANK_COLORS[quest.difficulty as unknown as Rank] || 'text-slate-600 border-slate-800';
  const rankBorderClass = rankData.split(' ').find(c => c.startsWith('border-')) || 'border-slate-800';
  const rankTextClass = rankData.split(' ').find(c => c.startsWith('text-')) || 'text-slate-400';
  const neonClass = rankData.split(' ').find(c => c.startsWith('neon-text-')) || '';

  // Mapa estático de cores para evitar classes Tailwind dinâmicas que não são purgadas
  const colorMap: Record<string, {
    badge: string;
    badgeFailed: string;
    subHeader: string;
    subBorder: string;
    subCheckActive: string;
    inputBorder: string;
    addBtnClasses: string;
    flameIcon: string;
    checkboxFill: string;
  }> = {
    slate: {
      badge: 'text-slate-400 border-slate-500/30 bg-slate-950/60',
      badgeFailed: 'text-red-500 border-red-500 bg-red-950/60',
      subHeader: 'text-slate-600',
      subBorder: 'border-slate-900/30',
      subCheckActive: 'bg-slate-600 border-slate-500 text-white',
      inputBorder: 'border-slate-900/40 text-slate-100 focus:border-slate-500',
      addBtnClasses: 'bg-slate-900/20 border-slate-900 text-slate-500 hover:bg-slate-600 hover:text-white',
      flameIcon: 'text-slate-600',
      checkboxFill: 'bg-slate-400 shadow-[0_0_15px_#94a3b8]',
    },
    teal: {
      badge: 'text-teal-400 border-teal-500/30 bg-teal-950/60',
      badgeFailed: 'text-red-500 border-red-500 bg-red-950/60',
      subHeader: 'text-teal-600',
      subBorder: 'border-teal-900/30',
      subCheckActive: 'bg-teal-600 border-teal-500 text-white',
      inputBorder: 'border-teal-900/40 text-teal-100 focus:border-teal-500',
      addBtnClasses: 'bg-teal-900/20 border-teal-900 text-teal-500 hover:bg-teal-600 hover:text-white',
      flameIcon: 'text-teal-600',
      checkboxFill: 'bg-teal-400 shadow-[0_0_15px_#2dd4bf]',
    },
    sky: {
      badge: 'text-sky-400 border-sky-500/30 bg-sky-950/60',
      badgeFailed: 'text-red-500 border-red-500 bg-red-950/60',
      subHeader: 'text-sky-600',
      subBorder: 'border-sky-900/30',
      subCheckActive: 'bg-sky-600 border-sky-500 text-white',
      inputBorder: 'border-sky-900/40 text-sky-100 focus:border-sky-500',
      addBtnClasses: 'bg-sky-900/20 border-sky-900 text-sky-500 hover:bg-sky-600 hover:text-white',
      flameIcon: 'text-sky-600',
      checkboxFill: 'bg-sky-400 shadow-[0_0_15px_#38bdf8]',
    },
    amber: {
      badge: 'text-amber-400 border-amber-500/30 bg-amber-950/60',
      badgeFailed: 'text-red-500 border-red-500 bg-red-950/60',
      subHeader: 'text-amber-600',
      subBorder: 'border-amber-900/30',
      subCheckActive: 'bg-amber-600 border-amber-500 text-white',
      inputBorder: 'border-amber-900/40 text-amber-100 focus:border-amber-500',
      addBtnClasses: 'bg-amber-900/20 border-amber-900 text-amber-500 hover:bg-amber-600 hover:text-white',
      flameIcon: 'text-amber-600',
      checkboxFill: 'bg-amber-400 shadow-[0_0_15px_#fbbf24]',
    },
    orange: {
      badge: 'text-orange-400 border-orange-500/30 bg-orange-950/60',
      badgeFailed: 'text-red-500 border-red-500 bg-red-950/60',
      subHeader: 'text-orange-600',
      subBorder: 'border-orange-900/30',
      subCheckActive: 'bg-orange-600 border-orange-500 text-white',
      inputBorder: 'border-orange-900/40 text-orange-100 focus:border-orange-500',
      addBtnClasses: 'bg-orange-900/20 border-orange-900 text-orange-500 hover:bg-orange-600 hover:text-white',
      flameIcon: 'text-orange-600',
      checkboxFill: 'bg-orange-400 shadow-[0_0_15px_#fb923c]',
    },
    rose: {
      badge: 'text-red-400 border-red-500/30 bg-red-950/60',
      badgeFailed: 'text-red-500 border-red-500 bg-red-950/60',
      subHeader: 'text-red-600',
      subBorder: 'border-red-900/30',
      subCheckActive: 'bg-red-600 border-red-500 text-white',
      inputBorder: 'border-red-900/40 text-red-100 focus:border-red-500',
      addBtnClasses: 'bg-red-900/20 border-red-900 text-red-500 hover:bg-red-600 hover:text-white',
      flameIcon: 'text-red-600',
      checkboxFill: 'bg-red-400 shadow-[0_0_15px_#f87171]',
    },
  };

  const colorMatch = rankTextClass.match(/text-([a-z]+)-/);
  const baseColor = colorMatch ? colorMatch[1] : 'slate';
  const colors = colorMap[baseColor] || colorMap['slate'];

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubTitle.trim()) {
      onAddSubQuest(quest.id, newSubTitle.trim());
      setNewSubTitle('');
    }
  };

  const { xpReward: projectedXp, goldReward: projectedGold } = calculateQuestRewards(quest, profile);

  return (
    <div className={`relative transition-all duration-500 group ${quest.completed ? 'opacity-50 grayscale' : quest.failed ? 'opacity-70 grayscale' : ''}`}>

      <div className={`absolute -inset-[1px] opacity-20 ${quest.failed ? 'border-red-600' : rankBorderClass} border`}></div>

      <div className={`hud-board border overflow-hidden transition-all duration-500 ${quest.completed
        ? 'border-slate-800 bg-slate-950/40 opacity-50'
        : quest.failed
          ? 'border-red-600/50 bg-red-950/20 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
          : `border-sky-500/30`
        }`}>

        <div className="p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 md:gap-7 relative z-10 min-w-0">

          <div className="relative shrink-0 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 self-center sm:self-auto group/check">
            {!quest.completed && !quest.failed && (
              <>
                <div className={`checkbox-ring absolute w-10 min-h-10 md:w-12 md:h-12 rotate-45 border border-current opacity-10 ${rankTextClass} transition-all duration-500`}></div>
              </>
            )}

            <button
              disabled={quest.failed}
              onClick={() => onToggleComplete(quest.id)}
              className={`w-9 h-9 md:w-10 md:h-10 rotate-45 border transition-all duration-500 flex items-center justify-center relative overflow-hidden hover:scale-110 hover:border-opacity-100 hover:shadow-[0_0_15px_currentColor] ${quest.completed
                ? 'bg-slate-900 border-slate-800 text-slate-700'
                : quest.failed
                  ? 'bg-red-950 border-red-900 text-red-900 cursor-not-allowed hover:scale-100 hover:shadow-none'
                  : `bg-black ${rankBorderClass} border-opacity-40 ${rankTextClass}`
                }`}
            >
              <div className="flex items-center justify-center relative z-20">
                {quest.completed ? (
                  <Check size={20} className="text-emerald-400 drop-shadow-[0_0_8px_#34d399] -rotate-45" strokeWidth={3} />
                ) : quest.failed ? (
                  <AlertCircle size={18} className="text-red-900 -rotate-45" />
                ) : (
                  <div className={`w-2 h-2 bg-current transition-all duration-500 opacity-80 group-hover/check:opacity-100 group-hover/check:shadow-[0_0_15px_currentColor]`}></div>
                )}
              </div>
            </button>
          </div>

          <div className="flex-1 space-y-1.5 min-w-0 w-full">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-game text-[9px] px-2 py-0.5 border leading-none font-bold tracking-[0.1em] transition-all duration-500 ${quest.failed ? 'text-red-500 border-red-500 bg-red-950/40' : `${rankData} ${neonClass}`} bg-black/60 whitespace-nowrap`}>
                  {quest.failed ? 'FALHA' : `RANK_${quest.difficulty}`}
                </span>
                {quest.isDaily && (
                  <span className={`font-game text-[8px] opacity-40 uppercase tracking-widest font-bold whitespace-nowrap ${quest.failed ? 'text-red-500' : 'text-cyan-500'}`}>
                    Diário
                  </span>
                )}
                {quest.isScheduled && (
                  <span className="font-game text-[8px] opacity-40 uppercase tracking-widest font-bold whitespace-nowrap text-indigo-400">
                    Programado
                  </span>
                )}
                {quest.isSpecial && (
                  <span className="font-game text-[8px] opacity-40 uppercase tracking-widest font-bold whitespace-nowrap text-purple-400 font-bold">
                    Urgente
                  </span>
                )}
                {!quest.isDaily && !quest.isScheduled && quest.deadline && !quest.completed && !quest.failed && (
                  <span className={`font-game text-[8px] uppercase tracking-widest font-bold whitespace-nowrap ${isUrgent ? 'text-red-500' : 'text-slate-500'}`}>
                    {timeLeft}
                  </span>
                )}
              </div>
              <h3 className={`font-game text-lg md:text-xl tracking-wide transition-all duration-500 uppercase leading-tight break-words ${quest.completed ? 'line-through text-slate-700' : quest.failed ? 'text-red-900 line-through' : 'text-glow-cyan'
                }`}>
                {quest.title}
              </h3>
            </div>

            <p className={`text-[12px] md:text-[13px] font-medium leading-relaxed transition-colors duration-500 break-words ${quest.completed || quest.failed ? 'text-slate-700' : 'text-slate-500'
              }`}>
              {quest.failed ? 'Diretriz falha por descumprimento de prazo.' : quest.description}
            </p>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-[11px] font-game font-bold tracking-wider text-slate-400 group/xp">
                 <div className="relative">
                   <Flame size={12} className={!quest.completed && !quest.failed ? `${colors.flameIcon} animate-pulse` : 'text-slate-700'} />
                   {!quest.completed && !quest.failed && <div className={`absolute inset-0 blur-sm bg-current opacity-20 animate-ping ${colors.flameIcon}`}></div>}
                 </div>
                 <span className={!quest.completed && !quest.failed ? "text-glow-cyan" : ""}>{projectedXp.toLocaleString()}</span>
                 <span className="opacity-40 text-[9px]">XP</span>
                 {!quest.completed && !quest.failed && (
                   <span className="ml-1 text-[7px] bg-cyan-500/10 text-cyan-400 px-1 border border-cyan-500/30 rounded-[2px] animate-pulse">SISTEMA+</span>
                 )}
              </div>

              <div className="flex items-center gap-2 text-[11px] font-game font-bold tracking-wider text-amber-500/80">
                 <Coins size={12} className={!quest.completed && !quest.failed ? 'text-amber-500' : 'text-slate-700'} />
                 <span>{projectedGold.toLocaleString()}</span>
                 <span className="opacity-40 text-[9px] text-amber-900">OURO</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 transition-all duration-300 ${isExpanded ? 'text-cyan-400 rotate-180' : 'text-slate-600'}`}
            >
              <ChevronDown size={22} />
            </button>
            <button
              onClick={() => onEdit(quest)}
              disabled={quest.completed || quest.failed}
              className={`p-2 transition-all duration-300 ${quest.completed || quest.failed ? 'text-slate-800' : 'text-slate-600'}`}
              title="RECALIBRAR DIRETRIZ"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => onDelete(quest.id)}
              className="text-slate-800 hover:text-red-500 transition-all p-2"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 md:px-6 pb-6 pt-2 border-t border-slate-800 min-w-0">
            <h4 className={`font-game text-[9px] uppercase tracking-widest mb-3 flex items-center gap-2 font-bold ${quest.failed ? 'text-red-600' : colors.subHeader}`}>
              SUB-DIRETRIZES
            </h4>

            <div className="space-y-2 mb-4">
              {quest.subQuests && quest.subQuests.map(sq => (
                <div key={sq.id} className={`flex items-center gap-3 p-2.5 bg-slate-950/40 system-border transition-all ${sq.completed ? 'border-slate-800 opacity-40' : quest.failed ? 'border-red-900/40' : colors.subBorder} min-w-0`}>
                  <button
                    disabled={quest.failed}
                    onClick={() => onToggleSubQuest(quest.id, sq.id)}
                    className={`shrink-0 w-3.5 h-3.5 rotate-45 border flex items-center justify-center transition-all ${sq.completed ? colors.subCheckActive : 'border-slate-700'}`}
                  >
                    {sq.completed && <Check size={18} className="text-emerald-400 drop-shadow-[0_0_5px_#34d399] -rotate-45" strokeWidth={3} />}
                  </button>
                  <span className={`text-[11px] md:text-xs min-w-0 font-game uppercase tracking-wide truncate transition-colors duration-500 ${sq.completed ? 'line-through text-slate-700' : 'text-glow-cyan'}`}>
                    {sq.title}
                  </span>
                  <button
                    onClick={() => onRemoveSubQuest(quest.id, sq.id)}
                    className="shrink-0 text-slate-800 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {(!quest.subQuests || quest.subQuests.length === 0) && (
                <p className="text-[9px] text-slate-700 italic uppercase font-game py-1">Nenhuma sub-diretriz registrada.</p>
              )}
            </div>

            {!quest.failed && (
              <form onSubmit={handleAddSub} className="flex gap-2 min-w-0">
                <input
                  type="text"
                  value={newSubTitle}
                  onChange={e => setNewSubTitle(e.target.value)}
                  placeholder="ADICIONAR..."
                  className={`flex-1 bg-black border p-2.5 text-[11px] font-game outline-none transition-all min-w-0 ${colors.inputBorder}`}
                />
                <button
                  type="submit"
                  className={`shrink-0 px-3 py-2 border font-game text-[10px] transition-all uppercase font-bold ${colors.addBtnClasses}`}
                >
                  <Plus size={14} />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestCard;
