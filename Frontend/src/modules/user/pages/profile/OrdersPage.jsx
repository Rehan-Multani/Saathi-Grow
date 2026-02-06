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
        <div className="min-h-screen bg-transparent dark:bg-black transition-colors duration-300 pb-20">
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
                    <h1 className="!text-[13px] font-black text-gray-900 dark:text-gray-100 tracking-tight">My Orders</h1>
                </div>

                {/* Orders List */}
                <div className="px-4">
                    <p className="!text-[8px] font-bold text-gray-400 mb-2 px-2 tracking-widest uppercase">Your Purchase History</p>
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => navigate(`/orders/${order.id}`)}
                                className="w-full py-6 px-2 flex flex-col hover:bg-gray-50 dark:hover:bg-white/5 transition-all group cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm">
                                            <Package size={20} className="text-[#0c831f]" />
                                        </div>
                                        <div>
                                            <div className="!text-[11px] font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-1">Order #{order.id}</div>
                                            <div className="!text-[8px] text-gray-400 font-bold uppercase tracking-wider">{order.date}</div>
                                        </div>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-lg !text-[7px] font-black uppercase tracking-widest border border-current bg-opacity-10 ${order.color}`}>
                                        {order.status}
                                    </div>
                                </div>

                                <div className="flex justify-between items-end pl-14">
                                    <div>
                                        <div className="!text-[7px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Items Summary</div>
                                        <div className="!text-[9.5px] font-black text-gray-700 dark:text-gray-300 line-clamp-1">{order.items}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="!text-[12px] font-black text-gray-900 dark:text-gray-100 mb-0.5">{order.amount}</div>
                                        <div className="!text-[8px] text-[#0c831f] font-black flex items-center gap-1 justify-end uppercase tracking-widest">
                                            Details <ChevronRight size={10} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {orders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <ShoppingBag size={32} className="text-gray-300" />
                        </div>
                        <h2 className="!text-[14px] font-black text-gray-900 dark:text-gray-100 mb-2">No orders yet</h2>
                        <p className="!text-[10px] text-gray-400 font-medium mb-8 max-w-[200px]">Start shopping to see your purchase history here!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-[#0c831f] text-white px-8 py-3 rounded-xl !text-[11px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all"
                        >
                            Explore Store
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
