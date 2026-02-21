import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet as WalletIcon,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    CreditCard,
    DollarSign,
    ChevronRight,
    Search,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../user/context/AuthContext';
import useDelivery from '../hooks/useDelivery';

const WalletPage = () => {
    const { token } = useAuth();
    const { wallet, transactions, loading } = useDelivery(token);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount || 0);
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">My Wallet</h1>
                    <p className="text-slate-500 font-medium">Manage your earnings and payouts</p>
                </div>
                {loading && <Loader2 className="animate-spin text-pink-500" size={24} />}
            </div>

            {/* Wallet Header Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-zinc-900 rounded-[3rem] p-10 text-white overflow-hidden shadow-2xl shadow-black/30"
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-pink-600/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[60px] -ml-20 -mb-20"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Available Balance</p>
                                <h2 className="text-6xl font-black tracking-tighter">
                                    {wallet?.balance?.toFixed(0) || '0'}
                                    <span className="text-2xl text-slate-500">.{(wallet?.balance % 1).toFixed(2).substring(2) || '00'}</span>
                                </h2>
                            </div>
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 text-pink-500">
                                <WalletIcon size={28} />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-red-600 rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg shadow-pink-500/20 active:scale-95 transition-all">
                                Request Payout
                            </button>
                            <button className="flex-1 py-4 bg-white/10 backdrop-blur-md rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-white/20 transition-all border border-white/10">
                                Add Details
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                            <TrendingUp size={24} />
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Earned</p>
                        <h4 className="text-3xl font-black">{formatCurrency(wallet?.totalEarnings)}</h4>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 dark:bg-emerald-500/5 px-3 py-1 rounded-full w-fit">
                            <ArrowUpRight size={12} />
                            Lifetime Earnings
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
                        <div className="w-12 h-12 bg-pink-50 dark:bg-pink-500/10 text-pink-500 rounded-2xl flex items-center justify-center mb-6">
                            <CreditCard size={24} />
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Pending Payouts</p>
                        <h4 className="text-3xl font-black">{formatCurrency(wallet?.pendingPayout)}</h4>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-zinc-800 px-3 py-1 rounded-full w-fit">
                            Processing
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-100 dark:border-zinc-800 p-8">
                <div className="flex items-center justify-between mb-8">
                    <h4 className="text-xl font-black tracking-tight">Recent Transactions</h4>
                    <div className="p-2 bg-slate-50 dark:bg-zinc-800 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <Search size={20} className="text-slate-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    {transactions.length > 0 ? transactions.map((tx) => (
                        <div key={tx._id} className="flex items-center gap-4 p-5 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer group">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-red-50 dark:bg-red-500/10 text-red-600'}`}>
                                {tx.type === 'credit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                            </div>
                            <div className="flex-1">
                                <h5 className="font-bold text-slate-900 dark:text-white uppercase text-sm mb-1">{tx.category.replace('_', ' ')}</h5>
                                <p className="text-xs text-slate-500 font-medium">
                                    {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <h5 className={`font-black text-lg ${tx.type === 'credit' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                                    {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                                </h5>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${tx.status === 'completed' ? 'text-emerald-400' : 'text-orange-400'}`}>
                                    {tx.status}
                                </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                                <ChevronRight size={18} className="text-slate-300" />
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-300 opacity-50">
                            <WalletIcon size={64} className="mb-4" />
                            <p className="text-xl font-bold">No transactions yet</p>
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
