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
import './live-tracking.css';

// Import Asset URLs with Cloudinary fallbacks
import { ASSET_URLS } from '../../../constants/assetUrls';

const bikeImgUrl = ASSET_URLS.bike;
const storeImgUrl = ASSET_URLS.store;
const houseImgUrl = ASSET_URLS.house;


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


    // Memoize custom icons for a premium look
    const bikeIcon = useMemo(() => new L.divIcon({
        html: `<div class="rider-marker-container">
                 <div class="pulse-ring ring-1"></div>
                 <div class="pulse-ring ring-2"></div>
                 <div class="bike-icon-wrapper">
                    <img src="${bikeImgUrl}"
                         onerror="this.onerror=null; this.src='${ASSET_URLS.bikeCloudinary}';"
                         class="bike-img" />
                 </div>
               </div>`,
        className: 'custom-bike-marker',
        iconSize: [60, 60],
        iconAnchor: [30, 30],
        popupAnchor: [0, -30]
    }), []);

    const storeIcon = useMemo(() => L.divIcon({
        html: `<div class="location-marker store-marker">
                <div class="marker-pin">
                    <img src="${storeImgUrl}"
                         onerror="this.onerror=null; this.src='${ASSET_URLS.storeCloudinary}';" />
                </div>
                <div class="marker-shadow"></div>
               </div>`,
        className: 'custom-location-marker',
        iconSize: [50, 50],
        iconAnchor: [25, 45]
    }), []);

    const homeIcon = useMemo(() => L.divIcon({
        html: `<div class="location-marker home-marker">
                <div class="marker-pin">
                    <img src="${houseImgUrl}"
                         onerror="this.onerror=null; this.src='${ASSET_URLS.houseCloudinary}';" />
                </div>
                <div class="marker-shadow"></div>
               </div>`,
        className: 'custom-location-marker',
        iconSize: [50, 50],
        iconAnchor: [25, 45]
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
            // Only fetch route if we have required positions and they are valid
            if (!pickupPos || !deliveryPos || !partnerPos) return;
            if (partnerPos[0] === 0 || partnerPos[1] === 0) return;

            const destination = delivery?.status === 'assigned' ? pickupPos : deliveryPos;
            if (!destination || (destination[0] === 0 && destination[1] === 0)) return;

            try {
                const response = await getRouteDirections(token, partnerPos, destination);
                if (response.routes && response.routes.length > 0) {
                    const encodedPolyline = response.routes[0].overview_polyline.points;
                    const decodedCoords = polylineUtil.decode(encodedPolyline);
                    setRouteCoordinates(decodedCoords);
                    console.log("🛣️ Road route fetched successfully from Google");
                }
            } catch (error) {
                console.error("Failed to fetch Google Maps Route directly from backend", error);
                // Only use straight line if we don't have route coordinates yet
                setRouteCoordinates(prev => prev.length > 0 ? prev : [partnerPos, destination]);
            }
        }

        fetchRoute();
        // Re-run if partner moves from 0,0/default OR if status changes
    }, [delivery?.status, partnerPos[0], partnerPos[1], pickupPos[0], pickupPos[1], deliveryPos[0], deliveryPos[1]]);

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
                        url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
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
                            {/* Outer shadow for path depth */}
                            <Polyline
                                positions={trimmedRoute}
                                color="#000"
                                weight={10}
                                opacity={0.1}
                                lineCap="round"
                                lineJoin="round"
                            />
                            {/* Main Path with glow */}
                            <Polyline
                                positions={trimmedRoute}
                                color="#84cc16"
                                weight={6}
                                opacity={0.8}
                                lineCap="round"
                                lineJoin="round"
                            />
                            {/* Core Path line */}
                            <Polyline
                                positions={trimmedRoute}
                                color="#bef264"
                                weight={2}
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
                <div className="px-6 py-3 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse shadow-[0_0_8px_rgba(132,204,22,0.8)]"></div>
                    <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-800 dark:text-zinc-100">Live Mission</span>
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
                        className="w-full pt-4 pb-2 flex justify-center cursor-pointer group"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="w-12 h-1 bg-slate-200 dark:bg-zinc-800 rounded-full group-hover:bg-slate-300 dark:group-hover:bg-zinc-700 transition-colors" />
                    </div>

                    <div className="px-6 pb-6 pt-2">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-center overflow-hidden border border-slate-200/60 dark:border-zinc-700/50 shadow-inner">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${delivery.order?._id || 'Felix'}`} className="w-full h-full object-cover" alt="avatar" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-lime-500 border-2 border-white dark:border-zinc-900 rounded-lg flex items-center justify-center shadow-lg">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-black text-xl text-slate-900 dark:text-zinc-50 tracking-tight leading-none mb-1.5">#{delivery.order?.orderId || 'N/A'}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${delivery.status === 'delivered' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-lime-100 text-lime-600 dark:bg-lime-500/10 dark:text-lime-400'}`}>
                                            {delivery.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">•</span>
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{delivery.order?.paymentMethod || 'COD'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <button className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all active:scale-90 border border-blue-100/50 dark:border-blue-500/20">
                                    <MessageCircle size={20} />
                                </button>
                                <a href={`tel:${delivery.order?.user?.phone}`} className="w-11 h-11 rounded-2xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-500/20 transition-all active:scale-90 border border-green-100/50 dark:border-green-500/20 shadow-sm">
                                    <Phone size={20} />
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
