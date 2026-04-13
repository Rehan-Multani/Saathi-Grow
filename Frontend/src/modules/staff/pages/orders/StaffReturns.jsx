import React, { useState, useEffect } from 'react';
import { 
    RotateCcw, Search, Eye, X, Loader2, User, Phone, 
    CheckCircle, XCircle, AlertCircle, Image, ClipboardList,
    ChevronLeft, ChevronRight, Package, Calendar, Clock, ArrowRight, Camera, Inbox, RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { getReturnRequests, handleReturnRequest } from '../../../../common/api/orderApi';

const statusColors = {
    Pending: 'bg-amber-50 text-amber-600 border-amber-100',
    Accepted: 'bg-blue-50 text-blue-600 border-blue-100',
    Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Rejected: 'bg-red-50 text-red-600 border-red-100',
    FinalRejected: 'bg-slate-900 text-white border-slate-900',
    Scheduled: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    PickedUp: 'bg-violet-50 text-violet-600 border-violet-100',
    Returned: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const StaffReturns = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Pending');
    const [selected, setSelected] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const limit = 10;

    const tabStatusMap = {
        Pending: 'Pending',
        Accepted: 'Accepted,Approved',
        Processing: 'Scheduled,PickedUp',
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
                setReturns(data.returns);
                setPagination(data.pagination);
            } else {
                setReturns(Array.isArray(data) ? data : []);
                setPagination({ total: data.length, totalPages: 1 });
            }
        } catch (err) {
            toast.error('Failed to load returns');
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

    const handleAction = async (id, action) => {
        let reason = null;
        if (action === 'Rejected') {
            const { value } = await Swal.fire({
                title: 'Decline?',
                input: 'textarea',
                inputPlaceholder: 'Reason...',
                showCancelButton: true,
                confirmButtonText: 'Decline',
                confirmButtonColor: '#ef4444',
                customClass: { popup: 'rounded-[1.5rem]' }
            });
            if (!value) return;
            reason = value;
        } else {
            const confirm = await Swal.fire({
                title: 'Approve?',
                text: 'Confirm return verification.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Approve',
                confirmButtonColor: '#2563eb',
                customClass: { popup: 'rounded-[1.5rem]' }
            });
            if (!confirm.isConfirmed) return;
        }

        try {
            setProcessing(true);
            await handleReturnRequest(id, action, reason);
            toast.success(`Done`);
            setSelected(null);
            fetchReturns();
        } catch (err) {
            toast.error('Failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left px-1">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic font-black leading-none text-left font-black">Returns</h1>
                    <div className="flex items-center gap-3 font-black text-left">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-amber-100 italic font-black text-left font-black">
                            <RotateCcw size={12} className="animate-spin-slow" /> Verification
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5 font-black text-left font-black">{pagination.total} requests</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={fetchReturns} className="w-12 h-12 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95 shrink-0 font-black">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="relative group w-full md:w-96 text-left">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find by ID or user..."
                            className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-bold transition-all focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 shadow-sm font-black lowercase tracking-widest text-left"
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-[2rem] border border-slate-200 w-fit shrink-0 overflow-x-auto ml-1 font-black">
                {['Pending', 'Accepted', 'Processing', 'History'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setPage(1); }}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap italic font-black ${activeTab === tab ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        {tab === 'History' ? 'Done' : tab}
                        {tab === 'Pending' && returns.length > 0 && activeTab === 'Pending' && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-lg bg-blue-500 text-[8px] font-black">!</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col group p-4 lg:p-6 text-left font-black">
                {loading && returns.length === 0 ? (
                    Array( 8 ).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse p-4"><div className="h-16 bg-slate-50 rounded-2xl w-full"></div></div>
                    ))
                ) : returns.length === 0 ? (
                    <div className="py-32 text-center mx-auto">
                        <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-200 shadow-inner">
                            <Inbox size={40} />
                        </div>
                        <h3 className="font-black text-[10px] text-slate-300 uppercase tracking-[0.4em] italic font-black">No returns</h3>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left font-black">Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left font-black">User</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 font-black">Stage</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left font-black">Net</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 font-black">Review</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 border-0">
                                {returns.map((r) => (
                                    <tr key={r._id} className="group/row hover:bg-blue-50/20 transition-all duration-300">
                                        <td className="px-8 py-5 text-left border-0">
                                            <div className="flex items-center gap-4 text-left font-black italic">
                                                <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center group-hover/row:scale-110 group-hover/row:bg-blue-600 transition-all font-black duration-500 shrink-0 italic">
                                                    {r.orderId?.slice(-3).toUpperCase() || 'RTN'}
                                                </div>
                                                <div className="text-left font-black font-black">
                                                    <p className="font-black text-slate-900 tracking-widest text-[11px] uppercase italic font-black leading-none text-left">Ref: #{r.orderId?.slice(-8) || '00000000'}</p>
                                                    <p className="text-[9px] text-slate-400 font-black mt-2.5 uppercase tracking-tighter italic font-black leading-none text-left">
                                                        Req: {new Date(r.returnRequest?.requestDate || r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-left border-0">
                                            <div className="text-left font-black italic text-left">
                                                <p className="text-[12px] font-black text-slate-900 uppercase italic font-black leading-none text-left">{r.user?.name || 'Guest user'}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-2.5 tracking-widest italic font-black leading-none text-left">{r.user?.phone || 'No phone'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center border-0">
                                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black border uppercase tracking-widest shadow-sm italic font-black leading-none inline-block ${statusColors[r.returnRequest.status]}`}>
                                                {r.returnRequest.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-left border-0">
                                            <p className="font-black text-slate-900 text-[15px] italic tracking-tight font-black leading-none text-left">₹{r.totalAmount?.toLocaleString()}</p>
                                        </td>
                                        <td className="px-8 py-5 text-right border-0 relative">
                                            <button 
                                                onClick={() => setSelected(r)}
                                                className="w-10 h-10 bg-white text-slate-400 hover:text-blue-600 rounded-xl border border-slate-200 hover:border-blue-400 transition-all shadow-sm active:scale-95 flex items-center justify-center ml-auto font-black"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && pagination.total > limit && (
                    <div className="px-8 py-8 bg-slate-50/10 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap italic font-black text-left">
                            Showing <span className="text-slate-900 font-black">{((page - 1) * limit) + 1}-{Math.min(page * limit, pagination.total)}</span> of {pagination.total} records
                        </p>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-5 py-3 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-20 shadow-sm shrink-0 italic font-black"
                            >
                                Prev
                            </button>
                            <div className="h-10 px-6 bg-white border border-slate-200 rounded-xl flex items-center text-[11px] font-black text-slate-900 shadow-sm shrink-0 italic font-black">
                                {page} / {pagination.totalPages}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page >= pagination.totalPages}
                                className="px-5 py-3 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-20 shadow-sm shrink-0 italic font-black"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] max-w-lg w-full shadow-3xl overflow-hidden relative animate-in zoom-in-95 duration-300 border border-slate-200 text-left font-black">
                        <button 
                            onClick={() => setSelected(null)} 
                            className="absolute top-8 right-8 w-10 h-10 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all z-10 font-black shadow-sm"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 lg:p-12 space-y-8 text-left font-black">
                            <div className="flex items-center gap-5 text-left font-black italic font-black">
                                <div className="p-4 bg-slate-950 rounded-2xl text-white shadow-xl italic font-black shrink-0">
                                    <ClipboardList size={26} />
                                </div>
                                <div className="text-left font-black">
                                    <h3 className="font-black text-slate-900 text-2xl tracking-tight uppercase leading-none italic font-black text-left">Verification</h3>
                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.3em] mt-3 leading-none italic font-black text-left">Ref: #{selected.orderId?.slice(-12) || '0000'}</p>
                                </div>
                            </div>

                            <div className="space-y-6 text-left overflow-y-auto max-h-[60vh] pr- my-4 custom-scrollbar">
                                <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 relative overflow-hidden group text-left font-black italic">
                                    <div className="absolute right-0 top-0 w-32 h-full bg-amber-200/20 blur-3xl pointer-events-none rounded-full font-black" />
                                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2 italic leading-none font-black text-left">
                                       <AlertCircle size={12} className="shrink-0" /> Reason Code
                                    </p>
                                    <p className="text-xl font-black text-slate-800 tracking-tight leading-snug italic font-black text-left">"{selected.returnRequest.reason}"</p>
                                    {selected.returnRequest.description && (
                                        <p className="text-[11px] text-slate-500 mt-6 font-bold border-t border-amber-200/50 pt-5 leading-relaxed italic text-left">{selected.returnRequest.description}</p>
                                    )}
                                </div>

                                <div className="space-y-4 text-left font-black">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 italic leading-none font-black text-left">Check Items</p>
                                    {selected.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-5 bg-slate-50/50 p-5 rounded-[1.8rem] border border-slate-100 hover:border-blue-100 transition-colors text-left font-black shadow-sm font-black">
                                            <div className="w-14 h-14 bg-white rounded-xl p-2 shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                                                {item.product?.image ? <img src={item.product?.image} className="max-w-full max-h-full object-contain drop-shadow-md" alt="p" /> : <Package size={20} className="text-slate-200" />}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left font-black italic">
                                                <p className="font-black text-slate-900 text-[11px] uppercase tracking-tight truncate leading-none text-left">{item.product?.name || 'Item'}</p>
                                                <div className="flex items-center justify-between mt-3 text-left font-black italic">
                                                   <p className="text-[10px] text-blue-600 font-black italic leading-none">Qty: {item.quantity}</p>
                                                   <p className="text-[10px] font-black text-slate-900 italic tracking-tighter leading-none font-black">₹{item.price}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selected.returnRequest.images && selected.returnRequest.images.length > 0 && (
                                    <div className="space-y-4 text-left font-black">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 italic leading-none font-black flex items-center gap-2 text-left text-left">
                                           <Camera size={14} className="shrink-0" /> Proof Box
                                        </p>
                                        <div className="flex flex-wrap gap-3 ml-2 text-left font-black">
                                            {selected.returnRequest.images.map((img, i) => (
                                                <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 group hover:border-blue-600 transition-all shadow-sm shrink-0">
                                                    <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" alt="proof" />
                                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                        <Eye size={20} className="text-white drop-shadow-3xl" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selected.returnRequest.status === 'Pending' ? (
                                <div className="flex gap-4 pt-6 border-t border-slate-100 font-black font-black">
                                    <button
                                        onClick={() => handleAction(selected._id, 'Accepted')}
                                        disabled={processing}
                                        className="flex-1 py-6 bg-blue-600 hover:bg-black text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-3xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 italic font-black"
                                    >
                                        {processing ? <Loader2 className="animate-spin" size={18} /> : <>Approve</>}
                                    </button>
                                    <button
                                        onClick={() => handleAction(selected._id, 'Rejected')}
                                        disabled={processing}
                                        className="flex-[0.5] py-6 bg-red-50 text-red-600 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 italic hover:bg-red-600 hover:text-white font-black"
                                    >
                                        Decline
                                    </button>
                                </div>
                            ) : (
                                <div className={`p-8 rounded-[2.5rem] border text-center space-y-4 shadow-xl animate-in zoom-in-95 duration-500 border-t border-slate-50 mt-6 font-black italic ${statusColors[selected.returnRequest.status]}`}>
                                    <div className="flex justify-center mb-1">
                                       <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shrink-0">
                                          {selected.returnRequest.status === 'Rejected' || selected.returnRequest.status === 'FinalRejected' ? <XCircle size={26} className="text-red-500" /> : <CheckCircle size={26} className="text-emerald-500" />}
                                       </div>
                                    </div>
                                    <div>
                                       <p className="text-[12px] font-black uppercase tracking-[0.3em] font-black leading-none">Result: {selected.returnRequest.status}</p>
                                       <p className="text-[10px] font-bold opacity-70 mt-3 px-2 italic leading-relaxed font-black">
                                           {selected.returnRequest.status === 'Accepted' || selected.returnRequest.status === 'Approved' 
                                               ? 'Verified. Status updated in global stream.' 
                                               : 'This verifying claim has been marked closed.'}
                                       </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .animate-spin-slow { animation: spin 3s linear infinite; }
            `}} />
        </div>
    );
};

export default StaffReturns;
