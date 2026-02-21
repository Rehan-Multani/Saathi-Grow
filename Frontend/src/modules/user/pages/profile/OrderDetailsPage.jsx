import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, AlertCircle, RefreshCw, XCircle, ChevronRight, Package, Truck, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as orderApi from '../../api/orderApi';
import { toast } from 'react-toastify';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            if (token && id) {
                try {
                    setIsLoading(true);
                    const data = await orderApi.fetchOrderDetails(token, id);

                    const d = new Date(data.createdAt);
                    const formattedDate = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ", " + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                    const processedOrder = {
                        id: data._id,
                        status: data.status,
                        date: formattedDate,
                        total: '₹' + data.totalAmount.toFixed(2),
                        items: data.items.map(item => ({
                            name: item.name || item.product?.name || "Unknown Product",
                            qty: item.quantity,
                            price: '₹' + item.price,
                            img: item.image || (item.product?.image && item.product.image) || 'https://via.placeholder.com/150'
                        }))
                    };
                    setOrder(processedOrder);
                } catch (err) {
                    toast.error("Failed to load secure order details.");
                    navigate('/orders');
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadOrder();
    }, [token, id, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-[#f4f6f8] dark:bg-[#141414]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0c831f]"></div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] md:bg-white md:dark:bg-black md:bg-none transition-colors duration-300 pb-24">
            {/* Header */}
            <div className="hidden md:block sticky top-0 z-40 bg-white/20 dark:bg-black/20 md:bg-none md:bg-white md:dark:bg-black backdrop-blur-md border-b border-gray-100 dark:border-white/5 p-4">
                <div className="max-w-2xl md:max-w-6xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate('/orders')} className="p-2 bg-gray-50 dark:bg-white/5 rounded-full shadow-sm text-gray-600 dark:text-gray-300 active:scale-95 transition-all">
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <div className="!text-[11.5px] md:!text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-1">Order Summary</div>
                        <p className="!text-[7.5px] md:!text-base text-gray-400 font-bold tracking-widest uppercase">#{order.id.slice(-6).toUpperCase()} • {order.date}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl md:max-w-6xl mx-auto px-2 md:px-0 py-4 md:py-8">
                {/* Order Status Stepper */}
                <div className="bg-transparent md:bg-white/40 md:rounded-xl p-3 md:p-5 mb-6 md:border border-gray-100 dark:border-white/10 md:shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between relative text-center">
                        <div className="absolute top-3.5 left-[15%] right-[15%] h-[1px] bg-gray-200 dark:bg-white/10 -z-0"></div>
                        <div className="flex flex-col items-center gap-1 z-10 relative">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${order.status === 'cancelled' ? 'bg-red-600 text-white shadow-red-500/10' : 'bg-[#0c831f] text-white shadow-green-500/10'}`}><Package size={10} /></div>
                            <span className={`text-[7px] md:text-sm font-black uppercase tracking-tight ${order.status === 'cancelled' ? 'text-red-500' : 'text-gray-400'}`}>Placed</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 z-10 relative">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${['out_for_delivery', 'delivered'].includes(order.status) ? 'bg-[#0c831f] text-white shadow-green-500/10' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}><Truck size={10} /></div>
                            <span className={`text-[7px] md:text-sm font-black uppercase tracking-tight ${['out_for_delivery', 'delivered'].includes(order.status) ? 'text-[#0c831f]' : 'text-gray-400'}`}>Shipped</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 z-10 relative">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${order.status === 'delivered' ? 'bg-[#0c831f] text-white shadow-green-500/10' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}><CheckCircle size={10} /></div>
                            <span className={`text-[7px] md:text-sm font-black uppercase tracking-tight ${order.status === 'delivered' ? 'text-[#0c831f]' : 'text-gray-400'}`}>Delivered</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 animate-in fade-in duration-500 md:grid md:grid-cols-2 md:gap-8">
                    {/* Order Items */}
                    <div className="bg-transparent md:bg-white md:dark:bg-[#141414] md:border border-gray-100 dark:border-white/5 md:rounded-2xl p-0 md:p-4">
                        <p className="!text-[8px] md:!text-sm font-black text-gray-400 tracking-[0.2em] mb-4 px-1 uppercase">Ordered items</p>
                        <div className="divide-y divide-gray-100 dark:divide-white/5 border-y border-gray-100 dark:border-white/5">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 py-4 px-1 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                                    <div className="w-11 h-11 rounded-lg bg-gray-50 dark:bg-white/10 p-1.5 border border-gray-100 dark:border-white/10 flex-shrink-0">
                                        <img src={item.img} alt={item.name} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="!text-[10px] md:!text-lg font-black text-gray-800 dark:text-gray-100 leading-tight tracking-tight">{item.name}</div>
                                        <div className="!text-[9px] md:!text-base text-gray-400 font-bold mt-1">Qty: {item.qty} • {item.price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Support Actions */}
                    <div>
                        <p className="!text-[8px] md:!text-sm font-black text-gray-400 tracking-[0.2em] mb-4 px-1 uppercase">Need help with this order?</p>
                        <div className="border-t border-gray-100 dark:border-white/5">
                            <button onClick={() => navigate(`/orders/${order.id}/complaint`)} className="w-full py-5 px-1 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/5 active:scale-[0.98] transition-all group border-b border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 border border-orange-100 dark:border-orange-500/10">
                                        <MessageSquare size={15} />
                                    </div>
                                    <div className="text-left">
                                        <div className="!text-[10.5px] md:!text-lg font-black text-gray-800 dark:text-gray-100 tracking-tight">Raise a complaint</div>
                                        <p className="!text-[8.5px] md:!text-base text-gray-400 font-bold tracking-tight">Issues with delivery or payment</p>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-gray-200 group-hover:text-orange-500 transition-all" />
                            </button>

                            <button onClick={() => navigate(`/orders/${order.id}/return`)} className="w-full py-5 px-1 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/5 active:scale-[0.98] transition-all group border-b border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-500/10">
                                        <RefreshCw size={15} />
                                    </div>
                                    <div className="text-left">
                                        <div className="!text-[10.5px] md:!text-lg font-black text-gray-800 dark:text-gray-100 tracking-tight">Return items</div>
                                        <p className="!text-[8.5px] md:!text-base text-gray-400 font-bold tracking-tight">Returning defective or wrong items</p>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-gray-200 group-hover:text-blue-500 transition-all" />
                            </button>

                            <button onClick={() => navigate(`/orders/${order.id}/cancel`)} className="w-full py-5 px-1 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/5 active:scale-[0.98] transition-all group border-b border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 border border-red-100 dark:border-red-500/10">
                                        <XCircle size={15} />
                                    </div>
                                    <div className="text-left">
                                        <div className="!text-[10.5px] md:!text-lg font-black text-gray-800 dark:text-gray-100 tracking-tight">Cancel order</div>
                                        <p className="!text-[8.5px] md:!text-base text-gray-400 font-bold tracking-tight">Cancel items before delivery</p>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-gray-200 group-hover:text-red-500 transition-all" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Floating Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-black/60 backdrop-blur-md border-t border-gray-100 dark:border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] selection:bg-none md:hidden">
                <div className="max-w-2xl mx-auto flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 dark:border-blue-500/10">
                            <AlertCircle size={15} />
                        </div>
                        <span className="!text-[8.5px] font-black text-gray-800 dark:text-gray-200 tracking-widest uppercase">Support is online</span>
                    </div>
                    <button onClick={() => navigate(`/orders/${order.id}/support-chat`)} className="text-[#0c831f] !text-[10px] font-black flex items-center gap-0.5 active:scale-95 transition-all uppercase tracking-tight">
                        Chat now <ChevronRight size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
