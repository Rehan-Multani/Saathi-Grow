import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MessageSquare, Send, ArrowUpRight, CheckCircle, Search, Filter, Loader2, Package, User, ChevronLeft, ChevronRight, AlertCircle, X, Camera, Paperclip, ClipboardList, Inbox, RefreshCw, ShieldCheck } from 'lucide-react';
import { useStaffAuth } from '../../context/StaffAuthContext';
import * as complaintApi from '../../../../common/api/complaintApi';
import { toast } from 'react-toastify';

const StaffTickets = () => {
    const { staffUser } = useStaffAuth();
    const token = staffUser?.token;

    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [resolutionText, setResolutionText] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [recommendRefund, setRecommendRefund] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const loadComplaints = async () => {
        try {
            setIsLoading(true);
            const res = await complaintApi.getAllComplaintsForAdmin(token);
            if (res.success) setComplaints(res.complaints);
        } catch (error) {
            toast.error('Failed to load');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { if (token) loadComplaints(); }, [token]);
    useEffect(() => { setCurrentPage(1); }, [searchQuery, filterStatus]);

    useEffect(() => {
        if (showDetailModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showDetailModal]);

    const handleAction = async (action) => {
        try {
            setIsActionLoading(true);
            if (action === 'RESOLVE') {
                const res = await complaintApi.resolveComplaintByStore(token, {
                    ticketId: selectedTicket.ticketId,
                    storeNotes: adminNotes || resolutionText,
                    resolutionSolution: resolutionText,
                    storeRecommendedRefund: recommendRefund
                });
                if (res.success) {
                    toast.success('Done');
                    loadComplaints();
                    setShowDetailModal(false);
                }
            }
        } catch (error) {
            toast.error('Failed');
        } finally {
            setIsActionLoading(false);
            setAdminNotes('');
        }
    };

    const statusMap = {
        'OPEN': { style: 'bg-amber-50 text-amber-600 border-amber-100', label: 'PENDING' },
        'ESCALATED_TO_STORE': { style: 'bg-blue-50 text-blue-600 border-blue-100', label: 'IN REVIEW' },
        'STORE_RESPONDED': { style: 'bg-indigo-50 text-indigo-600 border-indigo-100', label: 'RESPONDED' },
        'RESOLVED': { style: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'SOLVED' },
        'CLOSED': { style: 'bg-slate-100 text-slate-500 border-slate-200', label: 'CLOSED' },
        'OVERDUE': { style: 'bg-red-50 text-red-600 border-red-100', label: 'DELAYED' }
    };

    const filtered = complaints.filter(c => {
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        const matchesSearch = c.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.category?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedTickets = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left px-1">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none font-black text-left">Triage Hub</h1>
                    <div className="flex items-center gap-3 font-black text-left">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100 italic leading-none font-black text-left">
                            <MessageSquare size={12} className="animate-pulse" /> Live Tickets
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5 font-black text-left">{filtered.length} requests</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={loadComplaints} className="w-12 h-12 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95 shrink-0 font-black">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <div className="relative group w-full md:w-96 text-left">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find by ID or user..."
                            className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-bold transition-all focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 shadow-sm font-black lowercase tracking-widest text-left"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px] flex flex-col group p-4 lg:p-6 text-left font-black">
                <div className="overflow-x-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left font-black">Ticket Info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left font-black">Details</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 font-black">Priority</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 font-black">Stage</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 font-black">Review</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 border-0">
                            {isLoading && complaints.length === 0 ? (
                                Array( 10 ).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6"><div className="h-14 bg-slate-50 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : paginatedTickets.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center border-0">
                                        <div className="flex flex-col items-center justify-center text-center mx-auto">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-200 shadow-inner">
                                                <Inbox size={40} />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic font-black">All Clear</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedTickets.map((c) => (
                                <tr key={c.ticketId} className="group/row hover:bg-blue-50/20 transition-all duration-300">
                                    <td className="px-8 py-5 text-left border-0">
                                        <div className="flex items-center gap-4 text-left font-black italic">
                                            <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center group-hover/row:scale-110 group-hover/row:bg-blue-600 transition-all font-black duration-500 shrink-0 italic">
                                                {c.ticketId?.slice(-3).toUpperCase() || 'TKT'}
                                            </div>
                                            <div className="text-left font-black font-black">
                                                <p className="font-black text-slate-900 tracking-widest text-[11px] uppercase italic font-black leading-none text-left">Ref: #{c.ticketId?.slice(-8) || '000000'}</p>
                                                <p className="text-[9px] text-slate-400 font-black mt-2.5 uppercase tracking-tighter italic font-black leading-none text-left font-black">Order: #{c.order?.orderId?.slice(-8) || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-left border-0">
                                        <div className="text-left font-black italic text-left">
                                            <p className="font-black text-slate-900 text-[12px] uppercase italic font-black leading-none text-left truncate max-w-[150px] font-black">{c.category}</p>
                                            <div className="flex items-center gap-2 mt-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none font-black text-left">
                                                <User size={11} className="shrink-0" /> {c.user?.name || 'Guest User'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center border-0 font-black">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-widest shadow-sm italic font-black leading-none inline-block ${c.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {c.priority}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center border-0 font-black">
                                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black border uppercase tracking-widest shadow-sm italic font-black leading-none inline-block ${statusMap[c.status]?.style}`}>
                                            {statusMap[c.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right border-0 relative font-black">
                                        <button 
                                            onClick={() => { setSelectedTicket(c); setShowDetailModal(true); }}
                                            className="w-10 h-10 bg-white text-slate-400 hover:text-blue-600 rounded-xl border border-slate-200 hover:border-blue-400 transition-all shadow-sm active:scale-95 flex items-center justify-center ml-auto font-black"
                                        >
                                            <ArrowUpRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!isLoading && totalPages > 1 && (
                    <div className="px-8 py-8 bg-slate-50/10 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap italic font-black text-left">
                            Showing <span className="text-slate-900 font-black font-black">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of {filtered.length} tickets
                        </p>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-5 py-3 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-20 shadow-sm shrink-0 italic font-black"
                            >
                                Prev
                            </button>
                            <div className="flex items-center gap-1.5 mx-2 shrink-0">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`min-w-[40px] h-10 rounded-xl text-[11px] font-black transition-all shadow-sm font-black ${currentPage === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-200'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-5 py-3 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-20 shadow-sm shrink-0 italic font-black"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showDetailModal && selectedTicket && ReactDOM.createPortal(
                <div className="fixed top-0 left-0 w-screen h-screen bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 text-left" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white rounded-[3rem] max-w-5xl w-full shadow-3xl overflow-hidden relative animate-in zoom-in-95 duration-300 border border-slate-200 flex flex-col md:flex-row min-h-[500px] max-h-[90vh] text-left" onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={() => setShowDetailModal(false)} 
                            className="absolute top-8 right-8 w-10 h-10 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all z-[110] font-black shadow-sm"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-slate-50 text-left font-black italic">
                            <div className="flex items-center gap-5 mb-10 text-left font-black italic font-black">
                                <div className="p-4 bg-slate-950 rounded-2xl text-white shadow-xl italic font-black shrink-0">
                                    <MessageSquare size={26} />
                                </div>
                                <div className="text-left font-black">
                                    <h3 className="font-black text-slate-900 text-2xl tracking-tight uppercase leading-none italic font-black text-left">Support Review</h3>
                                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.3em] mt-3 leading-none italic font-black text-left">TKT: #{selectedTicket.ticketId?.slice(-12) || '00000'}</p>
                                </div>
                            </div>

                            <div className="space-y-8 text-left font-black">
                                <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 relative overflow-hidden group text-left font-black italic font-black">
                                     <div className="absolute right-0 top-0 w-32 h-full bg-blue-200/10 blur-3xl pointer-events-none rounded-full font-black" />
                                     <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2 italic leading-none font-black text-left">
                                       <AlertCircle size={14} className="shrink-0" /> User Message
                                    </p>
                                    <p className="text-lg font-black text-slate-800 leading-relaxed italic font-black text-left font-black">"{selectedTicket.description}"</p>
                                </div>

                                {selectedTicket.attachments?.length > 0 && (
                                     <div className="space-y-4 text-left font-black">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 italic flex items-center gap-2 leading-none font-black text-left">
                                           <Camera size={14} className="shrink-0 text-slate-300" /> Evidence Photos
                                        </p>
                                        <div className="flex flex-wrap gap-3 ml-2 text-left font-black font-black">
                                            {selectedTicket.attachments.map((img, i) => (
                                                <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 group hover:border-blue-600 transition-all shadow-sm shrink-0 text-left">
                                                    <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" alt="proof" />
                                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all font-black text-left font-black">
                                                        <Search size={22} className="text-white drop-shadow-3xl font-black font-black" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 text-left font-black">
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 italic flex items-center gap-2 leading-none font-black text-left">
                                        <MessageSquare size={14} className="shrink-0 text-slate-300" /> Thread Records
                                    </p>
                                    <div className="space-y-4 ml-2 text-left font-black font-black">
                                        {selectedTicket.resolutionThread?.length > 0 ? (
                                            selectedTicket.resolutionThread.map((msg, idx) => (
                                                <div key={idx} className="flex gap-4 group/msg text-left font-black italic font-black">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm font-black italic">
                                                       <User size={16} className="text-slate-300" />
                                                    </div>
                                                    <div className="p-5 bg-white border border-slate-100 rounded-[1.8rem] shadow-sm flex-1 text-left font-black italic">
                                                        <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2 italic leading-none font-black text-left font-black">{msg.senderName}</div>
                                                        <p className="text-xs font-bold text-slate-600 leading-normal italic font-black text-left">"{msg.message}"</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-10 text-center border-2 border-dashed border-slate-50 rounded-[2.5rem] bg-slate-50/20 text-left">
                                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic font-black leading-none text-center font-black">Empty Thread</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-96 p-8 lg:p-12 bg-slate-50/50 flex flex-col justify-between text-left border-l border-slate-100 font-black italic">
                            <div className="space-y-8 flex-1 overflow-y-auto pr-1 custom-scrollbar text-left font-black">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2 italic flex items-center gap-2 leading-none font-black text-left">
                                       <ClipboardList size={14} className="shrink-0" /> Internal Logs
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full p-6 bg-white border border-slate-200 rounded-[2.5rem] text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 shadow-sm transition-all resize-none placeholder:text-slate-200 italic font-black text-left font-black"
                                        placeholder="Internal team notes..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                    />
                                </div>

                                {['OPEN', 'ESCALATED_TO_STORE', 'OVERDUE'].includes(selectedTicket.status) && (
                                     <div className="space-y-8 pt-2 text-left font-black">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2 italic flex items-center gap-2 leading-none font-black text-left">
                                               <CheckCircle size={14} /> Public Solution
                                            </label>
                                            <textarea
                                                rows={4}
                                                className="w-full p-6 bg-white border border-slate-200 rounded-[2.5rem] text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 shadow-sm transition-all resize-none placeholder:text-slate-200 italic font-black text-left font-black"
                                                placeholder="Resolution for user..."
                                                value={resolutionText}
                                                onChange={(e) => setResolutionText(e.target.value)}
                                            />
                                        </div>

                                        {selectedTicket.order && (
                                            <button 
                                                onClick={() => setRecommendRefund(!recommendRefund)}
                                                className={`flex items-center gap-4 p-5 rounded-[1.8rem] border transition-all w-full text-left font-black tracking-widest uppercase italic text-[10px] shadow-sm ${recommendRefund ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xl shadow-amber-500/20' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-300'}`}
                                            >
                                                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${recommendRefund ? 'bg-amber-600 border-amber-600 text-white shadow-inner' : 'bg-slate-50 border-slate-200'}`}>
                                                   {recommendRefund && <ShieldCheck size={14} />}
                                                </div>
                                                Request Refund Stream
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 mt-10 text-left pt-8 border-t border-slate-100 font-black italic">
                                {['OPEN', 'ESCALATED_TO_STORE', 'OVERDUE'].includes(selectedTicket.status) && (
                                    <button
                                        onClick={() => handleAction('RESOLVE')}
                                        disabled={!resolutionText.trim() || isActionLoading}
                                        className="w-full py-6 bg-blue-600 hover:bg-black text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-3xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 italic font-black"
                                    >
                                        {isActionLoading ? <Loader2 size={18} className="animate-spin text-white" /> : <>Resolve Now</>}
                                    </button>
                                )}
                                <button 
                                    onClick={() => setShowDetailModal(false)}
                                    className="w-full py-5 bg-white text-slate-400 hover:text-slate-900 border border-slate-200 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all italic leading-none font-black shadow-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            , document.body)}
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default StaffTickets;
