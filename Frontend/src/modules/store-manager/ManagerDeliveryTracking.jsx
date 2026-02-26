import React, { useState, useEffect, useRef } from 'react';
import { Card, Spinner, Button, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import { MapPin, Truck, RefreshCcw, Navigation, User, Store, Phone } from 'lucide-react';
import { getActiveTracking } from '../admin/api/adminDeliveryApi';
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
    const interval = setInterval(fetchTrackingData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (window.google && mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // Default India center
        zoom: 12,
        styles: [
          {
            "featureType": "all",
            "elementType": "geometry.fill",
            "stylers": [{ "weight": "2.00" }]
          },
          {
            "featureType": "all",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#9c9c9c" }]
          },
          {
            "featureType": "all",
            "elementType": "labels.text",
            "stylers": [{ "visibility": "on" }]
          }
        ]
      });
      setMap(newMap);
    }
  }, [loading]);

  // Update Markers
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear old markers that are no longer active
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
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#0d6efd',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#fff',
              rotation: 0 // Could derive from course/heading if available
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
      <div className="d-flex justify-content-center align-items-center min-h-[500px]">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Live Delivery Map</h4>
          <p className="text-muted small">Real-time tracking for branch: <strong>{managerUser?.branchId?.name}</strong></p>
        </div>
        <Button variant="outline-primary" size="sm" onClick={fetchTrackingData} className="rounded-pill px-3 shadow-none">
          <RefreshCcw size={16} className="me-2" /> Sync Live Feed
        </Button>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden" style={{ height: '600px' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '500px' }}></div>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-xl h-100 overflow-hidden">
            <Card.Header className="bg-white py-3 border-0">
              <h6 className="fw-bold mb-0 text-slate-700">Active Shipments ({activeDeliveries.length})</h6>
            </Card.Header>
            <Card.Body className="p-0 overflow-auto" style={{ maxHeight: '530px' }}>
              {activeDeliveries.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <Navigation size={40} className="mb-3 opacity-20" />
                  <p className="small">No active deliveries on the map.</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {activeDeliveries.map((order) => (
                    <ListGroup.Item
                      key={order._id}
                      action
                      active={selectedOrder?._id === order._id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-3 border-start-4 transition-all ${selectedOrder?._id === order._id ? 'border-primary bg-primary-subtle' : 'border-transparent'}`}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="fw-bold text-slate-800">{order.orderId}</span>
                        <Badge bg={order.status === 'out_for_delivery' ? 'primary' : 'warning-subtle'} className={order.status === 'out_for_delivery' ? '' : 'text-warning font-semibold'}>
                          {order.status === 'out_for_delivery' ? 'In Transit' : 'Preparing'}
                        </Badge>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-1 small text-slate-600">
                        <Truck size={14} className="text-primary" />
                        <span className="fw-medium">{order.deliveryPartnerId?.name}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 small text-slate-500">
                        <User size={14} />
                        <span className="text-truncate">{order.user?.name}</span>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
            {selectedOrder && (
              <Card.Footer className="bg-slate-50 border-0 p-3">
                <h6 className="small fw-bold text-uppercase text-slate-500 mb-2">Details</h6>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="small font-medium text-slate-700">
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <Store size={12} className="text-slate-400" /> {selectedOrder.branchId?.name}
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <Phone size={12} className="text-slate-400" /> {selectedOrder.deliveryPartnerId?.phone}
                    </div>
                  </div>
                  <Button size="sm" variant="primary" className="rounded-pill px-3 shadow-none">View Order</Button>
                </div>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManagerDeliveryTracking;
