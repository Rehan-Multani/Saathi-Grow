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
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] md:bg-white md:dark:bg-black md:bg-none transition-colors duration-300 pb-20 md:p-8 md:pb-8">
            <div className="max-w-2xl md:max-w-6xl mx-auto">
                {/* Header */}
                <div className="hidden md:flex items-center gap-3 mb-0 md:mb-10 p-4 md:p-0 border-b border-gray-200/50 md:border-none bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] md:bg-none md:bg-white md:dark:bg-black">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-1.5 md:p-2 bg-white/50 dark:bg-[#141414] rounded-full shadow-sm hover:bg-gray-100 transition-colors md:bg-gray-50"
                    >
                        <ArrowLeft size={16} className="md:w-6 md:h-6" />
                    </button>
                    <h1 className="!text-[16px] md:!text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">My Orders</h1>
                </div>

                {/* Orders List */}
                <div className="px-0 md:px-0">
                    <p className="!text-[10px] md:!text-sm font-bold text-gray-400 px-4 py-2 md:px-0 md:mb-6 tracking-widest uppercase bg-gray-50/50 md:bg-transparent">Your Purchase History</p>
                    <div className="divide-y divide-gray-200 dark:divide-white/5 md:divide-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6 bg-transparent md:bg-transparent">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => navigate(`/orders/${order.id}`)}
                                className="w-full py-5 px-6 md:p-6 flex flex-col hover:bg-gray-50 dark:hover:bg-white/5 md:bg-white dark:md:bg-[#141414] md:border md:border-gray-100 dark:md:border-white/5 md:rounded-2xl transition-all group cursor-pointer md:hover:shadow-md"
                            >
                                <div className="flex justify-between items-start mb-2 md:mb-6">
                                    <div className="flex items-center gap-4 md:gap-4">
                                        <div className="w-9 h-9 md:w-14 md:h-14 rounded-full md:rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm text-[#0c831f]">
                                            <Package size={18} className="md:w-7 md:h-7" />
                                        </div>
                                        <div>
                                            <div className="!text-[13px] md:!text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-1 md:mb-1.5">Order #{order.id}</div>
                                            <div className="!text-[10px] md:!text-xs text-gray-400 font-bold uppercase tracking-wider">{order.date}</div>
                                        </div>
                                    </div>
                                    <div className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-full md:rounded-lg !text-[8px] md:!text-[10px] font-black uppercase tracking-widest border border-current bg-opacity-10 ${order.color}`}>
                                        {order.status}
                                    </div>
                                </div>

                                <div className="flex justify-between items-end md:items-center pl-13 md:pl-0 md:mt-auto">
                                    <div className="md:flex-1 md:pr-4">
                                        {/* Mobile: Removed 'Items Summary' label for cleaner look, usually context is sufficient or keep concise */}
                                        <div className="!text-[11px] md:!text-sm font-medium text-gray-600 dark:text-gray-300 line-clamp-1 md:line-clamp-2 mt-1">{order.items}</div>
                                    </div>
                                    <div className="text-right md:flex flex-col items-end md:justify-between md:h-full">
                                        <div className="!text-[14px] md:!text-xl font-black text-gray-900 dark:text-gray-100 mb-0 md:mb-2">{order.amount}</div>
                                        <div className="hidden md:flex !text-[8px] md:!text-xs text-[#0c831f] font-black items-center gap-1 justify-end uppercase tracking-widest md:group-hover:translate-x-1 transition-transform">
                                            Details <ChevronRight size={10} className="md:w-4 md:h-4" strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {orders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center px-6">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-inner">
                            <ShoppingBag size={32} className="text-gray-300 md:w-10 md:h-10" />
                        </div>
                        <h2 className="!text-[14px] md:!text-2xl font-black text-gray-900 dark:text-gray-100 mb-2 md:mb-4">No orders yet</h2>
                        <p className="!text-[10px] md:!text-base text-gray-400 font-medium mb-8 md:mb-10 max-w-[200px] md:max-w-md">Start shopping to see your purchase history here!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-[#0c831f] text-white px-8 py-3 md:px-10 md:py-4 rounded-xl !text-[11px] md:!text-sm font-black uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all hover:bg-[#0a6b19]"
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
