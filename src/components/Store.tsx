
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
  shopDiscount?: number;
}

const Store: React.FC<StoreProps> = ({ gold, items, onAddItem, onRemoveItem, onPurchaseItem, isLocked, lockUntil, shopDiscount = 0 }) => {
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
          className={`px-6 py-2 border font-game text-[10px] tracking-widest transition-all flex items-center gap-2 uppercase bg-sky-600/20 border-sky-500/50 text-sky-400 hover:bg-sky-500/30`}
        >
          <Plus size={18} /> Forjar Item
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="hud-board hud-board-glow border-cyan-500/50 w-full max-w-md p-8 space-y-5">
            <h2 className="font-game text-xl text-cyan-400 mb-4 uppercase tracking-tighter">Manifestar Nova Relíquia</h2>
            <div>
              <label className="block text-[9px] font-game text-cyan-600 mb-1 uppercase tracking-widest">Nome do Artefato</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border-orange-900/40 transition-all border border-slate-800 px-4 py-3 text-cyan-100 font-game text-xs focus:border-cyan-500 outline-none transition-all"
                placeholder="Ex: ESSÊNCIA DA VONTADE"
              />
            </div>
            <div>
              <label className="block text-[9px] font-game text-cyan-600 mb-1 uppercase tracking-widest">Inscrição (Descrição)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border-orange-900/40 transition-all border border-slate-800 px-4 py-3 text-slate-300 text-xs focus:border-cyan-500 outline-none h-24 resize-none transition-all"
                placeholder="Descreva o poder deste item..."
              />
            </div>
            <div>
              <label className="block text-[9px] font-game text-cyan-600 mb-1 uppercase tracking-widest">Custo em Pedras de Ouro</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                className="w-full bg-black/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border-orange-900/40 transition-all border border-slate-800 px-4 py-3 text-cyan-400 font-game text-sm outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 font-game text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-widest">ABORTAR</button>
              <button type="submit" className="flex-1 py-3 font-game text-[10px] bg-cyan-600 text-white shadow-[0_0_15px_rgba(0,229,255,0.4)] uppercase tracking-widest active:scale-95 transition-transform">FORJAR</button>
            </div>
          </form>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-3`}>
        {items.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center opacity-30 border border-white/5">
            <Package size={48} className="text-amber-900 mb-4" />
            <p className="font-game text-amber-800 text-[10px] uppercase tracking-[0.2em]">Cofre Vazio</p>
          </div>
        )}
        {items.map(item => {
          const isExpanded = expandedItemId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => !isLocked && toggleExpand(item.id)}
              className={`relative flex flex-col bg-slate-950/60 border transition-all duration-500 cursor-pointer p-4 ${isLocked
                ? 'border-slate-900 opacity-50'
                : isExpanded
                  ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.05)]'
                  : 'border-white/5 hover:border-amber-500/20'
                }`}
            >
              {/* Minimal Accent */}
              <div className={`absolute top-0 left-0 w-full h-[1px] transition-all duration-700 ${isExpanded ? 'bg-amber-500/30' : 'bg-transparent group-hover:bg-amber-500/10'}`}></div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`font-game text-md uppercase tracking-widest transition-colors font-bold ${isExpanded ? 'text-amber-400' : 'text-slate-100'}`}>
                    {item.name}
                  </h3>
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={14} className="text-amber-600/50" />
                  </div>
                </div>

                <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[500px] opacity-100 mb-4' : 'max-h-12 opacity-50 mb-3'}`}>
                  <p className={`text-[10px] text-slate-400 italic leading-snug ${!isExpanded ? 'line-clamp-2' : ''}`}>
                    {item.description || 'Relíquia de poder sincronizada.'}
                  </p>
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-1">
                      <div className="text-[7px] font-game text-slate-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                        <Info size={10} /> Atributos Identificados
                      </div>
                      <div className="text-[9px] text-amber-500/70 font-game uppercase leading-relaxed">
                        RARIDADE: {item.cost > 5000 ? 'LENDÁRIO' : item.cost > 1000 ? 'RARO' : 'COMUM'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5 font-game text-xs font-bold leading-none">
                    <Coins size={12} className={`text-amber-500 ${isExpanded ? 'animate-pulse' : ''}`} />
                    {shopDiscount > 0 ? (
                      <>
                        <span className="text-amber-500">{Math.floor(item.cost * (1 - shopDiscount))}</span>
                        <span className="text-slate-600 line-through text-[10px] ml-1">{item.cost}</span>
                        <span className="text-emerald-500 text-[9px] ml-1">-{Math.round(shopDiscount * 100)}%</span>
                      </>
                    ) : (
                      <span className="text-amber-500">{item.cost}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-slate-700 hover:text-red-500 transition-colors"
                      title="Deletar"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => gold >= item.cost && onPurchaseItem(item)}
                      disabled={gold < item.cost}
                      className={`px-4 py-1.5 font-game text-[9px] uppercase tracking-widest transition-all font-bold ${gold >= item.cost
                        ? 'bg-amber-600/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-white'
                        : 'bg-red-900/5 text-red-900 border border-red-900/20 cursor-not-allowed'
                        }`}
                    >
                      Adquirir
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
