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
    CheckCircle2,
    Loader2,
    MapPin,
    Package,
    Flag,
    AlertCircle,
    Truck,
    ArrowRight
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

    useEffect(() => {
        if (center && isFOLLOWING) {
            map.setView(center, map.getZoom(), { animate: true });
        }
    }, [center, isFOLLOWING, map]);

    useMapEvents({
        movestart: (e) => {
            if (e.target._animateToCenter) return;
        },
        dragstart: () => setIsFOLLOWING(false),
        zoomstart: () => setIsFOLLOWING(false),
        touchmove: () => setIsFOLLOWING(false)
    });

    return null;
};

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
    const [run, setRun] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true); // Default open for multi-stop
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [trimmedRoute, setTrimmedRoute] = useState([]);
    const [isFOLLOWING, setIsFOLLOWING] = useState(true);
    const markerRef = React.useRef(null);
    const [otpInput, setOtpInput] = useState('');
    const [showOtpFor, setShowOtpFor] = useState(null); // Which stopOrderId is asking for OTP

    // Memoize custom icons
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
    useLocationTracking(token, run?.status !== 'completed' && run?.status !== undefined, run?._id);

    const fetchDetail = async () => {
        if (!token || !id) return;
        try {
            const data = await getDeliveryDetail(token, id);
            setRun(data);

            // Auto close OTP modal if there's no active stop out for delivery
            if (!data.orders.some(s => s.status === 'out_for_delivery')) {
                setShowOtpFor(null);
                setOtpInput('');
            }
        } catch (error) {
            console.error('Fetch delivery run detail failed:', error);
            toast.error('Failed to load batch details');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
        // eslint-disable-next-line
    }, [id, token]);

    // Handle Overall Run Start
    const handleStartRun = async () => {
        setActionLoading(true);
        try {
            await updateDeliveryStatus(token, id, 'in_progress');
            toast.success(`Run Started! Head to the store.`);
            fetchDetail();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to start run');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle Overall Run Complete
    const handleCompleteRun = async () => {
        setActionLoading(true);
        try {
            await updateDeliveryStatus(token, id, 'completed');
            toast.success(`Run Completed! Earnings added.`);
            await fetchProfile();
            navigate('/delivery/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete run');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle Individual Stop Action
    const handleStopAction = async (stopOrderId, stopStatus, otp = '') => {
        setActionLoading(true);
        try {
            await updateDeliveryStatus(token, id, run.status, stopOrderId, stopStatus, otp);
            toast.success(`Stop marked as ${stopStatus.replace('_', ' ')}`);
            setShowOtpFor(null);
            setOtpInput('');
            fetchDetail();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update stop');
        } finally {
            setActionLoading(false);
        }
    };

    const partnerPos = profile?.currentLocation?.coordinates
        ? [profile.currentLocation.coordinates[1], profile.currentLocation.coordinates[0]]
        : [22.7196, 75.8577];

    // Determine current destination
    const pickupPos = run?.branchId?.address?.location?.coordinates
        ? [run.branchId.address.location.coordinates[1], run.branchId.address.location.coordinates[0]]
        : [22.7250, 75.8650];

    const currentStop = run?.orders?.find(s => s.status === 'pending' || s.status === 'out_for_delivery');
    const deliveryPos = currentStop?.order?.shippingAddress?.location?.coordinates
        ? [currentStop.order.shippingAddress.location.coordinates[1], currentStop.order.shippingAddress.location.coordinates[0]]
        : null;

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
            if (!pickupPos || !partnerPos) return;
            if (partnerPos[0] === 0 || partnerPos[1] === 0) return;

            // If run is just assigned, destination is the store.
            // If in progress, destination is the next customer stop.
            let destination = pickupPos;
            if (run?.status === 'in_progress' && deliveryPos) {
                destination = deliveryPos;
            }

            if (!destination || (destination[0] === 0 && destination[1] === 0)) return;

            try {
                const response = await getRouteDirections(token, partnerPos, destination);
                if (response.routes && response.routes.length > 0) {
                    const encodedPolyline = response.routes[0].overview_polyline.points;
                    const decodedCoords = polylineUtil.decode(encodedPolyline);
                    setRouteCoordinates(decodedCoords);
                }
            } catch (error) {
                setRouteCoordinates(prev => prev.length > 0 ? prev : [partnerPos, destination]);
            }
        }

        fetchRoute();
        // eslint-disable-next-line
    }, [run?.status, partnerPos[0], partnerPos[1], pickupPos[0], pickupPos[1], deliveryPos?.[0], deliveryPos?.[1]]);

    useEffect(() => {
        if (!routeCoordinates || routeCoordinates.length === 0) {
            setTrimmedRoute([]);
            return;
        }

        const destination = routeCoordinates[routeCoordinates.length - 1];

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

        setTrimmedRoute([partnerPos, ...routeCoordinates.slice(closestIndex)]);
    }, [partnerPos[0], partnerPos[1], routeCoordinates]);

    if (isLoading || !run) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-[#028A0F]" size={48} />
            </div>
        );
    }

    const allStopsCompleted = run.orders.every(o => o.status === 'delivered' || o.status === 'failed');

    return (
        <div className="fixed inset-0 w-full h-full z-[100] bg-slate-50">
            {/* Map */}
            <div className={`absolute inset-0 z-0 transition-all duration-300 ${isExpanded ? 'h-[40vh]' : 'h-full'}`}>
                <MapContainer center={partnerPos} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    <MapController center={partnerPos} isFOLLOWING={isFOLLOWING} setIsFOLLOWING={setIsFOLLOWING} />
                    <TileLayer
                        url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                        attribution='&copy; Google Maps'
                    />
                    <Marker ref={markerRef} position={partnerPos} icon={bikeIcon}>
                        <Popup>You are here</Popup>
                    </Marker>

                    {run.status === 'assigned' && (
                        <Marker position={pickupPos} icon={storeIcon}>
                            <Popup>Pickup: Store</Popup>
                        </Marker>
                    )}

                    {(run.status === 'in_progress' && deliveryPos) && (
                        <Marker position={deliveryPos} icon={homeIcon}>
                            <Popup>Next Delivery: {currentStop?.order?.user?.name}</Popup>
                        </Marker>
                    )}

                    {trimmedRoute.length > 0 && (
                        <>
                            <Polyline positions={trimmedRoute} color="#000" weight={10} opacity={0.1} lineCap="round" lineJoin="round" />
                            <Polyline positions={trimmedRoute} color="#028A0F" weight={6} opacity={0.8} lineCap="round" lineJoin="round" />
                            <Polyline positions={trimmedRoute} color="#02880d" weight={2} opacity={1} lineCap="round" lineJoin="round" />
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
                    <div className="w-2 h-2 rounded-full bg-[#028A0F] animate-pulse shadow-[0_0_8px_rgba(2,138,15,0.8)]"></div>
                    <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-800 dark:text-zinc-100">Live Batch View</span>
                </div>
                <button
                    onClick={() => setIsFOLLOWING(true)}
                    className={`p-3 rounded-2xl shadow-xl border transition-all ${isFOLLOWING ? 'bg-[#028A0F] text-white border-[#028A0F]/20' : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800'}`}
                >
                    <Navigation size={24} className={isFOLLOWING ? 'fill-current' : ''} />
                </button>
            </div>

            {/* Floating Batch Info Bottom Sheet */}
            <div className={`absolute bottom-0 left-0 right-0 z-[100] transition-all duration-300 ${isExpanded ? 'h-[65vh] top-[35vh]' : 'h-auto'}`}>
                <motion.div
                    className="bg-white dark:bg-zinc-900 rounded-t-[2rem] shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.2)] border-t border-slate-100 dark:border-zinc-800 w-full max-w-2xl mx-auto h-full flex flex-col"
                >
                    {/* Drag Handle */}
                    <div
                        className="w-full pt-4 pb-2 flex justify-center cursor-pointer flex-shrink-0"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="w-12 h-1 bg-slate-200 dark:bg-zinc-800 rounded-full" />
                    </div>

                    <div className="px-6 pb-2 pt-2 flex-shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="font-black text-xl text-slate-900 dark:text-zinc-50 tracking-tight leading-none mb-1.5 flex items-center gap-2">
                                    <Package size={20} className="text-[#028A0F]" /> {run.runId}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${run.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-green-100 text-[#028A0F]'}`}>
                                        {run.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">•</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{run.orders.length} Stops Total</span>
                                </div>
                            </div>

                            {/* Master Controls */}
                            {run.status === 'assigned' && (
                                <button
                                    onClick={handleStartRun}
                                    disabled={actionLoading}
                                    className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95 transition-transform"
                                >
                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Truck size={16} />}
                                    Start Run
                                </button>
                            )}

                            {run.status === 'in_progress' && allStopsCompleted && (
                                <button
                                    onClick={handleCompleteRun}
                                    disabled={actionLoading}
                                    className="bg-emerald-500 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center gap-2 active:scale-95 transition-transform"
                                >
                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    Complete Run
                                </button>
                            )}

                        </div>
                    </div>

                    {/* Expandable Stops List */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar"
                            >
                                <div className="space-y-4 pt-2">
                                    {run.orders.map((stop, index) => {
                                        const isCurrentLogically = run.status === 'in_progress' && !run.orders.slice(0, index).some(s => s.status === 'pending' || s.status === 'out_for_delivery') && (stop.status === 'pending' || stop.status === 'out_for_delivery');
                                        const isCompleted = stop.status === 'delivered';
                                        const isFailed = stop.status === 'failed';

                                        return (
                                            <div key={stop._id} className={`p-4 rounded-2xl border transition-all duration-300 relative ${isCurrentLogically ? 'bg-green-50/50 dark:bg-[#028A0F]/5 border-[#028A0F]/30 shadow-sm' :
                                                    isCompleted ? 'bg-slate-50 dark:bg-zinc-800/20 border-slate-100 dark:border-zinc-800 opacity-60' :
                                                        'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800'
                                                }`}>
                                                {isCurrentLogically && (
                                                    <div className="absolute top-0 left-4 -translate-y-1/2 bg-[#028A0F] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow">
                                                        Next Stop
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h5 className={`font-bold text-sm ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-zinc-100'}`}>
                                                            {stop.order?.user?.name || 'Customer'}
                                                        </h5>
                                                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                                            <MapPin size={10} />
                                                            <span className="truncate max-w-[200px]" style={{ display: 'inline-block' }}>{stop.order?.shippingAddress?.street}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-black text-slate-900 dark:text-zinc-100 text-sm">₹{stop.order?.totalAmount}</div>
                                                        <div className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${isCompleted ? 'text-emerald-500' :
                                                                isFailed ? 'text-red-500' :
                                                                    stop.status === 'out_for_delivery' ? 'text-blue-500 animate-pulse' :
                                                                        'text-slate-400'
                                                            }`}>
                                                            {stop.status === 'pending' ? 'Pending' : stop.status.replace('_', ' ')}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons for the active stop */}
                                                {isCurrentLogically && !isCompleted && !isFailed && (
                                                    <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800 border-dashed mt-2">
                                                        {showOtpFor === stop.order?._id ? (
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    maxLength={6}
                                                                    placeholder="Enter Customer OTP"
                                                                    className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 text-sm font-bold text-center tracking-[0.3em]"
                                                                    value={otpInput}
                                                                    onChange={e => setOtpInput(e.target.value)}
                                                                />
                                                                <button
                                                                    onClick={() => handleStopAction(stop.order._id, 'delivered', otpInput)}
                                                                    disabled={otpInput.length < 4 || actionLoading}
                                                                    className="bg-[#028A0F] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md disabled:opacity-50"
                                                                >
                                                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Deliver'}
                                                                </button>
                                                            </div>
                                                        ) : stop.status === 'pending' ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleStopAction(stop.order._id, 'out_for_delivery')}
                                                                    disabled={actionLoading}
                                                                    className="flex-1 bg-[#028A0F]/10 text-[#028A0F] py-2 rounded-xl font-bold text-xs hover:bg-[#028A0F]/20 flex justify-center items-center gap-2"
                                                                >
                                                                    <ArrowRight size={14} /> Head Here
                                                                </button>
                                                                <a href={`tel:${stop.order?.user?.phone}`} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 bg-white">
                                                                    <Phone size={14} />
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => setShowOtpFor(stop.order._id)}
                                                                    className="flex-1 bg-[#028A0F] text-white py-2 rounded-xl font-bold text-xs shadow-md shadow-[#028A0F]/20 flex justify-center items-center"
                                                                >
                                                                    Enter OTP
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm("Mark as Failed / Customer Unavailable?")) {
                                                                            handleStopAction(stop.order._id, 'failed');
                                                                        }
                                                                    }}
                                                                    className="px-3 bg-red-50 text-red-600 border border-red-100 py-2 rounded-xl font-bold text-xs flex justify-center items-center"
                                                                >
                                                                    Fail
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default LiveTracking;
