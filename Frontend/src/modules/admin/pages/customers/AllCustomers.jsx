import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Dropdown, Spinner } from 'react-bootstrap';
import { Search, MoreHorizontal, Mail, Phone, MapPin, Eye, Ban, CheckCircle, Upload, Download, Send, Plus } from 'lucide-react';
import CustomerDetailsModal from '../../components/customers/CustomerDetailsModal';
import SendMessageModal from '../../components/customers/SendMessageModal';
import { showSuccessAlert } from '../../../../common/utils/alertUtils';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as customerApi from '../../api/customerManagementApi';
import { toast } from 'react-toastify';

const AllCustomers = () => {
    const { adminUser } = useAdminAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [messageType, setMessageType] = useState('Message');

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await customerApi.getAllCustomers(adminUser.token);
                setCustomers(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (adminUser?.token) {
            fetchCustomers();
        }
    }, [adminUser.token]);

    const filtered = customers.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone || '').includes(searchTerm)
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

    const handleStatusToggle = async (customer) => {
        try {
            const formData = new FormData();
            formData.append('isActive', !customer.isActive);
            await customerApi.updateCustomer(adminUser.token, customer._id, formData);
            setCustomers(prev => prev.map(c => c._id === customer._id ? { ...c, isActive: !c.isActive } : c));
            toast.success(`User ${customer.isActive ? 'blocked' : 'unblocked'} successfully`);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const onMessageSent = async () => {
        setShowMessageModal(false);
        await showSuccessAlert(`${messageType} Sent!`, `Your ${messageType.toLowerCase()} has been delivered successfully to ${selectedCustomer?.name}.`);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

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
                                <th className="border-0 py-3 text-center">Wallet</th>
                                <th className="border-0 py-3 text-center">Status</th>
                                <th className="border-0 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((c) => (
                                <tr key={c._id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            {c.profileImage ? (
                                                <img src={c.profileImage} alt={c.name} className="rounded-circle object-fit-cover" style={{ width: 40, height: 40 }} />
                                            ) : (
                                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                                                    {c.name ? c.name.charAt(0) : 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <div className="fw-bold text-dark">{c.name || 'Anonymous'}</div>
                                                <div className="small text-muted text-[10px]">{c._id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column gap-1 small text-muted">
                                            {c.email && (
                                                <div className="d-flex align-items-center gap-2">
                                                    <Mail size={14} /> {c.email}
                                                </div>
                                            )}
                                            <div className="d-flex align-items-center gap-2">
                                                <Phone size={14} /> +91 {c.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-secondary">
                                        <div className="d-flex align-items-center gap-2 small">
                                            <MapPin size={14} /> {c.addresses?.[0]?.city || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="text-center font-bold">
                                        <div className="fw-bold">₹{c.walletBalance || 0}</div>
                                    </td>
                                    <td className="text-center">
                                        <Badge bg={c.isActive ? 'success' : 'danger'} className="rounded-pill fw-normal px-3">
                                            {c.isActive ? 'Active' : 'Blocked'}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Dropdown align="end" drop="down">
                                            <Dropdown.Toggle variant="link" className="text-muted p-0 shadow-none no-caret">
                                                <MoreHorizontal size={20} />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu
                                                className="border-0 shadow-lg p-2 rounded-xl"
                                                popperConfig={{
                                                    strategy: 'fixed',
                                                    modifiers: [
                                                        {
                                                            name: 'offset',
                                                            options: {
                                                                offset: [0, 8],
                                                            },
                                                        },
                                                    ],
                                                }}
                                            >
                                                <Dropdown.Item onClick={() => handleViewProfile(c)} className="rounded-lg py-2 d-flex align-items-center gap-2 small">
                                                    <Eye size={16} className="text-primary" />
                                                    <span className="fw-medium">View Profile</span>
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleSendMessage(c, 'Email')} className="rounded-lg py-2 d-flex align-items-center gap-2 small">
                                                    <Mail size={16} className="text-info" />
                                                    <span className="fw-medium">Send Email</span>
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleSendMessage(c, 'Message')} className="rounded-lg py-2 d-flex align-items-center gap-2 small">
                                                    <Send size={16} className="text-primary" />
                                                    <span className="fw-medium">Send Message</span>
                                                </Dropdown.Item>
                                                <Dropdown.Divider className="my-1 opacity-50" />
                                                <Dropdown.Item onClick={() => handleStatusToggle(c)} className={`rounded-lg py-2 d-flex align-items-center gap-2 small ${c.isActive ? 'text-danger' : 'text-success'}`}>
                                                    {c.isActive ? (
                                                        <><Ban size={16} /> <span className="fw-medium">Block User</span></>
                                                    ) : (
                                                        <><CheckCircle size={16} /> <span className="fw-medium">Unblock User</span></>
                                                    )}
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">No customers found</td>
                                </tr>
                            )}
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
