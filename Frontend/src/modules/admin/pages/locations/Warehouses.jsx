import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, Plus, MapPin, Package, Archive } from 'lucide-react';

const WAREHOUSES_MOCK = [
    { id: '1', name: 'Central Distribution Center', location: 'Industrial Park, Zone A', capacity: '10,000 sqft', stockLevel: '85%', status: 'Active' },
    { id: '2', name: 'Eastside Storage', location: 'East Highway Rd', capacity: '5,000 sqft', stockLevel: '40%', status: 'Active' },
    { id: '3', name: 'Overflow Depot', location: 'Old factory dist', capacity: '2,000 sqft', stockLevel: '0%', status: 'Maintenance' },
];

const Warehouses = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = WAREHOUSES_MOCK.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <h5 className="mb-0 fw-bold">Warehouses</h5>
                    <div className="d-flex gap-2 w-100 justify-content-md-end">
                        <InputGroup style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Warehouse..."
                                className="border-start-0 ps-0 shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Button variant="primary" className="d-flex align-items-center gap-2">
                            <Plus size={18} /> Add Warehouse
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Warehouse Name</th>
                                <th className="border-0 py-3">Location</th>
                                <th className="border-0 py-3">Capacity</th>
                                <th className="border-0 py-3">Stock Level</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((w, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light p-2 rounded text-secondary">
                                                <Archive size={20} />
                                            </div>
                                            <span className="fw-bold text-dark">{w.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-1 text-muted small">
                                            <MapPin size={14} /> {w.location}
                                        </div>
                                    </td>
                                    <td>{w.capacity}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="progress w-100" style={{ height: '6px', width: '80px' }}>
                                                <div className="progress-bar bg-info" style={{ width: w.stockLevel }}></div>
                                            </div>
                                            <span className="small text-muted">{w.stockLevel}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={w.status === 'Active' ? 'success' : 'warning'} className="rounded-pill fw-normal px-3">
                                            {w.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button variant="link" className="text-decoration-none">Manage</Button>
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

export default Warehouses;
