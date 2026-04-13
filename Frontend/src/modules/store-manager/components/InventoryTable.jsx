import React from 'react';
import { RefreshCw, Package, Loader2, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const InventoryTable = ({ products, onUpdateStock, branchId, loading }) => {
    const getBranchStock = (product) => {
        if (!branchId) return 0;
        const branchStock = product.branchStocks?.find(bs => bs.branchId?._id === branchId || bs.branchId === branchId);
        return branchStock ? branchStock.stock : 0;
    };

    const getStatusBadge = (stock) => {
        if (stock === 0) {
            return (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 flex items-center gap-1.5 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                    Out of stock
                </span>
            );
        }
        if (stock < 10) {
            return (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1.5 w-fit">
                    <AlertCircle size={10} />
                    Low stock
                </span>
            );
        }
        return (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 flex items-center gap-1.5 w-fit">
                <CheckCircle2 size={10} />
                Available
            </span>
        );
    };

    return (
        <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-white border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Product</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">SKU</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Price</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Stock</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading && products.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-20 text-center">
                                <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
                                <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading products...</p>
                            </td>
                        </tr>
                    ) : products.length > 0 ? (
                        products.map((product) => {
                            const stock = getBranchStock(product);
                            return (
                                <tr key={product._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={18} className="text-slate-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors uppercase">{product.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider">{product.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs font-bold text-slate-500 font-mono tracking-tighter">{product.sku}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-900">₹{product.basePrice.toLocaleString()}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">Per Unit</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-sm font-black ${stock < 10 ? 'text-red-600' : 'text-slate-800'}`}>
                                            {stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(stock)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onUpdateStock(product)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 bg-white rounded-lg transition-all"
                                            title="Update Stock"
                                        >
                                            <RefreshCw size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="6" className="px-6 py-20 text-center">
                                <Package size={40} className="text-slate-200 mx-auto mb-3" />
                                <p className="text-sm font-medium text-slate-500 italic">No products found for the selected filters.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryTable;
