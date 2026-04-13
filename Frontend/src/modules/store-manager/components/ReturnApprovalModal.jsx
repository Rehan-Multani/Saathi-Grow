import React from 'react';
import { X, CheckCircle, XCircle, ShoppingBag, AlertCircle, Fingerprint, RefreshCcw, ShieldCheck, Image, ShieldAlert, PackageCheck } from 'lucide-react';

const ReturnApprovalModal = ({ isOpen, onClose, onApprove, onReject, request }) => {
    if (!isOpen || !request) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <PackageCheck size={20} className="text-blue-600" />
                        Return Quality Check
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                            <ShoppingBag size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Order ID</p>
                            <p className="text-sm font-bold text-slate-800 tracking-tight">#{request.orderId}</p>
                            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{request.productName} • <span className="font-bold text-blue-600">{request.quantity} Units</span></p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border tracking-wider uppercase ${request.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-200 text-slate-600'}`}>
                            {request.status}
                        </span>
                    </div>

                    <div className="space-y-2.5">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                            <AlertCircle size={14} className="text-amber-500" /> Reason for Return
                        </label>
                        <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl">
                            <p className="text-sm font-bold text-slate-800 italic">"{request.reason}"</p>
                            {request.description && <p className="text-xs text-slate-500 mt-2 font-medium italic-none">"{request.description}"</p>}
                        </div>
                    </div>

                    {request.images && request.images.length > 0 && (
                        <div className="space-y-2.5">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Evidence Photos</p>
                            <div className="flex flex-wrap gap-2 px-1">
                                {request.images.map((img, i) => (
                                    <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group shadow-sm hover:border-blue-400 transition-all">
                                        <img src={img} alt="proof" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Image size={18} className="text-white" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white mb-1">Stock Update Information</p>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                Approving this return will automatically add <span className="text-blue-400 font-bold">{request.quantity} units</span> back to your branch inventory.
                            </p>
                        </div>
                    </div>

                    <div className="pt-2 flex gap-4 border-t border-slate-100">
                        <button
                            onClick={() => onReject(request.id)}
                            className="flex-1 py-3 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 shadow-sm"
                        >
                            <XCircle size={16} />
                            Reject
                        </button>
                        <button
                            onClick={() => onApprove(request)}
                            className="flex-[1.5] py-3 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
                        >
                            <CheckCircle size={16} />
                            Approve & Add to Stock
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnApprovalModal;
