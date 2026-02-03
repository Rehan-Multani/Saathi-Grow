import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, Plus, Ticket, Copy, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import PromoCodeEditModal from '../../components/promocodes/PromoCodeEditModal';

const INITIAL_PROMOS = [
    { id: '1', code: 'SAVE10', type: 'Percentage', value: '10%', usage: '125/500', minOrder: '₹50', status: 'Active' },
    { id: '2', code: 'FREESHIP', type: 'Free Shipping', value: 'N/A', usage: '45/100', minOrder: '₹20', status: 'Active' },
    { id: '3', code: 'NEWUSER', type: 'Fixed Amount', value: '₹5.00', usage: '890/1000', minOrder: '₹0', status: 'Expired' },
];

const AllPromoCodes = () => {
    const [promos, setPromos] = useState(INITIAL_PROMOS);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState(null);

    const filtered = promos.filter(p =>
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const handleSave = (updatedPromo) => {
        setPromos(promos.map(p => p.id === updatedPromo.id ? updatedPromo : p));
        Swal.fire({
            title: 'Updated!',
            text: 'Promo code details have been updated.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
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
        }).then((result) => {
            if (result.isConfirmed) {
                setPromos(promos.filter(p => p.id !== id));
                Swal.fire('Deleted!', 'Promo code has been removed.', 'success');
            }
        });
    };

    return (
        <div className="p-3 p-md-4">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded text-primary d-none d-md-flex">
                            <Ticket size={20} />
                        </div>
                        <h5 className="mb-0 fw-bold text-nowrap">Promo Codes</h5>
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
                            {filtered.length > 0 ? filtered.map((p) => (
                                <tr key={p.id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light p-2 rounded text-primary border shadow-sm">
                                                <Ticket size={20} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark font-monospace h6 mb-0">{p.code}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-secondary small fw-medium">{p.type}</td>
                                    <td className="text-center">
                                        <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1.5 fw-bold">
                                            {p.value}
                                        </Badge>
                                    </td>
                                    <td className="text-center font-monospace small">
                                        <Badge bg="light" text="dark" className="border px-3 py-1.5 shadow-none">
                                            {p.usage}
                                        </Badge>
                                    </td>
                                    <td className="text-center text-secondary small fw-bold">{p.minOrder}</td>
                                    <td className="text-center">
                                        <Badge bg={p.status === 'Active' ? 'success' : p.status === 'Expired' ? 'danger' : 'secondary'} className="rounded-pill fw-normal px-3 py-1.5 shadow-sm">
                                            {p.status}
                                        </Badge>
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
                                                onClick={() => handleDelete(p.id, p.code)}
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
                </Card.Body>
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
