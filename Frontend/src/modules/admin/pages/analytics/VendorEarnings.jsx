import React, { useState, useEffect, useCallback } from 'react';
import { Download, IndianRupee, Wallet, TrendingUp, ChevronLeft, ChevronRight, Hash, Search, RefreshCw, Filter, ArrowRight, Loader2, DollarSign, Activity, Store, Banknote, ListFilter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAdminVendorEarnings, exportVendorEarningsCSV } from '../../api/reportApi';
import { getVendors } from '../../api/vendorApi';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const VendorEarnings = () => {
    const { t } = useTranslation('admin_analytics');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);
    const [vendors, setVendors] = useState([]);
    
    // Filters
    const [view, setView] = useState('earnings'); // 'earnings' (Sales) or 'withdrawals' (Payouts)
    const [statusFilter, setStatusFilter] = useState('All Vendors');
    const [vendorId, setVendorId] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchVendorsList = useCallback(async () => {
        if (!adminUser?.token) return;
        try {
            const list = await getVendors(adminUser.token);
            setVendors(list);
        } catch (error) {
            console.error('Fetch Vendors Error:', error);
        }
    }, [adminUser]);

    const fetchEarnings = useCallback(async (isRefresh = false) => {
        if (!adminUser?.token) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await getAdminVendorEarnings(adminUser.token, {
                page,
                limit,
                status: view === 'withdrawals' ? statusFilter : undefined,
                vendorId: vendorId || undefined,
                view
            });
            if (res.success) {
                setData(res);
            }
        } catch (error) {
            // toast.error('Failed to load records');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [adminUser, page, statusFilter, vendorId, view]);

    useEffect(() => {
        fetchVendorsList();
    }, [fetchVendorsList]);

    useEffect(() => {
        fetchEarnings();
    }, [fetchEarnings]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(val || 0);
    };

    const handleExport = async () => {
        if (!adminUser?.token) return;
        
        try {
            Swal.fire({
                title: 'Preparing File',
                text: `Generating ${view} report...`,
                icon: 'info',
                showConfirmButton: false,
                didOpen: () => Swal.showLoading()
            });

            const blob = await exportVendorEarningsCSV(adminUser.token, {
                status: statusFilter,
                vendorId: vendorId || undefined,
                view
            });

            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `vendor_${view}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            Swal.close();
            toast.success('Report downloaded');
        } catch (error) {
            Swal.close();
            toast.error('Export failed');
        }
    };

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 gap-4">
                <Loader2 size={40} className="text-blue-600 animate-spin" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-none">Scanning Financial Records...</p>
            </div>
        );
    }

    const { stats, records, pagination } = data || { 
        stats: { totalPaidOut: 0, pendingDue: 0, commissionEarned: 0, netEarnings: 0 },
        records: [],
        pagination: { total: 0, totalPages: 1 }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/30 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('finance.earnings.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.vendorEarnings} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-bold opacity-70 uppercase tracking-tight">{t('finance.earnings.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="bg-white border border-slate-200 p-1 rounded-2xl flex shadow-sm">
                        <button 
                            onClick={() => { setView('earnings'); setPage(1); }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'earnings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {t('finance.earnings.tabs.sales')}
                        </button>
                        <button 
                            onClick={() => { setView('withdrawals'); setPage(1); }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'withdrawals' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {t('finance.earnings.tabs.payouts')}
                        </button>
                    </div>

                    <select 
                        value={vendorId}
                        onChange={(e) => { setVendorId(e.target.value); setPage(1); }}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase text-slate-700 outline-none focus:border-blue-500 shadow-sm pr-10 appearance-none cursor-pointer min-w-[150px]"
                    >
                        <option value="">{t('finance.earnings.filters.all_vendors')}</option>
                        {vendors.map(v => (
                            <option key={v._id} value={v._id}>{v.storeName}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleExport}
                        className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                    >
                        <Download size={16} />
                        <span>{t('common.export', { ns: 'admin_reports' })}</span>
                    </button>
                    
                    <button
                        onClick={() => fetchEarnings(true)}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-all shadow-sm active:scale-90"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm border-b-4 border-emerald-600">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('finance.earnings.total_earned')}</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{formatCurrency(stats.netEarnings)}</h3>
                    <div className="mt-2 flex items-center gap-1.5 text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">
                        <TrendingUp size={12} /> Revenue
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm border-b-4 border-blue-600">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('finance.earnings.paid_to_bank')}</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{formatCurrency(stats.totalPaidOut)}</h3>
                    <div className="mt-2 flex items-center gap-1.5 text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">
                        <Banknote size={12} /> Payouts
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm border-b-4 border-amber-500">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('finance.earnings.pending')}</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{formatCurrency(stats.pendingDue)}</h3>
                    <div className="mt-2 flex items-center gap-1.5 text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">
                        <Wallet size={12} /> Pending
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm border-b-4 border-rose-500">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('finance.earnings.commission')}</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{formatCurrency(stats.commissionEarned)}</h3>
                    <div className="mt-2 flex items-center gap-1.5 text-rose-600 bg-rose-50 w-fit px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">
                        <DollarSign size={12} /> Commission
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                        {view === 'earnings' ? t('finance.earnings.tabs.sales') : t('finance.earnings.tabs.payouts')} History
                    </h5>
                    {view === 'withdrawals' && (
                         <select 
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="bg-transparent text-[11px] font-black uppercase text-blue-600 outline-none cursor-pointer border-none p-0 focus:ring-0 appearance-none"
                        >
                            <option value="All Vendors">{t('finance.earnings.filters.all_status')}</option>
                            <option value="Pending Payouts">{t('finance.earnings.filters.pending')}</option>
                            <option value="Completed Payouts">{t('finance.earnings.filters.settled')}</option>
                        </select>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                                <th className="px-8 py-5">{view === 'earnings' ? t('finance.earnings.table.order_id') : t('finance.earnings.table.payout_id')}</th>
                                <th className="px-6 py-5">{t('finance.earnings.table.vendor')}</th>
                                <th className="px-6 py-5">{t('finance.earnings.table.date')}</th>
                                <th className="px-6 py-5">{view === 'earnings' ? 'ORDER TOTAL' : t('finance.earnings.table.amount')}</th>
                                <th className="px-6 py-5">{view === 'earnings' ? 'VENDOR EARNINGS' : 'STATUS'}</th>
                                {view === 'earnings' && <th className="px-6 py-5 text-center">STATUS</th>}
                                <th className="px-8 py-5 text-right uppercase">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold">
                            {records.length > 0 ? records.map((r, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">#{view === 'earnings' ? r.recordId.slice(-8) : r.recordId}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-xs font-black text-slate-800 uppercase tracking-tight">{r.vendor}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase opacity-70">{r.date}</div>
                                    </td>
                                    <td className={`px-6 py-5 text-xs font-black ${view === 'earnings' ? 'text-slate-800' : 'text-blue-600'}`}>
                                        {view === 'earnings' ? formatCurrency(r.orderTotal || 0) : formatCurrency(r.amount)}
                                    </td>
                                    <td className={`px-6 py-5 text-xs font-black ${view === 'earnings' ? 'text-emerald-600' : 'text-center'}`}>
                                        {view === 'earnings' ? (
                                            formatCurrency(r.amount)
                                        ) : (
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight border ${
                                                r.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                r.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                                            }`}>
                                                {r.status}
                                            </span>
                                        )}
                                    </td>
                                    {view === 'earnings' && (
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight border ${
                                                r.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                r.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                                            }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-8 py-5 text-right">
                                        {view === 'withdrawals' && (
                                            <button 
                                                onClick={() => navigate(`/admin/analytics/earnings/${r.id}`)}
                                                className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            >
                                                <ArrowRight size={18} />
                                            </button>
                                        )}
                                        {view === 'earnings' && (
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-tight">
                                                    Fee: {formatCurrency(r.commission || 0)}
                                                </span>
                                                {r.tax > 0 && (
                                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-tight">
                                                        Tax: {formatCurrency(r.tax)}
                                                    </span>
                                                )}
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {r.paymentMethod || 'N/A'}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-none">No active records found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Toolbar */}
                {!loading && pagination.total > 0 && pagination.totalPages > 1 && (
                    <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, pagination.total)} of {pagination.total} records
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white border rounded-xl disabled:opacity-30 hover:border-blue-500 shadow-sm transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-bold text-slate-500 px-4">{page} / {pagination.totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="p-2 bg-white border rounded-xl disabled:opacity-30 hover:border-blue-500 shadow-sm transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorEarnings;
