import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Search, Plus, Phone, Truck, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DeliveryPartnerEditModal from '../../components/delivery/DeliveryPartnerEditModal';
import Swal from 'sweetalert2';
import * as api from '../../api/adminDeliveryApi';

const DeliveryPartners = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const { partners: partnerList, pagination: paginationData } = await api.getDeliveryPartners(
                { page, limit, search: searchTerm },
                { paginated: true }
            );
            setPartners(Array.isArray(partnerList) ? partnerList : []);
            setPagination(paginationData || { total: 0, totalPages: 1, page, limit });
        } catch (error) {
            Swal.fire('Error', 'Failed to load delivery partners', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, [page, searchTerm]);

    const totalFiltered = pagination.total || 0;
    const totalPages = pagination.totalPages || 1;
    const paginatedPartners = partners;

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Delete Partner?',
            text: `Are you sure you want to remove ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Delete'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.deleteDeliveryPartner(id);
                    fetchPartners();
                    Swal.fire('Deleted!', 'Partner has been removed.', 'success');
                } catch (err) {
                    Swal.fire('Error', err?.response?.data?.message || 'Failed to delete partner', 'error');
                }
            }
        });
    };

    const handleEdit = (partner) => {
        setSelectedPartner(partner);
        setShowEditModal(true);
    };

    const handleSave = async (updatedPartner) => {
        try {
            await api.updateDeliveryPartnerStatus(updatedPartner._id, updatedPartner.authStatus);
            fetchPartners();
            Swal.fire({
                title: 'Updated!',
                text: 'Partner permission status updated successfully.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (e) {
            Swal.fire('Error', 'Failed to save changes against server', 'error');
        }
    };

    return (
        <div className="p-3 p-md-4">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded text-primary d-none d-md-flex">
                            <Truck size={20} />
                        </div>
                        <h5 className="mb-0 fw-bold text-nowrap">Delivery Partners</h5>
                    </div>
                    <div className="d-flex flex-column flex-md-row gap-2 flex-grow-1 justify-content-md-end">
                        <InputGroup className="w-100" style={{ maxWidth: '400px' }}>
                            <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search by name or ID..."
                                className="border-start-0 ps-0 shadow-none py-2"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Link to="/admin/delivery/partners/add" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm py-2">
                            <Plus size={18} /> <span>Add New Partner</span>
                        </Link>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm overflow-hidden mt-2">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle text-center">
                        <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                            <tr>
                                <th className="ps-4 border-0 py-3 text-start">Partner Name</th>
                                <th className="border-0 py-3">Type</th>
                                <th className="border-0 py-3">Contact</th>
                                <th className="border-0 py-3">Capacity</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        <Spinner animation="border" variant="primary" />
                                        <div className="mt-2">Loading partners...</div>
                                    </td>
                                </tr>
                            ) : paginatedPartners.length > 0 ? paginatedPartners.map((p) => (
                                <tr key={p._id}>
                                    <td className="ps-4 text-start">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light p-2 rounded text-primary">
                                                <Truck size={20} />
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/admin/delivery/partners/${p._id}`}
                                                    className="fw-bold text-dark text-decoration-none hover-primary transition-colors d-block"
                                                >
                                                    {p.name}
                                                </Link>
                                                <div className="small text-muted">{p.uniqueId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><Badge bg="light" text="dark" className="border fw-normal px-3 py-1 shadow-none">{p.vehicleType || 'Individual'}</Badge></td>
                                    <td>
                                        <div className="d-flex align-items-center justify-content-center gap-2 text-muted small">
                                            <Phone size={14} /> {p.phone}
                                        </div>
                                    </td>
                                    <td className="fw-medium text-capitalize">{p.dutyStatus}</td>
                                    <td>
                                        <Badge bg={p.authStatus === 'Active' ? 'success' : p.authStatus === 'Suspended' ? 'danger' : 'secondary'} className="rounded-pill fw-normal px-3 py-1 shadow-sm">
                                            {p.authStatus}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button
                                                variant="light" size="sm" className="btn-icon-soft text-warning border shadow-none"
                                                onClick={() => handleEdit(p)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="light" size="sm" className="btn-icon-soft text-danger border shadow-none"
                                                onClick={() => handleDelete(p._id, p.name)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted small">
                                        No partners found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>

                {/* Pagination Controls */}
                {!loading && totalFiltered > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            Showing <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> to <span className="fw-semibold text-dark">{Math.min(page * limit, totalFiltered)}</span> of <span className="fw-semibold text-dark">{totalFiltered}</span> partners
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

            <DeliveryPartnerEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                partner={selectedPartner}
                onSave={handleSave}
            />
        </div>
    );
};

export default DeliveryPartners;
