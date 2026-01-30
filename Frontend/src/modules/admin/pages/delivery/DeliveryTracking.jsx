import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { Truck, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const TRACKING_MOCK = [
    { id: 'DEL-089', driver: 'Mike Ross', status: 'In Transit', location: '5th Ave, NY', lat: 40.7128, lng: -74.0060, orderId: 'ORD-8750' },
    { id: 'DEL-090', driver: 'John Doe', status: 'Picked Up', location: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969, orderId: 'ORD-8755' },
    { id: 'DEL-088', driver: 'Harvey Specter', status: 'Delivered', location: 'Central Park', lat: 40.785091, lng: -73.968285, orderId: 'ORD-8740' },
];

const DeliveryTracking = () => {
    // Center map around New York for demo
    const centerPosition = [40.7128, -74.0060];

    return (
        <div className="p-3">
            <h4 className="fw-bold mb-4">Live Delivery Tracking</h4>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100 overflow-hidden" style={{ minHeight: '500px' }}>
                        <MapContainer center={centerPosition} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                            {/* OpenStreetMap Tiles - Free to use */}
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {TRACKING_MOCK.map((item, idx) => (
                                <Marker key={idx} position={[item.lat, item.lng]}>
                                    <Popup>
                                        <div className="d-flex flex-column gap-1">
                                            <strong>{item.driver}</strong>
                                            <span className="text-muted small">{item.status}</span>
                                            <span className="text-primary small">{item.id}</span>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-0 py-3">
                            <h6 className="mb-0 fw-bold">Active Deliveries</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="list-group list-group-flush">
                                {TRACKING_MOCK.map((item, idx) => (
                                    <div key={idx} className="list-group-item p-3 border-light cursor-pointer">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="fw-bold text-dark">{item.id}</span>
                                            <Badge bg={
                                                item.status === 'Delivered' ? 'success' :
                                                    item.status === 'In Transit' ? 'primary' : 'warning'
                                            } className="rounded-pill fw-normal">
                                                {item.status}
                                            </Badge>
                                        </div>
                                        <div className="small text-muted mb-1">Order: {item.orderId}</div>
                                        <div className="d-flex align-items-center gap-2 small">
                                            <div className="bg-light p-1 rounded-circle">
                                                <Truck size={12} />
                                            </div>
                                            <span className="fw-medium">{item.driver}</span>
                                        </div>
                                        <div className="mt-2 small text-secondary fst-italic">
                                            <MapPin size={12} className="me-1" /> {item.location}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DeliveryTracking;
