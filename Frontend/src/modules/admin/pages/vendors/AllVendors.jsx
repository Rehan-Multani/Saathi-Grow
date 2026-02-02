import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Dropdown } from 'react-bootstrap';
import { Search, Plus, MoreHorizontal, Store, Mail, Phone, CheckCircle, Ban, Upload, Download, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import VendorDetailsModal from '../../components/vendors/VendorDetailsModal';

const VENDORS_MOCK = [
    { id: 'VND-001', name: 'Fresh Farms Ltd', owner: 'Robert Fox', email: 'robert@freshfarms.com', phone: '+1 555-0123', products: 45, status: 'Active', rating: 4.8 },
    { id: 'VND-002', name: 'Tech World', owner: 'Cody Fisher', email: 'cody@techworld.com', phone: '+1 555-0124', products: 120, status: 'Pending', rating: 0 },
    { id: 'VND-003', name: 'Urban Styles', owner: 'Esther Howard', email: 'esther@urban.com', phone: '+1 555-0125', products: 32, status: 'Blocked', rating: 3.5 },
];

const AllVendors = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);

    const filtered = VENDORS_MOCK.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDetails = (vendor) => {
        setSelectedVendor(vendor);
        setShowDetailsModal(true);
    };

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <h5 className="mb-0 fw-bold">All Vendors</h5>
                        <Badge bg="primary" pill>{filtered.length}</Badge>
                    </div>
                    <div className="d-flex flex-column flex-sm-row gap-2 w-100 justify-content-sm-end">
                        <InputGroup className="w-100" style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Vendor..."
                                className="border-start-0 ps-0 shadow-none font-small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <div className="d-flex gap-2">
                            <Button variant="outline-success" className="d-flex align-items-center gap-2 shadow-sm">
                                <Upload size={18} /> <span className="d-none d-sm-inline">Import</span>
                            </Button>
                            <Button variant="outline-primary" className="d-flex align-items-center gap-2 shadow-sm">
                                <Download size={18} /> <span className="d-none d-sm-inline">Export</span>
                            </Button>
                            <Link to="/admin/vendors/add" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 responsive-btn shadow-sm">
                                <Plus size={18} />
                                <span className="d-none d-sm-inline">Add Vendor</span>
                                <span className="d-inline d-sm-none">Add</span>
                            </Link>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Vendor Name</th>
                                <th className="border-0 py-3">Contact Person</th>
                                <th className="border-0 py-3">Products</th>
                                <th className="border-0 py-3">Rating</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((v, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light p-2 rounded text-primary">
                                                <Store size={20} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{v.name}</div>
                                                <div className="small text-muted">{v.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column gap-1 small text-muted">
                                            <div className="fw-medium text-dark">{v.owner}</div>
                                            <div className="d-flex align-items-center gap-2">
                                                <Mail size={12} /> {v.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="fw-bold">{v.products}</td>
                                    <td>
                                        <Badge bg="light" text="dark" className="border">
                                            ⭐ {v.rating > 0 ? v.rating : 'New'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg={
                                            v.status === 'Active' ? 'success' :
                                                v.status === 'Pending' ? 'warning' : 'danger'
                                        } className="rounded-pill fw-normal px-3">
                                            {v.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button variant="light" size="sm" className="btn-icon-soft text-primary">
                                                <Edit size={16} />
                                            </Button>
                                            <Button variant="light" size="sm" className="btn-icon-soft text-danger">
                                                <Trash2 size={16} />
                                            </Button>
                                            <Dropdown align="end">
                                                <Dropdown.Toggle variant="link" className="text-muted p-0 shadow-none no-caret btn-icon-soft">
                                                    <MoreHorizontal size={20} />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className="border-0 shadow-sm">
                                                    <Dropdown.Item onClick={() => handleViewDetails(v)}>View Details</Dropdown.Item>
                                                    <Dropdown.Divider />
                                                    {v.status !== 'Active' && (
                                                        <Dropdown.Item href="#" className="text-success"><CheckCircle size={16} className="me-2" /> Approve</Dropdown.Item>
                                                    )}
                                                    {v.status !== 'Blocked' && (
                                                        <Dropdown.Item href="#" className="text-danger"><Ban size={16} className="me-2" /> Block</Dropdown.Item>
                                                    )}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <VendorDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                vendor={selectedVendor}
            />
        </div>
    );
};

export default AllVendors;
