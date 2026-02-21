import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
    Navigation,
    Phone,
    MessageCircle,
    ChevronLeft,
    Maximize2,
    MapPin,
    Package,
    Flag,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../user/context/AuthContext';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom component to handle map centering
const ChangeView = ({ center }) => {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
};

const LiveTracking = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token } = useAuth();
    const [status, setStatus] = useState('assigned'); // assigned -> picked -> delivered
    const [loading, setLoading] = useState(false);

    // Mock coordinates - in real app would fetch based on id
    const partnerPos = [22.7196, 75.8577]; // Indore
    const pickupPos = [22.7250, 75.8650];
    const deliveryPos = [22.7300, 75.8750];

    const polyline = [partnerPos, pickupPos, deliveryPos];

    const handleAction = () => {
        setLoading(true);
        setTimeout(() => {
            if (status === 'assigned') setStatus('picked_up');
            else if (status === 'picked_up') setStatus('delivered');
            else navigate('/delivery/dashboard');
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] relative -m-4 md:-m-8">
            {/* Map Background */}
            <div className="absolute inset-0 z-0">
                <MapContainer center={partnerPos} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <ChangeView center={status === 'delivered' ? deliveryPos : (status === 'picked_up' ? deliveryPos : pickupPos)} />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                    />
                    <Marker position={partnerPos}>
                        <Popup>Rider is here</Popup>
                    </Marker>
                    <Marker position={pickupPos}>
                        <Popup>Pickup: Nature Fresh Mart</Popup>
                    </Marker>
                    <Marker position={deliveryPos}>
                        <Popup>Delivery: Customer Address</Popup>
                    </Marker>
                    <Polyline positions={polyline} color="#ec4899" weight={6} opacity={0.6} />
                </MapContainer>
            </div>

            {/* Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <button
                    onClick={() => navigate('/delivery/dashboard')}
                    className="p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="px-6 py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-black text-sm uppercase tracking-wider">Live Tracking</span>
                </div>
                <button className="p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800">
                    <Maximize2 size={24} />
                </button>
            </div>

            {/* Floating Order Info Card */}
            <div className="absolute bottom-6 left-4 right-4 z-10">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-zinc-800 max-w-xl mx-auto"
                >
                    {/* Status Timeline */}
                    <div className="flex justify-between items-center mb-6 px-2">
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${status === 'assigned' || status === 'picked_up' || status === 'delivered' ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'}`}>
                                <Package size={14} />
                            </div>
                            <span className={`text-[10px] font-bold ${status === 'assigned' ? 'text-pink-600' : 'text-slate-400'}`}>Assigned</span>
                        </div>
                        <div className={`flex-1 h-[2px] mx-2 mb-4 transition-colors ${status === 'picked_up' || status === 'delivered' ? 'bg-pink-500' : 'bg-slate-100 dark:bg-zinc-800'}`}></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${status === 'picked_up' || status === 'delivered' ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'}`}>
                                <Flag size={14} />
                            </div>
                            <span className={`text-[10px] font-bold ${status === 'picked_up' ? 'text-pink-600' : 'text-slate-400'}`}>Picked</span>
                        </div>
                        <div className={`flex-1 h-[2px] mx-2 mb-4 transition-colors ${status === 'delivered' ? 'bg-pink-500' : 'bg-slate-100 dark:bg-zinc-800'}`}></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${status === 'delivered' ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'}`}>
                                <CheckCircle2 size={14} />
                            </div>
                            <span className={`text-[10px] font-bold ${status === 'delivered' ? 'text-pink-600' : 'text-slate-400'}`}>Delivered</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-slate-100 dark:border-zinc-800">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id || 'Felix'}`} className="w-full h-full object-cover" alt="avatar" />
                            </div>
                            <div>
                                <h4 className="font-black text-xl">Order #{id?.substring(0, 8).toUpperCase() || 'SIM-9021'}</h4>
                                <p className="text-slate-500 text-sm font-medium">
                                    {status === 'delivered' ? 'Order delivered successfully!' : 'Estimated arrival in 12 mins'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                                <MessageCircle size={22} />
                            </button>
                            <button className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-500/10 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors">
                                <Phone size={22} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-4">
                            <div className={`mt-2 w-2 h-2 rounded-full ${status === 'picked_up' || status === 'delivered' ? 'bg-slate-300' : 'bg-pink-500'}`}></div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Store Pickup</p>
                                <p className={`text-sm font-bold ${status === 'picked_up' || status === 'delivered' ? 'text-slate-400 line-through' : ''}`}>Nature Fresh Mart, Vijay Nagar</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className={`mt-2 w-2 h-2 rounded-full ${status === 'delivered' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Customer Delivery</p>
                                <p className="text-sm font-bold">Amit Sharma, Sapphire Towers</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleAction}
                        disabled={loading}
                        className={`w-full py-5 rounded-[1.5rem] text-white font-black tracking-widest uppercase shadow-xl transition-all flex items-center justify-center gap-3 ${status === 'delivered'
                                ? 'bg-emerald-500 shadow-emerald-500/30'
                                : 'bg-gradient-to-r from-pink-500 to-red-600 shadow-pink-500/30 active:scale-[0.98]'
                            }`}
                    >
                        {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {status === 'assigned' && 'Confirm Pickup'}
                        {status === 'picked_up' && 'Mark Delivered'}
                        {status === 'delivered' && 'Back to Dashboard'}
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default LiveTracking;
