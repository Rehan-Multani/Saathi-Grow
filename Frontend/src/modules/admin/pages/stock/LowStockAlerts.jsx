import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Package, ChevronLeft, ChevronRight, AlertTriangle, RefreshCcw, Filter, Loader2, Store, Activity, Box, Info, CheckCircle } from 'lucide-react';
import { getLowStockAlerts } from '../../api/productApi';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const LowStockAlerts = () => {
    const { t } = useTranslation('admin_stock');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [alerts, setAlerts] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [severityFilter, setSeverityFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
    
    const limit = 10;

    // Debounce search
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

    const fetchAlerts = useCallback(async () => {
        if (!adminUser?.token) return;
        
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: debouncedSearch,
                severity: severityFilter,
                branchId: branchFilter
            };
            const response = await getLowStockAlerts(adminUser.token, params);
            if (response.success) {
                setAlerts(response.data || []);
                setPagination(response.pagination);
            }
        } catch (error) {
            // toast.error(t('alerts.error_load'));
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, debouncedSearch, severityFilter, branchFilter, t]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    useEffect(() => {
        if (adminUser?.token && adminUser.role === 'Admin') {
            fetchBranches();
        }
    }, [adminUser, fetchBranches]);

    const handleRestockClick = (alertItem) => {
        if (alertItem.isVendor) {
            toast.info(t('alerts.managed_externally'));
            return;
        }

        navigate('/admin/stock/adjustments/add', { 
            state: { 
                productId: alertItem.productId, 
                sku: alertItem.sku,
                branchId: alertItem.branchId
            } 
        });
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Action Header */}
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-500 text-white rounded-xl shadow-lg flex items-center justify-center">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            {loading ? t('alerts.analyzing_msg') : t('alerts.critical_shortages', { count: pagination.total })}
                        </h2>
                        <p className="text-rose-600 text-xs font-bold uppercase tracking-wide mt-1">{t('alerts.priority_msg')}</p>
                    </div>
                </div>
                <button 
                    onClick={() => fetchAlerts()}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-50 transition-all shadow-sm shadow-rose-100 uppercase tracking-tight"
                >
                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                    {t('alerts.refresh')}
                </button>
            </div>

            {/* Smart Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-5 relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('alerts.search_placeholder')}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 focus:bg-white transition-all text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="lg:col-span-3 relative group">
                        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <select 
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 focus:bg-white transition-all text-xs font-bold text-slate-700 appearance-none cursor-pointer"
                            value={severityFilter}
                            onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">{t('alerts.severity_filter.all')}</option>
                            <option value="Critical">{t('alerts.severity_filter.critical')}</option>
                            <option value="Warning">{t('alerts.severity_filter.warning')}</option>
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

            {/* Analysis Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t('alerts.table.item')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t('alerts.table.source')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight text-center">{t('alerts.table.status')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight text-right">{t('alerts.table.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-rose-500 animate-spin" />
                                            <span className="text-xs font-medium text-slate-400">{t('alerts.loading_msg')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : alerts.length > 0 ? alerts.map((item, idx) => (
                                <tr key={`${item.productId}-${idx}`} className="hover:bg-rose-50/10 transition-colors group">
                                    <td className="px-6 py-4">
                                        <Link to={`/admin/products/${item.productId}`} className="flex items-center gap-3 group/item">
                                            <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 group-hover/item:border-rose-200 transition-all">
                                                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" /> : <Box size={18} className="text-slate-200" />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-slate-900 leading-tight uppercase tracking-tight group-hover/item:text-blue-600 transition-colors">{item.productName}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">{item.sku}</div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-slate-700 truncate">{item.isVendor ? item.storeName : item.branchName}</div>
                                                <div className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">
                                                    {item.isVendor ? t('alerts.managed_externally') : t('alerts.branch_store')}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${item.severity === 'Critical' ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-100' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                                {item.severity === 'Critical' ? t('alerts.high_priority') : item.severity}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-900">
                                                {item.stock} <span className="text-slate-400">/</span> {item.threshold} <span className="text-[8px] opacity-40 uppercase tracking-tighter">{t('alerts.table.minimum')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {item.isVendor ? (
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">{t('alerts.managed_externally')}</span>
                                        ) : (
                                            <button 
                                                onClick={() => handleRestockClick(item)}
                                                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-slate-100"
                                            >
                                                {t('alerts.restock_btn')}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="py-24 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <CheckCircle size={40} className="text-emerald-500 opacity-20" />
                                            <h4 className="text-lg font-bold text-slate-900">{t('alerts.no_alerts')}</h4>
                                            <p className="text-xs font-medium max-w-sm mx-auto opacity-60">All items are currently above their minimum stock levels.</p>
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
                            {t('alerts.pagination_msg', { start: ((page - 1) * limit) + 1, end: Math.min(page * limit, pagination.total), total: pagination.total })}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-2 rounded-lg border transition-all ${page === 1 ? 'text-slate-200 border-slate-100' : 'bg-white border-slate-200 text-slate-600 hover:border-rose-500 hover:text-rose-600 shadow-sm'}`}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="px-3">
                                <span className="text-[10px] font-bold text-slate-600">{t('branch.pagination_page', { current: page, total: pagination.totalPages })}</span>
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className={`p-2 rounded-lg border transition-all ${page === pagination.totalPages ? 'text-slate-200 border-slate-100' : 'bg-white border-slate-200 text-slate-600 hover:border-rose-500 hover:text-rose-600 shadow-sm'}`}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Tip */}
            <div className="mt-8 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3 shadow-sm">
                <Info className="text-blue-500 mt-0.5 shrink-0" size={16} />
                <div>
                    <p className="text-[11px] font-bold text-blue-900 uppercase tracking-tighter">{t('alerts.proactive.title')}</p>
                    <p className="text-[10px] text-blue-700 font-medium leading-normal italic">{t('alerts.proactive.msg')}</p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default LowStockAlerts;
