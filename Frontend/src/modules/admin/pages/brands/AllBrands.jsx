import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Tag, Upload, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const BRANDS_MOCK = [
    { id: '1', name: 'Nike', products: 120, status: 'Active' },
    { id: '2', name: 'Adidas', products: 95, status: 'Active' },
    { id: '3', name: 'Samsung', products: 40, status: 'Active' },
    { id: '4', name: 'Apple', products: 60, status: 'Active' },
    { id: '5', name: 'Nestle', products: 15, status: 'Inactive' },
];

const AllBrands = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = BRANDS_MOCK.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <h5 className="mb-0 fw-bold">Brands</h5>
                    <div className="d-flex flex-column flex-sm-row gap-2 w-100 justify-content-sm-end">
                        <InputGroup className="w-100" style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Brands..."
                                className="border-start-0 ps-0 shadow-none"
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
                            <Link to="/admin/brands/add" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 shadow-sm">
                                <Plus size={18} />
                                <span className="d-none d-sm-inline">Add Brand</span>
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
                                <th className="ps-4 border-0 py-3">Brand Name</th>
                                <th className="border-0 py-3">Products</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((b, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="bg-light p-2 rounded text-primary">
                                                <Tag size={18} />
                                            </div>
                                            <span className="fw-bold text-dark">{b.name}</span>
                                        </div>
                                    </td>
                                    <td>{b.products} Items</td>
                                    <td>
                                        <Badge bg={b.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3">
                                            {b.status}
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

export default AllBrands;
