import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../../../config/firebase';
import { ref, onValue, off } from 'firebase/database';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.marker.slideto';
import polylineUtil from '@mapbox/polyline';
import { ArrowLeft, Navigation, Phone, MessageSquare, Package, CheckCircle, Truck, Info, PhoneCall, MapPin } from 'lucide-react';
import * as orderApi from '../../api/orderApi';
import { useAuth } from '../../context/AuthContext';

// Import Assets for Icons
import bikeImg from '../../../../assets/delivery-bike.png';
import storeImg from '../../../../assets/store.png';
import houseImg from '../../../../assets/house.png';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Map Icons
const bikeIcon = new L.divIcon({
  html: `<div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; position: relative;">
             <span style="position: absolute; top: 0; right: 0; display: flex; height: 16px; width: 16px; z-index: 10;">
               <span style="animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 50%; background-color: #bef264; opacity: 0.75;"></span>
               <span style="position: relative; display: inline-flex; border-radius: 50%; height: 16px; width: 16px; background-color: #84cc16; border: 2px solid white;"></span>
             </span>
             <img src="${bikeImg}" style="width: 100%; height: 100%; object-fit: contain;" />
           </div>`,
  className: '',
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -25]
});

const storeIcon = new L.divIcon({
  html: `<div style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;">
             <img src="${storeImg}" style="width: 100%; height: 100%; object-fit: contain;" />
           </div>`,
  className: '',
  iconSize: [45, 45],
  iconAnchor: [22, 22]
});

const homeIcon = new L.divIcon({
  html: `<div style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;">
             <img src="${houseImg}" style="width: 100%; height: 100%; object-fit: contain;" />
           </div>`,
  className: '',
  iconSize: [45, 45],
  iconAnchor: [22, 22]
});

// Custom Animated Marker Component
const AnimatedMarker = ({ position, heading }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current && position) {
      markerRef.current.slideTo(position, {
        duration: 2000,
        keepAtCenter: false
      });
    }
  }, [position]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={bikeIcon}
    />
  );
};

const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { animate: true, duration: 1.5 });
    }
  }, [center?.join(','), map]);
  return null;
};

// Distance Helper
const getDistance = (pos1, pos2) => {
  if (!pos1 || !pos2) return 0;
  const R = 6371e3;
  const f1 = pos1[0] * Math.PI / 180;
  const f2 = pos2[0] * Math.PI / 180;
  const df = (pos2[0] - pos1[0]) * Math.PI / 180;
  const dl = (pos2[1] - pos1[1]) * Math.PI / 180;
  const a = Math.sin(df / 2) * Math.sin(df / 2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) * Math.sin(dl / 2);
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

  useEffect(() => {
    const loadOrder = async () => {
      if (token && id) {
        try {
          const data = await orderApi.fetchOrderDetails(token, id);
          setOrder(data);
        } catch (err) {
          console.error("Failed to load order for tracking", err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadOrder();
  }, [token, id]);

  // Sync with Firebase RTDB
  useEffect(() => {
    if (!id) return;
    const trackingRef = ref(db, `active_trackings/${id}`);
    const unsubscribe = onValue(trackingRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.location) {
        setDriverLocation([data.location.lat, data.location.lng]);
        if (data.heading !== undefined) setHeading(data.heading);
      }
    });
    return () => off(trackingRef, 'value', unsubscribe);
  }, [id]);

  // Fetch Road Route from Google Maps (via Backend)
  useEffect(() => {
    const fetchRoute = async () => {
      if (!id || !token || !driverLocation) return;
      try {
        const response = await orderApi.fetchOrderRoute(token, id);
        if (response.routes && response.routes.length > 0) {
          const encodedPolyline = response.routes[0].overview_polyline.points;
          const decoded = polylineUtil.decode(encodedPolyline);
          setRouteCoords(decoded);
        }
      } catch (err) {
        console.error("Route fetch error:", err);
      }
    };
    fetchRoute();
    // Refresh route every 2 minutes or only once? Let's do once to save API cost.
  }, [id, token, !!driverLocation]);

  // Trim Route dynamically
  useEffect(() => {
    if (!routeCoords.length || !driverLocation) {
      setTrimmedRoute([]);
      return;
    }
    const dest = routeCoords[routeCoords.length - 1];
    if (getDistance(driverLocation, dest) < 100) {
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
    <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-black">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0c831f]"></div>
    </div>
  );

  if (!order) return null;

  const destCoords = order.shippingAddress?.location?.coordinates;
  const destPos = destCoords ? [destCoords[1], destCoords[0]] : [22.7196, 75.8577];

  const storeCoords = order.branchId?.location?.coordinates || order.vendor?.location?.coordinates;
  const storePos = storeCoords ? [storeCoords[1], storeCoords[0]] : null;

  // Dynamic Center Logic
  const mapCenter = driverLocation || destPos;
  const etaMins = driverLocation ? Math.max(2, Math.round(getDistance(driverLocation, destPos) / 333) + 1) : null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-black flex flex-col md:relative md:min-h-screen md:bg-gray-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex justify-between items-center pointer-events-none">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 shadow-xl pointer-events-auto border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-800 dark:text-gray-200">
          <ArrowLeft size={20} />
        </button>
        <div className="px-4 py-2 bg-white/95 dark:bg-black/95 backdrop-blur-md rounded-2xl shadow-xl pointer-events-auto border border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-200">Live Mission</span>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative w-full h-[60vh] md:h-[70vh]">
        <MapContainer center={mapCenter} zoom={16} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <ChangeView center={mapCenter} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap'
          />

          {storePos && order.status !== 'picked_up' && (
            <Marker position={storePos} icon={storeIcon} />
          )}

          <Marker position={destPos} icon={homeIcon} />

          {driverLocation && (
            <AnimatedMarker position={driverLocation} heading={heading} />
          )}

          {trimmedRoute.length > 0 && (
            <Polyline
              positions={trimmedRoute}
              color="#0c831f"
              weight={5}
              opacity={0.8}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </MapContainer>
      </div>

      {/* Information Card */}
      <div className="bg-white dark:bg-zinc-950 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] -mt-10 z-[1010] relative flex-shrink-0">
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mt-4"></div>

        <div className="px-6 pb-8 pt-6 w-full max-w-2xl mx-auto">
          {/* Time Estimate */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                {etaMins ? `Arriving in ${etaMins} mins` : "Searching Rider..."}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-bold text-sm tracking-tight mt-1">
                {order.status === 'picked_up' ? "On the way to your home" : "Rider is heading to the store"}
              </p>
            </div>
            <div className="w-16 h-16 rounded-[1.5rem] bg-green-50 dark:bg-green-500/10 flex items-center justify-center border border-green-100 dark:border-green-500/10">
              <Truck size={28} className="text-[#0c831f]" />
            </div>
          </div>

          {/* Rider Identity Card */}
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-3xl border border-gray-100 dark:border-white/5 flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow-sm border border-gray-100 p-1 flex items-center justify-center">
              {order.deliveryPartnerId?.profileImage ? (
                <img src={order.deliveryPartnerId.profileImage} alt="Rider" className="w-full h-full object-cover rounded-full" />
              ) : (
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.deliveryPartnerId?._id || 'Rider'}`} alt="Rider" className="w-full h-full object-cover rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-black text-gray-900 dark:text-white text-base leading-none mb-1">
                {order.deliveryPartnerId?.name || "Assigning Rider..."}
              </h4>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-none">
                ★ {order.deliveryPartnerId?.rating || "5.0"} · {order.deliveryPartnerId?.vehicleNumber || "Loading..."}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-blue-500 shadow-sm active:scale-95 transition-all">
                <MessageSquare size={18} />
              </button>
              {order.deliveryPartnerId?.phone && (
                <a href={`tel:${order.deliveryPartnerId.phone}`} className="w-10 h-10 rounded-full bg-[#0c831f] flex items-center justify-center text-white shadow-lg shadow-green-500/20 active:scale-95 transition-all">
                  <PhoneCall size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Simple Step Log */}
          <div className="space-y-4 px-2">
            <div className="flex items-start gap-4">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${order.status === 'picked_up' ? 'bg-gray-300' : 'bg-lime-500'}`}></div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">At store</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{order.branchId?.name || order.vendor?.storeName || 'Store Location'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${order.status === 'picked_up' ? 'bg-[#0c831f] animate-pulse' : 'bg-gray-200'}`}></div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Delivery To</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
