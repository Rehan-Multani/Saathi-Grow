import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search, MapPin, Package, ArrowLeft,
    Loader2, Bike, Phone, MessageCircle, ChevronUp, ChevronDown, Navigation
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as vendorOrderApi from '../../api/vendorOrderApi';
import { GoogleMap, MarkerF, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { ref, onValue, off } from 'firebase/database';
import { toast } from 'react-toastify';
import { db } from '../../../../config/firebase';
import { useVendor } from '../../contexts/VendorContext';
import { formatCurrency } from '../../../../common/utils/formatUtils';
import { ASSET_URLS } from '../../../../constants/assetUrls';

const GOOGLE_MAPS_LIBRARIES = ['places'];
const TRACKABLE_STATUSES = ['preparing', 'ready_for_pickup', 'out_for_delivery'];

const mapContainerStyle = { width: '100%', height: '100%' };

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    fullscreenControl: true,
    gestureHandling: 'greedy',
    styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    ],
};

const toLatLng = (coordinates) => {
    if (!coordinates || coordinates.length < 2) return null;
    const [lng, lat] = coordinates;
    if (!lat && !lng) return null;
    return { lat, lng };
};

const getCustomerPhone = (order) =>
    order?.shippingAddress?.phone || order?.user?.phone || order?.posCustomer?.phone || null;

const getRiderPhone = (order) => {
    const partner = order?.deliveryPartnerId;
    if (!partner || typeof partner === 'string') return null;
    return partner.phone || null;
};

const toTelHref = (phone) => {
    if (!phone) return null;
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length < 10) return null;
    if (digits.length === 10) return `tel:+91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return `tel:+${digits}`;
    return `tel:+${digits}`;
};

const toWhatsAppNumber = (phone) => {
    if (!phone) return null;
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length < 10) return null;
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    return digits;
};

const handleCall = (phone, label) => {
    const href = toTelHref(phone);
    if (!href) {
        toast.error(`No phone number available for ${label}`);
        return;
    }
    window.location.href = href;
};

const handleChat = (phone, label, order, storeName) => {
    const waNumber = toWhatsAppNumber(phone);
    if (!waNumber) {
        toast.error(`No phone number available for ${label}`);
        return;
    }
    const orderRef = order?.orderId || 'your order';
    const message = encodeURIComponent(
        `Hi, this is ${storeName || 'Saathigro store'} regarding order #${orderRef}.`
    );
    window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
};

const normalizeTrackingQuery = (value) => value.trim().toLowerCase().replace(/^#/, '');

const findOrderLocally = (list, query) => {
    const q = normalizeTrackingQuery(query);
    if (!q) return null;
    return list.find((o) => {
        const orderId = (o.orderId || '').toLowerCase();
        const id = String(o._id || '').toLowerCase();
        return orderId === q || orderId.includes(q) || id === q;
    }) || null;
};

const OrderTracking = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { orders, vendor, fetchOrders } = useVendor();
    const [trackingId, setTrackingId] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [riderLocation, setRiderLocation] = useState(null);
    const [panelOpen, setPanelOpen] = useState(true);
    const [map, setMap] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES,
    });

    const storePos = useMemo(
        () => toLatLng(vendor?.address?.location?.coordinates),
        [vendor]
    );

    const defaultCenter = storePos || { lat: 22.7196, lng: 75.8577 };

    const activeOrders = useMemo(
        () => orders.filter(
            (o) => TRACKABLE_STATUSES.includes(o.status) && toLatLng(o.shippingAddress?.location?.coordinates)
        ),
        [orders]
    );

    const destPos = useMemo(
        () => (selectedOrder ? toLatLng(selectedOrder.shippingAddress?.location?.coordinates) : null),
        [selectedOrder]
    );

    useEffect(() => {
        fetchOrders();
    }, []);

    const applyOrderSelection = useCallback((order) => {
        if (!order) return;
        setSelectedOrder(order);
        setTrackingId(order.orderId || '');
        setPanelOpen(true);

        const dest = toLatLng(order.shippingAddress?.location?.coordinates);
        if (map && dest) {
            map.panTo(dest);
            map.setZoom(15);
        } else if (!dest) {
            toast.info('Delivery location is not on the map for this order');
        }
    }, [map]);

    const searchOrder = useCallback(async (query) => {
        const trimmed = query.trim();
        if (!trimmed) return null;

        const local = findOrderLocally(orders, trimmed);
        if (local) return local;

        if (!vendor?.token) return null;
        return vendorOrderApi.lookupVendorOrder(vendor.token, trimmed);
    }, [orders, vendor?.token]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const fromUrl = params.get('search') || params.get('orderId');
        if (!fromUrl || !vendor?.token) return;

        setTrackingId(fromUrl);
        let cancelled = false;

        (async () => {
            setIsSearching(true);
            try {
                const found = await searchOrder(fromUrl);
                if (!cancelled && found) applyOrderSelection(found);
            } catch {
                if (!cancelled) toast.error('Could not load order from link');
            } finally {
                if (!cancelled) setIsSearching(false);
            }
        })();

        return () => { cancelled = true; };
    }, [location.search, vendor?.token]);

    useEffect(() => {
        if (!selectedOrder) {
            setRiderLocation(null);
            return;
        }

        const trackingKey = selectedOrder.deliveryRunId?.toString?.()
            || selectedOrder.deliveryRunId
            || selectedOrder._id;
        if (!trackingKey) return;

        const trackingRef = ref(db, `active_trackings/${trackingKey}`);
        const unsubscribe = onValue(trackingRef, (snapshot) => {
            const data = snapshot.val();
            if (!data?.location) {
                setRiderLocation(null);
                return;
            }
            const { lat, lng } = data.location;
            if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
                setRiderLocation({ lat, lng });
            }
        });

        return () => off(trackingRef, 'value', unsubscribe);
    }, [selectedOrder]);

    const fitMapToPoints = useCallback((points) => {
        if (!map || !points.length || !window.google?.maps) return;
        const bounds = new window.google.maps.LatLngBounds();
        points.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds, { top: 100, bottom: panelOpen ? 280 : 80, left: 40, right: 40 });
    }, [map, panelOpen]);

    useEffect(() => {
        if (!map || !selectedOrder) return;
        const points = [storePos, destPos, riderLocation].filter(Boolean);
        if (points.length) fitMapToPoints(points);
    }, [map, selectedOrder, storePos, destPos, riderLocation, fitMapToPoints]);

    const handleSearch = async (e) => {
        e.preventDefault();
        const query = trackingId.trim();
        if (!query) {
            toast.warn('Enter a tracking ID');
            return;
        }

        setIsSearching(true);
        try {
            const found = await searchOrder(query);
            if (!found) {
                toast.error('Order not found for this store');
                setSelectedOrder(null);
                return;
            }

            applyOrderSelection(found);
            fetchOrders();
            toast.success(`Showing order #${found.orderId}`);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to search order';
            toast.error(msg);
        } finally {
            setIsSearching(false);
        }
    };

    const routeLine = useMemo(() => {
        const points = [];
        if (storePos) points.push(storePos);
        if (riderLocation) points.push(riderLocation);
        else if (storePos && destPos) points.push(destPos);
        if (destPos && (!riderLocation || points[points.length - 1] !== destPos)) {
            if (!points.length || points[points.length - 1] !== destPos) points.push(destPos);
        }
        return points.length >= 2 ? points : [];
    }, [storePos, destPos, riderLocation]);

    const statusLabel = (status) => (status || '').replace(/_/g, ' ');

    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3 text-center px-6">
                <MapPin size={32} className="text-red-400" />
                <p className="text-sm font-bold text-gray-700">Map failed to load. Check your Google Maps API key.</p>
            </div>
        );
    }

    return (
        <div className="-m-4 md:-m-6 relative w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] h-[calc(100vh-4rem)] overflow-hidden rounded-none">
            {/* Full-screen map */}
            <div className="absolute inset-0 z-0">
                {!isLoaded ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                        <Loader2 size={36} className="text-[#0c831f] animate-spin mb-3" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading map...</p>
                    </div>
                ) : (
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={riderLocation || destPos || defaultCenter}
                        zoom={14}
                        options={mapOptions}
                        onLoad={setMap}
                    >
                        {storePos && (
                            <MarkerF
                                position={storePos}
                                icon={{
                                    url: ASSET_URLS.store,
                                    scaledSize: new window.google.maps.Size(36, 36),
                                    anchor: new window.google.maps.Point(18, 18),
                                }}
                            />
                        )}

                        {!selectedOrder && activeOrders.map((order) => {
                            const pos = toLatLng(order.shippingAddress?.location?.coordinates);
                            if (!pos) return null;
                            return (
                                <MarkerF
                                    key={order._id}
                                    position={pos}
                                    onClick={() => { setSelectedOrder(order); setPanelOpen(true); }}
                                    icon={{
                                        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                                        scaledSize: new window.google.maps.Size(28, 28),
                                    }}
                                />
                            );
                        })}

                        {selectedOrder && destPos && (
                            <MarkerF
                                position={destPos}
                                icon={{
                                    url: ASSET_URLS.house,
                                    scaledSize: new window.google.maps.Size(40, 40),
                                    anchor: new window.google.maps.Point(20, 20),
                                }}
                            />
                        )}

                        {selectedOrder && riderLocation && (
                            <MarkerF
                                position={riderLocation}
                                icon={{
                                    url: ASSET_URLS.bike,
                                    scaledSize: new window.google.maps.Size(44, 44),
                                    anchor: new window.google.maps.Point(22, 22),
                                }}
                                zIndex={10}
                            />
                        )}

                        {routeLine.length >= 2 && (
                            <Polyline
                                path={routeLine}
                                options={{
                                    strokeColor: '#0c831f',
                                    strokeOpacity: 0.85,
                                    strokeWeight: 4,
                                    lineCap: 'round',
                                }}
                            />
                        )}
                    </GoogleMap>
                )}
            </div>

            {/* Top bar overlay */}
            <div className="absolute top-0 left-0 right-0 z-20 p-3 md:p-4">
                <div className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-lg p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => navigate('/vendor/orders')}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={16} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-sm font-bold text-gray-900 leading-tight">Live Tracking</h1>
                            <p className="text-[10px] text-gray-500 font-medium">Real-time delivery monitoring</p>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-[#0c831f] bg-white transition-colors">
                            <Search className="text-gray-400 shrink-0" size={15} />
                            <input
                                type="text"
                                placeholder="Tracking ID (e.g. SG-ORD-5192)"
                                className="search-input-plain flex-1 min-w-0 text-xs font-bold uppercase text-gray-800 placeholder:text-gray-400 placeholder:normal-case placeholder:font-medium"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="px-4 bg-[#0c831f] text-white rounded-lg text-[10px] font-bold tracking-widest hover:bg-[#0a6b19] transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5 min-w-[72px] justify-center"
                        >
                            {isSearching ? <Loader2 size={14} className="animate-spin" /> : null}
                            {isSearching ? '...' : 'TRACK'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Hint when nothing selected */}
            {!selectedOrder && isLoaded && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 max-w-sm w-[calc(100%-2rem)]">
                    <div className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-center">
                        <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">Enter Tracking ID</p>
                        <p className="text-[11px] text-gray-500 mt-1">
                            {activeOrders.length > 0
                                ? `${activeOrders.length} active deliver${activeOrders.length === 1 ? 'y' : 'ies'} on map — tap a pin or search by ID`
                                : 'Search an active order to view delivery progress and rider location'}
                        </p>
                    </div>
                </div>
            )}

            {/* Order details bottom panel */}
            {selectedOrder && (
                <div className={`absolute left-0 right-0 z-20 transition-all duration-300 ${panelOpen ? 'bottom-0' : 'bottom-0 translate-y-[calc(100%-2.5rem)]'}`}>
                    <div className="bg-white border-t border-gray-100 rounded-t-2xl shadow-2xl mx-0 max-h-[45vh] overflow-hidden flex flex-col">
                        <button
                            type="button"
                            onClick={() => setPanelOpen((o) => !o)}
                            className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-gray-600"
                        >
                            {panelOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                        </button>

                        {panelOpen && (
                            <div className="px-4 pb-4 overflow-y-auto space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <span className="text-[10px] font-black text-[#0c831f] uppercase tracking-widest">
                                            #{selectedOrder.orderId}
                                        </span>
                                        <h2 className="text-base font-bold text-gray-900 mt-0.5 capitalize">
                                            {statusLabel(selectedOrder.status)}
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {selectedOrder.user?.name || selectedOrder.shippingAddress?.name || 'Customer'}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-black text-gray-900">
                                            {formatCurrency(selectedOrder.totalAmount)}
                                        </p>
                                        {riderLocation ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0c831f] mt-1">
                                                <span className="w-1.5 h-1.5 bg-[#0c831f] rounded-full animate-pulse" />
                                                Live rider
                                            </span>
                                        ) : selectedOrder.status === 'out_for_delivery' ? (
                                            <span className="text-[10px] font-bold text-amber-600 mt-1">Waiting for rider GPS</span>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5">
                                    <MapPin size={14} className="text-[#0c831f] shrink-0 mt-0.5" />
                                    <p className="font-medium leading-snug">
                                        {selectedOrder.shippingAddress?.street
                                            || selectedOrder.shippingAddress?.addressLine1
                                            || selectedOrder.shippingAddress?.city
                                            || 'Address not available'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleCall(getCustomerPhone(selectedOrder), 'customer')}
                                        disabled={!getCustomerPhone(selectedOrder)}
                                        className="py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-wide text-gray-700 flex items-center justify-center gap-1.5 hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Phone size={12} /> Call
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleChat(getCustomerPhone(selectedOrder), 'customer', selectedOrder, vendor?.storeName)}
                                        disabled={!getCustomerPhone(selectedOrder)}
                                        className="py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] font-bold uppercase tracking-wide text-emerald-700 flex items-center justify-center gap-1.5 hover:bg-emerald-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <MessageCircle size={12} /> Chat
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleCall(getRiderPhone(selectedOrder), 'rider')}
                                        disabled={!getRiderPhone(selectedOrder)}
                                        className="py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-wide text-gray-700 flex items-center justify-center gap-1.5 hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Phone size={12} /> Call Rider
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleChat(getRiderPhone(selectedOrder), 'rider', selectedOrder, vendor?.storeName)}
                                        disabled={!getRiderPhone(selectedOrder)}
                                        className="py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] font-bold uppercase tracking-wide text-emerald-700 flex items-center justify-center gap-1.5 hover:bg-emerald-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <MessageCircle size={12} /> Chat Rider
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fitMapToPoints([storePos, destPos, riderLocation].filter(Boolean))}
                                        className="col-span-2 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-wide text-gray-700 flex items-center justify-center gap-1.5 hover:bg-gray-100 active:scale-95 transition-all"
                                    >
                                        <Navigation size={12} /> Recenter Map
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedOrder(null); setTrackingId(''); }}
                                        className="col-span-2 py-2.5 bg-[#0c831f] text-white rounded-lg text-[10px] font-bold uppercase tracking-wide hover:bg-[#0a6b19] active:scale-95 transition-all"
                                    >
                                        Clear
                                    </button>
                                </div>

                                {selectedOrder.deliveryPartnerId && typeof selectedOrder.deliveryPartnerId === 'object' && (
                                    <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                                        <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                                            <Bike size={18} className="text-[#0c831f]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-900">
                                                {selectedOrder.deliveryPartnerId?.name || 'Delivery Partner'}
                                            </p>
                                            <p className="text-[10px] text-gray-500">
                                                {getRiderPhone(selectedOrder) || 'Phone not on file'}
                                            </p>
                                        </div>
                                        <div className="flex gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleCall(getRiderPhone(selectedOrder), 'rider')}
                                                disabled={!getRiderPhone(selectedOrder)}
                                                className="px-3 py-2 bg-[#0c831f] text-white rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 hover:bg-[#0a6b19] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <Phone size={12} /> Call
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleChat(getRiderPhone(selectedOrder), 'rider', selectedOrder, vendor?.storeName)}
                                                disabled={!getRiderPhone(selectedOrder)}
                                                className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <MessageCircle size={12} /> Chat
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedOrder.items?.length > 0 && (
                                    <div className="border-t border-gray-100 pt-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                            <Package size={12} /> Items ({selectedOrder.items.length})
                                        </p>
                                        <div className="space-y-1 max-h-24 overflow-y-auto">
                                            {selectedOrder.items.slice(0, 4).map((item, i) => (
                                                <div key={i} className="flex justify-between text-[11px]">
                                                    <span className="font-medium text-gray-700 truncate pr-2">
                                                        {item.product?.name || item.name || 'Item'} × {item.quantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderTracking;
