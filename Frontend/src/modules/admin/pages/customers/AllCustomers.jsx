import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Dropdown } from 'react-bootstrap';
import { Search, MoreHorizontal, Mail, Phone, MapPin, Eye, Ban, CheckCircle, Upload, Download, Send } from 'lucide-react';
import CustomerDetailsModal from '../../components/customers/CustomerDetailsModal';
import SendMessageModal from '../../components/customers/SendMessageModal';
import { showSuccessAlert } from '../../../../common/utils/alertUtils';

const CUSTOMERS_MOCK = [
    { id: 'CUST-001', name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 555-0101', city: 'New York', orders: 24, spent: '₹1,240.50', status: 'Active', points: 450 },
    { id: 'CUST-002', name: 'Bob Smith', email: 'bob.smith@test.com', phone: '+1 555-0102', city: 'Los Angeles', orders: 5, spent: '₹200.00', status: 'Blocked', points: 10 },
    { id: 'CUST-003', name: 'Carol Williams', email: 'carol.w@demo.com', phone: '+1 555-0103', city: 'Chicago', orders: 12, spent: '₹850.75', status: 'Active', points: 120 },
    { id: 'CUST-004', name: 'David Brown', email: 'david.b@sample.com', phone: '+1 555-0104', city: 'Houston', orders: 1, spent: '₹45.00', status: 'Active', points: 5 },
];

const AllCustomers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [messageType, setMessageType] = useState('Message'); // 'Message' or 'Email'

    const filtered = CUSTOMERS_MOCK.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    const handleViewProfile = (customer) => {
        setSelectedCustomer(customer);
        setShowDetailsModal(true);
    };

    const handleSendMessage = (customer, type) => {
        setSelectedCustomer(customer);
        setMessageType(type);
        setShowMessageModal(true);
    };

    const onMessageSent = async () => {
        setShowMessageModal(false);
        await showSuccessAlert(`${messageType} Sent!`, `Your ${messageType.toLowerCase()} has been delivered successfully to ${selectedCustomer?.name}.`);
    };

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center gap-3 text-nowrap">
                        <h5 className="mb-0 fw-bold">All Customers</h5>
                        <Badge bg="primary" pill>{filtered.length}</Badge>
                    </div>
                    <div className="d-flex gap-2 flex-grow-1 justify-content-md-end">
                        <InputGroup style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Name, Email, Phone..."
                                className="border-start-0 ps-0 shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Button variant="outline-success" className="d-flex align-items-center gap-2 shadow-sm">
                            <Upload size={18} /> <span className="d-none d-md-inline">Import</span>
                        </Button>
                        <Button variant="outline-primary" className="d-flex align-items-center gap-2 shadow-sm">
                            <Download size={18} /> <span className="d-none d-md-inline">Export</span>
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Customer</th>
                                <th className="border-0 py-3">Contact Info</th>
                                <th className="border-0 py-3">Location</th>
                                <th className="border-0 py-3">Orders</th>
                                <th className="border-0 py-3">Total Spent</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                                                {c.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{c.name}</div>
                                                <div className="small text-muted">ID: {c.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column gap-1 small text-muted">
                                            <div className="d-flex align-items-center gap-2">
                                                <Mail size={14} /> {c.email}
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <Phone size={14} /> {c.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-secondary">
                                        <div className="d-flex align-items-center gap-2 small">
                                            <MapPin size={14} /> {c.city}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-bold">{c.orders}</div>
                                        <div className="small text-success">{c.points} Pts</div>
                                    </td>
                                    <td className="fw-bold text-dark">{c.spent}</td>
                                    <td>
                                        <Badge bg={c.status === 'Active' ? 'success' : 'danger'} className="rounded-pill fw-normal px-3">
                                            {c.status}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Dropdown align="end">
                                            <Dropdown.Toggle variant="link" className="text-muted p-0 shadow-none no-caret">
                                                <MoreHorizontal size={20} />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="border-0 shadow-sm shadow-indigo-100">
                                                <Dropdown.Item onClick={() => handleViewProfile(c)}>
                                                    <Eye size={16} className="me-2 text-primary" /> View Profile
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleSendMessage(c, 'Email')}>
                                                    <Mail size={16} className="me-2 text-info" /> Send Email
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleSendMessage(c, 'Message')}>
                                                    <Send size={16} className="me-2 text-primary" /> Send Message
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                {c.status === 'Active' ? (
                                                    <Dropdown.Item href="#" className="text-danger"><Ban size={16} className="me-2" /> Block User</Dropdown.Item>
                                                ) : (
                                                    <Dropdown.Item href="#" className="text-success"><CheckCircle size={16} className="me-2" /> Unblock User</Dropdown.Item>
                                                )}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <CustomerDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                customer={selectedCustomer}
                onSendMessage={(cust, type) => {
                    setShowDetailsModal(false);
                    handleSendMessage(cust, type);
                }}
            />

            <SendMessageModal
                show={showMessageModal}
                onHide={() => setShowMessageModal(false)}
                customer={selectedCustomer}
                type={messageType}
                onSubmit={onMessageSent}
            />
        </div>
    );
};

export default AllCustomers;
