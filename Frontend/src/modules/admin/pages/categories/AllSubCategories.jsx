import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, OverlayTrigger, Tooltip, Image as BSImage, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Edit, Trash2, ImageIcon, Info, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getSubCategories, deleteSubCategory, updateSubCategory } from '../../api/subcategoryApi';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';
import SubCategoryEditModal from '../../components/products/SubCategoryEditModal';

const AllSubCategories = () => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);

    const fetchSubCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getSubCategories(adminUser.token);
            setSubCategories(data);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            toast.error(t('subcategories.loading_failed', { defaultValue: 'Failed to load subcategories' }));
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, t]);

    useEffect(() => {
        fetchSubCategories();
    }, [fetchSubCategories]);

    const filtered = subCategories.filter(sc =>
        sc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sc.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;
    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const paginatedSubCategories = filtered.slice((page - 1) * limit, page * limit);

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const handleEdit = (subCategory) => {
        setSelectedSubCategory(subCategory);
        setShowEditModal(true);
    };

    const handleSave = async (updatedData) => {
        try {
            const updated = await updateSubCategory(adminUser.token, selectedSubCategory._id, updatedData);
            setSubCategories(subCategories.map(sc => sc._id === updated._id ? updated : sc));
            toast.success(t('dashboard.status_updated_success'));
            setShowEditModal(false);
            fetchSubCategories(); // Refresh to get populated data
        } catch (error) {
            toast.error(error.message || t('dashboard.status_update_failed'));
        }
    };

    const handleDelete = async (id, name) => {
        const result = await showDeleteConfirmation(t('dashboard.delete_confirm_title'), t('dashboard.delete_confirm_text', { name }));
        if (result.isConfirmed) {
            try {
                await deleteSubCategory(adminUser.token, id);
                setSubCategories(subCategories.filter(sc => sc._id !== id));
                await showSuccessAlert(t('dashboard.deleted_title'), t('dashboard.deleted_text'));
            } catch (error) {
                showErrorAlert(t('dashboard.error_title'), error.response?.data?.message || error.message || t('dashboard.failed_to_delete'));
            }
        }
    };

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 gap-lg-4 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary d-none d-md-flex">
                        <Layers size={24} />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <h4 className="fw-bold mb-1 text-dark">{t('subcategories.title', { defaultValue: 'All Subcategories' })}</h4>
                            <PageInfoTooltip data={pageInfoData.allSubCategories || { title: 'Subcategories', description: 'Manage nested subcategories for products.' }} />
                        </div>
                        <p className="text-muted small mb-0 d-none d-sm-block">{t('subcategories.subtitle', { defaultValue: 'Organize products with hierarchical sub-categories' })}</p>
                    </div>
                </div>

                <div className="d-flex flex-column flex-md-row gap-2 w-100 w-lg-auto align-items-stretch">
                    <InputGroup className="shadow-sm flex-grow-1" style={{ minWidth: 'min(100%, 250px)' }}>
                        <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
                        <Form.Control
                            placeholder={t('subcategories.search_placeholder', { defaultValue: 'Search subcategories...' })}
                            className="border-start-0 ps-0 shadow-none py-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    <div className="d-flex flex-row gap-2 w-100 w-md-auto">
                        <Link to="/admin/subcategories/add" className={`btn btn-primary flex-grow-1 flex-md-grow-0 d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm py-2 text-nowrap ${adminUser.role !== 'Admin' ? 'disabled opacity-50' : ''}`}>
                            <Plus size={18} /> <span className="small fw-bold">{t('subcategories.add_new', { defaultValue: 'Add Subcategory' })}</span>
                        </Link>
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden mt-2">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="grow" variant="primary" />
                            <p className="mt-2 text-muted">{t('common.loading', { defaultValue: 'Loading...' })}</p>
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle text-nowrap">
                            <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                                <tr>
                                    <th className="ps-4 border-0 py-3">{t('subcategories.table.info', { defaultValue: 'Subcategory Info' })}</th>
                                    <th className="border-0 py-3">{t('subcategories.table.parent', { defaultValue: 'Parent Category' })}</th>
                                    <th className="border-0 py-3 text-center">{t('subcategories.table.slug', { defaultValue: 'Slug' })}</th>
                                    <th className="border-0 py-3 text-center">{t('subcategories.table.status', { defaultValue: 'Status' })}</th>
                                    <th className="border-0 py-3 text-end pe-4">{t('subcategories.table.actions', { defaultValue: 'Actions' })}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedSubCategories.length > 0 ? paginatedSubCategories.map((sc) => (
                                    <tr key={sc._id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div
                                                    className="rounded shadow-sm d-flex align-items-center justify-content-center border border-white bg-light"
                                                    style={{ width: 44, height: 44, padding: '4px' }}
                                                >
                                                    {sc.image ? (
                                                        <BSImage src={sc.image} fluid style={{ maxHeight: '100%', objectFit: 'contain' }} />
                                                    ) : (
                                                        <ImageIcon size={18} className="text-secondary opacity-50" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="fw-bold text-dark">{sc.name}</div>
                                                        {sc.description && (
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={<Tooltip>{sc.description}</Tooltip>}
                                                            >
                                                                <Info size={14} className="text-muted cursor-pointer" />
                                                            </OverlayTrigger>
                                                        )}
                                                    </div>
                                                    <div className="small text-muted" style={{ fontSize: '10px' }}>{sc._id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg="info" className="bg-opacity-10 text-info fw-semibold border border-info border-opacity-20 px-2 py-1">
                                                {sc.categoryName || (sc.category?.name)}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            <span className="font-monospace small bg-light border px-2 py-1 rounded text-primary">{sc.slug}</span>
                                        </td>
                                        <td className="text-center">
                                            <Badge bg={sc.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3 py-1 shadow-sm">
                                                {sc.status === 'Active' ? t('products.status.active') : t('products.status.inactive', { defaultValue: 'Inactive' })}
                                            </Badge>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button
                                                    variant="light" size="sm" className="btn-icon-soft text-warning border shadow-none"
                                                    onClick={() => handleEdit(sc)}
                                                    disabled={adminUser.role !== 'Admin'}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="light" size="sm" className="btn-icon-soft text-danger border shadow-none"
                                                    onClick={() => handleDelete(sc._id, sc.name)}
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
                                            {searchTerm ? t('subcategories.no_matches', { defaultValue: 'No subcategories match your search.' }) : t('subcategories.no_data', { defaultValue: 'No subcategories found.' })}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>

                {!loading && totalFiltered > 10 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                             Showing <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> to <span className="fw-semibold text-dark">{Math.min(page * limit, totalFiltered)}</span> of <span className="fw-semibold text-dark">{totalFiltered}</span> Subcategories
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Button
                                variant="light" size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <span className="small fw-bold">{page} / {totalPages}</span>
                            <Button
                                variant="light" size="sm"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {showEditModal && (
                <SubCategoryEditModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    subCategory={selectedSubCategory}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default AllSubCategories;
