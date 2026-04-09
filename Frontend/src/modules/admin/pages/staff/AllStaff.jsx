import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Modal, Spinner } from 'react-bootstrap';
import { Search, Plus, Briefcase, Edit, Trash2, Key, X, Store, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import StaffEditModal from '../../components/staff/StaffEditModal';
import { getAllStaff, updateStaff, deleteStaff } from '../../api/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const AllStaff = () => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [tempPermissions, setTempPermissions] = useState([]);

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    const fetchStaffData = useCallback(async () => {
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const { staff, pagination: paginationData } = await getAllStaff(
                adminUser.token,
                { page, limit, search: searchTerm },
                { paginated: true }
            );
            setStaffList(Array.isArray(staff) ? staff : []);
            setPagination(paginationData || { total: 0, totalPages: 1, page, limit });
        } catch (error) {
            console.error('Error fetching staff:', error);
            toast.error(t('staff.errors.fetch_failed', { defaultValue: 'Failed to fetch staff list' }));
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, searchTerm, t]);

    useEffect(() => {
        fetchStaffData();
    }, [fetchStaffData]);

    const handleOpenPermissionModal = (staff) => {
        setSelectedStaff(staff);
        setTempPermissions(staff.permissions || []);
        setShowPermissionModal(true);
    };

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation(
            t('staff.alerts.remove_title', { defaultValue: 'Delete Staff Member?' }),
            t('staff.alerts.remove_text', { name, defaultValue: `Are you sure you want to remove ${name}?` })
        );
        if (result.isConfirmed) {
            try {
                await deleteStaff(adminUser.token, id);
                fetchStaffData();
                showSuccessAlert(
                    t('staff.alerts.removed_title', { defaultValue: 'Removed!' }),
                    t('staff.alerts.removed_text', { defaultValue: 'Staff member has been removed successfully.' })
                );
            } catch (error) {
                showErrorAlert(t('common.error'), error.message || t('staff.errors.remove_failed'));
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
            toast.success(t('staff.alerts.update_success', { defaultValue: 'Staff updated successfully' }));
            fetchStaffData();
            setShowEditModal(false);
        } catch (error) {
            toast.error(error.message || t('staff.errors.update_failed'));
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
            toast.success(t('staff.alerts.permissions_updated', { defaultValue: 'Permissions updated successfully' }));
            fetchStaffData();
            setShowPermissionModal(false);
        } catch (error) {
            toast.error(error.message || t('staff.errors.permissions_failed'));
        }
    };

    const totalFiltered = pagination.total || 0;
    const totalPages = pagination.totalPages || 1;
    const paginatedStaff = staffList;

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <h5 className="mb-0 fw-bold text-nowrap">{t('staff.title')}</h5>
                        <PageInfoTooltip data={pageInfoData.manageStaff} />
                    </div>
                    <div className="d-flex flex-column flex-sm-row gap-2 flex-grow-1 justify-content-sm-end">
                        <InputGroup className="w-100" style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder={t('staff.search_placeholder')}
                                className="border-start-0 ps-0 shadow-none font-small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Link to="/admin/staff/add" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 responsive-btn shadow-sm">
                            <Plus size={18} />
                            <span className="d-none d-sm-inline">{t('staff.add_staff')}</span>
                            <span className="d-inline d-sm-none">{t('staff.add_short')}</span>
                        </Link>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">{t('common.loading')}</p>
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                                <tr>
                                    <th className="ps-4 border-0 py-3">{t('staff.table.profile')}</th>
                                    <th className="border-0 py-3">{t('staff.table.role')}</th>
                                    <th className="border-0 py-3">{t('staff.table.branch')}</th>
                                    <th className="border-0 py-3">{t('staff.table.status')}</th>
                                    <th className="border-0 py-3 text-end pe-4">{t('staff.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedStaff.length > 0 ? paginatedStaff.map((s) => (
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
                                                <Briefcase size={12} className="me-1" /> {s.role === 'Branch Manager' ? 'Store Manager' : s.role}
                                            </Badge>
                                        </td>
                                        <td>
                                            {s.branchId ? (
                                                <div className="d-flex align-items-center gap-2 text-primary small fw-medium">
                                                    <Store size={14} /> {s.branchId.name}
                                                </div>
                                            ) : (
                                                <span className="text-muted small italic">{t('staff.global')}</span>
                                            )}
                                        </td>
                                        <td>
                                            <Badge bg={s.isActive ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3">
                                                {s.isActive ? t('staff.status.active') : t('staff.status.inactive')}
                                            </Badge>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button
                                                    variant="light" size="sm" className="btn-icon-soft text-warning" title={t('staff.actions.manage_permissions')}
                                                    onClick={() => handleOpenPermissionModal(s)}
                                                >
                                                    <Key size={16} />
                                                </Button>
                                                <Button
                                                    variant="light" size="sm" className="btn-icon-soft text-primary" title={t('staff.actions.edit_staff')}
                                                    onClick={() => handleEdit(s)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="light" size="sm" className="btn-icon-soft text-danger" title={t('staff.actions.remove_staff')}
                                                    onClick={() => handleDelete(s._id, s.name)}
                                                    disabled={s.role === 'Admin'}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted small">
                                            {t('staff.no_staff')}
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
                            {t('staff.pagination.showing')} <span className="fw-semibold text-dark text-xs">{((page - 1) * limit) + 1}</span> {t('staff.pagination.to')} <span className="fw-semibold text-dark text-xs">{Math.min(page * limit, totalFiltered)}</span> {t('staff.pagination.of')} <span className="fw-semibold text-dark text-xs">{totalFiltered}</span> {t('staff.pagination.staff_members')}
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
                                    if (p === 1 || p === totalPages || Math.abs(page - p) <= 1) {
                                        return (
                                            <Button
                                                key={p}
                                                variant={page === p ? 'primary' : 'light'}
                                                className={`rounded shadow-sm ${page === p ? 'fw-bold' : 'text-secondary border text-xs'}`}
                                                style={{ width: '32px', height: '32px', padding: 0 }}
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

            {/* Permission Modal */}
            <Modal show={showPermissionModal} onHide={() => setShowPermissionModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="h5 fw-bold">{t('staff.permissions_modal.title')}</Modal.Title>
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

                            <h6 className="fw-bold mb-3 text-muted small text-uppercase">{t('staff.permissions_modal.access_control')}</h6>
                            <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '350px' }}>
                                 {[
                                     'VIEW_ORDERS',
                                     'MANAGE_ORDERS',
                                     'MANAGE_REFUNDS_RETURNS',
                                     'VIEW_PRODUCTS',
                                     'MANAGE_INVENTORY',
                                     'VIEW_CUSTOMERS',
                                     'MANAGE_POS_BILLING'
                                 ].map((permId) => (
                                    <div key={permId} className="d-flex align-items-center justify-content-between p-2 border rounded hover-bg-light transition-all">
                                        <div className="d-flex align-items-center gap-2">
                                            {permId.includes('MANAGE') ? <Shield size={16} className="text-primary" /> : <div style={{ width: 16 }} />}
                                            <span className={permId.includes('MANAGE') ? 'fw-medium text-primary small' : 'text-dark small'}>{t(`staff.permission_labels.${permId}`)}</span>
                                        </div>
                                        <Form.Check
                                            type="switch"
                                            id={`perm-switch-${permId}`}
                                            checked={tempPermissions.includes(permId)}
                                            onChange={() => handlePermissionToggle(permId)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0 gap-2">
                    <Button variant="light" onClick={() => setShowPermissionModal(false)} className="d-flex align-items-center gap-2">
                        <X size={18} /> {t('common.cancel')}
                    </Button>
                    <Button variant="primary" onClick={handleSavePermissions} className="d-flex align-items-center gap-2 shadow-sm px-4">
                        <Shield size={18} /> {t('common.save')}
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
