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
                <div className="flex items-center gap-3 mb-8 p-4">
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
                <div className="px-4">
                    <p className="!text-[8px] font-bold text-gray-400 mb-2 tracking-widest px-2">RECENTLY RECEIVED</p>
                    <div className="flex flex-col gap-3">
                        {notifications.map((item) => (
                            <div
                                key={item.id}
                                className="w-full py-4 px-4 flex items-start gap-4 bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-white/10 ${item.color.replace('text-', 'text-saathi-green').replace('bg-', 'bg-')}`}>
                                    <item.icon size={18} className="text-[#0c831f]" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className="!text-[11px] font-black text-gray-800 dark:text-gray-100 leading-none">{item.title}</h4>
                                        <span className="!text-[7px] text-gray-400 font-bold uppercase tracking-widest">{item.time}</span>
                                    </div>
                                    <p className="!text-[8.5px] text-gray-400 dark:text-gray-500 font-medium leading-relaxed line-clamp-2">
                                        {item.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
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
