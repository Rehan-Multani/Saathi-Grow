import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, X, AlertCircle } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { formatCurrency } from '../utils/formatDate';

const Earnings = () => {
    const { stats } = useVendor();
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [upiId, setUpiId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Transactions
    const transactions = [
        { id: 1, text: 'Order #ORD-003 Payout', date: 'Today, 10:30 AM', amount: 450, type: 'credit' },
        { id: 2, text: 'Platform Commission (10%)', date: 'Today, 10:30 AM', amount: 45, type: 'debit' },
        { id: 3, text: 'Order #ORD-001 Payout', date: 'Yesterday, 4:15 PM', amount: 154, type: 'credit' },
        { id: 4, text: 'Weekly Settlement', date: 'Feb 18, 2024', amount: 15000, type: 'payout' },
    ];

    const handleWithdraw = (e) => {
        e.preventDefault();
        if (!withdrawAmount || !upiId) return;

        setIsSubmitting(true);

        // Simulating API call
        setTimeout(() => {
            setIsSubmitting(false);
            setShowWithdrawModal(false);

            // Show Success Toast
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 z-50 animate-in slide-in-from-bottom-5';
            toast.innerHTML = `<span class="text-green-400">✓</span> <span class="text-sm font-medium">Withdrawal request of ₹${withdrawAmount} submitted successfully!</span>`;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('animate-out', 'fade-out');
                setTimeout(() => toast.remove(), 300);
            }, 3000);

            setWithdrawAmount('');
            setUpiId('');
        }, 1500);
    };

    return (
        <div>
            <h1 className="text-lg font-bold text-gray-900 mb-6">Earnings & Payouts</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Total Balance Card */}
                <div className="bg-gradient-to-br from-[#0c831f] to-[#085d16] rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Wallet size={24} />
                        </div>
                        <span className="text-sm font-medium text-green-100">Available Balance</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-1">{formatCurrency(stats.earnings)}</h2>
                    <p className="text-xs text-green-100 opacity-80 mb-6">Next payout scheduled for Tomorrow</p>

                    <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="w-full bg-white text-green-700 py-2.5 rounded-lg text-sm font-bold hover:bg-green-50 transition-colors shadow-sm"
                    >
                        Withdraw Now
                    </button>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="text-sm font-bold text-gray-800 mb-4">Performance</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-green-100 text-green-700 rounded"><TrendingUp size={16} /></div>
                                <span className="text-sm text-gray-600">Total Sales</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(15400)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-red-100 text-red-700 rounded"><TrendingDown size={16} /></div>
                                <span className="text-sm text-gray-600">Returns</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Transactions</h3>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="p-4">Description</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-full ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : tx.type === 'debit' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                <ArrowUpRight size={14} className={tx.type === 'debit' ? 'rotate-180' : ''} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{tx.text}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-gray-500">{tx.date}</td>
                                    <td className={`p-4 text-right text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : tx.type === 'debit' ? 'text-red-600' : 'text-gray-900'}`}>
                                        {tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
                {transactions.map((tx) => (
                    <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : tx.type === 'debit' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <ArrowUpRight size={16} className={tx.type === 'debit' ? 'rotate-180' : ''} />
                                </div>
                                <span className="text-sm font-bold text-gray-800">{tx.text}</span>
                            </div>
                            <span className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : tx.type === 'debit' ? 'text-red-600' : 'text-gray-900'}`}>
                                {tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount)}
                            </span>
                        </div>
                        <div className="flex justify-end">
                            <span className="text-xs text-gray-400">{tx.date}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWithdrawModal(false)}></div>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Withdraw Funds</h3>
                            <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleWithdraw} className="p-6 space-y-4">
                            <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3">
                                <AlertCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-green-800">Available Balance: {formatCurrency(stats.earnings)}</p>
                                    <p className="text-xs text-green-600 mt-1">Minimum withdrawal amount is ₹500.</p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700">Amount to Withdraw</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none font-bold text-gray-900"
                                        required
                                        min="500"
                                        max={stats.earnings}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700">UPI ID / Bank Account</label>
                                <input
                                    type="text"
                                    placeholder="Enter UPI ID (e.g. mobile@upi)"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 mt-2 bg-[#0c831f] text-white font-bold rounded-lg hover:bg-[#0a6b19] transition-colors flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>Withdraw Funds <ArrowUpRight size={18} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Earnings;
