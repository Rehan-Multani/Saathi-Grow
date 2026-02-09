import React, { useState } from 'react';
import { CreditCard, Download, ArrowUpRight, Filter, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/formatDate';

const WalletHistory = () => {
    const [filterType, setFilterType] = useState('all');
    const [dateRange, setDateRange] = useState('thisMonth');

    // Mock transaction data
    const transactions = [
        { id: 1, type: 'credit', description: 'Order #ORD-005 Payment', amount: 1250, date: '2024-02-09 11:30 AM', status: 'completed', balance: 18750 },
        { id: 2, type: 'debit', description: 'Platform Commission (10%)', amount: 125, date: '2024-02-09 11:30 AM', status: 'completed', balance: 17500 },
        { id: 3, type: 'credit', description: 'Order #ORD-004 Payment', amount: 890, date: '2024-02-08 04:15 PM', status: 'completed', balance: 17625 },
        { id: 4, type: 'debit', description: 'Withdrawal to Bank', amount: 5000, date: '2024-02-07 02:20 PM', status: 'completed', balance: 16735 },
        { id: 5, type: 'credit', description: 'Order #ORD-003 Payment', amount: 2340, date: '2024-02-07 10:45 AM', status: 'completed', balance: 21735 },
        { id: 6, type: 'debit', description: 'Platform Commission (10%)', amount: 234, date: '2024-02-07 10:45 AM', status: 'completed', balance: 19395 },
        { id: 7, type: 'pending', description: 'Order #ORD-006 Payment', amount: 1500, date: '2024-02-09 03:00 PM', status: 'pending', balance: 18750 },
        { id: 8, type: 'credit', description: 'Refund Reversal', amount: 450, date: '2024-02-06 09:30 AM', status: 'completed', balance: 19629 },
    ];

    const filteredTransactions = transactions.filter(t => {
        if (filterType === 'all') return true;
        return t.type === filterType;
    });

    const currentBalance = 18750;
    const totalCredits = transactions.filter(t => t.type === 'credit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = transactions.filter(t => t.type === 'debit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
    const pendingAmount = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Wallet History</h1>
                    <p className="text-sm text-gray-500">Track all your financial transactions</p>
                </div>
                <button className="px-4 py-2 bg-[#0c831f] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#0a6b19] transition-colors">
                    <Download size={16} />
                    Export CSV
                </button>
            </div>

            {/* Balance Card */}
            <div className="premium-card overflow-hidden">
                <div className="bg-gradient-to-br from-[#0c831f] to-[#085d16] p-6 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-white/20 rounded-lg">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-100">Current Balance</p>
                            <h2 className="text-3xl font-bold">{formatCurrency(currentBalance)}</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                        <div>
                            <p className="text-xs text-green-100">Total Credits</p>
                            <p className="text-lg font-bold">{formatCurrency(totalCredits)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-green-100">Total Debits</p>
                            <p className="text-lg font-bold">{formatCurrency(totalDebits)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-green-100">Pending</p>
                            <p className="text-lg font-bold">{formatCurrency(pendingAmount)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="premium-card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm font-medium"
                    >
                        <option value="today">Today</option>
                        <option value="thisWeek">This Week</option>
                        <option value="thisMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="custom">Custom Range</option>
                    </select>
                    <div className="flex gap-2">
                        {['all', 'credit', 'debit', 'pending'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize border transition-colors ${filterType === type
                                        ? 'bg-[#0c831f] text-white border-[#0c831f]'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="premium-card overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-900">Transaction History</h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {filteredTransactions.map(transaction => (
                        <div key={transaction.id} className="p-5 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`p-3 rounded-lg ${transaction.type === 'credit' ? 'bg-green-50 text-green-600' :
                                            transaction.type === 'debit' ? 'bg-red-50 text-red-600' :
                                                'bg-yellow-50 text-yellow-600'
                                        }`}>
                                        <ArrowUpRight
                                            size={20}
                                            className={transaction.type === 'debit' ? 'rotate-180' : ''}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">{transaction.description}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{transaction.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-base font-bold ${transaction.type === 'credit' ? 'text-green-600' :
                                            transaction.type === 'debit' ? 'text-red-600' :
                                                'text-yellow-600'
                                        }`}>
                                        {transaction.type === 'debit' ? '-' : '+'}{formatCurrency(transaction.amount)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Balance: {formatCurrency(transaction.balance)}
                                    </p>
                                </div>
                                {transaction.status === 'pending' && (
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">
                                        Pending
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WalletHistory;
