import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Truck, RefreshCcw, Navigation as NavIcon, User, Store, Phone, Loader2, Navigation2, Ship } from 'lucide-react';
import { getActiveTracking } from '../../common/api/adminDeliveryApi';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import { toast } from 'react-toastify';

const ManagerDeliveryTracking = () => {
    const { managerUser } = useStoreManagerAuth();
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const markersRef = useRef({});

    const fetchTrackingData = async () => {
        try {
            setLoading(true);
            const data = await getActiveTracking();
            setActiveDeliveries(data);
            if (data.length > 0 && !selectedOrder) {
                setSelectedOrder(data[0]);
            }
        } catch (error) {
            toast.error('Failed to sync live tracking data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrackingData();
        const interval = setInterval(fetchTrackingData, 30000); 
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (window.google && mapRef.current && !map) {
            const newMap = new window.google.maps.Map(mapRef.current, {
                center: { lat: 20.5937, lng: 78.9629 },
                zoom: 12,
                disableDefaultUI: false,
                clickableIcons: false,
                styles: [
                    {
                        "featureType": "all",
                        "elementType": "geometry.fill",
                        "stylers": [{ "weight": "2.00" }]
                    },
                    {
                        "featureType": "all",
                        "elementType": "geometry.stroke",
                        "stylers": [{ "color": "#e2e8f0" }]
                    },
                    {
                        "featureType": "landscape",
                        "stylers": [{ "color": "#f8fafc" }]
                    },
                    {
                        "featureType": "water",
                        "stylers": [{ "color": "#e2e8f0" }]
                    }
                ]
            });
            setMap(newMap);
        }
    }, [loading]);

    useEffect(() => {
        if (!map || !window.google) return;

        Object.keys(markersRef.current).forEach(id => {
            if (!activeDeliveries.find(d => d._id === id)) {
                markersRef.current[id].setMap(null);
                delete markersRef.current[id];
            }
        });

        const bounds = new window.google.maps.LatLngBounds();
        let hasPoints = false;

        activeDeliveries.forEach(order => {
            const partner = order.deliveryPartnerId;
            if (partner?.currentLocation?.coordinates) {
                const pos = {
                    lat: partner.currentLocation.coordinates[1],
                    lng: partner.currentLocation.coordinates[0]
                };

                if (markersRef.current[order._id]) {
                    markersRef.current[order._id].setPosition(pos);
                } else {
                    const marker = new window.google.maps.Marker({
                        position: pos,
                        map: map,
                        title: `Order: ${order.orderId}`,
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#2563eb',
                            fillOpacity: 1,
                            strokeWeight: 4,
                            strokeColor: '#ffffff',
                        }
                    });

                    marker.addListener('click', () => {
                        setSelectedOrder(order);
                    });

                    markersRef.current[order._id] = marker;
                }
                bounds.extend(pos);
                hasPoints = true;
            }
        });

        if (hasPoints && !selectedOrder) {
            map.fitBounds(bounds);
        } else if (selectedOrder?.deliveryPartnerId?.currentLocation?.coordinates) {
            const center = {
                lat: selectedOrder.deliveryPartnerId.currentLocation.coordinates[1],
                lng: selectedOrder.deliveryPartnerId.currentLocation.coordinates[0]
            };
            map.panTo(center);
            map.setZoom(15);
        }
    }, [activeDeliveries, map, selectedOrder]);

    if (loading && activeDeliveries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading map...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Assign Deliveries</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage and assign orders to delivery partners.</p>
                </div>
                <button 
                    onClick={fetchTrackingData} 
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm transition-all active:scale-95"
                >
                    <RefreshCcw size={14} className={loading && activeDeliveries.length > 0 ? "animate-spin" : ""} /> Refresh Map
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Map View */}
                <div className="w-full lg:w-2/3 h-full rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm flex flex-col relative">
                    <div ref={mapRef} className="w-full flex-1"></div>
                    
                    {/* Floating Overlay for Selected Order */}
                    {selectedOrder && (
                        <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-80 bg-slate-900 text-white p-5 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-5 border border-slate-800">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Active Tracker</p>
                                    <h3 className="text-lg font-bold">#{selectedOrder.orderId}</h3>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400">
                                    <X size={18} />
                                </button>
                            </div>
                            
                            <div className="space-y-3 pt-4 border-t border-white/10 text-slate-300">
                                <div className="flex items-center gap-3">
                                    <Truck size={16} className="text-blue-400" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-500">Delivery Partner</p>
                                        <p className="text-sm font-bold text-white truncate">{selectedOrder.deliveryPartnerId?.name || 'Unassigned'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User size={16} className="text-blue-400" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase font-bold text-slate-500">Customer</p>
                                        <p className="text-sm font-bold text-white truncate">{selectedOrder.user?.name || 'Guest User'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Sidebar */}
                <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50 shrink-0">
                        <h2 className="font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                            <Activity size={18} className="text-blue-600" /> In-Transit ({activeDeliveries.length})
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar divide-y divide-slate-50">
                        {activeDeliveries.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400">
                                <MapPin size={48} className="mb-4 opacity-10" />
                                <p className="text-sm font-bold uppercase tracking-widest">No Active Routes</p>
                                <p className="text-[11px] font-medium mt-1">Pending shipments will appear here once dispatched.</p>
                            </div>
                        ) : (
                            activeDeliveries.map((order) => (
                                <div
                                    key={order._id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`p-4 rounded-2xl transition-all cursor-pointer group mb-1 ${selectedOrder?._id === order._id ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'hover:bg-slate-50 bg-white'}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`font-bold text-sm tracking-tight ${selectedOrder?._id === order._id ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'}`}>#{order.orderId}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${selectedOrder?._id === order._id ? 'bg-white/20 text-white border border-white/20' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                            Transit
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className={`flex items-center gap-2.5 text-xs font-bold ${selectedOrder?._id === order._id ? 'text-white/80' : 'text-slate-600'}`}>
                                            <div className={`p-1 rounded-lg ${selectedOrder?._id === order._id ? 'bg-white/10' : 'bg-slate-100'}`}>
                                                <Truck size={12} />
                                            </div>
                                            <span className="truncate">{order.deliveryPartnerId?.name || 'Unassigned'}</span>
                                        </div>
                                        <div className={`flex items-center gap-2.5 text-xs font-bold ${selectedOrder?._id === order._id ? 'text-white/80' : 'text-slate-600'}`}>
                                            <div className={`p-1 rounded-lg ${selectedOrder?._id === order._id ? 'bg-white/10' : 'bg-slate-100'}`}>
                                                <User size={12} />
                                            </div>
                                            <span className="truncate">{order.user?.name || 'Guest User'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
};

export default ManagerDeliveryTracking;
