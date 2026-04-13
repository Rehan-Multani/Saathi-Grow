import React, { useState, useEffect, useCallback } from 'react';
import {
    RotateCcw, Package, CheckCircle, XCircle, Search,
    Eye, X, Store, Phone, User, ChevronLeft, ChevronRight,
    Image, Clock, ClipboardList, Briefcase
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useVendor } from '../contexts/VendorContext';

const statusColors = {
    Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Accepted: 'bg-green-50 text-green-700 border-green-200',
    Approved: 'bg-green-50 text-green-700 border-green-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200',
    FinalRejected: 'bg-red-50 text-red-700 border-red-200',
    Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    PickedUp: 'bg-purple-50 text-purple-700 border-purple-200',
    Returned: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
    const itemsPerPage = 10;

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
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'Decline Return',
                inputValidator: (v) => !v && 'Please provide a reason.'
            });
            if (!result.isConfirmed) return;
            rejectionReason = result.value;
        } else {
            const confirm = await Swal.fire({
                title: 'Authorize Return?',
                text: 'Your store accepts this return. Logistics will collect the item from your store.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Authorize',
                confirmButtonColor: '#0c831f',
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
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Return Requests</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Manage and authorize customer product returns.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID or Client..."
                            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all shadow-sm"
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Pending', count: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
                        { label: 'Authorized', count: stats.approved, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                        { label: 'Completed', count: stats.completed, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                        { label: 'Declined', count: stats.rejected, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                    ].map((stat, i) => (
                        <div key={i} className={`p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col`}>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</p>
                            <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex overflow-x-auto no-scrollbar gap-2">
                    {['all', 'pending', 'accepted', 'scheduled', 'returned'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setFilterStatus(tab); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${filterStatus === tab ? 'bg-[#0c831f] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                         <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0c831f] rounded-full animate-spin mb-4"></div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Returns...</p>
                    </div>
                ) : returnRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                            <ClipboardList size={32} />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">No Returns Found</h3>
                        <p className="text-sm font-medium text-gray-500">There are no return requests matching your criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Log ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Client Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Valuation</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {returnRequests.map(request => (
                                    <tr key={request._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-gray-500 font-medium">#{request.orderId}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 text-sm">{request.user?.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{request.user?.phone}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusColors[request.returnRequest?.status] || statusColors.Pending}`}>
                                                {request.returnRequest?.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="font-bold text-gray-900 text-sm">₹{request.totalAmount}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setSelectedRequest(request)} 
                                                className="inline-flex p-2 text-gray-400 hover:text-[#0c831f] hover:bg-green-50 rounded-lg transition-colors border border-gray-200"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && pagination.total > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs font-medium text-gray-500">
                            Showing <span className="text-gray-900 font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, pagination.total)}</span> of <span className="text-gray-900 font-bold">{pagination.total}</span> returns
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                className="p-1.5 border border-gray-200 rounded-lg bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 text-gray-600 transition-colors"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-4 py-1.5 text-xs font-bold text-gray-700">
                                {currentPage} / {pagination.totalPages}
                            </span>
                            <button
                                className="p-1.5 border border-gray-200 rounded-lg bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 text-gray-600 transition-colors"
                                disabled={currentPage >= pagination.totalPages}
                                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Return Details</h3>
                                <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest font-mono">ID: #{selectedRequest.orderId}</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8">
                            <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-6">
                                <p className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-2">Customer Reason</p>
                                <p className="text-sm font-medium text-gray-800 leading-relaxed">"{selectedRequest.returnRequest?.reason || 'No statement provided'}"</p>
                                {selectedRequest.returnRequest?.description && (
                                    <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-yellow-200/50 leading-relaxed font-medium">{selectedRequest.returnRequest.description}</p>
                                )}
                            </div>

                            {selectedRequest.returnRequest?.images && selectedRequest.returnRequest.images.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Image size={14} /> Uploaded Evidence
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {selectedRequest.returnRequest.images.map((img, i) => (
                                            <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-[#0c831f] transition-all">
                                                <img src={img} alt="proof" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Items Information</p>
                                <div className="space-y-3">
                                    {selectedRequest.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 border border-gray-100 p-4 rounded-xl">
                                            <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-1">
                                                {item.product?.image ? <img src={item.product?.image} className="max-h-full object-contain" alt="item" /> : <Package className="text-gray-300" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 tracking-tight">{item.product?.name || 'Unknown Product'}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Client Insight */}
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                         <User size={20} />
                                     </div>
                                     <div>
                                         <p className="text-sm font-bold text-gray-900">{selectedRequest.user?.name}</p>
                                         <p className="text-xs text-gray-500 font-medium mt-0.5">{selectedRequest.user?.phone}</p>
                                     </div>
                                </div>
                                <a href={`tel:${selectedRequest.user?.phone}`} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
                                    <Phone size={18} />
                                </a>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                             {selectedRequest.returnRequest?.status === 'Pending' ? (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => onAction(selectedRequest._id, 'Rejected')}
                                            disabled={processing}
                                            className="px-6 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors active:scale-95 disabled:opacity-50"
                                        >
                                            Decline
                                        </button>
                                        <button
                                            onClick={() => onAction(selectedRequest._id, 'Accepted')}
                                            disabled={processing}
                                            className="flex-1 py-2.5 bg-[#0c831f] hover:bg-[#0a6b19] text-white rounded-xl font-bold text-sm shadow-sm transition-colors active:scale-95 disabled:opacity-50"
                                        >
                                            {processing ? 'Processing...' : 'Authorize Return'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-xl border border-dashed border-gray-300 text-center bg-white">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status: {selectedRequest.returnRequest?.status}</p>
                                        <p className="text-[11px] text-gray-400 font-medium">This request has already been processed.</p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnRequests;
