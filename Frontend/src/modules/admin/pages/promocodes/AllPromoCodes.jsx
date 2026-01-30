import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, Plus, Ticket, Copy, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PROMO_MOCK = [
    { id: '1', code: 'SAVE10', type: 'Percentage', value: '10%', usage: '125/500', minOrder: '$50', status: 'Active' },
    { id: '2', code: 'FREESHIP', type: 'Free Shipping', value: 'N/A', usage: '45/100', minOrder: '$20', status: 'Active' },
    { id: '3', code: 'NEWUSER', type: 'Fixed Amount', value: '$5.00', usage: '890/1000', minOrder: '$0', status: 'Expired' },
];

const AllPromoCodes = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = PROMO_MOCK.filter(p =>
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <h5 className="mb-0 fw-bold">Promo Codes</h5>
                    <div className="d-flex gap-2 w-100 justify-content-md-end">
                        <InputGroup style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Code..."
                                className="border-start-0 ps-0 shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Link to="/admin/promocodes/create" className="btn btn-primary d-flex align-items-center gap-2">
                            <Plus size={18} /> Create Code
                        </Link>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Code</th>
                                <th className="border-0 py-3">Discount Type</th>
                                <th className="border-0 py-3">Value</th>
                                <th className="border-0 py-3">Usage</th>
                                <th className="border-0 py-3">Min Order</th>
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
                                                <Ticket size={20} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark font-monospace">{p.code}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-secondary">{p.type}</td>
                                    <td className="fw-bold text-success">{p.value}</td>
                                    <td>
                                        <Badge bg="light" text="dark" className="border">
                                            {p.usage}
                                        </Badge>
                                    </td>
                                    <td>{p.minOrder}</td>
                                    <td>
                                        <Badge bg={p.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3">
                                            {p.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button variant="light" size="sm" className="btn-icon-soft text-secondary" title="Copy Code">
                                                <Copy size={16} />
                                            </Button>
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

export default AllPromoCodes;
