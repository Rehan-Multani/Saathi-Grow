import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Clock,
    Package,
    CheckCircle2,
    Navigation,
    ArrowUpRight,
    Loader2,
    Truck,
    AlertCircle
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
        { id: 'active', label: 'Active Run', count: activeTab === 'active' ? orders.length : '?' },
        { id: 'completed', label: 'History', count: activeTab === 'completed' ? history.length : '?' },
    ];

    const displayRuns = activeTab === 'completed' ? history : orders;

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

            {/* Sticky Tabs */}
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

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {displayRuns.length > 0 ? displayRuns.map((run, index) => {
                        const totalStops = run.orders?.length || 0;
                        const pendingStops = run.orders?.filter(o => o.status === 'pending' || o.status === 'out_for_delivery').length || 0;
                        const deliveredStops = run.orders?.filter(o => o.status === 'delivered').length || 0;
                        const nextPendingStop = run.orders?.find(o => o.status === 'pending' || o.status === 'out_for_delivery');

                        return (
                            <motion.div
                                layout
                                key={run._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => navigate(`/delivery/run/${run._id}`)}
                                className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(2,138,15,0.1)] transition-all duration-300 group cursor-pointer flex flex-col"
                            >
                                {/* Card Header */}
                                <div className="p-3 md:p-4 flex justify-between items-center border-b border-slate-50 dark:border-zinc-800/40">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-[#028A0F] border border-slate-100 dark:border-zinc-800 relative">
                                            <Truck size={20} md:size={22} className={run.status === 'in_progress' ? 'animate-pulse' : ''} />
                                            {run.status === 'in_progress' && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 shadow"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm md:text-base tracking-tight text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                                                {run.runId}
                                            </h4>
                                            <p className="text-[10px] md:text-[11px] text-slate-400 font-bold tracking-wide mt-0.5 d-flex align-items-center gap-1">
                                                {run.isImmediate ? <span className="text-warning flex items-center gap-1"><AlertCircle size={10} /> ASAP</span> : <span className="text-info flex items-center gap-1"><Clock size={10} /> Scheduled</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-black text-xs">
                                            {deliveredStops}/{totalStops}
                                        </div>
                                        <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Stops Code</p>
                                    </div>
                                </div>

                                {/* Next Stop Focus Area */}
                                <div className="flex-1 p-4 bg-slate-50/50 dark:bg-zinc-900/50">
                                    {nextPendingStop ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                                                    <Navigation size={10} /> Next Stop
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400">#{nextPendingStop.order?.orderId}</span>
                                            </div>
                                            <div className="pl-1">
                                                <h5 className="font-bold text-slate-800 dark:text-zinc-100 text-sm leading-snug">
                                                    {nextPendingStop.order?.user?.name || 'Customer'}
                                                </h5>
                                                <div className="flex items-start gap-1.5 mt-1 text-slate-500 text-xs">
                                                    <MapPin size={12} className="mt-0.5 shrink-0" />
                                                    <span className="line-clamp-2">
                                                        {nextPendingStop.order?.shippingAddress?.street}, {nextPendingStop.order?.shippingAddress?.city}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-500 space-y-2 py-4">
                                            <CheckCircle2 size={32} />
                                            <span className="text-xs font-black uppercase tracking-widest">All Stops Reached</span>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Status */}
                                <div className={`px-4 py-3 flex items-center justify-between transition-colors ${run.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                                        run.status === 'in_progress' ? 'bg-[#028A0F] text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600'
                                    }`}>
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {run.status.replace('_', ' ')}
                                    </span>
                                    <ArrowUpRight size={16} className={run.status === 'in_progress' ? 'text-white/70' : 'text-slate-400'} />
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-300 opacity-50">
                            <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-full mb-4 shadow-inner">
                                <Truck size={40} className="text-slate-200" />
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest">No Active Runs</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrderManagement;
