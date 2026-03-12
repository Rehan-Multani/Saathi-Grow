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
    ArrowRight,
    RotateCcw,
    X,
    Check
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useDeliveryStore from '../store/deliveryStore';
import { getDeliveryDetail, updateDeliveryStatus, getRouteDirections } from '../services/deliveryService';
import { toast } from 'react-toastify';
import useLocationTracking from '../hooks/useLocationTracking';
import './live-tracking.css';

import { ASSET_URLS } from '../../../constants/assetUrls';

const bikeImgUrl = ASSET_URLS.bike;
const storeImgUrl = ASSET_URLS.store;
const houseImgUrl = ASSET_URLS.house;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapController = ({ center, isFOLLOWING, setIsFOLLOWING }) => {
    const map = useMap();
    useEffect(() => {
        if (center && isFOLLOWING) {
            map.setView(center, map.getZoom(), { animate: true });
        }
    }, [center, isFOLLOWING, map]);

    useMapEvents({
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
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
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
    const [isExpanded, setIsExpanded] = useState(true);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [trimmedRoute, setTrimmedRoute] = useState([]);
    const [isFOLLOWING, setIsFOLLOWING] = useState(true);
    const markerRef = React.useRef(null);
    const [otpInput, setOtpInput] = useState('');
    const [showOtpFor, setShowOtpFor] = useState(null);

    const bikeIcon = useMemo(() => new L.divIcon({
        html: `<div class="rider-marker-container"><div class="pulse-ring ring-1"></div><div class="bike-icon-wrapper"><img src="${bikeImgUrl}" onerror="this.onerror=null; this.src='${ASSET_URLS.bikeCloudinary}';" class="bike-img" /></div></div>`,
        className: 'custom-bike-marker',
        iconSize: [60, 60],
        iconAnchor: [30, 30]
    }), []);

    const storeIcon = useMemo(() => L.divIcon({
        html: `<div class="location-marker store-marker"><div class="marker-pin"><img src="${storeImgUrl}" onerror="this.onerror=null; this.src='${ASSET_URLS.storeCloudinary}';" /></div></div>`,
        className: 'custom-location-marker',
        iconSize: [50, 50],
        iconAnchor: [25, 45]
    }), []);

    const homeIcon = useMemo(() => L.divIcon({
        html: `<div class="location-marker home-marker"><div class="marker-pin"><img src="${houseImgUrl}" onerror="this.onerror=null; this.src='${ASSET_URLS.houseCloudinary}';" /></div></div>`,
        className: 'custom-location-marker',
        iconSize: [50, 50],
        iconAnchor: [25, 45]
    }), []);

    useLocationTracking(token, run?.status !== 'completed' && run?.status !== undefined, run?._id);

    const fetchDetail = async () => {
        if (!token || !id) return;
        try {
            const data = await getDeliveryDetail(token, id);
            setRun(data);
        } catch (error) {
            toast.error('Failed to load mission details');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDetail(); }, [id, token]);

    const handleAction = async (type, stopOrderId = null, stopStatus = null, otp = '') => {
        setActionLoading(true);
        try {
            if (type === 'start') {
                await updateDeliveryStatus(token, id, 'in_progress');
                toast.success('Mission Started!');
            } else if (type === 'complete') {
                await updateDeliveryStatus(token, id, 'completed');
                toast.success('Mission Accomplished!');
                await fetchProfile();
                navigate('/delivery/dashboard');
            } else if (type === 'stop') {
                await updateDeliveryStatus(token, id, run.status, stopOrderId, stopStatus, otp);
                toast.success('Task Updated');
                setShowOtpFor(null);
                setOtpInput('');
            }
            fetchDetail();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setActionLoading(false);
        }
    };

    const partnerLat = profile?.currentLocation?.coordinates?.[1] || 22.7196;
    const partnerLng = profile?.currentLocation?.coordinates?.[0] || 75.8577;

    const partnerPos = useMemo(() => [partnerLat, partnerLng], [partnerLat, partnerLng]);

    // In return runs, the final destination is the Store/Branch. In delivery, it's the start.
    const runDestinationLat = run?.branchId?.location?.coordinates?.[1] || 22.7196;
    const runDestinationLng = run?.branchId?.location?.coordinates?.[0] || 75.8577;

    const runDestinationPos = useMemo(() => [runDestinationLat, runDestinationLng], [runDestinationLat, runDestinationLng]);
    
    // Find next unvisited stop
    const currentStop = run?.orders?.find(s => run.runType === 'return' ? s.status === 'pending' : (s.status === 'pending' || s.status === 'out_for_delivery'));
    const currentStopLat = currentStop?.order?.shippingAddress?.location?.coordinates?.[1] || null;
    const currentStopLng = currentStop?.order?.shippingAddress?.location?.coordinates?.[0] || null;

    const currentStopPos = useMemo(() => currentStopLat && currentStopLng ? [currentStopLat, currentStopLng] : null, [currentStopLat, currentStopLng]);

    useEffect(() => {
        if (markerRef.current) markerRef.current.slideTo(partnerPos, { duration: 1200 });
    }, [partnerLat, partnerLng]);

    const lastFetchedDestRef = React.useRef(null);
    const lastFetchedOriginRef = React.useRef(null);

    useEffect(() => {
        const fetchRoute = async () => {
            if (partnerLat === 0 || !id) return;
            const dest = (run?.status === 'in_progress' && currentStopPos) ? currentStopPos : (run?.status === 'assigned' && run.runType === 'delivery') ? runDestinationPos : runDestinationPos;
            if (!dest) return;

            const isSameDest = lastFetchedDestRef.current && 
                lastFetchedDestRef.current[0] === dest[0] && 
                lastFetchedDestRef.current[1] === dest[1];
            
            // Limit API calls: Only reroute if destination changed OR rider moved > 200m from last fetched point
            if (isSameDest && lastFetchedOriginRef.current) {
                const distanceMoved = getDistance(partnerPos, lastFetchedOriginRef.current);
                if (distanceMoved < 200) {
                    return; 
                }
            }

            try {
                const response = await getRouteDirections(token, partnerPos, dest);
                if (response.routes?.length > 0) {
                    setRouteCoordinates(polylineUtil.decode(response.routes[0].overview_polyline.points));
                    lastFetchedDestRef.current = dest;
                    lastFetchedOriginRef.current = partnerPos;
                }
            } catch {}
        };

        const timeoutId = setTimeout(fetchRoute, 1500); 
        return () => clearTimeout(timeoutId);
    }, [id, run?.status, run?.runType, partnerLat, partnerLng, currentStopLat, currentStopLng, runDestinationLat, runDestinationLng, token]);
    useEffect(() => {
        if (!routeCoordinates.length) return;
        const dest = routeCoordinates[routeCoordinates.length - 1];
        if (getDistance(partnerPos, dest) < 150) { setTrimmedRoute([]); return; }
        let minD = Infinity, idx = 0;
        routeCoordinates.forEach((p, i) => { const d = getDistance(partnerPos, p); if (d < minD) { minD = d; idx = i; } });
        setTrimmedRoute([partnerPos, ...routeCoordinates.slice(idx)]);
    }, [partnerPos, routeCoordinates]);

    if (isLoading || !run) return <div className="h-screen flex items-center justify-center bg-zinc-950"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>;

    const isReturn = run.runType === 'return';
    const allStopsDone = run.orders.every(o => isReturn ? o.status === 'picked_up' : (o.status === 'delivered' || o.status === 'failed'));

    return (
        <div className="fixed inset-0 w-full h-full z-[100] bg-zinc-950 text-white font-sans overflow-hidden">
            {/* Map Area */}
            <div className={`absolute inset-0 z-0 transition-all duration-500 ease-in-out ${isExpanded ? 'h-[40vh]' : 'h-full'}`}>
                <MapContainer center={partnerPos} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <MapController center={partnerPos} isFOLLOWING={isFOLLOWING} setIsFOLLOWING={setIsFOLLOWING} />
                    <TileLayer url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" subdomains={['mt0', 'mt1', 'mt2', 'mt3']} />
                    
                    <Marker ref={markerRef} position={partnerPos} icon={bikeIcon} />
                    
                    {isReturn ? (
                        <>
                             {currentStopPos && <Marker position={currentStopPos} icon={homeIcon} />}
                             <Marker position={runDestinationPos} icon={storeIcon} />
                        </>
                    ) : (
                        <>
                            <Marker position={runDestinationPos} icon={storeIcon} />
                            {currentStopPos && <Marker position={currentStopPos} icon={homeIcon} />}
                        </>
                    )}

                    {trimmedRoute.length > 0 && (
                        <Polyline positions={trimmedRoute} color={isReturn ? '#10b981' : '#028A0F'} weight={6} opacity={0.6} lineCap="round" />
                    )}
                </MapContainer>
            </div>

            {/* Overlays */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
                <button onClick={() => navigate(-1)} className="p-4 bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl active:scale-90 transition-all">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center gap-2">
                    <div className="px-6 py-2.5 bg-zinc-900/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isReturn ? 'bg-emerald-500' : 'bg-green-500'} animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]`}></div>
                        <span className="font-black text-[10px] uppercase tracking-[0.3em]">{isReturn ? 'Return Mission' : 'Delivery Mission'}</span>
                    </div>
                    <div className="px-4 py-1.5 bg-zinc-900/40 backdrop-blur-sm rounded-xl border border-white/5 text-[10px] font-bold text-zinc-400">#{run.runId}</div>
                </div>
                <button onClick={() => setIsFOLLOWING(true)} className={`p-4 rounded-2xl border transition-all shadow-2xl ${isFOLLOWING ? 'bg-emerald-600 border-white/20' : 'bg-zinc-900/80 border-white/10'}`}>
                    <Navigation size={24} className={isFOLLOWING ? 'fill-current' : ''} />
                </button>
            </div>

            {/* Bottom Sheet */}
            <div className={`absolute bottom-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${isExpanded ? 'h-[65vh]' : 'h-[100px]'}`}>
                <div className="bg-zinc-900 rounded-t-[3rem] shadow-[0_-30px_60px_-12px_rgba(0,0,0,0.5)] border-t border-white/10 w-full h-full flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
                    
                    <div className="w-full h-12 flex items-center justify-center cursor-pointer flex-shrink-0" onClick={() => setIsExpanded(!isExpanded)}>
                        <div className="w-16 h-1 bg-zinc-700 rounded-full" />
                    </div>

                    <div className="px-8 pb-4 flex flex-col gap-6 flex-1 overflow-hidden">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Phase: {run.status.replace('_', ' ')}</p>
                                <h2 className="text-3xl font-black tracking-tighter">{isReturn ? 'Reverse Logistics' : 'Dispatch Batch'}</h2>
                            </div>
                            {run.status === 'assigned' ? (
                                <button onClick={() => handleAction('start')} className="px-8 py-4 bg-white text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">Start Mission</button>
                            ) : allStopsDone && (
                                <button onClick={() => handleAction('complete')} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20">{isReturn ? 'Finalize Return' : 'Dispatch Complete'}</button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-8">
                            <div className="p-1 bg-zinc-800/40 rounded-3xl border border-white/5">
                                {run.orders.map((stop, i) => {
                                    const isActive = (isReturn ? stop.status === 'pending' : (stop.status === 'pending' || stop.status === 'out_for_delivery')) && !run.orders.slice(0, i).some(prev => isReturn ? prev.status === 'pending' : (prev.status === 'pending' || prev.status === 'out_for_delivery'));
                                    const isDone = isReturn ? stop.status === 'picked_up' : stop.status === 'delivered';
                                    
                                    return (
                                        <div key={stop._id} className={`p-6 rounded-[1.8rem] transition-all duration-300 ${isActive ? 'bg-zinc-800 shadow-2xl border border-white/10 translate-x-1' : 'opacity-40 translate-x-0'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDone ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-700 text-zinc-400'}`}>
                                                        {isDone ? <Check size={24} strokeWidth={3} /> : <span className="font-black text-lg">{i + 1}</span>}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-lg text-white">{stop.order?.user?.name}</h4>
                                                        <p className="text-xs text-zinc-500 font-medium">{stop.order?.user?.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-zinc-300">₹{stop.order?.totalAmount}</p>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mt-1">{stop.status.replace('_', ' ')}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2 text-zinc-400 mb-6 bg-zinc-950/30 p-3 rounded-xl">
                                                <MapPin size={14} className="mt-1 flex-shrink-0 text-emerald-500" />
                                                <p className="text-xs font-medium leading-relaxed">{stop.order?.shippingAddress?.street}, {stop.order?.shippingAddress?.city}</p>
                                            </div>                                            {isActive && run.status === 'in_progress' && (
                                                <div className="flex gap-3">
                                                    {isReturn ? (
                                                        <div className="flex-1 flex gap-2">
                                                            <input 
                                                                type="text" 
                                                                maxLength={4} 
                                                                placeholder="OTP" 
                                                                className="w-24 bg-zinc-950 border border-white/10 rounded-2xl text-center font-black tracking-widest" 
                                                                value={otpInput} 
                                                                onChange={e => setOtpInput(e.target.value)} 
                                                            />
                                                            <button 
                                                                onClick={() => handleAction('stop', stop.order._id, 'picked_up', otpInput)} 
                                                                disabled={!otpInput}
                                                                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/10 active:transition-transform active:scale-95 disabled:opacity-30"
                                                            >
                                                                Collect & Verify
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        stop.status === 'pending' ? (
                                                             <button onClick={() => handleAction('stop', stop.order._id, 'out_for_delivery')} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/10 active:transition-transform active:scale-95">Head to Location</button>
                                                        ) : (
                                                             <div className="flex-1 flex gap-2">
                                                                 <input type="text" maxLength={4} placeholder="CODE" className="w-24 bg-zinc-950 border border-white/10 rounded-2xl text-center font-black tracking-widest" value={otpInput} onChange={e => setOtpInput(e.target.value)} />
                                                                 <button onClick={() => handleAction('stop', stop.order._id, 'delivered', otpInput)} disabled={!otpInput} className="flex-1 py-4 bg-white text-zinc-950 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30">Verify & Deliver</button>
                                                             </div>
                                                        )
                                                    )}
                                                    <a href={`tel:${stop.order?.user?.phone}`} className="p-4 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-400 hover:text-white"><Phone size={20} /></a>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveTracking;
