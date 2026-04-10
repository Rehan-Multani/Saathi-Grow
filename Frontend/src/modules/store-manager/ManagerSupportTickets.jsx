import React, { useState, useEffect } from 'react';
import { Headphones, Search, Filter, Clock, CheckCircle, AlertCircle, MessageCircle, Send, User, X, Package, Loader2 } from 'lucide-react';
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
    const matchesSearch = ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category?.toLowerCase().includes(searchQuery.toLowerCase());
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
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Support & Grievances</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Resolve issues escalated by Central Admin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Action</p>
              <h3 className="text-2xl font-black text-gray-900">{complaints.filter(t => t.status === 'ESCALATED_TO_STORE').length}</h3>
            </div>
          </div>
        </div>
        {/* Add more stats if needed */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                type="text"
                placeholder="Search Ticket ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border-0 rounded-2xl focus:ring-2 focus:ring-[#0c831f]/10 text-xs font-bold uppercase transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-50/50 border-0 rounded-2xl px-4 text-xs font-bold uppercase"
            >
              <option value="all">All States</option>
              <option value="ESCALATED_TO_STORE">Pending</option>
              <option value="STORE_RESPONDED">Responded</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
            {isLoading ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100"><Loader2 className="animate-spin mx-auto text-[#0c831f]" /></div>
            ) : filteredTickets.map(ticket => (
              <div
                key={ticket.ticketId}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-6 rounded-3xl cursor-pointer transition-all border-2 ${selectedTicket?.ticketId === ticket.ticketId ? 'border-[#0c831f] bg-green-50/10' : 'border-transparent bg-white shadow-sm hover:shadow-md'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black text-[#0c831f] bg-green-50 px-2 py-0.5 rounded-lg uppercase">{ticket.ticketId}</span>
                    <h4 className="text-sm font-black text-gray-900 uppercase mt-2 tracking-tight">{ticket.category}</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${statusMap[ticket.status]?.bg}`}>
                    {statusMap[ticket.status]?.label}
                  </span>
                </div>
                <div className="flex gap-4 text-[10px] font-bold text-gray-400 uppercase">
                  <div className="flex items-center gap-1.5"><User size={12} /> {ticket.user?.name}</div>
                  <div className="flex items-center gap-1.5"><Package size={12} /> Order #{ticket.order?.orderId?.slice(-6)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-6">
          {selectedTicket ? (
            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
              <div className="p-8 bg-gray-50/50 border-b border-gray-100">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4">{selectedTicket.category}</h3>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 mb-4 shadow-sm">
                  <p className="text-sm font-bold text-gray-600 italic">"{selectedTicket.description}"</p>
                </div>

                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {selectedTicket.attachments.map((img, idx) => (
                      <a key={idx} href={img} target="_blank" rel="noreferrer" className="flex-shrink-0">
                        <img
                          src={img}
                          alt="Attachment"
                          className="w-16 h-16 object-cover rounded-xl border border-gray-100 hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {selectedTicket.adminNotes && (
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <span className="text-[10px] font-black text-amber-800 uppercase block mb-1">Admin Instruction</span>
                    <p className="text-xs font-bold text-amber-900">{selectedTicket.adminNotes}</p>
                  </div>
                )}
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Resolution Message</label>
                  <textarea
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Type how you resolved this issue..."
                    className="w-full h-32 p-4 bg-gray-50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#0c831f]/10 outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
                
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
                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest transition-all ${resolutionText.trim() && !isSubmitting ? 'bg-[#0c831f] text-white' : 'bg-gray-100 text-gray-400'}`}
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Submit Resolution
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/50 rounded-[2rem] border-2 border-dashed border-gray-200 p-20 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <MessageCircle size={48} className="text-gray-200 mb-4" />
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Select ticket to resolve</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerSupportTickets;
