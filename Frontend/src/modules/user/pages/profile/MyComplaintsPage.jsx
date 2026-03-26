import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as complaintApi from '../../api/complaintApi';
import { toast } from 'react-toastify';

const MyComplaintsPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const res = await complaintApi.getUserComplaints(token);
      if (res.success) {
        setComplaints(res.complaints);
      }
    } catch (error) {
      toast.error('Failed to load your complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadComplaints();
  }, [token]);

  const statusMap = {
    'OPEN': { color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10', label: 'Under Review' },
    'ESCALATED_TO_STORE': { color: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10', label: 'Escalated to Store' },
    'STORE_RESPONDED': { color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10', label: 'Response Received' },
    'RESOLVED': { color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10', label: 'Resolved' },
    'CLOSED': { color: 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-white/5', label: 'Closed' }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-black transition-colors duration-300 pb-20 md:p-10 md:pb-16">
      <div className="max-w-2xl md:max-w-7xl mx-auto">
        {/* Header - Professional Dashboard Style */}
        <div className="flex items-center gap-3 px-4 py-6 md:px-0 md:py-0 md:mb-12 border-b border-gray-100 dark:border-white/5 md:border-none bg-white/80 dark:bg-black/80 backdrop-blur-lg sticky top-0 md:relative z-40">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 bg-gray-50 dark:bg-white/5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
          >
            <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400 md:w-6 md:h-6" />
          </button>
          <div>
            <h1 className="text-[18px] md:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">My Complaints</h1>
            <p className="hidden md:block text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Track and manage your support tickets</p>
          </div>
        </div>

        {/* Complaints List */}
        <div className="px-0 md:px-0 mt-4 md:mt-0">
          <p className="!text-[10px] md:text-[11px] font-black text-gray-500 dark:text-gray-400 px-4 py-3 md:px-0 md:mb-8 tracking-[0.2em] uppercase bg-gray-50/80 dark:bg-white/5 border-y border-gray-100 dark:border-white/5 md:border-none md:bg-transparent">Active Support Requests</p>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-transparent">
              <Loader2 className="animate-spin text-[#0c831f] mb-4 w-8 h-8 md:w-12 md:h-12" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Retrieving ticket history...</p>
            </div>
          ) : complaints.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-white/5 md:divide-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-0 md:gap-8">
              {complaints.map((c) => (
                <div
                  key={c.ticketId}
                  className="w-full py-4 px-6 md:p-8 flex flex-col bg-white dark:bg-[#121212] md:bg-white dark:md:bg-[#141414] md:border md:border-gray-100 dark:md:border-white/10 md:rounded-[32px] transition-all group md:hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] md:hover:-translate-y-1.5 relative overflow-hidden"
                >
                  {/* Premium Brand Accent Bar - Only visible on md+ */}
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0c831f] opacity-0 md:group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-3 md:mb-8">
                    <div className="flex items-center gap-4 md:gap-5">
                      <div className="w-10 h-10 md:w-16 md:h-16 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm text-[#0c831f] group-hover:scale-110 transition-transform">
                        <MessageCircle size={18} className="md:w-8 md:h-8" />
                      </div>
                      <div>
                        <div className="text-[14px] md:text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-1 md:mb-2 uppercase">{c.category}</div>
                        <div className="text-[10px] md:text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em] opacity-80">
                          {c.ticketId} • {c.order?.orderId ? `Order #${c.order.orderId.slice(-6).toUpperCase()}` : 'General Ticket'}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 md:px-4 md:py-2 rounded-full md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm md:shadow-md transition-all ${statusMap[c.status]?.color} border-current/20`}>
                      {statusMap[c.status]?.label}
                    </div>
                  </div>

                  <div className="flex flex-col pl-[3.5rem] md:pl-0 md:mt-auto space-y-3">
                    <div className="bg-gray-50/80 dark:bg-white/5 p-4 md:p-6 rounded-[24px] border border-gray-100 dark:border-white/5">
                      <p className="text-[12px] md:text-[15px] font-bold text-gray-600 dark:text-gray-300 italic leading-relaxed whitespace-pre-line line-clamp-4 md:line-clamp-none">"{c.description}"</p>
                    </div>

                    {c.attachments && c.attachments.length > 0 && (
                      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                        {c.attachments.map((img, idx) => (
                          <a key={idx} href={img} target="_blank" rel="noreferrer" className="flex-shrink-0">
                            <img
                              src={img}
                              alt="Attachment"
                              className="w-14 h-14 md:w-20 md:h-20 object-cover rounded-xl border-2 border-white dark:border-white/10 hover:border-[#0c831f] transition-all shadow-sm"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    {c.resolutionSolution && (
                      <div className="flex gap-3 md:gap-4 p-4 md:p-6 bg-green-50/80 dark:bg-[#0c831f]/10 rounded-[28px] border border-green-100 dark:border-green-500/20 shadow-sm">
                        <CheckCircle size={16} className="text-[#0c831f] flex-shrink-0 mt-0.5 md:w-6 md:h-6 md:mt-0" strokeWidth={3} />
                        <div>
                          <p className="text-[10px] md:text-[11px] font-black text-[#0c831f] uppercase tracking-[0.2em] mb-1.5">Official Resolution</p>
                          <p className="text-[12px] md:text-[15px] font-black text-gray-900 dark:text-gray-100 leading-snug">{c.resolutionSolution}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center px-6">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-inner">
                <MessageCircle size={32} className="text-gray-300 md:w-10 md:h-10" />
              </div>
              <h2 className="!text-[14px] md:!text-2xl font-black text-gray-900 dark:text-gray-100 mb-2 md:mb-4">No complaints yet</h2>
              <p className="!text-[10px] md:!text-base text-gray-400 font-medium mb-8 md:mb-10 max-w-[200px] md:max-w-md">You haven't raised any complaints.</p>
              <button
                onClick={() => navigate('/orders')}
                className="bg-[#0c831f] text-white px-8 py-3 md:px-10 md:py-4 rounded-xl !text-[11px] md:!text-sm font-black uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all hover:bg-[#0a6b19]"
              >
                View Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyComplaintsPage;
