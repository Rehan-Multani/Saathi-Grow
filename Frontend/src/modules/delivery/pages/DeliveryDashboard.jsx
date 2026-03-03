import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    CheckCircle2,
    XCircle,
    RotateCcw,
    TrendingUp,
    Wallet,
    MapPin,
    Navigation,
    ChevronRight,
    Search,
    RefreshCw,
    Play,
    Phone,
    MessageCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useDeliveryStore from '../store/deliveryStore';
import useDelivery from '../hooks/useDelivery';
import { useNavigate } from 'react-router-dom';
import useLocationTracking from '../hooks/useLocationTracking';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './live-tracking.css';
import L from 'leaflet';
import { createDummyOrder } from '../data/mockDeliveryData';
import { ASSET_URLS } from '../../../constants/assetUrls';

const NEW_ORDER_EVENT = 'delivery:new-order';
const OPEN_ORDER_EVENT = 'delivery:open-order';
const ORDER_ACCEPTED_EVENT = 'delivery:order-accepted';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ChangeView = ({ center }) => {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
};


const StatCard = ({ icon, label, value, subValue, color, isLoading, onClick }) => (
    <motion.div
        whileHover={{ y: -5 }}
        onClick={onClick}
        className={`bg-white dark:bg-zinc-900 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className={`absolute -right-4 -top-4 w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
        <div className="flex flex-col gap-2 md:gap-4">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
                {React.cloneElement(icon, { size: 18 })}
            </div>
            <div>
                <p className="text-slate-500 dark:text-zinc-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider">{label}</p>
                <div className="flex items-baseline gap-1 md:gap-2 mt-0.5 md:mt-1">
                    {isLoading ? (
                        <div className="h-6 md:h-8 w-16 md:w-20 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-lg"></div>
                    ) : (
                        <h3 className="text-xl md:text-2xl font-black tracking-tight">{value}</h3>
                    )}
                    {subValue && <span className="text-[10px] font-bold text-[#028A0F]">{subValue}</span>}
                </div>
            </div>
        </div>
    </motion.div>
);

const DeliveryDashboard = () => {
    const { token } = useDeliveryStore();
    const navigate = useNavigate();
    const [chartRange, setChartRange] = useState('7d');
    const [locationUpdating, setLocationUpdating] = useState(false);
    const {
        profile,
        stats,
        orders,
        transactions,
        loading,
        updateLocation,
        toggleStatus,
        refreshAll
    } = useDelivery();

    const user = profile;

    const [incomingOrder, setIncomingOrder] = useState(null);
    const [acceptedOrder, setAcceptedOrder] = useState(null);
    const [mapStatus, setMapStatus] = useState('assigned'); // assigned -> picked -> delivered

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    useEffect(() => {
        const handleIncomingOrder = (event) => {
            const order = event.detail;
            if (order?._id) {
                setIncomingOrder(order);
            }
        };

        window.addEventListener(NEW_ORDER_EVENT, handleIncomingOrder);
        window.addEventListener(OPEN_ORDER_EVENT, handleIncomingOrder);

        return () => {
            window.removeEventListener(NEW_ORDER_EVENT, handleIncomingOrder);
            window.removeEventListener(OPEN_ORDER_EVENT, handleIncomingOrder);
        };
    }, []);


    const isOnline = profile?.dutyStatus === 'Online';
    const activeOrderId = acceptedOrder?.order?._id || acceptedOrder?._id || null;
    useLocationTracking(token, isOnline, activeOrderId);
    const coordinates = profile?.currentLocation?.coordinates;
    const locationText = Array.isArray(coordinates) && coordinates.length === 2
        ? `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`
        : `Indore, ${profile?.vehicleNumber || 'Sector A'}`;

    const chartData = useMemo(() => {
        const days = chartRange === '30d' ? 30 : 7;
        const points = Array.from({ length: days }, (_, idx) => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - (days - 1 - idx));
            const key = date.toISOString().slice(0, 10);
            return {
                key,
                name: chartRange === '30d'
                    ? `${date.getDate()}/${date.getMonth() + 1}`
                    : date.toLocaleDateString('en-US', { weekday: 'short' }),
                earnings: 0
            };
        });

        const pointsByDate = Object.fromEntries(points.map((point) => [point.key, point]));
        (transactions || []).forEach((tx) => {
            if (tx.type !== 'credit') return;
            const createdAt = new Date(tx.createdAt);
            if (Number.isNaN(createdAt.getTime())) return;

            const dateKey = new Date(
                createdAt.getFullYear(),
                createdAt.getMonth(),
                createdAt.getDate()
            ).toISOString().slice(0, 10);

            if (pointsByDate[dateKey]) {
                pointsByDate[dateKey].earnings += Number(tx.amount) || 0;
            }
        });

        return points.map(({ name, earnings }) => ({ name, earnings }));
    }, [transactions, chartRange]);

    const handleToggle = async () => {
        try {
            await toggleStatus(profile?.dutyStatus);
            // No need to refreshAll, toggleStatus now updates the profile state directly
        } catch (error) {
            console.error('Failed to toggle partner status:', error);
        }
    };

    const handleSimulate = () => {
        try {
            const order = createDummyOrder();
            window.dispatchEvent(new CustomEvent(NEW_ORDER_EVENT, { detail: order }));
        } catch (error) {
            console.error('Failed to simulate order:', error);
        }
    };

    const handleAcceptOrder = () => {
        if (!incomingOrder?._id) return;
        setAcceptedOrder(incomingOrder);
        window.dispatchEvent(new CustomEvent(ORDER_ACCEPTED_EVENT, { detail: { id: incomingOrder._id } }));
        setIncomingOrder(null);
        setMapStatus('assigned');
    };

    // Standardized premium markers for Dashboard
    const bikeIcon = useMemo(() => new L.divIcon({
        html: `<div class="rider-marker-container">
                 <div class="pulse-ring ring-1"></div>
                 <div class="bike-icon-wrapper">
                    <img src="${ASSET_URLS.bike}" 
                         onerror="this.onerror=null; this.src='${ASSET_URLS.bikeCloudinary}';"
                         class="bike-img" />
                 </div>
               </div>`,
        className: 'custom-bike-marker',
        iconSize: [50, 50],
        iconAnchor: [25, 25]
    }), []);

    const storeIcon = useMemo(() => L.divIcon({
        html: `<div class="location-marker store-marker small">
                <div class="marker-pin">
                    <img src="${ASSET_URLS.store}" 
                         onerror="this.onerror=null; this.src='${ASSET_URLS.storeCloudinary}';" />
                </div>
               </div>`,
        className: 'custom-location-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 35]
    }), []);

    const homeIcon = useMemo(() => L.divIcon({
        html: `<div class="location-marker home-marker small">
                <div class="marker-pin">
                    <img src="${ASSET_URLS.house}" 
                         onerror="this.onerror=null; this.src='${ASSET_URLS.houseCloudinary}';" />
                </div>
               </div>`,
        className: 'custom-location-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 35]
    }), []);

    const handleDeclineOrder = () => {
        setIncomingOrder(null);
    };

    const handleUpdateMapStatus = () => {
        if (mapStatus === 'assigned') setMapStatus('picked_up');
        else if (mapStatus === 'picked_up') setMapStatus('delivered');
        else setAcceptedOrder(null);
    };


    const handleUpdateCenter = () => {
        if (!navigator.geolocation) return;
        setLocationUpdating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                (async () => {
                    try {
                        const { longitude, latitude } = position.coords;
                        await updateLocation(longitude, latitude);
                        await refreshAll();
                    } catch (error) {
                        console.error('Failed to update current location:', error);
                    } finally {
                        setLocationUpdating(false);
                    }
                })();
            },
            () => setLocationUpdating(false),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className="space-y-4 md:space-y-6 pb-6">
            {/* Top Greeting & Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">Welcome, {user?.name?.split(' ')[0] || 'Rider'}! 👋</h1>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400 font-medium">Ready for today's deliveries?</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSimulate}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#028A0F]/10 text-[#028A0F] rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#028A0F]/20 transition-all active:scale-95"
                    >
                        <Play size={12} fill="currentColor" />
                        Simulate
                    </button>

                    <button
                        onClick={() => refreshAll()}
                        className={`p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 shadow-sm active:scale-90 transition-all ${loading ? 'opacity-50' : ''}`}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 shadow-sm">
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#028A0F] animate-pulse' : 'bg-slate-300'}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-[#028A0F]' : 'text-slate-400'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                        <button
                            onClick={handleToggle}
                            disabled={loading}
                            className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isOnline ? 'bg-[#028A0F]' : 'bg-slate-200 dark:bg-zinc-800'}`}
                        >
                            <motion.div
                                animate={{ x: isOnline ? 20 : 2 }}
                                className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Wallet & Main Stats Row - Compacted */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Wallet Card - Slimmer */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-8 bg-[#028A0F] rounded-3xl p-4 md:p-5 text-white shadow-xl shadow-[#028A0F]/20 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-white/20 rounded-full -mr-10 -mt-10 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col justify-between h-full gap-3 md:gap-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-white/70 font-bold uppercase tracking-widest text-[8px] md:text-[9px] mb-0.5">Your Wallet Balance</p>
                                <h2 className="text-2xl md:text-4xl font-black mb-0.5">
                                    ₹{stats?.walletBalance?.toFixed(2) || '0.00'}
                                </h2>
                                <div className="flex items-center gap-1.5 md:gap-2 text-white/90 text-[10px] md:text-xs font-bold">
                                    <TrendingUp size={12} md:size={14} />
                                    <span>Lifetime: ₹{stats?.totalEarnings?.toFixed(0) || '0'}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/delivery/wallet')}
                                className="bg-white text-[#028A0F] px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 transition-all shadow-lg active:scale-95"
                            >
                                Withdraw
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div className="bg-white/10 backdrop-blur-sm p-2.5 md:p-3 rounded-2xl md:rounded-3xl border border-white/10">
                                <p className="text-white/60 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-0.5">Today's Earnings</p>
                                <h4 className="text-base md:text-lg font-black">₹{stats?.todayEarnings || '0'}</h4>
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-white/40 text-[7px] md:text-[8px] font-black uppercase mb-0.5">Deliveries</p>
                                <p className="font-black text-xs md:text-sm">{stats?.todayDeliveries || '0'}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Service Area Status - Compacted */}
                <div className="lg:col-span-4 bg-white dark:bg-white/5 rounded-3xl p-5 md:p-6 border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-3 md:gap-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-black text-[10px] md:text-[11px] uppercase tracking-widest text-slate-400">Tactical Area</h4>
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#028A0F]' : 'bg-slate-300'}`}></div>
                    </div>

                    <div className="flex items-center gap-2.5 md:gap-3">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-800 dark:text-zinc-100 border border-slate-100 dark:border-white/5">
                            <MapPin size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] md:text-[12px] font-bold text-slate-800 dark:text-zinc-100 truncate">{locationText}</p>
                            <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-wider">{profile?.vehicleNumber || 'Standard Rider'}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleUpdateCenter}
                        disabled={locationUpdating}
                        className="mt-2 md:mt-auto w-full py-2 md:py-2.5 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] flex items-center justify-center gap-1.5 md:gap-2 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        <Navigation size={12} />
                        {locationUpdating ? 'LOCATING...' : 'UPDATE HQ'}
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid - More Compact icons/text */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    icon={<Clock />}
                    label="Pending"
                    value={stats?.pendingOrders || '0'}
                    color="from-orange-400 to-amber-500"
                    isLoading={loading}
                />
                <StatCard
                    icon={<CheckCircle2 />}
                    label="Success"
                    value={stats?.todayDeliveries || '0'}
                    color="from-emerald-400 to-teal-500"
                    isLoading={loading}
                />
                <StatCard
                    icon={<XCircle />}
                    label="Returns"
                    value={stats?.returnPickups ?? '0'}
                    subValue={stats?.returnPickups > 0 ? 'Active' : null}
                    color="from-blue-400 to-indigo-500"
                    isLoading={loading}
                    onClick={() => navigate('/delivery/returns')}
                />
                <StatCard
                    icon={<Wallet />}
                    label="Earnings"
                    value={`₹${stats?.todayEarnings || '0'}`}
                    color="from-pink-400 to-rose-500"
                    isLoading={loading}
                />
            </div>

            {/* Bottom Section: Chart & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Earnings Analytics */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 md:p-6 border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h4 className="font-bold text-lg md:text-xl tracking-tight">Analytics</h4>
                            <p className="text-slate-500 text-[10px] md:text-xs">Weekly performance overview</p>
                        </div>
                        <select
                            value={chartRange}
                            onChange={(e) => setChartRange(e.target.value)}
                            className="bg-slate-50 dark:bg-zinc-800 border-none rounded-lg px-2 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-bold font-sans outline-none"
                        >
                            <option value="7d">7 Days</option>
                            <option value="30d">30 Days</option>
                        </select>
                    </div>

                    <div className="h-[180px] md:h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        background: '#fff'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="earnings"
                                    stroke="#ec4899"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorEarnings)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 md:p-6 border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h4 className="font-bold text-lg md:text-xl tracking-tight">Active Deliveries</h4>
                        <button
                            onClick={() => navigate('/delivery/orders')}
                            className="text-[#028A0F] text-[11px] md:text-xs font-bold flex items-center gap-1 group"
                        >
                            View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {orders.length > 0 ? orders.map((order) => (
                            <div
                                key={order._id}
                                onClick={() => navigate(`/delivery/tracking/${order._id}`)}
                                className="flex items-center gap-4 p-4 rounded-3xl border border-slate-50 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                            >
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[#028A0F] font-bold shrink-0">
                                    <Clock size={16} md:size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-bold text-[13px] md:text-sm truncate">#{order.order?.orderId || 'N/A'}</h5>
                                    <p className="text-slate-500 text-[10px] md:text-xs truncate">{order.order?.shippingAddress?.street}, {order.order?.shippingAddress?.city}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="inline-block px-2 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-wider mb-0.5 md:mb-1">
                                        {order.status}
                                    </span>
                                    <p className="font-black text-[13px] md:text-sm">₹{order.deliveryFee}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-50">
                                <Search size={48} className="mb-4 text-slate-300" />
                                <p className="font-medium text-slate-400">No active orders right now</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Incoming Order Notification Overlay */}
            <AnimatePresence>
                {incomingOrder && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-[400px] z-[100]"
                    >
                        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-100 dark:border-zinc-800 overflow-hidden">
                            <div className="bg-[#028A0F] p-4 text-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                                    <span className="font-black text-xs uppercase tracking-widest">New Order Request</span>
                                </div>
                                <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-lg">LIVE</span>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="font-black text-xl mb-1">{incomingOrder.restaurant}</h4>
                                        <p className="text-slate-500 text-sm font-medium flex items-center gap-1">
                                            <MapPin size={14} className="text-[#028A0F]" />
                                            {incomingOrder.distance} away ₹ {incomingOrder.time}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-[#028A0F]">{incomingOrder.fare}</div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Fare</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">
                                        <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-[#028A0F]">
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Customer</p>
                                            <p className="text-sm font-bold">{incomingOrder.customer}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">
                                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                                            <Search size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Items</p>
                                            <p className="text-sm font-bold">{incomingOrder.items.join(', ')}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={handleDeclineOrder}
                                        className="py-4 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                                    >
                                        Decline
                                    </button>
                                    <button
                                        onClick={handleAcceptOrder}
                                        className="py-4 rounded-2xl bg-[#028A0F] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-[#028A0F]/30 active:scale-95 transition-all"
                                    >
                                        Accept Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Order Map Overlay */}
            <AnimatePresence>
                {acceptedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-white dark:bg-zinc-950 flex flex-col"
                    >
                        <div className="flex-1 relative">
                            <MapContainer
                                center={acceptedOrder.coords.pickup}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                            >
                                <ChangeView center={mapStatus === 'assigned' ? acceptedOrder.coords.pickup : acceptedOrder.coords.delivery} />
                                <TileLayer
                                    url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                                    attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                                />
                                <Marker position={acceptedOrder.coords.pickup} icon={storeIcon}>
                                    <Popup>Pickup: {acceptedOrder.restaurant}</Popup>
                                </Marker>
                                <Marker position={acceptedOrder.coords.delivery} icon={homeIcon}>
                                    <Popup>Delivery: {acceptedOrder.customer}</Popup>
                                </Marker>

                                {/* Depth Polyline */}
                                <Polyline
                                    positions={[acceptedOrder.coords.pickup, acceptedOrder.coords.delivery]}
                                    color="#000"
                                    weight={8}
                                    opacity={0.1}
                                    lineCap="round"
                                />
                                <Polyline
                                    positions={[acceptedOrder.coords.pickup, acceptedOrder.coords.delivery]}
                                    color="#ec4899"
                                    weight={4}
                                    opacity={0.6}
                                    dashArray="1, 10"
                                    lineCap="round"
                                />
                            </MapContainer>

                            <button
                                onClick={() => setAcceptedOrder(null)}
                                className="absolute top-6 left-6 z-10 p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800"
                            >
                                <ChevronRight size={24} className="rotate-180" />
                            </button>

                            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 px-6 py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#028A0F] animate-pulse"></div>
                                <span className="font-black text-sm uppercase tracking-wider">
                                    {mapStatus === 'assigned' ? 'Heading to Restaurant' : (mapStatus === 'picked_up' ? 'Heading to Customer' : 'Delivery Complete')}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-3xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-[#028A0F]">
                                            <Play size={24} fill="currentColor" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-2xl">Order #{acceptedOrder.order?.orderId || acceptedOrder._id}</h4>
                                            <p className="text-slate-500 font-medium">Earn {acceptedOrder.fare} on completion</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-50/80 dark:bg-zinc-800/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-slate-100 dark:border-zinc-800/50 shadow-inner">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mb-1">ETA Arrival</p>
                                            <p className="font-black text-lg text-slate-800 dark:text-zinc-50">7 Mins</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                                <Phone size={20} />
                                            </button>
                                            <button className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                                <MessageCircle size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className={`h-2 rounded-full transition-colors ${mapStatus === 'assigned' ? 'bg-[#028A0F]' : 'bg-[#028A0F]'}`}></div>
                                    <div className={`h-2 rounded-full transition-colors ${mapStatus === 'picked_up' ? 'bg-[#028A0F]' : (mapStatus === 'delivered' ? 'bg-[#028A0F]' : 'bg-slate-100 dark:bg-zinc-800')}`}></div>
                                    <div className={`h-2 rounded-full transition-colors ${mapStatus === 'delivered' ? 'bg-[#028A0F]' : 'bg-slate-100 dark:bg-zinc-800'}`}></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className={`p-4 rounded-3xl border ${mapStatus === 'assigned' ? 'border-[#028A0F] bg-green-50/50 dark:bg-green-500/5' : 'border-slate-100 dark:border-zinc-800 opacity-50'}`}>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Pickup From</p>
                                        <p className="font-black">{acceptedOrder.restaurant}</p>
                                        <p className="text-xs text-slate-500">Vijay Nagar, Sector B</p>
                                    </div>
                                    <div className={`p-4 rounded-3xl border ${mapStatus === 'picked_up' ? 'border-[#028A0F] bg-green-50/50 dark:bg-green-500/5' : 'border-slate-100 dark:border-zinc-800 opacity-50'}`}>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Deliver To</p>
                                        <p className="font-black">{acceptedOrder.customer}</p>
                                        <p className="text-xs text-slate-500">Sapphire Heights, Apt 402</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleUpdateMapStatus}
                                    className="w-full py-5 bg-[#028A0F] text-white font-black tracking-[0.2em] uppercase rounded-[1.5rem] shadow-2xl shadow-[#028A0F]/40 active:scale-[0.98] transition-all"
                                >
                                    {mapStatus === 'assigned' && 'Confirm Pickup'}
                                    {mapStatus === 'picked_up' && 'Confirm Delivery'}
                                    {mapStatus === 'delivered' && 'Done'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DeliveryDashboard;

