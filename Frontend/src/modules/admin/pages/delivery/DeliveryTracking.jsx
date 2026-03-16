import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Spinner, Button } from 'react-bootstrap';
import { Truck, MapPin, Navigation, RefreshCw, Bike, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { getActiveTracking } from '../../api/adminDeliveryApi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';

// Fix for default marker icon missing in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Custom Icons for different vehicle types
const getDriverIcon = (type) => {
    return L.divIcon({
        html: `<div class="bg-primary text-white p-2 rounded-circle shadow-sm border border-white" style="width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;">
                 <i class="lucide-bike"></i>
               </div>`,
        className: 'custom-driver-icon',
        iconSize: [35, 35],
        iconAnchor: [17, 35]
    });
};

const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position && Array.isArray(position) && position.length === 2 &&
            typeof position[0] === 'number' && typeof position[1] === 'number') {
            map.flyTo(position, map.getZoom(), { animate: true });
        }
    }, [position, map]);
    return null;
};

const DeliveryTracking = () => {
    const { t } = useTranslation();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

    const fetchTracking = async () => {
        try {
            const data = await getActiveTracking();
            setDeliveries(data);
        } catch (error) {
            console.error("Failed to fetch tracking data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTracking();
        const interval = setInterval(fetchTracking, refreshInterval);
        return () => clearInterval(interval);
    }, []);

    const centerPosition = deliveries.length > 0 && deliveries[0].deliveryPartnerId?.currentLocation?.coordinates
        ? [deliveries[0].deliveryPartnerId.currentLocation.coordinates[1], deliveries[0].deliveryPartnerId.currentLocation.coordinates[0]]
        : [22.7196, 75.8577]; // Default to Indore if no data

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-0">{t('delivery.tracking.title')}</h4>
                    <p className="text-muted small mb-0">{t('delivery.tracking.subtitle')}</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="light" size="sm" onClick={fetchTracking} disabled={loading}>
                        <RefreshCw size={16} className={loading ? 'spin' : ''} />
                    </Button>
                </div>
            </div>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{ minHeight: '600px', backgroundColor: '#f8f9fa' }}>
                        {loading && !deliveries.length ? (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3 text-muted">{t('delivery.tracking.initializing_map')}</p>
                            </div>
                        ) : (
                            <MapContainer
                                center={centerPosition}
                                zoom={13}
                                scrollWheelZoom={true}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                                    attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                                />
                                {selectedDelivery?.deliveryPartnerId?.currentLocation?.coordinates && (
                                    <RecenterMap
                                        position={[
                                            selectedDelivery.deliveryPartnerId.currentLocation.coordinates[1],
                                            selectedDelivery.deliveryPartnerId.currentLocation.coordinates[0]
                                        ]}
                                    />
                                )}
                                {deliveries.map((item) => {
                                    const coords = item.deliveryPartnerId?.currentLocation?.coordinates;
                                    if (!coords || (coords[0] === 0 && coords[1] === 0)) return null;

                                    return (
                                        <Marker
                                            key={item._id}
                                            position={[coords[1], coords[0]]}
                                            icon={DefaultIcon}
                                        >
                                            <Popup className="custom-popup">
                                                <div className="p-1">
                                                    <div className="fw-bold mb-1">{item.deliveryPartnerId.name}</div>
                                                    <div className="small text-muted mb-2">{t('delivery.tracking.order')}: {item.orderId}</div>
                                                    <Badge bg={item.status === 'out_for_delivery' ? 'primary' : 'warning'} className="fw-normal mb-2">
                                                        {item.status === 'out_for_delivery' ? t('delivery.tracking.in_transit') : t('delivery.tracking.prep')}
                                                    </Badge>
                                                    <div className="d-grid mt-2">
                                                        <Button variant="soft-primary" size="sm" onClick={() => setSelectedDelivery(item)}>
                                                            {t('delivery.tracking.detailed')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                        )}
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold">{t('delivery.tracking.active_fleet', { count: deliveries.length })}</h6>
                            <Badge bg="success" className="bg-opacity-10 text-success fw-normal px-2 py-1">{t('delivery.tracking.online')}</Badge>
                        </Card.Header>
                        <Card.Body className="p-0 overflow-auto" style={{ maxHeight: 'calc(600px - 60px)' }}>
                            {deliveries.length === 0 ? (
                                <div className="p-5 text-center text-muted">
                                    <Truck size={32} className="opacity-25 mb-3" />
                                    <p className="small mb-0">{t('delivery.tracking.no_active')}</p>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {deliveries.map((item) => (
                                        <div
                                            key={item._id}
                                            className={`list-group-item p-3 border-light cursor-pointer hover-bg-light transition-all ${selectedDelivery?._id === item._id ? 'bg-primary bg-opacity-10' : ''}`}
                                            onClick={() => setSelectedDelivery(item)}
                                        >
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <span className="fw-bold text-dark">{item.orderId}</span>
                                                    <div className="small text-muted">{item.user?.name}</div>
                                                </div>
                                                <Badge bg={item.status === 'out_for_delivery' ? 'primary' : 'warning'} className="rounded-pill fw-normal">
                                                    {item.status === 'out_for_delivery' ? t('delivery.tracking.in_transit') : t('delivery.tracking.pickup')}
                                                </Badge>
                                            </div>

                                            <div className="d-flex align-items-center gap-3 mt-3">
                                                <div className="avatar avatar-sm bg-light rounded-circle p-2">
                                                    <Bike size={16} className="text-primary" />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="fw-medium d-flex align-items-center justify-content-between">
                                                        <span className="small">{item.deliveryPartnerId?.name}</span>
                                                        <span className="text-muted" style={{ fontSize: '10px' }}>{item.deliveryPartnerId?.vehicleNumber}</span>
                                                    </div>
                                                    <div className="mt-1 small text-secondary">
                                                        <MapPin size={12} className="me-1" />
                                                        <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                                                            {item.shippingAddress?.street}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                        <Card.Footer className="bg-white border-0 py-3 text-center">
                            <div className="small text-muted">
                                <RefreshCw size={12} className="me-1" /> {t('delivery.tracking.auto_sync')}
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DeliveryTracking;
