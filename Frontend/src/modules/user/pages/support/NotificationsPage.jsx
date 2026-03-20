import React, { useState, useEffect } from 'react';
import { Bell, ShoppingBag, Tag, Info, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/apiConfig';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!token) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/notifications/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setNotifications(res.data.notifications);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [token]);

    const markAllAsRead = async () => {
        try {
            await axios.put(`${API_BASE_URL}/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all read:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] md:bg-white dark:from-[#141414] dark:to-[#141414] transition-colors duration-300 pb-20">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="hidden md:flex items-center gap-3 mb-8 p-4">
                    <button
                        onClick={() => {
                            const from = location.state?.from || '/';
                            const noMenuPages = ['/settings', '/profile'];
                            const shouldOpenMenu = !noMenuPages.includes(from);
                            navigate(from, { state: { openMenu: shouldOpenMenu } });
                        }}
                        className="p-1.5 bg-gray-50 dark:bg-[#141414] rounded-full shadow-sm"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <h1 className="!text-[13px] font-black text-gray-900 dark:text-gray-100 tracking-tight">Notifications</h1>
                </div>

                {/* Notifications List */}
                <div className="px-0 md:px-4 pt-20 border-t border-transparent md:pt-0">
                    <div className="flex justify-between items-center mb-2 px-4 md:px-2">
                        <p className="!text-[8px] font-bold text-gray-400 tracking-widest uppercase">RECENTLY RECEIVED</p>
                        {notifications.length > 0 && (
                            <button onClick={markAllAsRead} className="!text-[8px] text-saathi-green font-bold tracking-widest uppercase">
                                MARK ALL READ
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 size={24} className="animate-spin text-saathi-green" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-0 md:gap-3">
                            {notifications.map((item) => (
                                <div
                                    key={item._id}
                                    className={`w-full py-3 px-4 md:px-4 flex items-start gap-4 transition-all border-b border-gray-100 dark:border-white/5 md:border md:rounded-2xl md:shadow-sm ${item.isRead ? 'opacity-60 bg-transparent' : 'bg-white dark:bg-[#141414]'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-white/10 ${!item.isRead ? 'bg-green-50' : 'bg-gray-50'}`}>
                                        <Bell size={18} className={!item.isRead ? 'text-[#0c831f]' : 'text-gray-400'} />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h4 className={`!text-[11px] font-black leading-none ${item.isRead ? 'text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
                                                {item.title}
                                            </h4>
                                            <span className="!text-[7px] text-gray-400 font-bold uppercase tracking-widest">
                                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className={`!text-[8.5px] font-medium leading-relaxed line-clamp-2 ${item.isRead ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {item.body}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Bell size={32} className="text-gray-300" />
                        </div>
                        <h2 className="!text-[14px] font-black text-gray-900 dark:text-gray-100 mb-2 tracking-tight">All caught up!</h2>
                        <p className="!text-[10px] text-gray-400 font-medium max-w-[200px]">No new notifications to show right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;

