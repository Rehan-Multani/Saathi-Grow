import React, { useState, useEffect, useMemo } from 'react';
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
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useDeliveryStore from '../store/deliveryStore';
import { getDeliveryDetail, updateDeliveryStatus } from '../services/deliveryService';
import { toast } from 'react-toastify';

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
    if (center) map.setView(center, map.getZoom());
    return null;
};

const LiveTracking = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token, profile } = useDeliveryStore();
    const [delivery, setDelivery] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!token || !id) return;
            try {
                const data = await getDeliveryDetail(token, id);
                setDelivery(data);
            } catch (error) {
                console.error('Fetch delivery detail failed:', error);
                toast.error('Failed to load tracking details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [id, token]);

    const handleAction = async () => {
        setActionLoading(true);
        try {
            let nextStatus = '';
            if (delivery.status === 'assigned') nextStatus = 'picked_up';
            else if (delivery.status === 'picked_up') nextStatus = 'delivered';
            else {
                navigate('/delivery/dashboard');
                return;
            }

            const updated = await updateDeliveryStatus(token, id, nextStatus);
            setDelivery(prev => ({ ...prev, status: updated.status }));
            toast.success(`Status updated to ${nextStatus.replace('_', ' ')}`);
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const partnerPos = profile?.currentLocation?.coordinates
        ? [profile.currentLocation.coordinates[1], profile.currentLocation.coordinates[0]]
        : [22.7196, 75.8577];

    const pickupPos = delivery?.order?.branchId?.address?.location?.coordinates
        ? [delivery.order.branchId.address.location.coordinates[1], delivery.order.branchId.address.location.coordinates[0]]
        : [22.7250, 75.8650];

    const deliveryPos = delivery?.order?.shippingAddress?.location?.coordinates
        ? [delivery.order.shippingAddress.location.coordinates[1], delivery.order.shippingAddress.location.coordinates[0]]
        : [22.7300, 75.8750];

    const polyline = [partnerPos, pickupPos, deliveryPos];

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-lime-500" size={48} />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] relative -m-4 md:-m-8">
            {/* Map Background */}
            <div className="absolute inset-0 z-0">
                <MapContainer center={partnerPos} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <ChangeView center={delivery.status === 'delivered' ? deliveryPos : (delivery.status === 'picked_up' ? deliveryPos : pickupPos)} />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                    />
                    <Marker position={partnerPos}>
                        <Popup>You are here</Popup>
                    </Marker>
                    <Marker position={pickupPos}>
                        <Popup>Pickup: {delivery.order?.branchId?.name || 'Vendor Store'}</Popup>
                    </Marker>
                    <Marker position={deliveryPos}>
                        <Popup>Delivery: {delivery.order?.user?.name || 'Customer'}</Popup>
                    </Marker>
                    <Polyline positions={polyline} color="#0c831f" weight={6} opacity={0.6} />
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
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${delivery.status === 'assigned' || delivery.status === 'picked_up' || delivery.status === 'delivered' ? 'bg-lime-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'}`}>
                                <Package size={14} />
                            </div>
                            <span className={`text-[10px] font-bold ${delivery.status === 'assigned' ? 'text-lime-600' : 'text-slate-400'}`}>Assigned</span>
                        </div>
                        <div className={`flex-1 h-[2px] mx-2 mb-4 transition-colors ${delivery.status === 'picked_up' || delivery.status === 'delivered' ? 'bg-lime-500' : 'bg-slate-100 dark:bg-zinc-800'}`}></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${delivery.status === 'picked_up' || delivery.status === 'delivered' ? 'bg-lime-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'}`}>
                                <Flag size={14} />
                            </div>
                            <span className={`text-[10px] font-bold ${delivery.status === 'picked_up' ? 'text-lime-600' : 'text-slate-400'}`}>Picked</span>
                        </div>
                        <div className={`flex-1 h-[2px] mx-2 mb-4 transition-colors ${delivery.status === 'delivered' ? 'bg-lime-500' : 'bg-slate-100 dark:bg-zinc-800'}`}></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${delivery.status === 'delivered' ? 'bg-lime-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'}`}>
                                <CheckCircle2 size={14} />
                            </div>
                            <span className={`text-[10px] font-bold ${delivery.status === 'delivered' ? 'text-lime-600' : 'text-slate-400'}`}>Delivered</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-slate-100 dark:border-zinc-800">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${delivery.order?._id || 'Felix'}`} className="w-full h-full object-cover" alt="avatar" />
                            </div>
                            <div>
                                <h4 className="font-black text-xl">Order #{delivery.order?.orderId || 'N/A'}</h4>
                                <p className="text-slate-500 text-sm font-medium">
                                    {delivery.status === 'delivered' ? 'Order delivered successfully!' : 'Navigate to your destination'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                                <MessageCircle size={22} />
                            </button>
                            <a href={`tel:${delivery.order?.user?.phone}`} className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-500/10 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors">
                                <Phone size={22} />
                            </a>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-4">
                            <div className={`mt-2 w-2 h-2 rounded-full ${delivery.status === 'picked_up' || delivery.status === 'delivered' ? 'bg-slate-300' : 'bg-lime-500'}`}></div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Store Pickup</p>
                                <p className={`text-sm font-bold ${delivery.status === 'picked_up' || delivery.status === 'delivered' ? 'text-slate-400 line-through' : ''}`}>
                                    {delivery.order?.branchId?.name || 'Vendor Store'}, {delivery.order?.branchId?.address?.street || 'Indore'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className={`mt-2 w-2 h-2 rounded-full ${delivery.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Customer Delivery</p>
                                <p className="text-sm font-bold">
                                    {delivery.order?.user?.name || 'Customer'}, {delivery.order?.shippingAddress?.street}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleAction}
                        disabled={actionLoading}
                        className={`w-full py-5 rounded-[1.5rem] text-white font-black tracking-widest uppercase shadow-xl transition-all flex items-center justify-center gap-3 ${delivery.status === 'delivered'
                            ? 'bg-emerald-500 shadow-emerald-500/30'
                            : 'bg-gradient-to-r from-lime-500 to-lime-600 shadow-lime-500/30 active:scale-[0.98]'
                            }`}
                    >
                        {actionLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {delivery.status === 'assigned' && 'Confirm Pickup'}
                        {delivery.status === 'picked_up' && 'Mark Delivered'}
                        {delivery.status === 'delivered' && 'Back to Dashboard'}
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default LiveTracking;
