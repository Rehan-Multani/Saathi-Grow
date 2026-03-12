import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle2, XCircle, AlertCircle, Info, ChevronRight, Package, Calendar } from 'lucide-react';
import ReturnApprovalModal from './components/ReturnApprovalModal';
import { getReturnRequests, handleReturnRequest } from '../admin/api/orderApi';
import Swal from 'sweetalert2';

const ReturnsApproval = () => {
    const [returnRequests, setReturnRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const data = await getReturnRequests();
            setReturnRequests(data);
        } catch (error) {
            console.error('Failed to fetch returns:', error);
            Swal.fire('Error', 'Could not load return requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    const processReturn = async (id, action) => {
        try {
            await handleReturnRequest(id, action);
            Swal.fire('Success', `Return ${action.toLowerCase()} successfully`, 'success');
            fetchReturns();
            setIsModalOpen(false);
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || `Failed to ${action.toLowerCase()} return`, 'error');
        }
    };

    const handleApprove = (request) => {
        processReturn(request._id, 'Accepted');
    };

    const handleReject = (id) => {
        processReturn(id, 'Rejected');
    };

    const getStatusBadge = (status) => {
        const styles = {
            Accepted: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            Rejected: 'bg-orange-50 text-orange-600 border-orange-100',
            FinalRejected: 'bg-rose-50 text-rose-600 border-rose-100',
            Pending: 'bg-amber-50 text-amber-600 border-amber-100'
        };
        const label = status === 'Accepted' ? 'STORE APPROVED' : 
                      status === 'Approved' ? 'ADMIN APPROVED' : 
                      status === 'Rejected' ? 'STORE REJECTED' :
                      status === 'FinalRejected' ? 'FINAL REJECTED' :
                      status.toUpperCase();
        const dotClass = status === 'Accepted' || status === 'Approved'
            ? 'bg-emerald-600'
            : status === 'Rejected' || status === 'FinalRejected'
                ? 'bg-rose-600'
                : 'bg-amber-600';
        return (
            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black border tracking-widest flex items-center gap-2 w-fit ${styles[status] || styles.Pending}`}>
                <div className={`w-1 h-1 rounded-full ${dotClass}`}></div>
                {label}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                            <RotateCcw size={24} />
                        </div>
                        Quality Assurance & Returns
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mt-1 ml-16">Review ticketed return requests and validate asset condition for restocking.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">Order Reference</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">Inventory Item</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">Discrepancy Reason</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100 text-center">Qty</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">Validation</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-slate-500 font-medium">Loading return requests...</td>
                                </tr>
                            ) : returnRequests.length > 0 ? (
                                returnRequests.map((request) => (
                                    <tr key={request._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">#{request.orderId}</div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                                <Calendar size={10} />
                                                {new Date(request.returnRequest?.requestDate || request.updatedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                    <Package size={16} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 tracking-tight">{request.items?.[0]?.product?.name || 'Multiple Items'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 max-w-[280px]">
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-3 group-hover:border-blue-200 transition-colors">
                                                "{request.returnRequest?.reason || 'No specific reason provided'}"
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-700 mx-auto">
                                                {request.items?.length || 1}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {getStatusBadge(request.returnRequest?.status || 'Pending')}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end">
                                                {(request.returnRequest?.status === 'Pending' || !request.returnRequest?.status) ? (
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
                                                                images: request.returnRequest?.images
                                                            }); setIsModalOpen(true);
                                                        }}
                                                        className="px-5 py-2 text-[10px] font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase tracking-widest active:scale-95"
                                                    >
                                                        Audit Ticket
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-slate-300">
                                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Archived</span>
                                                        <ChevronRight size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-slate-500 font-medium">No pending return requests found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 flex flex-col md:flex-row gap-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-white pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <CheckCircle2 size={120} />
                </div>

                <div className="flex-1 space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                            <Info size={20} />
                        </div>
                        <h4 className="text-lg font-black text-white tracking-tight italic">Restocking Intelligence</h4>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xl font-medium">
                        System automatically performs inventory increment upon successful audit.
                        <span className="text-emerald-400"> Only authorize items verified as resalable.</span> Items failing condition audit must be flagged for disposal.
                    </p>
                </div>

                <div className="md:w-px md:h-24 bg-slate-800 self-center"></div>

                <div className="flex-1 space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <AlertCircle size={20} />
                        </div>
                        <h4 className="text-lg font-black text-white tracking-tight italic">Disposal Protocol</h4>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xl font-medium">
                        Rejected items are categorized as <span className="text-rose-400">Inventory Loss</span>.
                        Ensure documented disposal for food safety compliance.
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
