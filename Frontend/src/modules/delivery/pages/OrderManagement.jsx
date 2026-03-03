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
import useDelivery from '../hooks/useDelivery';
import useDeliveryStore from '../store/deliveryStore';
import { useNavigate } from 'react-router-dom';

const OrderManagement = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('active');
    const { orders, history, loading, refreshOrders } = useDelivery();

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
        <div className="space-y-3 md:space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-zinc-100">Deliveries</h1>
                    <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] mt-0.5">Tactical Logistics Control</p>
                </div>
                {loading && (
                    <div className="bg-green-50 dark:bg-[#028A0F]/10 p-2 rounded-xl border border-[#028A0F]/10">
                        <Loader2 className="animate-spin text-[#028A0F]" size={16} />
                    </div>
                )}
            </div>

            {/* Sticky Tabs - Compact Pill Style */}
            <div className="sticky top-14 md:top-0 z-30 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-lg py-1.5 md:py-2 -mx-4 px-4 md:-mx-8 md:px-8 flex justify-center">
                <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm relative w-full max-w-md">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex-1 flex items-center justify-center gap-2 py-2 rounded-xl whitespace-nowrap transition-all duration-300 font-black text-[10px] uppercase tracking-wider relative z-10
                                ${activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600'}
                            `}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabBg"
                                    className="absolute inset-0 bg-slate-900 dark:bg-white rounded-xl shadow-lg -z-10"
                                />
                            )}
                            {tab.label}
                            {tab.count !== '?' && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-zinc-800'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* List - Higher Density */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {displayOrders.length > 0 ? displayOrders.map((delivery, index) => (
                        <motion.div
                            layout
                            key={delivery._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => navigate(`/delivery/tracking/${delivery._id}`)}
                            className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
                        >
                            {/* Card Header - Condensed */}
                            <div className="p-3 md:p-4 flex justify-between items-center border-b border-slate-50 dark:border-zinc-800/40">
                                <div className="flex items-center gap-2 md:gap-2.5">
                                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-800 dark:text-zinc-100 border border-slate-100 dark:border-zinc-800">
                                        <Package size={16} md:size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-[13px] md:text-sm tracking-tight">#{delivery.order?.orderId || 'N/A'}</h4>
                                        <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                                            {new Date(delivery.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h5 className="font-black text-lg md:text-xl text-slate-900 dark:text-white">₹{delivery.order?.totalAmount || '0'}</h5>
                                    <p className="text-[9px] md:text-[10px] text-[#028A0F] font-bold uppercase tracking-widest">{delivery.deliveryFee || 40} fee</p>
                                </div>
                            </div>

                            {/* Tactical Route Map-like Info */}
                            <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                                <div className="relative pl-5 md:pl-6 space-y-3 md:space-y-4">
                                    {/* Vertical Route Indicator */}
                                    <div className="absolute left-[6.5px] md:left-[7px] top-[5px] md:top-[6px] bottom-[5px] md:bottom-[6px] w-[2px] bg-slate-100 dark:bg-zinc-800">
                                        <div className="absolute top-0 -left-[3px] w-1.5 md:w-2 h-1.5 md:h-2 rounded-full border-2 border-white dark:border-zinc-900 bg-[#028A0F]"></div>
                                        <div className="absolute bottom-0 -left-[3px] w-1.5 md:w-2 h-1.5 md:h-2 rounded-full border-2 border-white dark:border-zinc-900 bg-slate-300"></div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] md:text-[11px] font-bold text-slate-800 dark:text-zinc-100 leading-tight">Sathi Store HQ</p>
                                        <p className="text-[8px] md:text-[9px] text-slate-400 font-medium">Pickup Point</p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] md:text-[11px] font-bold text-slate-800 dark:text-zinc-100 leading-tight truncate">
                                            {delivery.order?.shippingAddress?.street}
                                        </p>
                                        <p className="text-[8px] md:text-[9px] text-slate-400 font-medium">{delivery.order?.shippingAddress?.city}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Status */}
                            <div className="px-3 md:px-4 py-2 md:py-3 bg-slate-50 dark:bg-white/5 flex items-center justify-between group-hover:bg-[#028A0F] transition-colors">
                                <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest group-hover:text-white ${delivery.status === 'completed' ? 'text-emerald-500' : 'text-orange-500'}`}>
                                    {delivery.status}
                                </span>
                                <ArrowUpRight size={12} md:size={14} className="text-slate-300 group-hover:text-white" />
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-300 opacity-50">
                            <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-full mb-4">
                                <Package size={40} className="text-slate-200" />
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest">No Active Missions</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrderManagement;

