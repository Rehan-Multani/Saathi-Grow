import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Package, ChevronRight, Tag, RotateCcw, Plus, Minus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getOrdersByTag } from '../../api/orderApi';
import { motion, AnimatePresence } from 'framer-motion';



const TaggedOrdersPage = () => {
    const { tag } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const { addToCart, setIsCartOpen } = useCart();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const displayTag = decodeURIComponent(tag);
    const tagTitle = displayTag.charAt(0).toUpperCase() + displayTag.slice(1);

    useEffect(() => {
        if (!token) return;
        setIsLoading(true);
        getOrdersByTag(token, displayTag)
            .then(d => setOrders(d.orders || []))
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, [token, displayTag]);



    return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] md:bg-white md:dark:bg-black md:bg-none transition-colors duration-300 pb-20 md:p-8 md:pb-8">
            <div className="max-w-2xl md:max-w-6xl mx-auto">
                {/* Sticky Header */}
                <div className="flex items-center gap-3 mb-0 md:mb-10 p-4 md:p-0 border-b border-gray-200/50 dark:border-white/5 md:border-none bg-white/80 dark:bg-black/80 backdrop-blur-lg z-50 sticky top-0 transition-colors">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-1.5 md:p-2 bg-white/50 dark:bg-[#141414] rounded-full shadow-sm hover:bg-gray-100 transition-colors md:bg-gray-50 active:scale-95"
                    >
                        <ArrowLeft size={18} className="md:w-6 md:h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Tag size={16} className="text-[#0c831f]" />
                        <h1 className="!text-[16px] md:!text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{tagTitle}</h1>
                    </div>
                </div>

                {/* Orders List */}
                <div className="px-0 md:px-0">
                    <p className="!text-[10px] md:!text-sm font-bold text-gray-500 dark:text-gray-400 px-4 py-3 md:px-0 md:mb-6 tracking-widest uppercase bg-gray-50/80 dark:bg-white/5 border-y border-gray-100 dark:border-white/5 md:border-none md:bg-transparent">
                        {orders.length} order{orders.length !== 1 ? 's' : ''} tagged
                    </p>

                    {isLoading ? (
                        <div className="flex justify-center py-24">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0c831f]"></div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center px-6">
                            <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <ShoppingBag size={32} className="text-gray-300 md:w-10 md:h-10" />
                            </div>
                            <h2 className="!text-[14px] md:!text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">No orders with this tag</h2>
                            <p className="!text-[10px] md:!text-base text-gray-400 font-medium mb-8 max-w-[200px] md:max-w-md">Tag your orders from the order detail page.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-white/5 md:divide-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6 bg-transparent">
                            {orders.map(order => {
                                 const d = new Date(order.createdAt);
                                 const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                                 
                                 const itemNames = order.items?.map((i, idx) => {
                                     return i.name;
                                 });

                                 const renderedItemNames = itemNames ? itemNames.reduce((acc, curr, i) => {
                                     return i === 0 ? [curr] : [...acc, ', ', curr];
                                 }, []) : '';

                                return (
                                    <div
                                        key={order._id}
                                        className="w-full py-3 px-6 md:p-6 flex flex-col hover:bg-gray-50 dark:hover:bg-white/5 md:bg-white dark:md:bg-[#141414] md:border md:border-gray-100 dark:md:border-white/5 md:rounded-2xl transition-all group cursor-pointer md:hover:shadow-md"
                                    >
                                        {/* Order Header Row */}
                                        <div
                                            onClick={() => navigate(`/orders/${order._id}`)}
                                            className="flex justify-between items-start mb-1 md:mb-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 md:w-14 md:h-14 rounded-full md:rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm text-[#0c831f] overflow-hidden flex-shrink-0">
                                                    {order.items?.[0]?.image ? (
                                                        <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={18} className="md:w-7 md:h-7" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="!text-[13px] md:!text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-1">Order #{order.orderId || order._id}</div>
                                                    <div className="!text-[10px] md:!text-xs text-gray-400 font-bold uppercase tracking-wider">{date}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5 relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/orders/${order._id}/reorder`);
                                                    }}
                                                    className="flex items-center gap-1 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-green-600 to-[#0c831f] text-white rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest active:scale-95 hover:scale-105 transition-all shadow-md shadow-green-600/20"
                                                >
                                                    <RotateCcw size={12} strokeWidth={3} /> Reorder
                                                </button>
                                            </div>
                                        </div>

                                        {/* Items + Amount */}
                                        <div
                                            onClick={() => navigate(`/orders/${order._id}`)}
                                            className="flex justify-between items-end md:items-center md:mt-auto mb-3"
                                        >
                                            <div className="md:flex-1 md:pr-4">
                                                <div className="!text-[11px] md:!text-sm font-medium text-gray-600 dark:text-gray-300 line-clamp-1 mt-1">{renderedItemNames}</div>
                                            </div>
                                            <div className="text-right md:flex flex-col items-end">
                                                <div className="!text-[14px] md:!text-xl font-black text-gray-900 dark:text-gray-100">₹{order.totalAmount?.toFixed(2)}</div>
                                                <div className="hidden md:flex !text-[8px] md:!text-xs text-[#0c831f] font-black items-center gap-1 justify-end uppercase tracking-widest md:group-hover:translate-x-1 transition-transform">
                                                    Details <ChevronRight size={10} className="md:w-4 md:h-4" strokeWidth={3} />
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaggedOrdersPage;
