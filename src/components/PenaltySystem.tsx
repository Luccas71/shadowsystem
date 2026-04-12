
import React, { useState, useEffect } from 'react';
import { Vice, HunterProfile } from '../types';
import {
  Skull,
  AlertTriangle,
  Flame,
  Ghost,
  Timer,
  ShieldAlert,
  Plus,
  X,
  ArrowDown,
  Lock,
  ScrollText
} from 'lucide-react';

interface PenaltySystemProps {
  profile: HunterProfile;
  vices: Vice[];
  onAddVice: (title: string, corruption: number) => void;
  onRemoveVice: (id: string) => void;
  onSuccumb: (vice: Vice) => void;
  onStartSurvival: () => void;
}

const PenaltySystem: React.FC<PenaltySystemProps> = ({
  profile,
  vices,
  onAddVice,
  onRemoveVice,
  onSuccumb,
  onStartSurvival
}) => {
  const [newViceTitle, setNewViceTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!profile.isPenaltyZoneActive || !profile.penaltyEndTime) return;
    const interval = setInterval(() => {
      const diff = profile.penaltyEndTime! - Date.now();
      if (diff <= 0) {
        setTimeLeft('CONCLUÍDO');
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [profile.isPenaltyZoneActive, profile.penaltyEndTime]);

  return (
    <div className="space-y-8">
      {/* Header Perigo */}
      <div className={`relative p-6 border-2 overflow-hidden ${profile.corruption >= 100 ? 'border-red-600 bg-red-950/40' : 'border-cyan-900/50 bg-cyan-950/10'}`}>
        <div className={`absolute top-0 left-0 w-full h-1 bg-cyan-600 shadow-[0_0_10px_#06b6d4]`} style={{ width: `${profile.corruption}%` }}></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h2 className={`font-game text-xl flex items-center gap-3 uppercase italic ${profile.corruption >= 100 ? 'text-red-500' : 'text-cyan-400'}`}>
            <Skull size={20} /> Purificação
          </h2>
          <span className="font-game text-[9px] text-cyan-600/60 tracking-[0.2em] font-bold">
            {profile.corruption >= 100 ? "⚠️ ALERTA CRÍTICO" : "SINC_ALMA // ATIVO"}
          </span>
        </div>

        {/* Corruption Meter */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between font-game text-[9px] text-cyan-400/70 uppercase">
            <span>Nível de Instabilidade</span>
            <span className={profile.corruption >= 100 ? "text-red-600 font-bold" : ""}>{profile.corruption.toFixed(2)}%</span>
          </div>
          <div className="h-2 bg-black/40 border-x border-cyan-900/30 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${profile.corruption >= 100 ? 'bg-red-600' : profile.corruption > 50 ? 'bg-cyan-800' : 'bg-cyan-600'} relative overflow-hidden`}
              style={{ width: `${profile.corruption}%` }}
            >
              <div className="absolute inset-0 shimmer-gradient opacity-20"></div>
            </div>
          </div>
        </div>
      </div>

      {profile.isPenaltyZoneActive ? (
        /* Zona de Penalidade Ativa */
        <div className="hud-board border-2 border-red-600 p-8 text-center space-y-6 bg-black/80">
          <div className="relative inline-block">
            <Ghost size={80} className="text-red-600 mx-auto" />
            <AlertTriangle className="absolute -bottom-2 -right-2 text-red-500" />
          </div>
          <h3 className="font-game text-4xl text-red-500 uppercase tracking-tighter">ZONA DE PENALIDADE</h3>
          <p className="text-red-400 italic max-w-md mx-auto font-medium font-game">"Sua vontade fraquejou. O Vazio irá filtrar suas impurezas por 12 horas."</p>

          <div className="text-6xl font-game text-red-600 py-4 tabular-nums">
            {timeLeft}
          </div>

          <div className="p-4 bg-red-950/40 border border-red-800 max-w-lg mx-auto">
            <div className="font-game text-[10px] text-red-500 mb-1 uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldAlert size={14} /> Penalidade Ativa
            </div>
            <div className="text-white font-game text-xl uppercase">
              {profile.penaltyType?.replace('_', ' ') || 'DRENO DE MANA'}
            </div>
            <p className="text-[10px] text-red-400 mt-2 italic">
              {profile.penaltyType === 'gold_drain' && 'Seu ouro está escapando pelas fendas do sistema.'}
              {profile.penaltyType === 'xp_drain' && 'Sua experiência está sendo consumida pelas sombras.'}
              {profile.penaltyType === 'block_rewards' && 'O sistema recusa recompensar um caçador fraco.'}
              {profile.penaltyType === 'corruption_spike' && 'A corrupção se recusa a abandonar sua alma.'}
            </p>
          </div>

          <div className="p-4 bg-red-900/20 border border-red-900 text-[10px] font-game text-red-500 uppercase leading-relaxed text-center">
            O SISTEMA CONTINUA OPERANTE, MAS O PREÇO DA FALHA DEVE SER PAGO.
          </div>
        </div>
      ) : (
        /* Interface Normal de Punição */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna de Vícios */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-red-900/40 pb-2">
              <h3 className="font-game text-xs text-red-600 uppercase flex items-center gap-2">
                <Flame size={14} /> Fragilidades Registradas
              </h3>
              <button
                onClick={() => setIsAdding(true)}
                className="p-2 bg-red-950/20 hover:bg-red-500/10 border border-red-900/50 text-red-600 hover:text-red-400 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            {vices.length === 0 ? (
              <div className="hud-board p-8 border border-dashed border-red-900/30 text-center bg-black/40">
                <p className="text-[10px] text-slate-600 italic uppercase font-game tracking-widest">A alma permanece imaculada.</p>
              </div>
            ) : (
              vices.map(vice => (
                <div key={vice.id} className="hud-board border border-red-900/40 p-5 flex justify-between items-center group hover:border-red-500/50 bg-black/40">
                  <div>
                    <h4 className="font-game text-sm text-red-100 uppercase tracking-tight">{vice.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-red-600 font-bold uppercase px-1 border border-red-900 bg-red-950/20">
                        RISCO: +{vice.corruptionIncrease}% CORRUPÇÃO
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onSuccumb(vice)}
                      className="px-4 py-2 bg-red-900/20 border border-red-900 text-red-500 font-game text-[9px] hover:bg-red-600 hover:text-white uppercase tracking-widest"
                    >
                      CEDER
                    </button>
                    <button
                      onClick={() => onRemoveVice(vice.id)}
                      className="text-slate-700 hover:text-red-500 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Coluna de Sobrevivência */}
          <div className="hud-board border border-red-900/30 p-6 space-y-4 flex flex-col justify-between bg-black/60">
            <div>
              <div className="flex items-center gap-2 text-red-500 mb-4 border-b border-red-900 pb-2">
                <ShieldAlert size={20} />
                <h3 className="font-game text-xs uppercase tracking-[0.2em]">O Deserto do Vazio</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 italic">
                "Você ignorou seus deveres. O Sistema não tolera fraqueza. Sobreviva à filtragem de 12 horas para restaurar sua mana."
              </p>

              <ul className="space-y-2 text-[10px] font-game text-red-800 uppercase mb-6">
                <li className="flex items-center gap-2"><ArrowDown size={12} /> Dreno de Ouro ou XP (0.03%)</li>
                <li className="flex items-center gap-2"><ArrowDown size={12} /> Bloqueio de Recompensas</li>
                <li className="flex items-center gap-2"><ArrowDown size={12} /> Instabilidade de Mana</li>
              </ul>
            </div>

            <button
              disabled={profile.corruption < 100}
              onClick={() => onStartSurvival()}
              className={`w-full py-5 font-game text-sm uppercase border-2 flex flex-col items-center justify-center gap-1 ${profile.corruption >= 100
                  ? 'bg-red-600 border-red-400 text-white'
                  : 'bg-slate-950 border-red-900 text-red-900 opacity-50 cursor-not-allowed'
                }`}
            >
              <span className="flex items-center gap-2">
                {profile.corruption < 100 ? <Lock size={18} /> : <Timer size={18} />}
                {profile.corruption < 100 ? "MANA ESTÁVEL" : "Iniciar Purificação (12h)"}
              </span>
              {profile.corruption < 100 && (
                <span className="text-[8px] opacity-60">REQUER 100% DE CORRUPÇÃO</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Relatório de Fragilidades */}
      <div className="mt-12 space-y-6">
        <h3 className="font-game text-[14px] text-red-900/60 uppercase flex items-center gap-3 border-b border-red-900/20 pb-3 font-black tracking-widest">
          <ScrollText size={16} className="text-red-600" /> REGISTRO DE QUEDAS (LOG DE FRAGILIDADE)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(!profile.fragilityHistory || profile.fragilityHistory.length === 0) ? (
            <div className="col-span-full py-12 text-center border border-dashed border-red-900/20 bg-red-950/5 rounded-lg">
               <Skull size={32} className="mx-auto text-red-900/20 mb-3" />
               <p className="font-game text-[10px] text-red-900/40 uppercase tracking-widest font-black">NENHUMA QUEBRA DE PROTOCOLO REGISTRADA</p>
               <p className="text-[8px] text-red-900/30 uppercase mt-1">Sua vontade permanece inabalável perante o sistema.</p>
            </div>
          ) : (
            [...profile.fragilityHistory].sort((a,b) => b.date.localeCompare(a.date)).map((entry, idx) => (
              <div key={idx} className="hud-board border-red-900/30 p-5 bg-red-950/10 flex flex-col gap-2 relative group overflow-hidden hover:border-red-600/50 transition-all duration-300">
                <div className="flex justify-between items-start relative z-10">
                   <div className="space-y-0.5">
                     <span className="font-game text-[10px] text-red-500/70 block uppercase tracking-tighter">DATA DO EVENTO</span>
                     <span className="font-game text-sm text-white font-black tracking-widest">
                       {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                     </span>
                   </div>
                   <div className="text-right">
                     <span className="font-game text-2xl text-red-600 font-extrabold drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">{entry.count}</span>
                     <span className="font-game text-[10px] text-red-900 font-black ml-1 uppercase">x</span>
                   </div>
                </div>
                
                <div className="mt-2 relative z-10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-game text-red-900 uppercase font-black tracking-widest">GRAVIDADE DA FALHA</span>
                    <span className="text-[8px] font-game text-red-600 font-black uppercase">{entry.count > 5 ? 'CRÍTICO' : entry.count > 2 ? 'ALTO' : 'MONITORADO'}</span>
                  </div>
                  <div className="h-1.5 bg-black border border-red-900/30 overflow-hidden p-[1px]">
                    <div 
                      className={`h-full relative overflow-hidden transition-all duration-1000 ${entry.count > 5 ? 'bg-red-500' : 'bg-red-800'}`} 
                      style={{ width: `${Math.min(100, entry.count * 15)}%` }}
                    >
                      <div className="absolute inset-0 shimmer-gradient shimmer-animated opacity-40"></div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none group-hover:bg-red-600/10 transition-all"></div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Adicionar Vício */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          <div className="hud-board border-2 border-red-600 w-full max-w-sm p-8 bg-black">
            <h3 className="font-game text-red-500 mb-8 uppercase text-center text-xl tracking-tighter">Registrar Fraqueza</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-game text-red-800 mb-2 uppercase tracking-[0.2em]">Identificação do Gatilho</label>
                <input
                  autoFocus
                  type="text"
                  value={newViceTitle}
                  onChange={e => setNewViceTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-red-950 p-4 text-red-100 outline-none focus:border-red-600 font-game text-sm"
                  placeholder="EX: PROCRASTINAÇÃO DIGITAL..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newViceTitle.trim()) {
                      onAddVice(newViceTitle, 12);
                      setNewViceTitle('');
                      setIsAdding(false);
                    }
                  }}
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewViceTitle('');
                  }}
                  className="flex-1 py-3 font-game text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase"
                >
                  ABORTAR
                </button>
                <button
                  onClick={() => {
                    if (newViceTitle.trim()) {
                      onAddVice(newViceTitle, 12);
                      setNewViceTitle('');
                      setIsAdding(false);
                    }
                  }}
                  className="flex-1 py-3 bg-red-600 text-white font-game text-[10px] uppercase font-bold"
                >
                  CONFIRMAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenaltySystem;
