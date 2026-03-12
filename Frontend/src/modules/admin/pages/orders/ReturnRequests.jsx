import React, { useState, useEffect } from 'react';
import {
    Search, Eye, CheckCircle, XCircle, RotateCcw, Package,
    User, Loader2, Truck, ChevronLeft, ChevronRight, Filter,
    Plus, MapPin, Store, Check, Layers, Image, ShieldCheck, Clock
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { getReturnRequests, handleReturnRequest, createReturnBatch } from '../../api/orderApi';
import { getDeliveryPartners } from '../../api/adminDeliveryApi';

const statusColors = {
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Accepted: 'bg-green-100 text-green-700 border-green-200',
    Approved: 'bg-green-100 text-green-700 border-green-200',
    Rejected: 'bg-orange-100 text-orange-700 border-orange-200',
    FinalRejected: 'bg-red-100 text-red-700 border-red-200',
    Scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    PickedUp: 'bg-purple-100 text-purple-700 border-purple-200',
    Returned: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const ReturnRequests = () => {
    const [returnRequests, setReturnRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeTab, setActiveTab] = useState('Pending');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [selectedForBatch, setSelectedForBatch] = useState([]);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    const tabStatusMap = {
        Pending: 'Pending,Rejected',
        Accepted: 'Accepted,Approved',
        Scheduled: 'Scheduled,PickedUp',
        History: 'FinalRejected,Returned'
    };

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const { returns, pagination: paginationData } = await getReturnRequests(
                {
                    page,
                    limit,
                    search: debouncedSearch,
                    status: tabStatusMap[activeTab] || 'Pending'
                },
                { paginated: true }
            );
            setReturnRequests(Array.isArray(returns) ? returns : []);
            setPagination(paginationData || { total: 0, totalPages: 1, page, limit });
        } catch (error) {
            toast.error('Failed to load returns');
        } finally {
            setLoading(false);
        }
    };

    const fetchPartners = async () => {
        try {
            const data = await getDeliveryPartners();
            setPartners(data.filter(p => p.assignmentStatus === 'Free' && p.dutyStatus === 'Online'));
        } catch (error) {
            console.error('Error fetching partners:', error);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchReturns();
    }, [page, activeTab, debouncedSearch]);

    useEffect(() => {
        setSelectedForBatch([]);
    }, [page, activeTab, debouncedSearch]);

    const handleApproval = async (id, action) => {
        let reason = null;
        if (action === 'Rejected') {
            const { value } = await Swal.fire({
                title: 'Reject Return Request',
                input: 'textarea',
                inputLabel: 'Reason',
                showCancelButton: true,
                inputValidator: (v) => !v && 'Reason required'
            });
            if (!value) return;
            reason = value;
        } else {
            const confirm = await Swal.fire({
                title: 'Approve Return?',
                text: 'Moving to dispatch queue.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#7c3aed'
            });
            if (!confirm.isConfirmed) return;
        }

        try {
            setProcessing(true);
            await handleReturnRequest(id, action, reason);
            toast.success(`Return ${action} recorded`);
            fetchReturns();
            setSelectedRequest(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setProcessing(false);
        }
    };

    const toggleSelection = (id) => {
        setSelectedForBatch(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBatchSchedule = async () => {
        if (!selectedPartner) return toast.error('Select a rider');
        if (selectedForBatch.length === 0) return toast.error('No selections');

        const firstOrder = returnRequests.find(r => r._id === selectedForBatch[0]);
        if (!firstOrder) return toast.error('Session mismatch. Refresh.');

        const destType = firstOrder.vendor ? 'vendor' : 'branch';
        const destId = firstOrder.vendor || firstOrder.branchId;

        const allSame = selectedForBatch.every(id => {
            const o = returnRequests.find(r => r._id === id);
            if (!o) return false;
            const myVendorId = o.vendor?._id || o.vendor;
            const myBranchId = o.branchId?._id || o.branchId;
            const myDestId = myVendorId || myBranchId;
            return myDestId && String(myDestId) === destIdStr;
        });

        if (!allSame) {
            const confirmed = await Swal.fire({
                title: 'Mixed Destinations',
                text: 'Different stores/branches selected. Continue?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#7c3aed'
            });
            if (!confirmed.isConfirmed) return;
        }

        try {
            setProcessing(true);
            await createReturnBatch({
                partnerId: selectedPartner,
                orderIds: selectedForBatch,
                destinationType: destType,
                destinationId: destId
            });
            toast.success('Return delivery run initialized!');
            setShowBatchModal(false);
            setSelectedForBatch([]);
            fetchReturns();
            fetchPartners();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Batch creation failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
            {/* Header: Compact & Premium */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center text-white shadow-lg shadow-purple-100">
                        <RotateCcw size={18} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800 text-lg leading-tight">Return Management</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Logistics Control</span>
                            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                            <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">{pagination.total} Active Requests</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 w-full md:w-72 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                        <Search className="text-gray-400 mr-2" size={14} />
                        <input 
                            type="text" 
                            placeholder="Find by ID or Customer..." 
                            className="bg-transparent border-none outline-none text-xs w-full font-medium placeholder:text-gray-300"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tabs: Sleek & Compact */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex p-1 bg-white border border-gray-100 rounded-lg shadow-sm">
                    {['Pending', 'Accepted', 'Scheduled', 'History'].map(tab => {
                        const count = tab === 'Accepted' 
                            ? returnRequests.filter(r => ['Accepted', 'Approved'].includes(r.returnRequest.status)).length 
                            : tab === 'Pending' 
                                ? returnRequests.filter(r => r.returnRequest.status === 'Rejected').length 
                                : 0;

                        return (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setPage(1); }}
                                className={`px-5 py-1.5 rounded-md text-[11px] font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${activeTab === tab ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                            >
                                {tab}
                                {count > 0 && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeTab === tab ? 'bg-white text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {activeTab === 'Accepted' && selectedForBatch.length > 0 && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setShowBatchModal(true)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider shadow-md shadow-purple-100 transition-all active:scale-95"
                        >
                            <Layers size={14} />
                            Dispatch {selectedForBatch.length} Picks
                        </button>
                    </div>
                )}
            </div>

            {/* Table: Dense & Professional */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="py-16 text-center">
                        <Loader2 className="animate-spin text-purple-600 mx-auto mb-3" size={24} />
                        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Sycing Logistics...</p>
                    </div>
                ) : returnRequests.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                            <RotateCcw className="text-gray-200" size={20} />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">Quiet Moment</h4>
                        <p className="text-[11px] text-gray-400 italic">No returns found in this filter.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {activeTab === 'Accepted' && (
                                        <th className="px-4 py-3 w-10 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedForBatch.length === returnRequests.length && returnRequests.length > 0}
                                                onChange={() => {
                                                    if (selectedForBatch.length === returnRequests.length) setSelectedForBatch([]);
                                                    else setSelectedForBatch(returnRequests.map(r => r._id));
                                                }}
                                                className="w-3.5 h-3.5 rounded border-gray-300 text-purple-600 focus:ring-transparent"
                                            />
                                        </th>
                                    )}
                                    <th className="px-4 py-3 text-left">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Return ID</span>
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Source & Client</span>
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Context</span>
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Value</span>
                                    </th>
                                    <th className="px-4 py-3 text-center">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Condition</span>
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Action</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {returnRequests.map(r => (
                                    <tr key={r._id} className={`hover:bg-gray-50/50 transition-colors group ${selectedForBatch.includes(r._id) ? 'bg-purple-50/20' : ''}`}>
                                        {activeTab === 'Accepted' && (
                                            <td className="px-4 py-2.5 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedForBatch.includes(r._id)}
                                                    onChange={() => toggleSelection(r._id)}
                                                    className="w-3.5 h-3.5 rounded border-gray-300 text-purple-600 focus:ring-transparent cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        <td className="px-4 py-2.5">
                                            <div className="flex flex-col">
                                                <span className="font-mono font-bold text-purple-600">#{r.orderId?.slice(-8)}</span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase">{new Date(r.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-gray-800 truncate">{r.user?.name}</span>
                                                    <div className="flex items-center gap-1">
                                                        {r.vendor ? <Store size={8} className="text-purple-400" /> : <MapPin size={8} className="text-blue-400" />}
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase truncate">
                                                            {r.vendor ? `Store: ${r.vendor.storeName}` : `Branch: ${r.branchId?.name || 'Main'}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 max-w-[200px]">
                                            <p className="font-bold text-gray-700 leading-tight truncate">{r.returnRequest.reason}</p>
                                            <p className="text-[10px] text-gray-400 truncate italic">{r.returnRequest.description}</p>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <span className="font-bold text-gray-800">₹{r.totalAmount?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-tighter ${statusColors[r.returnRequest.status]}`}>
                                                    {r.returnRequest.status}
                                                </span>
                                                {r.returnRequest.status === 'Rejected' && (
                                                    <span className="text-[8px] text-red-500 font-bold uppercase">Store Denied</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <button 
                                                onClick={() => setSelectedRequest(r)}
                                                className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all border border-transparent hover:border-purple-100"
                                            >
                                                <Eye size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination: Compact */}
            {!loading && pagination.total > 0 && (
                <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 flex items-center justify-between shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <span className="text-gray-700">{((page - 1) * limit) + 1}-{Math.min(page * limit, pagination.total)}</span> of {pagination.total}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-1.5 rounded-md border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <span className="text-[10px] font-bold text-gray-600 px-2 uppercase">Page {page} / {pagination.totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={page >= pagination.totalPages}
                            className="p-1.5 rounded-md border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Insight Modal: Rebuilt Compact */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="p-5 space-y-5">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                        <RotateCcw size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-base leading-none">Return Details</h3>
                                        <p className="text-[10px] font-mono font-bold text-gray-400 mt-1 uppercase tracking-wider">#{selectedRequest.orderId}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedRequest(null)} className="p-1 text-gray-300 hover:text-gray-800 transition-colors"><XCircle size={20} /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Customer</p>
                                    <p className="font-bold text-gray-800 text-[11px] truncate">{selectedRequest.user?.name}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{selectedRequest.user?.phone}</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                                    <p className="text-[9px] font-black text-purple-400 uppercase mb-1">Value</p>
                                    <p className="font-bold text-purple-600 text-sm">₹{selectedRequest.totalAmount?.toLocaleString()}</p>
                                    <p className="text-[10px] text-purple-400 mt-0.5 font-bold uppercase">Pre-tax</p>
                                </div>
                            </div>

                            {selectedRequest.returnRequest.images?.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Visual Evidence</p>
                                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                        {selectedRequest.returnRequest.images.map((img, i) => (
                                            <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:scale-105 transition-transform active:scale-95">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Line Items</p>
                                {selectedRequest.items?.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <div className="w-8 h-8 bg-white rounded border border-gray-100 overflow-hidden shrink-0">
                                            {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <Package size={12} className="m-auto text-gray-200" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-800 text-[10px] truncate leading-tight">{item.name}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase">Qty: {item.quantity} · ₹{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl shadow-inner-sm">
                                <p className="text-[9px] font-black text-amber-600 uppercase mb-1">Issue Claimed</p>
                                <p className="text-[11px] font-bold text-gray-700 italic leading-snug">"{selectedRequest.returnRequest.reason}"</p>
                            </div>

                            {['Pending', 'Rejected'].includes(selectedRequest.returnRequest.status) && (
                                <div className="space-y-3 pt-2">
                                    {selectedRequest.returnRequest.status === 'Rejected' && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                                            <p className="text-[9px] font-black text-red-600 uppercase mb-0.5 tracking-tight">System Notice: Store Rejection</p>
                                            <p className="text-[10px] font-bold text-gray-700 italic truncate">"{selectedRequest.returnRequest.rejectionReason || 'No context'}"</p>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleApproval(selectedRequest._id, 'Accepted')}
                                            disabled={processing}
                                            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {selectedRequest.returnRequest.status === 'Rejected' ? 'Overrule & Yes' : 'Approve'}
                                        </button>
                                        <button 
                                            onClick={() => handleApproval(selectedRequest._id, 'Rejected')}
                                            disabled={processing}
                                            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {selectedRequest.returnRequest.status === 'Rejected' ? 'Final Deny' : 'Reject'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedRequest.returnRequest.status === 'Accepted' && (
                                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-center text-[9px] font-black uppercase tracking-widest border border-blue-100 flex items-center justify-center gap-2">
                                    <Clock size={12} /> Pending Logistics Batching
                                </div>
                            )}

                            {['Scheduled', 'PickedUp', 'Returned'].includes(selectedRequest.returnRequest.status) && selectedRequest.returnRequest.returnOTP && (
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider mb-0.5">Verification Key</p>
                                        <p className="font-bold text-emerald-700 text-base tracking-[0.3em]">{selectedRequest.returnRequest.returnOTP}</p>
                                    </div>
                                    <ShieldCheck className="text-emerald-200" size={24} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Batch Modal: Rebuilt Compact */}
            {showBatchModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 relative animate-in slide-in-from-bottom-4 duration-300 border border-gray-100">
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Assign Logistics</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{selectedForBatch.length} Items for Pickup</p>
                                </div>
                                <button onClick={() => setShowBatchModal(false)} className="text-gray-300 hover:text-gray-800 transition-colors"><XCircle size={20} /></button>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Available Fleet</label>
                                <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-1">
                                    {partners.length === 0 ? (
                                        <div className="p-4 bg-amber-50 rounded-xl text-amber-600 text-[11px] font-bold text-center border border-amber-100 italic">
                                            No active riders in vicinity.
                                        </div>
                                    ) : partners.map(p => (
                                        <button
                                            key={p._id}
                                            onClick={() => setSelectedPartner(p._id)}
                                            className={`p-3 rounded-xl border transition-all flex items-center justify-between group ${selectedPartner === p._id ? 'border-purple-600 bg-purple-50/30' : 'border-gray-100 hover:border-purple-200 bg-gray-50/50'}`}
                                        >
                                            <div className="flex items-center gap-3 text-left min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                                    <Truck size={14} className={selectedPartner === p._id ? 'text-purple-600' : 'text-gray-400'} />
                                                </div>
                                                <div className="truncate">
                                                    <p className="font-bold text-xs text-gray-800 leading-tight truncate">{p.user?.name}</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{p.vehicleType} · {p.vehicleNumber?.slice(-4)}</p>
                                                </div>
                                            </div>
                                            {selectedPartner === p._id && <Check size={14} className="text-purple-600 shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleBatchSchedule}
                                disabled={processing || !selectedPartner}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-purple-100 transition-all active:scale-95 disabled:opacity-40"
                            >
                                {processing ? 'Initializing...' : 'Confirm Delivery Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnRequests;
