import React from 'react';
import { ArrowLeft, ShoppingBag, Package, ChevronRight, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const OrdersPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const orders = [
        {
            id: 'SG-1234',
            status: 'Delivered',
            date: '24 May 2024, 10:30 AM',
            amount: '₹450',
            items: 'Bread, Milk, Eggs',
            color: 'text-green-600 bg-green-50'
        },
        {
            id: 'SG-1235',
            status: 'In Transit',
            date: '25 May 2024, 02:15 PM',
            amount: '₹890',
            items: 'Atta, Rice, Oil',
            color: 'text-blue-600 bg-blue-50'
        },
        {
            id: 'SG-1236',
            status: 'Processing',
            date: 'Today, 09:00 AM',
            amount: '₹320',
            items: 'Fruits, Vegetables',
            color: 'text-orange-600 bg-orange-50'
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 pb-20">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-2 p-3 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-[10px] z-10 border-b border-gray-50 dark:border-white/5">
                    <button
                        onClick={() => {
                            const from = location.state?.from || '/';
                            const noMenuPages = ['/settings', '/profile'];
                            const shouldOpenMenu = !noMenuPages.includes(from);
                            navigate(from, { state: { openMenu: shouldOpenMenu } });
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="!text-[11px] font-black text-gray-900 dark:text-gray-100 tracking-tight">My Orders</h1>
                </div>

                {/* Orders List */}
                <div className="p-3 space-y-3">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white dark:bg-[#121212] p-3 rounded-xl border border-gray-100 dark:border-white/5 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                                        <Package size={16} className="text-[#0c831f]" />
                                    </div>
                                    <div>
                                        <div className="!text-[10px] font-black text-gray-900 dark:text-gray-100 tracking-tight">Order #{order.id}</div>
                                        <div className="!text-[7.5px] text-gray-400 font-medium">{order.date}</div>
                                    </div>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full !text-[7px] font-black uppercase tracking-wider ${order.color}`}>
                                    {order.status}
                                </div>
                            </div>

                            <div className="border-t border-gray-50 dark:border-white/5 pt-3 flex justify-between items-end">
                                <div>
                                    <div className="!text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Items</div>
                                    <div className="!text-[9.5px] font-black text-gray-700 dark:text-gray-300 line-clamp-1">{order.items}</div>
                                </div>
                                <div className="text-right">
                                    <div className="!text-[11px] font-black text-gray-900 dark:text-gray-100">{order.amount}</div>
                                    <div className="!text-[7.5px] text-[#0c831f] font-bold flex items-center gap-0.5 justify-end">
                                        View Details <ChevronRight size={10} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {orders.length === 0 && (
                    <div className="text-center py-20 px-6">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ShoppingBag size={24} className="text-gray-300" />
                        </div>
                        <h2 className="!text-[10px] font-black text-gray-900 dark:text-gray-100">No orders yet</h2>
                        <p className="!text-[8.5px] text-gray-500 font-medium tracking-tight mb-6">Start shopping to see your orders here!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-[#0c831f] text-white px-6 py-2 rounded-lg !text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                        >
                            Browse Products
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
