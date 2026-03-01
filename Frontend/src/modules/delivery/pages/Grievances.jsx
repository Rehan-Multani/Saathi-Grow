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
    <div className="space-y-6 pb-10 min-h-screen bg-slate-50 dark:bg-zinc-950 px-4 pt-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight dark:text-white">Grievances & Disputes</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Order related issues involving you</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by Ticket ID or Category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border-none rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-lime-500/20 text-sm font-bold dark:text-white dark:placeholder:text-zinc-600 transition-all"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${c.status === 'CLOSED' ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-600'
                  }`}>
                  {c.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex gap-4 items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.priority === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'
                  } dark:bg-zinc-800`}>
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-lime-600 bg-lime-50 dark:bg-lime-500/10 px-2 py-0.5 rounded-lg uppercase">{c.ticketId}</span>
                  <h3 className="text-lg font-black mt-1 dark:text-white uppercase tracking-tight">{c.category}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Order Context</p>
                  <p className="text-sm font-black dark:text-white">#{c.order?.orderId?.slice(-6)}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Reported On</p>
                  <p className="text-sm font-black dark:text-white">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl mb-4 border border-dashed border-slate-200 dark:border-zinc-700">
                <p className="text-xs font-bold text-slate-600 dark:text-zinc-400 italic">
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
