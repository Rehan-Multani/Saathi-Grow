import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { History, ArrowLeft, User, Package, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { getInventoryLogs, getProductById } from '../../api/productApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStaffAuth } from '../../../staff/context/StaffAuthContext';
import { useStoreManagerAuth } from '../../../store-manager/context/StoreManagerAuthContext';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const ProductInventoryLogs = () => {
    const { t } = useTranslation('admin_products');
    const { id } = useParams();
    const adminContext = useAdminAuth();
    const staffContext = useStaffAuth();
    const managerContext = useStoreManagerAuth();

    const adminUser = adminContext?.adminUser || staffContext?.staffUser || managerContext?.managerUser || null;
    
    const [product, setProduct] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const limit = 15;

    const fetchProduct = useCallback(async () => {
        try {
            const data = await getProductById(adminUser.token, id);
            setProduct(data);
        } catch (error) { toast.error(t('messages.load_failed')); }
    }, [adminUser.token, id, t]);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getInventoryLogs(adminUser.token, id, { page, limit });
            if (data.logs) {
                setLogs(data.logs);
                setTotalLogs(data.total);
                setTotalPages(data.pages);
            } else { setLogs(Array.isArray(data) ? data : []); }
        } catch (error) { toast.error(t('messages.load_failed')); }
        finally { setLoading(false); }
    }, [adminUser.token, id, page, t]);

    useEffect(() => {
        if (adminUser?.token && id) { fetchProduct(); fetchLogs(); }
    }, [adminUser.token, id, page, fetchProduct, fetchLogs]);

    const getBadgeVariant = (type) => {
        switch (type) {
            case 'Addition': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Sale': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Deduction': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Damage': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Return': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'Audit': return 'bg-slate-50 text-slate-600 border-slate-100';
            default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    const getTypeLabel = (type) => {
        const key = type?.toLowerCase();
        return t(`logs.types.${key}`, { defaultValue: type });
    };

    if (loading && page === 1 && !product) return <div className="flex h-screen items-center justify-center bg-white"><div className="saathi-spinner"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <Link to="/admin/products" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-medium mb-6 transition-all">
                        <ArrowLeft size={16} /> {t('logs.back')}
                    </Link>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-sm">
                                <History size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-slate-900">{t('logs.title')}</h1>
                                    <PageInfoTooltip info={pageInfoData.productInventoryLogs} />
                                </div>
                                {product && <p className="text-slate-500 text-sm mt-1">{t('logs.subtitle', { name: product.name })}</p>}
                            </div>
                        </div>
                        {product && (
                            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('logs.current_balance')}</span>
                                <div className="text-xl font-bold text-slate-900 flex items-baseline gap-2">
                                    {product.vendor ? (product.stock || 0) : (product.branchStocks?.reduce((acc, curr) => acc + curr.stock, 0) || 0)}
                                    <span className="text-xs font-medium text-slate-400 uppercase">{product.unitType || 'Units'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center text-sm font-bold text-slate-800">
                        <span>Movement History</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('logs.records', { count: totalLogs })}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('logs.table.time')}</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('logs.table.location')}</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('logs.table.event')}</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('logs.table.change')}</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('logs.table.balance')}</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('logs.table.operator')}</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('logs.table.reason')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading && page === 1 ? (
                                    <tr><td colSpan="7" className="py-20 text-center"><div className="saathi-spinner mx-auto"></div></td></tr>
                                ) : logs.length > 0 ? (
                                    logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-slate-900">{format(new Date(log.createdAt), 'MMM dd, yyyy')}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">{format(new Date(log.createdAt), 'hh:mm a')}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.vendorId ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-purple-500 uppercase flex items-center gap-1"><Store size={10} /> Vendor</span>
                                                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{log.vendorId.storeName}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-blue-500 uppercase flex items-center gap-1"><Package size={10} /> Branch</span>
                                                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{log.branchId?.name || 'Main Office'}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getBadgeVariant(log.type)}`}>
                                                    {getTypeLabel(log.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-sm font-bold ${log.changeAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {log.changeAmount >= 0 ? '+' : ''}{log.changeAmount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2 text-xs font-medium">
                                                    <span className="text-slate-300">{log.previousStock}</span>
                                                    <span className="text-slate-200">→</span>
                                                    <span className="font-bold text-slate-900">{log.newStock}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400"><User size={14} /></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-700">{log.admin?.name || (log.vendorId ? log.vendorId.storeName : 'System')}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{log.admin?.role || (log.vendorId ? 'Vendor' : 'System')}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-slate-500 max-w-[200px] line-clamp-1 italic">{log.reason || 'No remark'}</p>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="7" className="py-20 text-center text-slate-400 text-sm font-medium">{t('logs.no_logs')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && totalPages > 1 && (
                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-medium">{t('logs.records', { count: totalLogs })} Found</span>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30"><ChevronLeft size={18} /></button>
                                <span className="text-xs font-bold text-slate-900 flex items-center px-4">Page {page} of {totalPages}</span>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30"><ChevronRight size={18} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .saathi-spinner { width: 32px; height: 32px; border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}

export default ProductInventoryLogs;
