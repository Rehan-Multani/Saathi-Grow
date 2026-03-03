import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ChevronLeft, Search, Package, Clock, MessageSquare, ShieldAlert, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDeliveryStore from '../store/deliveryStore';
import * as complaintApi from '../api/complaintApi';
import { toast } from 'react-toastify';

const Grievances = () => {
  const navigate = useNavigate();
  const { token } = useDeliveryStore();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const res = await complaintApi.getPartnerComplaints(token);
      if (res.success) {
        setComplaints(res.complaints);
      }
    } catch (error) {
      toast.error('Failed to load grievances');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadComplaints();
  }, [token]);

  const filtered = complaints.filter(c =>
    c.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-5 pb-8 min-h-screen bg-slate-50 dark:bg-zinc-950 px-3 md:px-4 pt-4 md:pt-6">
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 md:p-2.5 bg-white dark:bg-zinc-900 rounded-xl md:rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm"
        >
          <ChevronLeft size={18} md:size={20} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight dark:text-white">Grievances</h1>
          <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5">Order related issues</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} md:size={18} />
        <input
          type="text"
          placeholder="Search Ticket ID or Category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 bg-white dark:bg-zinc-900 border-none rounded-xl md:rounded-2xl shadow-sm focus:ring-2 focus:ring-lime-500/20 text-xs md:text-sm font-bold dark:text-white dark:placeholder:text-zinc-600 transition-all"
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-lime-500 mb-4" size={32} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading records...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((c, idx) => (
            <motion.div
              key={c.ticketId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white dark:bg-zinc-900 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-3 md:p-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${c.status === 'CLOSED' ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-600'
                  }`}>
                  {c.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex gap-3 md:gap-4 items-start mb-4 md:mb-5">
                <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${c.priority === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-green-50 text-[#028A0F]'
                  } dark:bg-zinc-800 pb-0.5`}>
                  <ShieldAlert size={20} md:size={22} />
                </div>
                <div className="min-w-0 pr-16 md:pr-20">
                  <span className="text-[9px] font-black text-[#028A0F] bg-green-50 dark:bg-[#028A0F]/10 px-1.5 py-0.5 rounded-md uppercase">{c.ticketId}</span>
                  <h3 className="text-sm md:text-base font-black mt-1 dark:text-white uppercase tracking-tight truncate">{c.category}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-5">
                <div className="p-2 md:p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl md:rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase mb-0.5">Order ID</p>
                  <p className="text-[11px] md:text-xs font-black dark:text-white">#{c.order?.orderId?.slice(-6)}</p>
                </div>
                <div className="p-2 md:p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl md:rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <p className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase mb-0.5">Date</p>
                  <p className="text-[11px] md:text-xs font-black dark:text-white">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 md:p-4 rounded-xl md:rounded-2xl mb-3 md:mb-4 border border-dashed border-slate-200 dark:border-zinc-700">
                <p className="text-[10px] md:text-xs font-bold text-slate-600 dark:text-zinc-400 italic line-clamp-2 leading-relaxed">
                  "{c.description}"
                </p>
              </div>

              {c.resolutionSolution && (
                <div className="flex items-center gap-3 text-lime-600 dark:text-lime-500 font-black text-xs uppercase tracking-widest mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <MessageSquare size={16} />
                  Resolution: {c.resolutionSolution}
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <AlertCircle size={64} className="mb-4 text-slate-300" />
            <p className="font-black text-xs uppercase tracking-[0.3em]">No grievances found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Grievances;
