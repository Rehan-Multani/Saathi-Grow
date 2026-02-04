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
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 pt-6 pb-24">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => {
                            const from = location.state?.from || '/profile';
                            navigate(from);
                        }}
                        className="p-1.5 bg-white dark:bg-[#141414] rounded-full shadow-sm"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="!text-[14px] font-black text-gray-900 dark:text-gray-100 leading-none tracking-tight">SaathiGro Wallet</h1>
                        <p className="!text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage your balance</p>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="bg-gradient-to-br from-[#0c831f] to-[#086317] rounded-[32px] p-6 text-white mb-8 shadow-xl shadow-green-500/10 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="!text-[9px] font-bold uppercase tracking-[2px] opacity-80 mb-2">Total Balance</p>
                        <h2 className="!text-[32px] font-black mb-6 leading-none tracking-tighter">₹{balance.toFixed(2)}</h2>

                        <div className="flex gap-3">
                            <button className="flex-1 bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center gap-2 py-3 rounded-2xl !text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all">
                                <Plus size={14} strokeWidth={3} />
                                Add Money
                            </button>
                            <button className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center rounded-2xl active:scale-95 transition-all">
                                <History size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-white dark:bg-[#141414] p-4 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-3">
                            <TrendingUp size={16} />
                        </div>
                        <p className="!text-[8px] text-gray-400 font-bold uppercase tracking-wider">Spent this month</p>
                        <p className="!text-[15px] font-black text-gray-900 dark:text-gray-100">₹1,240.00</p>
                    </div>
                    <div className="bg-white dark:bg-[#141414] p-4 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="w-8 h-8 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 mb-3">
                            <ShieldCheck size={16} />
                        </div>
                        <p className="!text-[8px] text-gray-400 font-bold uppercase tracking-wider">Saathi Points</p>
                        <p className="!text-[15px] font-black text-gray-900 dark:text-gray-100">452 pts</p>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="!text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Recent Transactions</h3>
                        <button className="!text-[9px] font-black text-[#0c831f] uppercase tracking-wider">See All</button>
                    </div>

                    <div className="space-y-2">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="bg-white dark:bg-[#141414] p-3.5 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm active:bg-gray-50 dark:active:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === 'credited' ? 'bg-green-50 text-green-500 dark:bg-green-500/10' : 'bg-gray-50 text-gray-500 dark:bg-white/5'}`}>
                                        {tx.type === 'credited' ? <Plus size={16} /> : <CreditCard size={16} />}
                                    </div>
                                    <div>
                                        <h4 className="!text-[11px] font-black text-gray-800 dark:text-gray-100 leading-none mb-1.5">{tx.title}</h4>
                                        <p className="!text-[8.5px] text-gray-400 font-medium">{tx.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`!text-[12px] font-black ${tx.type === 'credited' ? 'text-green-500' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {tx.type === 'credited' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                    </p>
                                    <p className="!text-[7px] font-black uppercase tracking-tighter opacity-50">{tx.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Message */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20 text-center">
                    <p className="!text-[9.5px] text-blue-700 dark:text-blue-400 font-bold leading-relaxed">
                        Your wallet funds are 100% secure with end-to-end encryption. 🛡️
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
