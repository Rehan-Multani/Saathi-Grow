import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, RefreshCcw, ArrowUp, ArrowDown, Database, Info, Loader2 } from 'lucide-react';

const StockUpdateModal = ({ isOpen, onClose, onUpdate, product, loading }) => {
    const [adjustment, setAdjustment] = useState('');
    const [type, setType] = useState('add'); // 'add' or 'subtract'

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
            setAdjustment('');
            setType('add');
        } else {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, product]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!adjustment || isNaN(adjustment)) return;

        onUpdate({
            productId: product.id || product._id,
            adjustment: Number(adjustment),
            type,
            notes: '' 
        });
    };

    if (!isOpen || !product) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <RefreshCcw size={18} className="text-blue-600" />
                        Update Stock
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <Database size={12} className="text-blue-400" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Product</p>
                        </div>
                        <p className="text-base font-bold text-white mb-4 uppercase">{product.name}</p>
                        <div className="flex justify-between items-end border-t border-slate-800 pt-3">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Current Stock</span>
                            <span className="text-lg font-black text-blue-400 tabular-nums">{product.stock || 0} Units</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Action</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className={`flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all border ${type === 'add' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm shadow-emerald-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                onClick={() => setType('add')}
                            >
                                <ArrowUp size={16} /> Add Stock
                            </button>
                            <button
                                type="button"
                                className={`flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all border ${type === 'subtract' ? 'bg-red-50 border-red-200 text-red-700 shadow-sm shadow-red-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                onClick={() => setType('subtract')}
                            >
                                <ArrowDown size={16} /> Remove Stock
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Quantity</label>
                        <div className="relative group">
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-blue-400 transition-all outline-none tabular-nums"
                                placeholder="0"
                                value={adjustment}
                                onChange={(e) => setAdjustment(e.target.value)}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors font-bold text-xs uppercase">
                                Units
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !adjustment}
                            className={`flex-[2] py-3 text-sm font-bold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${type === 'add' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default StockUpdateModal;
