import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet,
    ArrowDownLeft,
    TrendingUp,
    ChevronRight,
    HelpCircle,
    Check,
    FileDown,
    ShieldAlert,
    Clock,
    UserCheck,
    ArrowUpFromLine
} from 'lucide-react';
import { toast } from 'react-toastify';
import useDelivery from '../hooks/useDelivery';
import useDeliveryStore from '../store/deliveryStore';
import { formatCurrency } from '../../vendor/utils/formatDate';

const WalletPage = () => {
    const { token } = useDeliveryStore();
    const { wallet, transactions = [], stats, profile } = useDelivery();

    const handleExport = () => {
        const toastId = toast.loading("Processing tactical audit...");
        setTimeout(() => {
            const csvContent = "date,order,type,amount,status\n" +
                transactions.map(tx => `${new Date(tx.createdAt).toLocaleDateString()},${tx.order?.orderId || 'N/A'},${tx.type},${tx.amount},${tx.status}`).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `cash_audit_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.update(toastId, { render: "Audit Log Downloaded", type: "success", isLoading: false, autoClose: 2000 });
        }, 1200);
    };

    const cashLiability = wallet?.balance || 0;
    const liabilityLimit = 10000;
    const liabilityProgress = Math.min((cashLiability / liabilityLimit) * 100, 100);

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-slate-900 text-white rounded-xl">
                            <Wallet size={20} />
                        </div>
                        Cash Management Core
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Personnel Liability & Collection Control</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:shadow-md transition-all active:scale-95"
                >
                    <FileDown size={14} />
                    Audit Export
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cash Liability Card */}
                <div className="lg:col-span-2">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] -ml-24 -mb-24"></div>

                        <div className="relative z-10 space-y-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Cash Liability (COD)</p>
                                    <div className="flex items-baseline gap-2">
                                        <h2 className="text-5xl font-black tracking-tight">{formatCurrency(cashLiability)}</h2>
                                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">In Possession</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                                    <ShieldAlert size={24} className={cashLiability > 8000 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-white/30">Hub Deposit Limit</span>
                                    <span className="text-white/60">₹10,000.00</span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${liabilityProgress}%` }}
                                        className={`h-full rounded-full transition-all duration-1000 ${cashLiability > 8000 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                    ></motion.div>
                                </div>
                                {cashLiability > 8000 && (
                                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest animate-pulse">
                                        Crititcal Limit Reached: Please deposit at HQ
                                    </p>
                                )}
                            </div>

                            <div className="pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-8">
                                <div>
                                    <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-xs font-bold">Unsettled</p>
                                </div>
                                <div>
                                    <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Personnel</p>
                                    <p className="text-xs font-bold truncate">#{profile?.uniqueId || 'DP-X'}</p>
                                </div>
                                <div className="hidden md:block text-right">
                                    <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Security Factor</p>
                                    <p className="text-xs font-bold text-emerald-400">99.2%</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Tactical Stats Sidebar */}
                <div className="space-y-4 text-slate-900">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Today's Catch</p>
                                <h4 className="font-black text-lg">{formatCurrency(stats?.todayEarnings || 0)}</h4>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <UserCheck size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Missions</p>
                                <h4 className="font-black text-lg">{stats?.todayDeliveries || 0} Successful</h4>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2">
                            <HelpCircle size={16} className="text-slate-400" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Settlement Hub Rules</h4>
                        </div>
                        <ul className="space-y-3">
                            <li className="text-[11px] font-bold text-slate-600 flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                                Cash collected must be deposited daily at the Branch HQ.
                            </li>
                            <li className="text-[11px] font-bold text-slate-600 flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                                Keep digital receipts for all physical handovers.
                            </li>
                            <li className="text-[11px] font-bold text-slate-600 flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shrink-0"></div>
                                Limit exceed alert will disable new missions.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Collection Stream */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                        <Clock size={16} />
                        Mission Log Audit
                    </h3>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Objective</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Protocol</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total Collection</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-xl bg-opacity-10 ${tx.status === 'collected' ? 'bg-amber-500 text-amber-600' : 'bg-emerald-500 text-emerald-600'}`}>
                                                        <ArrowDownLeft size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm text-slate-900">MISSION #{tx.order?.orderId?.slice(-6)}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Delivery Handover</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-xs font-bold text-slate-600">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    tx.status === 'settled_with_admin' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                    {tx.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <p className="font-black text-slate-900">{formatCurrency(tx.amount)}</p>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.4em] italic mb-2">No historical records found</p>
                                            <div className="w-12 h-1 bg-slate-50 mx-auto rounded-full"></div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
