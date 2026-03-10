import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, RotateCcw, Package, Calendar, User, IndianRupee, Loader2, AlertCircle, Truck, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { getReturnRequests, handleReturnRequest, scheduleReturnPickup } from '../../api/orderApi';
import Swal from 'sweetalert2';

const ReturnStatusBadge = ({ status, hasPickup }) => {
    const variants = {
        Approved: hasPickup ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-green-100 text-green-700 border-green-200',
        Pending: 'bg-amber-100 text-amber-700 border-amber-200',
        Rejected: 'bg-red-100 text-red-700 border-red-200',
        PickupScheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    const dots = {
        Approved: hasPickup ? 'bg-blue-500' : 'bg-green-500',
        Pending: 'bg-amber-500',
        Rejected: 'bg-red-500',
        PickupScheduled: 'bg-blue-500',
    };
    const label = hasPickup ? 'Pickup Scheduled' : status;
    const key = hasPickup ? 'PickupScheduled' : status;
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 w-fit ${variants[key] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dots[key] || 'bg-gray-400'}`} />
            {label}
        </span>
    );
};

const ReturnRequests = () => {
    const [returnRequests, setReturnRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const data = await getReturnRequests();
            setReturnRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching returns:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReturns(); }, []);

    const filteredRequests = returnRequests.filter(req => {
        const status = req.returnRequest?.status || 'Pending';
        const matchesStatus = filterStatus === 'all' || status.toLowerCase() === filterStatus;
        const search = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
            req.orderId?.toLowerCase().includes(search) ||
            req.user?.name?.toLowerCase().includes(search) ||
            req.user?.email?.toLowerCase().includes(search);
        return matchesStatus && matchesSearch;
    });

    const totalFiltered = filteredRequests.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const paginatedRequests = filteredRequests.slice((page - 1) * limit, page * limit);

    // Reset pagination when search or filter changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm, filterStatus]);

    const handleAction = async (id, action) => {
        if (action === 'Rejected') {
            const result = await Swal.fire({
                title: 'Reject Return Request?',
                html: `
                    <p class="text-sm text-gray-600 mb-4">Please provide a reason for rejection:</p>
                    <textarea id="swal-rejection-reason" class="swal2-textarea" placeholder="e.g. Item is not eligible for return..."></textarea>
                `,
                showCancelButton: true,
                confirmButtonText: 'Reject',
                confirmButtonColor: '#dc2626',
                cancelButtonText: 'Cancel',
                preConfirm: () => {
                    const reason = document.getElementById('swal-rejection-reason').value;
                    return reason || 'Return request rejected by admin';
                }
            });
            if (!result.isConfirmed) return;

            try {
                setProcessing(true);
                await handleReturnRequest(id, action, result.value);
                Swal.fire('Rejected', 'Return request has been rejected.', 'info');
                setShowDetailModal(false);
                fetchReturns();
            } catch (err) {
                Swal.fire('Error', err.response?.data?.message || 'Failed to reject return', 'error');
            } finally {
                setProcessing(false);
            }
        } else {
            const result = await Swal.fire({
                title: 'Approve Return Request?',
                html: `<p class="text-sm text-gray-600">Stock will be restored and refund will be credited to the customer's wallet automatically.</p>`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Approve & Refund',
                confirmButtonColor: '#16a34a',
            });
            if (!result.isConfirmed) return;

            try {
                setProcessing(true);
                await handleReturnRequest(id, action);
                Swal.fire('Approved!', 'Return approved. Refund has been credited to customer wallet.', 'success');
                setShowDetailModal(false);
                fetchReturns();
            } catch (err) {
                Swal.fire('Error', err.response?.data?.message || 'Failed to approve return', 'error');
            } finally {
                setProcessing(false);
            }
        }
    };

    const handleSchedulePickup = async (id) => {
        const result = await Swal.fire({
            title: '🚚 Schedule Return Pickup',
            html: `
                <p class="text-sm text-gray-600 mb-4">A delivery partner will be assigned to collect the item from the customer.</p>
                <label class="text-xs font-bold text-gray-500">Pickup Fee for Partner (₹)</label>
                <input id="swal-pickup-fee" type="number" class="swal2-input" value="30" min="10" max="200">
            `,
            showCancelButton: true,
            confirmButtonText: 'Schedule Pickup',
            confirmButtonColor: '#2563eb',
            preConfirm: () => {
                return parseInt(document.getElementById('swal-pickup-fee').value) || 30;
            }
        });
        if (!result.isConfirmed) return;
        try {
            setProcessing(true);
            await scheduleReturnPickup(id, result.value);
            Swal.fire('Scheduled!', 'Pickup task has been created. A delivery partner can now accept it.', 'success');
            setShowDetailModal(false);
            fetchReturns();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to schedule pickup', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const stats = {
        total: returnRequests.length,
        pending: returnRequests.filter(r => r.returnRequest?.status === 'Pending').length,
        approved: returnRequests.filter(r => r.returnRequest?.status === 'Approved').length,
        rejected: returnRequests.filter(r => r.returnRequest?.status === 'Rejected').length,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-200">
                            <RotateCcw size={20} />
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-800 text-lg">Return Requests</h5>
                            <p className="text-xs text-gray-500 mt-0.5">Manage product returns and issue refunds</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden w-full max-w-[300px] focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <div className="pl-3 text-gray-400"><Search size={16} /></div>
                        <input
                            type="text"
                            placeholder="Search order ID, customer..."
                            className="w-full px-2 py-2 bg-transparent border-none outline-none text-sm text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
                {[
                    { label: 'Total', value: stats.total, color: 'text-gray-800', bg: 'bg-gray-50', border: 'border-gray-100' },
                    { label: 'Pending', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
                    { label: 'Approved', value: stats.approved, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100' },
                    { label: 'Rejected', value: stats.rejected, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
                ].map(stat => (
                    <div key={stat.label} className={`bg-white rounded-lg border ${stat.border} px-4 py-2.5 shadow-sm flex-1 min-w-[120px] max-w-[180px]`}>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                        <p className={`text-2xl font-black mt-0.5 ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'approved', 'rejected'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-5 py-2 rounded-lg text-[13px] font-bold capitalize border transition-all ${filterStatus === s ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Request Date</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-12">
                                    <Loader2 size={24} className="animate-spin text-blue-600 mx-auto" />
                                </td></tr>
                            ) : paginatedRequests.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle size={32} className="text-gray-200" />
                                        <p className="text-sm text-gray-400 font-medium">No return requests found</p>
                                    </div>
                                </td></tr>
                            ) : (
                                paginatedRequests.map((req) => (
                                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-blue-600 text-sm">{req.orderId}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800 text-sm">{req.user?.name || 'Customer'}</p>
                                            <p className="text-xs text-gray-500">{req.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Package size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">{req.items?.[0]?.name || 'Multiple Items'}</span>
                                            </div>
                                            {req.items?.length > 1 && <p className="text-xs text-gray-400 ml-5">+{req.items.length - 1} more</p>}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-600 max-w-[200px]">
                                            <p className="font-medium">{req.returnRequest?.reason}</p>
                                            {req.returnRequest?.description && (
                                                <p className="text-gray-400 mt-0.5 line-clamp-1">{req.returnRequest.description}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800">₹{req.totalAmount?.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {req.returnRequest?.requestDate ? new Date(req.returnRequest.requestDate).toLocaleDateString('en-IN') : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <ReturnStatusBadge status={req.returnRequest?.status || 'Pending'} />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {req.returnRequest?.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(req._id, 'Approved')}
                                                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Approve"
                                                            disabled={processing}
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req._id, 'Rejected')}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Reject"
                                                            disabled={processing}
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && totalFiltered > 0 && (
                    <div className="bg-white border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-semibold text-gray-700">{((page - 1) * limit) + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(page * limit, totalFiltered)}</span> of <span className="font-semibold text-gray-700">{totalFiltered}</span> requests
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-2 rounded-lg border ${page === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} transition-all duration-300`}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    const isFirstPage = p === 1;
                                    const isLastPage = p === totalPages;
                                    const isNearCurrent = Math.abs(page - p) <= 1;

                                    if (isFirstPage || isLastPage || isNearCurrent) {
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${page === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-100'}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    } else if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-gray-400 px-1">...</span>;
                                    }
                                    return null;
                                })}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`p-2 rounded-lg border ${page === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} transition-all duration-300`}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <div>
                                <h2 className="font-bold text-gray-800 text-lg">Return Request Details</h2>
                                <p className="text-xs text-gray-400 mt-0.5">{selectedRequest.orderId}</p>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">✕</button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Customer + Order Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Customer</p>
                                    <p className="font-bold text-gray-800">{selectedRequest.user?.name}</p>
                                    <p className="text-xs text-gray-500">{selectedRequest.user?.email}</p>
                                    <p className="text-xs text-gray-500">{selectedRequest.user?.phone}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Order Value</p>
                                    <p className="font-black text-gray-800 text-xl">₹{selectedRequest.totalAmount?.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">{selectedRequest.paymentMethod?.toUpperCase()} · {selectedRequest.paymentStatus}</p>
                                </div>
                            </div>

                            {/* Return Info */}
                            <div className="border border-blue-100 bg-blue-50 rounded-xl p-4 space-y-2">
                                <p className="text-xs font-bold text-blue-700 uppercase">Return Request</p>
                                <p className="font-bold text-gray-800">{selectedRequest.returnRequest?.reason}</p>
                                {selectedRequest.returnRequest?.description && (
                                    <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-blue-100">{selectedRequest.returnRequest.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                    <span>Requested: {selectedRequest.returnRequest?.requestDate ? new Date(selectedRequest.returnRequest.requestDate).toLocaleString('en-IN') : '—'}</span>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Ordered Items</p>
                                <div className="space-y-2">
                                    {selectedRequest.items?.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />}
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity} · ₹{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rejection reason if rejected */}
                            {selectedRequest.returnRequest?.status === 'Rejected' && selectedRequest.returnRequest?.rejectionReason && (
                                <div className="border border-red-100 bg-red-50 rounded-xl p-4">
                                    <p className="text-xs font-bold text-red-600 uppercase mb-1">Rejection Reason</p>
                                    <p className="text-sm text-gray-700">{selectedRequest.returnRequest.rejectionReason}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {selectedRequest.returnRequest?.status === 'Pending' && (
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => handleAction(selectedRequest._id, 'Approved')}
                                        disabled={processing}
                                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-green-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {processing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={16} />}
                                        Approve & Stock Restore
                                    </button>
                                    <button
                                        onClick={() => handleAction(selectedRequest._id, 'Rejected')}
                                        disabled={processing}
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-red-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {processing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={16} />}
                                        Reject
                                    </button>
                                </div>
                            )}

                            {/* Schedule Pickup — shown after approval, before pickup is scheduled */}
                            {selectedRequest.returnRequest?.status === 'Approved' && !selectedRequest.returnRequest?.pickupDeliveryId && (
                                <div className="pt-2 space-y-2">
                                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
                                        <CheckCircle size={16} className="text-green-600" />
                                        <p className="text-xs font-bold text-green-700">Return approved · Stock restored</p>
                                    </div>
                                    <button
                                        onClick={() => handleSchedulePickup(selectedRequest._id)}
                                        disabled={processing}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {processing ? <Loader2 size={14} className="animate-spin" /> : <Truck size={16} />}
                                        Schedule Return Pickup · Assign Rider
                                    </button>
                                </div>
                            )}

                            {/* Pickup Already Scheduled */}
                            {selectedRequest.returnRequest?.pickupDeliveryId && (
                                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                    <Truck size={16} className="text-blue-600" />
                                    <div>
                                        <p className="text-xs font-bold text-blue-700">Pickup Scheduled</p>
                                        <p className="text-[10px] text-blue-600">A delivery partner will collect the item from the customer.</p>
                                    </div>
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
