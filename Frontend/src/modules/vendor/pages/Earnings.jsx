import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { formatCurrency } from '../utils/formatDate';

const Earnings = () => {
    const { walletData, earningsStats, stats, refreshProfile, fetchWalletData } = useVendor();
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [upiId, setUpiId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const transactions = walletData.transactions || [];

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
            toast.innerHTML = `<span class="text-green-400">₹</span> <span class="text-sm font-medium">Withdrawal request of ₹${withdrawAmount} submitted successfully!</span>`;
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
        <div className="space-y-4 lg:space-y-5">
            <h1 className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight">Earnings & Payouts</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 mb-6 lg:mb-6">
                {/* Total Balance Card */}
                <div className="bg-gradient-to-br from-[#0c831f] to-[#085d16] rounded-xl p-4 lg:p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-3 lg:mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Wallet size={20} />
                        </div>
                        <span className="text-sm font-medium text-green-100">Available Balance</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold mb-1">{formatCurrency(walletData.balance)}</h2>
                    <p className="text-xs text-green-100 opacity-80 mb-6">Total Lifetime Earnings: {formatCurrency(walletData.totalEarnings)}</p>

                    <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="w-full bg-white text-green-700 py-2.5 rounded-lg text-sm font-bold hover:bg-green-50 transition-colors shadow-sm"
                    >
                        Withdraw Now
                    </button>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-5">
                    <h3 className="text-sm font-bold text-gray-800 mb-3 lg:mb-4">Performance</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-green-100 text-green-700 rounded"><TrendingUp size={16} /></div>
                                <span className="text-sm text-gray-600">Total Sales</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(earningsStats.totalSales)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-red-100 text-red-700 rounded"><TrendingDown size={16} /></div>
                                <span className="text-sm text-gray-600">Returns</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(earningsStats.totalReturns)}</span>
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
                            {currentTransactions.map((tx) => (
                                <tr key={tx._id} className="hover:bg-gray-50">
                                    <td className="p-3 lg:p-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-full ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : tx.type === 'debit' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                <ArrowUpRight size={14} className={tx.type === 'debit' ? 'rotate-180' : ''} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{tx.description}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</td>
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
                {currentTransactions.map((tx) => (
                    <div key={tx._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full flex-shrink-0 ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : tx.type === 'debit' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <ArrowUpRight size={16} className={tx.type === 'debit' ? 'rotate-180' : ''} />
                                </div>
                                <span className="text-sm font-bold text-gray-800">{tx.description}</span>
                            </div>
                            <span className={`text-sm font-bold whitespace-nowrap ${tx.type === 'credit' ? 'text-green-600' : tx.type === 'debit' ? 'text-red-600' : 'text-gray-900'}`}>
                                {tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount)}
                            </span>
                        </div>
                        <div className="flex justify-end">
                            <span className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {true && (
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 gap-3 mt-4">
                    <span className="text-xs text-gray-500 font-medium">
                        Showing {transactions.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, transactions.length)} of {transactions.length} entries
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-hide">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-1.5 rounded-lg border transition-all ${currentPage === 1 ? 'border-transparent text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95'}`}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages || 1 }).map((_, i) => {
                                const pageNumber = i + 1;
                                if (
                                    pageNumber === 1 ||
                                    pageNumber === (totalPages || 1) ||
                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => paginate(pageNumber)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === pageNumber
                                                    ? 'bg-[#0c831f] text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                } else if (
                                    pageNumber === currentPage - 2 ||
                                    pageNumber === currentPage + 2
                                ) {
                                    return <span key={pageNumber} className="text-gray-400 text-xs px-1">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`p-1.5 rounded-lg border transition-all ${currentPage === totalPages || totalPages === 0 ? 'border-transparent text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95'}`}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

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
                                    <p className="text-sm font-bold text-green-800">Available Balance: {formatCurrency(walletData.balance)}</p>
                                    <p className="text-xs text-green-600 mt-1">Minimum withdrawal amount is ₹500. Payouts are settled offline by Admin.</p>
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
                                        max={walletData.balance}
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
