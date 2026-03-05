import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { X, MapPin, Store, Info, ShoppingCart, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const StoreSelector = ({ isOpen, onClose }) => {
  const { nearbyStores, activeStore, selectStore, loading } = useStore();
  const { cartCount, clearCart } = useCart();

  const handleStoreSelect = (store) => {
    if (activeStore && activeStore.id !== store.id && cartCount > 0) {
      if (window.confirm("Switching stores will clear your current cart. Do you want to continue?")) {
        clearCart();
        selectStore(store);
        onClose();
        toast.success(`Switched to ${store.name}`);
      }
    } else {
      selectStore(store);
      onClose();
      toast.success(`Selected ${store.name}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2200] flex justify-center items-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white dark:bg-[#111] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in duration-200 border border-gray-100 dark:border-white/5">
        <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Select Store</h2>
            <p className="text-xs text-gray-400 font-medium">Choose a store to see available products</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <div className="w-10 h-10 border-4 border-[#0c831f] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Finding stores near you...</p>
            </div>
          ) : nearbyStores.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <MapPin size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">No stores found</h3>
              <p className="text-sm text-gray-400 max-w-[250px] mt-1 text-center">We couldn't find any SathiGro branches or vendors near your current location.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {nearbyStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleStoreSelect(store)}
                  className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 group ${activeStore?.id === store.id
                    ? 'border-[#0c831f] bg-[#f0fdf4] dark:bg-[#0c831f]/10'
                    : 'border-gray-100 dark:border-white/5 hover:border-[#0c831f]/30 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${store.type === 'branch' ? 'bg-[#0c831f] text-white' : 'bg-orange-500 text-white'
                    }`}>
                    {store.type === 'branch' ? <Store size={24} /> : <ShoppingCart size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-base font-black text-gray-900 dark:text-gray-100 truncate">{store.name}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${store.type === 'branch' ? 'bg-[#0c831f]/10 text-[#0c831f]' : 'bg-orange-500/10 text-orange-500'
                        }`}>
                        {store.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-gray-300" />
                        <span>{store.roadDistance || '?...'} km</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#0c831f] font-bold">
                        <Clock size={12} />
                        <span>{store.estimatedTime || '??'} mins</span>
                      </div>
                    </div>
                  </div>
                  {activeStore?.id === store.id && (
                    <div className="w-6 h-6 bg-[#0c831f] rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
              Changing stores will refresh the catalog to show products available only at the selected location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSelector;
