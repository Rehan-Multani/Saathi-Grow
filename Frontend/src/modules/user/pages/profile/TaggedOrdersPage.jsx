import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, ChevronRight, ShoppingBag, RefreshCw, RotateCcw, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrdersByTag } from '../../api/orderApi';

const statusConfig = {
    delivered:        { label: 'Delivered',        cls: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    cancelled:        { label: 'Cancelled',         cls: 'text-red-500 bg-red-50 border-red-100' },
    confirmed:        { label: 'Confirmed',         cls: 'text-orange-500 bg-orange-50 border-orange-100' },
    pending:          { label: 'Placed',            cls: 'text-gray-500 bg-gray-50 border-gray-100' },
    out_for_delivery: { label: 'Out for Delivery',  cls: 'text-blue-500 bg-blue-50 border-blue-100' },
    preparing:        { label: 'Preparing',         cls: 'text-orange-500 bg-orange-50 border-orange-100' },
    returned:         { label: 'Returned',          cls: 'text-red-500 bg-red-50 border-red-100' },
};

const TaggedOrdersPage = () => {
    const { tag } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const displayTag = decodeURIComponent(tag);
    const tagTitle = displayTag.charAt(0).toUpperCase() + displayTag.slice(1);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        getOrdersByTag(token, displayTag)
            .then(d => setOrders(d.orders || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [token, displayTag]);

    return (
        <div className="bg-[#f4f6f8] dark:bg-[#141414] min-h-screen pb-28">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-white/5 shadow-sm">
                <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-9 h-9 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/10 text-gray-500 active:scale-95 transition-all flex-shrink-0"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Tag size={15} className="text-[#0c831f] flex-shrink-0" />
                        <div className="min-w-0">
                            <h1 className="text-[14px] font-black text-gray-900 dark:text-white leading-none capitalize truncate">{tagTitle}</h1>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-4">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <RefreshCw className="animate-spin text-[#0c831f]" size={28} />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center py-20 gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                            <ShoppingBag size={28} className="text-gray-200" strokeWidth={1.5} />
                        </div>
                        <p className="font-bold text-gray-400 text-sm">No orders with this tag</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => {
                            const d = new Date(order.createdAt);
                            const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                            const sc = statusConfig[order.status] || { label: order.status, cls: 'text-gray-500 bg-gray-50 border-gray-100' };

                            return (
                                <div key={order._id} className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                                    {/* Order Header */}
                                    <button
                                        onClick={() => navigate(`/orders/${order._id}`)}
                                        className="w-full flex items-center justify-between px-4 pt-4 pb-3 active:bg-gray-50 dark:active:bg-white/5 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {order.items?.[0]?.image ? (
                                                    <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={16} className="text-gray-300" />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-black text-gray-800 dark:text-white">#{order.orderId?.slice(-8).toUpperCase()}</p>
                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{date} · ₹{order.totalAmount}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${sc.cls}`}>
                                                {sc.label}
                                            </span>
                                            <ChevronRight size={14} className="text-gray-300" />
                                        </div>
                                    </button>

                                    {/* Items with Reorder */}
                                    <div className="border-t border-gray-50 dark:border-white/5 divide-y divide-gray-50 dark:divide-white/5">
                                        {order.items?.map((item, idx) => {
                                            const productId = item.product?._id || item.product;
                                            return (
                                                <div key={idx} className="flex items-center justify-between px-4 py-3 gap-3">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 overflow-hidden flex-shrink-0">
                                                            {item.image ? (
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <ShoppingBag size={12} className="text-gray-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200 truncate">{item.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-medium">Qty: {item.quantity} · ₹{item.price}</p>
                                                        </div>
                                                    </div>
                                                    {productId && (
                                                        <button
                                                            onClick={() => navigate(`/product/${productId}`)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-[#0c831f] text-white rounded-xl text-[10px] font-black uppercase tracking-wide active:scale-95 transition-all flex-shrink-0 shadow-sm shadow-[#0c831f]/20"
                                                        >
                                                            <RotateCcw size={10} />
                                                            Reorder
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaggedOrdersPage;
