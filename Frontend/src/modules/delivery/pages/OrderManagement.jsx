import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    MapPin,
    Phone,
    Clock,
    ChevronRight,
    Package,
    CheckCircle2,
    AlertCircle,
    Navigation,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../user/context/AuthContext';
import useDelivery from '../hooks/useDelivery';
import { useNavigate } from 'react-router-dom';

const OrderManagement = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('active');
    const { orders, history, loading, refreshOrders } = useDelivery(token);

    useEffect(() => {
        refreshOrders(activeTab === 'completed' ? 'history' : activeTab);
    }, [activeTab, refreshOrders]);

    const tabs = [
        { id: 'pending', label: 'Pending', count: activeTab === 'pending' ? orders.length : '?' },
        { id: 'active', label: 'In Transit', count: activeTab === 'active' ? orders.length : '?' },
        { id: 'completed', label: 'Completed', count: activeTab === 'completed' ? history.length : '?' },
    ];

    const displayOrders = activeTab === 'completed' ? history : orders;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Order Management</h1>
                    <p className="text-slate-500 font-medium">Manage and track your delivery lifecycle</p>
                </div>
                {loading && <Loader2 className="animate-spin text-lime-500" size={24} />}
            </div>

            {/* Sticky Tabs */}
            <div className="sticky top-16 md:top-0 z-30 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-lg pt-2 pb-4 border-b border-slate-200 dark:border-zinc-800 -mx-4 px-4 md:-mx-8 md:px-8">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 font-bold text-sm
                                ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-lime-500 to-lime-600 text-white shadow-lg shadow-lime-500/20'
                                    : 'bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-zinc-800'}
                            `}
                        >
                            {tab.label}
                            {tab.count !== '?' && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {displayOrders.length > 0 ? displayOrders.map((delivery, index) => (
                        <motion.div
                            layout
                            key={delivery._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => navigate(`/delivery/tracking/${delivery._id}`)}
                            className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer relative"
                        >
                            {/* Card Header */}
                            <div className="p-6 pb-4 flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-lime-600">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg">#{delivery.order?.orderId || 'N/A'}</h4>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                                            {new Date(delivery.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h5 className="font-black text-xl text-slate-900 dark:text-white">â‚¹{delivery.order?.totalAmount || '0'}</h5>
                                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">{delivery.deliveryFee || 40} fee</p>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="px-6 py-4 space-y-4">
                                <div className="flex gap-3">
                                    <div className="mt-1 p-2 bg-lime-50 dark:bg-lime-500/5 text-lime-600 rounded-lg">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Delivery Address</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-2">
                                            {delivery.order?.shippingAddress?.street}, {delivery.order?.shippingAddress?.city}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-500/5 text-blue-600 rounded-lg">
                                        <Package size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Status</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase">{delivery.status}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-6 pt-2">
                                <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-lime-500 to-lime-600 text-white font-black text-sm tracking-tight shadow-lg shadow-lime-500/20 active:scale-[0.98] transition-all uppercase flex items-center justify-center gap-2">
                                    <Navigation size={18} />
                                    View on Map
                                </button>
                            </div>

                            <div className="absolute inset-0 bg-lime-600 opacity-0 group-hover:opacity-[0.02] transition-opacity pointer-events-none"></div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 opacity-50">
                            <Package size={64} className="mb-4" />
                            <p className="text-xl font-bold">No orders found</p>
                            <p className="text-sm">Try changing the tab or online status</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrderManagement;

