
import React, { useEffect, useState } from 'react';
import { QuestDifficulty, StoreItem } from '../types';
import { Trophy, Sword, Sparkles, Skull, ShieldCheck, Zap, Coins, Database, Package, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuestCompletionOverlayProps {
  difficulty: QuestDifficulty;
  title: string;
  rewards: {
    gold: number;
    xp: number;
    items: StoreItem[];
  };
  onComplete: () => void;
}

const QuestCompletionOverlay: React.FC<QuestCompletionOverlayProps> = ({ difficulty, title, rewards, onComplete }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);
    const timer = setTimeout(() => {
      setShowContent(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 2200); // Reduced duration for snappier feel

    return () => clearTimeout(timer);
  }, [onComplete]);

  const getRankConfig = () => {
    switch (difficulty) {
      case QuestDifficulty.S:
        return {
          color: '#ef4444',
          bgGradient: 'from-red-950/40 via-black/95 to-red-950/40',
          textColor: 'text-red-500',
          title: 'MISSÃO DE RANK S CONCLUÍDA',
          subtitle: 'A ESCURIDÃO SE CURVA À SUA VONTADE',
          icon: <Skull size={80} className="text-red-600" />,
          glowColor: 'rgba(239, 68, 68, 0.5)',
          neonClass: 'neon-text-red',
          accentHex: '#ef4444',
          // Classes estáticas para evitar purge
          wrapperBg: 'bg-red-500/20',
          barBg: 'bg-red-400',
          panelBorder: 'border-red-500/30',
          headerBorder: 'border-red-500/30',
          headerCircle: 'border-red-400',
          headerIcon: 'text-red-400',
          subtitleText: 'text-red-100/80',
          captionText: 'text-red-400/60',
          xpIcon: 'text-red-400',
          xpLabel: 'text-red-600',
        };
      case QuestDifficulty.A:
        return {
          color: '#f97316',
          bgGradient: 'from-orange-950/30 via-black/95 to-orange-950/30',
          textColor: 'text-orange-500',
          title: 'MISSÃO DE RANK A CONCLUÍDA',
          subtitle: 'UM PODER QUE DESAFIA O DESTINO',
          icon: <Trophy size={70} className="text-orange-400" />,
          glowColor: 'rgba(249, 115, 22, 0.4)',
          neonClass: 'neon-text-orange',
          accentHex: '#f97316',
          wrapperBg: 'bg-orange-500/20',
          barBg: 'bg-orange-400',
          panelBorder: 'border-orange-500/30',
          headerBorder: 'border-orange-500/30',
          headerCircle: 'border-orange-400',
          headerIcon: 'text-orange-400',
          subtitleText: 'text-orange-100/80',
          captionText: 'text-orange-400/60',
          xpIcon: 'text-orange-400',
          xpLabel: 'text-orange-600',
        };
      case QuestDifficulty.B:
        return {
          color: '#a855f7',
          bgGradient: 'from-purple-950/20 via-black/95 to-purple-950/20',
          textColor: 'text-purple-500',
          title: 'MISSÃO DE RANK B CONCLUÍDA',
          subtitle: 'EXPERIÊNCIA TRANSFORMADA EM FORÇA',
          icon: <Zap size={60} className="text-purple-400" />,
          glowColor: 'rgba(168, 85, 247, 0.3)',
          neonClass: 'neon-text-purple',
          accentHex: '#a855f7',
          wrapperBg: 'bg-purple-500/20',
          barBg: 'bg-purple-400',
          panelBorder: 'border-purple-500/30',
          headerBorder: 'border-purple-500/30',
          headerCircle: 'border-purple-400',
          headerIcon: 'text-purple-400',
          subtitleText: 'text-purple-100/80',
          captionText: 'text-purple-400/60',
          xpIcon: 'text-purple-400',
          xpLabel: 'text-purple-600',
        };
      case QuestDifficulty.C:
        return {
          color: '#10b981',
          bgGradient: 'from-emerald-950/20 via-black/95 to-emerald-950/20',
          textColor: 'text-emerald-500',
          title: 'MISSÃO DE RANK C CONCLUÍDA',
          subtitle: 'PROGRESSO DO SISTEMA OTIMIZADO',
          icon: <Sword size={50} className="text-emerald-400" />,
          glowColor: 'rgba(16, 185, 129, 0.3)',
          neonClass: 'neon-text-green-strong',
          accentHex: '#10b981',
          wrapperBg: 'bg-emerald-500/20',
          barBg: 'bg-emerald-400',
          panelBorder: 'border-emerald-500/30',
          headerBorder: 'border-emerald-500/30',
          headerCircle: 'border-emerald-400',
          headerIcon: 'text-emerald-400',
          subtitleText: 'text-emerald-100/80',
          captionText: 'text-emerald-400/60',
          xpIcon: 'text-emerald-400',
          xpLabel: 'text-emerald-600',
        };
      case QuestDifficulty.D:
        return {
          color: '#22c55e',
          bgGradient: 'from-green-950/20 via-black/95 to-green-950/20',
          textColor: 'text-green-500',
          title: 'MISSÃO DE RANK D CONCLUÍDA',
          subtitle: 'NÚCLEO DE MANA ESTABILIZADO',
          icon: <ShieldCheck size={45} className="text-green-500" />,
          glowColor: 'rgba(34, 197, 94, 0.2)',
          neonClass: 'neon-text-green',
          accentHex: '#22c55e',
          wrapperBg: 'bg-green-500/20',
          barBg: 'bg-green-400',
          panelBorder: 'border-green-500/30',
          headerBorder: 'border-green-500/30',
          headerCircle: 'border-green-400',
          headerIcon: 'text-green-400',
          subtitleText: 'text-green-100/80',
          captionText: 'text-green-400/60',
          xpIcon: 'text-green-400',
          xpLabel: 'text-green-600',
        };
      default:
        return {
          color: '#94a3b8',
          bgGradient: 'from-slate-900/40 via-black/95 to-slate-900/40',
          textColor: 'text-slate-400',
          title: 'MISSÃO CONCLUÍDA',
          subtitle: 'REGISTRO BÁSICO SINCRONIZADO',
          icon: <Sparkles size={40} className="text-slate-400" />,
          glowColor: 'rgba(148, 163, 184, 0.1)',
          neonClass: 'text-slate-400',
          accentHex: '#94a3b8',
          wrapperBg: 'bg-slate-500/20',
          barBg: 'bg-slate-400',
          panelBorder: 'border-slate-500/30',
          headerBorder: 'border-slate-500/30',
          headerCircle: 'border-slate-400',
          headerIcon: 'text-slate-400',
          subtitleText: 'text-slate-100/80',
          captionText: 'text-slate-400/60',
          xpIcon: 'text-slate-400',
          xpLabel: 'text-slate-600',
        };
    }
  };

  const config = getRankConfig();

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto overflow-hidden"
        >
          {/* Background with rank-specific gradient */}
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`absolute inset-0 bg-gradient-to-b ${config.bgGradient} backdrop-blur-xl`}
          />

          {/* Animated Scanlines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Holographic Notification Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`relative w-full max-w-2xl p-1 ${config.wrapperBg} rounded-sm overflow-hidden`}
            >
              {/* Top/Bottom Glowing Bars */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${config.barBg} z-20`} style={{ boxShadow: `0 0 15px ${config.accentHex}` }} />
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${config.barBg} z-20`} style={{ boxShadow: `0 0 15px ${config.accentHex}` }} />

              <div className={`system-panel p-8 md:p-12 bg-slate-950/90 ${config.panelBorder}`}>
                {/* Header like the image */}
                <div className={`flex items-center gap-4 mb-8 border-b ${config.headerBorder} pb-4`}>
                  <div className={`p-2 border-2 ${config.headerCircle} rounded-full`}>
                    <Monitor size={24} className={config.headerIcon} />
                  </div>
                  <h1 className={`font-game text-2xl md:text-3xl text-white tracking-[0.4em] uppercase ${config.neonClass}`}>
                    NOTIFICAÇÃO
                  </h1>
                </div>

                <div className="space-y-6 text-center">
                  <p className={`font-game text-sm md:text-lg ${config.subtitleText} tracking-widest leading-relaxed`}>
                    Você completou o objetivo com sucesso:
                  </p>
                  <h2 className={`font-game text-xl md:text-3xl text-white tracking-[0.2em] uppercase ${config.neonClass} py-4`}>
                    {title}
                  </h2>
                  <p className={`font-game text-xs md:text-sm ${config.captionText} tracking-[0.3em] uppercase italic`}>
                    {config.subtitle}
                  </p>
                </div>

                {/* Rewards Section */}
                <div className="mt-12 grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <Database size={16} className={config.xpIcon} />
                    <span className={`text-[8px] font-game ${config.xpLabel}`}>EXP</span>
                    <span className="font-game text-lg text-white">+{rewards.xp}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Coins size={16} className="text-amber-400" />
                    <span className="text-[8px] font-game text-amber-600">OURO</span>
                    <span className="font-game text-lg text-amber-400">+{rewards.gold}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Package size={16} className="text-purple-400" />
                    <span className="text-[8px] font-game text-purple-600">ITENS</span>
                    <span className="font-game text-lg text-white">{rewards.items.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Item Drops List */}
            {rewards.items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex flex-wrap justify-center gap-3"
              >
                {rewards.items.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span className="font-game text-[10px] text-purple-300 uppercase tracking-wider">{item.name}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Closing Hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 1.5 }}
              className="mt-16 font-game text-[8px] text-white uppercase tracking-[0.8em]"
            >
              Sincronização concluída. Retornando ao sistema...
            </motion.p>
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-10 left-10 w-32 h-32 border-t-2 border-l-2 opacity-20" style={{ borderColor: config.color }} />
          <div className="absolute top-10 right-10 w-32 h-32 border-t-2 border-r-2 opacity-20" style={{ borderColor: config.color }} />
          <div className="absolute bottom-10 left-10 w-32 h-32 border-b-2 border-l-2 opacity-20" style={{ borderColor: config.color }} />
          <div className="absolute bottom-10 right-10 w-32 h-32 border-b-2 border-r-2 opacity-20" style={{ borderColor: config.color }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestCompletionOverlay;
