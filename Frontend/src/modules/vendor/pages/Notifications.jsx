import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const vendorToken = localStorage.getItem('sathiGro_vendor_token');

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!vendorToken) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/notifications/my`, {
                    headers: { Authorization: `Bearer ${vendorToken}` }
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
    }, [vendorToken]);

    const markAllRead = async () => {
        try {
            await axios.put(`${API_BASE_URL}/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${vendorToken}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking read all:', error);
        }
    };

    return (
        <div className="-mx-4 -my-4 md:mx-0 md:my-0 md:space-y-6 lg:space-y-5 bg-white md:bg-transparent min-h-screen md:min-h-0">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 md:border-none px-4 py-3 lg:py-2 md:px-0 md:py-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight">Notifications</h1>
                    <p className="text-xs text-gray-500 hidden md:block font-medium">Stay updated with your store activity</p>
                </div>
                <button onClick={markAllRead} className="text-[10px] font-bold text-[#0c831f] hover:text-[#0a6b19] uppercase tracking-wider">
                    Mark all as read
                </button>
            </div>

            <div className="bg-white md:rounded-xl md:shadow-sm md:border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-green-600" size={30} />
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notification) => (
                            <div key={notification._id} className={`p-4 lg:p-3 hover:bg-gray-50 transition-colors flex gap-4 bg-white ${notification.isRead ? 'opacity-70' : ''}`}>
                                <div className={`w-10 h-10 lg:w-9 lg:h-9 rounded-full flex-shrink-0 flex items-center justify-center ${notification.type === 'order' ? 'bg-blue-50 text-blue-600' :
                                    notification.type === 'inventory_alert' ? 'bg-red-50 text-red-600' :
                                        'bg-green-50 text-green-600'
                                    }`}>
                                    <Bell size={18} className="lg:w-4 lg:h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <div className={`text-[13px] font-bold truncate pr-2 ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                                            {notification.title}
                                        </div>
                                        <span className="text-[11px] text-gray-400 flex items-center gap-1 flex-shrink-0">
                                            <Clock size={11} /> {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-[12px] text-gray-500 leading-snug font-medium line-clamp-2">{notification.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {notifications.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                        <Bell size={24} />
                    </div>
                    <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
            )}
        </div>
    );
};

export default Notifications;

