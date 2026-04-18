import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../../../config/firebase';
import { ref, onValue, off } from 'firebase/database';
import { GoogleMap, MarkerF, Polyline, InfoWindowF } from '@react-google-maps/api';
import polylineUtil from '@mapbox/polyline';
import { Navigation as NavIcon, Phone, Truck, ChevronLeft, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as orderApi from '../../api/orderApi';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { toast } from 'react-toastify';
import { ASSET_URLS } from '../../../../constants/assetUrls';

const bikeImg = ASSET_URLS.bike;
const storeImg = ASSET_URLS.store;
const houseImg = ASSET_URLS.house;

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  styles: [
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }]
    },
    {
      "featureType": "administrative.country",
      "elementType": "geometry",
      "stylers": [{ "visibility": "on" }]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }]
    },
    {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }]
    },
    {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [{ "color": "#f2f2f2" }, { "lightness": 19 }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }]
    }
  ],
  gestureHandling: 'greedy'
};

const getDistance = (pos1, pos2) => {
  if (!pos1 || !pos2) return 0;
  const lat1 = pos1.lat;
  const lng1 = pos1.lng;
  const lat2 = pos2.lat;
  const lng2 = pos2.lng;

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
  const { mapLoaded } = useLocation(); // Destructure mapLoaded from useLocation

  const [order, setOrder] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null); // Renamed from driverLocation
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Added new state
  const [isFOLLOWING, setIsFOLLOWING] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true); // Added new state
  const [routeCoordinates, setRouteCoordinates] = useState([]); // Renamed from routeCoords
  const [trimmedRoute, setTrimmedRoute] = useState([]);
  const [map, setMap] = useState(null);
  const [bikeHeading, setBikeHeading] = useState(0); // Added new state

  const onLoad = useCallback(function callback(m) {
    setMap(m);
  }, []);

  const onUnmount = useCallback(function callback(m) {
    setMap(null);
  }, []);

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
          setError(err); // Set error state
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadOrder();
  }, [token, id]);

  // Firebase Real-time Sync
  useEffect(() => {
    const trackingId = order?.deliveryRunId || id;
    if (!trackingId) return;

    const trackingRef = ref(db, `active_trackings/${trackingId}`);
    const unsubscribe = onValue(trackingRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.location) {
        const newPos = { lat: data.location.lat, lng: data.location.lng };
        setRiderLocation(newPos); // Updated to riderLocation
        if (data.heading !== undefined) { // Check for heading
          setBikeHeading(data.heading);
        }
      }
    });
    return () => off(trackingRef, 'value', unsubscribe);
  }, [id, order?.deliveryRunId]);

  // Fetch Route Path
  useEffect(() => {
    const fetchRoute = async () => {
      if (!id || !token || !riderLocation) return; // Updated to riderLocation
      if (riderLocation.lat === 0 && riderLocation.lng === 0) return; // Updated to riderLocation

      try {
        const originStr = `${riderLocation.lat},${riderLocation.lng}`; // Updated to riderLocation
        const response = await orderApi.fetchOrderRoute(token, id, originStr);
        if (response.routes && response.routes.length > 0) {
          const encodedPolyline = response.routes[0].overview_polyline.points;
          const decoded = polylineUtil.decode(encodedPolyline).map(p => ({ lat: p[0], lng: p[1] }));
          setRouteCoordinates(decoded); // Updated to routeCoordinates
        }
      } catch (err) {
        console.error("Route fetch error:", err);
      }
    };
    fetchRoute();
  }, [id, token, riderLocation?.lat, riderLocation?.lng]); // Updated to riderLocation

  // Dynamic Route Trimming & Auto-fit
  useEffect(() => {
    if (!routeCoordinates.length || !riderLocation) { // Updated to routeCoordinates and riderLocation
      setTrimmedRoute([]);
      return;
    }
    const destination = routeCoordinates[routeCoordinates.length - 1]; // Updated to routeCoordinates
    if (getDistance(riderLocation, destination) < 150) { // Updated to riderLocation
      setTrimmedRoute([]);
      return;
    }
    let closestIndex = 0;
    let minDistance = Infinity;
    routeCoordinates.forEach((p, i) => { // Updated to routeCoordinates
      const d = getDistance(riderLocation, p); // Updated to riderLocation
      if (d < minDistance) {
        minDistance = d;
        closestIndex = i;
      }
    });
    const newPath = [riderLocation, ...routeCoordinates.slice(closestIndex)]; // Updated to riderLocation and routeCoordinates
    setTrimmedRoute(newPath);

    // Initial Auto-fit
    if (map && isFOLLOWING) {
      const bounds = new window.google.maps.LatLngBounds();
      newPath.forEach(p => bounds.extend(p));
      map.fitBounds(bounds, { top: 120, bottom: 250, left: 50, right: 50 });
    }
  }, [riderLocation, routeCoordinates, map, isFOLLOWING]); // Updated to riderLocation and routeCoordinates

  if (isLoading || !mapLoaded) return ( // Updated condition to mapLoaded
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mb-6"
      />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Syncing Pilot...</p>
    </div>
  );

  if (!order) return null;

  const destCoords = order.shippingAddress?.location?.coordinates;
  const destPos = destCoords ? { lat: destCoords[1], lng: destCoords[0] } : { lat: 22.7196, lng: 75.8577 };
  const storeCoords = order.branchId?.address?.location?.coordinates || order.vendor?.address?.location?.coordinates;
  const storePos = storeCoords ? { lat: storeCoords[1], lng: storeCoords[0] } : null;

  const mapCenter = riderLocation || destPos;
  const etaMins = riderLocation ? Math.max(2, Math.round(getDistance(riderLocation, destPos) / 333) + 1) : null;

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-black overflow-hidden flex flex-col">
      {/* Top Bar Navigation - Mission Style */}
      <div className="absolute top-6 left-4 right-4 z-[1000] flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center bg-[#2d2d2d] text-white shadow-xl active:scale-95 transition-all rounded-none"
        >
          <ChevronLeft size={20} strokeWidth={3} />
        </button>

        <div className="flex flex-col items-center justify-center flex-1 mx-2">
            <div className="bg-[#2d2d2d] w-[110px] h-[44px] rounded-[100px] shadow-2xl flex items-center justify-center relative px-4 border border-white/5">
                <div className="absolute left-3 w-1 h-3 bg-[#00c982] rounded-full animate-pulse shadow-[0_0_8px_#00c982]"></div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white leading-none mb-0.5">Delivery</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white leading-none">Mission</span>
                </div>
            </div>
            <div className="mt-1">
                <div className="bg-gray-400/40 backdrop-blur-md px-4 py-0.5 rounded-full flex items-center justify-center">
                    <span className="text-[7.5px] font-black text-[#2d2d2d] uppercase tracking-widest leading-none">#{order.orderId || id.slice(-8)}</span>
                </div>
            </div>
        </div>

        <button
          onClick={() => {
            setIsFOLLOWING(true);
            if (map && trimmedRoute.length > 0) {
                const bounds = new window.google.maps.LatLngBounds();
                trimmedRoute.forEach(p => bounds.extend(p));
                map.fitBounds(bounds, { top: 120, bottom: 250, left: 50, right: 50 });
            }
          }}
          className={`w-10 h-10 flex items-center justify-center shadow-2xl transition-all rounded-none ${isFOLLOWING ? 'bg-[#00965e] text-white font-bold' : 'bg-[#2d2d2d] text-gray-400'}`}
        >
          <NavIcon size={20} className={isFOLLOWING ? 'fill-white' : ''} />
        </button>
      </div>

      <div className="flex-1 w-full h-full relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          {storePos && order.status !== 'picked_up' && (
            <MarkerF
              position={storePos}
              icon={{
                url: storeImg,
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 20)
              }}
            />
          )}

          <MarkerF
            position={destPos}
            icon={{
              url: houseImg,
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20)
            }}
          />

          {riderLocation && (
            <MarkerF
              position={riderLocation}
              icon={{
                url: bikeImg,
                scaledSize: new window.google.maps.Size(45, 45),
                anchor: new window.google.maps.Point(22.5, 22.5)
              }}
            />
          )}

          {trimmedRoute.length > 0 && (
            <>
              {/* Path Shadow */}
              <Polyline
                path={trimmedRoute}
                options={{
                  strokeColor: "#000000",
                  strokeOpacity: 0.1,
                  strokeWeight: 8,
                  lineCap: "round",
                }}
              />
              {/* Main Glowing Path */}
              <Polyline
                path={trimmedRoute}
                options={{
                  strokeColor: "#0c831f",
                  strokeOpacity: 0.7,
                  strokeWeight: 6,
                  lineCap: "round",
                }}
              />
              {/* Center Core Path */}
              <Polyline
                path={trimmedRoute}
                options={{
                  strokeColor: "#bef264",
                  strokeOpacity: 1,
                  strokeWeight: 2,
                  lineCap: "round",
                }}
              />
            </>
          )}
        </GoogleMap>
      </div>

      {/* Bottom Slider Sheet - Dark Mission UI */}
      <div className="absolute bottom-0 left-0 right-0 z-[1001]">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-[#1a1a1a] rounded-t-[2.5rem] shadow-2xl w-full max-w-2xl mx-auto overflow-hidden border-t border-white/5"
        >
          {/* Drag Handle */}
          <div className="w-full pt-4 pb-1 flex justify-center">
            <div className="w-12 h-1 bg-white/10 rounded-full" />
          </div>

          <div className="px-6 pb-8 pt-2">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div className="flex-1">
                <p className="text-[#00c982] font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
                  PHASE: {order.status === 'picked_up' ? 'DELIVERING' : 'PREPARING'}
                </p>
                <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
                  {order.status === 'picked_up' ? 'Out for Delivery' : 'Assigning Rider'}
                </h2>
                {etaMins && (
                  <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">
                    Estimate: {etaMins} mins away
                  </p>
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                {order.deliveryOTP && (
                  <div className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl flex flex-col items-center justify-center">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5">PIN</span>
                    <span className="text-xl font-black tracking-widest leading-none">{order.deliveryOTP}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rider Card - Transparent Dark Style */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border-2 border-white/10 flex-shrink-0">
                <img
                  src={order.deliveryPartnerId?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.deliveryPartnerId?._id || 'Sarthak'}`}
                  alt="Rider"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-white text-base leading-tight mb-0.5 truncate">
                  {order.deliveryPartnerId?.name || "Locating Partner..."}
                </h4>
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-0.5 text-[10px] font-black text-amber-400">
                    <Star size={10} fill="currentColor" /> {order.deliveryPartnerId?.rating || "4.9"}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-white/20"></div>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest truncate">
                    {order.deliveryPartnerId?.vehicleNumber || "Verified Driver"}
                  </span>
                </div>
              </div>
              {order.deliveryPartnerId?.phone && (
                <a
                  href={`tel:${order.deliveryPartnerId.phone}`}
                  className="w-12 h-12 rounded-2xl bg-[#00c982] flex items-center justify-center text-white shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                >
                  <Phone size={20} strokeWidth={3} />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default OrderTrackingPage;
