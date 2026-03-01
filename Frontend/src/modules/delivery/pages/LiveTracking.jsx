import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import polylineUtil from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.marker.slideto';
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
import { getDeliveryDetail, updateDeliveryStatus, getRouteDirections } from '../services/deliveryService';
import { toast } from 'react-toastify';
import useLocationTracking from '../hooks/useLocationTracking';

// Asset URLs using Vite-friendly resolution
const bikeImgUrl = new URL('../../../assets/delivery-bike.png', import.meta.url).href;
const storeImgUrl = new URL('../../../assets/store.png', import.meta.url).href;
const houseImgUrl = new URL('../../../assets/house.png', import.meta.url).href;


// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom component to handle map centering and interaction
const MapController = ({ center, isFOLLOWING, setIsFOLLOWING }) => {
    const map = useMap();

    // Handle auto-centering
    useEffect(() => {
        if (center && isFOLLOWING) {
            map.setView(center, map.getZoom(), { animate: true });
        }
    }, [center, isFOLLOWING, map]);

    // Handle user interaction detection
    useMapEvents({
        movestart: (e) => {
            // Only disable following if the movement was caused by user (not by setView)
            if (e.target._animateToCenter) return; // Ignore internal animations
            // Note: Leaflet doesn't always provide an easy 'originalEvent' for movestart
            // but we can check if it's currently following
        },
        dragstart: () => setIsFOLLOWING(false),
        zoomstart: () => setIsFOLLOWING(false),
        touchmove: () => setIsFOLLOWING(false)
    });

    return null;
};



// Helper function to get distance between two coords in meters
const getDistance = (pos1, pos2) => {
    if (!pos1 || !pos2) return 0;

    const lat1 = Number(pos1[0]);
    const lng1 = Number(pos1[1]);
    const lat2 = Number(pos2[0]);
    const lng2 = Number(pos2[1]);

    const R = 6371e3;
    const f1 = lat1 * Math.PI / 180;
    const f2 = lat2 * Math.PI / 180;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(f1) * Math.cos(f2) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.abs(R * c);
};

const LiveTracking = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token, profile, fetchProfile } = useDeliveryStore();
    const [delivery, setDelivery] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [trimmedRoute, setTrimmedRoute] = useState([]);
    const [isFOLLOWING, setIsFOLLOWING] = useState(true);
    const markerRef = React.useRef(null);


    // Memoize custom icons to ensure they work with imported assets correctly
    const bikeIcon = useMemo(() => new L.divIcon({
        html: `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; position: relative;">
                 <span style="position: absolute; top: 0; right: 0; display: flex; height: 16px; width: 16px; z-index: 10;">
                   <span style="animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 50%; background-color: #bef264; opacity: 0.75;"></span>
                   <span style="position: relative; display: inline-flex; border-radius: 50%; height: 16px; width: 16px; background-color: #84cc16; border: 2px solid white;"></span>
                 </span>
                 <img src="${bikeImgUrl}" style="width: 100%; height: 100%; object-fit: contain;" />
               </div>`,
        className: '',
        iconSize: [50, 50],
        iconAnchor: [25, 25],
        popupAnchor: [0, -25]
    }), []);

    const storeIcon = useMemo(() => L.icon({
        iconUrl: storeImgUrl,
        iconSize: [45, 45],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
    }), []);

    const homeIcon = useMemo(() => L.icon({
        iconUrl: houseImgUrl,
        iconSize: [45, 45],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
    }), []);


    // Track location when viewing an active order
    useLocationTracking(token, delivery?.status !== 'delivered' && delivery?.status !== undefined, delivery?.order?._id);

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
                await fetchProfile(); // Ensure profile is synced before returning to dash
                navigate('/delivery/dashboard');
                return;
            }

            const updated = await updateDeliveryStatus(token, id, nextStatus);
            setDelivery(prev => ({ ...prev, status: updated.status }));
            toast.success(`Status updated to ${nextStatus.replace('_', ' ')}`);

            if (nextStatus === 'delivered') {
                fetchProfile(); // Refresh profile silently so the background state is Free
            }
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

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.slideTo(partnerPos, {
                duration: 1200,
                keepAtCenter: false
            });
        }
    }, [partnerPos[0], partnerPos[1]]);

    useEffect(() => {
        const fetchRoute = async () => {
            // Only fetch route if we have required positions
            if (!pickupPos || !deliveryPos || !partnerPos) return;

            const destination = delivery?.status === 'assigned' ? pickupPos : deliveryPos;

            try {
                const response = await getRouteDirections(token, partnerPos, destination);
                if (response.routes && response.routes.length > 0) {
                    const encodedPolyline = response.routes[0].overview_polyline.points;
                    // decode into [lat, lng]
                    const decodedCoords = polylineUtil.decode(encodedPolyline);
                    setRouteCoordinates(decodedCoords);
                }
            } catch (error) {
                console.error("Failed to fetch Google Maps Route directly from backend", error);
                // Fallback to straight line if API fails
                setRouteCoordinates([partnerPos, destination]);
            }
        }

        fetchRoute();
        // optionally, you might only want this to run occasionally or just once when status changes.
        // running it continuously wastes API credits.
    }, [delivery?.status, pickupPos[0], pickupPos[1], deliveryPos[0], deliveryPos[1]]); // Intentionally leaving partnerPos out so we don't spam Google Maps API as the driver moves.

    // Dynamically trim the polyline as the driver moves towards the destination
    useEffect(() => {
        if (!routeCoordinates || routeCoordinates.length === 0) {
            setTrimmedRoute([]);
            return;
        }

        const destination = routeCoordinates[routeCoordinates.length - 1];

        // Hide polyline completely if driver is very close to destination (e.g. < 150 meters)
        // 150m is a safe radius because Google Maps often ends the path on the road outside the property
        if (getDistance(partnerPos, destination) < 150) {
            setTrimmedRoute([]);
            return;
        }

        let minDistance = Infinity;
        let closestIndex = 0;

        routeCoordinates.forEach((point, index) => {
            const dist = getDistance(partnerPos, point);
            if (dist < minDistance) {
                minDistance = dist;
                closestIndex = index;
            }
        });

        // Slice the array to only keep the path forward from the closest coordinate to the driver
        setTrimmedRoute([partnerPos, ...routeCoordinates.slice(closestIndex)]);
    }, [partnerPos[0], partnerPos[1], routeCoordinates]);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-lime-500" size={48} />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 w-full h-full z-[100] bg-slate-50">
            {/* Map Background */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={partnerPos}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                >
                    <MapController
                        center={partnerPos}
                        isFOLLOWING={isFOLLOWING}
                        setIsFOLLOWING={setIsFOLLOWING}
                    />

                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; OpenStreetMap'
                    />
                    <Marker ref={markerRef} position={partnerPos} icon={bikeIcon}>
                        <Popup>Rider is here</Popup>
                    </Marker>

                    {/* Show Store Marker only if status is assigned or pending */}
                    {(delivery.status === 'assigned' || delivery.status === 'pending') && (
                        <Marker position={pickupPos} icon={storeIcon}>
                            <Popup>Pickup: {delivery.order?.branchId?.name || 'Vendor Store'}</Popup>
                        </Marker>
                    )}

                    {/* Show Home Marker only if status is picked_up or delivered */}
                    {(delivery.status === 'picked_up' || delivery.status === 'delivered') && (
                        <Marker position={deliveryPos} icon={homeIcon}>
                            <Popup>Delivery: {delivery.order?.user?.name || 'Customer'}</Popup>
                        </Marker>
                    )}

                    {trimmedRoute.length > 0 && (
                        <>
                            {/* Outer dark stroke for modern map look */}
                            <Polyline
                                positions={trimmedRoute}
                                color="#0f172a"
                                weight={7}
                                opacity={0.6}
                                lineCap="round"
                                lineJoin="round"
                            />
                            {/* Inner bright stroke */}
                            <Polyline
                                positions={trimmedRoute}
                                color="#3b82f6"
                                weight={4}
                                opacity={1}
                                lineCap="round"
                                lineJoin="round"
                            />
                        </>
                    )}
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
                <button
                    onClick={() => {
                        setIsFOLLOWING(true);
                        toast.info("Map centered on you");
                    }}
                    className={`p-3 rounded-2xl shadow-xl border transition-all ${isFOLLOWING ? 'bg-lime-500 text-white border-lime-600' : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800'}`}
                >
                    <Navigation size={24} className={isFOLLOWING ? 'fill-current' : ''} />
                </button>
            </div>


            {/* Floating Order Info Bottom Sheet */}
            <div className="absolute bottom-0 left-0 right-0 z-[1000] overflow-hidden">
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    className="bg-white dark:bg-zinc-900 rounded-t-[2rem] shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.2)] border-t border-slate-100 dark:border-zinc-800 w-full max-w-2xl mx-auto"
                >
                    {/* Drag Handle */}
                    <div
                        className="w-full pt-4 pb-2 flex justify-center cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full" />
                    </div>

                    <div className="px-6 pb-6">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-zinc-700">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${delivery.order?._id || 'Felix'}`} className="w-full h-full object-cover" alt="avatar" />
                                </div>
                                <div>
                                    <h4 className="font-black text-lg text-slate-800 dark:text-white leading-tight">#{delivery.order?.orderId || 'N/A'}</h4>
                                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                        {delivery.status === 'delivered' ? 'Completed' : 'Active Drop'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                                    <MessageCircle size={18} />
                                </button>
                                <a href={`tel:${delivery.order?.user?.phone}`} className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors">
                                    <Phone size={18} />
                                </a>
                            </div>
                        </div>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                                        {/* Status Timeline */}
                                        <div className="flex justify-between items-center mb-6 px-2 mt-2">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${delivery.status === 'assigned' || delivery.status === 'picked_up' || delivery.status === 'delivered' ? 'bg-lime-500 text-white shadow-lg shadow-lime-500/30' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'}`}>
                                                    <Package size={14} />
                                                </div>
                                            </div>
                                            <div className={`flex-1 h-[2px] mx-2 transition-colors ${delivery.status === 'picked_up' || delivery.status === 'delivered' ? 'bg-lime-500' : 'bg-slate-100 dark:bg-zinc-800'}`}></div>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${delivery.status === 'picked_up' || delivery.status === 'delivered' ? 'bg-lime-500 text-white shadow-lg shadow-lime-500/30' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'}`}>
                                                    <Flag size={14} />
                                                </div>
                                            </div>
                                            <div className={`flex-1 h-[2px] mx-2 transition-colors ${delivery.status === 'delivered' ? 'bg-lime-500' : 'bg-slate-100 dark:bg-zinc-800'}`}></div>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${delivery.status === 'delivered' ? 'bg-lime-500 text-white shadow-lg shadow-lime-500/30' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'}`}>
                                                    <CheckCircle2 size={14} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-2 w-2 h-2 rounded-full ${delivery.status === 'picked_up' || delivery.status === 'delivered' ? 'bg-slate-300' : 'bg-lime-500'}`}></div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Store Pickup</p>
                                                    <p className={`text-sm font-bold text-slate-800 dark:text-slate-200 ${delivery.status === 'picked_up' || delivery.status === 'delivered' ? 'text-slate-400 line-through' : ''}`}>
                                                        {delivery.order?.branchId?.name || 'Vendor Store'}, {delivery.order?.branchId?.address?.street || 'Indore'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-2 w-2 h-2 rounded-full ${delivery.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Customer Delivery</p>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                        {delivery.order?.user?.name || 'Customer'}, {delivery.order?.shippingAddress?.street}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={handleAction}
                            disabled={actionLoading}
                            className={`w-full py-4 mt-2 rounded-[1.25rem] text-white font-black tracking-widest uppercase shadow-xl transition-all flex items-center justify-center gap-3 ${delivery.status === 'delivered'
                                ? 'bg-emerald-500 shadow-emerald-500/30'
                                : 'bg-gradient-to-r from-lime-500 to-lime-600 shadow-lime-500/30 active:scale-[0.98]'
                                }`}
                        >
                            {actionLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                            {delivery.status === 'assigned' && 'Confirm Pickup'}
                            {delivery.status === 'picked_up' && 'Mark Delivered'}
                            {delivery.status === 'delivered' && 'Back to Dashboard'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LiveTracking;
