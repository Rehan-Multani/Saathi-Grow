import React, { useState } from 'react';
import { Wallet, ArrowLeft, Plus, TrendingUp, History, ChevronRight, CreditCard, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const WalletPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [balance] = useState(450.00);

    const transactions = [
        { id: 1, type: 'debited', amount: 85.00, title: 'Order #3421', date: 'Today, 2:30 PM', status: 'Success' },
        { id: 2, type: 'credited', amount: 500.00, title: 'Money Added', date: 'Yesterday', status: 'Success' },
        { id: 3, type: 'debited', amount: 120.50, title: 'Order #3109', date: '2 days ago', status: 'Success' },
        { id: 4, type: 'credited', amount: 50.00, title: 'Refund #892', date: '3 days ago', status: 'Success' },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black p-0 pt-6 pb-24 md:p-8 md:pb-8">
            <div className="max-w-2xl md:max-w-6xl mx-auto">
                {/* Clean Header */}
                <div className="flex items-center gap-3 mb-6 md:mb-10 px-4 md:px-0">
                    <button
                        onClick={() => {
                            const from = location.state?.from || '/profile';
                            navigate(from);
                        }}
                        className="p-1.5 md:p-2 bg-gray-50 dark:bg-white/5 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={16} className="md:w-6 md:h-6" />
                    </button>
                    <div>
                        <h1 className="!text-[13px] md:!text-3xl font-black text-gray-900 dark:text-gray-100 leading-none tracking-tight">Payments & Wallet</h1>
                    </div>
                </div>

                {/* Flat Balance Section */}
                <div className="px-5 py-8 bg-gray-50 dark:bg-white/5 mb-6 md:bg-white dark:md:bg-[#141414] md:rounded-2xl md:border md:border-gray-100 dark:md:border-white/5 md:p-6">
                    <div className="flex flex-col items-center justify-center">
                        <span className="!text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Balance</span>
                        <h2 className="!text-[28px] font-black text-gray-900 dark:text-white leading-none tracking-tighter mb-6">₹{balance.toFixed(2)}</h2>

                        <div className="flex gap-4 w-full max-w-[280px]">
                            <button
                                onClick={() => navigate('/wallet/add-money')}
                                className="flex-1 bg-[#0c831f] text-white flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-full !text-[11px] md:!text-sm font-black uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-green-500/20 hover:bg-[#0a6b19]">
                                <Plus size={14} strokeWidth={3} />
                                Add Money
                            </button>
                            <button className="w-10 h-10 md:w-12 md:h-12 border border-gray-200 dark:border-white/10 flex items-center justify-center rounded-full active:scale-95 transition-all">
                                <History size={16} className="text-gray-600 dark:text-gray-400 md:w-6 md:h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid - Subtle & Flat */}
                <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-white/5 border-y border-gray-100 dark:border-white/5 mb-8">
                    <div className="py-4 flex flex-col items-center">
                        <p className="!text-[8px] md:!text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Spent this month</p>
                        <p className="!text-[13px] md:!text-xl font-black text-gray-900 dark:text-gray-100">₹1,240.00</p>
                    </div>
                    <div className="py-4 flex flex-col items-center">
                        <p className="!text-[8px] md:!text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Saathi Points</p>
                        <p className="!text-[13px] md:!text-xl font-black text-gray-900 dark:text-gray-100">452 pts</p>
                    </div>
                </div>

                {/* Transaction List - Zero Background, Just List */}
                <div className="px-4 md:px-0">
                    <div className="flex items-center justify-between mb-4 md:mb-6 px-1 md:px-0">
                        <h3 className="!text-[10px] md:!text-sm font-black text-gray-400 uppercase tracking-widest">Transaction History</h3>
                        <button className="!text-[8px] md:!text-xs font-black text-[#0c831f] uppercase tracking-wider px-2 py-1 bg-green-50 dark:bg-green-500/10 rounded">All</button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 md:gap-6 transition-all">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="w-full py-4 px-4 flex items-center justify-between active:scale-[0.98] transition-all bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${tx.type === 'credited' ? 'bg-green-50 text-green-500 dark:bg-green-500/10' : 'bg-gray-50 text-gray-400 dark:bg-white/5'}`}>
                                        {tx.type === 'credited' ? <TrendingUp size={14} className="md:w-5 md:h-5" /> : <CreditCard size={14} className="md:w-5 md:h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="!text-[10.5px] md:!text-base font-black text-gray-800 dark:text-gray-100 leading-none mb-1">{tx.title}</h4>
                                        <p className="!text-[8px] md:!text-xs text-gray-400 font-medium tracking-tight">{tx.date}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className={`!text-[11px] md:!text-lg font-black ${tx.type === 'credited' ? 'text-green-500' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {tx.type === 'credited' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                    </p>
                                    <span className="!text-[7px] md:!text-[10px] font-black text-white px-1 py-0.5 md:px-1.5 md:py-0.5 bg-[#0c831f] rounded uppercase tracking-tighter leading-none mt-1">Success</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Security Section */}
                <div className="mt-12 md:mt-8 px-6 md:px-0 py-8 md:py-0 md:border md:border-gray-100 dark:md:border-white/5 md:rounded-2xl md:bg-white dark:md:bg-[#141414] md:p-6 flex flex-col items-center">
                    <ShieldCheck size={20} className="text-[#0c831f] opacity-30 mb-2" />
                    <p className="!text-[9px] md:!text-sm text-gray-400 font-bold text-center leading-relaxed max-w-[200px] md:max-w-none">
                        SaathiGro uses bank-grade security for all your transactions.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;

