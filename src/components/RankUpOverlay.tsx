import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rank } from '../types';
import { Shield, Sparkles, Trophy, Skull, Zap, Target } from 'lucide-react';

interface RankUpOverlayProps {
    oldRank: Rank;
    newRank: Rank;
    onComplete: () => void;
}

const RankUpOverlay: React.FC<RankUpOverlayProps> = ({ oldRank, newRank, onComplete }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
        const timer = setTimeout(() => {
            setShow(false);
            setTimeout(onComplete, 800);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    const getRankConfig = (rank: Rank) => {
        switch (rank) {
            case Rank.S:
                return {
                    color: '#ef4444',
                    neon: 'neon-text-red',
                    icon: <Skull size={80} />,
                    bg: 'bg-red-500/20',
                    border: 'border-red-500',
                    shadow: 'shadow-[0_0_50px_rgba(239,68,68,0.5)]'
                };
            case Rank.A:
                return {
                    color: '#f97316',
                    neon: 'neon-text-orange',
                    icon: <Trophy size={80} />,
                    bg: 'bg-orange-500/20',
                    border: 'border-orange-500',
                    shadow: 'shadow-[0_0_50px_rgba(249,115,22,0.5)]'
                };
            case Rank.B:
                return {
                    color: '#a855f7',
                    neon: 'neon-text-purple',
                    icon: <Zap size={80} />,
                    bg: 'bg-purple-500/20',
                    border: 'border-purple-500',
                    shadow: 'shadow-[0_0_50px_rgba(168,85,247,0.5)]'
                };
            default:
                return {
                    color: '#10b981',
                    neon: 'neon-text-green-strong',
                    icon: <Shield size={80} />,
                    bg: 'bg-emerald-500/20',
                    border: 'border-emerald-500',
                    shadow: 'shadow-[0_0_50px_rgba(16,185,129,0.5)]'
                };
        }
    };

    const config = getRankConfig(newRank);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[10001] flex items-center justify-center pointer-events-none overflow-hidden backdrop-blur-xl bg-black/80"
                >
                    {/* Fundo radiante dinâmico */}
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            background: `radial-gradient(circle_at_center, ${config.color} 0%, transparent 70%)`
                        }}
                    />

                    {/* Efeito de Glitch Background */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.1)_0px,rgba(255,255,255,0.1)_1px,transparent_1px,transparent_2px)] bg-[length:100%_3px]" />
                    </div>

                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 12, stiffness: 100 }}
                        className="relative flex flex-col items-center gap-10"
                    >
                        {/* Círculo de Despertar */}
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -inset-10 rounded-full blur-3xl"
                                style={{ backgroundColor: config.color }}
                            />
                            <motion.div
                                initial={{ rotate: 180, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ delay: 0.3, duration: 1.5, type: "spring" }}
                                className={`w-56 h-56 flex items-center justify-center bg-black border-4 ${config.border} rounded-full z-10 relative ${config.shadow}`}
                            >
                                <div style={{ color: config.color }} className="drop-shadow-[0_0_15px_currentColor]">
                                    {config.icon}
                                </div>
                            </motion.div>

                            {/* Partículas explosivas de Despertar */}
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ x: 0, y: 0, opacity: 0 }}
                                    animate={{
                                        x: Math.cos(i * 30 * (Math.PI / 180)) * 250,
                                        y: Math.sin(i * 30 * (Math.PI / 180)) * 250,
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{ delay: 0.8, duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full blur-[1px] z-0"
                                    style={{ backgroundColor: config.color }}
                                />
                            ))}
                        </div>

                        {/* Texto de Despertar de Rank */}
                        <div className="text-center space-y-2 relative z-10">
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <span className={`font-game text-xl tracking-[1em] ${config.neon} opacity-70`}>DESPERTAR DE</span>
                            </motion.div>
                            <motion.h2
                                initial={{ scale: 1.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                                className={`font-game text-7xl md:text-9xl text-white tracking-[0.2em] uppercase ${config.neon}`}
                            >
                                ASCENSÃO DE RANK
                            </motion.h2>

                            <div className="flex items-center justify-center gap-12 mt-8">
                                <motion.div
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                    className="flex flex-col items-center"
                                >
                                    <span className="text-[12px] font-game text-slate-500 tracking-widest uppercase">Rank Anterior</span>
                                    <span className="font-game text-5xl text-slate-700">{oldRank}</span>
                                </motion.div>

                                <motion.div
                                    initial={{ scale: 0, rotate: 180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 1.5, type: "spring" }}
                                    className="p-3 bg-white/5 rounded-full border border-white/10"
                                >
                                    <Target className="text-white/20" size={30} />
                                </motion.div>

                                <motion.div
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                    className="flex flex-col items-center"
                                >
                                    <span className={`text-[12px] font-game tracking-widest uppercase`} style={{ color: config.color }}>Novo Rank</span>
                                    <span className={`font-game text-7xl text-white ${config.neon}`}>{newRank}</span>
                                </motion.div>
                            </div>
                        </div>

                        {/* Log de Ajuste de Autoridade */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.2 }}
                            className={`flex items-center gap-4 px-10 py-3 border-2 ${config.border} ${config.bg} rounded-sm relative overflow-hidden group`}
                        >
                            <div className="absolute inset-0 bg-white/5 animate-pulse" />
                            <Sparkles size={20} style={{ color: config.color }} />
                            <span className="font-game text-sm text-white tracking-[0.3em] uppercase">Autoridade do Sistema Reajustada</span>
                        </motion.div>
                    </motion.div>

                    {/* Efeitos de borda dinâmicos */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className={`absolute top-0 inset-x-0 h-1 blur-sm`} style={{ backgroundColor: config.color }} />
                        <div className={`absolute bottom-0 inset-x-0 h-1 blur-sm`} style={{ backgroundColor: config.color }} />
                        <div className={`absolute left-0 inset-y-0 w-1 blur-sm`} style={{ backgroundColor: config.color }} />
                        <div className={`absolute right-0 inset-y-0 w-1 blur-sm`} style={{ backgroundColor: config.color }} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RankUpOverlay;
