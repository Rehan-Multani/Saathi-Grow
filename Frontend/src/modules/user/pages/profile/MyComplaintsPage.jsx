import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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
    'OPEN': { color: 'text-amber-500', bg: 'bg-amber-50', label: 'Under Review' },
    'ESCALATED_TO_STORE': { color: 'text-orange-500', bg: 'bg-orange-50', label: 'Escalated to Store' },
    'STORE_RESPONDED': { color: 'text-blue-500', bg: 'bg-blue-50', label: 'Response Received' },
    'RESOLVED': { color: 'text-green-500', bg: 'bg-green-50', label: 'Resolved' },
    'CLOSED': { color: 'text-gray-400', bg: 'bg-gray-100', label: 'Closed' }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#141414] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-black/60 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 p-4 transition-all">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-black tracking-tight uppercase">My Complaints</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#0c831f] mb-4" />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading history...</p>
          </div>
        ) : complaints.length > 0 ? (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div key={c.ticketId} className="bg-white dark:bg-[#1a1a1a] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black text-[#0c831f] bg-green-50 dark:bg-[#0c831f]/10 px-2 py-0.5 rounded-lg uppercase tracking-widest">{c.ticketId}</span>
                    <h3 className="text-[14px] font-black mt-2 uppercase tracking-tight">{c.category}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Order #{c.order?.orderId?.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-tighter border ${statusMap[c.status]?.bg} ${statusMap[c.status]?.color}`}>
                    {statusMap[c.status]?.label}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl mb-4">
                  <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 italic">"{c.description}"</p>
                </div>

                {c.attachments && c.attachments.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {c.attachments.map((img, idx) => (
                      <a key={idx} href={img} target="_blank" rel="noreferrer" className="flex-shrink-0">
                        <img
                          src={img}
                          alt="Attachment"
                          className="w-16 h-16 object-cover rounded-lg border border-gray-100 dark:border-white/10 hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                )}


                {c.resolutionSolution && (
                  <div className="flex gap-3 p-4 bg-green-50 dark:bg-[#0c831f]/5 rounded-xl border border-green-100 dark:border-[#0c831f]/10">
                    <CheckCircle size={16} className="text-[#0c831f] flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-[#0c831f] uppercase tracking-widest mb-1">Store Resolution</p>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{c.resolutionSolution}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <MessageCircle size={64} className="mb-4 text-gray-300" />
            <p className="font-black text-xs uppercase tracking-widest">No complaints raised yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaintsPage;
