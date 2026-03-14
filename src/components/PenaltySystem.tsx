
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
  Lock
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
      <div className={`relative p-6 border-2 rounded-xl overflow-hidden ${profile.corruption >= 100 ? 'border-red-600 bg-red-950/40' : 'border-sky-900/50 bg-sky-950/10'}`}>
        <div className={`absolute top-0 left-0 w-full h-1 bg-cyan-600 shadow-[0_0_10px_#00e5ff]`} style={{ width: `${profile.corruption}%` }}></div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-game text-2xl flex items-center gap-3 uppercase italic ${profile.corruption >= 100 ? 'text-red-500' : 'text-cyan-400'}`}>
            <Skull /> PROTOCOLO DE PURIFICAÇÃO
          </h2>
          <span className="font-game text-[10px] text-cyan-600 tracking-[0.3em] font-bold">
            {profile.corruption >= 100 ? "⚠️ ESTADO CRÍTICO" : "MONITORAMENTO DE ALMA"}
          </span>
        </div>

        {/* Corruption Meter */}
        <div className="space-y-2">
          <div className="flex justify-between font-game text-[10px] text-sky-400 uppercase">
            <span>Nível de Instabilidade</span>
            <span className={profile.corruption >= 100 ? "text-red-600 font-bold" : ""}>{profile.corruption}%</span>
          </div>
          <div className="h-8 bg-black border border-sky-900 rounded-sm overflow-hidden p-1">
            <div
              className={`h-full ${profile.corruption >= 100 ? 'bg-red-600' : profile.corruption > 50 ? 'bg-sky-800' : 'bg-sky-950'}`}
              style={{ width: `${profile.corruption}%` }}
            ></div>
          </div>
        </div>
      </div>

      {profile.isPenaltyZoneActive ? (
        /* Zona de Penalidade Ativa */
        <div className="system-panel border-2 border-red-600 p-8 rounded-xl text-center space-y-6 bg-black/80">
          <div className="relative inline-block">
            <Ghost size={80} className="text-red-600 mx-auto" />
            <AlertTriangle className="absolute -bottom-2 -right-2 text-red-500" />
          </div>
          <h3 className="font-game text-4xl text-red-500 uppercase tracking-tighter">ZONA DE PENALIDADE</h3>
          <p className="text-red-400 italic max-w-md mx-auto font-medium font-game">"Sua vontade fraquejou. O Vazio irá filtrar suas impurezas por 12 horas."</p>

          <div className="text-6xl font-game text-red-600 py-4 tabular-nums">
            {timeLeft}
          </div>

          <div className="p-4 bg-red-950/40 border border-red-800 rounded-lg max-w-lg mx-auto">
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

          <div className="p-4 bg-red-900/20 border border-red-900 rounded-lg text-[10px] font-game text-red-500 uppercase leading-relaxed text-center">
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
                className="p-2 bg-red-950/20 hover:bg-red-500/10 border border-red-900/50 rounded-full text-red-600 hover:text-red-400 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            {vices.length === 0 ? (
              <div className="system-panel p-8 border border-dashed border-red-900/30 rounded-lg text-center bg-black/40">
                <p className="text-[10px] text-slate-600 italic uppercase font-game tracking-widest">A alma permanece imaculada.</p>
              </div>
            ) : (
              vices.map(vice => (
                <div key={vice.id} className="system-panel border border-red-900/40 p-5 rounded-lg flex justify-between items-center group hover:border-red-500/50 bg-black/40">
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
                      className="px-4 py-2 bg-red-900/20 border border-red-900 text-red-500 font-game text-[9px] hover:bg-red-600 hover:text-white rounded uppercase tracking-widest"
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
          <div className="system-panel border border-red-900/30 p-6 rounded-xl space-y-4 flex flex-col justify-between bg-black/60">
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
              className={`w-full py-5 font-game text-sm uppercase rounded-lg border-2 flex flex-col items-center justify-center gap-1 ${profile.corruption >= 100
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

      {/* Modal Adicionar Vício */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          <div className="system-panel border-2 border-red-600 w-full max-w-sm p-8 rounded-xl bg-black">
            <h3 className="font-game text-red-500 mb-8 uppercase text-center text-xl tracking-tighter">Registrar Fraqueza</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-game text-red-800 mb-2 uppercase tracking-[0.2em]">Identificação do Gatilho</label>
                <input
                  autoFocus
                  type="text"
                  value={newViceTitle}
                  onChange={e => setNewViceTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-red-950 rounded p-4 text-red-100 outline-none focus:border-red-600 font-game text-sm"
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
