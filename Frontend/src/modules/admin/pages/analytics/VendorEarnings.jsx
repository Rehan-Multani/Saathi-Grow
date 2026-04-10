import React, { useState, useEffect, useCallback } from 'react';
import { Download, IndianRupee, Wallet, TrendingUp, ChevronLeft, ChevronRight, Hash, Search, RefreshCw, Filter, ArrowRight, Loader2, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAdminVendorEarnings } from '../../api/reportApi';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const VendorEarnings = () => {
    const { t } = useTranslation('admin_vendors');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All Vendors');
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchEarnings = useCallback(async (isRefresh = false) => {
        if (!adminUser?.token) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await getAdminVendorEarnings(adminUser.token, {
                page,
                limit,
                status: statusFilter
            });
            if (res.success) {
                setData(res);
            }
        } catch (error) {
            console.error('Fetch Vendor Earnings Error:', error);
            toast.error('Failed to load vendor earnings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [adminUser, page, statusFilter]);

    useEffect(() => {
        fetchEarnings();
    }, [fetchEarnings]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const handleExport = () => {
        if (!data?.payouts || data.payouts.length === 0) {
            toast.info('No data to export');
            return;
        }

        const headers = ['Payout ID', 'Vendor', 'Requested Date', 'Amount', 'Method', 'Reference', 'Status'];
        const csvRows = data.payouts.map(row => [
            row.payoutId,
            `"${row.vendor}"`,
            row.date,
            row.amount,
            row.method,
            `"${row.reference || '-'}"`,
            row.status
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');

        Swal.fire({
            title: 'Generating Report...',
            text: 'Preparing your vendor earnings statement.',
            icon: 'info',
            timer: 1200,
            showConfirmButton: false,
            timerProgressBar: true,
            didOpen: () => Swal.showLoading()
        }).then(() => {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `vendor_earnings_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Download triggered successfully');
        });
    };

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 gap-4">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-none">Loading Analytics...</p>
            </div>
        );
    }

    const { stats, payouts, pagination } = data || { 
        stats: { totalPaidOut: 0, pendingDue: 0, commissionEarned: 0 },
        payouts: [],
        pagination: { total: 0, totalPages: 1 }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Vendor Earnings</h1>
                        <PageInfoTooltip data={pageInfoData.vendorEarnings} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-medium italic">Monitor commissions and partner payouts</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select 
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-blue-500 shadow-sm appearance-none cursor-pointer"
                    >
                        <option value="All Vendors">All Status</option>
                        <option value="Pending Payouts">Pending</option>
                        <option value="Completed Payouts">Settled</option>
                    </select>
                    <button
                        onClick={() => fetchEarnings(true)}
                        disabled={refreshing}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 ${refreshing ? 'opacity-50' : 'hover:border-blue-500'}`}
                    >
                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-tight hover:bg-black active:scale-95 transition-all shadow-lg border-none"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 mt-2">
                {[
                    { label: 'Paid to Vendors', value: formatCurrency(stats.totalPaidOut), icon: <IndianRupee size={20} />, color: 'blue' },
                    { label: 'Pending Dues', value: formatCurrency(stats.pendingDue), icon: <Wallet size={20} />, color: 'amber' },
                    { label: 'Commission Revenue', value: formatCurrency(stats.commissionEarned), icon: <TrendingUp size={20} />, color: 'emerald' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-slate-300 transition-all border-b-4" style={{ borderColor: `var(--${stat.color}-500)` }}>
                         <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block opacity-70">{stat.label}</span>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{stat.value}</div>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-500 flex items-center justify-center border border-${stat.color}-100 shadow-inner group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* List Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-700">
                <div className="p-6 border-b border-slate-50 bg-slate-50/10 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Recent Transactions</h3>
                    {refreshing && <Loader2 size={16} className="text-blue-500 animate-spin" />}
                </div>
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-5">Payout ID</th>
                                <th className="px-6 py-5">Store/Vendor</th>
                                <th className="px-6 py-5">Request Date</th>
                                <th className="px-6 py-5">Amount</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payouts.length > 0 ? (
                                payouts.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-tighter italic">
                                                <Hash size={14} className="text-slate-200" />
                                                {p.payoutId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-slate-900 text-sm uppercase tracking-tight">
                                            {p.vendor}
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase italic opacity-70">
                                                {p.date}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-emerald-600 text-sm tracking-tight">
                                            {formatCurrency(p.amount)}
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${
                                                p.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                p.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => navigate(`/admin/analytics/earnings/${p.id}`)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border-none bg-transparent"
                                            >
                                                <ArrowRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">No earnings records found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.total > 0 && (
                    <div className="px-8 py-5 bg-slate-50/40 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            Showing <span className="text-slate-900 text-xs italic">{((page - 1) * limit) + 1} - {Math.min(page * limit, pagination.total)}</span> of <span className="text-slate-900">{pagination.total}</span> records
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white disabled:opacity-30 border-none bg-transparent">
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(pagination.totalPages)].map((_, i) => (
                                    <button 
                                        key={i+1} 
                                        onClick={() => setPage(i+1)} 
                                        className={`w-8 h-8 rounded-xl text-[10px] font-bold transition-all border-none ${page === i+1 ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-400 hover:bg-slate-100 bg-transparent'}`}
                                    >
                                        {i+1}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white disabled:opacity-30 border-none bg-transparent">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { height: 4px; border-radius: 10px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                :root { --blue-500: #3b82f6; --amber-500: #f59e0b; --emerald-500: #10b981; }
            `}} />
        </div>
    );
};

export default VendorEarnings;
