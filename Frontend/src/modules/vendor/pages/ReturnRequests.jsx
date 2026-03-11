import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    RotateCcw, Package, CheckCircle, XCircle, Search,
    Eye, X, Loader2, Store, Phone, User, ChevronLeft, ChevronRight, Image
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

const API = `${API_BASE_URL}/vendors`;

const statusColors = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-100',
    Accepted: 'bg-green-50 text-green-700 border-green-100 text-uppercase',
    Rejected: 'bg-red-50 text-red-700 border-red-100',
    Scheduled: 'bg-blue-50 text-blue-700 border-blue-100',
    PickedUp: 'bg-purple-50 text-purple-700 border-purple-100',
    Returned: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const ReturnRequests = () => {
    const [returnRequests, setReturnRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchReturns = useCallback(async () => {
        const auth = getVendorAuth();
        if (!auth) { setLoading(false); return; }
        try {
            setLoading(true);
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
                title: 'Accept Return?',
                html: '<p class="text-sm text-gray-600">This signifies your store accepts the return. Admin will then schedule a rider to collect the item. Stock will be restored now.</p>',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Accept',
                confirmButtonColor: '#16a34a',
            });
            if (!confirm.isConfirmed) return;
        }

        try {
            setProcessing(true);
            await axios.put(`${API}/returns/${orderId}`, { action: action === 'Accepted' ? 'Accepted' : 'Rejected', rejectionReason }, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            toast.success(action === 'Accepted' ? 'Return accepted! Stock restored.' : 'Return rejected.');
            setSelectedRequest(null);
            fetchReturns();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update return request');
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
            r.user?.name?.toLowerCase().includes(search);
        return matchesStatus && matchesSearch;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-600 rounded-xl text-white shadow-md shadow-purple-200">
                            <RotateCcw size={20} />
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-800 text-lg">Return Requests</h5>
                            <p className="text-xs text-gray-500">Approve returns for items fulfilled by your store</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -track -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search order ID or customer..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'accepted', 'scheduled', 'returned'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilterStatus(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filterStatus === f ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" /></div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentRequests.map(request => (
                                <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-purple-600">{request.orderId}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold">{request.user?.name}</p>
                                        <p className="text-xs text-gray-400">{request.user?.phone}</p>
                                    </td>
                                    <td className="px-6 py-4 font-bold">₹{request.totalAmount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[request.returnRequest?.status] || statusColors.Pending}`}>
                                            {request.returnRequest?.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => setSelectedRequest(request)} className="p-2 text-gray-400 hover:text-purple-600"><Eye size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">Return Details</h3>
                            <button onClick={() => setSelectedRequest(null)} className="p-1 text-gray-400 hover:text-gray-600"><X /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-purple-50 rounded-xl p-4">
                                <p className="text-xs font-bold text-purple-600 uppercase mb-1">Return Reason</p>
                                <p className="text-sm font-bold text-gray-800">{selectedRequest.returnRequest?.reason || '—'}</p>
                                {selectedRequest.returnRequest?.description && <p className="text-xs text-gray-500 mt-1">{selectedRequest.returnRequest.description}</p>}
                            </div>

                            {/* Image Proof Display */}
                            {selectedRequest.returnRequest?.images && selectedRequest.returnRequest.images.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Image Proof</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRequest.returnRequest.images.map((img, i) => (
                                            <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 group">
                                                <img src={img} alt="proof" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Image size={16} className="text-white" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <p className="text-xs font-bold text-gray-400 uppercase">Customer Info</p>
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                                    <User className="text-gray-400" />
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800 text-sm">{selectedRequest.user?.name}</p>
                                        <p className="text-xs text-gray-500">{selectedRequest.user?.phone}</p>
                                    </div>
                                    <a href={`tel:${selectedRequest.user?.phone}`} className="p-2 bg-green-100 text-green-600 rounded-lg"><Phone size={14} /></a>
                                </div>
                            </div>

                            {selectedRequest.returnRequest?.status === 'Pending' && (
                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => handleAction(selectedRequest._id, 'Accepted')}
                                        disabled={processing}
                                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold transition-all hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Processing...' : 'Accept Return'}
                                    </button>
                                    <button
                                        onClick={() => handleAction(selectedRequest._id, 'Rejected')}
                                        disabled={processing}
                                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold transition-all hover:bg-red-700 disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}

                            {selectedRequest.returnRequest?.status === 'Accepted' && (
                                <div className="p-4 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-center">
                                    <p className="text-sm font-bold">Waiting for Admin to assign rider</p>
                                    <p className="text-[10px] mt-1 opacity-70">You accepted this return. Logistics are being managed centrally.</p>
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

