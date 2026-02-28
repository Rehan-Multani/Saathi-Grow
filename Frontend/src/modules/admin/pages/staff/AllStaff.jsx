import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Modal, Spinner } from 'react-bootstrap';
import { Search, Plus, User, Shield, Briefcase, Mail, Phone, Edit, Trash2, Key, X, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import StaffEditModal from '../../components/staff/StaffEditModal';
import { getAllStaff, updateStaff, deleteStaff } from '../../api/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';

const AVAILABLE_PERMISSIONS = [
    { id: 'VIEW_DASHBOARD', label: 'View Dashboard Analytics' },
    { id: 'VIEW_ORDERS', label: 'View Orders List' },
    { id: 'MANAGE_ORDERS', label: 'Manage/Change Order Status' },
    { id: 'MANAGE_REFUNDS_RETURNS', label: 'Approve Refunds & Returns' },
    { id: 'VIEW_PRODUCTS', label: 'View Products Catalog' },
    { id: 'MANAGE_PRODUCTS', label: 'Add/Edit/Delete Products' },
    { id: 'MANAGE_CATEGORIES_BRANDS', label: 'Add/Edit Categories & Brands' },
    { id: 'MANAGE_INVENTORY', label: 'Update Stock/Inventory' },
    { id: 'MANAGE_DELIVERY_BOYS', label: 'Manage Delivery Partners' },
    { id: 'VIEW_CUSTOMERS', label: 'View Customer Info' },
    { id: 'MANAGE_CUSTOMERS', label: 'Block/Unblock/Wallet Edit' },
    { id: 'MANAGE_STAFF', label: 'Create/Edit Staff' },
    { id: 'MANAGE_BRANCHES', label: 'Manage Branch Locations' },
    { id: 'MANAGE_CAMPAIGNS', label: 'Manage Promo Banners & Deals' },
    { id: 'MANAGE_VENDORS', label: 'Manage Vendors & Payouts' },
    { id: 'MANAGE_SETTINGS', label: 'App Global Settings (Taxes, Delivery)' }
];

const AllStaff = () => {
    const { adminUser } = useAdminAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [tempPermissions, setTempPermissions] = useState([]);

    const fetchStaffData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllStaff(adminUser.token);
            setStaffList(data);
        } catch (error) {
            console.error('Error fetching staff:', error);
            toast.error('Failed to load staff members');
        } finally {
            setLoading(false);
        }
    }, [adminUser.token]);

    useEffect(() => {
        fetchStaffData();
    }, [fetchStaffData]);

    const handleOpenPermissionModal = (staff) => {
        setSelectedStaff(staff);
        setTempPermissions(staff.permissions || []);
        setShowPermissionModal(true);
    };

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation('Remove Staff?', `Are you sure you want to remove "${name}"?`);
        if (result.isConfirmed) {
            try {
                await deleteStaff(adminUser.token, id);
                setStaffList(prev => prev.filter(s => s._id !== id));
                showSuccessAlert('Removed!', 'Staff member has been removed.');
            } catch (error) {
                showErrorAlert('Error', error.message || 'Failed to remove staff');
            }
        }
    };

    const handleEdit = (staff) => {
        setSelectedStaff(staff);
        setShowEditModal(true);
    };

    const handleSaveStaff = async (updatedData) => {
        try {
            await updateStaff(adminUser.token, selectedStaff._id, updatedData);
            toast.success('Staff details updated');
            fetchStaffData();
            setShowEditModal(false);
        } catch (error) {
            toast.error(error.message || 'Failed to update staff');
        }
    };

    const handlePermissionToggle = (perm) => {
        if (tempPermissions.includes(perm)) {
            setTempPermissions(tempPermissions.filter(p => p !== perm));
        } else {
            setTempPermissions([...tempPermissions, perm]);
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedStaff) return;
        try {
            await updateStaff(adminUser.token, selectedStaff._id, { permissions: tempPermissions });
            toast.success('Permissions updated');
            fetchStaffData();
            setShowPermissionModal(false);
        } catch (error) {
            toast.error(error.message || 'Failed to update permissions');
        }
    };

    const filtered = staffList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.branchId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <h5 className="mb-0 fw-bold text-nowrap">Staff Management</h5>
                    <div className="d-flex flex-column flex-sm-row gap-2 flex-grow-1 justify-content-sm-end">
                        <InputGroup className="w-100" style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Staff..."
                                className="border-start-0 ps-0 shadow-none font-small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Link to="/admin/staff/add" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 responsive-btn shadow-sm">
                            <Plus size={18} />
                            <span className="d-none d-sm-inline">Add Staff</span>
                            <span className="d-inline d-sm-none">Add</span>
                        </Link>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Loading staff...</p>
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                                <tr>
                                    <th className="ps-4 border-0 py-3">Staff Profile</th>
                                    <th className="border-0 py-3">Role</th>
                                    <th className="border-0 py-3">Branch</th>
                                    <th className="border-0 py-3">Status</th>
                                    <th className="border-0 py-3 text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s) => (
                                    <tr key={s._id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-light d-flex align-items-center justify-content-center text-primary font-bold border shadow-sm" style={{ width: '40px', height: '40px' }}>
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{s.name}</div>
                                                    <div className="small text-muted">{s.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg="light" className="text-dark border-0 fw-normal">
                                                <Briefcase size={12} className="me-1" /> {s.role}
                                            </Badge>
                                        </td>
                                        <td>
                                            {s.branchId ? (
                                                <div className="d-flex align-items-center gap-2 text-primary small fw-medium">
                                                    <Store size={14} /> {s.branchId.name}
                                                </div>
                                            ) : (
                                                <span className="text-muted small italic">Global</span>
                                            )}
                                        </td>
                                        <td>
                                            <Badge bg={s.isActive ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3">
                                                {s.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button
                                                    variant="light" size="sm" className="btn-icon-soft text-warning" title="Manage Permissions"
                                                    onClick={() => handleOpenPermissionModal(s)}
                                                >
                                                    <Key size={16} />
                                                </Button>
                                                <Button
                                                    variant="light" size="sm" className="btn-icon-soft text-primary" title="Edit Staff"
                                                    onClick={() => handleEdit(s)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="light" size="sm" className="btn-icon-soft text-danger" title="Remove Staff"
                                                    onClick={() => handleDelete(s._id, s.name)}
                                                    disabled={s.role === 'Admin'} // Protect Super Admin
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Permission Modal */}
            <Modal show={showPermissionModal} onHide={() => setShowPermissionModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="h5 fw-bold">Manage Permissions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedStaff && (
                        <div>
                            <div className="mb-4 p-3 bg-light rounded d-flex align-items-center gap-3">
                                <div className="rounded-circle bg-white d-flex align-items-center justify-content-center text-primary fw-bold border shadow-sm" style={{ width: '40px', height: '40px' }}>
                                    {selectedStaff.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="fw-bold">{selectedStaff.name}</div>
                                    <div className="small text-muted">{selectedStaff.role}</div>
                                </div>
                            </div>

                            <h6 className="fw-bold mb-3 text-muted small text-uppercase">Access Control</h6>
                            <div className="d-flex flex-column gap-2">
                                {AVAILABLE_PERMISSIONS.filter(perm => {
                                    const RESTRICTED_IDS = [
                                        'VIEW_DASHBOARD',
                                        'MANAGE_PRODUCTS',
                                        'MANAGE_CATEGORIES_BRANDS',
                                        'MANAGE_DELIVERY',
                                        'MANAGE_DELIVERY_BOYS',
                                        'MANAGE_CUSTOMERS',
                                        'MANAGE_BRANCHES',
                                        'MANAGE_VENDORS',
                                        'MANAGE_SETTINGS'
                                    ];
                                    if (selectedStaff.role === 'Admin') return true;
                                    return !RESTRICTED_IDS.includes(perm.id);
                                }).map((perm) => (
                                    <div key={perm.id} className="d-flex align-items-center justify-content-between p-2 border rounded hover-bg-light">
                                        <div className="d-flex align-items-center gap-2">
                                            {perm.id.includes('MANAGE') ? <Shield size={16} className="text-primary" /> : <div style={{ width: 16 }} />}
                                            <span className={perm.id.includes('MANAGE') ? 'fw-medium text-primary' : 'text-dark'}>{perm.label}</span>
                                        </div>
                                        <Form.Check
                                            type="switch"
                                            id={`perm-switch-${perm.id}`}
                                            checked={tempPermissions.includes(perm.id)}
                                            onChange={() => handlePermissionToggle(perm.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0 gap-2">
                    <Button variant="light" onClick={() => setShowPermissionModal(false)} className="d-flex align-items-center gap-2">
                        <X size={18} /> Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSavePermissions} className="d-flex align-items-center gap-2 shadow-sm">
                        <Shield size={18} /> Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Staff Modal */}
            <StaffEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                staff={selectedStaff}
                onSave={handleSaveStaff}
            />
        </div>
    );
};

export default AllStaff;
