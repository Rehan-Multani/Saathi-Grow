import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Truck, Package, Clock, RefreshCw, Search, 
    ChevronRight, Loader2, Map as MapIcon, 
    User, Smartphone, Info, MapPin, 
    Navigation, PlayCircle, CheckCircle2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
    GoogleMap, 
    useJsApiLoader, 
    Marker, 
    InfoWindow, 
    Polyline,
    MarkerClusterer 
} from '@react-google-maps/api';
import * as api from '../../api/adminDeliveryApi';
import { Link } from 'react-router-dom';
import polyline from '@mapbox/polyline';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1.5rem'
};

const center = {
    lat: 22.7196,
    lng: 75.8577
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    styles: [
        {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "poi",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "transit",
            "stylers": [{ "visibility": "off" }]
        }
    ]
};

const DeliveryTracking = () => {
    const { t } = useTranslation('admin_delivery');
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [map, setMap] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ['places', 'visualization', 'maps']
    });

    const fetchTrackingData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            const data = await api.getActiveTracking();
            setActiveDeliveries(data || []);
        } catch (error) {
            console.error("Tracking fetch failed", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTrackingData();
        const interval = setInterval(() => fetchTrackingData(true), 15000); // More frequent for live tracking
        return () => clearInterval(interval);
    }, [fetchTrackingData]);

    const filteredDeliveries = useMemo(() => {
        return activeDeliveries.filter(d => {
            const partnerName = d.deliveryPartnerId?.name?.toLowerCase() || '';
            const orderId = d.orderId?.toLowerCase() || '';
            const search = searchTerm.toLowerCase();
            return partnerName.includes(search) || orderId.includes(search);
        });
    }, [activeDeliveries, searchTerm]);

    const onMapLoad = useCallback((mapInstance) => {
        setMap(mapInstance);
    }, []);

    const focusOnPartner = (delivery) => {
        setSelectedDelivery(delivery);
        const loc = delivery.deliveryPartnerId?.currentLocation?.coordinates;
        if (loc && map) {
            map.panTo({ lat: loc[1], lng: loc[0] });
            map.setZoom(15);
        }
    };

    if (!isLoaded || (loading && !refreshing)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-slate-400 text-sm font-medium">Initialising Secure Satellite View...</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">{t('tracking.title')}</h1>
                    <p className="text-slate-500 text-xs mt-1 font-medium">{t('tracking.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('tracking.search')}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 transition-all text-xs font-bold text-slate-700 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => fetchTrackingData(true)}
                        disabled={refreshing}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 ${refreshing ? 'opacity-50' : 'hover:border-blue-500'}`}
                    >
                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Google Map View */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden h-[650px] relative ring-8 ring-slate-50/50">
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={center}
                            zoom={12}
                            options={mapOptions}
                            onLoad={onMapLoad}
                        >
                            {filteredDeliveries.map(d => {
                                const partnerLoc = d.deliveryPartnerId?.currentLocation?.coordinates;
                                const customerLoc = d.shippingAddress?.location?.coordinates;
                                
                                // Polyline from encoded string if available
                                const runPolyline = d.deliveryRunId?.optimizedRoute?.encodedPolyline;
                                const polyPoints = runPolyline ? polyline.decode(runPolyline).map(([lat, lng]) => ({ lat, lng })) : [];

                                if (!partnerLoc) return null;

                                return (
                                    <React.Fragment key={d._id}>
                                        {/* Rider Marker */}
                                        <Marker
                                            position={{ lat: partnerLoc[1], lng: partnerLoc[0] }}
                                            onClick={() => setSelectedDelivery(d)}
                                            icon={{
                                                url: d.deliveryPartnerId?.profileImage || '/rider-marker.png',
                                                scaledSize: new window.google.maps.Size(40, 40),
                                                className: 'rounded-full border-2 border-blue-500 bg-white p-0.5'
                                            }}
                                        />

                                        {/* Customer Marker if out for delivery */}
                                        {d.status === 'out_for_delivery' && customerLoc && (
                                            <Marker
                                                position={{ lat: customerLoc[1], lng: customerLoc[0] }}
                                                icon={{
                                                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                                                    scaledSize: new window.google.maps.Size(32, 32)
                                                }}
                                            />
                                        )}

                                        {/* Route Polyline */}
                                        {polyPoints.length > 0 && (
                                            <Polyline
                                                path={polyPoints}
                                                options={{
                                                    strokeColor: "#3b82f6",
                                                    strokeOpacity: 0.8,
                                                    strokeWeight: 4,
                                                    geodesic: true,
                                                }}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}

                            {selectedDelivery && selectedDelivery.deliveryPartnerId?.currentLocation?.coordinates && (
                                <InfoWindow
                                    position={{ 
                                        lat: selectedDelivery.deliveryPartnerId.currentLocation.coordinates[1], 
                                        lng: selectedDelivery.deliveryPartnerId.currentLocation.coordinates[0] 
                                    }}
                                    onCloseClick={() => setSelectedDelivery(null)}
                                >
                                    <div className="p-2 min-w-[200px]">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                                <Truck size={20} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">{selectedDelivery.deliveryPartnerId.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Run ID: {selectedDelivery.deliveryRunId?.runId || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 border-t border-slate-50 pt-3">
                                            <div className="flex justify-between items-center text-[10px] font-bold">
                                                <span className="text-slate-400 uppercase tracking-widest">Order ID</span>
                                                <span className="text-blue-600 font-black">#{selectedDelivery.orderId}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-bold">
                                                <span className="text-slate-400 uppercase tracking-widest">Status</span>
                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg uppercase tracking-tighter">{selectedDelivery.status.replace(/_/g, ' ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    </div>
                </div>

                {/* Right: Active Sessions List */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden h-[650px] flex flex-col ring-8 ring-slate-50/50">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/40 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Navigation size={18} className="text-blue-600" />
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Active Fleet</h3>
                            </div>
                            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-blue-100">{filteredDeliveries.length} Live</span>
                        </div>
                        
                        <div className="overflow-y-auto custom-scrollbar flex-grow bg-white divide-y divide-slate-50">
                            {filteredDeliveries.length > 0 ? filteredDeliveries.map(d => (
                                <div 
                                    key={d._id} 
                                    onClick={() => focusOnPartner(d)}
                                    className={`p-5 cursor-pointer transition-all border-l-4 ${selectedDelivery?._id === d._id ? 'bg-blue-50/50 border-blue-600' : 'hover:bg-slate-50/50 border-transparent'} group`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                                            {d.deliveryPartnerId?.profileImage ? (
                                                <img src={d.deliveryPartnerId.profileImage} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xl italic">{d.deliveryPartnerId?.name?.[0]}</div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-grow">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-bold text-slate-900 uppercase tracking-tight border-b-2 border-transparent group-hover:border-blue-500 transition-all">{d.deliveryPartnerId?.name}</span>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-widest ${
                                                    d.status === 'out_for_delivery' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                    {d.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                                                <Package size={12} className="text-slate-300" /> #{d.orderId}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
                                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                                            <span className="text-slate-400 flex items-center gap-1.5"><MapPin size={10} /> Street</span>
                                            <span className="text-slate-700 truncate max-w-[120px]">{d.shippingAddress?.street || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                                            <span className="text-slate-400 flex items-center gap-1.5"><Clock size={10} /> Updated</span>
                                            <span className="text-slate-700">{new Date(d.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Link 
                                            to={`/admin/delivery/partners/${d.deliveryPartnerId?._id}`}
                                            className="flex-1 py-2 rounded-xl border border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center hover:bg-slate-100 transition-all"
                                        >
                                            View Profile
                                        </Link>
                                        {d.deliveryRunId && (
                                            <div className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest text-center border border-blue-100">
                                                Active Run
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="py-24 text-center px-8">
                                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100 border-dashed">
                                        <navigation className="text-slate-200" size={32} />
                                    </div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No riders are currently out on delivery missions</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default DeliveryTracking;
