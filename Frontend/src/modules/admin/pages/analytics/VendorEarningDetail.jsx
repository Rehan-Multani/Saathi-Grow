import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Download, ArrowLeft, IndianRupee, Calendar, TrendingUp,
    CreditCard, FileText, ArrowUpRight, ShoppingBag, Store,
    CheckCircle, Clock, Info, Loader2, Printer, Wallet, ChevronRight
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAdminVendorPayoutDetail } from '../../api/reportApi';
import { toast } from 'react-toastify';

const VendorEarningDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!adminUser?.token || !id) return;
            setLoading(true);
            try {
                const res = await getAdminVendorPayoutDetail(adminUser.token, id);
                if (res.success) {
                    setData(res);
                }
            } catch (error) {
                console.error('Fetch Payout Detail Error:', error);
                toast.error('Failed to load payout details');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [adminUser, id]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 gap-4">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-none">Loading Statement...</p>
            </div>
        );
    }

    if (!data || !data.payout) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 gap-6">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 shadow-inner">
                    <Info size={40} className="text-slate-200" />
                </div>
                <h4 className="text-slate-400 font-bold uppercase text-xs tracking-widest italic">No details found</h4>
                <button 
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95 border-none"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        );
    }

    const { payout, recentOrders, stats } = data;
    const vendor = payout.vendor || {};
    const bank = vendor.bankAccount || {};

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; font-size: 10pt; }
                    .print-only { display: block !important; }
                }
            `}} />
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 no-print">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border-none bg-transparent">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden shrink-0">
                            {vendor.logo ? <img src={vendor.logo} className="w-full h-full object-cover" /> : <Store size={24} className="text-slate-200" />}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase tracking-tight leading-none">{vendor.storeName || 'Vendor Profile'}</h1>
                            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest italic leading-none">Statement: {payout.payoutId}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-tight hover:bg-black active:scale-95 transition-all shadow-lg border-none"
                >
                    <Printer size={16} /> Print Statement
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-2">
                {[
                    { label: 'Total Earnings', value: formatCurrency(stats.totalSales), sub: `${stats.totalItems || 0} items sold`, icon: <TrendingUp size={20} />, color: 'blue' },
                    { label: 'Settled Amount', value: formatCurrency(payout.amount), sub: payout.status, icon: <CheckCircle size={20} />, color: 'emerald', highlight: true },
                    { label: 'Platform Commission', value: formatCurrency(stats.totalComm), sub: 'Service fees deducted', icon: <Info size={20} />, color: 'rose' }
                ].map((stat, i) => (
                    <div key={i} className={`bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 flex flex-col justify-between group hover:border-slate-300 transition-all ${stat.highlight ? 'bg-gradient-to-br from-white to-emerald-50/30' : ''}`}>
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">{stat.label}</span>
                            <div className={`w-10 h-10 rounded-xl bg-slate-50 text-${stat.color}-500 flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div>
                            <div className={`text-2xl font-bold tracking-tighter ${stat.highlight ? 'text-emerald-600' : 'text-slate-900'}`}>{stat.value}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-2 italic flex items-center gap-1">
                                {stat.highlight ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> : null}
                                {stat.sub}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Transaction List */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-700">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/10 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-3">
                            <ShoppingBag size={20} className="text-blue-500" /> Recent Delivered Orders
                        </h3>
                    </div>
                    <div className="overflow-x-auto scrollbar-thin">
                        <table className="w-full text-left font-medium">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-8 py-5">Order ID</th>
                                    <th className="px-6 py-5">Completed Date</th>
                                    <th className="px-6 py-5 text-center">Qty</th>
                                    <th className="px-8 py-5 text-right">Vendor Share</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentOrders.length > 0 ? recentOrders.map((tr, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/20 transition-colors group">
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-tight">#{tr.orderId.slice(-8)}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase italic opacity-70">{tr.createdAt.split('T')[0]}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-[11px] font-bold text-slate-700">{tr.items?.length || 0}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-bold text-slate-900 text-sm tracking-tight italic">
                                            {formatCurrency(tr.vendorPayoutAmount)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest italic opacity-60">No recent orders linked to this payout</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Settlement Details Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 overflow-hidden sticky top-6">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">Payment Recipient</h4>
                        
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                                <Wallet size={24} className="text-blue-500" />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none opacity-60 mb-1.5">Settlement Method</span>
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-tight block truncate">{payout.paymentMethod}</span>
                            </div>
                        </div>

                        <div className="space-y-6 mb-10">
                            {[
                                { label: 'Bank Name', value: bank.bankName || 'Direct UPI', icon: <Store size={14} /> },
                                { label: 'Account No', value: bank.accountNumber || payout.upiId || 'N/A', icon: <CreditCard size={14} /> },
                                { label: 'Reference No', value: payout.referenceNumber || '-', icon: <Info size={14} />, isRef: true }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors shadow-inner">
                                            {item.icon}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.label}</span>
                                    </div>
                                    <span className={`text-[11px] font-bold uppercase tracking-tight italic opacity-90 ${item.isRef ? 'text-blue-600' : 'text-slate-700'}`}>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {payout.note && (
                            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/30">
                                <h5 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-3 leading-none italic">Admin Remarks</h5>
                                <p className="text-[10px] font-bold text-blue-700 leading-relaxed italic opacity-80">"{payout.note}"</p>
                            </div>
                        )}
                        
                        <button className="w-full mt-8 py-3.5 bg-slate-900 text-white rounded-[1.25rem] text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center gap-3 border-none">
                            <Download size={16} /> Export Receipt
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { width: 4px; border-radius: 10px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default VendorEarningDetail;
