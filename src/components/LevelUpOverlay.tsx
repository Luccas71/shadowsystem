import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ChevronRight, TrendingUp } from 'lucide-react';

interface LevelUpOverlayProps {
    oldLevel: number;
    newLevel: number;
    onComplete: () => void;
}

const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({ oldLevel, newLevel, onComplete }) => {
    const [show, setShow] = useState(false);
    const [displayLevel, setDisplayLevel] = useState(oldLevel);
    const [isImpacted, setIsImpacted] = useState(false);

    useEffect(() => {
        setShow(true);
        
        // Impact effect
        setTimeout(() => setIsImpacted(true), 300);

        // Count-up animation
        const duration = 2000; // 2 seconds for count up
        const steps = newLevel - oldLevel;
        if (steps > 0) {
            let current = oldLevel;
            const stepTime = duration / steps;
            const timer = setInterval(() => {
                current++;
                setDisplayLevel(current);
                if (current >= newLevel) clearInterval(timer);
            }, stepTime);
        }

        const closeTimer = setTimeout(() => {
            setShow(false);
            setTimeout(onComplete, 800);
        }, 5000);

        return () => setShow(false);
    }, [oldLevel, newLevel, onComplete]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none overflow-hidden backdrop-blur-md bg-black/60 ${isImpacted ? 'animate-epic-shake' : ''}`}
                >
                    {/* Impact Flash Overlay */}
                    {isImpacted && (
                        <div className="absolute inset-0 bg-white z-[10001] animate-impact-flash pointer-events-none" />
                    )}

                    {/* Fundo radiante */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.2)_0%,transparent_70%)]" />

                    {/* Partículas de luz avançadas */}
                    <div className="absolute inset-0">
                        {[...Array(30)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    x: Math.random() * window.innerWidth,
                                    y: window.innerHeight + 100,
                                    opacity: 0,
                                    scale: Math.random() * 0.5 + 0.5
                                }}
                                animate={{
                                    y: [window.innerHeight + 100, Math.random() * window.innerHeight, -100],
                                    x: [undefined, Math.random() * window.innerWidth, undefined] as any,
                                    opacity: [0, 0.8, 0],
                                    scale: [0.5, 1.2, 0.5],
                                }}
                                transition={{
                                    duration: Math.random() * 2 + 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                    ease: "easeInOut"
                                }}
                                className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full blur-[2px]"
                            />
                        ))}
                    </div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="relative flex flex-col items-center gap-8"
                    >
                        {/* Círculo de poder central */}
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="w-56 h-56 border-2 border-dashed border-cyan-500/30 rounded-full shadow-[0_0_30px_rgba(0,229,255,0.2)]"
                            />
                            <motion.div
                                animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 border-2 border-dotted border-cyan-400/20 rounded-full"
                            />
                            
                            {/* Mana Surge Circles */}
                            <motion.div 
                                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="absolute inset-0 border border-cyan-500/30 rounded-full"
                            />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    initial={{ rotateY: 180, opacity: 0, scale: 0 }}
                                    animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                                    className="p-8 bg-cyan-950/40 border-2 border-cyan-500/50 rounded-full shadow-[0_0_60px_rgba(0,229,255,0.4)] backdrop-blur-xl"
                                >
                                    <Zap size={72} className="text-white drop-shadow-[0_0_20px_rgba(0,229,255,1)]" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Texto principal */}
                        <div className="text-center space-y-4">
                            <motion.h2
                                initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
                                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                transition={{ delay: 0.8 }}
                                className="font-game text-6xl md:text-8xl text-white tracking-[0.3em] uppercase animate-glitch-chromatic"
                            >
                                LEVEL UP
                            </motion.h2>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.1 }}
                                className="flex items-center justify-center gap-10"
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-game text-slate-500 uppercase tracking-widest">Status Atual</span>
                                    <span className="font-game text-3xl text-slate-600">NV.{oldLevel}</span>
                                </div>

                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <ChevronRight className="text-cyan-500" size={40} />
                                </motion.div>

                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-game text-cyan-400 uppercase tracking-[0.2em]">Novo Patamar</span>
                                    <motion.span 
                                        key={displayLevel}
                                        initial={{ scale: 1.5, color: "#fff" }}
                                        animate={{ scale: 1, color: "#00e5ff" }}
                                        className="font-game text-7xl text-white neon-text-cyan-strong"
                                    >
                                        {displayLevel}
                                    </motion.span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Rodapé do Sistema */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.5 }}
                            className="flex items-center gap-4 px-8 py-3 border border-cyan-500/30 bg-cyan-950/30 rounded-sm relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-cyan-500/5 animate-pulse" />
                            <TrendingUp size={18} className="text-cyan-400" />
                            <span className="font-game text-xs text-cyan-300 tracking-[0.4em] uppercase">Limites de Mana Expandidos</span>
                        </motion.div>
                    </motion.div>

                    {/* Efeito de Scanline Vertical */}
                    <div className="scan-line-effect" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LevelUpOverlay;
