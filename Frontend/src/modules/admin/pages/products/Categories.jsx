import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Row, Col, Badge, Modal } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Folder } from 'lucide-react';

const CATEGORIES_MOCK = [
    { id: '1', name: 'Electronics', slug: 'electronics', products: 45, status: 'Active' },
    { id: '2', name: 'Groceries', slug: 'groceries', products: 120, status: 'Active' },
    { id: '3', name: 'Clothing', slug: 'clothing', products: 30, status: 'Active' },
    { id: '4', name: 'Home & Kitchen', slug: 'home-kitchen', products: 15, status: 'Inactive' },
];

const Categories = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ name: '', slug: '', status: 'Active' });

    const filteredCategories = CATEGORIES_MOCK.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (category) => {
        setEditMode(true);
        setCurrentCategory(category);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditMode(false);
        setCurrentCategory({ name: '', slug: '', status: 'Active' });
        setShowModal(true);
    };

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <h5 className="mb-0 fw-bold">Product Categories</h5>
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
                        <Button variant="primary" className="d-flex align-items-center gap-2" onClick={handleAdd}>
                            <Plus size={18} /> Add Category
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Category Name</th>
                                <th className="border-0 py-3">Slug</th>
                                <th className="border-0 py-3">Products Count</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((c, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="bg-light p-2 rounded text-primary">
                                                <Folder size={18} />
                                            </div>
                                            <span className="fw-medium">{c.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted text-monospace small">{c.slug}</td>
                                    <td>{c.products} items</td>
                                    <td>
                                        <Badge bg={c.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3">
                                            {c.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button variant="light" size="sm" className="btn-icon-soft text-primary" onClick={() => handleEdit(c)}>
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

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? 'Edit Category' : 'Add New Category'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Category Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. Electronics"
                                value={currentCategory.name}
                                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Slug</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. electronics"
                                value={currentCategory.slug}
                                onChange={(e) => setCurrentCategory({ ...currentCategory, slug: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                value={currentCategory.status}
                                onChange={(e) => setCurrentCategory({ ...currentCategory, status: e.target.value })}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="primary">Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Categories;
