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
    History
} from 'lucide-react';
import { useAuth } from '../../user/context/AuthContext';
import useDelivery from '../hooks/useDelivery';

const WalletPage = () => {
    const { token } = useAuth();
    const { stats, wallet, transactions, loading } = useDelivery(token);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount || 0);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header - Compact */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-zinc-100">Wallet</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Fleet Financial Control</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm active:scale-95 transition-all">
                        <HelpCircle size={18} className="text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Virtual Wallet Card - Slim & Premium */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 rounded-[2.5rem] p-7 text-white shadow-2xl shadow-black/20 relative overflow-hidden group"
            >
                {/* Abstract Glass decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-lime-600/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-lime-600/20 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>

                <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-lime-500/20 flex items-center justify-center backdrop-blur-md border border-lime-500/20">
                                <Wallet size={18} className="text-lime-500" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Tactical Pay</span>
                        </div>
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                            alt="visa"
                            className="h-3 opacity-30 invert"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-80">Available Liquidity</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-bold text-lime-500 tracking-tight">₹</span>
                                <h2 className="text-5xl font-black tracking-tighter">
                                    {stats?.walletBalance?.toFixed(2) || '0.00'}
                                </h2>
                            </div>
                        </div>
                        <button className="bg-lime-500 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-lime-600 transition-all shadow-xl shadow-lime-500/20 active:scale-95 group/btn overflow-hidden relative">
                            <span className="relative z-10 flex items-center gap-2">
                                <CreditCard size={14} />
                                Instant Payout
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform"></div>
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
                                <p className="text-xs font-bold text-white tracking-widest">SG-R23</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 border border-white/5 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <ArrowUpRight size={18} className="text-slate-500" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats Grid - High Density */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-1.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Today P&L</p>
                    <h4 className="text-lg font-black text-slate-800 dark:text-zinc-100">₹{stats?.todayEarnings || '0'}</h4>
                    <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-500 mt-1">
                        <TrendingUp size={10} />
                        <span>+12.5%</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-1.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Duty Missions</p>
                    <h4 className="text-lg font-black text-slate-800 dark:text-zinc-100">{stats?.todayDeliveries || '0'}</h4>
                    <p className="text-[8px] font-bold text-slate-400 mt-1">SUCCESSFUL</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-1.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Total Ops</p>
                    <h4 className="text-lg font-black text-slate-800 dark:text-zinc-100">128</h4>
                    <p className="text-[8px] font-bold text-slate-400 mt-1">CUMULATIVE</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-1.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Uptime</p>
                    <h4 className="text-lg font-black text-slate-800 dark:text-zinc-100">98.2%</h4>
                    <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-500 mt-1">
                        <Check size={10} />
                        <span>ELITE RATING</span>
                    </div>
                </div>
            </div>

            {/* Transactions Section - Tighter List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 italic">Financial Flow</h3>
                    <button className="text-[10px] font-black text-lime-600 uppercase tracking-widest hover:underline transition-all">Export Report</button>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden">
                    {transactions.length > 0 ? (
                        <div className="divide-y divide-slate-50 dark:divide-zinc-800/40">
                            {transactions.map((t, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={t._id}
                                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 ${t.type === 'credit'
                                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/10'
                                            : 'bg-red-50 dark:bg-red-500/10 text-red-600 border-red-100 dark:border-red-500/10'
                                            }`}>
                                            {t.type === 'credit' ? <ArrowUpRight size={18} /> : <CreditCard size={18} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-slate-800 dark:text-zinc-100 leading-tight truncate">{t.description}</p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                                                {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-black text-base ${t.type === 'credit' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                                            {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                                        </p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">Confirmed</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-zinc-700">
                                <History size={32} className="text-slate-200" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Transaction log empty</p>
                        </div>
                    )}
                </div>
                {transactions.length > 0 && (
                    <button className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400 font-bold text-sm tracking-widest uppercase hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all">
                        Load More Transactions
                    </button>
                )}
            </div>
        </div>
    );
};

export default WalletPage;

