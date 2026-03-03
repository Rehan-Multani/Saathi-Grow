import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    CreditCard,
    DollarSign,
    ChevronRight,
    Search,
    Loader2,
    HelpCircle,
    Check,
    History,
    FileDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import useDelivery from '../hooks/useDelivery';
import useDeliveryStore from '../store/deliveryStore';

const WalletPage = () => {
    const { token } = useDeliveryStore();
    const { wallet, transactions = [], stats, loading, profile } = useDelivery();

    const handleExport = () => {
        const toastId = toast.loading("Preparing financial report...");
        setTimeout(() => {
            const csvContent = "date,category,type,amount,status\n" +
                transactions.map(tx => `${new Date(tx.createdAt).toLocaleDateString()},${tx.category},${tx.type},${tx.amount},${tx.status}`).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `wallet_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.update(toastId, { render: "Report downloaded successfully", type: "success", isLoading: false, autoClose: 2000 });
        }, 1500);
    };

    const handlePayout = () => {
        if (!stats?.walletBalance || stats.walletBalance <= 0) {
            return toast.error("Insufficient balance for payout");
        }

        toast.info(
            <div className="flex flex-col gap-2">
                <p className="font-bold">Confirm Instant Payout?</p>
                <p className="text-[10px]">₹{stats.walletBalance.toFixed(2)} will be credited to your linked bank account.</p>
                <button
                    onClick={() => {
                        toast.dismiss();
                        const id = toast.loading("Processing transaction...");
                        setTimeout(() => {
                            toast.update(id, { render: "Payout successful! Funds will reflect in 15 mins.", type: "success", isLoading: false, autoClose: 3000 });
                        }, 2000);
                    }}
                    className="bg-black text-white px-3 py-1 rounded-lg text-[10px] font-bold"
                >
                    Confirm
                </button>
            </div>,
            { autoClose: false, closeButton: true }
        );
    };

    return (
        <div className="space-y-4 md:space-y-6 pb-10">
            {/* Header - Compact */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-zinc-100">Wallet</h1>
                    <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] mt-0.5">Fleet Financial Control</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm active:scale-95 transition-all">
                        <HelpCircle size={16} md:size={18} className="text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Virtual Wallet Card - Slim & Premium */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#028A0F] max-w-xl mx-auto rounded-3xl md:rounded-[2.5rem] p-4 md:p-5 text-white shadow-2xl shadow-[#028A0F]/20 relative overflow-hidden group"
            >
                {/* Abstract Glass decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-[#028A0F]/10 rounded-full -mr-24 md:-mr-32 -mt-24 md:-mt-32 blur-3xl group-hover:bg-[#028A0F]/20 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-sky-500/5 rounded-full -ml-12 md:-ml-16 -mb-12 md:-mb-16 blur-2xl"></div>

                <div className="relative z-10 space-y-5 md:space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                                <Wallet size={16} md:size={18} className="text-white" />
                            </div>
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/60">Tactical pay</span>
                        </div>
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                            alt="visa"
                            className="h-2.5 md:h-3 opacity-30 invert"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                        <div>
                            <p className="text-white/60 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1 md:mb-1.5 ">Available liquidity</p>
                            <div className="flex items-baseline gap-1 md:gap-1.5">
                                <span className="text-xl md:text-2xl font-bold text-white tracking-tight">₹</span>
                                <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
                                    {stats?.walletBalance?.toFixed(2) || '0.00'}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={handlePayout}
                            className="bg-white text-[#028A0F] px-5 py-2 md:px-7 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl shadow-black/10 active:scale-95 group/btn overflow-hidden relative"
                        >
                            <span className="relative z-10 flex items-center gap-1.5 md:gap-2">
                                <CreditCard size={12} md:size={14} />
                                Instant payout
                            </span>
                            <div className="absolute inset-0 bg-[#028A0F]/5 translate-y-full group-hover/btn:translate-y-0 transition-transform"></div>
                        </button>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Lifetime</p>
                                <p className="text-xs font-bold text-white tracking-widest">₹{stats?.totalEarnings?.toFixed(0) || '0'}</p>
                            </div>
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Rider ID</p>
                                <p className="text-xs font-bold text-white tracking-widest">{profile?.uniqueId || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 border border-white/5 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <ArrowUpRight size={18} className="text-slate-500" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats Grid - High Density */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white dark:bg-zinc-900 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-1 md:gap-1.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Today p&l</p>
                    <h4 className="text-base md:text-lg font-black text-slate-800 dark:text-zinc-100">₹{stats?.todayEarnings || '0'}</h4>
                    <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-500 mt-0.5 md:mt-1">
                        <TrendingUp size={10} />
                        <span>+12.5%</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-1 md:gap-1.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Duty missions</p>
                    <h4 className="text-base md:text-lg font-black text-slate-800 dark:text-zinc-100">{stats?.todayDeliveries || '0'}</h4>
                    <p className="text-[8px] font-bold text-slate-400 mt-0.5 md:mt-1">Successful</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-1 md:gap-1.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Total ops</p>
                    <h4 className="text-base md:text-lg font-black text-slate-800 dark:text-zinc-100">128</h4>
                    <p className="text-[8px] font-bold text-slate-400 mt-0.5 md:mt-1">Cumulative</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-1 md:gap-1.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Uptime</p>
                    <h4 className="text-base md:text-lg font-black text-slate-800 dark:text-zinc-100">98.2%</h4>
                    <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-500 mt-0.5 md:mt-1">
                        <Check size={10} />
                        <span>Elite rating</span>
                    </div>
                </div>
            </div>

            {/* Transactions Section - Tighter List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 italic">Financial flow</h3>
                    <button
                        onClick={handleExport}
                        className="text-[10px] font-black text-[#028A0F] uppercase tracking-widest hover:underline transition-all flex items-center gap-1.5"
                    >
                        <FileDown size={12} />
                        Export report
                    </button>
                </div>

                <div className="space-y-2 md:space-y-3">
                    {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <div
                                key={tx._id}
                                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl md:rounded-3xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer group"
                            >
                                <div
                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'credit'
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'
                                        : 'bg-red-50 dark:bg-red-500/10 text-red-600'
                                        }`}
                                >
                                    {tx.type === 'credit' ? <ArrowDownLeft size={18} md:size={20} /> : <ArrowUpRight size={18} md:size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-bold text-slate-900 dark:text-white uppercase text-xs md:text-sm truncate">
                                        {tx.category.replace('_', ' ')}
                                    </h5>
                                    <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <h5
                                        className={`font-black text-sm md:text-base ${tx.type === 'credit'
                                            ? 'text-emerald-500'
                                            : 'text-slate-900 dark:text-white'
                                            }`}
                                    >
                                        {tx.type === 'credit' ? '+' : '-'}
                                        {tx.amount}
                                    </h5>
                                    <p
                                        className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${tx.status === 'completed' ? 'text-emerald-400' : 'text-orange-400'
                                            }`}
                                    >
                                        {tx.status}
                                    </p>
                                </div>
                                <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity pl-1">
                                    <ChevronRight size={16} className="text-slate-300" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-xs font-bold uppercase tracking-[0.3em] text-slate-300">
                            Transaction log empty
                        </div>
                    )}
                </div>
                {transactions.length > 0 && (
                    <button className="w-full mt-4 md:mt-6 py-3 md:py-4 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl md:rounded-2xl text-slate-400 font-bold text-xs tracking-widest uppercase hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all">
                        Load more
                    </button>
                )}
            </div>
        </div>
    );
};

export default WalletPage;

