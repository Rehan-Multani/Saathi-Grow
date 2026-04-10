import React from 'react';
import { Edit3, Trash2, RefreshCw, AlertTriangle, ChevronRight, Package } from 'lucide-react';

const InventoryTable = ({ products, onUpdateStock, branchId }) => {
    const getBranchStock = (product) => {
        if (!branchId) return 0;
        const branchStock = product.branchStocks?.find(bs => bs.branchId?._id === branchId || bs.branchId === branchId);
        return branchStock ? branchStock.stock : 0;
    };

    const getStatusBadge = (stock) => {
        if (stock === 0) {
            return (
                <div className="flex flex-col gap-1">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-100 flex items-center gap-1.5 w-fit">
                        <div className="w-1 h-1 rounded-full bg-red-600 animate-pulse"></div>
                        OUT OF STOCK
                    </span>
                    <span className="text-[9px] text-red-400 font-bold ml-1 uppercase tracking-tighter">Immediate Restock</span>
                </div>
            );
        }
        if (stock < 10) {
            return (
                <div className="flex flex-col gap-1">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1.5 w-fit">
                        <div className="w-1 h-1 rounded-full bg-amber-600"></div>
                        CRITICAL LOW
                    </span>
                    <span className="text-[9px] text-amber-500 font-bold ml-1 uppercase tracking-tighter">{stock} units left</span>
                </div>
            );
        }
        return (
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5 w-fit">
                <div className="w-1 h-1 rounded-full bg-emerald-600"></div>
                HEALTHY STOCK
            </span>
        );
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">Product Analysis</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">Identifier</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">Valuation</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100 text-center">Volume</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {products.length > 0 ? (
                            products.map((product) => {
                                const stock = getBranchStock(product);
                                return (
                                    <tr key={product._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black overflow-hidden border border-slate-200 group-hover:border-blue-200 transition-colors">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={20} className="opacity-40" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{product.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Updated {new Date(product.updatedAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-xs font-mono text-slate-500 font-bold">{product.sku}</div>
                                            <div className="mt-1">
                                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-600 uppercase tracking-tighter border border-blue-100">
                                                    {product.category}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-black text-slate-800">?{product.basePrice.toLocaleString()}</div>
                                            <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Unit Price</div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className={`text-sm font-black ${stock < 10 ? 'text-red-500' : 'text-slate-800'}`}>
                                                {stock}
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Units</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {getStatusBadge(stock)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => onUpdateStock(product)}
                                                    className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Request Stock Modification"
                                                >
                                                    <RefreshCw size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-30">
                                        <Package size={48} />
                                        <p className="text-sm font-bold text-slate-500 italic">
                                            Zero records matched your current parameters.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    Catalog Magnitude: <span className="text-slate-800">{products.length} Entries</span>
                </p>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-300 cursor-not-allowed">
                        <ChevronRight size={20} className="rotate-180" />
                    </button>
                    <div className="flex gap-1.5">
                        <button className="w-8 h-8 flex items-center justify-center text-xs font-black bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">1</button>
                        <button className="w-8 h-8 flex items-center justify-center text-xs font-black text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">2</button>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div >
    );
};

export default InventoryTable;
