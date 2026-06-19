import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    CheckCircle2,
    Wallet,
    MapPin,
    Navigation,
    ChevronRight,
    RefreshCw,
    Play,
    Phone,
    Bike,
    ShieldCheck,
    ArrowUpRight,
    Activity,
    Search
} from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import useDelivery from '../hooks/useDelivery';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../vendor/utils/formatDate';
import mapImage from '../../../assets/image.png';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const MiniStat = ({ icon: Icon, label, value }) => (
    <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md p-2 rounded-xl border border-white/50 dark:border-zinc-800/50 shadow-sm flex-1">
        <div className="flex items-center gap-1.5 mb-1">
            <div className="p-1 px-1.5 rounded-md bg-slate-100/80 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                <Icon size={11} />
            </div>
            <p className="text-[8px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-tighter leading-none">{label}</p>
        </div>
        <h4 className="text-xs font-black text-slate-900 dark:text-white tracking-tight pl-0.5">{value}</h4>
    </div>
);

const DeliveryDashboard = () => {
    const { token } = useDeliveryStore();
    const navigate = useNavigate();
    const {
        profile,
        stats,
        orders,
        loading,
        toggleStatus,
        refreshAll,
        simulate
    } = useDelivery();

    const isOnline = profile?.dutyStatus === 'Online';
    const activeRun = useMemo(() => orders.find(r => r.status === 'assigned' || r.status === 'in_progress'), [orders]);
    const currentStop = useMemo(() => {
        if (!activeRun) return null;
        return activeRun.orders[activeRun.currentStopIndex || 0];
    }, [activeRun]);

    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=22.7533,75.8948&zoom=14&size=600x300&maptype=roadmap&markers=color:black%7Clabel:S%7C22.7533,75.8948&markers=color:red%7Clabel:C%7C22.7196,75.8577&key=${GOOGLE_MAPS_API_KEY}`;

    useEffect(() => {
        const handleFirebaseMessage = (event) => {
            const payload = event.detail;
            const title = payload?.notification?.title || payload?.data?.title || '';
            const isAssignment = title.toLowerCase().includes('assign') || title.toLowerCase().includes('pickup');
            
            if (isAssignment) {
                // Instantly fetch latest data so new order appears without manual refresh
                refreshAll();
            }
        };

        window.addEventListener('onFirebaseMessage', handleFirebaseMessage);
        return () => window.removeEventListener('onFirebaseMessage', handleFirebaseMessage);
    }, [refreshAll]);

    const handleToggleDuty = async () => {
        try {
            await toggleStatus(profile?.dutyStatus);
        } catch (error) {
            console.error('Toggle status failed:', error);
        }
    };

    if (loading && !profile) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Tactical Link EST.</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto space-y-4 pb-28 md:pb-8">
            {/* Header Mini */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                        <Bike size={16} />
                    </div>
                    <div>
                        <h2 className="text-[13px] font-black text-slate-900 dark:text-white leading-none">Hello, {profile?.name?.split(' ')[0]}</h2>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight mt-1">{profile?.vehicleType} • {profile?.uniqueId}</p>
                    </div>
                </div>
                <button
                    onClick={() => refreshAll()}
                    className="p-2 bg-slate-100 dark:bg-zinc-900 rounded-lg text-slate-500 dark:text-zinc-400 active:scale-95 transition-all"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Duty Card - Compact App Style */}
            <div className="px-1">
                <div className="bg-slate-900 text-white p-2.5 px-3.5 rounded-2xl flex items-center justify-between shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                    {/* Subtle status pulse in bg */}
                    {isOnline && (
                        <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 shadow-[1px_0_4px_rgba(16,185,129,0.3)]"></div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-40 mb-0.5">Tactical Presence</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-black tracking-tight">{isOnline ? 'DUTY ONLINE' : 'DUTY OFFLINE'}</span>
                            {isOnline && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>}
                        </div>
                    </div>
                    {/* Precision Mobile Toggle */}
                    <div
                        onClick={handleToggleDuty}
                        className={`w-14 h-8 rounded-full cursor-pointer transition-colors duration-500 relative flex items-center px-1 ${isOnline ? 'bg-emerald-500' : 'bg-slate-800'
                            }`}
                    >
                        <motion.div
                            initial={false}
                            animate={{ x: isOnline ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="w-6 h-6 bg-white rounded-full shadow-md z-10"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid - 3 Columns for perfect fit */}
            <div className="grid grid-cols-3 gap-2 px-1">
                <MiniStat
                    icon={Wallet}
                    label="Cash Liability"
                    value={formatCurrency(stats?.walletBalance || 0)}
                />
                <MiniStat
                    icon={CheckCircle2}
                    label="Trips Today"
                    value={stats?.todayDeliveries || '0'}
                />
                <MiniStat
                    icon={Clock}
                    label="Pending"
                    value={stats?.activeOrders || '0'}
                />
            </div>

            {/* Active Mission - Mobile Card Style */}
            <div className="space-y-3 px-1">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Current Mission</h3>
                    {activeRun && (
                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">In Progress</span>
                    )}
                </div>

                {activeRun ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-zinc-800/60 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden group">
                        {/* Compact Map Preview */}
                        <div className="h-40 bg-slate-100 dark:bg-zinc-900 relative">
                            <style>
                                {`
                                    .navigate-btn-override, .mission-btn-override {
                                        border-radius: 9999px !important;
                                    }
                                    .footer-box-override {
                                        border-radius: 20px !important;
                                    }
                                `}
                            </style>
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-zinc-850 text-slate-300 dark:text-zinc-600">
                                <MapPin size={32} strokeWidth={1} />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Tactical Map Offline</span>
                            </div>
                            <img
                                src={mapImage}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover grayscale-[0.3]"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            <button
                                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=22.7196,75.8577`, '_blank')}
                                className="navigate-btn-override absolute bottom-3 right-3 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 p-3 shadow-xl active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Navigation size={12} fill="white" className="dark:fill-zinc-900" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Arriving Soon</span>
                            </button>
                        </div>

                        <div className="p-3.5 pt-1.5 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex flex-col items-center gap-1 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-slate-900 dark:bg-zinc-100 border-2 border-white dark:border-zinc-900 shadow-sm ring-2 ring-slate-100 dark:ring-zinc-800"></div>
                                    <div className="w-0.5 h-7 bg-slate-100 dark:bg-zinc-800 dashed"></div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 shadow-sm ring-2 ring-emerald-100 dark:ring-emerald-950"></div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Pickup Point</p>
                                        <h4 className="text-[13px] font-black text-slate-800 dark:text-zinc-100 leading-tight">{activeRun.branchId?.name || 'Central Branch'}</h4>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Delivery Target</p>
                                        <h4 className="text-[13px] font-black text-slate-800 dark:text-zinc-100 leading-tight">{currentStop?.order?.user?.name || 'Client Location'}</h4>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-lg text-[8px] font-black tracking-tight border border-slate-100 dark:border-zinc-750">COD: {currentStop?.order?.totalAmount ? formatCurrency(currentStop.order.totalAmount) : 'N/A'}</span>
                                            <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-lg text-[8px] font-black tracking-tight border border-emerald-100 dark:border-emerald-900/30">OTP SECURED</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/delivery/run/${activeRun._id}`)}
                                className="mission-btn-override w-full py-2 bg-white text-slate-900 dark:bg-zinc-950 dark:text-white font-black text-[8px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-slate-100 dark:border-zinc-800"
                            >
                                View Detailed Mission <ArrowUpRight size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/50 dark:bg-zinc-900/50 border border-dashed border-slate-200 dark:border-zinc-800 rounded-[2rem] p-10 text-center space-y-3">
                        <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                            <Search size={24} className="text-slate-200 dark:text-zinc-700" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest italic">Awaiting Task Ping...</p>
                    </div>
                )}
            </div>

            {/* Support Actions Footer Row */}
            <div className="grid grid-cols-2 gap-3 px-1">
                <button
                    onClick={() => navigate('/delivery/history')}
                    className="footer-box-override bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800/60 flex items-center gap-3 active:scale-95 transition-all shadow-sm group"
                >
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <Activity size={16} />
                    </div>
                    <span className="text-[10px] font-black text-slate-600 dark:text-zinc-300 uppercase tracking-tight">History</span>
                </button>
                <button
                    onClick={() => navigate('/delivery/wallet')}
                    className="footer-box-override bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800/60 flex items-center gap-3 active:scale-95 transition-all shadow-sm group"
                >
                    <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all">
                        <ShieldCheck size={16} />
                    </div>
                    <span className="text-[10px] font-black text-slate-600 dark:text-zinc-300 uppercase tracking-tight">Liability</span>
                </button>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
