import React, { useState, useEffect, useCallback } from 'react';
import { Search, Package, ChevronLeft, ChevronRight, Filter, RefreshCcw, Loader2, Store, Box } from 'lucide-react';
import { getBranchWiseStock } from '../../api/productApi';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const BranchStock = () => {
    const { t } = useTranslation('admin_stock');
    const { adminUser } = useAdminAuth();
    const [stockData, setStockData] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
    const limit = 10;

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchBranches = useCallback(async () => {
        try {
            const data = await getBranches(adminUser.token);
            setBranches(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    }, [adminUser.token]);

    const fetchStock = useCallback(async () => {
        if (!adminUser?.token) return;
        
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: debouncedSearch,
                status: statusFilter,
                branchId: branchFilter
            };
            const response = await getBranchWiseStock(adminUser.token, params);
            if (response.success) {
                setStockData(response.data || []);
                setPagination(response.pagination);
            }
        } catch (error) {
            toast.error(t('branch.error_load', { defaultValue: 'Failed to load branch stock' }));
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, debouncedSearch, statusFilter, branchFilter, t]);

    useEffect(() => {
        fetchStock();
    }, [fetchStock]);

    useEffect(() => {
        if (adminUser?.token && adminUser.role === 'Admin') {
            fetchBranches();
        }
    }, [adminUser, fetchBranches]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'In Stock': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Low Stock': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-rose-50 text-rose-600 border-rose-100';
        }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight">{t('branch.title')}</h1>
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100">{pagination.total} Records</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-medium">{t('branch.subtitle')}</p>
                </div>

                <button
                    onClick={() => fetchStock()}
                    disabled={loading}
                    className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 ${loading ? 'opacity-50' : 'hover:border-blue-500'}`}
                >
                    <RefreshCcw size={18} className={`${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-5 relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('branch.search_placeholder')}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 focus:bg-white transition-all text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="lg:col-span-3 relative group">
                        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <select 
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 focus:bg-white transition-all text-xs font-bold text-slate-700 appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">{t('branch.status_filter.all')}</option>
                            <option value="In Stock">{t('branch.status_filter.in_stock')}</option>
                            <option value="Low Stock">{t('branch.status_filter.low_stock')}</option>
                            <option value="Out of Stock">{t('branch.status_filter.out_of_stock')}</option>
                        </select>
                    </div>

                    {adminUser.role === 'Admin' && (
                        <div className="lg:col-span-4 relative group">
                            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <select 
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 focus:bg-white transition-all text-xs font-bold text-slate-700 appearance-none cursor-pointer"
                                value={branchFilter}
                                onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
                            >
                                <option value="">{t('branch.global_overview')}</option>
                                {branches.map(b => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t('branch.table.product')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t('branch.table.branch')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight text-center">{t('branch.table.quantity')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight text-right">{t('branch.table.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-blue-500 animate-spin" />
                                            <span className="text-xs font-medium text-slate-400">{t('branch.loading_msg')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : stockData.length > 0 ? stockData.map((item, idx) => (
                                <tr key={`${item.productId}-${idx}`} className="hover:bg-slate-50/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-300 overflow-hidden">
                                                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <Box size={18} />}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs font-bold text-slate-900 leading-tight uppercase tracking-tight">{item.productName}</div>
                                                <div className="text-[10px] text-slate-400 font-semibold">{item.sku}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-slate-700 truncate">{item.branchName}</div>
                                                <div className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">{item.branchCode}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`text-xs font-bold ${item.stock <= item.lowStockThreshold ? 'text-rose-600' : 'text-slate-900'}`}>
                                                {item.stock} <span className="text-[8px] opacity-40">{t('branch.table.units')}</span>
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border mt-1 ${getStatusStyle(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => window.location.href = `/admin/stock/adjustments/add?productId=${item.productId}&branchId=${item.branchId}`}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                            title={t('overview.urgent_restock.quick_adjust')}
                                        >
                                            <RefreshCcw size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-300">
                                            <Package size={32} />
                                            <p className="text-xs font-semibold">{t('branch.no_data')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination.total > 0 && (
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs font-medium text-slate-500 italic">
                            {t('branch.pagination_showing', { start: ((page - 1) * limit) + 1, end: Math.min(page * limit, pagination.total), total: pagination.total })}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-2 rounded-lg border transition-all ${page === 1 ? 'text-slate-200 border-slate-100' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 shadow-sm'}`}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="px-3">
                                <span className="text-[10px] font-bold text-slate-600">{t('branch.pagination_page', { current: page, total: pagination.totalPages })}</span>
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className={`p-2 rounded-lg border transition-all ${page === pagination.totalPages ? 'text-slate-200 border-slate-100' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 shadow-sm'}`}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default BranchStock;
