import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, OverlayTrigger, Tooltip, Image as BSImage, Spinner } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, ImageIcon, Info, Upload, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CategoryEditModal from '../../components/products/CategoryEditModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getCategories, deleteCategory, updateCategory } from '../../api/categoryApi';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';

const AllCategories = () => {
    const { adminUser } = useAdminAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCategories(adminUser.token);
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, [adminUser.token]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;
    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const paginatedCategories = filtered.slice((page - 1) * limit, page * limit);

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setShowEditModal(true);
    };

    const handleSave = async (updatedCategoryData) => {
        try {
            const updated = await updateCategory(adminUser.token, selectedCategory._id, updatedCategoryData);
            setCategories(categories.map(c => c._id === updated._id ? updated : c));
            toast.success('Category updated successfully');
            setShowEditModal(false);
        } catch (error) {
            toast.error(error.message || 'Failed to update category');
        }
    };

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation('Delete Category?', `Are you sure you want to remove "${name}"? This action cannot be undone.`);
        if (result.isConfirmed) {
            try {
                await deleteCategory(adminUser.token, id);
                setCategories(categories.filter(c => c._id !== id));
                await showSuccessAlert('Deleted!', 'Category has been removed.');
            } catch (error) {
                showErrorAlert('Error', error.message || 'Failed to delete category');
            }
        }
    };

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 gap-lg-4 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary d-none d-md-flex">
                        <ImageIcon size={24} />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1 text-dark">Categories</h4>
                        <p className="text-muted small mb-0 d-none d-sm-block">Manage your product organization and background styling.</p>
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
                        <Link to="/admin/categories/add" className={`btn btn-primary flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm py-2 text-nowrap ${adminUser.role !== 'Admin' ? 'disabled opacity-50' : ''}`}>
                            <Plus size={18} /> <span className="small fw-bold">Add New</span>
                        </Link>
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden mt-2">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="grow" variant="primary" />
                            <p className="mt-2 text-muted">Loading categories...</p>
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                                <tr>
                                    <th className="ps-4 border-0 py-3">Category info</th>
                                    <th className="border-0 py-3 text-center">Slug</th>
                                    <th className="border-0 py-3 text-center">Background</th>
                                    <th className="border-0 py-3 text-center">Status</th>
                                    <th className="border-0 py-3 text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCategories.length > 0 ? paginatedCategories.map((c) => (
                                    <tr key={c._id}>
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
                                                                overlay={<Tooltip id={`tooltip-${c._id}`}>{c.description}</Tooltip>}
                                                            >
                                                                <Info size={14} className="text-muted cursor-pointer" />
                                                            </OverlayTrigger>
                                                        )}
                                                    </div>
                                                    <div className="small text-muted" style={{ fontSize: '10px' }}>{c._id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center"><span className="font-monospace small bg-light border px-2 py-1 rounded text-primary">{c.slug}</span></td>
                                        <td className="text-center">
                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                <div className="rounded border shadow-sm" style={{ width: '20px', height: '20px', backgroundColor: c.bgColor }}></div>
                                                <span className="small text-muted">{c.bgColor}</span>
                                            </div>
                                        </td>
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
                                                    disabled={adminUser.role !== 'Admin'}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="light" size="sm" className="btn-icon-soft text-danger border shadow-none"
                                                    onClick={() => handleDelete(c._id, c.name)}
                                                    disabled={adminUser.role !== 'Admin'}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted small">
                                            {searchTerm ? 'No categories found matching your search.' : 'No categories found. Start by adding one!'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>

                {/* Pagination Controls */}
                {!loading && totalFiltered > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            Showing <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> to <span className="fw-semibold text-dark">{Math.min(page * limit, totalFiltered)}</span> of <span className="fw-semibold text-dark">{totalFiltered}</span> categories
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Button
                                variant="light"
                                className={`d-flex align-items-center justify-content-center p-2 rounded border shadow-sm ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={16} />
                            </Button>

                            <div className="d-flex align-items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    const isFirstPage = p === 1;
                                    const isLastPage = p === totalPages;
                                    const isNearCurrent = Math.abs(page - p) <= 1;

                                    if (isFirstPage || isLastPage || isNearCurrent) {
                                        return (
                                            <Button
                                                key={p}
                                                variant={page === p ? 'primary' : 'light'}
                                                className={`rounded shadow-sm ${page === p ? 'fw-bold' : 'text-secondary border'}`}
                                                style={{ width: '36px', height: '36px', padding: 0 }}
                                                onClick={() => setPage(p)}
                                            >
                                                {p}
                                            </Button>
                                        );
                                    } else if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-muted px-1">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <Button
                                variant="light"
                                className={`d-flex align-items-center justify-content-center p-2 rounded border shadow-sm ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
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
