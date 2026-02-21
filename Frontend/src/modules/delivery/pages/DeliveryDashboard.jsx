import React, { useMemo, useState } from 'react';
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
import { useAuth } from '../../user/context/AuthContext';
import useDelivery from '../hooks/useDelivery';
import { useNavigate } from 'react-router-dom';
import useLocationTracking from '../hooks/useLocationTracking';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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


const StatCard = ({ icon, label, value, subValue, color, isLoading }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
    >
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
        <div className="flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
                {icon}
            </div>
            <div>
                <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">{label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    {isLoading ? (
                        <div className="h-8 w-20 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-lg"></div>
                    ) : (
                        <h3 className="text-2xl font-black tracking-tight">{value}</h3>
                    )}
                    {subValue && <span className="text-xs font-bold text-green-500">{subValue}</span>}
                </div>
            </div>
        </div>
    </motion.div>
);

const DeliveryDashboard = () => {
    const { token, user } = useAuth();
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
        refreshAll,
        simulate
    } = useDelivery(token);

    const [incomingOrder, setIncomingOrder] = useState(null);
    const [acceptedOrder, setAcceptedOrder] = useState(null);
    const [mapStatus, setMapStatus] = useState('assigned'); // assigned -> picked -> delivered


    const isOnline = profile?.status === 'online';
    useLocationTracking(token, isOnline);
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
        await toggleStatus(profile?.status);
        await refreshAll();
    };

    const handleSimulate = async () => {
        // Instead of API simulation, we'll show our dummy frontend notification
        setIncomingOrder({
            id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            customer: 'Rajesh Kumar',
            restaurant: 'Spice Garden (Vijay Nagar)',
            distance: '3.2 km',
            fare: '₹45.00',
            time: '12-15 mins',
            items: ['Butter Chicken x1', 'Garlic Naan x2'],
            coords: {
                pickup: [22.7533, 75.8937],
                delivery: [22.7244, 75.8839]
            }
        });
    };

    const handleAcceptOrder = () => {
        setAcceptedOrder(incomingOrder);
        setIncomingOrder(null);
        setMapStatus('assigned');
    };

    const handleDeclineOrder = () => {
        setIncomingOrder(null);
    };

    const handleUpdateMapStatus = () => {
        if (mapStatus === 'assigned') setMapStatus('picked_up');
        else if (mapStatus === 'picked_up') setMapStatus('delivered');
        else setAcceptedOrder(null);
    };


    const handleUpdateCenter = async () => {
        if (!navigator.geolocation) return;
        setLocationUpdating(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { longitude, latitude } = position.coords;
                await updateLocation(longitude, latitude);
                await refreshAll();
                setLocationUpdating(false);
            },
            () => setLocationUpdating(false),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Top Greeting & Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Welcome, {user?.name?.split(' ')[0] || 'Rider'}! 👋</h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">Ready for today's deliveries?</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Test Button */}
                    <button
                        onClick={handleSimulate}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-500/10 text-pink-600 rounded-2xl text-xs font-bold hover:bg-pink-200 transition-colors"
                    >
                        <Play size={14} fill="currentColor" />
                        Simulate Order
                    </button>

                    <button
                        onClick={refreshAll}
                        className={`p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm ${loading ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={20} />
                    </button>

                    <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                        <span className={`text-sm font-bold uppercase tracking-wider px-3 ${isOnline ? 'text-green-600' : 'text-slate-400'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                        <button
                            onClick={handleToggle}
                            disabled={loading}
                            className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${isOnline ? 'bg-green-500' : 'bg-slate-200 dark:bg-zinc-800'}`}
                        >
                            <motion.div
                                animate={{ x: isOnline ? 24 : 4 }}
                                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm shadow-black/20"
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Wallet & Main Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Wallet Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 bg-gradient-to-br from-pink-600 to-red-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-pink-500/30 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-20 -mb-20 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-pink-100/80 font-bold uppercase tracking-widest text-[10px] mb-1">Your Wallet Balance</p>
                                <h2 className="text-5xl font-black mb-1">
                                    ₹{stats?.walletBalance?.toFixed(2) || '0.00'}
                                </h2>
                                <div className="flex items-center gap-2 text-pink-100 text-sm font-medium">
                                    <TrendingUp size={16} />
                                    <span>Total Lifetime: ₹{stats?.totalEarnings?.toFixed(0) || '0'}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/delivery/wallet')}
                                className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors"
                            >
                                View Wallet
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-3xl border border-white/10">
                                <p className="text-pink-100/60 text-xs font-bold uppercase tracking-wider mb-1">Today's Earnings</p>
                                <h4 className="text-xl font-black">₹{stats?.todayEarnings || '0'}</h4>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-3xl border border-white/10">
                                <p className="text-pink-100/60 text-xs font-bold uppercase tracking-wider mb-1">Active Orders</p>
                                <h4 className="text-xl font-black">{stats?.activeOrders || '0'}</h4>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Service Area Status */}
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg">Service Area</h4>
                        <motion.button
                            animate={loading ? { rotate: 360 } : {}}
                            transition={loading ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
                            onClick={refreshAll}
                            className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full"
                        >
                            <RotateCcw size={16} />
                        </motion.button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center text-pink-600">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">Active Location</p>
                            <h5 className="font-bold">{locationText}</h5>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-zinc-400 font-medium">Radius Detection</span>
                            <span className="text-green-500 font-bold">{profile?.serviceArea?.radius || 5}.0 km</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="w-[85%] h-full bg-pink-500 rounded-full"></div>
                        </div>
                    </div>

                    <button
                        onClick={handleUpdateCenter}
                        disabled={locationUpdating}
                        className="mt-auto w-full py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-60"
                    >
                        <Navigation size={18} />
                        {locationUpdating ? 'Updating...' : 'Update Center'}
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard
                    icon={<Clock size={24} />}
                    label="Pending Orders"
                    value={stats?.pendingOrders || '0'}
                    color="from-orange-400 to-amber-500"
                    isLoading={loading}
                />
                <StatCard
                    icon={<CheckCircle2 size={24} />}
                    label="Today Delivered"
                    value={stats?.todayDeliveries || '0'}
                    color="from-emerald-400 to-teal-500"
                    isLoading={loading}
                />
                <StatCard
                    icon={<XCircle size={24} />}
                    label="Return Orders"
                    value="0"
                    color="from-red-400 to-rose-500"
                    isLoading={loading}
                />
                <StatCard
                    icon={<Wallet size={24} />}
                    label="Today's Earnings"
                    value={`₹${stats?.todayEarnings || '0'}`}
                    color="from-blue-400 to-indigo-500"
                    isLoading={loading}
                />
            </div>

            {/* Bottom Section: Chart & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Earnings Analytics */}
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="font-bold text-xl tracking-tight">Earnings Analytics</h4>
                            <p className="text-slate-500 text-sm">Weekly performance Overview</p>
                        </div>
                        <select
                            value={chartRange}
                            onChange={(e) => setChartRange(e.target.value)}
                            className="bg-slate-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2 text-xs font-bold font-sans outline-none"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>

                    <div className="h-[250px] w-full">
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
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-xl tracking-tight">Active Deliveries</h4>
                        <button
                            onClick={() => navigate('/delivery/orders')}
                            className="text-pink-600 text-sm font-bold flex items-center gap-1 group"
                        >
                            View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {orders.length > 0 ? orders.map((order) => (
                            <div
                                key={order._id}
                                onClick={() => navigate(`/delivery/tracking/${order._id}`)}
                                className="flex items-center gap-4 p-4 rounded-3xl border border-slate-50 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-pink-500 font-bold">
                                    <Clock size={20} />
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-bold text-sm">Order #{order.order?.orderId || 'N/A'}</h5>
                                    <p className="text-slate-500 text-xs">{order.order?.shippingAddress?.street}, {order.order?.shippingAddress?.city}</p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
                                        {order.status}
                                    </span>
                                    <p className="font-black text-sm">₹{order.deliveryFee}</p>
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
                            <div className="bg-pink-500 p-4 text-white flex items-center justify-between">
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
                                            <MapPin size={14} className="text-pink-500" />
                                            {incomingOrder.distance} away • {incomingOrder.time}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-pink-600">{incomingOrder.fare}</div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Fare</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">
                                        <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center text-pink-600">
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
                                        className="py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-pink-500/30 active:scale-95 transition-all"
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
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap'
                                />
                                <Marker position={acceptedOrder.coords.pickup}>
                                    <Popup>Pickup: {acceptedOrder.restaurant}</Popup>
                                </Marker>
                                <Marker position={acceptedOrder.coords.delivery}>
                                    <Popup>Delivery: {acceptedOrder.customer}</Popup>
                                </Marker>
                                <Polyline
                                    positions={[acceptedOrder.coords.pickup, acceptedOrder.coords.delivery]}
                                    color="#ec4899"
                                    weight={6}
                                    opacity={0.6}
                                    dashArray="10, 10"
                                />
                            </MapContainer>

                            <button
                                onClick={() => setAcceptedOrder(null)}
                                className="absolute top-6 left-6 z-10 p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800"
                            >
                                <ChevronRight size={24} className="rotate-180" />
                            </button>

                            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 px-6 py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="font-black text-sm uppercase tracking-wider">
                                    {mapStatus === 'assigned' ? 'Heading to Restaurant' : (mapStatus === 'picked_up' ? 'Heading to Customer' : 'Delivery Complete')}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-3xl bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center text-pink-600">
                                            <Play size={24} fill="currentColor" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-2xl">Order #{acceptedOrder.id}</h4>
                                            <p className="text-slate-500 font-medium">Earn {acceptedOrder.fare} on completion</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-50 dark:bg-zinc-800 px-6 py-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Estimated Arrival</p>
                                            <p className="font-black text-lg">7 Mins</p>
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
                                    <div className={`h-2 rounded-full transition-colors ${mapStatus === 'assigned' ? 'bg-pink-500' : 'bg-green-500'}`}></div>
                                    <div className={`h-2 rounded-full transition-colors ${mapStatus === 'picked_up' ? 'bg-pink-500' : (mapStatus === 'delivered' ? 'bg-green-500' : 'bg-slate-100 dark:bg-zinc-800')}`}></div>
                                    <div className={`h-2 rounded-full transition-colors ${mapStatus === 'delivered' ? 'bg-pink-500' : 'bg-slate-100 dark:bg-zinc-800'}`}></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className={`p-4 rounded-3xl border ${mapStatus === 'assigned' ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-500/5' : 'border-slate-100 dark:border-zinc-800 opacity-50'}`}>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Pickup From</p>
                                        <p className="font-black">{acceptedOrder.restaurant}</p>
                                        <p className="text-xs text-slate-500">Vijay Nagar, Sector B</p>
                                    </div>
                                    <div className={`p-4 rounded-3xl border ${mapStatus === 'picked_up' ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-500/5' : 'border-slate-100 dark:border-zinc-800 opacity-50'}`}>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Deliver To</p>
                                        <p className="font-black">{acceptedOrder.customer}</p>
                                        <p className="text-xs text-slate-500">Sapphire Heights, Apt 402</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleUpdateMapStatus}
                                    className="w-full py-5 bg-gradient-to-r from-pink-600 to-red-700 text-white font-black tracking-[0.2em] uppercase rounded-[1.5rem] shadow-2xl shadow-pink-500/40 active:scale-[0.98] transition-all"
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
