import React, { useState, useEffect } from 'react';
import { 
    Bell, Trash2, CheckSquare, Square, Mail, Eye, 
    MoreVertical, ChevronLeft, ChevronRight, Loader2,
    CheckCircle2, XCircle
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
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (staffToken) fetchNotifications();
    }, [page, staffToken]);

    const handleSelectAll = () => {
        if (selectedIds.length === notifications.length) {
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
            // Backend currently only has markAllRead or single markAsRead
            // I'll do sequential markAsRead if multiple are selected or suggest a bulk endpoint
            // For now, I'll use markAsRead for each selected or implement bulk on backend if I can.
            // Actually, I'll just do sequential for the selected ones.
            await Promise.all(selectedIds.map(id => 
                axios.put(`${API_BASE_URL}/notifications/read/${id}`, {}, {
                    headers: { Authorization: `Bearer ${staffToken}` }
                })
            ));
            toast.success('Selected marked as read');
            setSelectedIds([]);
            fetchNotifications();
        } catch (error) {
            toast.error('Action failed');
        } finally {
            setUpdating(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        
        const result = await Swal.fire({
            title: 'Delete Notifications?',
            text: `Are you sure you want to delete ${selectedIds.length} notifications?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Delete'
        });

        if (!result.isConfirmed) return;

        setUpdating(true);
        try {
            const res = await axios.delete(`${API_BASE_URL}/notifications/delete`, {
                headers: { Authorization: `Bearer ${staffToken}` },
                data: { ids: selectedIds }
            });
            if (res.data.success) {
                toast.success('Notifications deleted');
                setSelectedIds([]);
                fetchNotifications();
            }
        } catch (error) {
            toast.error('Deletion failed');
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-emerald-600 rounded-[1.5rem] text-white shadow-xl shadow-emerald-100 ring-4 ring-emerald-50">
                        <Bell size={28} />
                    </div>
                    <div>
                        <h2 className="font-black text-gray-800 text-3xl tracking-tight">Notification Center</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Received Updates & Alerts</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => { setPage(1); fetchNotifications(); }}
                        className="p-3 text-emerald-600 bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        Sync
                    </button>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-white rounded-[2rem] p-4 border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleSelectAll}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-widest text-slate-600"
                    >
                        {selectedIds.length === notifications.length && notifications.length > 0 ? <CheckSquare size={16} className="text-emerald-500" /> : <Square size={16} />}
                        Select All
                    </button>

                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-emerald-100">
                                {selectedIds.length} Selected
                            </span>
                            <button 
                                onClick={handleBulkMarkRead}
                                disabled={updating}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                                <Eye size={14} /> Mark Read
                            </button>
                            <button 
                                onClick={handleBulkDelete}
                                disabled={updating}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Showing {notifications.length} of {pagination.total} Alerts
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="bg-white rounded-[2rem] p-24 text-center border border-gray-100 shadow-sm flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-emerald-600" size={40} />
                        <p className="text-xs font-black text-emerald-600/50 uppercase tracking-widest">Polling Secure Gateway...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-24 text-center border border-gray-100 shadow-sm flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                            <Bell className="text-emerald-200" size={32} />
                        </div>
                        <h3 className="font-black text-gray-800 text-xl tracking-tight">Inbox Clear</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No new notifications in this scope.</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div 
                            key={notif._id}
                            className={`group bg-white rounded-[1.8rem] p-5 border transition-all duration-300 flex items-start gap-5 ${selectedIds.includes(notif._id) ? 'border-emerald-500 ring-2 ring-emerald-50 shadow-emerald-50' : 'border-gray-100 shadow-sm hover:border-emerald-200'} ${!notif.isRead ? 'border-l-4 border-l-emerald-600' : ''}`}
                        >
                            <button 
                                onClick={() => toggleSelect(notif._id)}
                                className="mt-1 flex-shrink-0"
                            >
                                {selectedIds.includes(notif._id) ? <CheckSquare size={20} className="text-emerald-600" /> : <Square size={20} className="text-gray-200 group-hover:text-emerald-300 transition-colors" />}
                            </button>

                            <div className="flex-1 min-w-0" onClick={() => markSingleRead(notif._id)}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                    <h4 className={`text-sm font-black tracking-tight ${!notif.isRead ? 'text-gray-800' : 'text-gray-500'}`}>
                                        {notif.title}
                                    </h4>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className={`text-xs leading-relaxed ${!notif.isRead ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {notif.body}
                                </p>
                            </div>

                            {!notif.isRead && (
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full flex-shrink-0 animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-3">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-emerald-600 disabled:opacity-50 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="bg-white px-6 py-3 border border-gray-100 rounded-2xl shadow-sm font-black text-gray-800 text-sm tracking-widest">
                        {page} <span className="text-gray-300 mx-2">/</span> {pagination.totalPages}
                    </div>
                    <button 
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page >= pagination.totalPages}
                        className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-emerald-600 disabled:opacity-50 transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Notifications;
