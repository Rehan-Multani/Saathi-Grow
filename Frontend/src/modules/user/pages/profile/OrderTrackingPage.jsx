import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../../../config/firebase';
import { ref, onValue, off } from 'firebase/database';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.marker.slideto';
import { ArrowLeft, Navigation, Phone, MessageSquare, Package, CheckCircle, Truck, Info, PhoneCall } from 'lucide-react';
import * as orderApi from '../../api/orderApi';
import { useAuth } from '../../context/AuthContext';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Bike Icon
const bikeIcon = (heading) => L.divIcon({
  html: `<div style="transform: rotate(${heading}deg); transition: transform 0.3s; width: 44px; height: 44px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0px 4px 10px rgba(0,0,0,0.15); border: 2px solid #0c831f;">
              <span style="font-size: 20px;">🛵</span>
            </div>`,
  className: 'custom-bike-icon',
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

// Destination Icon
const destIcon = L.divIcon({
  html: `<div style="width: 30px; height: 30px; background: #0c831f; border-radius: 50%; border: 3px solid white; box-shadow: 0px 4px 6px rgba(0,0,0,0.2);"></div>`,
  className: 'custom-dest-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
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
      icon={bikeIcon(heading)}
    />
  );
};

const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (!id) return;

    // Listen to Firebase RTDB for Driver Location Updates
    const trackingRef = ref(db, `active_trackings/${id}`);
    const unsubscribe = onValue(trackingRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.location) {
        setDriverLocation([data.location.lat, data.location.lng]);
        if (data.heading !== undefined) setHeading(data.heading);
      }
    });

    return () => {
      off(trackingRef, 'value', unsubscribe);
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0c831f]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-black">
        <p className="text-gray-500 mb-4 font-bold">Failed to load order data.</p>
        <button onClick={() => navigate('/orders')} className="bg-[#0c831f] text-white px-6 py-2 rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  const shippingCoords = order.shippingAddress?.location?.coordinates;
  const destPosition = shippingCoords ? [shippingCoords[1], shippingCoords[0]] : [22.7196, 75.8577];

  // Default to destPosition if driver location not yet received
  const mapCenter = driverLocation || destPosition;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-black flex flex-col md:relative md:min-h-screen md:bg-gray-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 bg-gradient-to-b from-white to-transparent dark:from-black">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-800 dark:text-gray-200">
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative w-full h-[60vh] md:h-[70vh]">
        <MapContainer center={mapCenter} zoom={16} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <ChangeView center={mapCenter} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />

          <Marker position={destPosition} icon={destIcon}>
            <Popup>Delivery Address</Popup>
          </Marker>

          {driverLocation && (
            <>
              <AnimatedMarker position={driverLocation} heading={heading} />
              <Polyline positions={[driverLocation, destPosition]} color="#0c831f" weight={5} opacity={0.6} dashArray="8, 8" />
            </>
          )}
        </MapContainer>

        {/* Live Badge */}
        <div className="absolute top-6 right-4 z-[1000] px-3 py-1.5 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-200">Live</span>
        </div>
      </div>

      {/* Bottom Info Card */}
      <div className="bg-white dark:bg-zinc-950 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] -mt-6 z-[1010] relative flex-shrink-0 flex flex-col">
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mt-3"></div>

        <div className="px-6 pb-6 pt-4 flex-1 overflow-y-auto w-full max-w-2xl mx-auto">
          {/* Time Estimate */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">Arriving in <br /><span className="text-[#0c831f]">10 mins</span></h2>
              <p className="text-gray-500 dark:text-gray-400 font-bold text-sm tracking-tight mt-1">Your order is on the way</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center border border-green-100 dark:border-green-500/20">
              <Truck size={28} className="text-[#0c831f]" />
            </div>
          </div>

          {/* Rider Info (Mocked if no driver details) */}
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm border border-gray-100 p-1">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Rider${id}`} alt="Rider" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 dark:text-white text-base leading-none mb-1">Rajesh Kumar</h4>
                <p className="text-xs text-gray-500 font-bold tracking-tight">Delivery Partner â€¢ MP-09-XX-1234</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
                <MessageSquare size={16} />
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0c831f] text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-md shadow-green-500/20">
                <PhoneCall size={16} /> <span className="md:hidden">Call</span>
              </button>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="px-2">
            <div className="relative border-l-2 border-[#0c831f] pl-6 pb-6 w-full">
              <div className="absolute w-4 h-4 bg-[#0c831f] rounded-full -left-[9px] top-0 border-4 border-white dark:border-black shadow-sm"></div>
              <h4 className="font-black text-sm text-gray-900 dark:text-white leading-none">Order Picked Up</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Rajesh has picked up your order from the store.</p>
            </div>
            <div className="relative border-l-2 border-dashed border-gray-200 dark:border-gray-800 pl-6 w-full">
              <div className="absolute w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded-full -left-[9px] -top-1 border-4 border-white dark:border-black"></div>
              <h4 className="font-black text-sm text-gray-400 leading-none">Delivering to your home</h4>
              <p className="text-xs text-gray-400 font-medium mt-1">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
