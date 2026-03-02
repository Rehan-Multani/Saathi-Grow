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
    'OPEN': { color: 'text-amber-600 bg-amber-50', label: 'Under Review' },
    'ESCALATED_TO_STORE': { color: 'text-orange-600 bg-orange-50', label: 'Escalated to Store' },
    'STORE_RESPONDED': { color: 'text-blue-600 bg-blue-50', label: 'Response Received' },
    'RESOLVED': { color: 'text-green-600 bg-green-50', label: 'Resolved' },
    'CLOSED': { color: 'text-gray-500 bg-gray-100', label: 'Closed' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] md:bg-white md:dark:bg-black md:bg-none transition-colors duration-300 pb-20 md:p-8 md:pb-8">
      <div className="max-w-2xl md:max-w-6xl mx-auto">
        {/* Header */}
        <div className="hidden md:flex items-center gap-3 mb-0 md:mb-10 p-4 md:p-0 border-b border-gray-200/50 md:border-none bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] md:bg-none md:bg-white md:dark:bg-black">
          <button
            onClick={() => navigate('/profile')}
            className="p-1.5 md:p-2 bg-white/50 dark:bg-[#141414] rounded-full shadow-sm hover:bg-gray-100 transition-colors md:bg-gray-50"
          >
            <ArrowLeft size={16} className="md:w-6 md:h-6" />
          </button>
          <h1 className="!text-[16px] md:!text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">My Complaints</h1>
        </div>

        {/* Complaints List */}
        <div className="px-0 md:px-0">
          <p className="!text-[10px] md:!text-sm font-bold text-gray-400 px-4 py-2 md:px-0 md:mb-6 tracking-widest uppercase bg-gray-50/50 md:bg-transparent">Your Complaint History</p>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-transparent">
              <Loader2 className="animate-spin text-[#0c831f] mb-4 w-8 h-8 md:w-10 md:h-10" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading history...</p>
            </div>
          ) : complaints.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-white/5 md:divide-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6 bg-transparent md:bg-transparent">
              {complaints.map((c) => (
                <div
                  key={c.ticketId}
                  className="w-full py-3 px-6 md:p-6 flex flex-col hover:bg-gray-50 dark:hover:bg-white/5 md:bg-white dark:md:bg-[#141414] md:border md:border-gray-100 dark:md:border-white/5 md:rounded-2xl transition-all group cursor-pointer md:hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-2 md:mb-6">
                    <div className="flex items-center gap-4 md:gap-4">
                      <div className="w-9 h-9 md:w-14 md:h-14 rounded-full md:rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm text-[#0c831f]">
                        <MessageCircle size={18} className="md:w-7 md:h-7" />
                      </div>
                      <div>
                        <div className="!text-[13px] md:!text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-1 md:mb-1.5 uppercase">{c.category}</div>
                        <div className="!text-[10px] md:!text-xs text-gray-400 font-bold uppercase tracking-wider">{c.ticketId} • Order #{c.order?.orderId?.slice(-6).toUpperCase()}</div>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-full md:rounded-lg !text-[8px] md:!text-[10px] font-black uppercase tracking-widest border border-current bg-opacity-10 shadow-sm ${statusMap[c.status]?.color}`}>
                      {statusMap[c.status]?.label}
                    </div>
                  </div>

                  <div className="flex flex-col pl-[3.25rem] md:pl-0 md:mt-auto space-y-2">
                    <div className="bg-gray-50 dark:bg-white/5 p-3 md:p-4 rounded-xl">
                      <p className="!text-[11px] md:!text-sm font-medium text-gray-600 dark:text-gray-400 italic line-clamp-3">"{c.description}"</p>
                    </div>

                    {c.attachments && c.attachments.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {c.attachments.map((img, idx) => (
                          <a key={idx} href={img} target="_blank" rel="noreferrer" className="flex-shrink-0">
                            <img
                              src={img}
                              alt="Attachment"
                              className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border border-gray-100 dark:border-white/10 hover:opacity-80 transition-opacity shadow-sm"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    {c.resolutionSolution && (
                      <div className="flex gap-2 md:gap-3 p-3 bg-green-50 dark:bg-[#0c831f]/5 rounded-xl border border-green-100 dark:border-[#0c831f]/10">
                        <CheckCircle size={14} className="text-[#0c831f] flex-shrink-0 mt-0.5 md:w-5 md:h-5 md:mt-0" strokeWidth={3} />
                        <div>
                          <p className="!text-[9px] md:!text-xs font-black text-[#0c831f] uppercase tracking-widest mb-0.5 md:mb-1">Store Resolution</p>
                          <p className="!text-[11px] md:!text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{c.resolutionSolution}</p>
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
