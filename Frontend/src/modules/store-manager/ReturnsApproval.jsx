import React, { useState } from 'react';
import { RotateCcw, CheckCircle2, XCircle, AlertCircle, Info, ChevronRight, Package, Calendar } from 'lucide-react';
import ReturnApprovalModal from './components/ReturnApprovalModal';

const ReturnsApproval = () => {
    const [returnRequests, setReturnRequests] = useState([
        { id: 1, orderId: 'ORD-5432', productName: 'Fresh Broccoli', quantity: 2, reason: 'Damaged during delivery - items were crushed.', status: 'Pending', date: 'Feb 15, 2024' },
        { id: 2, orderId: 'ORD-9981', productName: 'Organic Tomatoes', quantity: 5, reason: 'Incorrect product received - ordered Cherry tomatoes.', status: 'Approved', date: 'Feb 14, 2024' },
        { id: 3, orderId: 'ORD-1223', productName: 'Greek Yogurt 500g', quantity: 1, reason: 'Near expiry date (only 1 day remains).', status: 'Pending', date: 'Feb 15, 2024' },
        { id: 4, orderId: 'ORD-4456', productName: 'Alphonso Mangoes', quantity: 3, reason: 'Quality not as expected - too sour.', status: 'Rejected', date: 'Feb 13, 2024' },
    ]);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleApprove = (request) => {
        setReturnRequests(returnRequests.map(req =>
            req.id === request.id ? { ...req, status: 'Approved' } : req
        ));
        setIsModalOpen(false);
    };

    const handleReject = (id) => {
        setReturnRequests(returnRequests.map(req =>
            req.id === id ? { ...req, status: 'Rejected' } : req
        ));
        setIsModalOpen(false);
    };

    const getStatusBadge = (status) => {
        const styles = {
            Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            Rejected: 'bg-rose-50 text-rose-600 border-rose-100',
            Pending: 'bg-amber-50 text-amber-600 border-amber-100'
        };
        return (
            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black border tracking-widest flex items-center gap-2 w-fit ${styles[status]}`}>
                <div className={`w-1 h-1 rounded-full ${status === 'Approved' ? 'bg-emerald-600' : status === 'Rejected' ? 'bg-rose-600' : 'bg-amber-600'}`}></div>
                {status.toUpperCase()}
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
                            {returnRequests.map((request) => (
                                <tr key={request.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">#{request.orderId}</div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                            <Calendar size={10} />
                                            {request.date}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                <Package size={16} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 tracking-tight">{request.productName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 max-w-[280px]">
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-3 group-hover:border-blue-200 transition-colors">
                                            "{request.reason}"
                                        </p>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-700 mx-auto">
                                            {request.quantity}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {getStatusBadge(request.status)}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end">
                                            {request.status === 'Pending' ? (
                                                <button
                                                    onClick={() => { setSelectedRequest(request); setIsModalOpen(true); }}
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
                            ))}
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
