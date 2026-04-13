import React, { useState, useEffect } from 'react';
import { 
    Bell, Trash2, CheckSquare, Square, Mail, Eye, 
    MoreVertical, ChevronLeft, ChevronRight, Loader2,
    CheckCircle2, XCircle, RefreshCcw, BellOff, Inbox
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../../config/apiConfig';
import { useStaffAuth } from '../context/StaffAuthContext';

const Notifications = () => {
    const { staffUser } = useStaffAuth();
    const staffToken = staffUser?.token;
    
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [selectedIds, setSelectedIds] = useState([]);
    const [updating, setUpdating] = useState(false);
    const limit = 10;

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/notifications/my?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${staffToken}` }
            });
            if (res.data.success) {
                setNotifications(res.data.notifications);
                setPagination(res.data.pagination);
            }
        } catch (error) {
            toast.error('Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (staffToken) fetchNotifications();
    }, [page, staffToken]);

    const handleSelectAll = () => {
        if (selectedIds.length === notifications.length && notifications.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(notifications.map(n => n._id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkMarkRead = async () => {
        if (selectedIds.length === 0) return;
        setUpdating(true);
        try {
            await Promise.all(selectedIds.map(id => 
                axios.put(`${API_BASE_URL}/notifications/read/${id}`, {}, {
                    headers: { Authorization: `Bearer ${staffToken}` }
                })
            ));
            toast.success('Done');
            setSelectedIds([]);
            fetchNotifications();
        } catch (error) {
            toast.error('Failed');
        } finally {
            setUpdating(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        const result = await Swal.fire({
            title: 'Wipe Logs?',
            text: `Clear ${selectedIds.length} items?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Wipe',
            customClass: { popup: 'rounded-[1.5rem]' }
        });
        if (!result.isConfirmed) return;
        setUpdating(true);
        try {
            const res = await axios.delete(`${API_BASE_URL}/notifications/delete`, {
                headers: { Authorization: `Bearer ${staffToken}` },
                data: { ids: selectedIds }
            });
            if (res.data.success) {
                toast.success('Done');
                setSelectedIds([]);
                fetchNotifications();
            }
        } catch (error) {
            toast.error('Failed');
        } finally {
            setUpdating(false);
        }
    };

    const markSingleRead = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/notifications/read/${id}`, {}, {
                headers: { Authorization: `Bearer ${staffToken}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden text-left font-black">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left px-1 font-black">
                <div className="space-y-2 text-left font-black">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none font-black text-left font-black">System Logs</h1>
                    <div className="flex items-center gap-3 font-black text-left">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100 italic leading-none font-black text-left font-black">
                            <Bell size={12} className="animate-pulse" /> Alerts
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5 font-black text-left font-black">System Event Log</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto font-black text-left">
                    <button 
                        onClick={() => { setPage(1); fetchNotifications(); }}
                        className="w-12 h-12 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95 shrink-0 font-black"
                    >
                        <RefreshCcw size={18} className={loading && notifications.length > 0 ? 'animate-spin' : ''} />
                    </button>
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right duration-300 font-black">
                            <button 
                                onClick={handleBulkMarkRead}
                                disabled={updating}
                                className="flex items-center gap-2 px-5 py-3.5 bg-blue-600 text-white rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest italic disabled:opacity-50 shadow-xl shadow-blue-500/20 font-black"
                            >
                                <Eye size={16} /> Check
                            </button>
                            <button 
                                onClick={handleBulkDelete}
                                disabled={updating}
                                className="flex items-center justify-center w-12 h-12 bg-red-50 text-red-600 border border-red-100 rounded-2xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 shadow-sm font-black"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col group p-4 lg:p-6 text-left font-black">
                <div className="px-2 mb-6 flex justify-between items-center text-left font-black">
                    <button 
                        onClick={handleSelectAll}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest italic font-black ${selectedIds.length === notifications.length && notifications.length > 0 ? 'bg-slate-950 text-white font-black' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:text-blue-600'}`}
                    >
                        {selectedIds.length === notifications.length && notifications.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                        Sync All
                    </button>
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic font-black leading-none text-left">
                        {pagination.total} Events
                    </div>
                </div>

                <div className="space-y-4 text-left font-black font-black">
                    {loading && notifications.length === 0 ? (
                         Array( 6 ).fill(0).map((_, i) => (
                            <div key={i} className="bg-slate-50/50 rounded-[2rem] h-24 w-full animate-pulse border border-slate-50 flex items-center px-8 text-left font-black" />
                        ))
                    ) : notifications.length === 0 ? (
                        <div className="py-32 text-center mx-auto text-left font-black">
                            <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-200 shadow-inner">
                                <Inbox size={40} />
                            </div>
                            <h3 className="font-black text-[10px] text-slate-300 uppercase tracking-[0.4em] italic font-black text-center font-black">No alerts</h3>
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div 
                                key={notif._id}
                                className={`group bg-white rounded-[2rem] p-6 border transition-all duration-300 flex items-start gap-5 text-left relative overflow-hidden font-black ${selectedIds.includes(notif._id) ? 'border-blue-500 bg-blue-50/10 shadow-lg shadow-blue-500/5 font-black' : 'border-slate-100 hover:border-blue-200 hover:shadow-md shadow-sm font-black'} ${!notif.isRead ? 'border-l-4 border-l-blue-600 bg-blue-50/20' : ''}`}
                            >
                                <button 
                                    onClick={() => toggleSelect(notif._id)}
                                    className="mt-1 flex-shrink-0 relative z-10 font-black font-black"
                                >
                                    {selectedIds.includes(notif._id) ? <CheckSquare size={20} className="text-blue-600 shadow-sm" /> : <Square size={20} className="text-slate-100 group-hover:text-blue-400 transition-colors shadow-sm" />}
                                </button>

                                <div className="flex-1 min-w-0 font-black text-left font-black" onClick={() => markSingleRead(notif._id)}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 text-left font-black italic font-black">
                                        <h4 className={`text-sm font-black tracking-tight uppercase italic leading-none shrink-0 font-black text-left font-black ${!notif.isRead ? 'text-slate-950 font-black' : 'text-slate-400'}`}>
                                            {notif.title}
                                        </h4>
                                        <span className={`text-[9px] font-black uppercase tracking-widest font-mono shrink-0 leading-none font-black italic text-left font-black ${!notif.isRead ? 'text-blue-600 font-black' : 'text-slate-300'}`}>
                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <p className={`text-[12px] font-bold leading-relaxed tracking-tight font-black text-left italic font-black pr-16 font-black ${!notif.isRead ? 'text-slate-700 font-black font-black' : 'text-slate-400'}`}>
                                        {notif.body}
                                    </p>
                                </div>

                                {!notif.isRead && (
                                    <div className="absolute right-6 top-6 px-3 py-1 bg-blue-600 text-white rounded-lg flex-shrink-0 animate-in fade-in zoom-in-50 shadow-xl shadow-blue-500/20 font-black font-black">
                                        <p className="text-[8px] font-black uppercase tracking-widest italic font-black">New</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {!loading && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-6 font-black text-left font-black">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-all active:scale-95 shrink-0 font-black font-black"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="bg-white h-12 px-8 flex items-center border border-slate-200 rounded-2xl shadow-sm font-black text-slate-950 text-[11px] tracking-[0.3em] italic leading-none shrink-0 font-black">
                        {page} <span className="text-slate-100 mx-4 font-black">/</span> {pagination.totalPages}
                    </div>
                    <button 
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page >= pagination.totalPages}
                        className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-all active:scale-95 shrink-0 font-black font-black"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default Notifications;
