import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, Tag, Upload, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import BrandEditModal from '../../components/products/BrandEditModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getBrands, deleteBrand, updateBrand } from '../../api/brandApi';
import { toast } from 'react-toastify';

const AllBrands = () => {
    const { adminUser } = useAdminAuth();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);

    const fetchBrands = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getBrands(adminUser.token);
            setBrands(data);
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Failed to load brands');
        } finally {
            setLoading(false);
        }
    }, [adminUser.token]);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    const filtered = brands.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id) => {
        const result = await showDeleteConfirmation('Delete Brand', 'Are you sure you want to delete this brand? This action cannot be undone.');
        if (result.isConfirmed) {
            try {
                await deleteBrand(adminUser.token, id);
                setBrands(brands.filter(b => b._id !== id));
                await showSuccessAlert('Deleted!', 'Brand has been deleted.');
            } catch (error) {
                showErrorAlert('Error', error.message || 'Failed to delete brand');
            }
        }
    };

    const handleEdit = (brand) => {
        setSelectedBrand(brand);
        setShowEditModal(true);
    };

    const handleSave = async (updatedBrandData) => {
        try {
            // If updatedBrandData is FormData (for logo updates), or a plain object
            const isFormData = updatedBrandData instanceof FormData;
            const updated = await updateBrand(adminUser.token, selectedBrand._id, updatedBrandData);

            setBrands(brands.map(b => b._id === updated._id ? updated : b));
            toast.success('Brand updated successfully');
            setShowEditModal(false);
        } catch (error) {
            toast.error(error.message || 'Failed to update brand');
        }
    };

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <h5 className="mb-0 fw-bold">Marketplace Brands</h5>
                    <div className="d-flex flex-column flex-sm-row gap-2 w-100 justify-content-sm-end">
                        <InputGroup className="w-100" style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search by name or category..."
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
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="grow" variant="primary" />
                            <p className="mt-2 text-muted">Loading brands...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light text-muted small text-uppercase">
                                <tr>
                                    <th className="ps-4 border-0 py-3">Brand</th>
                                    <th className="border-0 py-3">Category</th>
                                    <th className="border-0 py-3">Details</th>
                                    <th className="border-0 py-3">Status</th>
                                    <th className="border-0 py-3 text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((b) => (
                                    <tr key={b._id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-light rounded p-1 border" style={{ width: '40px', height: '40px' }}>
                                                    {b.logo ? (
                                                        <img src={b.logo} alt={b.name} className="w-100 h-100 object-fit-contain" />
                                                    ) : (
                                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-primary">
                                                            <Tag size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="fw-bold text-dark">{b.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg="info" className="bg-opacity-10 text-info fw-normal px-2">
                                                {b.category}
                                            </Badge>
                                        </td>
                                        <td className="small text-muted">
                                            {b.website ? <a href={b.website} target="_blank" rel="noreferrer" className="text-decoration-none d-block">Website</a> : null}
                                            <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>{b.description || 'No description'}</span>
                                        </td>
                                        <td>
                                            <Badge bg={b.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3">
                                                {b.status}
                                            </Badge>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button
                                                    variant="light" size="sm" className="btn-icon-soft text-primary"
                                                    onClick={() => handleEdit(b)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="light" size="sm" className="btn-icon-soft text-danger"
                                                    onClick={() => handleDelete(b._id)}
                                                    disabled={adminUser.role !== 'Admin'}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center py-5">
                            <Tag size={48} className="text-muted mb-3 opacity-20" />
                            <h5>No Brands Found</h5>
                            <p className="text-muted">Start by adding your first brand!</p>
                            <Link to="/admin/brands/add" className="btn btn-primary mt-2">Add New Brand</Link>
                        </div>
                    )}
                </Card.Body>
            </Card>

            <BrandEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                brand={selectedBrand}
                onSave={handleSave}
            />
        </div>
    );
};

export default AllBrands;
