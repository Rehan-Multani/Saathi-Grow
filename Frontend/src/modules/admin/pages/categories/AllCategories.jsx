import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Folder, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES_MOCK = [
    { id: '1', name: 'Electronics', slug: 'electronics', parent: 'None', status: 'Active', image: null },
    { id: '2', name: 'Smartphones', slug: 'smartphones', parent: 'Electronics', status: 'Active', image: null },
    { id: '3', name: 'Groceries', slug: 'groceries', parent: 'None', status: 'Active', image: null },
    { id: '4', name: 'Mens Wear', slug: 'mens-wear', parent: 'Clothing', status: 'Inactive', image: null },
];

const AllCategories = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = CATEGORIES_MOCK.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <h5 className="mb-0 fw-bold">Categories</h5>
                    <div className="d-flex gap-2 w-100 justify-content-md-end">
                        <InputGroup style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Categories..."
                                className="border-start-0 ps-0 shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Link to="/admin/categories/add" className="btn btn-primary d-flex align-items-center gap-2">
                            <Plus size={18} /> Add Category
                        </Link>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Category info</th>
                                <th className="border-0 py-3">Parent Category</th>
                                <th className="border-0 py-3">Slug</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                                                <ImageIcon size={20} className="text-secondary opacity-50" />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{c.name}</div>
                                                <div className="small text-muted">ID: {c.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-muted">{c.parent}</td>
                                    <td className="text-monospace small">{c.slug}</td>
                                    <td>
                                        <Badge bg={c.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3">
                                            {c.status}
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

export default AllCategories;
