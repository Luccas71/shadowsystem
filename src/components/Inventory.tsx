
import React from 'react';
import { StoreItem } from '../types';
import { Package, Zap, Sparkles } from 'lucide-react';

interface InventoryProps {
  items: StoreItem[];
  onUseItem: (item: StoreItem) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, onUseItem }) => {
  const ownedItems = items.filter(i => i.purchasedCount > 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="font-game text-2xl text-sky-400 flex items-center gap-3 uppercase tracking-tighter font-bold">
          <Package className="text-sky-400" /> INVENTÁRIO DO SISTEMA
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ownedItems.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center opacity-30 border border-dashed border-sky-900/30 rounded-xl">
            <Package size={64} className="text-sky-900 mb-4" />
            <p className="font-game text-sky-800 text-sm uppercase tracking-widest">Seu inventário está vazio.</p>
            <p className="text-[10px] text-slate-600 mt-2">ADQUIRA RELÍQUIAS NA LOJA PARA FORTALECER SEU DESPERTAR.</p>
          </div>
        ) : (
          ownedItems.map(item => (
            <div key={item.id} className="system-bg border border-sky-900/40 shadow-none bg-black/40 transition-all duration-300 rounded-lg p-5 flex justify-between items-start group hover:border-sky-500/50 transition-all duration-300 shadow-[0_0_15px_rgba(14,165,233,0.05)]">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-game text-sky-100 text-lg group-hover:text-sky-400 transition-colors uppercase tracking-tight">{item.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 bg-sky-950 text-sky-400 border border-sky-800 rounded font-bold">
                    QTD: {item.purchasedCount}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4 italic leading-relaxed">
                  {item.description || 'Uma relíquia de poder contido, aguardando o comando do Caçador.'}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-game text-sky-500 uppercase tracking-widest">
                  <Sparkles size={12} /> Item de Inventário
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 ml-4">
                <button
                  onClick={() => onUseItem(item)}
                  className="px-6 py-2.5 rounded font-game text-xs bg-sky-600 text-white hover:bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all flex items-center gap-2 group/btn"
                >
                  <Zap size={14} className="group-hover/btn:animate-pulse" /> USAR
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {ownedItems.length > 0 && (
        <div className="p-4 bg-sky-950/10 border border-sky-900/30 rounded-lg">
          <p className="text-[10px] font-game text-sky-600 uppercase tracking-[0.2em] text-center">
            "A FORÇA DE UM CAÇADOR NÃO ESTÁ APENAS EM SEUS ATRIBUTOS, MAS NO USO ESTRATÉGICO DE SEUS RECURSOS."
          </p>
        </div>
      )}
    </div>
  );
};

export default Inventory;
