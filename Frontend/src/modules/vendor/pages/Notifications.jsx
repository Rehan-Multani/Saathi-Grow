import React from 'react';
import { Bell, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const navigate = useNavigate();

    // Mock Notifications Data
    const notifications = [
        { id: 1, title: 'New Order Received', message: 'Order #ORD-003 received from Customer.', time: '2 mins ago', type: 'order', read: false },
        { id: 2, title: 'Low Stock Alert', message: 'Amul Taaza Milk is running low. Restock now.', time: '1 hour ago', type: 'alert', read: false },
        { id: 3, title: 'Payout Processed', message: 'Weekly payout of ₹15,400 has been processed.', time: 'Yesterday', type: 'info', read: true },
        { id: 4, title: 'Order Delivered', message: 'Order #ORD-001 has been successfully delivered.', time: 'Yesterday', type: 'order', read: true },
        { id: 5, title: 'Welcome to SaathiGro', message: 'Your shop is live! Start adding products to get orders.', time: '2 days ago', type: 'info', read: true },
    ];

    return (
        <div className="-mx-4 -my-4 md:mx-0 md:my-0 md:space-y-6 bg-white md:bg-transparent min-h-screen md:min-h-0">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 md:border-none px-4 py-4 md:px-0 md:py-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-xs text-gray-500 hidden md:block">Stay updated with your store activity</p>
                </div>
                <button className="text-xs font-bold text-[#0c831f] hover:text-[#0a6b19]">
                    Mark all as read
                </button>
            </div>

            <div className="bg-white md:rounded-xl md:shadow-sm md:border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-50">
                    {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors flex gap-4 bg-white ${notification.read ? 'opacity-70' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${notification.type === 'order' ? 'bg-blue-50 text-blue-600' :
                                notification.type === 'alert' ? 'bg-red-50 text-red-600' :
                                    'bg-green-50 text-green-600'
                                }`}>
                                <Bell size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <div className={`text-[13px] font-bold truncate pr-2 ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                        {notification.title}
                                    </div>
                                    <span className="text-[11px] text-gray-400 flex items-center gap-1 flex-shrink-0">
                                        <Clock size={11} /> {notification.time}
                                    </span>
                                </div>
                                <p className="text-[12px] text-gray-500 leading-snug font-medium line-clamp-2">{notification.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
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
