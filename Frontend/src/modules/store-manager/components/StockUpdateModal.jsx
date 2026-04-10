import React, { useState, useEffect } from 'react';
import { X, RefreshCcw, ArrowUp, ArrowDown, Database, Info } from 'lucide-react';

const StockUpdateModal = ({ isOpen, onClose, onUpdate, product }) => {
    const [adjustment, setAdjustment] = useState('');
    const [type, setType] = useState('add'); // 'add' or 'subtract'

    useEffect(() => {
        setAdjustment('');
        setType('add');
    }, [isOpen, product]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!adjustment || isNaN(adjustment)) return;

        onUpdate({
            productId: product.id || product._id,
            adjustment: Number(adjustment),
            type,
            notes: '' // Placeholder for now
        });
    };

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-100">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                            <RefreshCcw size={20} />
                        </div>
                        Modify Volume
                    </h3>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-2xl transition-all text-slate-400 active:scale-90">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="bg-slate-900 p-5 rounded-[1.5rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
                        <div className="flex items-center gap-2 mb-3">
                            <Database size={12} className="text-blue-400" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Asset</p>
                        </div>
                        <p className="text-sm font-black text-white tracking-tight mb-4 group-hover:text-blue-400 transition-colors uppercase italic">{product.name}</p>
                        <div className="flex justify-between items-end border-t border-slate-800 pt-3 mt-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Available units</span>
                            <span className="text-lg font-black text-blue-400 tracking-tighter tabular-nums">{product.stock} Units</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Operation Mode</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className={`flex items-center justify-center gap-2 py-3.5 text-[11px] font-black rounded-2xl transition-all duration-300 uppercase tracking-wider ${type === 'add' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-slate-100'}`}
                                onClick={() => setType('add')}
                            >
                                <ArrowUp size={14} /> Reconciliation
                            </button>
                            <button
                                type="button"
                                className={`flex items-center justify-center gap-2 py-3.5 text-[11px] font-black rounded-2xl transition-all duration-300 uppercase tracking-wider ${type === 'subtract' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-slate-100'}`}
                                onClick={() => setType('subtract')}
                            >
                                <ArrowDown size={14} /> Depletion
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Unit Delta</label>
                        <div className="relative group">
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 transition-all duration-300 outline-none tabular-nums"
                                placeholder="00"
                                value={adjustment}
                                onChange={(e) => setAdjustment(e.target.value)}
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                <Database size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 text-xs font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            className={`flex-[2] py-4 text-xs font-black text-white rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95 ${type === 'add' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-100'}`}
                        >
                            <RefreshCcw size={18} />
                            Execute Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockUpdateModal;
