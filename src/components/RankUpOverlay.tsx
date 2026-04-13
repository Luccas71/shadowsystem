import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rank } from '../types';
import { Shield, Sparkles, Trophy, Skull, Zap, Target, ChevronRight } from 'lucide-react';

interface RankUpOverlayProps {
    oldRank: Rank;
    newRank: Rank;
    onComplete: () => void;
}

const RankUpOverlay: React.FC<RankUpOverlayProps> = ({ oldRank, newRank, onComplete }) => {
    const [show, setShow] = useState(false);
    const [isImpacted, setIsImpacted] = useState(false);

    useEffect(() => {
        setShow(true);
        
        // Impact effect after some preparation
        const impactTimer = setTimeout(() => setIsImpacted(true), 600);

        const closeTimer = setTimeout(() => {
            setShow(false);
            setTimeout(onComplete, 500);
        }, 4000);

        return () => {
          clearTimeout(impactTimer);
          clearTimeout(closeTimer);
        };
    }, [onComplete]);

    const getRankConfig = (rank: Rank) => {
        switch (rank) {
            case Rank.S:
                return {
                    color: '#ef4444',
                    neon: 'neon-text-red',
                    icon: <Skull size={100} />,
                    bg: 'bg-red-500/20',
                    border: 'border-red-500',
                    shadow: 'shadow-[0_0_100px_rgba(239,68,68,0.6)]'
                };
            case Rank.A:
                return {
                    color: '#f97316',
                    neon: 'neon-text-orange',
                    icon: <Trophy size={100} />,
                    bg: 'bg-orange-500/20',
                    border: 'border-orange-500',
                    shadow: 'shadow-[0_0_80px_rgba(249,115,22,0.5)]'
                };
            case Rank.B:
                return {
                    color: '#f59e0b',
                    neon: 'neon-text-amber',
                    icon: <Zap size={100} />,
                    bg: 'bg-amber-500/20',
                    border: 'border-amber-500',
                    shadow: 'shadow-[0_0_70px_rgba(245,158,11,0.5)]'
                };
            default:
                return {
                    color: '#06b6d4',
                    neon: 'neon-text-cyan-strong',
                    icon: <Shield size={100} />,
                    bg: 'bg-cyan-500/20',
                    border: 'border-cyan-500',
                    shadow: 'shadow-[0_0_60px_rgba(6,182,212,0.5)]'
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
                    onClick={onComplete}
                    className={`fixed inset-0 z-[10001] flex items-center justify-center pointer-events-auto cursor-pointer overflow-hidden backdrop-blur-2xl bg-black/90 ${isImpacted ? 'animate-epic-shake' : ''}`}
                >
                    {/* Impact Flash */}
                    {isImpacted && (
                        <div className="absolute inset-0 bg-white z-[10002] animate-impact-flash pointer-events-none" />
                    )}

                    {/* Fundo radiante dinâmico */}
                    <div
                        className="absolute inset-0 opacity-40"
                        style={{
                            background: `radial-gradient(circle_at_center, ${config.color} 0%, transparent 60%)`
                        }}
                    />

                    {/* Efeito de Glitch Background */}
                    <div className="absolute inset-0 opacity-20 bg-data-rain" />

                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ duration: 0.8, type: "spring", damping: 12, stiffness: 100 }}
                        className="relative flex flex-col items-center gap-12"
                    >
                        {/* Círculo de Despertar */}
                        <div className="relative">
                            {/* Mana Surge */}
                            <motion.div
                                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute -inset-10 border-2 rounded-full"
                                style={{ borderColor: config.color }}
                            />
                            
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -inset-20 rounded-full blur-[100px]"
                                style={{ backgroundColor: config.color }}
                            />
                            
                            <motion.div
                                initial={{ rotate: 180, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ delay: 0.3, duration: 1, type: "spring" }}
                                className={`w-72 h-72 flex items-center justify-center bg-black border-4 ${config.border} rounded-full z-10 relative ${config.shadow}`}
                            >
                                <div style={{ color: config.color }} className="drop-shadow-[0_0_30px_currentColor]">
                                    {config.icon}
                                </div>
                            </motion.div>

                            {/* Partículas explosivas massivas */}
                            {isImpacted && [...Array(24)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ x: 0, y: 0, opacity: 1 }}
                                    animate={{
                                        x: Math.cos(i * 15 * (Math.PI / 180)) * 600,
                                        y: Math.sin(i * 15 * (Math.PI / 180)) * 600,
                                        opacity: 0,
                                        scale: [1, 2, 0]
                                    }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full blur-[2px] z-20"
                                    style={{ backgroundColor: config.color }}
                                />
                            ))}
                        </div>

                        {/* Texto de Despertar de Rank */}
                        <div className="text-center space-y-4 relative z-10">
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <span className={`font-game text-2xl tracking-[1.5em] ${config.neon} opacity-80 uppercase`}>Despertar Sugerido</span>
                            </motion.div>
                            
                            <motion.h2
                                initial={{ scale: 2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                                className={`font-game text-8xl md:text-9xl text-white tracking-[0.1em] uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]`}
                            >
                                RANK <span className="animate-glitch-chromatic inline-block">{newRank}</span>
                            </motion.h2>

                            <div className="flex items-center justify-center gap-16 mt-8">
                                <motion.div
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 1.5 }}
                                    className="flex flex-col items-center"
                                >
                                    <span className="text-[14px] font-game text-slate-500 tracking-widest uppercase">Rank Anterior</span>
                                    <span className="font-game text-6xl text-slate-700">{oldRank}</span>
                                </motion.div>

                                <motion.div
                                    initial={{ scale: 0, rotate: 360 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 1.8, type: "spring" }}
                                    className="p-4 bg-white/5 rounded-full border-2 border-white/10"
                                >
                                    <ChevronRight className="text-white animate-pulse" size={40} />
                                </motion.div>

                                <motion.div
                                    initial={{ x: 100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 1.5 }}
                                    className="flex flex-col items-center"
                                >
                                    <span className={`text-[14px] font-game tracking-[0.2em] uppercase`} style={{ color: config.color }}>Nova Autoridade</span>
                                    <span className={`font-game text-8xl text-white drop-shadow-[0_0_20px_white]`}>{newRank}</span>
                                </motion.div>
                            </div>
                        </div>

                        {/* Log de Ajuste de Autoridade */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 3 }}
                            className={`flex items-center gap-6 px-12 py-4 border-2 ${config.border} ${config.bg} rounded-sm relative overflow-hidden group backdrop-blur-sm`}
                        >
                            <div className="absolute inset-0 bg-white/10 animate-pulse" />
                            <Target size={24} style={{ color: config.color }} />
                            <span className="font-game text-lg text-white tracking-[0.5em] uppercase">SISTEMA RECALIBRADO</span>
                        </motion.div>
                    </motion.div>

                    {/* Scanline Effect */}
                    <div className="scan-line-effect" style={{ background: `linear-gradient(to bottom, transparent, ${config.color}, transparent)` }} />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RankUpOverlay;
