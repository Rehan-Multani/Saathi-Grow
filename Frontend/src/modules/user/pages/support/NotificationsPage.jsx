import React from 'react';
import { Bell, ShoppingBag, Tag, Info, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const notifications = [
        {
            id: 1,
            title: "Order Delivered!",
            message: "Your order #SG-1234 has been successfully delivered by Rehan.",
            time: "2 hours ago",
            icon: ShoppingBag,
            color: "bg-green-100 text-green-600"
        },
        {
            id: 2,
            title: "Flash Sale Live!",
            message: "Get up to 50% off on fresh fruits and vegetables. Deal ends today!",
            time: "5 hours ago",
            icon: Tag,
            color: "bg-orange-100 text-orange-600"
        },
        {
            id: 3,
            title: "Welcome to SaathiGro!",
            message: "Thank you for joining us. Complete your profile to get a free delivery coupon.",
            time: "1 day ago",
            icon: Bell,
            color: "bg-blue-100 text-blue-600"
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 pb-20">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-2 p-3 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-[10px] z-10 border-b border-gray-50 dark:border-white/5">
                    <button
                        onClick={() => navigate(location.state?.from || '/', { state: { openMenu: true } })}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight">Notifications</h1>
                </div>

                {/* Notifications List */}
                <div className="p-3 space-y-1.5">
                    {notifications.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-[#121212] p-2.5 rounded-xl border border-gray-100 dark:border-white/5 flex gap-2 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color.replace('bg-', 'bg-opacity-10 bg-')}`}>
                                <item.icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[11px] truncate pr-2 tracking-tight">{item.title}</h3>
                                    <span className="text-[7.5px] text-gray-400 font-extrabold uppercase tracking-tighter whitespace-nowrap mt-1">{item.time}</span>
                                </div>
                                <p className="text-[8.5px] text-gray-400 dark:text-gray-500 leading-tight font-medium">
                                    {item.message}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {notifications.length === 0 && (
                    <div className="text-center py-20 px-6">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell size={24} className="text-gray-300" />
                        </div>
                        <h2 className="text-xs font-black text-gray-900 dark:text-gray-100">All caught up!</h2>
                        <p className="text-[8.5px] text-gray-500 font-medium tracking-tight">No new notifications to show right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
