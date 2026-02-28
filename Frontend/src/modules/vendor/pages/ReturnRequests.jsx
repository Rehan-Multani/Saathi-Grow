import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    RotateCcw, Package, CheckCircle, XCircle, Clock, Search,
    Eye, X, AlertCircle, Loader2, Truck, Store, MapPin, Phone, User, IndianRupee
} from 'lucide-react';
import { API_BASE_URL } from '../../../config/apiConfig';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const getVendorAuth = () => {
    try {
        const v = localStorage.getItem('sathiGro_vendor') || localStorage.getItem('saathigro_vendor');
        return v ? JSON.parse(v) : null;
    } catch { return null; }
};

const API = `${API_BASE_URL}/vendor`;

const statusColors = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-100',
    Approved: 'bg-green-50 text-green-700 border-green-100',
    Rejected: 'bg-red-50 text-red-700 border-red-100',
};

const SourceBadge = ({ order }) => {
    if (order?.vendor) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-[10px] font-bold">
                <Store size={10} /> Vendor Store
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[10px] font-bold">
            <Package size={10} /> Branch
        </span>
    );
};

const ReturnRequests = () => {
    const [returnRequests, setReturnRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [processing, setProcessing] = useState(false);

    const fetchReturns = useCallback(async () => {
        const auth = getVendorAuth();
        if (!auth) { setLoading(false); return; }
        try {
            setLoading(true);
            // Use vendor-specific endpoint that auto-filters by vendor ID
            const { data } = await axios.get(`${API}/returns`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setReturnRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching vendor returns:', err);
            setReturnRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchReturns(); }, [fetchReturns]);

    const handleAction = async (orderId, action) => {
        const auth = getVendorAuth();
        if (!auth) return;

        let rejectionReason = null;
        if (action === 'Rejected') {
            const result = await Swal.fire({
                title: 'Reject Return Request',
                input: 'textarea',
                inputLabel: 'Reason for rejection',
                inputPlaceholder: 'Explain why the return is being rejected...',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                confirmButtonText: 'Reject',
                inputValidator: (v) => !v && 'Please provide a rejection reason.'
            });
            if (!result.isConfirmed) return;
            rejectionReason = result.value;
        } else {
            const confirm = await Swal.fire({
                title: 'Approve Return?',
                html: '<p class="text-sm text-gray-600">This will restore stock. Refund will be processed after the delivery partner returns the item to your store.</p>',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Approve',
                confirmButtonColor: '#16a34a',
            });
            if (!confirm.isConfirmed) return;
        }

        try {
            setProcessing(true);
            await axios.put(`${API}/returns/${orderId}`, { action, rejectionReason }, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            toast.success(action === 'Approved' ? 'Return approved! Stock restored.' : 'Return rejected.');
            setSelectedRequest(null);
            fetchReturns();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update return request');
        } finally {
            setProcessing(false);
        }
    };

    const handleSchedulePickup = async (orderId) => {
        const auth = getVendorAuth();
        if (!auth) return;

        const result = await Swal.fire({
            title: '🚚 Schedule Return Pickup',
            html: `
                <p class="text-sm text-gray-600 mb-4">A SaathiGro delivery partner will collect the item from the customer and bring it to your store.</p>
                <label class="text-xs font-bold text-gray-500">Pickup Fee for Partner (₹)</label>
                <input id="swal-pickup-fee" type="number" class="swal2-input" value="30" min="10" max="200">
            `,
            showCancelButton: true,
            confirmButtonText: 'Schedule Pickup',
            confirmButtonColor: '#7c3aed',
            preConfirm: () => parseInt(document.getElementById('swal-pickup-fee').value) || 30
        });

        if (!result.isConfirmed) return;

        try {
            setProcessing(true);
            await axios.post(`${API}/returns/${orderId}/schedule-pickup`, { pickupFee: result.value }, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            Swal.fire('Scheduled!', 'A delivery partner can now accept this return pickup task.', 'success');
            setSelectedRequest(null);
            fetchReturns();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to schedule pickup', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const filteredRequests = returnRequests.filter(r => {
        const status = r.returnRequest?.status || 'Pending';
        const matchesStatus = filterStatus === 'all' || status.toLowerCase() === filterStatus;
        const search = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            r.orderId?.toLowerCase().includes(search) ||
            r.user?.name?.toLowerCase().includes(search) ||
            r.items?.[0]?.name?.toLowerCase().includes(search);
        return matchesStatus && matchesSearch;
    });

    const stats = {
        total: returnRequests.length,
        pending: returnRequests.filter(r => r.returnRequest?.status === 'Pending').length,
        approved: returnRequests.filter(r => r.returnRequest?.status === 'Approved').length,
        rejected: returnRequests.filter(r => r.returnRequest?.status === 'Rejected').length,
        pickupScheduled: returnRequests.filter(r => r.returnRequest?.pickupDeliveryId).length,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-600 rounded-xl text-white shadow-md shadow-purple-200">
                            <RotateCcw size={20} />
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-800 text-lg">Return Requests — Your Store</h5>
                            <p className="text-xs text-gray-500 mt-0.5">Manage returns for orders fulfilled from your vendor store</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchReturns}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                    >
                        <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'bg-gray-50 text-gray-700 border-gray-100' },
                    { label: 'Pending', value: stats.pending, color: 'bg-amber-50 text-amber-700 border-amber-100' },
                    { label: 'Approved', value: stats.approved, color: 'bg-green-50 text-green-700 border-green-100' },
                    { label: 'Rejected', value: stats.rejected, color: 'bg-red-50 text-red-700 border-red-100' },
                    { label: 'Pickup Scheduled', value: stats.pickupScheduled, color: 'bg-blue-50 text-blue-700 border-blue-100' },
                ].map(s => (
                    <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                        <p className="text-2xl font-black">{s.value}</p>
                        <p className="text-xs font-medium mt-1 opacity-70">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by order ID, customer name or item..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['all', 'pending', 'approved', 'rejected'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilterStatus(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filterStatus === f ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={28} className="animate-spin text-purple-500" />
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-gray-400">
                        <Package size={40} className="mb-3 opacity-30" />
                        <p className="font-medium text-sm">No return requests found</p>
                        <p className="text-xs mt-1 opacity-70">Returns from your vendor store orders will appear here</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {['Order ID', 'Customer', 'Amount', 'Reason', 'Status', 'Pickup', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredRequests.map(request => (
                                    <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="font-mono font-bold text-gray-800 text-xs">{request.orderId}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800">{request.user?.name}</p>
                                            <p className="text-xs text-gray-400">{request.user?.phone}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-bold text-gray-800">₹{request.totalAmount}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-xs text-gray-600 max-w-[140px] truncate">
                                                {request.returnRequest?.reason || '—'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[request.returnRequest?.status] || statusColors.Pending}`}>
                                                {request.returnRequest?.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {request.returnRequest?.pickupDeliveryId ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[10px] font-bold">
                                                    <Truck size={10} /> Scheduled
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setSelectedRequest(request)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-purple-50 hover:text-purple-700 text-gray-600 rounded-lg text-xs font-medium transition-all"
                                            >
                                                <Eye size={13} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                    <RotateCcw size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">Return Request</h3>
                                    <p className="text-xs text-gray-400 font-mono">{selectedRequest.orderId}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Source */}
                            <div className="flex items-center gap-2">
                                <SourceBadge order={selectedRequest} />
                                <span className="text-[10px] text-gray-400 font-bold">
                                    {selectedRequest.vendor ? 'This order was from your store' : 'Branch order'}
                                </span>
                            </div>

                            {/* Order Value */}
                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-purple-600 uppercase">Order Value</p>
                                    <p className="text-2xl font-black text-gray-800">₹{selectedRequest.totalAmount}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-medium">Requested</p>
                                    <p className="text-xs font-bold text-gray-600">
                                        {selectedRequest.returnRequest?.requestDate
                                            ? new Date(selectedRequest.returnRequest.requestDate).toLocaleDateString('en-IN')
                                            : '—'}
                                    </p>
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Customer</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-white border border-gray-100 rounded-xl flex items-center justify-center">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">{selectedRequest.user?.name}</p>
                                        <p className="text-xs text-gray-500">{selectedRequest.user?.email}</p>
                                    </div>
                                    <a href={`tel:${selectedRequest.user?.phone}`} className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                        <Phone size={14} />
                                    </a>
                                </div>
                            </div>

                            {/* Return Reason */}
                            <div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-xl p-4">
                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Return Reason</p>
                                <p className="text-sm font-bold text-gray-800">{selectedRequest.returnRequest?.reason || '—'}</p>
                                {selectedRequest.returnRequest?.description && (
                                    <p className="text-xs text-gray-500 mt-1">{selectedRequest.returnRequest.description}</p>
                                )}
                            </div>

                            {/* Items */}
                            {selectedRequest.items?.length > 0 && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Items</p>
                                    <div className="space-y-2">
                                        {selectedRequest.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100">
                                                {item.image && <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                                                    <p className="text-[9px] text-gray-400">Qty: {item.quantity} · ₹{item.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rejection reason if any */}
                            {selectedRequest.returnRequest?.status === 'Rejected' && selectedRequest.returnRequest?.rejectionReason && (
                                <div className="border border-red-100 bg-red-50 rounded-xl p-4">
                                    <p className="text-xs font-bold text-red-600 uppercase mb-1">Rejection Reason</p>
                                    <p className="text-sm text-gray-700">{selectedRequest.returnRequest.rejectionReason}</p>
                                </div>
                            )}

                            {/* Actions */}
                            {selectedRequest.returnRequest?.status === 'Pending' && (
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => handleAction(selectedRequest._id, 'Approved')}
                                        disabled={processing}
                                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-green-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {processing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={16} />}
                                        Approve & Restore Stock
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

                            {/* Schedule Pickup — after approval, before scheduling */}
                            {selectedRequest.returnRequest?.status === 'Approved' && !selectedRequest.returnRequest?.pickupDeliveryId && (
                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
                                        <CheckCircle size={16} className="text-green-600" />
                                        <p className="text-xs font-bold text-green-700">Return approved · Stock restored to your store</p>
                                    </div>
                                    <button
                                        onClick={() => handleSchedulePickup(selectedRequest._id)}
                                        disabled={processing}
                                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-purple-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {processing ? <Loader2 size={14} className="animate-spin" /> : <Truck size={16} />}
                                        Schedule Return Pickup → Your Store
                                    </button>
                                    <p className="text-[10px] text-gray-400 text-center">
                                        A delivery partner will collect the item from the customer and deliver it to your store
                                    </p>
                                </div>
                            )}

                            {/* Pickup Already Scheduled */}
                            {selectedRequest.returnRequest?.pickupDeliveryId && (
                                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                    <Truck size={18} className="text-blue-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-blue-700">Pickup Scheduled</p>
                                        <p className="text-xs text-blue-600">A delivery partner will collect the item and bring it to your store.</p>
                                    </div>
                                </div>
                            )}

                            {/* Returned to store */}
                            {selectedRequest.status === 'returned' && (
                                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                                    <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-green-700">Item Returned to Store</p>
                                        <p className="text-xs text-green-600">Customer has been refunded. Return cycle complete.</p>
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
