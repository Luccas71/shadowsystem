
import React from 'react';
import { StoreItem, ItemRarity } from '../types';
import { ITEM_RARITY_CONFIG } from '../constants';
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {consolidatedItems.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center opacity-30 border border-purple-900/10">
            <Package size={48} className="text-purple-900 mb-4" />
            <p className="font-game text-purple-800 text-[10px] uppercase tracking-[0.2em]">Inventário Vazio</p>
          </div>
        ) : (
          consolidatedItems.map((item, index) => (
            <div key={`${item.id}-${item.origin || 'legacy'}-${index}`} className="group relative flex flex-col bg-slate-950/60 border border-white/5 transition-all duration-500 hover:border-purple-500/30 p-4">
              {/* Minimal Accent */}
              <div className="absolute top-0 left-0 w-[1px] h-0 group-hover:h-full bg-purple-500/50 transition-all duration-700"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="text-[7px] font-game text-purple-600/60 tracking-[0.2em] mb-1 uppercase">Slot_{String(index + 1).padStart(2, '0')}</div>
                    <h3 className="font-game text-md text-white group-hover:text-purple-400 transition-all uppercase tracking-widest truncate font-bold">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.rarity && ITEM_RARITY_CONFIG[item.rarity] && (
                        <div className={`px-1.5 py-0.5 text-[7px] font-game border uppercase tracking-widest ${ITEM_RARITY_CONFIG[item.rarity].color.replace('border-', 'border-opacity-30 border-')}`}>
                          {ITEM_RARITY_CONFIG[item.rarity].label}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[7px] font-game text-slate-600 uppercase">QTD</div>
                    <div className="text-xs font-game text-purple-400 font-bold">
                      x{item.purchasedCount}
                    </div>
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-500 italic leading-snug line-clamp-2 mb-4">
                  {item.description || "Artefato sincronizado."}
                </p>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-[7px] font-game text-slate-700 uppercase tracking-widest">
                    <Sparkles size={8} /> Sincronizado
                  </div>
                  <button
                    onClick={() => onUseItem(item)}
                    className="px-4 py-1.5 bg-purple-600/5 border border-purple-500/20 text-purple-400 font-game text-[9px] hover:bg-purple-600 hover:text-white transition-all uppercase tracking-widest font-bold"
                  >
                    Ativar
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
