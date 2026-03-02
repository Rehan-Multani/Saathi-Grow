import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../../../config/firebase';
import { ref, onValue, off } from 'firebase/database';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.marker.slideto';
import polylineUtil from '@mapbox/polyline';
import { ArrowLeft, Navigation as NavIcon, Phone, MessageSquare, Package, CheckCircle, Truck, Info, PhoneCall, MapPin, ChevronLeft, ChevronRight, Star, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as orderApi from '../../api/orderApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// Import Asset URLs with Cloudinary fallbacks
import { ASSET_URLS } from '../../../../constants/assetUrls';

const bikeImg = ASSET_URLS.bike;
const storeImg = ASSET_URLS.store;
const houseImg = ASSET_URLS.house;

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
    dragstart: () => setIsFOLLOWING(false),
    zoomstart: () => setIsFOLLOWING(false),
    touchmove: () => setIsFOLLOWING(false)
  });

  return null;
};

// Distance Helper
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

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState([]);
  const [trimmedRoute, setTrimmedRoute] = useState([]);
  const [isFOLLOWING, setIsFOLLOWING] = useState(true);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

  const markerRef = useRef(null);

  // Custom Map Icons
  const bikeIcon = useMemo(() => new L.divIcon({
    html: `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; position: relative;">
                 <span style="position: absolute; top: 0; right: 0; display: flex; height: 16px; width: 16px; z-index: 10;">
                   <span style="animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 50%; background-color: #bef264; opacity: 0.75;"></span>
                   <span style="position: relative; display: inline-flex; border-radius: 50%; height: 16px; width: 16px; background-color: #84cc16; border: 2px solid white;"></span>
                 </span>
                 <img src="${bikeImg}" 
                      onerror="this.onerror=null; this.src='${ASSET_URLS.bikeCloudinary}';"
                      style="width: 100%; height: 100%; object-fit: contain;" />
               </div>`,
    className: '',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
  }), [bikeImg]);

  const storeIcon = useMemo(() => L.divIcon({
    html: `<div style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;">
             <img src="${storeImg}" 
                  onerror="this.onerror=null; this.src='${ASSET_URLS.storeCloudinary}';"
                  style="width: 100%; height: 100%; object-fit: contain;" />
           </div>`,
    className: '',
    iconSize: [45, 45],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  }), [storeImg]);

  const homeIcon = useMemo(() => L.divIcon({
    html: `<div style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;">
             <img src="${houseImg}" 
                  onerror="this.onerror=null; this.src='${ASSET_URLS.houseCloudinary}';"
                  style="width: 100%; height: 100%; object-fit: contain;" />
           </div>`,
    className: '',
    iconSize: [45, 45],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  }), [houseImg]);

  // Load Order Data
  useEffect(() => {
    const loadOrder = async () => {
      if (token && id) {
        try {
          const data = await orderApi.fetchOrderDetails(token, id);
          setOrder(data);
        } catch (err) {
          console.error("Failed to load order for tracking", err);
          toast.error("Failed to sync order status");
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadOrder();
  }, [token, id]);

  // Firebase Real-time Sync
  useEffect(() => {
    if (!id) return;
    const trackingRef = ref(db, `active_trackings/${id}`);
    const unsubscribe = onValue(trackingRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.location) {
        const newPos = [data.location.lat, data.location.lng];
        setDriverLocation(newPos);
        if (data.heading !== undefined) setHeading(data.heading);

        // Animate marker transition
        if (markerRef.current) {
          markerRef.current.slideTo(newPos, { duration: 2000, keepAtCenter: false });
        }
      }
    });
    return () => off(trackingRef, 'value', unsubscribe);
  }, [id]);

  // Fetch Route Path
  useEffect(() => {
    const fetchRoute = async () => {
      // Don't fetch if missing info or location is too primitive (0,0)
      if (!id || !token || !driverLocation) return;
      if (driverLocation[0] === 0 && driverLocation[1] === 0) return;

      try {
        const originStr = `${driverLocation[0]},${driverLocation[1]}`;
        const response = await orderApi.fetchOrderRoute(token, id, originStr);
        if (response.routes && response.routes.length > 0) {
          const encodedPolyline = response.routes[0].overview_polyline.points;
          const decoded = polylineUtil.decode(encodedPolyline);
          setRouteCoords(decoded);
          console.log("🗺️ Order route updated with real-time road directions");
        }
      } catch (err) {
        console.error("Route fetch error:", err);
      }
    };
    fetchRoute();
  }, [id, token, driverLocation?.[0], driverLocation?.[1]]);

  // Dynamic Route Trimming
  useEffect(() => {
    if (!routeCoords.length || !driverLocation) {
      setTrimmedRoute([]);
      return;
    }
    const destination = routeCoords[routeCoords.length - 1];
    if (getDistance(driverLocation, destination) < 150) {
      setTrimmedRoute([]);
      return;
    }
    let closestIndex = 0;
    let minDistance = Infinity;
    routeCoords.forEach((p, i) => {
      const d = getDistance(driverLocation, p);
      if (d < minDistance) {
        minDistance = d;
        closestIndex = i;
      }
    });
    setTrimmedRoute([driverLocation, ...routeCoords.slice(closestIndex)]);
  }, [driverLocation, routeCoords]);

  if (isLoading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-black">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-[#0c831f]/20 border-t-[#0c831f] rounded-full"
      />
      <p className="mt-4 text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Establishing Live Sync...</p>
    </div>
  );

  if (!order) return null;

  const destCoords = order.shippingAddress?.location?.coordinates;
  const destPos = destCoords ? [destCoords[1], destCoords[0]] : [22.7196, 75.8577];
  const storeCoords = order.branchId?.address?.location?.coordinates || order.vendor?.address?.location?.coordinates;
  const storePos = storeCoords ? [storeCoords[1], storeCoords[0]] : null;

  const mapCenter = driverLocation || destPos;
  const etaMins = driverLocation ? Math.max(2, Math.round(getDistance(driverLocation, destPos) / 333) + 1) : null;

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-black overflow-hidden flex flex-col">
      {/* Top Bar Navigation */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 active:scale-95 transition-all text-gray-800 dark:text-white"
        >
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <div className="px-6 py-3 bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0c831f] animate-pulse"></div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#0c831f]">Live Tracking</span>
        </div>
        <button
          onClick={() => {
            setIsFOLLOWING(true);
            toast.success("Recenter Map", { autoClose: 1000, hideProgressBar: true });
          }}
          className={`p-3 rounded-2xl shadow-2xl border transition-all ${isFOLLOWING ? 'bg-[#0c831f] text-white border-[#0c831f]' : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-white/5 text-gray-400'}`}
        >
          <NavIcon size={24} className={isFOLLOWING ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full h-full relative">
        <MapContainer
          center={mapCenter}
          zoom={15}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <MapController
            center={mapCenter}
            isFOLLOWING={isFOLLOWING}
            setIsFOLLOWING={setIsFOLLOWING}
          />
          <TileLayer
            url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          />

          {storePos && order.status !== 'picked_up' && (
            <Marker position={storePos} icon={storeIcon} />
          )}

          <Marker position={destPos} icon={homeIcon} />

          {driverLocation && (
            <Marker
              ref={markerRef}
              position={driverLocation}
              icon={bikeIcon}
            />
          )}

          {trimmedRoute.length > 0 && (
            <>
              {/* Outer shadow for path depth */}
              <Polyline
                positions={trimmedRoute}
                color="#000"
                weight={8}
                opacity={0.1}
                lineCap="round"
                lineJoin="round"
              />
              {/* Main Path with glow */}
              <Polyline
                positions={trimmedRoute}
                color="#0c831f"
                weight={5}
                opacity={0.7}
                lineCap="round"
                lineJoin="round"
              />
              {/* Core Path line */}
              <Polyline
                positions={trimmedRoute}
                color="#bef264"
                weight={2}
                opacity={0.9}
                lineCap="round"
                lineJoin="round"
              />
            </>
          )}
        </MapContainer>
      </div>

      {/* Bottom Slider Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-[1001]">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white dark:bg-zinc-950 rounded-t-[2rem] shadow-[0_-15px_40px_-10px_rgba(0,0,0,0.2)] border-t border-gray-100 dark:border-white/5 w-full max-w-2xl mx-auto"
        >
          {/* Drag Handle */}
          <div
            className="w-full pt-4 pb-1 flex justify-center cursor-pointer"
            onClick={() => setIsSheetExpanded(!isSheetExpanded)}
          >
            <div className="w-10 h-1 bg-gray-200 dark:bg-gray-800 rounded-full" />
          </div>

          <div className="px-5 pb-4">
            {/* Summary Header */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                  {etaMins ? `${etaMins} mins` : "Arriving soon"}
                </h2>
                <p className="text-[#0c831f] font-black text-[9px] uppercase tracking-widest mt-0.5">
                  {order.status === 'picked_up' ? "On the way to home" : "Heading to store"}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center border border-green-100 dark:border-green-500/10 shadow-inner flex-shrink-0">
                <Truck size={22} className="text-[#0c831f]" />
              </div>
            </div>

            {/* Rider Card UI matching user's reference */}
            <div className="bg-gray-50/50 dark:bg-white/5 p-3.5 rounded-[1.5rem] border border-gray-100 dark:border-white/5 flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-lg border-2 border-white dark:border-zinc-800 flex-shrink-0">
                <img
                  src={order.deliveryPartnerId?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.deliveryPartnerId?._id || 'Sarthak'}`}
                  alt="Rider"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-gray-900 dark:text-white text-sm leading-tight mb-0.5 truncate">
                  {order.deliveryPartnerId?.name || "Assigning..."}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-[9px] font-black text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full uppercase">
                    <Star size={9} fill="currentColor" /> {order.deliveryPartnerId?.rating || "4.9"}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">
                    {order.deliveryPartnerId?.vehicleNumber || "Verified"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-blue-600 shadow-sm active:scale-95 transition-all">
                  <MessageCircle size={18} strokeWidth={2.5} />
                </button>
                {order.deliveryPartnerId?.phone && (
                  <a
                    href={`tel:${order.deliveryPartnerId.phone}`}
                    className="w-9 h-9 rounded-full bg-[#0c831f] flex items-center justify-center text-white shadow-lg shadow-green-500/30 active:scale-95 transition-all"
                  >
                    <Phone size={18} strokeWidth={2.5} />
                  </a>
                )}
              </div>
            </div>

            {/* Collapsible Steps Log */}
            <AnimatePresence>
              {isSheetExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 px-2 pb-4 border-t border-gray-100 dark:border-white/5 pt-4">
                    <div className="flex items-start gap-4 relative">
                      <div className="absolute left-[3.5px] top-[14px] bottom-[-18px] w-[1px] bg-gray-100 dark:bg-white/5"></div>
                      <div className={`w-2 h-2 rounded-full z-10 mt-1.5 ${order.status !== 'picked_up' ? 'bg-[#0c831f] ring-2 ring-green-50 dark:ring-green-900/20' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-0.5">At Store</p>
                        <p className="text-xs font-black text-gray-800 dark:text-gray-200 leading-tight">
                          {order.branchId?.name || order.vendor?.storeName || 'Store Location'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className={`w-2 h-2 rounded-full z-10 mt-1.5 ${order.status === 'picked_up' ? 'bg-[#0c831f] ring-2 ring-green-50 dark:ring-green-900/20 animate-pulse' : 'bg-gray-200'}`}></div>
                      <div>
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Delivering To</p>
                        <p className="text-xs font-black text-gray-800 dark:text-gray-200 leading-tight">
                          {order.shippingAddress?.street}, {order.shippingAddress?.city}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Safety Disclaimer matching reference */}
            <div className="bg-amber-50/30 dark:bg-amber-500/5 p-3 rounded-2xl border border-amber-50/50 dark:border-amber-500/10 flex items-start gap-3 mb-1">
              <Info size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[9px] font-black text-amber-700/80 dark:text-amber-500/80 uppercase leading-relaxed italic tracking-tight">
                Complaints are escalated directly to the store manager and monitored by SaathiGro Admins.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default OrderTrackingPage;

