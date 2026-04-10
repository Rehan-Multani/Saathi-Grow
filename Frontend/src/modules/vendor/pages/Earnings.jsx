import React, { useState, useEffect, useCallback } from 'react';
import {
    Wallet, TrendingUp, TrendingDown, ArrowUpRight, X, AlertCircle,
    ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle, Send,
    Building2, Pencil, Trash2, Plus, CreditCard, ShieldCheck
} from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { formatCurrency } from '../../../common/utils/formatUtils';
import * as vendorWalletApi from '../api/vendorWalletApi';
import { toast } from 'react-toastify';

// ── Helpers ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    Pending:    { color: 'bg-yellow-100 text-yellow-700', icon: Clock,         label: 'Pending' },
    Processing: { color: 'bg-blue-100   text-blue-700',   icon: Clock,         label: 'Processing' },
    Paid:       { color: 'bg-green-100  text-green-700',  icon: CheckCircle2,  label: 'Paid' },
    Rejected:   { color: 'bg-red-100    text-red-700',    icon: XCircle,       label: 'Rejected' },
    Failed:     { color: 'bg-gray-100   text-gray-600',   icon: XCircle,       label: 'Failed' },
};

const TABS = ['transactions', 'withdrawals', 'bank-account'];

function Paginator({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-center gap-1.5 mt-4">
            <button onClick={() => onChange(page - 1)} disabled={page === 1}
                className={`p-1.5 rounded border text-gray-600 ${page === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                <ChevronLeft size={16} />
            </button>
            {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                if (p === 1 || p === totalPages || Math.abs(page - p) <= 1) {
                    return (
                        <button key={p} onClick={() => onChange(p)}
                            className={`w-8 h-8 text-xs rounded font-medium ${page === p ? 'bg-[#0c831f] text-white' : 'border text-gray-600 hover:bg-gray-50'}`}>
                            {p}
                        </button>
                    );
                } else if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="text-gray-400 text-xs">…</span>;
                }
                return null;
            })}
            <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
                className={`p-1.5 rounded border text-gray-600 ${page === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                <ChevronRight size={16} />
            </button>
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────────────
const Earnings = () => {
    const { walletData, earningsStats, vendor, fetchWalletData } = useVendor();

    const [activeTab, setActiveTab]         = useState('transactions');
    const [txPage,    setTxPage]            = useState(1);
    const [wdPage,    setWdPage]            = useState(1);
    const txPagination = walletData.pagination || { total: 0, page: 1, totalPages: 1 };

    // Withdrawal list
    const [withdrawals,   setWithdrawals]   = useState([]);
    const [wdPagination,  setWdPagination]  = useState({ total: 0, page: 1, totalPages: 1 });
    const [wdLoading,     setWdLoading]     = useState(false);

    // Withdraw modal
    const [showWithdrawModal,  setShowWithdrawModal]  = useState(false);
    const [withdrawAmount,     setWithdrawAmount]      = useState('');
    const [isSubmitting,       setIsSubmitting]        = useState(false);
    const [withdrawError,      setWithdrawError]       = useState('');

    // Bank account state
    const [bankAccount,   setBankAccount]   = useState(null);
    const [bankLoading,   setBankLoading]   = useState(false);
    const [bankForm,      setBankForm]      = useState({ accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '', upiId: '' });
    const [bankFormMode,  setBankFormMode]  = useState('view');  // 'view' | 'add' | 'edit'
    const [bankSaving,    setBankSaving]    = useState(false);
    const [bankError,     setBankError]     = useState('');

    const transactions    = walletData.transactions || [];
    const pendingPayouts  = walletData.pendingPayouts || 0;
    const availableBalance = (walletData.balance || 0) - pendingPayouts;

    // ── Data Fetching ────────────────────────────────────────────────────

    // Fetch wallet/transactions whenever page changes
    useEffect(() => {
        fetchWalletData(txPage);
    }, [txPage]);

    // Fetch withdrawals
    const loadWithdrawals = useCallback(async (page = wdPage) => {
        if (!vendor?.token) return;
        setWdLoading(true);
        try {
            const res = await vendorWalletApi.getWithdrawalRequests(vendor.token, page, 10);
            setWithdrawals(res.requests || []);
            setWdPagination(res.pagination || { total: 0, page: 1, totalPages: 1 });
        } catch { /* silent */ }
        finally { setWdLoading(false); }
    }, [vendor?.token, wdPage]);

    useEffect(() => {
        if (activeTab === 'withdrawals') loadWithdrawals(wdPage);
    }, [activeTab, wdPage]);

    // Fetch bank account
    const loadBankAccount = useCallback(async () => {
        if (!vendor?.token) return;
        setBankLoading(true);
        try {
            const res = await vendorWalletApi.getBankAccount(vendor.token);
            const acc = res.bankAccount;
            const has = acc && (acc.upiId || acc.accountNumber);
            setBankAccount(has ? acc : null);
            if (has) setBankForm({
                accountHolderName: acc.accountHolderName || '',
                accountNumber:     acc.accountNumber || '',
                ifscCode:          acc.ifscCode || '',
                bankName:          acc.bankName || '',
                upiId:             acc.upiId || ''
            });
        } catch { /* silent */ }
        finally { setBankLoading(false); }
    }, [vendor?.token]);

    useEffect(() => {
        if (activeTab === 'bank-account') loadBankAccount();
    }, [activeTab]);

    // Also seed bankAccount from walletData (already fetched on load)
    useEffect(() => {
        if (walletData.bankAccount) {
            const acc = walletData.bankAccount;
            const has = acc.upiId || acc.accountNumber;
            setBankAccount(has ? acc : null);
            if (has) setBankForm({
                accountHolderName: acc.accountHolderName || '',
                accountNumber:     acc.accountNumber || '',
                ifscCode:          acc.ifscCode || '',
                bankName:          acc.bankName || '',
                upiId:             acc.upiId || ''
            });
        }
    }, [walletData.bankAccount]);

    // ── Withdrawal Submit ────────────────────────────────────────────────
    const handleWithdraw = async (e) => {
        e.preventDefault();
        setWithdrawError('');
        const amt = parseFloat(withdrawAmount);
        if (!amt || amt < 500)              { setWithdrawError('Minimum withdrawal amount is ₹500'); return; }
        if (amt > availableBalance)         { setWithdrawError(`Insufficient balance. Available: ${formatCurrency(availableBalance)}`); return; }
        if (!bankAccount || (!bankAccount.upiId && !bankAccount.accountNumber)) {
            setWithdrawError('Please add your bank account / UPI ID in the Bank Account tab first.'); return;
        }
        setIsSubmitting(true);
        try {
            await vendorWalletApi.requestWithdrawal(vendor.token, amt);
            toast.success(`Withdrawal request of ${formatCurrency(amt)} submitted!`);
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            fetchWalletData(txPage);
            setActiveTab('withdrawals');
            setWdPage(1);
            loadWithdrawals(1);
        } catch (err) {
            setWithdrawError(err?.response?.data?.message || err.message || 'Failed to submit');
        } finally { setIsSubmitting(false); }
    };

    // ── Bank Account CRUD ────────────────────────────────────────────────
    const handleBankSave = async (e) => {
        e.preventDefault();
        setBankError('');
        const { upiId, accountNumber, ifscCode, accountHolderName } = bankForm;
        if (!upiId && (!accountNumber || !ifscCode)) {
            setBankError('Provide a UPI ID or Account No. + IFSC Code'); return;
        }
        if (!upiId && !accountHolderName) {
            setBankError('Account holder name is required for bank transfer'); return;
        }
        setBankSaving(true);
        try {
            const res = await vendorWalletApi.saveBankAccount(vendor.token, bankForm);
            setBankAccount(res.bankAccount);
            setBankFormMode('view');
            toast.success('Bank account saved!');
            fetchWalletData(txPage); // refresh wallet so bankAccount is updated there too
        } catch (err) {
            setBankError(err?.response?.data?.message || err.message || 'Failed to save');
        } finally { setBankSaving(false); }
    };

    const handleBankDelete = async () => {
        if (!window.confirm('Remove your saved bank account?')) return;
        try {
            await vendorWalletApi.deleteBankAccount(vendor.token);
            setBankAccount(null);
            setBankForm({ accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '', upiId: '' });
            setBankFormMode('add');
            toast.info('Bank account removed');
        } catch { toast.error('Failed to remove account'); }
    };

    const pendingWdCount = withdrawals.filter(w => w.status === 'Pending').length;

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4 lg:space-y-5">
            <h1 className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight">Earnings &amp; Payouts</h1>

            {/* ── Balance + Stats ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                <div className="bg-gradient-to-br from-[#0c831f] to-[#085d16] rounded-xl p-4 lg:p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-lg"><Wallet size={18} /></div>
                        <span className="text-sm font-medium text-white/80">Available Balance</span>
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold mb-0.5">{formatCurrency(availableBalance)}</div>
                    <div className="text-xs text-white/60">Lifetime Earnings: {formatCurrency(walletData.totalEarnings || 0)}</div>
                    {pendingPayouts > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-yellow-300 mt-2 bg-white/10 rounded-lg px-2 py-1.5">
                            <Clock size={12} /> {formatCurrency(pendingPayouts)} pending withdrawal
                        </div>
                    )}
                    <button id="vendor-withdraw-btn"
                        onClick={() => { setWithdrawError(''); setShowWithdrawModal(true); }}
                        className="mt-4 w-full py-2 bg-white text-[#0c831f] font-bold rounded-lg text-sm hover:bg-green-50 transition-colors">
                        Withdraw Now
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-5">
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Performance</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-green-100 text-green-700 rounded"><TrendingUp size={15} /></div>
                                <span className="text-sm text-gray-600">Total Sales</span>
                            </div>
                            <span className="text-sm font-bold">{formatCurrency(earningsStats.totalSales)}</span>
                        </div>
                        {earningsStats.posSales > 0 && (
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg ml-2">
                                <span className="text-xs text-gray-500">↳ In-Store POS</span>
                                <span className="text-xs font-bold text-blue-700">{formatCurrency(earningsStats.posSales)}</span>
                            </div>
                        )}
                        {earningsStats.regularSales > 0 && (
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg ml-2">
                                <span className="text-xs text-gray-500">↳ Online / COD</span>
                                <span className="text-xs font-bold text-green-700">{formatCurrency(earningsStats.regularSales)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-red-100 text-red-700 rounded"><TrendingDown size={15} /></div>
                                <span className="text-sm text-gray-600">Returns</span>
                            </div>
                            <span className="text-sm font-bold">{formatCurrency(earningsStats.totalReturns)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
                {[
                    { id: 'transactions',  label: 'Transactions' },
                    { id: 'withdrawals',   label: 'My Withdrawals', badge: pendingWdCount },
                    { id: 'bank-account',  label: 'Bank Account',   badge: bankAccount ? null : '!' },
                ].map(tab => (
                    <button key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {tab.label}
                        {tab.badge ? (
                            <span className={`absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold text-white rounded-full flex items-center justify-center ${tab.badge === '!' ? 'bg-orange-400' : 'bg-yellow-400'}`}>
                                {tab.badge}
                            </span>
                        ) : null}
                    </button>
                ))}
            </div>

            {/* ══ TRANSACTIONS TAB ══ */}
            {activeTab === 'transactions' && (
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-gray-900">Transaction History</h3>
                        <span className="text-xs text-gray-400">{txPagination.total} total</span>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Date &amp; Time</th>
                                    <th className="p-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.length === 0 ? (
                                    <tr><td colSpan="3" className="p-8 text-center text-gray-400 text-sm">No transactions yet</td></tr>
                                ) : transactions.map(tx => {
                                    const isPOS     = tx.description?.includes('Received In-Store');
                                    const isPending = tx.category === 'withdrawal' && tx.status === 'pending';
                                    const isReject  = tx.category === 'withdrawal_rejection';
                                    const color = isPOS ? 'text-blue-600' : isPending ? 'text-yellow-600' : isReject ? 'text-gray-500' : tx.type === 'credit' ? 'text-green-600' : 'text-red-600';
                                    const iconBg = isPOS ? 'bg-blue-100 text-blue-500' : isPending ? 'bg-yellow-100 text-yellow-500' : tx.type === 'credit' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500';
                                    return (
                                        <tr key={tx._id} className="hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-full flex-shrink-0 ${iconBg}`}>
                                                        <ArrowUpRight size={13} className={tx.type === 'debit' && !isPOS ? 'rotate-180' : ''} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">{tx.description}</p>
                                                        {isPOS     && <p className="text-[10px] text-blue-400 mt-0.5">Cash received in-store — not added to wallet</p>}
                                                        {isPending && <p className="text-[10px] text-yellow-500 mt-0.5">⏳ Awaiting admin approval</p>}
                                                        {isReject  && <p className="text-[10px] text-gray-400 mt-0.5">✕ Withdrawal request was rejected</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs text-gray-400 whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
                                            <td className={`p-4 text-right text-sm font-bold ${color}`}>
                                                {isPOS ? '' : tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-2">
                        {transactions.length === 0 ? (
                            <p className="text-center py-8 text-gray-400 text-sm">No transactions yet</p>
                        ) : transactions.map(tx => {
                            const isPOS     = tx.description?.includes('Received In-Store');
                            const isPending = tx.category === 'withdrawal' && tx.status === 'pending';
                            const color = isPOS ? 'text-blue-600' : isPending ? 'text-yellow-600' : tx.type === 'credit' ? 'text-green-600' : 'text-red-600';
                            return (
                                <div key={tx._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-gray-700 flex-1 pr-3">{tx.description}</p>
                                        <span className={`text-sm font-bold whitespace-nowrap ${color}`}>
                                            {isPOS ? '' : tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount)}
                                        </span>
                                    </div>
                                    {isPOS     && <p className="text-[10px] text-blue-400 mt-1">Cash received in-store</p>}
                                    {isPending && <p className="text-[10px] text-yellow-500 mt-1">⏳ Pending approval</p>}
                                    <p className="text-xs text-gray-400 mt-1">{new Date(tx.createdAt).toLocaleString()}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                        <span>Page {txPage} of {txPagination.totalPages}</span>
                        <Paginator page={txPage} totalPages={txPagination.totalPages} onChange={(p) => setTxPage(p)} />
                    </div>
                </div>
            )}

            {/* ══ WITHDRAWALS TAB ══ */}
            {activeTab === 'withdrawals' && (
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold text-gray-900">My Withdrawal Requests</h3>
                        <button onClick={() => { setWithdrawError(''); setShowWithdrawModal(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0c831f] text-white text-xs font-semibold rounded-lg hover:bg-[#0a6b19] transition-colors">
                            <Send size={12} /> New Request
                        </button>
                    </div>

                    {wdLoading ? (
                        <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>
                    ) : withdrawals.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                            <Wallet size={36} className="text-gray-200 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">No withdrawal requests yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {withdrawals.map(req => {
                                const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.Pending;
                                const Ico = cfg.icon;
                                return (
                                    <div key={req._id} className="bg-white rounded-xl border border-gray-100 p-4">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="min-w-0">
                                                <div className="text-base font-bold text-gray-900">{formatCurrency(req.amount)}</div>
                                                <div className="text-xs text-gray-500 mt-0.5 truncate">{req.upiId || req.paymentMethod}</div>
                                                <div className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleString()}</div>
                                            </div>
                                            <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${cfg.color}`}>
                                                <Ico size={11} /> {cfg.label}
                                            </span>
                                        </div>
                                        {req.note && (
                                            <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">{req.note}</p>
                                        )}
                                        {req.referenceNumber && req.referenceNumber !== '-' && (
                                            <p className="mt-1 text-xs text-gray-500">Ref: <span className="font-mono text-gray-700">{req.referenceNumber}</span></p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <Paginator page={wdPage} totalPages={wdPagination.totalPages} onChange={(p) => { setWdPage(p); loadWithdrawals(p); }} />
                </div>
            )}

            {/* ══ BANK ACCOUNT TAB ══ */}
            {activeTab === 'bank-account' && (
                <div className="max-w-lg">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Payout Bank Account</h3>
                    <p className="text-xs text-gray-400 mb-4 -mt-2">You can save one bank account or UPI ID. This will be used for all withdrawal requests.</p>

                    {bankLoading ? (
                        <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
                    ) : bankAccount && bankFormMode === 'view' ? (
                        // Saved account display
                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                                        <CreditCard size={22} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{bankAccount.accountHolderName || 'Saved Account'}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <ShieldCheck size={11} className="text-green-500" />
                                            <span className="text-xs text-green-600 font-medium">Verified</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => setBankFormMode('edit')}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                        <Pencil size={15} />
                                    </button>
                                    <button onClick={handleBankDelete}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                {bankAccount.upiId && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-xs text-gray-500">UPI ID</span>
                                        <span className="text-sm font-mono font-medium text-gray-800">{bankAccount.upiId}</span>
                                    </div>
                                )}
                                {bankAccount.bankName && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-xs text-gray-500">Bank</span>
                                        <span className="text-sm font-medium text-gray-800">{bankAccount.bankName}</span>
                                    </div>
                                )}
                                {bankAccount.accountNumber && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-xs text-gray-500">Account No.</span>
                                        <span className="text-sm font-mono font-medium text-gray-800">
                                            {'•'.repeat(Math.max(0, (bankAccount.accountNumber.length || 0) - 4))}{(bankAccount.accountNumber || '').slice(-4)}
                                        </span>
                                    </div>
                                )}
                                {bankAccount.ifscCode && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-xs text-gray-500">IFSC</span>
                                        <span className="text-sm font-mono font-medium text-gray-800">{bankAccount.ifscCode}</span>
                                    </div>
                                )}
                                {bankAccount.addedAt && (
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-xs text-gray-500">Added</span>
                                        <span className="text-xs text-gray-400">{new Date(bankAccount.addedAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Add / Edit Form
                        <div className="bg-white rounded-xl border border-gray-100 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Building2 size={18} className="text-[#0c831f]" />
                                <h4 className="font-semibold text-gray-800 text-sm">{bankFormMode === 'edit' ? 'Update' : 'Add'} Bank Account</h4>
                            </div>

                            {bankError && (
                                <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 rounded-lg p-3 text-sm mb-4">
                                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0" /> {bankError}
                                </div>
                            )}

                            <form onSubmit={handleBankSave} className="space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Account Holder Name</label>
                                    <input type="text" placeholder="Full name as per bank"
                                        value={bankForm.accountHolderName}
                                        onChange={e => setBankForm(f => ({ ...f, accountHolderName: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none" />
                                </div>

                                <p className="text-[11px] text-gray-400 font-medium">— Fill UPI or Bank Details —</p>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">UPI ID</label>
                                    <input id="bank-upi-id" type="text" placeholder="e.g. mobile@upi"
                                        value={bankForm.upiId}
                                        onChange={e => setBankForm(f => ({ ...f, upiId: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Account Number</label>
                                        <input id="bank-account-number" type="text" placeholder="123456789012"
                                            value={bankForm.accountNumber}
                                            onChange={e => setBankForm(f => ({ ...f, accountNumber: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">IFSC Code</label>
                                        <input id="bank-ifsc" type="text" placeholder="HDFC0001234"
                                            value={bankForm.ifscCode}
                                            onChange={e => setBankForm(f => ({ ...f, ifscCode: e.target.value.toUpperCase() }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Bank Name</label>
                                    <input id="bank-name" type="text" placeholder="e.g. HDFC Bank"
                                        value={bankForm.bankName}
                                        onChange={e => setBankForm(f => ({ ...f, bankName: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none" />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    {bankFormMode === 'edit' && (
                                        <button type="button" onClick={() => { setBankFormMode('view'); setBankError(''); }}
                                            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                            Cancel
                                        </button>
                                    )}
                                    <button id="bank-save-btn" type="submit" disabled={bankSaving}
                                        className={`flex-1 py-2.5 bg-[#0c831f] text-white rounded-lg text-sm font-bold hover:bg-[#0a6b19] transition-colors flex items-center justify-center gap-2 ${bankSaving ? 'opacity-70' : ''}`}>
                                        {bankSaving ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : <><Plus size={15} /> Save Account</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* ══ WITHDRAW MODAL ══ */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowWithdrawModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Withdraw Funds</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Available: <span className="font-semibold text-green-600">{formatCurrency(availableBalance)}</span>
                                </p>
                            </div>
                            <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleWithdraw} className="p-5 space-y-4">
                            {withdrawError && (
                                <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 rounded-lg p-3 text-sm">
                                    <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {withdrawError}
                                </div>
                            )}

                            {/* Saved Bank Account Preview */}
                            {bankAccount && (bankAccount.upiId || bankAccount.accountNumber) ? (
                                <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-3">
                                    <div className="bg-green-100 text-green-600 p-2 rounded-lg flex-shrink-0"><CreditCard size={16} /></div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500 mb-0.5">Sending to saved account</p>
                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                            {bankAccount.upiId || `${bankAccount.bankName} •••${(bankAccount.accountNumber || '').slice(-4)}`}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm text-orange-700">
                                    <span className="font-medium">No bank account saved.</span>
                                    {' '}<button type="button" onClick={() => { setShowWithdrawModal(false); setActiveTab('bank-account'); setWdPage(1); }}
                                        className="underline font-semibold">Add one in Bank Account tab</button>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Amount (₹)</label>
                                <input id="vendor-withdraw-amount" type="number" placeholder="Min ₹500"
                                    min="500" max={availableBalance} step="1"
                                    value={withdrawAmount}
                                    onChange={e => { setWithdrawAmount(e.target.value); setWithdrawError(''); }}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm" required />
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-gray-400">Min: ₹500</span>
                                    <button type="button" onClick={() => setWithdrawAmount(Math.floor(availableBalance).toString())}
                                        className="text-xs text-[#0c831f] font-medium hover:underline">
                                        Withdraw All ({formatCurrency(availableBalance)})
                                    </button>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs text-yellow-700">
                                <strong>Note:</strong> Admin will review and process within 1–2 business days.
                            </div>

                            <button id="vendor-withdraw-submit" type="submit" disabled={isSubmitting || !bankAccount}
                                className={`w-full py-3 bg-[#0c831f] text-white font-bold rounded-lg hover:bg-[#0a6b19] transition-colors flex items-center justify-center gap-2 ${(isSubmitting || !bankAccount) ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {isSubmitting ? (
                                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
                                ) : (
                                    <><Send size={16} /> Submit Withdrawal Request</>
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
