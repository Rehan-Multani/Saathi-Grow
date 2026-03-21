import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Search, Plus, MapPin, Store, Edit, Trash2, Info, Upload, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BranchDetailsModal from '../../components/locations/BranchDetailsModal';
import EditBranchModal from '../../components/locations/EditBranchModal';
import { getBranches, deleteBranch, updateBranch } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const Branches = () => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    const fetchBranchesData = useCallback(async () => {
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const { branches: branchList, pagination: paginationData } = await getBranches(
                adminUser.token,
                { page, limit, search: searchTerm },
                { paginated: true }
            );
            setBranches(Array.isArray(branchList) ? branchList : []);
            setPagination(paginationData || { total: 0, totalPages: 1, page, limit });
        } catch (error) {
            console.error('Error fetching branches:', error);
            toast.error(t('locations.branches.loading_failed', { defaultValue: 'Failed to load branches' }));
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, searchTerm, t]);

    useEffect(() => {
        fetchBranchesData();
    }, [fetchBranchesData]);

    const totalFiltered = pagination.total || 0;
    const totalPages = pagination.totalPages || 1;
    const paginatedBranches = branches;

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const handleShowDetails = (branch) => {
        setSelectedBranch(branch);
        setShowDetailsModal(true);
    };

    const handleEdit = (branch) => {
        setSelectedBranch(branch);
        setShowEditModal(true);
    };

    const handleSaveBranch = async (updatedData) => {
        try {
            await updateBranch(adminUser.token, selectedBranch._id, updatedData);
            toast.success(t('dashboard.update_success', { defaultValue: 'Branch updated successfully' }));
            fetchBranchesData();
            setShowEditModal(false);
        } catch (error) {
            toast.error(error.message || t('dashboard.update_failed', { defaultValue: 'Failed to update branch' }));
        }
    };

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation(t('locations.branches.delete_confirm_title'), t('locations.branches.delete_confirm_text', { name }));
        if (result.isConfirmed) {
            try {
                await deleteBranch(adminUser.token, id);
                fetchBranchesData();
                showSuccessAlert(t('dashboard.deleted_title'), t('dashboard.deleted_text'));
            } catch (error) {
                showErrorAlert(t('dashboard.error_title'), error.message || t('dashboard.failed_to_delete'));
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
                        <div className="d-flex align-items-center gap-2">
                            <h4 className="fw-bold mb-1 text-dark">{t('locations.branches.title')}</h4>
                            <PageInfoTooltip data={pageInfoData.allBranches} />
                        </div>
                        <p className="text-muted small mb-0 d-none d-sm-block">{t('locations.branches.subtitle')}</p>
                    </div>
                </div>

                <div className="d-flex flex-column flex-md-row gap-2 w-100 w-lg-auto align-items-stretch">
                    <InputGroup className="shadow-sm flex-grow-1" style={{ minWidth: 'min(100%, 250px)' }}>
                        <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
                        <Form.Control
                            placeholder={t('locations.branches.search_placeholder')}
                            className="border-start-0 ps-0 shadow-none py-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    <div className="d-flex flex-row gap-2 w-100 w-md-auto">
                        <Link to="/admin/locations/branches/add" className="btn btn-primary flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-1 gap-sm-2 px-2 px-lg-4 shadow-sm py-2 text-nowrap">
                            <Plus size={18} /> <span className="small fw-bold">{t('locations.branches.add_new')}</span>
                        </Link>
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden mt-2">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">{t('locations.branches.loading')}</p>
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                                <tr>
                                    <th className="ps-4 border-0 py-3">{t('locations.branches.table.details')}</th>
                                    <th className="border-0 py-3">{t('locations.branches.table.code')}</th>
                                    <th className="border-0 py-3">{t('locations.branches.table.phone')}</th>
                                    <th className="border-0 py-3">{t('locations.branches.table.status')}</th>
                                    <th className="border-0 py-3 text-end pe-4">{t('locations.branches.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedBranches.length > 0 ? paginatedBranches.map((b) => (
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
                                                {b.isActive ? t('locations.branches.status.active') : t('locations.branches.status.inactive')}
                                            </Badge>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="btn-icon-soft text-primary border shadow-none"
                                                    onClick={() => handleShowDetails(b)}
                                                    title={t('locations.branches.view_details')}
                                                >
                                                    <Info size={16} />
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="btn-icon-soft text-warning border shadow-none"
                                                    onClick={() => handleEdit(b)}
                                                    title={t('locations.branches.edit')}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="btn-icon-soft text-danger border shadow-none"
                                                    onClick={() => handleDelete(b._id, b.name)}
                                                    title={t('locations.branches.delete')}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="text-muted">{t('locations.branches.no_branches')}</div>
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
                            {t('locations.branches.pagination.showing')} <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> {t('locations.branches.pagination.to')} <span className="fw-semibold text-dark">{Math.min(page * limit, totalFiltered)}</span> {t('locations.branches.pagination.of')} <span className="fw-semibold text-dark">{totalFiltered}</span> {t('locations.branches.title')}
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
                                {(() => {
                                    return [...Array(totalPages)].map((_, i) => {
                                        const p = i + 1;
                                        if (p === 1 || p === totalPages || Math.abs(page - p) <= 1) {
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
                                    });
                                })()}
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
