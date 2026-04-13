
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
  const [step, setStep] = useState(0);

  useEffect(() => {
    setShowContent(true);
    
    // Animation sequence
    const timers = [
      setTimeout(() => setStep(1), 300),  // Show Notification Title
      setTimeout(() => setStep(2), 600),  // Show Quest Title
      setTimeout(() => setStep(3), 900),  // Show EXP
      setTimeout(() => setStep(4), 1000), // Show Gold
      setTimeout(() => setStep(5), 1100), // Show Items
      setTimeout(() => setStep(6), 1250), // Show Item Detail Drops
    ];

    const closeTimer = setTimeout(() => {
      setShowContent(false);
      setTimeout(onComplete, 500);
    }, 3500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(closeTimer);
    };
  }, [onComplete]);

  const getRankConfig = (difficulty: QuestDifficulty) => {
    switch (difficulty) {
      case QuestDifficulty.S:
        return {
          color: '#ef4444',
          bgGradient: 'from-red-950/40 via-black/95 to-red-950/40',
          textColor: 'text-red-500',
          title: 'MISSÃO DE RANK S CONCLUÍDA',
          subtitle: 'A ESCURIDÃO SE CURVA À SUA VONTADE',
          glowColor: 'rgba(239, 68, 68, 0.5)',
          neonClass: 'neon-text-red',
          accentHex: '#ef4444',
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
          color: '#f59e0b',
          bgGradient: 'from-amber-950/20 via-black/95 to-amber-950/20',
          textColor: 'text-amber-500',
          title: 'MISSÃO DE RANK B CONCLUÍDA',
          subtitle: 'EXPERIÊNCIA TRANSFORMADA EM FORÇA',
          glowColor: 'rgba(245, 158, 11, 0.3)',
          neonClass: 'neon-text-lime',
          accentHex: '#f59e0b',
          wrapperBg: 'bg-amber-500/20',
          barBg: 'bg-amber-400',
          panelBorder: 'border-amber-500/30',
          headerBorder: 'border-amber-500/30',
          headerCircle: 'border-amber-400',
          headerIcon: 'text-amber-400',
          subtitleText: 'text-amber-100/80',
          captionText: 'text-amber-400/60',
          xpIcon: 'text-amber-400',
          xpLabel: 'text-amber-600',
        };
      case QuestDifficulty.C:
        return {
          color: '#3b82f6',
          bgGradient: 'from-blue-950/20 via-black/95 to-blue-950/20',
          textColor: 'text-blue-500',
          title: 'MISSÃO DE RANK C CONCLUÍDA',
          subtitle: 'PROGRESSO DO SISTEMA OTIMIZADO',
          glowColor: 'rgba(59, 130, 246, 0.3)',
          neonClass: 'neon-text-blue',
          accentHex: '#3b82f6',
          wrapperBg: 'bg-blue-500/20',
          barBg: 'bg-blue-400',
          panelBorder: 'border-blue-500/30',
          headerBorder: 'border-blue-500/30',
          headerCircle: 'border-blue-400',
          headerIcon: 'text-blue-400',
          subtitleText: 'text-blue-100/80',
          captionText: 'text-blue-400/60',
          xpIcon: 'text-blue-400',
          xpLabel: 'text-blue-600',
        };
      case QuestDifficulty.D:
        return {
          color: '#14b8a6',
          bgGradient: 'from-teal-950/20 via-black/95 to-teal-950/20',
          textColor: 'text-teal-500',
          title: 'MISSÃO DE RANK D CONCLUÍDA',
          subtitle: 'NÚCLEO DE MANA ESTABILIZADO',
          glowColor: 'rgba(20, 184, 166, 0.2)',
          neonClass: 'neon-text-green',
          accentHex: '#14b8a6',
          wrapperBg: 'bg-teal-500/20',
          barBg: 'bg-teal-400',
          panelBorder: 'border-teal-500/30',
          headerBorder: 'border-teal-500/30',
          headerCircle: 'border-teal-400',
          headerIcon: 'text-teal-400',
          subtitleText: 'text-teal-100/80',
          captionText: 'text-teal-400/60',
          xpIcon: 'text-teal-400',
          xpLabel: 'text-teal-600',
        };
      default:
        return {
          color: '#94a3b8',
          bgGradient: 'from-slate-900/40 via-black/95 to-slate-900/40',
          textColor: 'text-slate-400',
          title: 'MISSÃO CONCLUÍDA',
          subtitle: 'REGISTRO BÁSICO SINCRONIZADO',
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

  const config = getRankConfig(difficulty);

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onComplete}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto overflow-hidden bg-black/80 cursor-pointer"
        >
          {/* Background Data Rain Effect */}
          <div className="absolute inset-0 opacity-20 bg-data-rain pointer-events-none" />
          
          {/* Rank-specific Background Gradient */}
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            className={`absolute inset-0 bg-gradient-to-b ${config.bgGradient} backdrop-blur-sm`}
          />

          {/* Laser Scan Initial Effect */}
          <div className="scan-line-effect" style={{ background: `linear-gradient(to bottom, transparent, ${config.accentHex}, transparent)` }} />

          <div className="relative z-10 flex flex-col items-center w-full px-4">
            {/* Holographic Notification Box */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: 45 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className={`relative w-full max-w-2xl p-1 ${config.wrapperBg} rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]`}
            >
              {/* Animated Glow Borders */}
              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute top-0 left-0 right-0 h-1 ${config.barBg} z-20`} 
                style={{ boxShadow: `0 0 20px ${config.accentHex}` }} 
              />
              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className={`absolute bottom-0 left-0 right-0 h-1 ${config.barBg} z-20`} 
                style={{ boxShadow: `0 0 20px ${config.accentHex}` }} 
              />

              <div className={`system-panel p-8 md:p-12 bg-slate-950/95 ${config.panelBorder} backdrop-blur-3xl`}>
                {/* Header Sequence */}
                <AnimatePresence>
                  {step >= 1 && (
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className={`flex items-center gap-4 mb-8 border-b ${config.headerBorder} pb-4`}
                    >
                      <div className={`p-2 border-2 ${config.headerCircle} rounded-full animate-pulse`}>
                        <Monitor size={24} className={config.headerIcon} />
                      </div>
                      <h1 className={`font-game text-3xl md:text-5xl text-white tracking-[0.4em] uppercase animate-glitch-chromatic`}>
                        NOTIFICAÇÃO
                      </h1>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-8 text-center min-h-[200px] flex flex-col justify-center">
                  {step >= 2 && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      <p className={`font-game text-sm md:text-xl ${config.subtitleText} tracking-[0.3em] leading-relaxed mb-4`}>
                        Sincronização de Objetivo Concluída:
                      </p>
                      <h2 className={`font-game text-3xl md:text-5xl text-white tracking-[0.1em] uppercase ${config.neonClass} py-6 border-y border-white/5`}>
                        {title}
                      </h2>
                      <p className={`font-game text-[10px] md:text-xs ${config.captionText} tracking-[0.5em] uppercase italic mt-6`}>
                        &lt; {config.subtitle} &gt;
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Rewards Grid */}
                <div className="mt-12 grid grid-cols-3 gap-8">
                  <AnimatePresence>
                    {step >= 3 && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className={`p-3 bg-white/5 rounded-full mb-2 group-hover:bg-red-500/20 transition-colors`}>
                           <Database size={24} className={config.xpIcon} />
                        </div>
                        <span className={`text-[10px] font-game ${config.xpLabel} tracking-widest`}>XP</span>
                        <span className="font-game text-2xl text-white">+{rewards.xp}</span>
                      </motion.div>
                    )}
                    {step >= 4 && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className={`p-3 bg-white/5 rounded-full mb-2 group-hover:bg-amber-500/20 transition-colors`}>
                          <Coins size={24} className="text-amber-400" />
                        </div>
                        <span className="text-[10px] font-game text-amber-600 tracking-widest">GOLD</span>
                        <span className="font-game text-2xl text-amber-400">+{rewards.gold}</span>
                      </motion.div>
                    )}
                    {step >= 5 && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className={`p-3 bg-white/5 rounded-full mb-2 group-hover:bg-purple-500/20 transition-colors`}>
                          <Package size={24} className="text-purple-400" />
                        </div>
                        <span className="text-[10px] font-game text-purple-600 tracking-widest">DRPS</span>
                        <span className="font-game text-2xl text-purple-300">{rewards.items.length}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Item Drops List */}
            {rewards.items.length > 0 && step >= 6 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 flex flex-wrap justify-center gap-4"
              >
                {rewards.items.map((item, idx) => (
                  <motion.div 
                    key={`${item.id}-${idx}`} 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.2 }}
                    className="px-6 py-3 bg-purple-950/20 border border-purple-500/30 flex items-center gap-4 backdrop-blur-md"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#a855f7]" />
                    <span className="font-game text-xs text-purple-200 uppercase tracking-[0.2em]">{item.name}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Closing Hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0.2] }}
              transition={{ delay: 3, duration: 2, repeat: Infinity }}
              className="mt-20 font-game text-[10px] text-white uppercase tracking-[1em]"
            >
              Transferência concluída. Encerrando interface de rede...
            </motion.p>
          </div>

          {/* Holographic Corners */}
          <div className="absolute top-10 left-10 w-48 h-48 border-t-2 border-l-2 opacity-10 animate-pulse" style={{ borderColor: config.color }} />
          <div className="absolute top-10 right-10 w-48 h-48 border-t-2 border-r-2 opacity-10 animate-pulse" style={{ borderColor: config.color }} />
          <div className="absolute bottom-10 left-10 w-48 h-48 border-b-2 border-l-2 opacity-10 animate-pulse" style={{ borderColor: config.color }} />
          <div className="absolute bottom-10 right-10 w-48 h-48 border-b-2 border-r-2 opacity-10 animate-pulse" style={{ borderColor: config.color }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestCompletionOverlay;
