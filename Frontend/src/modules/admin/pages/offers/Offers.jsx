import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, Plus, Tag, Calendar, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const OFFERS_MOCK = [
    { id: 'OFF-001', title: 'Summer Sale', discount: '20% OFF', code: 'SUMMER20', validUntil: '2023-08-31', status: 'Active' },
    { id: 'OFF-002', title: 'Welcome Bonus', discount: '₹10 Flat', code: 'WELCOME10', validUntil: 'N/A', status: 'Active' },
    { id: 'OFF-003', title: 'Flash Deal', discount: '50% OFF', code: 'FLASH50', validUntil: '2023-01-01', status: 'Expired' },
];

const Offers = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = OFFERS_MOCK.filter(o =>
        o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <h5 className="mb-0 fw-bold">Special Offers</h5>
                    <div className="d-flex flex-column flex-sm-row gap-2 w-100 justify-content-sm-end">
                        <InputGroup className="w-100" style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Offer..."
                                className="border-start-0 ps-0 shadow-none font-small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Link to="/admin/offers/create" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 responsive-btn shadow-sm">
                            <Plus size={18} /> Create Offer
                        </Link>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Offer Details</th>
                                <th className="border-0 py-3">Discount</th>
                                <th className="border-0 py-3">Promo Code</th>
                                <th className="border-0 py-3">Validity</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((o, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light p-2 rounded text-danger">
                                                <Tag size={20} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{o.title}</div>
                                                <div className="small text-muted">{o.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="fw-bold text-success">{o.discount}</td>
                                    <td><span className="font-monospace bg-light border px-2 py-1 rounded small">{o.code}</span></td>
                                    <td>
                                        <div className="d-flex align-items-center gap-1 text-muted small">
                                            <Calendar size={14} /> {o.validUntil}
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={o.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3">
                                            {o.status}
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

export default Offers;
