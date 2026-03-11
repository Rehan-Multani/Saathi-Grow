import React, { useState, useEffect } from 'react';
import { 
    Search, Eye, CheckCircle, XCircle, RotateCcw, Package, 
    User, Loader2, Truck, ChevronLeft, ChevronRight, Filter,
    Plus, MapPin, Store, Check, Layers, Image, ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { getReturnRequests, handleReturnRequest, createReturnBatch } from '../../api/orderApi';
import { getDeliveryPartners } from '../../api/adminDeliveryApi';

const statusColors = {
    Pending: 'bg-amber-100 text-amber-700 border-amber-200',
    Accepted: 'bg-green-100 text-green-700 border-green-200',
    Rejected: 'bg-red-100 text-red-700 border-red-200',
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
        Pending: 'Pending',
        Accepted: 'Accepted',
        Scheduled: 'Scheduled,PickedUp',
        History: 'Rejected,Returned'
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
            // Filter only Free and Online partners
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
                text: 'This will move it to the dispatch queue.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#16a34a'
            });
            if (!confirm.isConfirmed) return;
        }

        try {
            setProcessing(true);
            await handleReturnRequest(id, action, reason);
            toast.success(`Return ${action} successfully`);
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
        if (!selectedPartner) return toast.error('Please select a rider');
        if (selectedForBatch.length === 0) return toast.error('No orders selected');

        // Determine destination from first selected order
        const firstOrder = returnRequests.find(r => r._id === selectedForBatch[0]);
        if (!firstOrder) {
            return toast.error('Selected returns are not available on this page. Please re-select.');
        }
        const destType = firstOrder.vendor ? 'vendor' : 'branch';
        const destId = firstOrder.vendor || firstOrder.branchId;

        // Verify all selected have same destination for batching efficiency
        const allSame = selectedForBatch.every(id => {
            const o = returnRequests.find(r => r._id === id);
            const myDestId = o.vendor || o.branchId;
            return myDestId === destId;
        });

        if (!allSame) {
            const confirmed = await Swal.fire({
                title: 'Mixed Destinations',
                text: 'Some selected returns belong to different stores/branches. Batched runs typically go to ONE final destination. Continue anyway?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, I know',
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
            toast.success('Batch Return Run created successfully!');
            setShowBatchModal(false);
            setSelectedForBatch([]);
            fetchReturns();
            fetchPartners();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create batch');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-lg shadow-purple-100">
                        <RotateCcw size={24} />
                    </div>
                    <div>
                        <h2 className="font-black text-gray-800 text-2xl tracking-tight">Return Management</h2>
                        <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Refined Reverse Logistics System</p>
                    </div>
                </div>

                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 w-full md:w-96 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
                    <Search className="text-gray-400 mr-3" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search across returns..." 
                        className="bg-transparent border-none outline-none text-sm w-full font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex gap-2 p-1 bg-white border border-gray-100 rounded-2xl w-fit shadow-sm overflow-x-auto">
                {['Pending', 'Accepted', 'Scheduled', 'History'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => {
                            setActiveTab(tab);
                            setSelectedForBatch([]);
                            setPage(1);
                        }}
                        className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        {tab}
                        {tab === 'Accepted' && returnRequests.filter(r => r.returnRequest.status === 'Accepted').length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-white text-purple-600 rounded-full text-[9px]">{returnRequests.filter(r => r.returnRequest.status === 'Accepted').length}</span>
                        )}
                    </button>
                ))}
            </div>

            {activeTab === 'Accepted' && selectedForBatch.length > 0 && (
                <div className="bg-purple-600 rounded-2xl p-4 flex justify-between items-center text-white shadow-xl shadow-purple-200 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Layers size={20} />
                        </div>
                        <div>
                            <p className="font-black text-lg">{selectedForBatch.length} Selected</p>
                            <p className="text-xs text-white/70">Ready to batch dispatch for pickup</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowBatchModal(true)}
                        className="px-6 py-2.5 bg-white text-purple-600 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95"
                    >
                        Schedule Batch
                    </button>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-purple-600" size={32} />
                        <p className="text-sm font-bold text-gray-400">Loading Logistic Data...</p>
                    </div>
                ) : returnRequests.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RotateCcw className="text-gray-200" size={32} />
                        </div>
                        <p className="font-bold text-gray-800">No Return Records</p>
                        <p className="text-xs text-gray-400">Everything looks clear in this section.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                {activeTab === 'Accepted' && <th className="px-6 py-4 w-12"></th>}
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Order / ID</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer / Source</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason / Description</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {returnRequests.map(r => (
                                <tr key={r._id} className={`hover:bg-gray-50/80 transition-colors group ${selectedForBatch.includes(r._id) ? 'bg-purple-50/30' : ''}`}>
                                    {activeTab === 'Accepted' && (
                                        <td className="px-6 py-4">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedForBatch.includes(r._id)}
                                                onChange={() => toggleSelection(r._id)}
                                                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                            />
                                        </td>
                                    )}
                                    <td className="px-6 py-4 font-mono font-bold text-purple-600">{r.orderId}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-black text-gray-800">{r.user?.name}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {r.vendor ? <Store size={10} className="text-purple-400" /> : <MapPin size={10} className="text-blue-400" />}
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">{r.vendor ? 'Vendor' : 'Branch'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-700 text-xs line-clamp-1">{r.returnRequest.reason}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 italic">{r.returnRequest.description}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-black text-gray-800">₹{r.totalAmount}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase ${statusColors[r.returnRequest.status]}`}>
                                            {r.returnRequest.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => setSelectedRequest(r)}
                                            className="p-2 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                                        >
                                            <Eye size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {!loading && pagination.total > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-gray-500">
                        Showing <span className="font-semibold text-gray-700">{((page - 1) * limit) + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(page * limit, pagination.total)}</span> of <span className="font-semibold text-gray-700">{pagination.total}</span> returns
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={`p-2 rounded-lg border ${page === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} transition-colors`}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs font-semibold text-gray-600">
                            Page {page} / {pagination.totalPages || 1}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(pagination.totalPages || 1, p + 1))}
                            disabled={page >= (pagination.totalPages || 1)}
                            className={`p-2 rounded-lg border ${page >= (pagination.totalPages || 1) ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} transition-colors`}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {selectedRequest && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setSelectedRequest(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 z-10"><XCircle /></button>
                        
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
                                    <RotateCcw size={22} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-800 text-xl tracking-tight">Return Insight</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{selectedRequest.orderId}</p>
                                </div>
                            </div>

                            {/* IMAGE PROOF */}
                            {selectedRequest.returnRequest.images && selectedRequest.returnRequest.images.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Image Proof</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRequest.returnRequest.images.map((img, i) => (
                                            <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-100 dark:border-white/5 hover:scale-105 transition-transform group">
                                                <img src={img} alt="proof" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Image size={16} className="text-white" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                                    <p className="font-black text-gray-800 text-sm">{selectedRequest.user?.name}</p>
                                    <p className="text-[11px] text-gray-500">{selectedRequest.user?.phone}</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Refund Amount</p>
                                    <p className="font-black text-purple-600 text-xl">₹{selectedRequest.totalAmount}</p>
                                </div>
                                {['Accepted', 'Scheduled', 'PickedUp'].includes(selectedRequest.returnRequest.status) && selectedRequest.returnRequest.returnOTP && (
                                    <div className="col-span-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                                       <div>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Pickup Verification OTP</p>
                                            <p className="font-black text-emerald-700 text-lg tracking-[0.2em]">{selectedRequest.returnRequest.returnOTP}</p>
                                       </div>
                                       <ShieldCheck className="text-emerald-200" size={32} />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Details</p>
                                {selectedRequest.items?.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                                            {item.image ? <img src={item.image} alt="" className="object-cover h-full w-full" /> : <Package className="text-gray-200" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-800 text-xs">{item.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">Qty: {item.quantity} · ₹{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-5"><RotateCcw size={48} /></div>
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Statement of Return</p>
                                <p className="text-sm font-bold text-gray-800 tracking-tight italic">"{selectedRequest.returnRequest.reason}"</p>
                            </div>

                            {selectedRequest.returnRequest.status === 'Pending' && (
                                <div className="flex gap-4 pt-4 border-t border-gray-100">
                                    <button 
                                        onClick={() => handleApproval(selectedRequest._id, 'Approved')}
                                        disabled={processing}
                                        className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        Approve Return
                                    </button>
                                    <button 
                                        onClick={() => handleApproval(selectedRequest._id, 'Rejected')}
                                        disabled={processing}
                                        className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}

                            {selectedRequest.returnRequest.status === 'Accepted' && (
                                <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center justify-center gap-3">
                                    <Clock size={16} />
                                    Ready for Dispatch scheduling
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showBatchModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl p-8 relative animate-in slide-in-from-bottom-8 duration-300">
                        <button onClick={() => setShowBatchModal(false)} className="absolute top-6 right-6 text-gray-400"><XCircle /></button>
                        
                        <div className="space-y-8">
                            <div>
                                <h3 className="font-black text-gray-800 text-2xl">Batch Dispatch</h3>
                                <p className="text-sm text-gray-400 font-medium">Assign a rider for {selectedForBatch.length} pickups</p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Logistic Partners</label>
                                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-100">
                                    {partners.length === 0 ? (
                                        <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 text-xs font-bold text-center border border-amber-100">
                                            No free riders available right now.
                                        </div>
                                    ) : partners.map(p => (
                                        <button
                                            key={p._id}
                                            onClick={() => setSelectedPartner(p._id)}
                                            className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedPartner === p._id ? 'border-purple-600 bg-purple-50/50 shadow-md shadow-purple-50' : 'border-gray-50 hover:border-purple-200 bg-gray-50/50'}`}
                                        >
                                            <div className="flex items-center gap-3 text-left">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                    <Truck size={20} className={selectedPartner === p._id ? 'text-purple-600' : 'text-gray-400'} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-gray-800">{p.user?.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{p.vehicleType} · {p.vehicleNumber}</p>
                                                </div>
                                            </div>
                                            {selectedPartner === p._id && <Check size={18} className="text-purple-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleBatchSchedule}
                                disabled={processing || !selectedPartner}
                                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {processing ? 'Initializing Logic...' : 'Create Return Delivery Run'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnRequests;
