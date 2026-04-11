import React, { useState, useEffect, useCallback } from 'react';
import { Search, Package, Check, Plus, X, Loader2, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import { toast } from 'react-toastify';

/**
 * ProductPickerModal - A pure Tailwind CSS multi-select product picker.
 * Excludes vendor products for admin banner/campaign management.
 */
const ProductPickerModal = ({ show, onHide, onSelect, existingProductIds = [], token }) => {
    const { t } = useTranslation('admin_offers');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stagedProducts, setStagedProducts] = useState([]);
    
    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await getCategories(token);
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, [token]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProducts(token, {
                search: searchTerm,
                category: selectedCategory,
                page,
                limit: 20,
                allBranches: 'true' // Allow seeing products from all branches
            });
            setProducts(data.products || []);
            setTotalPages(data.pages || 1);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [token, searchTerm, selectedCategory, page]);

    useEffect(() => {
        if (show) {
            fetchCategories();
            fetchProducts();
            setStagedProducts([]);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [show, fetchCategories, fetchProducts]);

    const toggleProduct = (product) => {
        if (stagedProducts.find(p => p._id === product._id)) {
            setStagedProducts(stagedProducts.filter(p => p._id !== product._id));
        } else {
            setStagedProducts([...stagedProducts, product]);
        }
    };

    const handleConfirm = () => {
        onSelect(stagedProducts);
        onHide();
    };

    const isChecked = (id) => !!stagedProducts.find(p => p._id === id);
    const isAlreadyAdded = (id) => existingProductIds.includes(id);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[1070] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onHide}></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col animate-in zoom-in duration-200 font-sans border border-slate-200 max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 border border-blue-100/20">
                            <Package size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{t('picker.title')}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('picker.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-2.5 rounded-xl bg-white text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100 active:scale-95">
                        <X size={20} />
                    </button>
                </div>

                {/* Filters */}
                <div className="px-8 py-4 bg-white border-b border-slate-50 flex flex-col md:flex-row gap-4 shrink-0">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={t('picker.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-inner"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                        className="md:w-64 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat shadow-inner uppercase"
                    >
                        <option value="">{t('picker.all_categories')}</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                    <div className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center border border-blue-100">
                        {t('picker.selected_count', { count: stagedProducts.length })}
                    </div>
                </div>

                {/* Body Table */}
                <div className="flex-grow overflow-y-auto scrollbar-thin bg-white p-8 pt-4">
                    <div className="min-w-full inline-block align-middle">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left w-12">{t('picker.table_tick')}</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">{t('picker.table_details')}</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{t('picker.table_category')}</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{t('picker.table_stock')}</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('picker.table_price')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center">
                                            <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('picker.loading')}</p>
                                        </td>
                                    </tr>
                                ) : products.length > 0 ? (
                                    products.map(p => {
                                        const alreadyAdded = isAlreadyAdded(p._id);
                                        const checked = isChecked(p._id);
                                        
                                        return (
                                            <tr 
                                                key={p._id} 
                                                className={`transition-all duration-200 group ${alreadyAdded ? 'bg-slate-50/10 cursor-not-allowed opacity-50' : 'hover:bg-blue-50/30 cursor-pointer'} ${checked ? 'bg-blue-50/50' : ''}`}
                                                onClick={() => !alreadyAdded && toggleProduct(p)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${checked || alreadyAdded ? 'bg-blue-600 border-blue-600 shadow-md' : 'border-slate-200 group-hover:border-blue-400'}`}>
                                                        {(checked || alreadyAdded) && <Check size={14} className="text-white" />}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
                                                            <img src={p.image} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-tight truncate max-w-[200px]">{p.name}</div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{p.sku}</span>
                                                                {alreadyAdded && <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase font-black tracking-widest">Added</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[9px] bg-indigo-50 text-indigo-700 font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-indigo-100/50">
                                                        {p.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {(() => {
                                                        const totalStock = (p.branchStocks && p.branchStocks.length > 0)
                                                            ? p.branchStocks.reduce((sum, bs) => sum + (bs.stock || 0), 0)
                                                            : (p.stock || 0);
                                                        
                                                        return (
                                                            <div className="space-y-1.5 flex flex-col items-center">
                                                                <div className={`text-[10px] font-black uppercase ${totalStock <= (p.lowStockThreshold || 10) ? 'text-rose-600 px-2 py-0.5 bg-rose-50 rounded-md border border-rose-100' : 'text-emerald-600'}`}>
                                                                    {totalStock} {p.unitType || 'units'}
                                                                </div>
                                                                <div className="flex flex-wrap justify-center gap-1 max-w-[120px]">
                                                                    {p.branchStocks?.map((bs, i) => bs.branchId && (
                                                                        <span key={i} className="text-[8px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded border border-slate-200 uppercase truncate max-w-[60px]">
                                                                            {bs.branchId.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-[13px] font-black text-slate-900 tabular-nums tracking-tight">₹{p.basePrice}</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center">
                                            <LayoutGrid size={48} className="text-slate-200 mx-auto mb-4" />
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('picker.no_results')}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer and Pagination */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-95 shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest px-4">
                            {t('picker.pagination', { current: page, total: totalPages })}
                        </span>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-95 shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="hidden lg:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{t('picker.selection_help', { count: stagedProducts.length })}</p>
                            <p className="text-[9px] text-slate-300 font-medium uppercase mt-0.5 italic">{t('picker.confirm_help')}</p>
                        </div>
                        <div className="h-10 w-px bg-slate-200 hidden lg:block" />
                        <div className="flex gap-3 w-full md:w-auto">
                            <button onClick={onHide} className="flex-1 md:flex-none px-8 py-3 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95">
                                {t('form.cancel')}
                            </button>
                            <button 
                                onClick={handleConfirm}
                                disabled={stagedProducts.length === 0}
                                className="flex-1 md:flex-none px-12 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Plus size={16} /> {t('picker.confirm_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { height: 4px; width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default ProductPickerModal;
