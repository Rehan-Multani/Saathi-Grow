import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Badge, Button, Table, ProgressBar } from 'react-bootstrap';
import {
    Truck, Phone, Mail, MapPin, Calendar, Star,
    ChevronLeft, Package, User, Clock, CheckCircle,
    AlertCircle, DollarSign, Activity, FileText
} from 'lucide-react';
import DeliveryPartnerEditModal from '../../components/delivery/DeliveryPartnerEditModal';
import { showSuccessAlert } from '../../../../common/utils/alertUtils';

const PARTNER_DATA = {
    'DP-001': {
        name: 'FastTrack Logistics',
        type: 'Agency',
        email: 'contact@fasttrack.com',
        phone: '+1 555-0199',
        address: '123 Logistics Way, New York, NY',
        joinedDate: 'Jan 15, 2024',
        rating: 4.8,
        totalDeliveries: 1245,
        activeDrivers: 12,
        status: 'Active',
        currentBalance: 4500.00,
        earningsThisMonth: 1250.00,
        recentDeliveries: [
            { id: 'ORD-5541', customer: 'Alice Johnson', date: '2026-02-03', status: 'Delivered', amount: 45.00 },
            { id: 'ORD-5538', customer: 'Bob Smith', date: '2026-02-03', status: 'On the Way', amount: 120.50 },
            { id: 'ORD-5522', customer: 'Charlie Brown', date: '2026-02-02', status: 'Delivered', amount: 89.99 },
        ],
        drivers: [
            { id: 'D-01', name: 'Mike Ross', vehicle: 'Van (NYC-441)', status: 'Active', rating: 4.9 },
            { id: 'D-02', name: 'Harvey Specter', vehicle: 'Motorcycle (M-99)', status: 'On Delivery', rating: 4.7 },
        ]
    },
    'DP-002': {
        name: 'John Doe (Freelancer)',
        type: 'Individual',
        email: 'john.doe@email.com',
        phone: '+1 555-0200',
        address: '45 Sunset Blvd, Los Angeles, CA',
        joinedDate: 'Feb 10, 2024',
        rating: 4.5,
        totalDeliveries: 342,
        activeDrivers: 1,
        status: 'Active',
        currentBalance: 850.00,
        earningsThisMonth: 420.00,
        recentDeliveries: [
            { id: 'ORD-9912', customer: 'Sarah Connor', date: '2026-02-02', status: 'Delivered', amount: 35.00 },
        ],
        drivers: [
            { id: 'D-10', name: 'John Doe', vehicle: 'Scooter (LA-22)', status: 'Idle', rating: 4.5 }
        ]
    }
};

const PartnerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [partner, setPartner] = useState(PARTNER_DATA[id] || PARTNER_DATA['DP-001']);
    const [showEditModal, setShowEditModal] = useState(false);

    if (!partner) return <div className="p-4">Partner not found</div>;

    const handleSave = async (updatedPartner) => {
        setPartner(prev => ({ ...prev, ...updatedPartner }));
        await showSuccessAlert('Profile Updated!', 'The partner profile has been successfully updated.');
    };

    return (
        <div className="p-2 p-md-4 bg-light min-vh-100">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
                <div className="d-flex align-items-center gap-2 gap-md-3">
                    <Button
                        variant="white"
                        onClick={() => navigate(-1)}
                        className="rounded-circle shadow-sm p-2 border"
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div>
                        <h4 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '200px' }}>{partner.name}</h4>
                        <div className="d-flex flex-wrap align-items-center gap-2 text-muted small mt-1">
                            <span className="badge bg-primary bg-opacity-10 text-primary px-2">{partner.type}</span>
                            <span className="d-none d-sm-inline">•</span>
                            <span>ID: {id}</span>
                            <span className="d-none d-sm-inline">•</span>
                            <span className={`fw-bold d-flex align-items-center gap-1 ${partner.status === 'Active' ? 'text-success' : 'text-danger'}`}>
                                <CheckCircle size={14} /> {partner.status}
                            </span>
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
                            { label: 'Total Deliveries', value: partner.totalDeliveries, icon: <Package size={20} />, color: 'blue' },
                            { label: 'Avg. Rating', value: partner.rating, icon: <Star size={20} fill="currentColor" />, color: 'warning' },
                            { label: 'Active Drivers', value: partner.activeDrivers, icon: <User size={20} />, color: 'purple' },
                            { label: 'Current Balance', value: `₹${partner.currentBalance}`, icon: <DollarSign size={20} />, color: 'green' }
                        ].map((stat, i) => (
                            <Col xs={6} md={3} key={i}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body className="p-3">
                                        <div className={`p-2 rounded bg-${stat.color === 'warning' ? 'amber' : stat.color}-50 text-${stat.color === 'warning' ? 'amber' : stat.color}-600 mb-2 w-fit-content`}>
                                            {stat.icon}
                                        </div>
                                        <div className="text-muted small mb-1">{stat.label}</div>
                                        <div className="h5 fw-bold mb-0">{stat.value}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Delivery List */}
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
                                    {partner.recentDeliveries.map((delivery, i) => (
                                        <tr key={i} className="align-middle">
                                            <td className="ps-4 fw-bold">{delivery.id}</td>
                                            <td className="text-muted">{delivery.customer}</td>
                                            <td className="text-muted">{delivery.date}</td>
                                            <td className="fw-bold">₹{delivery.amount}</td>
                                            <td>
                                                <Badge bg={delivery.status === 'Delivered' ? 'success' : 'warning'} className="fw-normal">
                                                    {delivery.status}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4">
                                                <Button variant="light" size="sm">View</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    {/* Driver Management (If Agency) */}
                    {partner.type === 'Agency' && (
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-bottom-0 py-3 d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold mb-0">Registered Drivers</h6>
                                <Button variant="outline-primary" size="sm">+ Add Driver</Button>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table hover responsive className="mb-0">
                                    <thead className="bg-light text-muted small">
                                        <tr>
                                            <th className="ps-4">NAME</th>
                                            <th>VEHICLE</th>
                                            <th>STATUS</th>
                                            <th>RATING</th>
                                            <th className="text-end pe-4">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {partner.drivers.map((driver, i) => (
                                            <tr key={i} className="align-middle">
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="bg-light rounded-circle p-1 capitalize text-primary font-bold" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {driver.name.charAt(0)}
                                                        </div>
                                                        <span className="fw-bold">{driver.name}</span>
                                                    </div>
                                                </td>
                                                <td className="text-muted small">{driver.vehicle}</td>
                                                <td>
                                                    <span className={`px-2 py-1 rounded-pill small ${driver.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {driver.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-1 text-warning">
                                                        <Star size={12} fill="currentColor" /> <span className="small fw-bold">{driver.rating}</span>
                                                    </div>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <Button variant="link" className="p-0 text-primary small">Track</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    )}
                </Col>

                {/* Right Column - Contact & Documents */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-4">Contact Information</h6>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 bg-light rounded text-muted">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <div className="small text-muted mb-0">Email Address</div>
                                        <div className="fw-medium">{partner.email}</div>
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
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <div className="small text-muted mb-0">Business Address</div>
                                        <div className="fw-medium">{partner.address}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 bg-light rounded text-muted">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <div className="small text-muted mb-0">Join Date</div>
                                        <div className="fw-medium">{partner.joinedDate}</div>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-4">Performance Insights</h6>
                            <div className="mb-4">
                                <div className="d-flex justify-content-between mb-2 small">
                                    <span className="text-muted">On-Time Delivery</span>
                                    <span className="text-success fw-bold">94%</span>
                                </div>
                                <ProgressBar now={94} variant="success" style={{ height: 6 }} />
                            </div>
                            <div className="mb-4">
                                <div className="d-flex justify-content-between mb-2 small">
                                    <span className="text-muted">User Satisfaction</span>
                                    <span className="text-primary fw-bold">88%</span>
                                </div>
                                <ProgressBar now={88} variant="primary" style={{ height: 6 }} />
                            </div>
                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="d-flex align-items-center gap-2 text-blue-700 mb-2">
                                    <Activity size={18} />
                                    <h6 className="mb-0 small fw-bold">Active Activity</h6>
                                </div>
                                <p className="small text-blue-600 mb-0">Partner is currently delivering 8 orders across 3 sectors.</p>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="fw-bold mb-4">Verification Documents</h6>
                            <div className="d-flex flex-column gap-2">
                                {[
                                    { name: 'Business_License.pdf', size: '1.2 MB' },
                                    { name: 'Insurance_Contract.pdf', size: '2.4 MB' },
                                    { name: 'Identity_Proof.jpg', size: '800 KB' }
                                ].map((doc, i) => (
                                    <div key={i} className="p-2 border rounded d-flex align-items-center justify-content-between hover:bg-light cursor-pointer transition-colors">
                                        <div className="d-flex align-items-center gap-2 overflow-hidden">
                                            <FileText size={16} className="text-muted flex-shrink-0" />
                                            <span className="small text-truncate">{doc.name}</span>
                                        </div>
                                        <span className="text-[10px] text-muted flex-shrink-0">{doc.size}</span>
                                    </div>
                                ))}
                            </div>
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
        </div>
    );
};

export default PartnerDetails;
