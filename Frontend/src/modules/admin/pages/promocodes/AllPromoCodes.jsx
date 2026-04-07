import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Search, Plus, Ticket, Copy, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import PromoCodeEditModal from '../../components/promocodes/PromoCodeEditModal';
import { getPromoCodes, deletePromoCode, updatePromoCode } from '../../api/promoCodeApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const AllPromoCodes = () => {
    const { adminUser } = useAdminAuth();
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchPromos = async () => {
        if (!adminUser?.token) return;
        try {
            setLoading(true);
            const result = await getPromoCodes(adminUser.token);
            setPromos(result.data || []);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch promo codes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, [adminUser?.token]);

    const filtered = promos.filter(p =>
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const paginatedPromos = filtered.slice((page - 1) * limit, page * limit);

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        Swal.fire({
            title: 'Copied!',
            text: `Code "${code}" copied to clipboard.`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const handleEdit = (promo) => {
        setSelectedPromo(promo);
        setShowEditModal(true);
    };

    const handleSave = async (updatedPromo) => {
        try {
            await updatePromoCode(adminUser.token, updatedPromo._id, updatedPromo);
            fetchPromos();
            setShowEditModal(false);
            Swal.fire({
                title: 'Updated!',
                text: 'Promo code details have been updated.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            toast.error(error.message || 'Update failed');
        }
    };

    const handleDelete = (id, code) => {
        Swal.fire({
            title: 'Delete Promo Code?',
            text: `Are you sure you want to remove "${code}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Delete'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deletePromoCode(adminUser.token, id);
                    fetchPromos();
                    Swal.fire('Deleted!', 'Promo code has been removed.', 'success');
                } catch (error) {
                    toast.error(error.message || 'Delete failed');
                }
            }
        });
    };

    const getStatusBadge = (p) => {
        const now = new Date();
        const validUntil = new Date(p.validUntil);
        const validFrom = new Date(p.validFrom);

        if (!p.isActive) {
            return <Badge bg="secondary" className="rounded-pill fw-normal px-3 py-1.5 shadow-sm">Inactive</Badge>;
        }

        if (now < validFrom) {
            return <Badge bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill fw-normal px-3 py-1.5 shadow-sm">Upcoming</Badge>;
        }

        if (now > validUntil) {
            return <Badge bg="danger" className="rounded-pill fw-normal px-3 py-1.5 shadow-sm">Expired</Badge>;
        }

        if (p.usageLimitTotal > 0 && p.usedCount >= p.usageLimitTotal) {
            return <Badge bg="dark" className="bg-opacity-75 rounded-pill fw-normal px-3 py-1.5 shadow-sm">Limit Reached</Badge>;
        }

        return <Badge bg="success" className="rounded-pill fw-normal px-3 py-1.5 shadow-sm">Active</Badge>;
    };

    return (
        <div className="p-3 p-md-4">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded text-primary d-none d-md-flex">
                            <Ticket size={20} />
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <h5 className="mb-0 fw-bold text-nowrap">Promo Codes</h5>
                            <PageInfoTooltip data={pageInfoData.allPromoCodes} />
                        </div>
                    </div>
                    <div className="d-flex flex-column flex-sm-row gap-2 flex-grow-1 justify-content-sm-end">
                        <InputGroup className="w-100 shadow-sm" style={{ maxWidth: '350px' }}>
                            <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Code..."
                                className="border-start-0 ps-0 shadow-none py-2"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Link to="/admin/promocodes/create" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm py-2">
                            <Plus size={18} /> <span className="fw-bold">Create Code</span>
                        </Link>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm overflow-hidden mt-2">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Loading Promo Codes...</p>
                        </div>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                                <tr>
                                    <th className="ps-4 border-0 py-3">Code</th>
                                    <th className="border-0 py-3">Discount Type</th>
                                    <th className="border-0 py-3 text-center">Value</th>
                                    <th className="border-0 py-3 text-center">Usage</th>
                                    <th className="border-0 py-3 text-center">Min Order</th>
                                    <th className="border-0 py-3 text-center">Status</th>
                                    <th className="border-0 py-3 text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPromos.length > 0 ? paginatedPromos.map((p) => (
                                    <tr key={p._id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-light p-2 rounded text-primary border shadow-sm">
                                                    <Ticket size={20} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark font-monospace h6 mb-0">{p.code}</div>
                                                    <div className="text-muted small" style={{ fontSize: '10px' }}>ID: {p._id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-secondary small fw-medium">{p.discountType}</td>
                                        <td className="text-center">
                                            <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1.5 fw-bold">
                                                {p.discountType === 'Percentage' ? `${p.discountValue}%` : 
                                                 p.discountType === 'FreeShipping' ? 'FREE' : `₹${p.discountValue}`}
                                            </Badge>
                                        </td>
                                        <td className="text-center font-monospace small">
                                            <Badge bg="light" text="dark" className="border px-3 py-1.5 shadow-none">
                                                {p.usedCount} / {p.usageLimitTotal === 0 ? '∞' : p.usageLimitTotal}
                                            </Badge>
                                        </td>
                                        <td className="text-center text-secondary small fw-bold">₹{p.minOrderValue}</td>
                                         <td className="text-center">
                                             {getStatusBadge(p)}
                                         </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button
                                                    variant="light" size="sm"
                                                    className="btn-icon-soft text-secondary border shadow-none mt-1"
                                                    title="Copy Code"
                                                    onClick={() => handleCopy(p.code)}
                                                >
                                                    <Copy size={16} />
                                                </Button>
                                                <Button
                                                    variant="light" size="sm"
                                                    className="btn-icon-soft text-primary border shadow-none mt-1"
                                                    onClick={() => handleEdit(p)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="light" size="sm"
                                                    className="btn-icon-soft text-danger border shadow-none mt-1"
                                                    onClick={() => handleDelete(p._id, p.code)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted small">
                                            No promo codes found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>

                {/* Pagination Controls */}
                {totalFiltered > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            Showing <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> to <span className="fw-semibold text-dark">{Math.min(page * limit, totalFiltered)}</span> of <span className="fw-semibold text-dark">{totalFiltered}</span> codes
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

            <PromoCodeEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                promoCode={selectedPromo}
                onSave={handleSave}
            />
        </div>
    );
};

export default AllPromoCodes;
