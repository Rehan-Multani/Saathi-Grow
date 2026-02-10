import React, { useState, useEffect } from 'react';
import { Truck, Search, MapPin, Package, Clock, ClipboardList, CheckCircle2, ChevronRight, User, Phone, ArrowLeft, RefreshCcw, Navigation, Map, Bike, Star, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderTracking = () => {
    const navigate = useNavigate();
    const [trackingId, setTrackingId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [liveDistance, setLiveDistance] = useState(1.2);
    const [liveEta, setLiveEta] = useState(15);

    // Simulate live distance/ETA updates
    useEffect(() => {
        if (orderData) {
            const interval = setInterval(() => {
                setLiveDistance(prev => Math.max(0.1, prev - 0.1));
                setLiveEta(prev => Math.max(2, prev - 1));
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [orderData]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!trackingId) return;

        setIsSearching(true);
        setTimeout(() => {
            setOrderData({
                id: trackingId.toUpperCase(),
                customer: 'Rahul Sharma',
                phone: '+91 98765 43210',
                address: 'H-302, Green Valley Apartments, Sector 12, New Delhi - 110001',
                status: 'Out for delivery',
                eta: '12-15 mins',
                priority: 'High',
                paymentMode: 'Online (Paid)',
                rider: {
                    name: 'Suresh Kumar',
                    rating: '4.8',
                    trips: '1.2k',
                    vehicle: 'Electric Hub',
                    vehicleNo: 'DL 1S AB 1234'
                },
                items: [
                    { name: 'Aashirvaad Shudh Chakki Atta', qty: '5kg', price: '₹245' },
                    { name: 'Amul Gold Milk', qty: '2 Pkts', price: '₹66' },
                    { name: 'Fortune Biryani Rice', qty: '1kg', price: '₹125' }
                ],
                timeline: [
                    { time: '04:15 PM', label: 'Out for delivery', desc: 'Rider is approaching your location', active: true, done: true },
                    { time: '03:45 PM', label: 'Picked up', desc: 'Package collected from SaathiGro Hub', active: false, done: true },
                    { time: '03:10 PM', label: 'Packed', desc: 'Verified and sealed by vendor', active: false, done: true },
                    { time: '02:50 PM', label: 'Order confirmed', desc: 'Payment verification successful', active: false, done: true }
                ]
            });
            setIsSearching(false);
        }, 600);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-12 overflow-x-hidden">
            {/* Navigation Header */}
            <div className="bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-white/10 px-4 md:px-8 py-3 lg:py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/vendor/orders')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors md:block hidden">
                        <ArrowLeft size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-base md:text-lg lg:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Live Tracking</h1>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-tight">Real-time delivery monitoring</p>
                    </div>
                </div>
                <div className="flex-1 max-w-sm relative group">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0c831f] transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Tracking ID (e.g. SG-ORD-5192)"
                                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs focus:bg-white dark:focus:bg-white/10 focus:border-[#0c831f] outline-none transition-all font-bold uppercase dark:text-white"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={isSearching} className="px-4 md:px-5 bg-[#0c831f] text-white rounded-lg text-[10px] font-bold tracking-widest hover:bg-[#0a6b19] transition-all shadow-sm flex items-center gap-2 active:scale-95">
                            {isSearching ? <RefreshCcw size={12} className="animate-spin" /> : 'TRACK'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-6 py-4 md:py-5 lg:py-4">
                {orderData ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 lg:gap-4">
                        {/* Main Status Area */}
                        <div className="lg:col-span-8 space-y-4 md:space-y-5 lg:space-y-5">
                            {/* Status Banner with Live Updates */}
                            <div className="bg-gradient-to-br from-[#0c831f] to-[#0a6b19] rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-5 text-white overflow-hidden relative shadow-lg">
                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-[9px] font-black uppercase tracking-widest">{orderData.id}</span>
                                                <div className="w-1 h-1 rounded-full bg-white/40" />
                                                <span className="text-[10px] font-bold text-green-100">{orderData.status}</span>
                                                {orderData.priority === 'High' && (
                                                    <>
                                                        <div className="w-1 h-1 rounded-full bg-white/40" />
                                                        <span className="px-1.5 py-0.5 bg-red-500/30 backdrop-blur-sm rounded text-[8px] font-black uppercase">Priority</span>
                                                    </>
                                                )}
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                                                Arriving in {liveEta} mins
                                            </h2>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                                    <Navigation size={12} className="animate-pulse" />
                                                    <span className="text-[10px] font-bold">{liveDistance.toFixed(1)} km away</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-green-100">
                                                    <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div>
                                                    <span className="text-[10px] font-bold">Live</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex bg-white/10 backdrop-blur-md rounded-xl p-3 items-center gap-3 border border-white/10 shrink-0">
                                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                                <Bike size={20} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-green-100 uppercase leading-none">Status</p>
                                                <p className="text-sm font-black mt-0.5 uppercase">In Transit</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-[-20px] right-[-20px] w-32 md:w-48 h-32 md:h-48 bg-white opacity-[0.05] rounded-full blur-3xl pointer-events-none" />
                            </div>

                            {/* Map Placeholder */}
                            <div className="bg-white dark:bg-[#0a0a0a] rounded-xl md:rounded-2xl border border-gray-100 dark:border-white/10 p-4 md:p-5 hidden md:block">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <Map size={14} className="text-[#0c831f]" /> Live Location
                                    </h3>
                                    <button className="text-[10px] font-bold text-[#0c831f] hover:underline">View Fullscreen</button>
                                </div>
                                <div className="w-full h-64 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg flex items-center justify-center border border-gray-100 dark:border-white/10 relative overflow-hidden">
                                    {/* Animated delivery marker */}
                                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 animate-bounce">
                                        <div className="relative">
                                            <MapPin size={32} className="text-[#0c831f] fill-[#0c831f]" />
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500">Map integration coming soon</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                {/* Delivery Timeline */}
                                <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-white/10 p-4 md:p-5 space-y-4">
                                    <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-50 dark:border-white/5 pb-3">
                                        <ClipboardList size={14} className="text-[#0c831f]" /> Delivery Timeline
                                    </h3>
                                    <div className="space-y-5 md:space-y-6 relative ml-2">
                                        {orderData.timeline.map((step, idx) => (
                                            <div key={idx} className="flex gap-3 md:gap-4 relative">
                                                <div className="flex flex-col items-center shrink-0">
                                                    <div className={`w-2 h-2 rounded-full z-10 mt-1 transition-all ${step.done ? 'bg-[#0c831f] ring-4 ring-green-50 dark:ring-green-900/30' : 'bg-gray-200 dark:bg-gray-700'} ${step.active && 'animate-pulse'}`} />
                                                    {idx !== orderData.timeline.length - 1 && (
                                                        <div className={`w-[2px] h-full absolute top-3 ${step.done ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`} />
                                                    )}
                                                </div>
                                                <div className="pb-1">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className={`text-[11px] font-black ${step.active ? 'text-[#0c831f]' : 'text-gray-900 dark:text-gray-100'} uppercase tracking-tight`}>{step.label}</p>
                                                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">{step.time}</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{step.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Contents */}
                                <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-white/10 p-4 md:p-5 space-y-4">
                                    <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-50 dark:border-white/5 pb-3">
                                        <Package size={14} className="text-blue-500" /> Package Items
                                    </h3>
                                    <div className="divide-y divide-gray-50 dark:divide-white/5">
                                        {orderData.items.map((item, i) => (
                                            <div key={i} className="py-2.5 flex justify-between items-center group">
                                                <div>
                                                    <p className="text-xs font-extrabold text-gray-800 dark:text-gray-100 leading-none">{item.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-tight">Qty: {item.qty}</p>
                                                </div>
                                                <p className="text-xs font-black text-gray-900 dark:text-white">{item.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-3 border-t border-gray-50 dark:border-white/5 flex justify-between items-center">
                                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">Total Amount</p>
                                        <p className="text-sm font-black text-[#0c831f]">₹436.00</p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-2.5 flex items-center gap-2">
                                        <Info size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                        <p className="text-[9px] font-bold text-blue-700 dark:text-blue-300">{orderData.paymentMode}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="lg:col-span-4 space-y-4 md:space-y-5">
                            {/* Rider Card */}
                            <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-white/10 p-4 md:p-5 shadow-sm space-y-4">
                                <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-50 dark:border-white/5 pb-3">
                                    <Bike size={14} className="text-[#0c831f]" /> Delivery Partner
                                </h3>
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl flex items-center justify-center relative shrink-0">
                                        <User size={24} className="text-gray-400 dark:text-gray-500" />
                                        <div className="absolute bottom-[-2px] right-[-2px] bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-black flex items-center justify-center">
                                            <CheckCircle2 size={10} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{orderData.rider.name}</h4>
                                            <div className="flex items-center gap-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                                                <Star size={10} className="fill-amber-500" />
                                                {orderData.rider.rating}
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">{orderData.rider.trips} trips completed</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-2.5">
                                    <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1">Vehicle</p>
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{orderData.rider.vehicle}</p>
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">{orderData.rider.vehicleNo}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <button className="py-2.5 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-gray-100 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-gray-100 dark:border-white/10 active:scale-95">
                                        <Phone size={12} /> Call
                                    </button>
                                    <button className="py-2.5 bg-[#0c831f] text-white rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-[#0a6b19] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                                        Chat
                                    </button>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-white/5 dark:to-blue-950/10 rounded-xl border border-gray-100 dark:border-white/10 p-4 md:p-5 space-y-4">
                                <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-3">
                                    <MapPin size={14} className="text-blue-500" /> Delivery Location
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tight">Customer</p>
                                        <p className="text-xs font-extrabold text-gray-900 dark:text-white mt-0.5">{orderData.customer}</p>
                                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">{orderData.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tight">Address</p>
                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mt-0.5 leading-tight">{orderData.address}</p>
                                    </div>
                                    <div className="pt-2 flex flex-wrap gap-2">
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-[#0c831f] bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-100 dark:border-green-900/30">
                                            <Clock size={10} /> CONTACTLESS
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">
                                            <CheckCircle2 size={10} /> VERIFIED
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-16 md:py-24 flex flex-col items-center justify-center text-center opacity-30 grayscale max-w-sm mx-auto">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                            <Search size={28} className="text-gray-300 dark:text-gray-600" />
                        </div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Enter Tracking ID</h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-2 leading-relaxed px-4">Search an active order to view real-time delivery progress, rider location, and live updates.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;
