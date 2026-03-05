
import React, { useState, useEffect } from 'react';
import { StoreItem } from '../types';
import { ShoppingBag, Plus, Coins, Trash2, Package, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface StoreProps {
  gold: number;
  items: StoreItem[];
  onAddItem: (item: Omit<StoreItem, 'id' | 'purchasedCount'>) => void;
  onRemoveItem: (id: string) => void;
  onPurchaseItem: (item: StoreItem) => void;
  isLocked?: boolean;
  lockUntil?: number;
}

const Store: React.FC<StoreProps> = ({ gold, items, onAddItem, onRemoveItem, onPurchaseItem, isLocked, lockUntil }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(100);
  const [, setTimeLeft] = useState<string>('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLocked || !lockUntil) return;

    const interval = setInterval(() => {
      const diff = lockUntil - Date.now();
      if (diff <= 0) {
        setTimeLeft('');
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lockUntil]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && cost > 0) {
      onAddItem({ name, description, cost });
      setName('');
      setDescription('');
      setCost(100);
      setIsAdding(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center">
        <h2 className="font-game text-2xl text-amber-400 flex items-center gap-3 uppercase tracking-tighter font-bold">
          <Package className="text-amber-400" /> LOJA DO SISTEMA
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className={`px-6 py-2 border rounded-lg font-game text-[10px] tracking-widest transition-all flex items-center gap-2 uppercase bg-sky-600/20 border-sky-500/50 text-sky-400 hover:bg-sky-500/30`}
        >
          <Plus size={18} /> Forjar Item
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border-amber-900/40 transition-all/90 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="system-bg border-2 border-green-500/50 rounded-xl w-full max-w-md p-8 space-y-5 shadow-[0_0_50px_rgba(34, 197, 94, 0.2)
]">
            <h2 className="font-game text-xl text-green-400 mb-4 uppercase tracking-tighter">Manifestar Nova Relíquia</h2>
            <div>
              <label className="block text-[9px] font-game text-green-600 mb-1 uppercase tracking-widest">Nome do Artefato</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border-amber-900/40 transition-all border border-slate-800 rounded px-4 py-3 text-sky-100 font-game text-xs focus:border-green-500 outline-none transition-all"
                placeholder="Ex: ESSÊNCIA DA VONTADE"
              />
            </div>
            <div>
              <label className="block text-[9px] font-game text-green-600 mb-1 uppercase tracking-widest">Inscrição (Descrição)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border-amber-900/40 transition-all border border-slate-800 rounded px-4 py-3 text-slate-300 text-xs focus:border-green-500 outline-none h-24 resize-none transition-all"
                placeholder="Descreva o poder deste item..."
              />
            </div>
            <div>
              <label className="block text-[9px] font-game text-green-600 mb-1 uppercase tracking-widest">Custo em Pedras de Ouro</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                className="w-full bg-black/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border-amber-900/40 transition-all border border-slate-800 rounded px-4 py-3 text-green-400 font-game text-sm outline-none focus:border-green-500"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 font-game text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-widest">ABORTAR</button>
              <button type="submit" className="flex-1 py-3 font-game text-[10px] bg-green-600 text-white rounded shadow-[0_0_15px_rgba(34, 197, 94, 0.4)
] uppercase tracking-widest active:scale-95 transition-transform">FORJAR</button>
            </div>
          </form>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
        {items.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center opacity-30 border border-sky-900/30 bg-sky-950/10 transition-all duration-300 shadow-none bg-amber-950/10 shadow-none rounded-xl">
            <Package size={64} className="text-amber-900 mb-4" />
            <p className="font-game text-amber-800 text-xs uppercase tracking-[0.2em]">Cofre do Sistema Vazio</p>
          </div>
        )}
        {items.map(item => {
          const isExpanded = expandedItemId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => !isLocked && toggleExpand(item.id)}
              className={`system-bg border rounded-lg p-5 flex flex-col justify-between group cursor-pointer transition-all duration-500 relative overflow-hidden ${isLocked
                ? 'border-slate-800'
                : isExpanded
                  ? 'border-amber-400 shadow-[0_0_25px_rgba(217,119,6,0.1)] scale-[1.02] z-10'
                  : 'border-amber-900/40 hover:border-amber-500/60 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'
                }`}
            >
              {/* Overlay de expansão visual */}
              <div className={`absolute top-0 right-0 p-2 transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`}>
                {isExpanded ? <ChevronUp size={16} className="text-amber-400" /> : <ChevronDown size={16} className="text-amber-600" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`font-game text-lg tracking-tight transition-colors ${isExpanded ? 'text-amber-400' : 'text-amber-100 group-hover:text-amber-400'}`}>
                    {item.name}
                  </h3>
                  <span className={`text-[9px] px-1.5 py-0.5 border rounded uppercase font-bold transition-all ${isExpanded ? 'border-amber-400 text-amber-400 bg-amber-400/10' : 'border-amber-900 text-amber-700'
                    }`}>
                    x{item.purchasedCount}
                  </span>
                </div>

                <div className={`relative transition-all duration-500 ${isExpanded ? 'max-h-[500px] mb-4' : 'max-h-12 mb-3'}`}>
                  <p className={`text-xs text-slate-400 italic leading-relaxed transition-all ${!isExpanded ? 'line-clamp-2' : ''}`}>
                    {item.description || 'Uma relíquia de poder incalculável, aguardando um mestre digno.'}
                  </p>
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-amber-900/30 transition-all duration-500 bg-amber-950/10 shadow-none animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 text-[8px] font-game text-amber-700 uppercase tracking-widest mb-1">
                        <Info size={10} /> Registro de Dados do Sistema
                      </div>
                      <div className="text-[10px] text-slate-500 font-game uppercase leading-tight">
                        STATUS: IDENTIFICADO <br />
                        RARIDADE: {item.cost > 5000 ? 'LENDÁRIO' : item.cost > 1000 ? 'RARO' : 'COMUM'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-amber-500 font-game text-sm shadow-sm">
                    <Coins size={14} className={isExpanded ? 'animate-pulse' : ''} /> {item.cost} Ouro
                  </div>

                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 text-slate-700 hover:text-red-500 transition-colors"
                      title="Deletar Relíquia"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => gold >= item.cost && onPurchaseItem(item)}
                      disabled={gold < item.cost}
                      className={`px-5 py-2 rounded font-game text-[10px] uppercase tracking-widest transition-all active:scale-95 ${gold >= item.cost
                        ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                        : 'bg-red-900/40 text-red-400 border border-red-500/30 cursor-not-allowed opacity-50'
                        }`}
                    >
                      {gold >= item.cost ? 'ADQUIRIR' : 'SEM OURO'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Store;
