import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Trash2, CheckCircle, Mail, MailOpen, Inbox, RefreshCw, Clock, MoreVertical, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { getMyNotifications, markAsRead, markAllRead, deleteNotifications } from '../../admin/api/notificationApi';
import { useStoreManagerAuth } from '../context/StoreManagerAuthContext';
import { showDeleteConfirmation } from '../../../common/utils/alertUtils';

const ManagerNotifications = () => {
    const { managerUser } = useStoreManagerAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchNotifications = useCallback(async (page = 1) => {
        if (!managerUser?.token) return;
        try {
            setLoading(true);
            const res = await getMyNotifications(managerUser.token, page, 10);
            if (res.success || res.notifications) {
                setNotifications(res.notifications);
                setTotalPages(res.pagination?.totalPages || 1);
                setCurrentPage(res.pagination?.page || 1);
                setTotalItems(res.pagination?.total || 0);
            }
        } catch (error) {
            // Error handling
        } finally {
            setLoading(false);
        }
    }, [managerUser?.token]);

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(notifications.map(n => n._id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(managerUser.token, id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            toast.success('Notification marked as read');
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setLoading(true);
            await markAllRead(managerUser.token);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            Swal.fire({
                icon: 'success',
                title: 'All marked as read',
                timer: 1500,
                showConfirmButton: false,
                confirmButtonColor: '#3b82f6'
            });
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (idsToDelete) => {
        const result = await showDeleteConfirmation(
            'Delete selected?',
            'Are you sure you want to delete these notifications?'
        );

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const res = await deleteNotifications(managerUser.token, idsToDelete);
                if (res.success) {
                    toast.success('Deleted successfully');
                    setSelectedIds([]);
                    fetchNotifications(currentPage);
                }
            } catch (error) {
                toast.error('An error occurred');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="bg-slate-50 min-h-[calc(100vh-64px)] p-6 font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
                        {totalItems > 0 && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg shadow-sm">
                                {totalItems}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => fetchNotifications(currentPage)}
                        disabled={loading}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 ${loading ? 'opacity-50' : 'hover:border-blue-500 hover:text-blue-600'}`}
                    >
                        <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleMarkAllRead}
                        className="bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                        <CheckCircle size={16} />
                        <span>Mark All Read</span>
                    </button>
                </div>
            </div>

            {/* Selection Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 pl-3">
                        <input
                            type="checkbox"
                            checked={selectedIds.length === notifications.length && notifications.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Select All</span>
                    </div>

                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-left duration-200 border-l border-slate-100 pl-6">
                            <button
                                onClick={() => handleDelete(selectedIds)}
                                className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight flex items-center gap-2 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                            >
                                <Trash2 size={12} />
                                Delete ({selectedIds.length})
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-slate-500 uppercase text-[11px]">
                                <th className="w-12 px-6 py-4"></th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4 w-48 text-center">Timestamp</th>
                                <th className="px-6 py-4 w-28 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && notifications.length === 0 ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="px-6 py-4">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-4 h-4 bg-slate-100 rounded"></div>
                                                <div className="w-10 h-10 bg-slate-50 rounded-lg"></div>
                                                <div className="flex-grow space-y-2">
                                                    <div className="h-4 bg-slate-50 rounded w-1/4"></div>
                                                    <div className="h-3 bg-slate-50 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : notifications.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-24 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <Inbox size={32} className="text-slate-200" />
                                        </div>
                                        <h3 className="text-slate-900 font-bold text-xs uppercase tracking-tight">No Notifications</h3>
                                        <p className="text-slate-400 text-[11px] font-bold mt-1">You are all caught up.</p>
                                    </td>
                                </tr>
                            ) : (
                                notifications.map((n) => (
                                    <tr key={n._id} className={`${!n.isRead ? 'bg-blue-50/20' : ''} hover:bg-slate-50/50 transition-all font-medium`}>
                                        <td className="px-6 py-5">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(n._id)}
                                                onChange={() => handleSelectOne(n._id)}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${!n.isRead ? 'bg-blue-600 text-white border-blue-600 shadow-blue-100' : 'bg-white text-slate-400 border-slate-200'}`}>
                                                    {!n.isRead ? <Mail size={18} /> : <MailOpen size={18} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className={`text-xs flex items-center gap-2 mb-0.5 uppercase tracking-tight ${!n.isRead ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                                                        {n.title}
                                                        {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm animate-pulse"></span>}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 leading-relaxed font-bold opacity-80">{n.body}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-tight bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg whitespace-nowrap shadow-sm">
                                                <Clock size={12} className="text-blue-400" />
                                                {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                {!n.isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(n._id)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Read"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete([n._id])}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Toolbar */}
                {!loading && totalItems > 0 && totalPages > 1 && (
                    <div className="p-6 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            Showing {notifications.length} of {totalItems} items
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchNotifications(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-xl transition-all border shadow-sm ${currentPage === 1 ? 'bg-slate-50 text-slate-200 border-slate-100' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500'}`}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex gap-1.5">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => fetchNotifications(i + 1)}
                                        className={`w-8 h-8 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center shadow-sm ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-blue-100 ring-2 ring-blue-500/10' : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-500'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => fetchNotifications(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-xl transition-all border shadow-sm ${currentPage === totalPages ? 'bg-slate-50 text-slate-200 border-slate-100' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500'}`}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerNotifications;
