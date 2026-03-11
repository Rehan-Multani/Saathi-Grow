import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw, Package, MapPin, Phone, CheckCircle2,
  ArrowRight, Loader2, AlertCircle, Truck, Clock,
  ChevronRight, User, RefreshCw, X, Layers
} from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import { API_BASE_URL } from '../../../config/apiConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API = `${API_BASE_URL}/delivery`;

const StatusBadge = ({ status }) => {
  const styles = {
    assigned: { label: 'Assigned', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    in_progress: { label: 'In Transit', cls: 'bg-blue-100 text-blue-600 border-blue-200' },
    completed: { label: 'Returned', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  };
  const v = styles[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${v.cls}`}>
      {v.label}
    </span>
  );
};

const ReturnPickups = () => {
  const { token } = useDeliveryStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('active'); // active | history
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRuns = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const type = activeTab === 'active' ? 'active' : 'history';
      const { data } = await axios.get(`${API}/orders?type=${type}&runType=return`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRuns(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load return runs');
    } finally {
      setLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => { fetchRuns(); }, [fetchRuns]);

  return (
    <div className="space-y-4 md:space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <RotateCcw size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-zinc-100">Return Runs</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Assigned Batched Return Tasks</p>
          </div>
        </div>
        <button
          onClick={fetchRuns}
          disabled={loading}
          className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm active:scale-95 transition-all"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin text-emerald-600' : 'text-slate-400'} />
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl w-fit shadow-sm">
        {[
          { id: 'active', label: 'In Progress' },
          { id: 'history', label: 'History' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="animate-spin mx-auto text-emerald-600 mb-4" size={32} />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Syncing Logistics Console...</p>
        </div>
      ) : runs.length === 0 ? (
        <div className="py-24 text-center bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-zinc-800 border-dashed">
          <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Truck className="text-gray-200" size={32} />
          </div>
          <p className="font-black text-gray-800 dark:text-gray-200">No Return Runs Found</p>
          <p className="text-xs text-gray-400 mt-1">Check back later or contact supervisor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {runs.map((run, idx) => (
              <motion.div
                key={run._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/delivery/tracking/${run._id}`)}
                className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col gap-5 border-l-8 border-l-emerald-600"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-zinc-100 text-lg group-hover:text-emerald-600 transition-colors">#{run.runId}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1">
                      <Layers size={10} /> {run.orders?.length} Pickup Points
                    </p>
                  </div>
                  <StatusBadge status={run.status} />
                </div>

                <div className="space-y-4">
                  <div className="relative pl-6 space-y-4">
                    <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-zinc-800"></div>
                    
                    {/* First stop info */}
                    <div className="relative">
                      <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-emerald-100 dark:bg-emerald-900 border-2 border-white dark:border-zinc-900"></div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pickups From</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-300 truncate">
                        {run.orders?.[0]?.order?.user?.name} & others...
                      </p>
                    </div>

                    {/* Destination info */}
                    <div className="relative">
                      <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white dark:border-zinc-900"></div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination ({run.destinationType})</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-300 truncate">
                        {run.destinationId?.name || run.destinationId?.storeName || 'Branch / Vendor HQ'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 dark:border-zinc-800 flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].slice(0, run.orders?.length).map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                        <User size={14} className="text-slate-400" />
                      </div>
                    ))}
                    {run.orders?.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        +{run.orders.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 group-hover:translate-x-1 transition-transform">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Start Mission</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ReturnPickups;
