import React, { useState, useEffect } from 'react';
import { Headphones, Search, Filter, Clock, CheckCircle, AlertCircle, MessageCircle, Send, User, X, Package, Loader2 } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import * as complaintApi from '../api/complaintApi';
import { toast } from 'react-toastify';

const SupportTickets = () => {
    const { vendor } = useVendor();
    const token = vendor?.token;
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
            toast.error('Failed to load assigned tickets');
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
        'OPEN': { bg: 'bg-gray-50 text-gray-500 border-gray-100', label: 'PENDING INTAKE' },
        'ESCALATED_TO_STORE': { bg: 'bg-red-50 text-red-700 border-red-100', label: 'ACTION REQUIRED' },
        'STORE_RESPONDED': { bg: 'bg-blue-50 text-blue-700 border-blue-100', label: 'RESPONDED' },
        'RESOLVED': { bg: 'bg-green-50 text-green-700 border-green-100', label: 'RESOLVED' },
        'CLOSED': { bg: 'bg-gray-100 text-gray-400 border-gray-200', label: 'CLOSED' }
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
                toast.success('Resolution submitted successfully');
                setResolutionText('');
                loadComplaints();
                setSelectedTicket(null);
            }
        } catch (error) {
            toast.error('Failed to submit resolution');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 lg:space-y-5 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-3xl font-black text-gray-900 tracking-tight uppercase">Ticket Dashboard</h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Resolve customer grievances escalated by Admin</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="premium-card p-6 border-l-4 border-red-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-2xl shadow-sm">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Action Needed</p>
                            <h3 className="text-3xl font-black text-gray-900">{complaints.filter(t => t.status === 'ESCALATED_TO_STORE').length}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-6 border-l-4 border-blue-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Responded</p>
                            <h3 className="text-3xl font-black text-gray-900">{complaints.filter(t => t.status === 'STORE_RESPONDED').length}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-6 border-l-4 border-green-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl shadow-sm">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Resolved</p>
                            <h3 className="text-3xl font-black text-gray-900">{complaints.filter(t => t.status === 'RESOLVED').length}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="premium-card p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0c831f] transition-all" size={20} />
                        <input
                            type="text"
                            placeholder="SEARCH BY TICKET ID OR CUSTOMER..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:border-[#0c831f] focus:ring-4 focus:ring-green-500/5 focus:outline-none text-[11px] font-black uppercase tracking-widest transition-all"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                        {['all', 'ESCALATED_TO_STORE', 'STORE_RESPONDED', 'RESOLVED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl border-2 transition-all whitespace-nowrap tracking-widest ${filterStatus === status
                                    ? 'bg-[#0c831f] text-white border-[#0c831f] shadow-lg shadow-green-500/20'
                                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                {status === 'ESCALATED_TO_STORE' ? 'Action Req' : status === 'STORE_RESPONDED' ? 'Pending Ack' : status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Ticket Cards */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                            <Loader2 size={40} className="animate-spin text-[#0c831f] mx-auto mb-4" />
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Fetching Tickets...</p>
                        </div>
                    ) : (
                        <>
                            {filteredTickets.map(ticket => (
                                <div
                                    key={ticket.ticketId}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`premium-card p-6 cursor-pointer transition-all hover:scale-[1.01] relative ${selectedTicket?.ticketId === ticket.ticketId ? 'border-2 border-[#0c831f] bg-green-50/20' : 'bg-white border-transparent'
                                        }`}
                                >
                                    {ticket.status === 'ESCALATED_TO_STORE' && <div className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></div>}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-black text-[#0c831f] uppercase bg-green-50 px-2 py-0.5 rounded-lg">{ticket.ticketId}</span>
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-tighter border uppercase bg-red-50 text-red-600 border-red-100`}>
                                                    {ticket.priority}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{ticket.category}</h3>
                                        </div>
                                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${statusMap[ticket.status]?.bg}`}>
                                            {statusMap[ticket.status]?.label}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-gray-400 uppercase">
                                        <div className="flex items-center gap-1.5"><User size={14} className="text-gray-300" /> {ticket.user?.name}</div>
                                        <div className="flex items-center gap-1.5"><Package size={14} className="text-gray-300" /> ORDER #{ticket.order?.orderId?.slice(-6)}</div>
                                    </div>
                                </div>
                            ))}
                            {filteredTickets.length === 0 && (
                                <div className="premium-card p-20 text-center bg-white border-dashed border-2">
                                    <Headphones size={48} className="text-gray-100 mx-auto mb-4" />
                                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Zero escalated tickets</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Ticket Details */}
                <div className="lg:sticky lg:top-8">
                    {selectedTicket ? (
                        <div className="premium-card overflow-hidden bg-white shadow-2xl border-2 border-gray-100">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 d-block">{selectedTicket.ticketId}</span>
                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{selectedTicket.category}</h3>
                                    </div>
                                    <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-red-500">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4">
                                    <p className="text-sm font-bold text-gray-600 italic leading-relaxed">"{selectedTicket.description}"</p>
                                </div>
                                {selectedTicket.adminNotes && (
                                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-amber-800">
                                        <p className="text-[10px] font-black uppercase mb-1 flex items-center gap-1"><AlertCircle size={12} /> Admin Escalation Notes</p>
                                        <p className="text-xs font-bold">{selectedTicket.adminNotes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-white space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Response & Resolution</label>
                                <textarea
                                    value={resolutionText}
                                    onChange={(e) => setResolutionText(e.target.value)}
                                    placeholder="Explain how the issue was addressed (e.g., Refund issued, Items reshipped)..."
                                    className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[12px] font-bold focus:ring-4 focus:ring-green-500/5 focus:border-[#0c831f] focus:outline-none transition-all placeholder:text-gray-300"
                                />
                                
                                {selectedTicket.order && (
                                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                        <input 
                                            type="checkbox" 
                                            id="recommend-refund"
                                            checked={recommendRefund}
                                            onChange={(e) => setRecommendRefund(e.target.checked)}
                                            className="w-5 h-5 accent-[#0c831f]"
                                        />
                                        <label htmlFor="recommend-refund" className="text-[11px] font-black text-amber-900 uppercase tracking-tight cursor-pointer">
                                            Recommend Refund to User (Admin Approval Required)
                                        </label>
                                    </div>
                                )}
                                <button
                                    onClick={handleSendResolution}
                                    disabled={!resolutionText.trim() || isSubmitting}
                                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${resolutionText.trim() && !isSubmitting
                                        ? 'bg-[#0c831f] text-white shadow-xl shadow-green-500/20'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    Submit Resolution
                                </button>
                                <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-tight">This response will be visible to the Admin and User</p>
                            </div>
                        </div>
                    ) : (
                        <div className="premium-card p-24 text-center bg-white border-dashed border-2 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <MessageCircle size={32} className="text-gray-200" />
                            </div>
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Select Ticket for Action</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportTickets;

