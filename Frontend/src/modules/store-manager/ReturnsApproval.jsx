import React, { useState, useEffect } from 'react';
import { 
    RotateCcw, CheckCircle2, XCircle, AlertCircle, Info, 
    ChevronRight, Package, Calendar, Search, Loader2,
    ChevronLeft, ListFilter, ClipboardCheck, History
} from 'lucide-react';
import ReturnApprovalModal from './components/ReturnApprovalModal';
import { getReturnRequests, handleReturnRequest } from '../../common/api/orderApi';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

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

const ReturnsApproval = () => {
    const [returnRequests, setReturnRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Pending');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const limit = 10;

    const tabStatusMap = {
        Pending: 'Pending',
        Approved: 'Accepted,Approved',
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
                setReturnRequests(data.returns);
                setPagination(data.pagination);
            } else {
                setReturnRequests(Array.isArray(data) ? data : []);
                setPagination({ total: data.length, totalPages: 1 });
            }
        } catch (error) {
            console.error('Failed to fetch returns:', error);
            toast.error('Could not load return requests');
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

    const handleApprove = async (request) => {
        try {
            await handleReturnRequest(request._id, 'Accepted');
            toast.success('Return accepted successfully');
            fetchReturns();
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept return');
        }
    };

    const handleReject = async (id) => {
        const result = await Swal.fire({
            title: 'Reject Audit Ticket?',
            input: 'textarea',
            inputLabel: 'Reason for Rejection',
            inputPlaceholder: 'Enter detailed observation for rejection...',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            inputValidator: (v) => !v && 'Reason is required'
        });

        if (!result.isConfirmed) return;

        try {
            await handleReturnRequest(id, 'Rejected', result.value);
            toast.success('Return rejected successfully');
            fetchReturns();
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject return');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header Section */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-slate-900 rounded-[1.5rem] text-white shadow-2xl shadow-slate-200">
                            <ClipboardCheck size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Quality Assurance</h2>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-0.5">Inventory Return Audit Log</p>
                        </div>
                    </div>
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search Reference # or Customer..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-[1.5rem] outline-none text-sm font-bold transition-all focus:bg-white focus:ring-4 focus:ring-slate-100"
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3 p-2 bg-slate-50 border border-slate-100 rounded-[2rem] w-fit shadow-inner">
                {['Pending', 'Approved', 'History'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setPage(1); }}
                        className={`px-10 py-3.5 rounded-[1.5rem] text-xs font-black tracking-widest uppercase transition-all flex items-center gap-3 ${activeTab === tab ? 'bg-slate-900 text-white shadow-xl shadow-slate-300 scale-105' : 'text-slate-400 hover:text-slate-900 hover:bg-white'}`}
                    >
                        {tab === 'Pending' && <ListFilter size={16} />}
                        {tab === 'Approved' && <CheckCircle2 size={16} />}
                        {tab === 'History' && <History size={16} />}
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Order Reference</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Customer Detail</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Audit Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Amount</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="animate-spin text-slate-900" size={40} />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validating Chain Records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : returnRequests.length > 0 ? (
                                returnRequests.map((request) => (
                                    <tr key={request._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-10 py-8">
                                            <div className="text-sm font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">#{request.orderId}</div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                                                <Calendar size={12} className="text-slate-300" />
                                                {new Date(request.returnRequest?.requestDate || request.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-sm font-black text-slate-800">{request.user?.name}</p>
                                            <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{request.user?.phone}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border tracking-widest uppercase items-center gap-2 inline-flex ${statusColors[request.returnRequest?.status] || statusColors.Pending}`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
                                                {request.returnRequest?.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <p className="text-lg font-black text-slate-900 tracking-tighter">₹{request.totalAmount}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex justify-end">
                                                {(request.returnRequest?.status === 'Pending' || request.returnRequest?.status === 'Rejected') ? (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest({
                                                                id: request._id,
                                                                _id: request._id,
                                                                orderId: request.orderId,
                                                                productName: request.items?.[0]?.product?.name || 'Items',
                                                                quantity: request.items?.length || 1,
                                                                status: request.returnRequest?.status || 'Pending',
                                                                reason: request.returnRequest?.reason,
                                                                description: request.returnRequest?.description,
                                                                images: request.returnRequest?.images,
                                                                amount: request.totalAmount
                                                            }); setIsModalOpen(true);
                                                        }}
                                                        className="px-6 py-3 text-[10px] font-black text-white bg-slate-900 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest active:scale-95 flex items-center gap-2 group/btn"
                                                    >
                                                        Audit Ticket
                                                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl">
                                                        <ClipboardCheck size={14} />
                                                        Archived
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center">
                                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                            <Package size={48} />
                                        </div>
                                        <p className="text-lg font-black text-slate-900">Queue Purged</p>
                                        <p className="text-sm text-slate-400 font-medium">No valid audit entries found in this scope.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination.total > 0 && (
                    <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Reference Logs <span className="text-slate-900">{((page - 1) * limit) + 1} â€” {Math.min(page * limit, pagination.total)}</span> of <span className="text-slate-900">{pagination.total}</span> entries
                        </p>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-3 rounded-2xl border-2 transition-all ${page === 1 ? 'border-slate-100 text-slate-200 cursor-not-allowed' : 'border-slate-200 text-slate-700 hover:bg-slate-900 hover:border-slate-900 hover:text-white shadow-lg shadow-slate-50'}`}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 shadow-inner">
                                {page} / {pagination.totalPages}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page >= pagination.totalPages}
                                className={`p-3 rounded-2xl border-2 transition-all ${page >= pagination.totalPages ? 'border-slate-100 text-slate-200 cursor-not-allowed' : 'border-slate-200 text-slate-700 hover:bg-slate-900 hover:border-slate-900 hover:text-white shadow-lg shadow-slate-50'}`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Restocking Insight Section */}
            <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-slate-800 flex flex-col lg:flex-row gap-12 shadow-3xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-600/20 transition-all duration-1000"></div>
                
                <div className="flex-1 space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                            <Info size={24} />
                        </div>
                        <h4 className="text-2xl font-black text-white tracking-tight italic">Audit Protocol v2.1</h4>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xl font-medium">
                        Manual validation of returned assets is <span className="text-white font-bold">mandatory</span> before final restocking.
                        <span className="text-emerald-400 block mt-2">â— Only authorize items verified as 100% resalable condition.</span>
                    </p>
                </div>

                <div className="hidden lg:block w-px h-32 bg-gradient-to-b from-transparent via-slate-800 to-transparent self-center"></div>

                <div className="flex-1 space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/20">
                            <AlertCircle size={24} />
                        </div>
                        <h4 className="text-2xl font-black text-white tracking-tight italic">Disposal Logic</h4>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xl font-medium">
                        Items failing the discrepancy check must be flagged as <span className="text-rose-400 font-bold underline decoration-rose-400/30">Stock Shrinkage</span>.
                        Documented disposal is required for compliance.
                    </p>
                </div>
            </div>

            <ReturnApprovalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                request={selectedRequest}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
};

export default ReturnsApproval;
