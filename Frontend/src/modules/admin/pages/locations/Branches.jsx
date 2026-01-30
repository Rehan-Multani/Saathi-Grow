import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, Plus, MapPin, Phone, Clock, Store } from 'lucide-react';

const BRANCHES_MOCK = [
    { id: '1', name: 'Main Store - Downtown', address: '123 Market St, Downtown', phone: '+1 555-0100', manager: 'Sarah Connor', status: 'Active' },
    { id: '2', name: 'Northside Branch', address: '456 North Ave, Uptown', phone: '+1 555-0101', manager: 'Kyle Reese', status: 'Active' },
    { id: '3', name: 'West Mall Kiosk', address: '789 West Mall, Westside', phone: '+1 555-0102', manager: 'John Connor', status: 'Inactive' },
];

const Branches = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = BRANCHES_MOCK.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <h5 className="mb-0 fw-bold">Store Branches</h5>
                    <div className="d-flex gap-2 w-100 justify-content-md-end">
                        <InputGroup style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Branch..."
                                className="border-start-0 ps-0 shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Button variant="primary" className="d-flex align-items-center gap-2">
                            <Plus size={18} /> Add Branch
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Branch Name</th>
                                <th className="border-0 py-3">Address</th>
                                <th className="border-0 py-3">Contact</th>
                                <th className="border-0 py-3">Manager</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((b, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light p-2 rounded text-primary">
                                                <Store size={20} />
                                            </div>
                                            <span className="fw-bold text-dark">{b.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-1 text-muted small">
                                            <MapPin size={14} /> {b.address}
                                        </div>
                                    </td>
                                    <td>{b.phone}</td>
                                    <td>{b.manager}</td>
                                    <td>
                                        <Badge bg={b.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3">
                                            {b.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button variant="link" className="text-decoration-none">Details</Button>
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

export default Branches;
