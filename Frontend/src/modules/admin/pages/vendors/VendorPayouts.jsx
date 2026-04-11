import React, { useState, useEffect } from 'react';
import { Search, IndianRupee, Clock, CheckCircle, XCircle, Filter, Download, ArrowUpRight, TrendingUp, Wallet, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getVendorPayouts, updatePayoutStatus } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const VendorPayouts = () => {
    const { t } = useTranslation('admin_vendors');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchPayouts = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            const data = await getVendorPayouts(adminUser.token);
            setPayouts(Array.isArray(data) ? data : (data.payouts || []));
        } catch (error) {
            toast.error('Failed to load payouts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (adminUser?.token) fetchPayouts();
    }, [adminUser.token]);

    const handleStatusUpdate = async (id, status) => {
        const actionText = status === 'Paid' ? 'Approve Payment' : 'Reject Request';
        const color = status === 'Paid' ? '#2563eb' : '#ef4444';

        Swal.fire({
            title: actionText + '?',
            text: `Are you sure you want to mark this as ${status.toLowerCase()}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: color,
            cancelButtonColor: '#94a3b8',
            confirmButtonText: t('form.save') || 'Yes, proceed'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await updatePayoutStatus(adminUser.token, id, { status });
                    toast.success(`Payout marked as ${status}`);
                    fetchPayouts();
                } catch (error) {
                    toast.error('Failed to update status');
                }
            }
        });
    };

    const filteredPayouts = payouts.filter(p => {
        const matchesSearch = p.vendor?.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (p.payoutId || p._id)?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading && !refreshing) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 gap-4">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-none">{t('loading')}</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('payouts.title')}</h1>
                    <p className="text-slate-500 text-xs mt-1 font-medium italic">{t('payouts.subtitle')}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('payouts.search_placeholder')}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-500/50 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full md:w-48 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-blue-500 shadow-sm appearance-none cursor-pointer"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">{t('payouts.status.pending')}</option>
                        <option value="Paid">{t('payouts.status.paid')}</option>
                        <option value="Rejected">{t('payouts.status.rejected')}</option>
                    </select>
                    <button
                        onClick={() => fetchPayouts(true)}
                        disabled={refreshing}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 shrink-0 ${refreshing ? 'opacity-50' : 'hover:border-blue-500'}`}
                    >
                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {[
                    { label: t('payout_report.history.table.status'), value: payouts.filter(p => p.status === 'Pending' || p.status === 'Requested').length, icon: <Clock size={20} />, color: 'amber' },
                    { label: t('payouts.stats.settled'), value: `₹${payouts.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toLocaleString()}`, icon: <CheckCircle size={20} />, color: 'emerald' },
                    { label: t('payouts.stats.total_volume'), value: `₹${payouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toLocaleString()}`, icon: <Wallet size={20} />, color: 'blue' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-slate-300 transition-all">
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

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-700">
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-5">{t('payouts.table.id')}</th>
                                <th className="px-6 py-5">{t('payouts.table.vendor')}</th>
                                <th className="px-6 py-5">{t('payouts.table.amount')}</th>
                                <th className="px-6 py-5">{t('payouts.table.date')}</th>
                                <th className="px-6 py-5 text-center">{t('payouts.table.status')}</th>
                                <th className="px-8 py-5 text-right">{t('all_vendors.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPayouts.length > 0 ? (
                                filteredPayouts.map((payout, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-tight">#{payout.payoutId || payout._id.slice(-6)}</span>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-slate-900 text-sm uppercase tracking-tight">
                                            {payout.vendor?.storeName || 'Unknown Store'}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-1 text-slate-900 font-bold text-sm tracking-tight">
                                                <IndianRupee size={14} className="text-slate-400" />
                                                {payout.amount}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase italic">
                                                {new Date(payout.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${
                                                payout.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                (payout.status === 'Pending' || payout.status === 'Requested') ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                                            }`}>
                                                {payout.status === 'Paid' ? t('payouts.status.paid') : (payout.status === 'Requested' ? t('payouts.status.pending') : payout.status)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {(payout.status === 'Pending' || payout.status === 'Requested') ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleStatusUpdate(payout._id, 'Paid')}
                                                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-sm border-none"
                                                    >
                                                        {t('form.submit')}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(payout._id, 'Rejected')}
                                                        className="px-4 py-1.5 bg-white border border-rose-200 text-rose-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95"
                                                    >
                                                        {t('form.cancel')}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => navigate(`/admin/vendors/payouts/${payout._id}`)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border-none bg-transparent"
                                                >
                                                    <ArrowRight size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">{t('all_vendors.no_data')}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { height: 4px; border-radius: 10px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default VendorPayouts;
