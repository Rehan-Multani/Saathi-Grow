import React, { useState, useEffect } from 'react';
import { 
    RotateCcw, Search, Eye, X, Loader2, User, Phone, 
    CheckCircle, XCircle, AlertCircle, Image, ClipboardList,
    ChevronLeft, ChevronRight, Package, Calendar, Clock
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { getReturnRequests, handleReturnRequest } from '../../../admin/api/orderApi';

const statusColors = {
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Approved: 'bg-green-100 text-green-700 border-green-200',
    Rejected: 'bg-orange-100 text-orange-700 border-orange-200',
    FinalRejected: 'bg-red-100 text-red-700 border-red-200',
    Scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    PickedUp: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Returned: 'bg-teal-100 text-teal-700 border-teal-200',
};

const StaffReturns = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Pending');
    const [selected, setSelected] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const limit = 10;

    const tabStatusMap = {
        Pending: 'Pending',
        Accepted: 'Accepted,Approved',
        Processing: 'Scheduled,PickedUp',
        History: 'FinalRejected,Returned'
    };

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const data = await getReturnRequests(
                {
                    page,
                    limit,
                    search: searchTerm,
                    status: tabStatusMap[activeTab],
                    includeStats: true
                },
                { paginated: true }
            );

            if (data.returns) {
                setReturns(data.returns);
                setPagination(data.pagination);
            } else {
                setReturns(Array.isArray(data) ? data : []);
                setPagination({ total: data.length, totalPages: 1 });
            }
        } catch (err) {
            toast.error('Failed to load returns');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReturns();
        }, 400);
        return () => clearTimeout(timer);
    }, [page, activeTab, searchTerm]);

    const handleAction = async (id, action) => {
        let reason = null;
        if (action === 'Rejected') {
            const { value } = await Swal.fire({
                title: 'Reject Return Request',
                input: 'textarea',
                inputLabel: 'Reason',
                placeholder: 'Explain why...',
                showCancelButton: true,
                inputValidator: (v) => !v && 'Reason is required',
                confirmButtonColor: '#ef4444'
            });
            if (!value) return;
            reason = value;
        } else {
            const confirm = await Swal.fire({
                title: 'Accept Return?',
                text: 'This signifies that the branch verifies the return request. Admin will handle logistics.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Accept',
                confirmButtonColor: '#10b981'
            });
            if (!confirm.isConfirmed) return;
        }

        try {
            setProcessing(true);
            await handleReturnRequest(id, action, reason);
            toast.success(`Return ${action} recorded`);
            setSelected(null);
            fetchReturns();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-emerald-50 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-emerald-600 rounded-[1.5rem] text-white shadow-xl shadow-emerald-100 ring-4 ring-emerald-50">
                        <RotateCcw size={28} />
                    </div>
                    <div>
                        <h2 className="font-black text-gray-800 text-3xl tracking-tight">Branch Returns</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Store Verification Portal</p>
                        </div>
                    </div>
                </div>

                <div className="relative group w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search order or customer..."
                        className="w-full pl-12 pr-4 py-4 bg-emerald-50/50 border border-emerald-100 rounded-[1.5rem] outline-none text-sm font-bold transition-all focus:bg-white focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200"
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            {/* Modern Tabs Section */}
            <div className="staff-tab-container">
                {['Pending', 'Accepted', 'Processing', 'History'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setPage(1); }}
                        className={`staff-tab-pill ${activeTab === tab ? 'staff-tab-active' : 'staff-tab-inactive'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span>{tab}</span>
                            {tab === 'Pending' && returns.length > 0 && activeTab === 'Pending' && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {returns.length}
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-emerald-50 overflow-hidden">
                {loading ? (
                    <div className="py-24 text-center flex flex-col items-center gap-4">
                        <div className="relative">
                            <Loader2 className="animate-spin text-emerald-600" size={40} />
                            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                <RotateCcw size={20} />
                            </div>
                        </div>
                        <p className="text-xs font-black text-emerald-600/50 uppercase tracking-widest">Scoping Logistic Graph...</p>
                    </div>
                ) : returns.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ClipboardList className="text-emerald-200" size={40} />
                        </div>
                        <h3 className="font-black text-gray-800 text-xl">Queue clear</h3>
                        <p className="text-sm text-gray-400 font-medium">No return requests found in this scope.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-emerald-50/30">
                                    <th className="px-8 py-6 text-[10px] font-black text-emerald-600/60 uppercase tracking-widest border-b border-emerald-50">Order Reference</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-emerald-600/60 uppercase tracking-widest border-b border-emerald-50">Customer Detail</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-emerald-600/60 uppercase tracking-widest border-b border-emerald-50">Validation Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-emerald-600/60 uppercase tracking-widest border-b border-emerald-50">Amount</th>
                                    <th className="px-8 py-6 text-center text-[10px] font-black text-emerald-600/60 uppercase tracking-widest border-b border-emerald-50">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-50/50">
                                {returns.map(r => (
                                    <tr key={r._id} className="group hover:bg-emerald-50/20 transition-all duration-300">
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
                                                    <Package size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-emerald-600 tracking-wider">#{r.orderId}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tight">
                                                        {new Date(r.returnRequest?.requestDate || r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <p className="font-black text-gray-800">{r.user?.name}</p>
                                            <p className="text-[11px] text-gray-400 font-medium mt-0.5 italic">{r.user?.phone}</p>
                                        </td>
                                        <td className="px-8 py-7">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusColors[r.returnRequest.status]}`}>
                                                {r.returnRequest.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-7">
                                            <p className="font-black text-gray-800 text-lg">₹{r.totalAmount}</p>
                                        </td>
                                        <td className="px-8 py-7 text-center">
                                            <button 
                                                onClick={() => setSelected(r)}
                                                className="p-3 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-lg shadow-emerald-50 border border-emerald-100"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && pagination.total > 0 && (
                    <div className="px-8 py-6 bg-emerald-50/10 border-t border-emerald-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            Showing <span className="text-emerald-600">{((page - 1) * limit) + 1}</span> to <span className="text-emerald-600">{Math.min(page * limit, pagination.total)}</span> of <span className="text-emerald-600">{pagination.total}</span> audit logs
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-2.5 rounded-xl border-2 transition-all ${page === 1 ? 'border-emerald-50 text-emerald-200' : 'border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white hover:scale-105'}`}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="px-4 py-2 bg-white border-2 border-emerald-50 rounded-xl text-xs font-black text-emerald-600">
                                {page} / {pagination.totalPages}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page >= pagination.totalPages}
                                className={`p-2.5 rounded-xl border-2 transition-all ${page >= pagination.totalPages ? 'border-emerald-50 text-emerald-200' : 'border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white hover:scale-105'}`}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detailed Insight Modal */}
            {selected && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] max-w-lg w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setSelected(null)} 
                            className="absolute top-8 right-8 p-2 bg-gray-50 text-gray-400 hover:text-gray-800 rounded-2xl transition-all"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-emerald-50 rounded-[1.5rem] text-emerald-600 border border-emerald-100">
                                    <ClipboardList size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-800 text-2xl tracking-tight">Audit Request</h3>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em]">{selected.orderId}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Reason Box */}
                                <div className="p-6 bg-amber-50 rounded-[2rem] border-2 border-amber-100 relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700">
                                        <RotateCcw size={120} />
                                    </div>
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Claim statement</p>
                                    <p className="text-lg font-bold text-gray-800 tracking-tight leading-snug italic">"{selected.returnRequest.reason}"</p>
                                    {selected.returnRequest.description && (
                                        <p className="text-xs text-gray-500 mt-3 font-medium border-t border-amber-200/50 pt-3">{selected.returnRequest.description}</p>
                                    )}
                                </div>

                                {/* Product Strip */}
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Items to Validate</p>
                                    {selected.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-[1.5rem] border border-gray-100 hover:border-emerald-200 transition-colors">
                                            <div className="w-14 h-14 bg-white rounded-2xl p-2 shadow-sm flex items-center justify-center">
                                                {item.product?.image ? <img src={item.product?.image} className="object-contain" /> : <Package className="text-gray-200" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-gray-800 text-sm tracking-tight">{item.product?.name || 'Unknown Item'}</p>
                                                <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Quantity: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Proof Gallery */}
                                {selected.returnRequest.images && selected.returnRequest.images.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visual Evidence</p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {selected.returnRequest.images.map((img, i) => (
                                                <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-100 group hover:border-emerald-400 transition-all">
                                                    <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="proof" />
                                                    <div className="absolute inset-0 bg-emerald-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                        <Eye size={20} className="text-white drop-shadow-lg" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Area */}
                            {selected.returnRequest.status === 'Pending' ? (
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => handleAction(selected._id, 'Accepted')}
                                        disabled={processing}
                                        className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {processing ? 'Verifying...' : 'Authorize Return'}
                                    </button>
                                    <button
                                        onClick={() => handleAction(selected._id, 'Rejected')}
                                        disabled={processing}
                                        className="flex-1 py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-rose-200 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        Decline
                                    </button>
                                </div>
                            ) : (
                                <div className={`p-6 rounded-[2rem] border text-center space-y-2 ${statusColors[selected.returnRequest.status]}`}>
                                    <p className="text-xs font-black uppercase tracking-widest tracking-widest">Logged: {selected.returnRequest.status}</p>
                                    <p className="text-[10px] font-bold opacity-70">
                                        {selected.returnRequest.status === 'Accepted' || selected.returnRequest.status === 'Approved' 
                                            ? 'Verification complete. Central logistics will initiate pickup.' 
                                            : 'Request has been processed and archived.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffReturns;
