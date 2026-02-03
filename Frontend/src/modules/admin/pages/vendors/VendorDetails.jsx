import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Badge, Button, Table, ProgressBar } from 'react-bootstrap';
import {
    Store, Phone, Mail, MapPin, Calendar, Package,
    Star, ChevronLeft, DollarSign, Activity, FileText,
    TrendingUp, ShoppingBag, Users, Clock
} from 'lucide-react';
import { showSuccessAlert } from '../../../../common/utils/alertUtils';
import VendorEditModal from '../../components/vendors/VendorEditModal';
import ContactVendorModal from '../../components/vendors/ContactVendorModal';

const VENDOR_DATA = {
    'VND-001': {
        name: 'Fresh Farms Ltd',
        owner: 'Robert Fox',
        email: 'robert@freshfarms.com',
        phone: '+1 555-0123',
        address: '778 Maple Ave, Greenfield, NY',
        joinedDate: 'Oct 12, 2023',
        rating: 4.8,
        totalProducts: 45,
        totalOrders: 1240,
        status: 'Active',
        totalEarnings: 15400.00,
        pendingPayout: 1250.00,
        recentOrders: [
            { id: 'ORD-9901', customer: 'Alice Johnson', date: '2026-02-03', status: 'Delivered', amount: 450.00 },
            { id: 'ORD-9888', customer: 'Bob Smith', date: '2026-02-02', status: 'Processing', amount: 120.50 },
            { id: 'ORD-9875', customer: 'Charlie Brown', date: '2026-02-01', status: 'Delivered', amount: 890.00 },
        ],
        topProducts: [
            { name: 'Organic Bananas', sales: 450, stock: 120, price: '₹40' },
            { name: 'Fresh Milk 1L', sales: 320, stock: 45, price: '₹65' },
            { name: 'Farm Eggs (12pk)', sales: 280, stock: 15, price: '₹120' },
        ]
    }
};

const VendorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(VENDOR_DATA[id] || VENDOR_DATA['VND-001']);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    if (!vendor) return <div className="p-4 text-center">Vendor not found</div>;

    const handleSave = async (updatedVendor) => {
        setVendor(prev => ({ ...prev, ...updatedVendor }));
        await showSuccessAlert('Vendor Updated!', 'The vendor profile has been successfully updated.');
    };

    const handleContactSubmit = async () => {
        await showSuccessAlert('Message Sent!', `Your message has been sent to ${vendor.owner}.`);
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
                        <h4 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '200px' }}>{vendor.name}</h4>
                        <div className="d-flex flex-wrap align-items-center gap-2 text-muted small mt-1">
                            <span className="badge bg-primary bg-opacity-10 text-primary px-2">Vendor</span>
                            <span className="d-none d-sm-inline">•</span>
                            <span>ID: {id}</span>
                            <span className="d-none d-sm-inline">•</span>
                            <span className={`fw-bold d-flex align-items-center gap-1 ${vendor.status === 'Active' ? 'text-success' : 'text-danger'}`}>
                                <Activity size={14} /> {vendor.status}
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
                        Edit Vendor
                    </Button>
                    <Button
                        variant="primary"
                        className="shadow-sm flex-grow-1 flex-md-grow-0"
                        onClick={() => setShowContactModal(true)}
                    >
                        Contact Owner
                    </Button>
                </div>
            </div>

            <Row className="g-3 g-md-4">
                {/* Left Column - Main Info */}
                <Col lg={8}>
                    {/* Stats Grid */}
                    <Row className="g-2 g-md-3 mb-4">
                        {[
                            { label: 'Total Sales', value: `₹${vendor.totalEarnings.toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'blue' },
                            { label: 'Avg. Rating', value: vendor.rating, icon: <Star size={20} fill="currentColor" />, color: 'warning' },
                            { label: 'Products', value: vendor.totalProducts, icon: <Package size={20} />, color: 'purple' },
                            { label: 'Pending Payout', value: `₹${vendor.pendingPayout}`, icon: <DollarSign size={20} />, color: 'green' }
                        ].map((stat, i) => (
                            <Col xs={6} md={3} key={i}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Body className="p-2 p-md-3 text-center text-md-start">
                                        <div className={`p-2 rounded bg-${stat.color === 'warning' ? 'amber' : stat.color}-50 text-${stat.color === 'warning' ? 'amber' : stat.color}-600 mb-2 w-fit-content mx-auto mx-md-0`}>
                                            {stat.icon}
                                        </div>
                                        <div className="text-muted small mb-1" style={{ fontSize: '0.75rem' }}>{stat.label}</div>
                                        <div className="h6 h5-md fw-bold mb-0">{stat.value}</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Top Products */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white border-bottom-0 py-3 d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold mb-0">Best Selling Products</h6>
                            <Button variant="link" className="text-decoration-none p-0 small">See Inventory</Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover responsive className="mb-0">
                                <thead className="bg-light text-muted small">
                                    <tr>
                                        <th className="ps-4">PRODUCT</th>
                                        <th>PRICE</th>
                                        <th>SALES</th>
                                        <th>STOCK</th>
                                        <th className="text-end pe-4">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendor.topProducts.map((p, i) => (
                                        <tr key={i} className="align-middle">
                                            <td className="ps-4">
                                                <div className="fw-bold">{p.name}</div>
                                            </td>
                                            <td className="text-muted">{p.price}</td>
                                            <td className="fw-bold text-primary">{p.sales} Units</td>
                                            <td>
                                                <span className={`fw-medium ${p.stock < 20 ? 'text-danger' : 'text-muted'}`}>
                                                    {p.stock} in Stock
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <Badge bg={p.stock > 0 ? 'success' : 'danger'} className="fw-normal">
                                                    {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    {/* Recent Orders */}
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom-0 py-3">
                            <h6 className="fw-bold mb-0">Recent Sales Activity</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover responsive className="mb-0">
                                <thead className="bg-light text-muted small">
                                    <tr>
                                        <th className="ps-4">ORDER ID</th>
                                        <th>CUSTOMER</th>
                                        <th>DATE</th>
                                        <th>AMOUNT</th>
                                        <th className="text-end pe-4">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendor.recentOrders.map((order, i) => (
                                        <tr key={i} className="align-middle">
                                            <td className="ps-4 fw-bold">{order.id}</td>
                                            <td className="text-muted">{order.customer}</td>
                                            <td className="text-muted">{order.date}</td>
                                            <td className="fw-bold">₹{order.amount}</td>
                                            <td className="text-end pe-4">
                                                <Badge bg={order.status === 'Delivered' ? 'success' : 'warning'} className="fw-normal">
                                                    {order.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column - Store Info */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-4">Store Overview</h6>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 bg-light rounded text-muted">
                                        <Store size={18} />
                                    </div>
                                    <div>
                                        <div className="small text-muted mb-0">Owner Name</div>
                                        <div className="fw-medium">{vendor.owner}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 bg-light rounded text-muted">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <div className="small text-muted mb-0">Email Address</div>
                                        <div className="fw-medium">{vendor.email}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 bg-light rounded text-muted">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <div className="small text-muted mb-0">Phone Number</div>
                                        <div className="fw-medium">{vendor.phone}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 bg-light rounded text-muted">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <div className="small text-muted mb-0">Store Address</div>
                                        <div className="fw-medium">{vendor.address}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 bg-light rounded text-muted">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <div className="small text-muted mb-0">Membership Date</div>
                                        <div className="fw-medium">{vendor.joinedDate}</div>
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
                                    <span className="text-muted">Order Fulfillment</span>
                                    <span className="text-success fw-bold">96%</span>
                                </div>
                                <ProgressBar now={96} variant="success" style={{ height: 6 }} />
                            </div>
                            <div className="mb-4">
                                <div className="d-flex justify-content-between mb-2 small">
                                    <span className="text-muted">Inventory Accuracy</span>
                                    <span className="text-primary fw-bold">82%</span>
                                </div>
                                <ProgressBar now={82} variant="primary" style={{ height: 6 }} />
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                <div className="d-flex align-items-center gap-2 text-indigo-700 mb-2">
                                    <Activity size={18} />
                                    <h6 className="mb-0 small fw-bold">Growth Trend</h6>
                                </div>
                                <p className="small text-indigo-600 mb-0">Sales are up by 12% compared to last month. Keep it up!</p>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="fw-bold mb-4">Verification Documents</h6>
                            <div className="d-flex flex-column gap-2">
                                {[
                                    { name: 'Trade_License.pdf', size: '1.2 MB' },
                                    { name: 'VAT_Registration.pdf', size: '2.4 MB' },
                                    { name: 'Owner_ID.jpg', size: '800 KB' }
                                ].map((doc, i) => (
                                    <div key={i} className="p-2 border rounded d-flex align-items-center justify-content-center justify-content-md-between hover:bg-light cursor-pointer transition-colors">
                                        <div className="d-flex align-items-center gap-2 overflow-hidden">
                                            <FileText size={16} className="text-muted flex-shrink-0" />
                                            <span className="small text-truncate">{doc.name}</span>
                                        </div>
                                        <span className="text-[10px] text-muted flex-shrink-0 d-none d-md-inline">{doc.size}</span>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <VendorEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                vendor={vendor}
                onSave={handleSave}
            />

            <ContactVendorModal
                show={showContactModal}
                onHide={() => setShowContactModal(false)}
                vendor={vendor}
                onSubmit={handleContactSubmit}
            />
        </div>
    );
};

export default VendorDetails;
