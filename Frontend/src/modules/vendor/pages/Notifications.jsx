import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';
import { formatDistanceToNow } from 'date-fns';
import { useVendor } from '../contexts/VendorContext';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { vendor } = useVendor();
    const vendorToken = vendor?.token;

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!vendorToken) {
                setLoading(false);
                return;
            }
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
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Stay updated with your store activity.</p>
                </div>
                {notifications.length > 0 && (
                    <button 
                        onClick={markAllRead} 
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-[#0c831f] hover:bg-green-50 hover:border-green-200 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                    >
                        <CheckCircle size={16} /> Mark all read
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                         <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0c831f] rounded-full animate-spin mb-4"></div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Bell size={32} />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">You're all caught up!</h3>
                        <p className="text-sm font-medium text-gray-500">There are no new notifications right now.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div key={notification._id} className={`p-5 hover:bg-gray-50 transition-colors flex gap-4 ${notification.isRead ? 'opacity-70 bg-transparent' : 'bg-green-50/20'}`}>
                                <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center border shadow-sm ${
                                    notification.type === 'order' ? 'bg-[#0c831f]/10 border-[#0c831f]/20 text-[#0c831f]' :
                                    notification.type === 'inventory_alert' ? 'bg-red-50 border-red-100 text-red-600' :
                                    'bg-white border-gray-200 text-gray-500'
                                }`}>
                                    <Bell size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-base font-bold truncate pr-2 ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap ml-2 mt-1">
                                            <Clock size={10} /> {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{notification.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
