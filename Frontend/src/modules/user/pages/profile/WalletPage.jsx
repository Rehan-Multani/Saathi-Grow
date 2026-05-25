import React, { useState, useEffect } from 'react';
import { Wallet, ArrowLeft, Plus, TrendingUp, History, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as walletApi from '../../api/walletApi';

const WalletPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWallet = async () => {
            if (token) {
                try {
                    const data = await walletApi.fetchWalletData(token);
                    setBalance(data.balance);
                    setTransactions(data.transactions);
                } catch (err) {
                    console.error('Wallet fetch failed:', err);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadWallet();
    }, [token]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <Loader2 className="animate-spin text-[#0c831f]" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-black p-0 pt-0 pb-24 md:p-8 md:pb-8 transition-colors duration-300">
            <div className="max-w-2xl md:max-w-6xl mx-auto">
                {/* Header - Sticky & Blurred */}
                <div className="flex items-center gap-3 mb-2 md:mb-10 px-4 py-8 md:p-0 border-b border-gray-100 dark:border-white/5 md:border-none bg-white/80 dark:bg-black/80 backdrop-blur-lg sticky top-0 z-50 md:relative">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 bg-gray-50 dark:bg-white/5 rounded-full hover:bg-gray-100 transition-all active:scale-95"
                    >
                        <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400 md:w-6 md:h-6" />
                    </button>
                    <div>
                        <h1 className="text-[18px] md:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-1">My Wallet</h1>
                        <p className="hidden md:block text-[11px] text-gray-400 font-bold uppercase tracking-widest">Manage your digital balance</p>
                    </div>
                </div>

                <div className="px-6 py-12 bg-transparent md:bg-gray-50 dark:md:bg-white/5 mb-0 md:mb-6 md:bg-white dark:md:bg-[#141414] md:rounded-2xl md:border md:border-gray-100 dark:md:border-white/5 md:p-10 text-center mt-6">
                    <div className="flex flex-col items-center justify-center">
                        <span className="!text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Balance</span>
                        <h2 className="!text-[36px] md:!text-[28px] font-black text-gray-900 dark:text-white leading-none tracking-tighter mb-4">{formatCurrency(balance)}</h2>

                        <div className="flex gap-4 w-full max-w-[280px]">
                            <button
                                onClick={() => navigate('/wallet/add-money')}
                                className="flex-1 bg-[#0c831f] text-white flex items-center justify-center gap-2 py-3.5 md:py-3.5 rounded-full !text-[12px] md:!text-sm font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-green-500/20 hover:bg-[#0a6b19]">
                                <Plus size={16} strokeWidth={3} />
                                Add Money
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-0 md:px-0">
                    <div className="flex items-center justify-between mb-4 md:mb-6 px-6 md:px-0">
                        <h3 className="!text-[11px] md:!text-sm font-black text-gray-400 uppercase tracking-widest">Transaction History</h3>
                        <button className="!text-[9px] md:!text-xs font-black text-[#0c831f] uppercase tracking-wider px-2 py-1 bg-green-50 dark:bg-green-500/10 rounded">All</button>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="text-center py-20 px-6 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl mx-6 md:mx-0">
                            <Wallet className="mx-auto text-gray-200 dark:text-white/5 mb-4" size={48} />
                            <p className="text-gray-400 font-bold uppercase tracking-tight text-xs">No transactions yet!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-white/5 md:divide-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 md:gap-4 transition-all">
                            {transactions.map((tx) => (
                                <div key={tx._id} className="w-full py-4 px-6 md:py-5 md:px-5 flex items-center justify-between gap-3 active:bg-gray-50/50 transition-all bg-transparent md:bg-white dark:md:bg-[#141414] border-none md:border md:border-gray-100 dark:md:border-white/5 shadow-none md:shadow-sm md:rounded-2xl">
                                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                        <div className={`w-10 h-10 md:w-11 md:h-11 flex-shrink-0 rounded-full flex items-center justify-center shadow-sm ${tx.type === 'credit' ? 'bg-green-50 text-green-500 dark:bg-green-900/20' : 'bg-red-50 text-red-500 dark:bg-red-900/20'}`}>
                                            {tx.type === 'credit' ? <TrendingUp size={18} /> : <CreditCard size={18} />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="!text-[12px] md:!text-[14px] font-black text-gray-800 dark:text-gray-100 leading-snug mb-0.5 line-clamp-2 md:line-clamp-none pr-1">{tx.description}</h4>
                                            <p className="!text-[9px] md:!text-[10px] text-gray-400 font-bold tracking-widest uppercase opacity-80">{formatDate(tx.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end flex-shrink-0">
                                        <p className={`!text-[14px] md:!text-lg font-black ${tx.type === 'credit' ? 'text-[#0c831f]' : 'text-gray-900 dark:text-gray-100'}`}>
                                            {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </p>
                                        <span className={`!text-[8px] md:!text-[9px] font-black text-white px-2 py-0.5 rounded uppercase tracking-tighter leading-none mt-1.5 ${tx.status === 'completed' ? 'bg-[#0c831f]' : 'bg-orange-500'}`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-12 mb-10 px-6 md:px-0 flex flex-col items-center">
                    <ShieldCheck size={28} className="text-[#0c831f] opacity-20 mb-3" />
                    <p className="!text-[10px] md:!text-sm text-gray-400 font-bold text-center leading-relaxed tracking-tight max-w-[280px] md:max-w-none uppercase">
                        sathiGro uses bank-grade security for all your transactions.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;


