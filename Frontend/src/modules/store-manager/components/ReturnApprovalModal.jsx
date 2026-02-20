import React from 'react';
import { X, CheckCircle, XCircle, ShoppingBag, AlertCircle, Fingerprint, RefreshCcw, ShieldCheck } from 'lucide-react';

const ReturnApprovalModal = ({ isOpen, onClose, onApprove, onReject, request }) => {
    if (!isOpen || !request) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-100">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-600"></div>

                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                                <RefreshCcw size={20} />
                            </div>
                            Quality Clearance Audit
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 ml-11">Reference Audit Log #8821</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-rose-500 active:scale-90">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl -mr-8 -mt-8"></div>
                        <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                            <ShoppingBag size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <Fingerprint size={12} className="text-slate-400" />
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Entry ID</p>
                            </div>
                            <p className="text-sm font-black text-slate-800 tracking-tight">#{request.orderId}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{request.productName}</p>
                                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                <p className="text-xs font-black text-blue-600 uppercase tracking-tighter tabular-nums">{request.quantity} Units</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-[9px] font-black border tracking-widest ${request.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {request.status.toUpperCase()}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            <AlertCircle size={12} className="text-amber-500" /> Discrepancy Observation
                        </label>
                        <div className="p-5 bg-amber-50/30 border border-amber-100/50 rounded-[1.5rem] text-sm text-slate-700 italic leading-relaxed shadow-sm">
                            "{request.reason}"
                        </div>
                    </div>

                    <div className="bg-blue-900 p-6 rounded-[2rem] border border-blue-800 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-600/10 transition-opacity opacity-0 group-hover:opacity-100"></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] flex items-center gap-2 mb-2">
                                <ShieldCheck size={14} className="text-blue-500" /> Protocol Advisory
                            </p>
                            <p className="text-xs text-blue-100 font-medium leading-relaxed">
                                Execution will trigger <span className="font-black text-white">Automated Inventory Integration</span>. Stock count will increment by <span className="text-amber-400 font-black uppercase tracking-tight">{request.quantity} units</span> upon successful audit clearance.
                            </p>
                        </div>
                    </div>

                    <div className="pt-2 flex gap-4">
                        <button
                            onClick={() => onReject(request.id)}
                            className="flex-1 py-4 bg-white border border-rose-100 text-rose-500 text-[11px] font-black rounded-2xl hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
                        >
                            <XCircle size={16} />
                            Reject Log
                        </button>
                        <button
                            onClick={() => onApprove(request)}
                            className="flex-[1.5] py-4 bg-blue-600 text-white text-[11px] font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
                        >
                            <CheckCircle size={16} />
                            Approve & Integrate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnApprovalModal;
