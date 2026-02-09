import React, { useState } from 'react';
import { Truck, Search, MapPin, Package, Clock, ClipboardList, CheckCircle2, ChevronRight, User, Phone, ArrowLeft, RefreshCcw, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderTracking = () => {
    const navigate = useNavigate();
    const [trackingId, setTrackingId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [orderData, setOrderData] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!trackingId) return;

        setIsSearching(true);
        setTimeout(() => {
            setOrderData({
                id: trackingId.toUpperCase(),
                customer: 'Rahul Sharma',
                phone: '+91 98765 43210',
                address: 'H-302, Green Valley Apartments, New Delhi',
                status: 'Out for delivery',
                eta: '12-15 mins',
                rider: {
                    name: 'Suresh Kumar',
                    rating: '4.8',
                    trips: '1.2k',
                    vehicle: 'Electric Hub (DL 1S AB 1234)'
                },
                items: [
                    { name: 'Aashirvaad Shudh Chakki Atta', qty: '5kg', price: '₹245' },
                    { name: 'Amul Gold Milk', qty: '2 Pkts', price: '₹66' },
                    { name: 'Fortune Biryani Rice', qty: '1kg', price: '₹125' }
                ],
                timeline: [
                    { time: '04:15 PM', label: 'Out for delivery', desc: 'Rider is 1.2km away from your location', active: true, done: true },
                    { time: '03:45 PM', label: 'Picked up', desc: 'Package collected from SaathiGro Hub', active: false, done: true },
                    { time: '03:10 PM', label: 'Packed', desc: 'Verified and sealed by vendor', active: false, done: true },
                    { time: '02:50 PM', label: 'Order confirmed', desc: 'System payment verification success', active: false, done: true }
                ]
            });
            setIsSearching(false);
        }, 600);
    };

    return (
        <div className="min-h-screen bg-white pb-12 overflow-x-hidden">
            {/* Navigation Header */}
            <div className="bg-white border-b border-gray-100 px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-50 transition-shadow">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/vendor/orders')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft size={16} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-gray-900 tracking-tight">Live Tracking</h1>
                        <p className="text-[10px] text-gray-500 font-medium tracking-tight">Monitor active delivery status</p>
                    </div>
                </div>
                <div className="flex-1 max-w-sm relative group">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0c831f] transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Tracking ID (e.g. SG-ORD-5192)"
                                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:border-[#0c831f] outline-none transition-all shadow-sm font-bold uppercase"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                            />
                        </div>
                        <button type="submit" disabled={isSearching} className="px-5 bg-gray-900 text-white rounded-lg text-[10px] font-bold tracking-widest hover:bg-black transition-all shadow-sm flex items-center gap-2">
                            {isSearching ? <RefreshCcw size={12} className="animate-spin" /> : 'TRACK'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
                {orderData ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Main Status Area */}
                        <div className="lg:col-span-8 space-y-5">
                            {/* Status Banner */}
                            <div className="bg-[#0c831f] rounded-2xl p-6 text-white overflow-hidden relative shadow-lg shadow-green-100/50">
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-black uppercase tracking-widest">{orderData.id}</span>
                                            <div className="w-1 h-1 rounded-full bg-white/40" />
                                            <span className="text-[10px] font-bold text-green-100">{orderData.status}</span>
                                        </div>
                                        <h2 className="text-3xl font-black tracking-tight">Arriving in {orderData.eta}</h2>
                                        <p className="text-sm font-bold text-green-100 opacity-90 uppercase tracking-tight">Rider is on the way to the delivery location</p>
                                    </div>
                                    <div className="flex bg-white/10 backdrop-blur-md rounded-xl p-3 items-center gap-4 border border-white/10 shrink-0">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Truck size={22} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-green-100 uppercase leading-none">Status</p>
                                            <p className="text-sm font-black mt-0.5 uppercase">Transit</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white opacity-[0.05] rounded-full blur-3xl pointer-events-none" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Delivery Timeline */}
                                <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-50 pb-3">
                                        <ClipboardList size={14} className="text-[#0c831f]" /> Delivery History
                                    </h3>
                                    <div className="space-y-6 relative ml-2">
                                        {orderData.timeline.map((step, idx) => (
                                            <div key={idx} className="flex gap-4 relative">
                                                <div className="flex flex-col items-center shrink-0">
                                                    <div className={`w-2 h-2 rounded-full z-10 mt-1 ${step.done ? 'bg-[#0c831f] ring-4 ring-green-50' : 'bg-gray-200'}`} />
                                                    {idx !== orderData.timeline.length - 1 && (
                                                        <div className={`w-[2px] h-full absolute top-3 ${step.done ? 'bg-green-100' : 'bg-gray-100'}`} />
                                                    )}
                                                </div>
                                                <div className="pb-1">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className={`text-[11px] font-black ${step.active ? 'text-[#0c831f]' : 'text-gray-900'} uppercase tracking-tight`}>{step.label}</p>
                                                        <span className="text-[9px] font-bold text-gray-400">{step.time}</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 font-medium leading-tight">{step.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Contents */}
                                <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-50 pb-3">
                                        <Package size={14} className="text-blue-500" /> Package Contents
                                    </h3>
                                    <div className="divide-y divide-gray-50">
                                        {orderData.items.map((item, i) => (
                                            <div key={i} className="py-2.5 flex justify-between items-center group">
                                                <div>
                                                    <p className="text-xs font-extrabold text-gray-800 leading-none">{item.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">Quantity: {item.qty}</p>
                                                </div>
                                                <p className="text-xs font-black text-gray-900">{item.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Total Value</p>
                                        <p className="text-sm font-black text-[#0c831f]">₹436.00</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="lg:col-span-4 space-y-5">
                            {/* Rider Card */}
                            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-50 pb-3">
                                    <Navigation size={14} className="text-[#0c831f]" /> Delivery Partner
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center relative">
                                        <User size={24} className="text-gray-400" />
                                        <div className="absolute bottom-[-2px] right-[-2px] bg-green-500 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                                            <CheckCircle2 size={10} className="text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-sm font-extrabold text-gray-900">{orderData.rider.name}</h4>
                                            <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-500 bg-amber-50 px-1 rounded">★ {orderData.rider.rating}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight mt-0.5">{orderData.rider.vehicle}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <button className="py-2.5 bg-gray-50 text-gray-700 rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-100">
                                        <Phone size={12} /> Call
                                    </button>
                                    <button className="py-2.5 bg-[#0c831f] text-white rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm">
                                        Chat
                                    </button>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-5 space-y-4">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-3">
                                    <MapPin size={14} className="text-blue-500" /> Delivery Address
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Customer</p>
                                        <p className="text-xs font-extrabold text-gray-900 mt-0.5">{orderData.customer}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Location</p>
                                        <p className="text-xs font-bold text-gray-600 mt-0.5 leading-tight">{orderData.address}</p>
                                    </div>
                                    <div className="pt-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-[#0c831f] bg-green-100/50 w-fit px-2 py-1 rounded">
                                            <Clock size={10} /> CONTACTLESS DELIVERY ENABLED
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center opacity-30 grayscale max-w-sm mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <RefreshCcw size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Awaiting Tracking ID</h3>
                        <p className="text-[11px] text-gray-500 font-bold mt-2 leading-relaxed">Enter an active order ID to view real-time delivery progress and rider location.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;
