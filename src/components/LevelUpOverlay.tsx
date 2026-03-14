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

    useEffect(() => {
        setShow(true);
        const timer = setTimeout(() => {
            setShow(false);
            setTimeout(onComplete, 800); // Aguarda animação de saída
        }, 4500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none overflow-hidden backdrop-blur-md bg-black/60"
                >
                    {/* Fundo radiante */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.15)_0%,transparent_70%)]" />

                    {/* Partículas de luz */}
                    <div className="absolute inset-0">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    x: Math.random() * window.innerWidth,
                                    y: window.innerHeight + 100,
                                    opacity: 0,
                                    scale: Math.random() * 0.5 + 0.5
                                }}
                                animate={{
                                    y: -100,
                                    opacity: [0, 0.8, 0],
                                }}
                                transition={{
                                    duration: Math.random() * 2 + 3,
                                    repeat: Infinity,
                                    delay: Math.random() * 2
                                }}
                                className="absolute w-1 h-1 bg-cyan-400 rounded-full blur-[1px]"
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
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="w-48 h-48 border-2 border-dashed border-cyan-500/30 rounded-full"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-2 border-2 border-dotted border-cyan-400/20 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    initial={{ rotateY: 180, opacity: 0 }}
                                    animate={{ rotateY: 0, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 1 }}
                                    className="p-6 bg-cyan-950/40 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.3)] backdrop-blur-xl"
                                >
                                    <Zap size={64} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Texto principal */}
                        <div className="text-center space-y-4">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="font-game text-5xl md:text-7xl text-white tracking-[0.3em] uppercase neon-text-cyan-strong"
                            >
                                SUBIU DE NÍVEL
                            </motion.h2>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.1 }}
                                className="flex items-center justify-center gap-6"
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-game text-cyan-700 uppercase tracking-widest">Nível Anterior</span>
                                    <span className="font-game text-3xl text-slate-500">{oldLevel}</span>
                                </div>

                                <ChevronRight className="text-cyan-500 animate-pulse" size={32} />

                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-game text-cyan-400 uppercase tracking-widest">Novo Nível</span>
                                    <span className="font-game text-5xl text-white neon-text-cyan-strong">{newLevel}</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Rodapé do Sistema */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2 }}
                            className="flex items-center gap-3 px-6 py-2 border border-cyan-500/20 bg-cyan-950/20 rounded-full"
                        >
                            <TrendingUp size={14} className="text-cyan-500" />
                            <span className="font-game text-[10px] text-cyan-400/70 tracking-[0.2em] uppercase">Status de Combate Incrementado</span>
                        </motion.div>
                    </motion.div>

                    {/* Efeito de Flash Scanline */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                        <motion.div
                            animate={{ y: ["0%", "100%", "0%"] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="w-full h-1/4 bg-gradient-to-b from-transparent via-cyan-500 to-transparent blur-xl"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LevelUpOverlay;
