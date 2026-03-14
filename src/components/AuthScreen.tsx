import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Skull, LogIn, UserPlus, Mail, Lock, AlertTriangle, Monitor, Eye, EyeOff } from 'lucide-react';

type AuthMode = 'login' | 'register';

const AuthScreen: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            if (mode === 'register') {
                const { error } = await supabase.auth.signUp({
                    email: email.toLowerCase().trim(),
                    password,
                });

                if (error) throw error;
                setSuccess('REGISTRO CONCLUÍDO. VERIFIQUE SEU EMAIL PARA ATIVAR A CONTA.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: email.toLowerCase().trim(),
                    password,
                });

                if (error) throw error;
                // Auth state change will be detected by the listener in App.tsx
            }
        } catch (err: unknown) {
            const message = (err as { message?: string })?.message || 'Erro desconhecido do sistema.';

            // Translate common Supabase errors
            const errorMap: Record<string, string> = {
                'Invalid login credentials': 'CREDENCIAIS INVÁLIDAS. ACESSO NEGADO.',
                'User already registered': 'CAÇADOR JÁ REGISTRADO NO SISTEMA.',
                'Password should be at least 6 characters': 'SENHA DEVE TER NO MÍNIMO 6 CARACTERES.',
                'Unable to validate email address: invalid format': 'FORMATO DE EMAIL INVÁLIDO.',
                'Email not confirmed': 'EMAIL NÃO CONFIRMADO. VERIFIQUE SUA CAIXA DE ENTRADA.',
                'Email rate limit exceeded': 'LIMITE DE REQUISIÇÕES EXCEDIDO. AGUARDE ALGUNS MINUTOS E TENTE NOVAMENTE.',
            };

            setError(errorMap[message] || `ERRO DO SISTEMA: ${message.toUpperCase()}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-40 h-40 border-t-2 border-l-2 border-cyan-500/10 opacity-40"></div>
                <div className="absolute top-10 right-10 w-40 h-40 border-t-2 border-r-2 border-cyan-500/10 opacity-40"></div>
                <div className="absolute bottom-10 left-10 w-40 h-40 border-b-2 border-l-2 border-cyan-500/10 opacity-40"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 border-b-2 border-r-2 border-cyan-500/10 opacity-40"></div>
            </div>

            {/* Fixed header bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.5)] z-50 opacity-30"></div>

            <div className="w-full max-w-md relative z-10">
                {/* System Header */}
                <div className="text-center mb-10 space-y-4">
                    <div className="flex items-center justify-center gap-2 opacity-30 mb-6">
                        <Monitor size={14} className="text-cyan-500" />
                        <span className="font-game text-[10px] tracking-[0.3em] text-cyan-700">SHADOW SYSTEM // AUTH PROTOCOL V1.0</span>
                    </div>

                    <div className="relative inline-block">
                        <Skull size={64} className="text-cyan-500 mx-auto drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
                    </div>

                    <h1 className="font-game text-3xl md:text-4xl text-slate-100 neon-text-cyan-strong
 tracking-tight">
                        SHADOW SYSTEM
                    </h1>
                    <p className="font-game text-[10px] text-cyan-700 tracking-[0.4em] uppercase">
                        {mode === 'login' ? 'PROTOCOLO DE AUTENTICAÇÃO' : 'REGISTRO DE NOVO CAÇADOR'}
                    </p>
                </div>

                {/* Auth Card */}
                <div className="system-panel p-8 border-cyan-500/20 shadow-[0_0_50px_rgba(6, 182, 212, 0.1)
] relative">
                    <div className="hud-tl hud-corner"></div>
                    <div className="hud-tr hud-corner"></div>
                    <div className="hud-bl hud-corner"></div>
                    <div className="hud-br hud-corner"></div>

                    {/* Mode Toggle */}
                    <div className="grid grid-cols-2 gap-2 mb-8">
                        <button
                            onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                            className={`py-3 font-game text-[11px] tracking-widest uppercase transition-all border ${mode === 'login'
                                ? 'bg-orange-600/10 text-orange-400 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                                : 'text-slate-500 border-slate-900 hover:text-slate-300 bg-black/40'
                                }`}
                        >
                            <LogIn size={14} className="inline mr-2" />
                            Entrar
                        </button>
                        <button
                            onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
                            className={`py-3 font-game text-[11px] tracking-widest uppercase transition-all border ${mode === 'register'
                                ? 'bg-orange-600/10 text-orange-400 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                                : 'text-slate-500 border-slate-900 hover:text-slate-300 bg-black/40'
                                }`}
                        >
                            <UserPlus size={14} className="inline mr-2" />
                            Registrar
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-game text-cyan-600 uppercase tracking-widest font-bold">
                                Identificação do Caçador
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-800" size={16} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="hunter@shadowsystem.io"
                                    required
                                    autoComplete="off"
                                    data-1p-ignore
                                    spellCheck={false}
                                    className="w-full bg-black border border-cyan-900/30 pl-10 pr-4 py-3 text-slate-100 font-sans text-sm outline-none focus:border-cyan-500 transition-all rounded"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-game text-cyan-600 uppercase tracking-widest font-bold">
                                Chave de Acesso
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-800" size={16} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    autoComplete="off"
                                    data-1p-ignore
                                    spellCheck={false}
                                    className="w-full bg-black border border-cyan-900/30 pl-10 pr-12 py-3 text-slate-100 font-sans text-sm outline-none focus:border-cyan-500 transition-all rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-800 hover:text-cyan-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-950/30 border border-red-500/30 rounded-lg animate-in slide-in-from-top-2">
                                <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="font-game text-[11px] text-red-400 uppercase tracking-wider leading-relaxed">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="flex items-start gap-3 p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-lg animate-in slide-in-from-top-2">
                                <Monitor size={16} className="text-cyan-500 shrink-0 mt-0.5" />
                                <p className="font-game text-[11px] text-cyan-400 uppercase tracking-wider leading-relaxed">{success}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 border-2 font-game text-[12px] tracking-widest transition-all rounded font-bold uppercase flex items-center justify-center gap-3 ${loading
                                ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-wait'
                                : 'bg-slate-900 border-orange-800 text-orange-400 hover:bg-orange-800 hover:border-orange-400 hover:text-white shadow-[0_0_20px_rgba(249,115,22,0.15)]'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-orange-800 border-t-orange-400 rounded-full animate-spin"></div>
                                    SINCRONIZANDO...
                                </>
                            ) : mode === 'login' ? (
                                <>
                                    <LogIn size={16} />
                                    INICIAR SESSÃO
                                </>
                            ) : (
                                <>
                                    <UserPlus size={16} />
                                    REGISTRAR CAÇADOR
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-cyan-900/20 text-center">
                        <p className="text-[9px] text-slate-700 font-game uppercase tracking-[0.2em]">
                            "APENAS AQUELES QUE O SISTEMA ESCOLHE PODEM DESPERTAR."
                        </p>
                    </div>
                </div>

                {/* Bottom version tag */}
                <div className="text-center mt-6">
                    <p className="text-[8px] font-game text-slate-800 tracking-[0.3em] uppercase">
                        SHADOW SYSTEM // AUTH MODULE // SUPABASE CORE
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
