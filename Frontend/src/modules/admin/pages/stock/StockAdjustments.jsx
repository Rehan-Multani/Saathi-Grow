import React, { useState, useEffect } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Loader2, Calendar, User, Package, Store, Activity, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllInventoryLogs } from '../../api/productApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const StockAdjustments = () => {
    const { t } = useTranslation('admin_stock');
    const { adminUser } = useAdminAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
    const [page, setPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        const fetchLogs = async () => {
            if (!adminUser?.token) return;
            try {
                setLoading(true);
                const data = await getAllInventoryLogs(adminUser.token, { page, limit });
                if (data.logs) {
                    setLogs(data.logs);
                    setPagination(data.pagination);
                } else {
                    setLogs(data);
                }
            } catch (error) {
                // toast.error(t('adjustments.error_load', { defaultValue: 'Failed to load stock history' }));
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [adminUser, page, t]);

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('adjustments.title')}</h1>
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-medium">{t('adjustments.subtitle')}</p>
                </div>

                <Link
                    to="/admin/stock/adjustments/add"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-md shadow-blue-50 active:scale-95 whitespace-nowrap uppercase tracking-wider"
                >
                    <Plus size={18} /> {t('adjustments.add_btn')}
                </Link>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t('adjustments.table.id')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t('adjustments.table.product')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight text-center">{t('adjustments.table.type')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight text-center">{t('adjustments.table.change')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight text-right">{t('adjustments.table.by')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-blue-500 animate-spin" />
                                            <span className="text-xs font-medium text-slate-400">{t('adjustments.loading_msg')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${ (log.type === 'Addition' || log.type === 'Return') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                    {(log.type === 'Addition' || log.type === 'Return') ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 leading-tight uppercase tracking-tight">#{log._id.slice(-6).toUpperCase()}</div>
                                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-0.5">
                                                        <Calendar size={12} strokeWidth={2.5} /> {new Date(log.createdAt).toLocaleDateString('en-GB')}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-9 h-9 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {log.product?.image ? <img src={log.product.image} className="w-full h-full object-cover" alt="" /> : <Package size={14} className="text-slate-200" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[11px] font-bold text-slate-700 truncate uppercase tracking-tight">{log.product?.name || 'Unknown Product'}</div>
                                                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                                        <Store size={10} strokeWidth={3} /> {log.branchId?.name || 'Global'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${ (log.type === 'Addition' || log.type === 'Return') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                {t(`adjustments.types.${log.type?.toLowerCase() || 'adjustment'}`)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className={`text-xs font-bold ${ (log.type === 'Addition' || log.type === 'Return') ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {(log.type === 'Addition' || log.type === 'Return') ? '+' : '-'}{log.changeAmount}
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Stock: {log.newStock}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                                                    {log.admin?.name || 'System'} <User size={12} className="text-slate-300" />
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-semibold max-w-[140px] truncate">{log.reason || 'No reason provided'}</div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-300">
                                            <Activity className="opacity-20" size={32} />
                                            <p className="text-xs font-semibold">{t('adjustments.no_data')}</p>
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
                            <div className="flex items-center gap-1">
                                {[...Array(pagination.totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    if (p === 1 || p === pagination.totalPages || Math.abs(page - p) <= 1) {
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${page === p ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    } else if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-slate-300 px-0.5 font-bold">...</span>;
                                    }
                                    return null;
                                })}
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

export default StockAdjustments;
