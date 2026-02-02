import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, Plus, Phone, Star, MoreHorizontal, Truck, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PARTNERS_MOCK = [
    { id: 'DP-001', name: 'FastTrack Logistics', type: 'Agency', phone: '+1 555-0199', activeDrivers: 12, rating: 4.8, status: 'Active' },
    { id: 'DP-002', name: 'John Doe (Freelancer)', type: 'Individual', phone: '+1 555-0200', activeDrivers: 1, rating: 4.5, status: 'Active' },
    { id: 'DP-003', name: 'City Express', type: 'Agency', phone: '+1 555-0201', activeDrivers: 8, rating: 4.2, status: 'Inactive' },
];

const DeliveryPartners = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = PARTNERS_MOCK.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <h5 className="mb-0 fw-bold text-nowrap">Delivery Partners</h5>
                    <div className="d-flex flex-column flex-sm-row gap-2 w-100 justify-content-sm-end">
                        <InputGroup className="w-100" style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Partner..."
                                className="border-start-0 ps-0 shadow-none font-small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Link to="/admin/delivery/partners/add" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 responsive-btn shadow-sm">
                            <Plus size={18} /> Add Partner
                        </Link>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Partner Name</th>
                                <th className="border-0 py-3">Type</th>
                                <th className="border-0 py-3">Contact</th>
                                <th className="border-0 py-3">Capacity</th>
                                <th className="border-0 py-3">Rating</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light p-2 rounded text-primary">
                                                <Truck size={20} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{p.name}</div>
                                                <div className="small text-muted">{p.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><Badge bg="light" text="dark" className="border fw-normal">{p.type}</Badge></td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2 text-muted small">
                                            <Phone size={14} /> {p.phone}
                                        </div>
                                    </td>
                                    <td>{p.activeDrivers} Drivers</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-1 text-warning fw-bold">
                                            <Star size={14} fill="currentColor" /> {p.rating}
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={p.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3">
                                            {p.status}
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
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default DeliveryPartners;
