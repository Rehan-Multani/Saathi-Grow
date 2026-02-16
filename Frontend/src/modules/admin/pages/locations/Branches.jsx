import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { Search, Plus, MapPin, Store, Edit, Trash2, Info, Upload, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import BranchDetailsModal from '../../components/locations/BranchDetailsModal';
import EditBranchModal from '../../components/locations/EditBranchModal';
import { getBranches, deleteBranch } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';

const Branches = () => {
    const { adminUser } = useAdminAuth();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const fetchBranchesData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getBranches(adminUser.token);
            setBranches(data);
        } catch (error) {
            console.error('Error fetching branches:', error);
            toast.error('Failed to load branches');
        } finally {
            setLoading(false);
        }
    }, [adminUser.token]);

    useEffect(() => {
        fetchBranchesData();
    }, [fetchBranchesData]);

    const filtered = branches.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleShowDetails = (branch) => {
        setSelectedBranch(branch);
        setShowDetailsModal(true);
    };

    const handleEdit = (branch) => {
        setSelectedBranch(branch);
        setShowEditModal(true);
    };

    const handleSaveBranch = () => {
        fetchBranchesData();
        setShowEditModal(false);
    };

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation('Delete Branch?', `Are you sure you want to remove "${name}"?`);
        if (result.isConfirmed) {
            try {
                await deleteBranch(adminUser.token, id);
                setBranches(branches.filter(b => b._id !== id));
                showSuccessAlert('Deleted!', 'Branch has been removed.');
            } catch (error) {
                showErrorAlert('Error', error.message || 'Failed to delete branch');
            }
        }
    };

    const handleExport = () => {
        toast.info('Export functionality coming soon');
    };

    const handleImport = () => {
        toast.info('Import functionality coming soon');
    };

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 gap-lg-4 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary d-none d-md-flex">
                        <Store size={24} />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1 text-dark">Store Branches</h4>
                        <p className="text-muted small mb-0 d-none d-sm-block">Manage your retail locations, managers, and operational status.</p>
                    </div>
                </div>

                <div className="d-flex flex-column flex-md-row gap-2 w-100 w-lg-auto align-items-stretch">
                    <InputGroup className="shadow-sm flex-grow-1" style={{ minWidth: 'min(100%, 250px)' }}>
                        <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
                        <Form.Control
                            placeholder="Search location or manager..."
                            className="border-start-0 ps-0 shadow-none py-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    <div className="d-flex flex-row gap-2 w-100 w-md-auto">
                        <Button variant="light" className="flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-1 gap-sm-2 border shadow-sm px-2 px-lg-3 py-2" onClick={handleImport}>
                            <Upload size={18} className="text-success" /> <span className="small fw-medium">Import</span>
                        </Button>
                        <Button variant="light" className="flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-1 gap-sm-2 border shadow-sm px-2 px-lg-3 py-2" onClick={handleExport}>
                            <Download size={18} className="text-primary" /> <span className="small fw-medium">Export</span>
                        </Button>
                        <Link to="/admin/locations/branches/add" className="btn btn-primary flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-1 gap-sm-2 px-2 px-lg-4 shadow-sm py-2 text-nowrap">
                            <Plus size={18} /> <span className="small fw-bold">Add Branch</span>
                        </Link>
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden mt-2">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Loading branches...</p>
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                                <tr>
                                    <th className="ps-4 border-0 py-3">Branch Details</th>
                                    <th className="border-0 py-3">Code</th>
                                    <th className="border-0 py-3">Phone</th>
                                    <th className="border-0 py-3">Status</th>
                                    <th className="border-0 py-3 text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length > 0 ? filtered.map((b) => (
                                    <tr key={b._id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-primary bg-opacity-10 p-2 rounded text-primary">
                                                    <Store size={20} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{b.name}</div>
                                                    <div className="text-muted small d-flex align-items-center gap-1">
                                                        <MapPin size={12} /> {b.address?.city}, {b.address?.state}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg="light" className="text-dark border font-monospace small">
                                                {b.code}
                                            </Badge>
                                        </td>
                                        <td className="text-muted font-monospace small">{b.phone}</td>
                                        <td>
                                            <Badge
                                                bg={b.isActive ? 'success' : 'secondary'}
                                                className="rounded-pill fw-normal px-3 py-1 shadow-sm"
                                            >
                                                {b.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="btn-icon-soft text-primary border shadow-none"
                                                    onClick={() => handleShowDetails(b)}
                                                    title="View Details"
                                                >
                                                    <Info size={16} />
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="btn-icon-soft text-warning border shadow-none"
                                                    onClick={() => handleEdit(b)}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="btn-icon-soft text-danger border shadow-none"
                                                    onClick={() => handleDelete(b._id, b.name)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="text-muted">No branches found matching your search.</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <BranchDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                branch={selectedBranch}
                onEdit={handleEdit}
            />

            <EditBranchModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                branch={selectedBranch}
                onSave={handleSaveBranch}
            />
        </div>
    );
};

export default Branches;
