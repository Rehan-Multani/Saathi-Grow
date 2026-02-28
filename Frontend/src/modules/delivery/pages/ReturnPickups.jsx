import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw, Package, MapPin, Phone, CheckCircle2,
  ArrowRight, Loader2, AlertCircle, Truck, Clock,
  ChevronRight, User, IndianRupee, RefreshCw, X
} from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import { API_BASE_URL } from '../../../config/apiConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API = `${API_BASE_URL}/delivery`;

const StatusBadge = ({ status }) => {
  const map = {
    pending: { label: 'Available', cls: 'bg-amber-100 text-amber-700' },
    return_pickup_assigned: { label: 'Assigned', cls: 'bg-blue-100 text-blue-700' },
    return_in_transit: { label: 'In Transit', cls: 'bg-purple-100 text-purple-700' },
    return_delivered: { label: 'Completed', cls: 'bg-green-100 text-green-700' },
  };
  const v = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${v.cls}`}>
      {v.label}
    </span>
  );
};

const ReturnPickups = () => {
  const { token } = useDeliveryStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('available'); // available | active | history
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/returns?type=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch return pickups:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleAccept = async (taskId) => {
    try {
      setProcessingId(taskId);
      await axios.patch(`${API}/returns/${taskId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Return pickup accepted!');
      fetchTasks();
      setSelectedTask(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept task');
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      setProcessingId(taskId);
      await axios.patch(`${API}/returns/${taskId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const messages = {
        return_in_transit: '✅ Item picked up from customer! Head to the branch.',
        return_delivered: '🎉 Return delivered to branch! Fee credited to your wallet.',
      };
      toast.success(messages[status] || 'Status updated!');
      fetchTasks();
      setSelectedTask(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const tabs = [
    { id: 'available', label: 'Available', count: activeTab === 'available' ? tasks.length : '?' },
    { id: 'active', label: 'My Tasks', count: activeTab === 'active' ? tasks.length : '?' },
    { id: 'history', label: 'Completed', count: activeTab === 'history' ? tasks.length : '?' },
  ];

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-zinc-100 flex items-center gap-2">
            <RotateCcw size={22} className="text-blue-500" />
            Return Pickups
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">
            Collect returns from customers · Earn ₹30/task
          </p>
        </div>
        <button
          onClick={fetchTasks}
          disabled={loading}
          className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm active:scale-90 transition-all"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-blue-500' : 'text-slate-400'} />
        </button>
      </div>

      {/* Earning Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-lg shadow-blue-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100/80 text-[10px] font-black uppercase tracking-widest mb-1">Return Pickup Reward</p>
            <h3 className="text-3xl font-black">₹30 <span className="text-lg">per task</span></h3>
            <p className="text-blue-200 text-xs mt-1">Credited instantly on completion</p>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            <IndianRupee size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 md:top-0 z-30 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-lg py-2 -mx-4 px-4 md:-mx-8 md:px-8 flex justify-center">
        <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm w-full max-w-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all relative z-10 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="returnTabBg"
                  className="absolute inset-0 bg-blue-600 rounded-xl -z-10 shadow-lg"
                />
              )}
              {tab.label}
              {tab.count !== '?' && (
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-zinc-800'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Package size={28} className="text-slate-200" />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-300">
            {activeTab === 'available' ? 'No pickups available' : activeTab === 'active' ? 'No active tasks' : 'No history yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {tasks.map((task, idx) => (
              <motion.div
                key={task._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => setSelectedTask(task)}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-slate-50 dark:border-zinc-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-500/10">
                      <RotateCcw size={18} />
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-800 dark:text-zinc-100">#{task.order?.orderId || 'N/A'}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Return Pickup</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg text-blue-600">₹{task.pickupFee || 30}</p>
                    <p className="text-[9px] text-slate-400 font-bold">fee</p>
                  </div>
                </div>

                {/* Customer + Address */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-zinc-800 flex items-center justify-center">
                      <User size={13} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-800 dark:text-zinc-100">{task.order?.user?.name || 'Customer'}</p>
                      <p className="text-[9px] text-slate-400 font-medium">{task.order?.user?.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <MapPin size={13} className="text-red-500" />
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-zinc-300 font-medium line-clamp-2 leading-relaxed">
                      {task.order?.shippingAddress?.street || 'Address not available'}
                    </p>
                  </div>

                  {task.order?.returnRequest?.reason && (
                    <div className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-500/10 p-2.5 rounded-xl">
                      <AlertCircle size={13} className="text-amber-600 flex-shrink-0" />
                      <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400 truncate">
                        {task.order.returnRequest.reason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-slate-50 dark:bg-white/5 flex items-center justify-between group-hover:bg-blue-600 transition-colors">
                  <StatusBadge status={task.status} />
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-white transition-all" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 px-5 py-4 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <RotateCcw size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-zinc-100">Return Pickup</h3>
                    <p className="text-[10px] text-slate-400 font-bold">#{selectedTask.order?.orderId}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTask(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Earnings */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
                  <p className="text-blue-200 text-[10px] font-black uppercase mb-1">Your Earning</p>
                  <p className="text-4xl font-black">₹{selectedTask.pickupFee || 30}</p>
                  <p className="text-blue-200 text-xs mt-1">Credited instantly upon return to branch</p>
                </div>

                {/* Customer Details */}
                <div className="bg-slate-50 dark:bg-zinc-800 rounded-2xl p-4 space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-700 border border-slate-100 dark:border-zinc-600 flex items-center justify-center">
                      <User size={18} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 dark:text-zinc-100">{selectedTask.order?.user?.name}</p>
                      <p className="text-xs text-slate-500">{selectedTask.order?.user?.phone}</p>
                    </div>
                    <a
                      href={`tel:${selectedTask.order?.user?.phone}`}
                      className="ml-auto w-9 h-9 rounded-xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-green-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                </div>

                {/* Pickup Address */}
                <div className="bg-slate-50 dark:bg-zinc-800 rounded-2xl p-4 space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pickup From (Customer)</p>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{selectedTask.order?.shippingAddress?.street}</p>
                      <p className="text-xs text-slate-500">{selectedTask.order?.shippingAddress?.city}</p>
                    </div>
                  </div>
                </div>
                {/* Drop Address — Branch OR Vendor Store */}
                {selectedTask.dropDestinationInfo ? (
                  <div className="bg-slate-50 dark:bg-zinc-800 rounded-2xl p-4 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Drop At ({selectedTask.dropDestinationInfo.type === 'vendor' ? 'Vendor Store' : 'Branch'})
                    </p>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                          {selectedTask.dropDestinationInfo.name}
                        </p>
                        <p className="text-xs text-slate-500">{selectedTask.dropDestinationInfo.address}</p>
                        {selectedTask.dropDestinationInfo.phone && (
                          <a
                            href={`tel:${selectedTask.dropDestinationInfo.phone}`}
                            className="text-[10px] text-blue-500 font-bold flex items-center gap-1 mt-1"
                            onClick={e => e.stopPropagation()}
                          >
                            <Phone size={10} /> {selectedTask.dropDestinationInfo.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : selectedTask.order?.branchId && (
                  <div className="bg-slate-50 dark:bg-zinc-800 rounded-2xl p-4 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Drop At (Branch)</p>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{selectedTask.order.branchId.name}</p>
                        <p className="text-xs text-slate-500">{selectedTask.order.branchId.address}</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Return Reason */}
                {selectedTask.order?.returnRequest?.reason && (
                  <div className="border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-r-2xl p-4">
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Return Reason</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{selectedTask.order.returnRequest.reason}</p>
                    {selectedTask.order.returnRequest.description && (
                      <p className="text-xs text-slate-500 mt-1">{selectedTask.order.returnRequest.description}</p>
                    )}
                  </div>
                )}

                {/* Items */}
                {selectedTask.order?.items?.length > 0 && (
                  <div className="bg-slate-50 dark:bg-zinc-800 rounded-2xl p-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Items to Collect</p>
                    <div className="space-y-2">
                      {selectedTask.order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate">{item.name}</p>
                            <p className="text-[9px] text-slate-400">Qty: {item.quantity} · ₹{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 space-y-3">
                  {selectedTask.status === 'pending' && (
                    <button
                      onClick={() => handleAccept(selectedTask._id)}
                      disabled={!!processingId}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {processingId === selectedTask._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Accept Return Pickup · ₹{selectedTask.pickupFee || 30}
                    </button>
                  )}

                  {selectedTask.status === 'return_pickup_assigned' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedTask._id, 'return_in_transit')}
                      disabled={!!processingId}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-purple-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {processingId === selectedTask._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Package size={16} />
                      )}
                      Confirm Item Collected from Customer
                    </button>
                  )}

                  {selectedTask.status === 'return_in_transit' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedTask._id, 'return_delivered')}
                      disabled={!!processingId}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-green-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {processingId === selectedTask._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Truck size={16} />
                      )}
                      Delivered to Branch · Claim ₹{selectedTask.pickupFee || 30}
                    </button>
                  )}

                  {selectedTask.status === 'return_delivered' && (
                    <div className="flex items-center justify-center gap-3 py-4 bg-green-50 dark:bg-green-500/10 rounded-2xl border border-green-100 dark:border-green-500/20">
                      <CheckCircle2 size={20} className="text-green-600" />
                      <div className="text-center">
                        <p className="font-black text-green-700 dark:text-green-400 text-sm">Task Complete!</p>
                        <p className="text-[10px] text-green-600 font-bold">₹{selectedTask.pickupFee || 30} credited to your wallet</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReturnPickups;
