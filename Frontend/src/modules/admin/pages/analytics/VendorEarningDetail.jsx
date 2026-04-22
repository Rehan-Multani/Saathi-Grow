import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Download, ArrowLeft, IndianRupee, Calendar, TrendingUp,
    CreditCard, FileText, ArrowUpRight, ShoppingBag, Store,
    CheckCircle, Clock, Info, Loader2, Printer, Wallet, ChevronRight, Activity
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAdminVendorPayoutDetail } from '../../api/reportApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const VendorEarningDetail = () => {
    const { t } = useTranslation('admin_analytics');
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
                // toast.error('Failed to load payout details');
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
                <Loader2 size={40} className="text-blue-600 animate-spin" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-none">Opening Statement...</p>
            </div>
        );
    }

    if (!data || !data.payout) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 gap-6">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 shadow-inner">
                    <Info size={40} className="text-slate-200" />
                </div>
                <h4 className="text-slate-400 font-bold uppercase text-xs tracking-widest">No details found</h4>
                <button 
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest"
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
        <div className="container-fluid py-6 bg-slate-50/30 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .print-only { display: block !important; }
                }
            `}} />
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 no-print">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all shadow-sm">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden shrink-0 p-1">
                            {vendor.logo ? <img src={vendor.logo} className="w-full h-full object-contain rounded-xl" /> : <Store size={24} className="text-slate-200" />}
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{vendor.storeName || 'Vendor Pay'}</h1>
                            <p className="text-[10px] font-black text-blue-600 mt-2 uppercase tracking-widest">Earning Statement: {payout.payoutId}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-tight shadow-xl shadow-slate-200 active:scale-95 transition-all"
                >
                    <Printer size={16} /> Print Receipt
                </button>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm border-b-4 border-blue-600">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{stats.totalItems || 0} Items</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sales Volume</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{formatCurrency(stats.totalSales)}</h3>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm border-b-4 border-emerald-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg">{payout.status}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Money Paid</p>
                    <h3 className="text-3xl font-black text-emerald-600 tracking-tight mt-1">{formatCurrency(payout.amount)}</h3>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm border-b-4 border-rose-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                            <Info size={20} />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Sharing</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{formatCurrency(stats.totalComm)}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
                {/* Transaction Table */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/10 h-16 flex items-center">
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                            <ShoppingBag size={18} className="text-blue-600" /> Item Sales Log
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-8 py-5">Order ID</th>
                                    <th className="px-6 py-5">Completed On</th>
                                    <th className="px-6 py-5 text-center">Items</th>
                                    <th className="px-8 py-5 text-right uppercase">Pay Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-bold">
                                {recentOrders.length > 0 ? recentOrders.map((tr, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-black text-blue-600 uppercase tracking-tight">#{tr.orderId.slice(-8)}</span>
                                        </td>
                                        <td className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase">
                                            {tr.createdAt.split('T')[0]}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="bg-slate-50 px-3 py-1 rounded-lg text-slate-600 text-[10px] font-black border border-slate-100">{tr.items?.length || 0}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-slate-800 text-xs tracking-tight">
                                            {formatCurrency(tr.vendorPayoutAmount)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center text-[10px] font-black text-slate-400 uppercase">No recent orders linked</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Account Details */}
                <div className="space-y-6 lg:sticky lg:top-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">Payment Destination</h4>
                        
                        <div className="flex items-center gap-4 mb-10 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                             <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                                <Wallet size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block opacity-70">Transfer Via</span>
                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight block">{payout.paymentMethod}</span>
                            </div>
                        </div>

                        <div className="space-y-6 mb-10">
                            {[
                                { label: 'Bank Profile', value: bank.bankName || 'Direct UPI', icon: <Store size={14} /> },
                                { label: 'Account/UPI', value: bank.accountNumber || payout.upiId || 'N/A', icon: <CreditCard size={14} /> },
                                { label: 'Reference Code', value: payout.referenceNumber || 'Pending', icon: <Activity size={14} />, isRef: true }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-600 transition-colors">
                                            {item.icon}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <span className={`text-[11px] font-black uppercase tracking-tight ${item.isRef ? 'text-blue-600' : 'text-slate-800'}`}>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {payout.note && (
                            <div className="mb-10 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/30">
                                <h5 className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Info size={12} /> Store Remarks
                                </h5>
                                <p className="text-[11px] font-bold text-slate-700 leading-relaxed uppercase tracking-tight opacity-80">"{payout.note}"</p>
                            </div>
                        )}
                        
                        <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3">
                            <Download size={16} /> Download Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorEarningDetail;
