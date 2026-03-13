import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Badge, Button, Table, Spinner } from 'react-bootstrap';
import {
    Truck, Phone, Mail, MapPin, Calendar,
    ChevronLeft, Package, Clock, CheckCircle,
    DollarSign, Activity, CreditCard
} from 'lucide-react';
import axios from 'axios';
import DeliveryPartnerEditModal from '../../components/delivery/DeliveryPartnerEditModal';
import OrderDetailsModal from '../../components/orders/OrderDetailsModal';
import { getDeliveryPartnerById, updateDeliveryPartner } from '../../api/adminDeliveryApi';
import { showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const PartnerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [locationName, setLocationName] = useState('Fetching address...');

    useEffect(() => {
        fetchPartnerDetails();
    }, [id]);

    useEffect(() => {
        if (partner?.currentLocation?.coordinates) {
            const [lng, lat] = partner.currentLocation.coordinates;
            if (lat !== 0 || lng !== 0) {
                reverseGeocode(lat, lng);
            } else {
                setLocationName('Location not tracked');
            }
        }
    }, [partner]);

    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`);
            if (response.data.results && response.data.results[0]) {
                setLocationName(response.data.results[0].formatted_address);
            } else {
                setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
    };

    const fetchPartnerDetails = async () => {
        try {
            setLoading(true);
            const data = await getDeliveryPartnerById(id);
            setPartner(data);
        } catch (error) {
            console.error('Error fetching partner details:', error);
            showErrorAlert('Error', 'Failed to fetch partner details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (updatedPartner) => {
        try {
            await updateDeliveryPartner(id, updatedPartner);
            fetchPartnerDetails();
            await showSuccessAlert('Profile Updated!', 'The partner profile has been successfully updated.');
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating partner:', error);
            showErrorAlert('Error', 'Failed to update partner profile');
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="p-4 text-center bg-light min-vh-100">
                <h3>Partner not found</h3>
                <Button variant="primary" onClick={() => navigate(-1)} className="mt-3">
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="p-2 p-md-4 bg-light min-vh-100">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
                <div className="d-flex align-items-center gap-2 gap-md-3 flex-grow-1">
                    <Button
                        variant="white"
                        onClick={() => navigate(-1)}
                        className="rounded-circle shadow-sm p-2 border shrink-0"
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div className="d-flex align-items-center gap-3 overflow-hidden">
                        {partner.profileImage ? (
                            <img 
                                src={partner.profileImage} 
                                alt={partner.name} 
                                className="rounded-circle object-cover border shadow-sm shrink-0"
                                style={{ width: 60, height: 60 }}
                            />
                        ) : (
                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center border shrink-0" style={{ width: 60, height: 60 }}>
                                <Truck size={30} />
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <h4 className="fw-bold mb-0 text-truncate">{partner.name}</h4>
                            <div className="d-flex flex-wrap align-items-center gap-2 text-muted small mt-1">
                                <span className="badge bg-primary bg-opacity-10 text-primary px-2">{partner.vehicleType}</span>
                                <span className="text-secondary opacity-50">|</span>
                                <span className="text-truncate">ID: {partner.uniqueId}</span>
                                <span className="text-secondary opacity-50">|</span>
                                <span className={`fw-bold d-flex align-items-center gap-1 ${partner.authStatus === 'Active' ? 'text-success' : 'text-danger'}`}>
                                    <CheckCircle size={14} /> {partner.authStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="d-flex gap-2 w-100 w-md-auto">
                    <Button
                        variant="outline-primary"
                        className="shadow-sm flex-grow-1 flex-md-grow-0"
                        onClick={() => setShowEditModal(true)}
                    >
                        Edit Profile
                    </Button>
                    <Button
                        variant="primary"
                        className="shadow-sm flex-grow-1 flex-md-grow-0"
                        onClick={() => navigate('/admin/delivery/assign')}
                    >
                        Assign New Order
                    </Button>
                </div>
            </div>

            <Row className="g-3 g-md-4">
                {/* Left Column - Stats & Info */}
                <Col lg={8}>
                    {/* Key Metrics */}
                    <Row className="g-2 g-md-3 mb-4">
                        {[
                            { label: 'Total Deliveries', value: partner.totalDeliveries || 0, icon: <Package size={20} />, color: 'blue' },
                            { label: 'Cash In Hand', value: `₹${partner.cashInHand || 0}`, icon: <DollarSign size={20} />, color: 'green' }
                        ].map((stat, i) => (
                            <Col xs={12} md={6} key={i}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body className="p-3">
                                        <div className={`p-2 rounded bg-${stat.color}-50 text-${stat.color}-600 mb-2 w-fit-content`}>
                                            {stat.icon}
                                        </div>
                                        <div className="text-muted small mb-1">{stat.label}</div>
                                        <div className="h5 fw-bold mb-0">{stat.value}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Recent Delivery List */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white border-bottom-0 py-3 d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold mb-0">Recent Deliveries</h6>
                            <Button variant="link" className="text-decoration-none p-0 small">View All</Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover responsive className="mb-0">
                                <thead className="bg-light text-muted small">
                                    <tr>
                                        <th className="ps-4">ORDER ID</th>
                                        <th>CUSTOMER</th>
                                        <th>DATE</th>
                                        <th>AMOUNT</th>
                                        <th>STATUS</th>
                                        <th className="text-end pe-4">DETAILS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {partner.recentDeliveries && partner.recentDeliveries.length > 0 ? (
                                        partner.recentDeliveries.map((delivery, i) => (
                                            <tr key={i} className="align-middle">
                                                <td className="ps-4 fw-bold">{delivery.orderId}</td>
                                                <td className="text-muted">{delivery.user?.name || 'Walk-in'}</td>
                                                <td className="text-muted small">
                                                    {new Date(delivery.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="fw-bold">₹{delivery.totalAmount}</td>
                                                <td>
                                                    <Badge bg={delivery.status === 'delivered' ? 'success' : 'warning'} className="fw-normal">
                                                        {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1).replace(/_/g, ' ')}
                                                    </Badge>
                                                </td>
                                                 <td className="text-end pe-4">
                                                    <Button variant="light" size="sm" onClick={() => handleViewOrder(delivery)}>View</Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-muted small">No recent deliveries found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    {/* Status Information */}
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom-0 py-3">
                            <h6 className="fw-bold mb-0 text-muted small text-uppercase tracking-wider">Duty & Assignment Information</h6>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3">
                                <Col md={6}>
                                    <div className="p-3 border rounded-3 bg-light bg-opacity-50 h-100 d-flex flex-column align-items-center justify-content-center text-center">
                                        <div className="text-muted small mb-1 uppercase font-bold tracking-tight">Duty Status</div>
                                        <div className={`h5 fw-bold mb-0 d-flex align-items-center gap-2 ${partner.dutyStatus === 'Online' ? 'text-success' : 'text-danger'}`}>
                                            <div className={`w-2 h-2 rounded-circle ${partner.dutyStatus === 'Online' ? 'bg-success animate-pulse' : 'bg-danger'}`}></div>
                                            {partner.dutyStatus}
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 border rounded-3 bg-light bg-opacity-50 h-100 d-flex flex-column align-items-center justify-content-center text-center">
                                        <div className="text-muted small mb-1 uppercase font-bold tracking-tight">Assignment Status</div>
                                        <div className={`h6 fw-bold mb-0 ${partner.assignmentStatus === 'Free' ? 'text-success' : 'text-warning'}`}>
                                            {partner.assignmentStatus}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column - Contact & Duty */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-4">Contact Information</h6>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 bg-light rounded text-muted">
                                        <Mail size={18} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="small text-muted mb-0">Email Address</div>
                                        <div className="fw-medium text-truncate">{partner.email || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 bg-light rounded text-muted">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <div className="small text-muted mb-0">Phone Number</div>
                                        <div className="fw-medium">{partner.phone}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 bg-light rounded text-muted">
                                        <Truck size={18} />
                                    </div>
                                    <div>
                                        <div className="small text-muted mb-0">Vehicle Info</div>
                                        <div className="fw-medium">{partner.vehicleNumber || 'N/A'} ({partner.vehicleType})</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 bg-light rounded text-muted">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <div className="small text-muted mb-0">Registered On</div>
                                        <div className="fw-medium">{new Date(partner.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                 <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 bg-light rounded text-muted">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <div className="small text-muted mb-0">Last Known Location</div>
                                        <div className="fw-medium">
                                            {locationName}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="fw-bold mb-4">Live Activity</h6>
                            {partner.assignmentStatus === 'Busy' ? (
                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="d-flex align-items-center gap-2 text-blue-700 mb-2">
                                        <Activity size={18} />
                                        <h6 className="mb-0 small fw-bold">Currently On Delivery</h6>
                                    </div>
                                    <p className="small text-blue-600 mb-0">The partner is currently executing an assigned delivery run.</p>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm" 
                                        className="mt-3 w-100 bg-white"
                                        onClick={() => navigate('/admin/delivery/tracking')}
                                    >
                                        Track Live Map
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                                    <Clock size={32} className="text-muted mb-2 mx-auto" />
                                    <p className="small text-muted mb-0">Currently Idle</p>
                                    <p className="text-[10px] text-muted">No active orders or runs assigned.</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <DeliveryPartnerEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                partner={partner}
                onSave={handleSave}
            />

            <OrderDetailsModal
                show={showOrderModal}
                onHide={() => setShowOrderModal(false)}
                order={selectedOrder}
            />
        </div>
    );
};

export default PartnerDetails;
