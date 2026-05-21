import React, { useState, useEffect } from 'react';
import { 
    RotateCcw, CheckCircle2, XCircle, AlertCircle, Info, 
    ChevronRight, Package, Calendar, Search, Loader2,
    ChevronLeft, ListFilter, ClipboardCheck, History, ArrowRight
} from 'lucide-react';
import ReturnApprovalModal from './components/ReturnApprovalModal';
import { getReturnRequests, handleReturnRequest } from '../../common/api/orderApi';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const statusColors = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Approved: 'bg-green-50 text-green-700 border-green-200',
    Rejected: 'bg-orange-50 text-orange-700 border-orange-200',
    FinalRejected: 'bg-red-50 text-red-700 border-red-200',
    Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    PickedUp: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Returned: 'bg-teal-50 text-teal-700 border-teal-200',
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
                    search: searchTerm.trim(),
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
            toast.success('Return request accepted');
            fetchReturns();
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept return');
        }
    };

    const handleReject = async (id) => {
        const result = await Swal.fire({
            title: 'Reject Return Request?',
            input: 'textarea',
            inputLabel: 'Reason for Rejection',
            inputPlaceholder: 'Describe why this return is being rejected...',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Reject',
            inputValidator: (v) => !v && 'Reason is required'
        });

        if (!result.isConfirmed) return;

        try {
            await handleReturnRequest(id, 'Rejected', result.value);
            toast.success('Return request rejected');
            fetchReturns();
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject return');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Returns</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Review and manage product returns for your store.</p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm font-medium transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 shadow-sm"
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value.trimStart()); setPage(1); }}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit shadow-inner">
                {['Pending', 'Approved', 'History'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setPage(1); }}
                        className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2.5 ${activeTab === tab ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab === 'Pending' && <ListFilter size={16} />}
                        {tab === 'Approved' && <CheckCircle2 size={16} />}
                        {tab === 'History' && <History size={16} />}
                        {tab}
                        {tab === 'Pending' && returnRequests.length > 0 && activeTab === 'Pending' && (
                            <span className="ml-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px]">{returnRequests.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Order ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Refund Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                     <td colSpan="5" className="py-20 text-center">
                                         <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
                                         <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading returns...</p>
                                     </td>
                                </tr>
                            ) : returnRequests.length > 0 ? (
                                returnRequests.map((request) => (
                                    <tr key={request._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-bold text-slate-900 truncate">#{request.orderId}</div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase mt-1">
                                                <Calendar size={12} />
                                                {new Date(request.returnRequest?.requestDate || request.updatedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-slate-800">{request.user?.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold">{request.user?.phone}</p>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border tracking-wider uppercase inline-flex items-center gap-1.5 ${statusColors[request.returnRequest?.status] || statusColors.Pending}`}>
                                                <span className="w-1 h-1 rounded-full bg-current opacity-70"></span>
                                                {request.returnRequest?.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <p className="text-base font-black text-slate-900">₹{request.totalAmount.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {activeTab === 'Pending' ? (
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
                                                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 uppercase tracking-widest active:scale-95 flex items-center gap-2 ml-auto"
                                                >
                                                    View Return
                                                    <ArrowRight size={14} />
                                                </button>
                                            ) : (
                                                <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 justify-end">
                                                    <ClipboardCheck size={14} />
                                                    Processed
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <Package size={48} className="text-slate-200 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Returns Found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination.total > 0 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Showing <span className="text-slate-900">{((page - 1) * limit) + 1}-{Math.min(page * limit, pagination.total)}</span> of <span className="text-slate-900">{pagination.total}</span> entries
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                                disabled={page === 1}
                                className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 shadow-sm hover:border-blue-400 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-bold text-slate-900 px-4 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                                {page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => { setPage(p => Math.min(pagination.totalPages, p + 1)); window.scrollTo(0, 0); }}
                                disabled={page >= pagination.totalPages}
                                className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 shadow-sm hover:border-blue-400 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Guidelines Card */}
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-600/20 transition-all duration-1000"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                                <Info size={20} />
                            </div>
                            <h4 className="text-xl font-bold text-white uppercase tracking-tight">Return Rules</h4>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">
                            Check all items carefully before accepting returns. 
                            <span className="text-emerald-400 block mt-2">● Accept only if products are in good condition.</span>
                        </p>
                    </div>

                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
                                <AlertCircle size={20} />
                            </div>
                            <h4 className="text-xl font-bold text-white uppercase tracking-tight">Rejection Policy</h4>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">
                            If products are damaged, give a clear reason for rejecting the return.
                        </p>
                    </div>
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
