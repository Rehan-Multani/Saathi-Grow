import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, OverlayTrigger, Tooltip, Image as BSImage } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, ImageIcon, Info, Upload, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import CategoryEditModal from '../../components/products/CategoryEditModal';
import Swal from 'sweetalert2';

const INITIAL_CATEGORIES = [
    { id: '1', name: 'Electronics', slug: 'electronics', parent: 'None', status: 'Active', image: null, bgColor: '#DBEAFE', description: 'Devices like phones, laptops, and accessories.' },
    { id: '2', name: 'Smartphones', slug: 'smartphones', parent: 'Electronics', status: 'Active', image: null, bgColor: '#D1FAE5', description: 'Latest mobile phones from top brands.' },
    { id: '3', name: 'Groceries', slug: 'groceries', parent: 'None', status: 'Active', image: null, bgColor: '#FEF3C7', description: 'Daily essentials and fresh produce.' },
    { id: '4', name: 'Mens Wear', slug: 'mens-wear', parent: 'Clothing', status: 'Inactive', image: null, bgColor: '#FEE2E2', description: 'Apparel and fashion for men.' },
];

const AllCategories = () => {
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setShowEditModal(true);
    };

    const handleSave = (updatedCategory) => {
        setCategories(categories.map(c => c.id === updatedCategory.id ? updatedCategory : c));
        Swal.fire({
            title: 'Updated!',
            text: 'Category details have been updated successfully.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    };

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Delete Category?',
            text: `Are you sure you want to remove "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                setCategories(categories.filter(c => c.id !== id));
                Swal.fire('Deleted!', 'Category has been removed.', 'success');
            }
        });
    };

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 gap-lg-4 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary d-none d-md-flex">
                        <Plus size={24} />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1 text-dark">Categories</h4>
                        <p className="text-muted small mb-0 d-none d-sm-block">Manage your product organization and taxonomy.</p>
                    </div>
                </div>

                <div className="d-flex flex-column flex-md-row gap-2 w-100 w-lg-auto align-items-stretch">
                    <InputGroup className="shadow-sm flex-grow-1" style={{ minWidth: 'min(100%, 250px)' }}>
                        <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
                        <Form.Control
                            placeholder="Search categories..."
                            className="border-start-0 ps-0 shadow-none py-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    <div className="d-flex flex-row gap-2 w-100 w-md-auto">
                        <Button variant="light" className="flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-2 border shadow-sm px-3 py-2">
                            <Upload size={18} className="text-success" /> <span className="small fw-medium">Import</span>
                        </Button>
                        <Button variant="light" className="flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-2 border shadow-sm px-3 py-2">
                            <Download size={18} className="text-primary" /> <span className="small fw-medium">Export</span>
                        </Button>
                        <Link to="/admin/categories/add" className="btn btn-primary flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm py-2 text-nowrap">
                            <Plus size={18} /> <span className="small fw-bold">Add New</span>
                        </Link>
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden mt-2">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                            <tr>
                                <th className="ps-4 border-0 py-3">Category info</th>
                                <th className="border-0 py-3 text-center">Parent Category</th>
                                <th className="border-0 py-3 text-center">Slug</th>
                                <th className="border-0 py-3 text-center">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((c) => (
                                <tr key={c.id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                className="rounded shadow-sm d-flex align-items-center justify-content-center border border-white"
                                                style={{
                                                    width: 48,
                                                    height: 48,
                                                    backgroundColor: c.bgColor || '#f3f4f6',
                                                    padding: '6px'
                                                }}
                                            >
                                                {c.image ? (
                                                    <BSImage src={c.image} fluid style={{ maxHeight: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <ImageIcon size={20} className="text-secondary opacity-50" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="fw-bold text-dark">{c.name}</div>
                                                    {c.description && (
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={<Tooltip id={`tooltip-${c.id}`}>{c.description}</Tooltip>}
                                                        >
                                                            <Info size={14} className="text-muted cursor-pointer" />
                                                        </OverlayTrigger>
                                                    )}
                                                </div>
                                                <div className="small text-muted">ID: {c.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center text-muted small">{c.parent}</td>
                                    <td className="text-center"><span className="font-monospace small bg-light border px-2 py-1 rounded text-primary">{c.slug}</span></td>
                                    <td className="text-center">
                                        <Badge bg={c.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3 py-1 shadow-sm">
                                            {c.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button
                                                variant="light" size="sm" className="btn-icon-soft text-warning border shadow-none"
                                                onClick={() => handleEdit(c)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="light" size="sm" className="btn-icon-soft text-danger border shadow-none"
                                                onClick={() => handleDelete(c.id, c.name)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted small">
                                        No categories found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <CategoryEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                category={selectedCategory}
                onSave={handleSave}
            />
        </div>
    );
};

export default AllCategories;
