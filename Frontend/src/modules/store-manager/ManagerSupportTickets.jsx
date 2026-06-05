import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, CheckCircle, AlertCircle, MessageCircle, Send, User, X, Package, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import * as complaintApi from '../../common/api/complaintApi';
import { toast } from 'react-toastify';

const ManagerSupportTickets = () => {
    const { managerUser } = useStoreManagerAuth();
    const token = managerUser?.token;
    const [filterStatus, setFilterStatus] = useState('ESCALATED_TO_STORE');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [resolutionText, setResolutionText] = useState('');
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recommendRefund, setRecommendRefund] = useState(false);

    const loadComplaints = async () => {
        try {
            setIsLoading(true);
            const response = await complaintApi.getStoreComplaints(token);
            if (response.success) {
                setComplaints(response.complaints);
            }
        } catch (error) {
            toast.error('Failed to load support tickets');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) loadComplaints();
    }, [token]);

    const filteredTickets = complaints.filter(ticket => {
        const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
        const matchesSearch = ticket.ticketId.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
            ticket.user?.name?.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
            ticket.category?.toLowerCase().includes(searchQuery.trim().toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const statusMap = {
        'OPEN': { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: 'OPEN' },
        'ESCALATED_TO_STORE': { bg: 'bg-red-50 text-red-700 border-red-200', label: 'ACTION REQUIRED' },
        'STORE_RESPONDED': { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'RESPONDED' },
        'RESOLVED': { bg: 'bg-green-50 text-green-700 border-green-200', label: 'RESOLVED' },
        'CLOSED': { bg: 'bg-slate-50 text-slate-400 border-slate-100', label: 'CLOSED' }
    };

    const handleSendResolution = async () => {
        if (!resolutionText.trim() || !selectedTicket) return;

        try {
            setIsSubmitting(true);
            const res = await complaintApi.resolveComplaintByStore(token, {
                ticketId: selectedTicket.ticketId,
                storeNotes: resolutionText,
                resolutionSolution: resolutionText,
                storeRecommendedRefund: recommendRefund
            });

            if (res.success) {
                toast.success('Response submitted successfully');
                setResolutionText('');
                loadComplaints();
                setSelectedTicket(null);
            }
        } catch (error) {
            toast.error('Failed to submit response');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Customer Support</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage and reply to customer issues for your store.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Needs Action</p>
                        <p className="text-2xl font-black text-slate-900">{complaints.filter(t => t.status === 'ESCALATED_TO_STORE').length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <MessageCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Active</p>
                        <p className="text-2xl font-black text-slate-900">{complaints.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 text-green-600">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solved Today</p>
                        <p className="text-2xl font-black text-slate-900">{complaints.filter(t => t.status === 'RESOLVED').length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex gap-3">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search Ticket ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-blue-400 transition-all outline-none text-sm font-medium"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="ESCALATED_TO_STORE">Pending</option>
                            <option value="STORE_RESPONDED">Responded</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                                <Loader2 className="animate-spin mx-auto text-blue-600" />
                                <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Loading tickets...</p>
                            </div>
                        ) : filteredTickets.length > 0 ? filteredTickets.map(ticket => (
                            <div
                                key={ticket.ticketId}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`p-5 rounded-3xl cursor-pointer transition-all border ${selectedTicket?.ticketId === ticket.ticketId ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-300'}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 uppercase">{ticket.ticketId}</span>
                                        <h4 className="text-sm font-bold text-slate-900 mt-2 truncate">{ticket.category}</h4>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border whitespace-nowrap ${statusMap[ticket.status]?.bg}`}>
                                        {ticket.status === 'ESCALATED_TO_STORE' ? 'NEEDS ACTION' : statusMap[ticket.status]?.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                                    <div className="flex items-center gap-1.5 min-w-0"><User size={12} className="shrink-0" /> <span className="truncate">{ticket.user?.name}</span></div>
                                    <div className="flex items-center gap-1.5 whitespace-nowrap"><Package size={12} className="shrink-0" /> Reference #{ticket.order?.orderId?.slice(-6)}</div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                                <MessageCircle size={32} className="mx-auto text-slate-200 mb-3" />
                                <p className="text-sm font-medium text-slate-500">No tickets found for your search.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-7 lg:sticky lg:top-6">
                    {selectedTicket ? (
                        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
                            <div className="p-6 bg-slate-50 border-b border-slate-100">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{selectedTicket.category}</h3>
                                    <button onClick={() => setSelectedTicket(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-4 text-sm text-slate-600 leading-relaxed font-medium">
                                    "{selectedTicket.description}"
                                </div>

                                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                                        {selectedTicket.attachments.map((img, idx) => (
                                            <a key={idx} href={img} target="_blank" rel="noreferrer" className="shrink-0">
                                                <img
                                                    src={img}
                                                    alt="Attachment"
                                                    className="w-20 h-20 object-cover rounded-xl border border-slate-200 hover:opacity-80 transition-opacity"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {selectedTicket.adminNotes && (
                                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                                        <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-[10px] font-bold text-blue-700 uppercase block mb-0.5">Note from Admin</span>
                                            <p className="text-xs font-bold text-blue-800 leading-relaxed">{selectedTicket.adminNotes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">Your Reply</label>
                                    <textarea
                                        value={resolutionText}
                                        onChange={(e) => setResolutionText(e.target.value)}
                                        placeholder="Type your response here..."
                                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-400 transition-all outline-none resize-none placeholder:text-slate-300"
                                    />
                                </div>
                                
                                {selectedTicket.order && (
                                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 select-none cursor-pointer" onClick={() => setRecommendRefund(!recommendRefund)}>
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${recommendRefund ? 'bg-amber-600 border-amber-600' : 'bg-white border-amber-300'}`}>
                                            {recommendRefund && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-amber-900">Suggest Refund</p>
                                            <p className="text-[10px] font-bold text-amber-600 uppercase">Needs Admin approval</p>
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={handleSendResolution}
                                    disabled={!resolutionText.trim() || isSubmitting}
                                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest transition-all shadow-sm ${resolutionText.trim() && !isSubmitting ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                >
                                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={18} />}
                                    Send Reply
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center justify-center min-h-[500px]">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-100 mb-4">
                                <MessageCircle size={32} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select a ticket to respond</p>
                        </div>
                    )}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px;}
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default ManagerSupportTickets;
