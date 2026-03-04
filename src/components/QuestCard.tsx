
import React, { useState, useEffect } from 'react';
import { Quest, Rank } from '../types';
import { RANK_COLORS } from '../constants';
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
  Zap
} from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  onToggleComplete: (questId: string) => void;
  onToggleSubQuest: (questId: string, subId: string) => void;
  onDelete: (questId: string) => void;
  onEdit: (quest: Quest) => void;
  onAddSubQuest: (questId: string, title: string) => void;
  onRemoveSubQuest: (questId: string, subId: string) => void;
}

const QuestCard: React.FC<QuestCardProps> = ({
  quest,
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
  }> = {
    slate: {
      badge: 'text-slate-300 border-slate-500/50 bg-slate-900/60 shadow-[0_0_10px_rgba(148,163,184,0.1)]',
      badgeFailed: 'text-rose-400 border-rose-500 bg-rose-950/60',
      subHeader: 'text-slate-400 shadow-[0_0_5px_rgba(148,163,184,0.2)]',
      subBorder: 'border-slate-800/50',
      subCheckActive: 'bg-slate-500 border-slate-400 text-white',
      inputBorder: 'border-slate-800/60 text-slate-100 focus:border-slate-400 shadow-inner',
      addBtnClasses: 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-500 hover:text-white',
      flameIcon: 'text-slate-400',
    },
    green: {
      badge: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
      badgeFailed: 'text-rose-400 border-rose-500 bg-rose-950/60',
      subHeader: 'text-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.2)]',
      subBorder: 'border-emerald-800/50',
      subCheckActive: 'bg-emerald-500 border-emerald-400 text-white',
      inputBorder: 'border-emerald-800/60 text-emerald-100 focus:border-emerald-400 shadow-inner',
      addBtnClasses: 'bg-emerald-800/40 border-emerald-700 text-emerald-400 hover:bg-emerald-500 hover:text-white',
      flameIcon: 'text-emerald-400',
    },
    blue: {
      badge: 'text-sky-300 border-sky-500/50 bg-sky-950/60 shadow-[0_0_10px_#0ea5e966]',
      badgeFailed: 'text-rose-400 border-rose-500 bg-rose-950/60',
      subHeader: 'text-sky-400 shadow-[0_0_5px_rgba(56,189,248,0.3)]',
      subBorder: 'border-sky-800/50',
      subCheckActive: 'bg-sky-500 border-sky-400 text-white shadow-[0_0_10px_#0ea5e9]',
      inputBorder: 'border-sky-800/60 text-sky-100 focus:border-sky-400 shadow-inner',
      addBtnClasses: 'bg-sky-800/40 border-sky-700 text-sky-400 hover:bg-sky-500 hover:text-white',
      flameIcon: 'text-sky-400',
    },
    purple: {
      badge: 'text-violet-300 border-violet-500/50 bg-violet-950/60 shadow-[0_0_10px_#8b5cf666]',
      badgeFailed: 'text-rose-400 border-rose-500 bg-rose-950/60',
      subHeader: 'text-violet-400 shadow-[0_0_5px_rgba(168,85,247,0.3)]',
      subBorder: 'border-violet-800/50',
      subCheckActive: 'bg-violet-500 border-violet-400 text-white shadow-[0_0_10px_#8b5cf6]',
      inputBorder: 'border-violet-800/60 text-violet-100 focus:border-violet-400 shadow-inner',
      addBtnClasses: 'bg-violet-800/40 border-violet-700 text-violet-400 hover:bg-violet-500 hover:text-white',
      flameIcon: 'text-violet-400',
    },
    orange: {
      badge: 'text-orange-300 border-orange-500/50 bg-orange-950/60 shadow-[0_0_10px_#f9731666]',
      badgeFailed: 'text-rose-400 border-rose-500 bg-rose-950/60',
      subHeader: 'text-orange-400 shadow-[0_0_5px_rgba(249,115,22,0.3)]',
      subBorder: 'border-orange-800/50',
      subCheckActive: 'bg-orange-500 border-orange-400 text-white shadow-[0_0_10px_#f97316]',
      inputBorder: 'border-orange-800/60 text-orange-100 focus:border-orange-400 shadow-inner',
      addBtnClasses: 'bg-orange-800/40 border-orange-700 text-orange-400 hover:bg-orange-500 hover:text-white',
      flameIcon: 'text-orange-400',
    },
    red: {
      badge: 'text-rose-300 border-rose-500/50 bg-rose-950/60 shadow-[0_0_10px_#ef444466]',
      badgeFailed: 'text-rose-300 border-rose-500 bg-rose-950/60',
      subHeader: 'text-rose-400 shadow-[0_0_5px_rgba(239,68,68,0.3)]',
      subBorder: 'border-rose-800/50',
      subCheckActive: 'bg-rose-500 border-rose-400 text-white shadow-[0_0_10px_#ef4444]',
      inputBorder: 'border-rose-800/60 text-rose-100 focus:border-rose-400 shadow-inner',
      addBtnClasses: 'bg-rose-800/40 border-rose-700 text-rose-400 hover:bg-rose-500 hover:text-white',
      flameIcon: 'text-rose-400',
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

  return (
    <div className={`relative transition-all duration-500 group ${quest.completed ? 'opacity-50 grayscale' : quest.failed ? 'opacity-70 grayscale' : ''}`}>

      <div className={`absolute -inset-[1px] opacity-20 ${quest.failed ? 'border-red-600' : rankBorderClass} border`}></div>

      <div className={`system-panel border overflow-hidden transition-all duration-500 ${quest.completed
        ? 'border-slate-900 bg-slate-950/40'
        : quest.failed
          ? 'border-red-900 bg-red-950/20'
          : `${rankBorderClass} border-opacity-30 shadow-[0_0_30px_rgba(0,0,0,0.6)]`
        }`}>

        <div className={`hud-tl hud-corner transition-all duration-500 ${quest.failed ? 'border-red-600' : rankBorderClass} opacity-60`}></div>
        <div className={`hud-tr hud-corner transition-all duration-500 ${quest.failed ? 'border-red-600' : rankBorderClass} opacity-60`}></div>
        <div className={`hud-bl hud-corner transition-all duration-500 ${quest.failed ? 'border-red-600' : rankBorderClass} opacity-60`}></div>
        <div className={`hud-br hud-corner transition-all duration-500 ${quest.failed ? 'border-red-600' : rankBorderClass} opacity-60`}></div>

        <div className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 relative z-10 min-w-0">

          <div className="relative shrink-0 flex items-center justify-center w-12 h-12 md:w-20 md:h-20 self-center sm:self-auto">
            {!quest.completed && !quest.failed && (
              <>
                <div className={`absolute w-10 h-10 md:w-14 md:h-14 rotate-45 border border-current opacity-20 ${rankTextClass}`}></div>
              </>
            )}

            <button
              disabled={quest.failed}
              onClick={() => onToggleComplete(quest.id)}
              className={`w-10 h-10 md:w-11 md:h-11 rotate-45 border-2 transition-all duration-700 flex items-center justify-center relative group/check overflow-hidden ${quest.completed
                ? 'bg-slate-900 border-slate-800 text-slate-700'
                : quest.failed
                  ? 'bg-red-950 border-red-900 text-red-900 cursor-not-allowed'
                  : `bg-black ${rankBorderClass} border-opacity-60 ${rankTextClass} shadow-[0_0_15px_rgba(0,0,0,0.6)]`
                }`}
            >
              <div className="-rotate-45 flex items-center justify-center relative z-20">
                {quest.completed ? (
                  <Check size={20} className="text-slate-500" />
                ) : quest.failed ? (
                  <AlertCircle size={20} className="text-red-900" />
                ) : (
                  <div className={`w-3 h-3 rounded-full bg-current transition-all duration-500 shadow-[0_0_12px_currentColor]`}></div>
                )}
              </div>
            </button>
          </div>

          <div className="flex-1 space-y-2 min-w-0 w-full">
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-game text-[10px] px-2 py-0.5 border leading-none font-bold tracking-widest ${quest.failed ? 'text-red-500 border-red-500 bg-red-950/40' : `${rankData} ${neonClass}`} bg-black/80 rounded-sm whitespace-nowrap`}>
                  {quest.failed ? 'FALHA' : `RANK ${quest.difficulty}`}
                </span>
                {quest.isDaily && (
                  <span className={`flex items-center gap-1 font-game text-[9px] border px-2 py-0.5 rounded-sm font-bold whitespace-nowrap ${quest.failed ? colors.badgeFailed : colors.badge
                    }`}>
                    <RefreshCw size={10} /> DIÁRIA
                  </span>
                )}
                {quest.isSpecial && (
                  <span className={`flex items-center gap-1 font-game text-[9px] border px-2 py-0.5 rounded-sm font-bold whitespace-nowrap ${quest.failed ? colors.badgeFailed : 'text-purple-400 border-purple-500/30 bg-purple-950/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    }`}>
                    <Zap size={10} /> OP. URGENTE
                  </span>
                )}
                {!quest.isDaily && quest.deadline && !quest.completed && !quest.failed && (
                  <span className={`flex items-center gap-1 font-game text-[9px] px-2 py-0.5 rounded-sm font-bold border whitespace-nowrap ${isUrgent ? 'text-red-500 border-red-500 bg-red-950/60' : colors.badge
                    }`}>
                    <Clock size={10} /> {timeLeft}
                  </span>
                )}
              </div>
              <h3 className={`font-game text-xl md:text-2xl tracking-tight transition-all duration-500 uppercase leading-tight break-words ${quest.completed ? 'line-through text-slate-700' : quest.failed ? 'text-red-900 line-through' : 'text-slate-100'
                }`}>
                {quest.title}
              </h3>
            </div>

            <p className={`text-[13px] md:text-[14px] font-medium leading-relaxed transition-colors duration-500 break-words ${quest.completed || quest.failed ? 'text-slate-700' : 'text-slate-400'
              }`}>
              {quest.failed ? 'Diretriz falha por descumprimento de prazo.' : quest.description}
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] md:text-[12px] font-game text-slate-500 pt-1 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Flame size={12} className={!quest.completed && !quest.failed ? colors.flameIcon : ''} /> {quest.xpReward.toLocaleString()} EXP
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Coins size={12} className={!quest.completed && !quest.failed ? 'text-amber-600' : ''} /> {quest.goldReward.toLocaleString()} OURO
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
                <div key={sq.id} className={`flex items-center gap-3 p-2.5 bg-slate-900/80 shadow-[inset_0_0_15px_rgba(148,163,184,0.05)] border-slate-800/60 transition-all border transition-all ${sq.completed ? 'border-slate-900 opacity-40' : quest.failed ? 'border-red-900/30' : colors.subBorder} min-w-0`}>
                  <button
                    disabled={quest.failed}
                    onClick={() => onToggleSubQuest(quest.id, sq.id)}
                    className={`shrink-0 w-4 h-4 border flex items-center justify-center transition-all ${sq.completed ? colors.subCheckActive : 'border-slate-700'}`}
                  >
                    {sq.completed && <Check size={10} />}
                  </button>
                  <span className={`text-[11px] md:text-xs font-medium flex-1 truncate ${sq.completed ? 'line-through text-slate-700' : 'text-slate-300'}`}>
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
                  className={`flex-1 bg-black border p-2.5 text-[11px] font-game outline-none transition-all rounded-sm min-w-0 ${colors.inputBorder}`}
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
