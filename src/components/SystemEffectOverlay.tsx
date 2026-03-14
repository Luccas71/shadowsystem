
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Zap, Coins } from 'lucide-react';

export type EffectType = 'penalty' | 'useItem' | 'purchase';

export interface EffectData {
  type: EffectType;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

interface SystemEffectOverlayProps {
  effect: EffectData | null;
  onComplete: () => void;
}

const SystemEffectOverlay: React.FC<SystemEffectOverlayProps> = ({ effect, onComplete }) => {
  const [activeEffect, setActiveEffect] = useState<EffectData | null>(null);

  useEffect(() => {
    if (effect) {
      setActiveEffect(effect);
      const duration = effect.type === 'useItem' ? 1500 : 800;
      const timer = setTimeout(() => {
        setActiveEffect(null);
        onComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [effect, onComplete]);

  const renderEffect = () => {
    if (!activeEffect) return null;

    switch (activeEffect.type) {
      case 'penalty':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5, 1, 0] }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center bg-red-600/20"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <AlertTriangle size={120} className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
              <h2 className="font-game text-4xl text-red-500 tracking-[0.5em] uppercase neon-text-red">PENALIDADE ATIVADA</h2>
            </motion.div>
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,0,0,0.1)_0px,rgba(255,0,0,0.1)_1px,transparent_1px,transparent_2px)] bg-[length:100%_2px] animate-pulse" />
          </motion.div>
        );
      case 'useItem':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center backdrop-blur-sm bg-black/40"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative p-1 bg-green-500/20 rounded-sm overflow-hidden min-w-[350px] max-w-md"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-400 shadow-[0_0_15px_#22c55e]" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-400 shadow-[0_0_15px_#22c55e]" />
              <div className="system-panel p-8 bg-slate-950/95 flex flex-col items-center gap-6 text-center">
                <div className="p-4 border-2 border-green-400 rounded-full bg-green-950/30">
                  {activeEffect.icon || <Zap size={48} className="text-green-400" />}
                </div>
                <div className="space-y-2">
                  <h2 className="font-game text-xs text-green-500 tracking-[0.4em] uppercase font-bold">ITEM CONSUMIDO</h2>
                  <h3 className="font-game text-2xl text-white tracking-widest uppercase neon-text-green-strong">{activeEffect.title || 'ARTEFATO ATIVADO'}</h3>
                </div>
                {activeEffect.subtitle && (
                  <div className="w-full h-px bg-green-900/30 my-2" />
                )}
                {activeEffect.subtitle && (
                  <p className="font-game text-[11px] text-green-300/80 tracking-widest leading-relaxed uppercase italic">
                    {activeEffect.subtitle}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        );
      case 'purchase':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.2, 1], opacity: 1 }}
              className="relative p-1 bg-green-500/20 rounded-sm overflow-hidden min-w-[300px]"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-400 shadow-[0_0_10px_#22c55e]" />
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400 shadow-[0_0_10px_#22c55e]" />
              <div className="system-panel p-6 bg-slate-950/90 flex flex-col items-center gap-3">
                <Coins size={40} className="text-amber-400" />
                <h2 className="font-game text-lg text-white tracking-[0.3em] uppercase neon-text-green-strong">ADQUIRIDO</h2>
              </div>
            </motion.div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {activeEffect && renderEffect()}
    </AnimatePresence>
  );
};

export default SystemEffectOverlay;
