import React, { useState, useEffect } from 'react';
import { RefreshCcw, Check, X, Search, Database, ChevronLeft, ChevronRight, Loader2, Store, User, Box, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getInventoryRequests, approveInventoryRequest, rejectInventoryRequest } from '../../../store-manager/api/inventoryRequestApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const InventoryRequests = () => {
    const { t } = useTranslation('admin_stock');
    const { adminUser } = useAdminAuth();
    const token = adminUser?.token;
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getInventoryRequests(token);
            setRequests(data);
        } catch (error) {
            // toast.error(t('requests.error_load', { defaultValue: 'Failed to fetch inventory requests' }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchRequests();
    }, [token]);

    const handleApprove = async (id) => {
        try {
            await approveInventoryRequest(token, id);
            toast.success(t('requests.alerts.approve_success'));
            fetchRequests();
        } catch (error) {
            toast.error(t('requests.alerts.approve_error'));
        }
    };

    const handleReject = async (id) => {
        if (window.confirm(t('requests.alerts.reject_confirm'))) {
            try {
                await rejectInventoryRequest(token, id);
                toast.success(t('requests.alerts.reject_success'));
                fetchRequests();
            } catch (error) {
                toast.error(t('requests.alerts.reject_error'));
            }
        }
    };

    const filteredRequests = requests.filter(req =>
        req.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.branchId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalFiltered = filteredRequests.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const paginatedRequests = filteredRequests.slice((page - 1) * limit, page * limit);

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight">{t('requests.title')}</h1>
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100 uppercase">{totalFiltered} {t('adjustments.logged')}</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-medium">{t('requests.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('requests.search_placeholder')}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 transition-all text-sm font-medium shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchRequests}
                        disabled={loading}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 ${loading ? 'opacity-50' : 'hover:border-blue-500'}`}
                    >
                        <RefreshCcw size={18} className={`${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t('requests.table.resource')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t('requests.table.source')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight text-center">{t('requests.table.operation')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{t('requests.table.approval')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tight text-right">{t('requests.table.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-blue-500 animate-spin" />
                                            <span className="text-xs font-medium text-slate-400">{t('requests.loading_msg')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedRequests.length > 0 ? (
                                paginatedRequests.map(req => (
                                    <tr key={req._id} className="hover:bg-slate-50/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-blue-200 shadow-sm">
                                                    {req.product?.image ? <img src={req.product.image} alt="" className="w-full h-full object-cover" /> : <Box size={18} className="text-slate-200" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-slate-900 leading-tight uppercase tracking-tight truncate max-w-[180px]">{req.product?.name || 'Item'}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{req.product?.sku || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-slate-700 truncate whitespace-nowrap">{req.branchId?.name}</div>
                                                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                                        <User size={10} strokeWidth={3} /> {req.managerId?.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1.5 text-xs font-bold">
                                                    <span className="text-slate-400 font-medium">{req.currentStock}</span>
                                                    <ArrowRight size={10} className="text-slate-300" />
                                                    <span className={`text-emerald-600`}>{req.requestedStock}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{req.adjustmentType}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-tight ${
                                                req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                req.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {t(`requests.status.${req.status.toLowerCase()}`)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {req.status === 'Pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleApprove(req._id)} 
                                                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl border border-transparent hover:border-emerald-100 transition-all shadow-sm active:scale-95" 
                                                        title="Approve"
                                                    >
                                                        <Check size={18} strokeWidth={2.5} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(req._id)} 
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all shadow-sm active:scale-95" 
                                                        title="Reject"
                                                    >
                                                        <X size={18} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">{t('requests.table.decision_by')}</span>
                                                    <span className="text-[10px] font-bold text-slate-700">{req.reviewedBy?.name || t('requests.table.lead_admin')}</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <Database className="text-slate-200" size={32} />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900">{t('requests.no_requests')}</h4>
                                        <p className="text-xs font-medium text-slate-400 mt-1 max-w-sm mx-auto">{t('requests.subtitle')}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && totalFiltered > 0 && (
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs font-medium text-slate-500 italic">
                            {t('branch.pagination_showing', { start: ((page - 1) * limit) + 1, end: Math.min(page * limit, totalFiltered), total: totalFiltered })}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-2 rounded-lg border transition-all ${page === 1 ? 'text-slate-200 border-slate-100 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 shadow-sm'}`}
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className="flex items-center gap-1.5">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    if (p === 1 || p === totalPages || Math.abs(page - p) <= 1) {
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-9 h-9 text-xs font-bold rounded-lg transition-all ${page === p ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
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
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`p-2 rounded-lg border transition-all ${page === totalPages ? 'text-slate-200 border-slate-100 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 shadow-sm'}`}
                            >
                                <ChevronRight size={18} />
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

export default InventoryRequests;
