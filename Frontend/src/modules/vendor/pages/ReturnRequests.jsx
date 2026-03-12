import React, { useState, useEffect, useCallback } from 'react';
import {
    RotateCcw, Package, CheckCircle, XCircle, Search,
    Eye, X, Loader2, Store, Phone, User, ChevronLeft, ChevronRight, 
    Image, Clock, ClipboardList, Filter, Briefcase
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useVendor } from '../contexts/VendorContext';

const statusColors = {
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Accepted: 'bg-orange-100 text-orange-700 border-orange-200',
    Approved: 'bg-amber-100 text-amber-700 border-amber-200',
    Rejected: 'bg-rose-100 text-rose-700 border-rose-200',
    FinalRejected: 'bg-red-100 text-red-700 border-red-200',
    Scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    PickedUp: 'bg-purple-100 text-purple-700 border-purple-200',
    Returned: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const ReturnRequests = () => {
    const { returnRequests, handleReturnAction, fetchReturns } = useVendor();
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [stats, setStats] = useState(null);
    const itemsPerPage = 8;

    const loadReturns = useCallback(async () => {
        setLoading(true);
        const data = await fetchReturns({
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery,
            status: filterStatus,
            includeStats: true
        });
        if (data) {
            setPagination(data.pagination);
            setStats(data.stats);
        }
        setLoading(false);
    }, [currentPage, searchQuery, filterStatus]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadReturns();
        }, 400);
        return () => clearTimeout(timer);
    }, [currentPage, searchQuery, filterStatus]);

    const onAction = async (orderId, action) => {
        let rejectionReason = null;
        if (action === 'Rejected') {
            const result = await Swal.fire({
                title: 'Decline Return?',
                input: 'textarea',
                inputLabel: 'Reason for decline',
                inputPlaceholder: 'Briefly explain why this return is not acceptable...',
                showCancelButton: true,
                confirmButtonColor: '#f43f5e',
                confirmButtonText: 'Decline Return',
                inputValidator: (v) => !v && 'Please provide a reason.'
            });
            if (!result.isConfirmed) return;
            rejectionReason = result.value;
        } else {
            const confirm = await Swal.fire({
                title: 'Authorize Return?',
                text: 'Your store accepts this return. Sathi-Grow logistics will collect the item from your store.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Authorize',
                confirmButtonColor: '#f59e0b',
            });
            if (!confirm.isConfirmed) return;
        }

        setProcessing(true);
        const success = await handleReturnAction(orderId, action, rejectionReason);
        setProcessing(false);
        if (success) {
            setSelectedRequest(null);
            loadReturns();
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Elegant Header */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-orange-500 rounded-[1.5rem] text-white shadow-xl shadow-orange-100 ring-4 ring-orange-50">
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Return Management</h2>
                        <p className="text-orange-500 text-xs font-black uppercase tracking-[0.2em] mt-1">Vendor Store Authorization Hub</p>
                    </div>
                </div>

                <div className="relative group w-full md:w-96">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-400 group-focus-within:text-orange-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search ID or Client..."
                        className="w-full pl-14 pr-6 py-4 bg-orange-50/30 border border-orange-100 rounded-[2rem] outline-none text-sm font-bold transition-all focus:bg-white focus:ring-4 focus:ring-orange-100"
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            {/* Stats Insight */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Pending', count: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
                        { label: 'Authorized', count: stats.approved, color: 'text-orange-600', bg: 'bg-orange-50', icon: CheckCircle },
                        { label: 'Completed', count: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Package },
                        { label: 'Declined', count: stats.rejected, color: 'text-rose-600', bg: 'bg-rose-50', icon: XCircle },
                    ].map((stat, i) => (
                        <div key={i} className={`p-5 rounded-[2rem] bg-white border border-gray-100 shadow-sm flex items-center gap-4`}>
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className={`text-xl font-black ${stat.color}`}>{stat.count}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2.5 p-2 bg-white border border-gray-100 rounded-[2.2rem] w-fit shadow-sm">
                {['all', 'pending', 'accepted', 'scheduled', 'returned'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setFilterStatus(tab); setCurrentPage(1); }}
                        className={`px-8 py-3.5 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all ${filterStatus === tab ? 'bg-orange-500 text-white shadow-xl shadow-orange-100 scale-105' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-orange-50 overflow-hidden">
                {loading ? (
                    <div className="py-24 text-center">
                        <Loader2 className="animate-spin mx-auto text-orange-500 mb-4" size={40} />
                        <p className="text-[11px] font-black text-orange-400 uppercase tracking-widest">Retrieving Claim Records...</p>
                    </div>
                ) : returnRequests.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ClipboardList className="text-orange-200" size={44} />
                        </div>
                        <h3 className="font-black text-gray-800 text-xl">Operational Clear</h3>
                        <p className="text-sm text-gray-400 font-medium">No return requests identified in this cluster.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-orange-50/30">
                                    <th className="px-10 py-6 text-[10px] font-black text-orange-600/60 uppercase tracking-widest border-b border-orange-50">Log ID</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-orange-600/60 uppercase tracking-widest border-b border-orange-50">Client Identity</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-orange-600/60 uppercase tracking-widest border-b border-orange-50">Claim Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-orange-600/60 uppercase tracking-widest border-b border-orange-50">Valuation</th>
                                    <th className="px-10 py-6 text-center text-[10px] font-black text-orange-600/60 uppercase tracking-widest border-b border-orange-50">Audit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-50/50">
                                {returnRequests.map(request => (
                                    <tr key={request._id} className="group hover:bg-orange-50/20 transition-all duration-300">
                                        <td className="px-10 py-8 font-mono font-black text-orange-600 tracking-wider">#{request.orderId}</td>
                                        <td className="px-10 py-8">
                                            <p className="font-black text-gray-800">{request.user?.name}</p>
                                            <p className="text-[11px] text-gray-400 font-bold mt-0.5 tracking-tight">{request.user?.phone}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${statusColors[request.returnRequest?.status] || statusColors.Pending}`}>
                                                {request.returnRequest?.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="font-black text-gray-800 text-lg">₹{request.totalAmount}</p>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <button 
                                                onClick={() => setSelectedRequest(request)} 
                                                className="p-3 text-orange-600 hover:bg-orange-600 hover:text-white rounded-[1.2rem] transition-all shadow-lg shadow-orange-50 border border-orange-100"
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
                    <div className="px-10 py-8 bg-orange-50/10 border-t border-orange-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">
                            Displaying <span className="text-orange-600 font-black">{((currentPage - 1) * itemsPerPage) + 1} â€” {Math.min(currentPage * itemsPerPage, pagination.total)}</span> of <span className="text-orange-600 font-black">{pagination.total}</span> return clusters
                        </p>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`p-3 rounded-2xl border-2 transition-all ${currentPage === 1 ? 'border-orange-50 text-orange-200 cursor-not-allowed' : 'border-orange-100 text-orange-600 hover:bg-orange-600 hover:border-orange-600 hover:text-white hover:scale-105'}`}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="px-6 py-3 bg-white border-2 border-orange-50 rounded-2xl text-sm font-black text-orange-600 shadow-inner">
                                {currentPage} / {pagination.totalPages}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={currentPage >= pagination.totalPages}
                                className={`p-3 rounded-2xl border-2 transition-all ${currentPage >= pagination.totalPages ? 'border-orange-50 text-orange-200 cursor-not-allowed' : 'border-orange-100 text-orange-600 hover:bg-orange-600 hover:border-orange-600 hover:text-white hover:scale-105'}`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-3xl border border-orange-100 animate-in zoom-in-95 duration-300">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-orange-50 px-10 py-8 flex items-center justify-between z-10">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight italic">Claim Dossier</h3>
                                <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.2em] mt-1">Audit Log Reference #{selectedRequest.orderId}</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-3 bg-orange-50 text-orange-400 hover:text-orange-600 rounded-[1.2rem] transition-all"><X size={20} /></button>
                        </div>

                        <div className="p-10 space-y-10">
                            {/* Reason Box */}
                            <div className="bg-amber-50 rounded-[2.5rem] border-2 border-amber-100 p-8 relative overflow-hidden group">
                                <div className="absolute -right-6 -top-6 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                                    <RotateCcw size={140} />
                                </div>
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">Consumer Statement</p>
                                <p className="text-xl font-bold text-gray-800 tracking-tight leading-snug italic">"{selectedRequest.returnRequest?.reason || 'No statement provided'}"</p>
                                {selectedRequest.returnRequest?.description && (
                                    <p className="text-xs text-slate-500 mt-4 font-medium border-t border-amber-200/50 pt-4 leading-relaxed">{selectedRequest.returnRequest.description}</p>
                                )}
                            </div>

                            {/* Evidence Box */}
                            {selectedRequest.returnRequest?.images && selectedRequest.returnRequest.images.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Image size={14} /> Claim Evidence
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {selectedRequest.returnRequest.images.map((img, i) => (
                                            <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="relative w-24 h-24 rounded-[1.8rem] overflow-hidden border-2 border-orange-50 group hover:border-orange-400 transition-all shadow-sm">
                                                <img src={img} alt="proof" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-orange-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Eye size={24} className="text-white drop-shadow-lg" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Items List */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Allocation</p>
                                <div className="space-y-3">
                                    {selectedRequest.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-5 bg-gray-50 border border-gray-100 p-5 rounded-[2rem] hover:bg-orange-50/30 transition-colors">
                                            <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-2 shadow-sm">
                                                {item.product?.image ? <img src={item.product?.image} className="object-contain max-h-full" alt="item" /> : <Package className="text-slate-200" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-black text-gray-800 tracking-tight">{item.product?.name || 'Bulk Inventory'}</p>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">Qty: {item.quantity}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.product?.category || 'General'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Client Insight */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Claimant Identity</p>
                                <div className="flex items-center gap-5 bg-slate-900 text-white p-6 rounded-[2.2rem] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-all duration-700">
                                        <User size={80} />
                                    </div>
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20">
                                        <User size={24} />
                                    </div>
                                    <div className="flex-1 relative z-10">
                                        <p className="text-lg font-black tracking-tight">{selectedRequest.user?.name}</p>
                                        <p className="text-xs text-slate-400 font-bold tracking-widest mt-1 italic">{selectedRequest.user?.phone}</p>
                                    </div>
                                    <a href={`tel:${selectedRequest.user?.phone}`} className="p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-[1.5rem] transition-all shadow-xl shadow-orange-900/50 active:scale-90">
                                        <Phone size={20} />
                                    </a>
                                </div>
                            </div>

                            {/* Call to Action */}
                            <div className="pt-6">
                                {selectedRequest.returnRequest?.status === 'Pending' ? (
                                    <div className="flex gap-5">
                                        <button
                                            onClick={() => onAction(selectedRequest._id, 'Accepted')}
                                            disabled={processing}
                                            className="flex-[2] py-6 bg-orange-500 hover:bg-orange-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-200 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {processing ? 'Processing Cluster...' : 'Authorize Claim'}
                                        </button>
                                        <button
                                            onClick={() => onAction(selectedRequest._id, 'Rejected')}
                                            disabled={processing}
                                            className="flex-1 py-6 bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-50 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`p-8 rounded-[2.5rem] text-center border-2 border-dashed ${statusColors[selectedRequest.returnRequest?.status]}`}>
                                        <p className="text-sm font-black uppercase tracking-[0.2em] mb-2 tracking-widest">Cluster Status: {selectedRequest.returnRequest?.status}</p>
                                        <p className="text-[11px] font-bold opacity-60 leading-relaxed italic">
                                            {selectedRequest.returnRequest?.status === 'Accepted' || selectedRequest.returnRequest?.status === 'Approved' 
                                                ? 'Operational workflow engaged. Logistic assets have been notified for recovery.' 
                                                : 'Claim record has been definitively archived. No further action required.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnRequests;

