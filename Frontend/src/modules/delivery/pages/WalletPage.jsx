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
    const { wallet, transactions = [], stats, profile, walletPagination, refreshWallet } = useDelivery();

    const handleExport = async () => {
        const toastId = toast.loading("Processing tactical audit...");
        try {
            const csvContent = "date,order,type,amount,status\n" +
                transactions.map(tx => `${new Date(tx.createdAt).toLocaleDateString()},${tx.order?.orderId || 'N/A'},${tx.type},${tx.amount},${tx.status}`).join("\n");

            const fileName = `cash_audit_${new Date().toISOString().split('T')[0]}.csv`;
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const file = new File([blob], fileName, { type: 'text/csv' });

            // Try Web Share API first (ideal for mobile WebViews to bypass storage permissions)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Cash Audit Export',
                    text: 'Here is the cash audit export.'
                });
                toast.update(toastId, { render: "Audit Shared Successfully", type: "success", isLoading: false, autoClose: 2000 });
                return;
            }

            // Fallback for desktop or browsers without Web Share API
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.update(toastId, { render: "Audit Log Downloaded", type: "success", isLoading: false, autoClose: 2000 });
        } catch (error) {
            console.error("Export failed:", error);
            if (error.name !== 'AbortError') {
                toast.update(toastId, { render: "Export Failed or Canceled", type: "error", isLoading: false, autoClose: 2000 });
            } else {
                toast.dismiss(toastId);
            }
        }
    };

    const cashLiability = wallet?.balance || 0;
    const liabilityLimit = 10000;
    const liabilityProgress = Math.min((cashLiability / liabilityLimit) * 100, 100);

    return (
        <div className="max-w-[1200px] mx-auto space-y-4">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <div className="p-1.5 bg-slate-900 text-white rounded-lg">
                            <Wallet size={14} />
                        </div>
                        Cash Management Core
                    </h1>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Personnel Liability & Collection Control</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-100 !rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 hover:shadow-md transition-all active:scale-95 w-fit"
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
                        className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] -ml-24 -mb-24"></div>
 
                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Total Cash Liability (COD)</p>
                                    <div className="flex items-baseline gap-2">
                                        <h2 className="text-3xl font-black tracking-tight">{formatCurrency(cashLiability)}</h2>
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Possession</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <ShieldAlert size={20} className={cashLiability > 8000 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-white/30">Hub Deposit Limit</span>
                                    <span className="text-white/60">₹10,000.00</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${liabilityProgress}%` }}
                                        className={`h-full rounded-full transition-all duration-1000 ${cashLiability > 8000 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                    ></motion.div>
                                </div>
                                {cashLiability > 8000 && (
                                    <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest animate-pulse">
                                        Critical Limit: Deposit at HQ
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-[11px] font-bold">Unsettled</p>
                                </div>
                                <div>
                                    <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mb-1">Personnel</p>
                                    <p className="text-[11px] font-bold truncate">#{profile?.uniqueId || 'DP-X'}</p>
                                </div>
                                <div className="hidden md:block text-right">
                                    <p className="text-white/30 text-[8px] font-black uppercase tracking-widest mb-1">Security</p>
                                    <p className="text-[11px] font-bold text-emerald-400">99.2%</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Tactical Stats Sidebar */}
                <div className="space-y-3 text-slate-900">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-black p-3 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <TrendingUp size={14} />
                                </div>
                                <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Today's Catch</p>
                            </div>
                            <h4 className="font-black text-sm text-slate-900 dark:text-white">{formatCurrency(stats?.todayEarnings || 0)}</h4>
                        </div>
                        
                        <div className="bg-white dark:bg-black p-3 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0" >
                                    <UserCheck size={14} />
                                </div>
                                <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Missions</p>
                            </div>
                            <h4 className="font-black text-sm text-slate-900 dark:text-white">{stats?.todayDeliveries || 0} Total</h4>
                        </div>
                    </div>
 
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 space-y-3">
                        <div className="flex items-center gap-2">
                            <HelpCircle size={14} className="text-slate-400" />
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Tactical Audit Rules</h4>
                        </div>
                        <ul className="space-y-2">
                            <li className="text-[10px] font-bold text-slate-600 flex gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                Cash must be deposited daily at Branch HQ.
                            </li>
                            <li className="text-[10px] font-bold text-slate-600 flex gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                Keep digital receipts for all handovers.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Collection Stream */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2 px-1">
                        <Clock size={14} />
                        Audit Log Stream
                    </h3>
                </div>

                <div className="space-y-2">
                    {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={tx._id} 
                                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-slate-200 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl bg-opacity-10 ${tx.status === 'collected' ? 'bg-amber-500 text-amber-600' : 'bg-emerald-500 text-emerald-600'}`}>
                                        <ArrowDownLeft size={14} />
                                    </div>
                                    <div>
                                        <p className="font-black text-xs text-slate-900 leading-none">
                                            RUN #{tx.order?.orderId?.slice(-6) || 'N/A'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none">Handover</span>
                                            <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter ${
                                                tx.status === 'settled_with_admin' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                                {tx.status.split('_')[0]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-xs text-slate-900 leading-none">{formatCurrency(tx.amount)}</p>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-1.5 leading-none">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white rounded-3xl border border-slate-50">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic leading-none">No historical records found</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {walletPagination && walletPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-2 pt-2">
                        <button
                            disabled={walletPagination.currentPage === 1}
                            onClick={() => refreshWallet(walletPagination.currentPage - 1)}
                            className="p-2 px-4 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-400 disabled:opacity-30 transition-all active:scale-95"
                        >
                            Prev
                        </button>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Page {walletPagination.currentPage} of {walletPagination.totalPages}
                        </span>
                        <button
                            disabled={walletPagination.currentPage === walletPagination.totalPages}
                            onClick={() => refreshWallet(walletPagination.currentPage + 1)}
                            className="p-2 px-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase disabled:opacity-30 transition-all active:scale-95"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WalletPage;
