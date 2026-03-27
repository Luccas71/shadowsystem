
import React from 'react';
import { StoreItem } from '../types';
import { Package, Zap, Sparkles } from 'lucide-react';

interface InventoryProps {
  items: StoreItem[];
  onUseItem: (item: StoreItem) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, onUseItem }) => {
  const ownedItems = items.filter(i => i.purchasedCount > 0);

  const consolidatedItems = ownedItems.reduce((acc, item) => {
    const existing = acc.find(i => i.id === item.id);
    if (existing) {
      existing.purchasedCount += item.purchasedCount;
      if (item.origin && !existing.origins?.includes(item.origin)) {
        existing.origins = [...(existing.origins || []), item.origin];
      }
    } else {
      acc.push({ ...item, origins: item.origin ? [item.origin] : [] });
    }
    return acc;
  }, [] as (StoreItem & { origins?: string[] })[]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="font-game text-2xl text-purple-400 flex items-center gap-3 uppercase tracking-tighter font-bold">
          <Package className="text-purple-400" /> INVENTÁRIO DO SISTEMA
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {consolidatedItems.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center opacity-30 border border-dashed border-purple-900/30">
            <Package size={64} className="text-purple-900 mb-4" />
            <p className="font-game text-purple-800 text-sm uppercase tracking-widest">Seu inventário está vazio.</p>
            <p className="text-[10px] text-slate-600 mt-2">ADQUIRA RELÍQUIAS NA LOJA PARA FORTALECER SEU DESPERTAR.</p>
          </div>
        ) : (
          consolidatedItems.map((item, index) => (
            <div key={`${item.id}-${item.origin || 'legacy'}-${index}`} className="hud-board border-purple-500/20 transition-all duration-300 group hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] flex flex-col min-h-[160px] bg-slate-950/40 p-5 overflow-hidden relative">
              {/* Background Grid Accent */}
              <div className="absolute inset-0 opacity-5 pointer-events-none [background-image:linear-gradient(rgba(168,85,247,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.1)_1px,transparent_1px)] [background-size:10px_10px]"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3 border-b border-purple-900/10 pb-2">
                    <div className="min-w-0">
                      <div className="text-[8px] font-game text-purple-700 tracking-[0.2em] mb-1 opacity-60">ARMAZÉM_SLOT.{String(index + 1).padStart(2, '0')}</div>
                      <h3 className="font-game text-lg text-white group-hover:text-purple-400 transition-all duration-300 uppercase tracking-widest truncate font-black leading-tight">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.origins?.map((origin, idx) => (
                          <div key={idx} className={`inline-block px-2 py-0.5 text-[8px] font-game border uppercase tracking-widest ${
                            origin === 'compra' ? 'border-orange-500/50 text-orange-500 bg-orange-950/20' :
                            origin === 'diário' ? 'border-cyan-500/50 text-cyan-500 bg-cyan-950/20' :
                            origin === 'rank' ? 'border-purple-500/50 text-purple-500 bg-purple-950/20' :
                            origin === 'nível' ? 'border-green-500/50 text-green-500 bg-green-950/20' :
                            'border-slate-500/40 text-slate-400 bg-slate-950/20'
                          }`}>
                            {origin === 'compra' ? 'ADQUIRIDO NA LOJA' : 
                             origin === 'diário' ? 'RECOMPENSA DIÁRIA' :
                             origin === 'rank' ? 'DROP DE RANK' :
                             origin === 'nível' ? 'PROGRESSÃO DE NÍVEL' :
                             'RELÍQUIA LEGADA'}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <div className="text-[7px] font-game text-slate-600 uppercase tracking-tighter">QUANTIDADE</div>
                      <div className="text-sm font-game text-purple-400 font-bold bg-purple-950/20 px-2 border border-purple-500/10">
                        {String(item.purchasedCount).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 italic leading-snug line-clamp-2">
                    {item.description || "Relíquia processada e armazenada no cofre do sistema."}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-[8px] font-game text-purple-900 uppercase font-bold tracking-widest opacity-80">
                    <div className="w-1.5 h-1.5 bg-purple-500/50"></div> SINCR_CORE
                  </div>
                  <button
                    onClick={() => onUseItem(item)}
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600/10 border border-purple-500/30 text-purple-400 font-game text-[10px] hover:bg-purple-500 hover:text-white transition-all duration-300 uppercase tracking-[0.1em] font-bold shadow-lg active:scale-95 group/btn"
                  >
                    <Zap size={12} className="group-hover/btn:animate-pulse" /> USAR
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {ownedItems.length > 0 && (
        <div className="p-4 bg-purple-950/10 border border-purple-900/30">
          <p className="text-[10px] font-game text-purple-600 uppercase tracking-[0.2em] text-center">
            "A FORÇA DE UM CAÇADOR NÃO ESTÁ APENAS EM SEUS ATRIBUTOS, MAS NO USO ESTRATÉGICO DE SEUS RECURSOS."
          </p>
        </div>
      )}
    </div>
  );
};

export default Inventory;
