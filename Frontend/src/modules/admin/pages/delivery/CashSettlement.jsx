import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle, RefreshCw, Smartphone, History, Search, ArrowRight, Loader2, AlertCircle, Info, ChevronRight, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import * as api from '../../api/adminDeliveryApi';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const CashSettlement = () => {
    const { t } = useTranslation('admin_delivery');
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSettlementData = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            const response = await api.getCashSettlementList();
            setPartners(response.partners || []);
        } catch (error) {
            console.error("Settlement fetch failed", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSettlementData();
    }, []);

    const handleSettle = async (partner) => {
        const result = await Swal.fire({
            title: '<span class="text-xl font-black text-slate-800 tracking-tight uppercase">Handover Verification</span>',
            html: `
                <div class="text-left space-y-3 p-5 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 mt-4 font-sans">
                    <div class="flex justify-between items-center border-b pb-2.5 border-slate-200/60">
                        <span class="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Collector Node</span>
                        <span class="text-slate-800 font-extrabold text-xs uppercase tracking-tight">${partner.name}</span>
                    </div>
                    <div class="flex justify-between items-center pt-1">
                        <span class="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Handover Amount</span>
                        <span class="text-emerald-600 font-black text-xl tracking-tighter">₹${partner.cashInHand}</span>
                    </div>
                </div>
                
                <div class="mt-8 text-center font-sans px-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Enter Admin PIN</label>
                    <div class="relative max-w-[180px] mx-auto">
                        <input type="password" id="settlementPin" 
                            class="swal2-input !m-0 !w-full !text-center !text-2xl !font-black !tracking-[0.5em] !py-4 !bg-white !border-2 !border-slate-200 !rounded-[1.25rem] !outline-none focus:!border-emerald-500 focus:!ring-4 focus:!ring-emerald-500/10 !transition-all shadow-sm" 
                            placeholder="••••" maxlength="6" autofocus>
                    </div>
                </div>

                <div class="mt-8 py-3 px-4 bg-amber-50 rounded-2xl border border-amber-100/50 flex items-start gap-3">
                    <div class="mt-0.5 shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-amber-600"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <p class="text-[10px] text-amber-700 font-bold text-left leading-relaxed">Confirm physical cash receipt before proceeding. This action is irreversible.</p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Collected',
            cancelButtonText: 'Cancel',
            padding: '2.5rem',
            customClass: {
                popup: 'rounded-[2.5rem] border-none shadow-2xl',
                confirmButton: 'rounded-2xl px-8 py-3 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 m-2',
                cancelButton: 'rounded-2xl px-8 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 m-2'
            },
            preConfirm: () => {
                const pin = Swal.getPopup().querySelector('#settlementPin').value;
                if (!pin) {
                    Swal.showValidationMessage('Please enter the settlement PIN');
                }
                return { pin };
            }
        });

        if (result.isConfirmed) {
            try {
                const { pin } = result.value;
                await api.settleRiderCash(partner._id, pin);
                Swal.fire({
                    title: 'Collection Verified',
                    text: `₹${partner.cashInHand} added to settlement history`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'rounded-[2rem]'
                    }
                });
                fetchSettlementData();
            } catch (error) {
                Swal.fire({
                    title: 'Verification Failed',
                    text: error.response?.data?.message || 'Invalid PIN or server error',
                    icon: 'error',
                    customClass: {
                        popup: 'rounded-[2rem]'
                    }
                });
            }
        }
    };

    const filteredPartners = partners.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalCash = partners.reduce((sum, p) => sum + p.cashInHand, 0);

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight">{t('settlement.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.cashSettlement} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-medium">{t('settlement.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search rider..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 transition-all text-xs font-bold text-slate-700 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => fetchSettlementData(true)}
                        disabled={refreshing}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 ${refreshing ? 'opacity-50' : 'hover:border-blue-500'}`}
                    >
                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Total Balance Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                <div className="md:col-span-12 xl:col-span-4">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-emerald-200 transition-all">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <Wallet size={32} />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('settlement.total_pending')}</span>
                            <div className="text-4xl font-black text-slate-900 tracking-tighter leading-tight flex items-baseline gap-1.5">
                                <span className="text-emerald-500 text-2xl font-bold">₹</span>{totalCash.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-12 xl:col-span-8">
                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex flex-col md:flex-row items-center gap-6 font-medium">
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-indigo-900 border-b border-indigo-100 pb-2 mb-2 flex items-center gap-2">
                                <Info size={16} className="text-indigo-500" /> Collection Policy
                            </h4>
                            <p className="text-[11px] text-indigo-700 leading-relaxed italic">Confirm only when cash is physically received. Verified settlements are added to ledger immediately.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-5">Rider Details</th>
                                <th className="px-6 py-5 text-center">Contact</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5 text-center text-emerald-600 font-black">Current Balance</th>
                                <th className="px-8 py-5 text-right uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {loading && !refreshing ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6">
                                            <div className="h-4 bg-slate-50 rounded w-1/4"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredPartners.length > 0 ? (
                                filteredPartners.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                                    {item.profileImage ? <img src={item.profileImage} className="w-full h-full object-cover" /> : <User size={18} className="text-slate-300" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-sm font-bold text-slate-900 block leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.name}</span>
                                                    <div className="text-[10px] text-slate-400 font-bold mt-1">ID: {item.uniqueId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs font-bold">
                                                <Smartphone size={12} className="text-slate-300" />
                                                {item.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-tight ${
                                                item.dutyStatus === 'Online' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}>
                                                {item.dutyStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-center font-bold">
                                            <span className={`text-sm ${item.cashInHand > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>₹{item.cashInHand.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleSettle(item)}
                                                    disabled={item.cashInHand <= 0}
                                                    className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 border shadow-sm ${
                                                        item.cashInHand > 0 
                                                        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-100' 
                                                        : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <CheckCircle size={14} /> {t('settlement.collect_cash')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                                                <Wallet size={32} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">No cash collection is pending</p>
                                        </div>
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

export default CashSettlement;
