import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Row, Col } from 'react-bootstrap';
import { Search, Plus, Tag, Calendar, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import EditOfferModal from '../../components/offers/EditOfferModal';
import Swal from 'sweetalert2';

const INITIAL_OFFERS = [
    { id: 'OFF-001', title: 'Summer Sale', discount: '20% OFF', code: 'SUMMER20', validUntil: '2023-08-31', status: 'Active' },
    { id: 'OFF-002', title: 'Welcome Bonus', discount: '₹10 Flat', code: 'WELCOME10', validUntil: 'N/A', status: 'Active' },
    { id: 'OFF-003', title: 'Flash Deal', discount: '50% OFF', code: 'FLASH50', validUntil: '2023-01-01', status: 'Expired' },
];

const Offers = () => {
    const [offers, setOffers] = useState(INITIAL_OFFERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);

    const filtered = offers.filter(o =>
        o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (offer) => {
        setSelectedOffer(offer);
        setShowEditModal(true);
    };

    const handleSaveOffer = (updatedOffer) => {
        setOffers(offers.map(o => o.id === updatedOffer.id ? updatedOffer : o));
    };

    const handleDelete = (id, title) => {
        Swal.fire({
            title: 'Delete Offer?',
            text: `Are you sure you want to delete "${title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                setOffers(offers.filter(o => o.id !== id));
                Swal.fire('Deleted!', 'Offer has been removed.', 'success');
            }
        });
    };

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 gap-lg-4 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-danger bg-opacity-10 p-3 rounded-3 text-danger d-none d-md-flex">
                        <Tag size={24} />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1 text-dark">Special Offers</h4>
                        <p className="text-muted small mb-0 d-none d-sm-block">Promo codes and seasonal discount campaigns.</p>
                    </div>
                </div>

                <div className="d-flex flex-column flex-md-row gap-2 w-100 w-lg-auto align-items-stretch">
                    <InputGroup className="shadow-sm flex-grow-1" style={{ minWidth: 'min(100%, 250px)' }}>
                        <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
                        <Form.Control
                            placeholder="Search offer or code..."
                            className="border-start-0 ps-0 shadow-none py-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                    <Link to="/admin/offers/create" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm py-2 text-nowrap">
                        <Plus size={18} /> <span className="fw-bold">Create Offer</span>
                    </Link>
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden mt-2">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                            <tr>
                                <th className="ps-4 border-0 py-3">Offer Details</th>
                                <th className="border-0 py-3 text-center">Discount</th>
                                <th className="border-0 py-3 text-center">Promo Code</th>
                                <th className="border-0 py-3 text-center">Validity</th>
                                <th className="border-0 py-3 text-center">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((o) => (
                                <tr key={o.id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-danger bg-opacity-10 p-2 rounded text-danger">
                                                <Tag size={20} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{o.title}</div>
                                                <div className="small text-muted">{o.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="fw-bold text-success text-center">{o.discount}</td>
                                    <td className="text-center">
                                        <span className="font-monospace bg-light border px-2 py-1 rounded small fw-bold text-primary">
                                            {o.code}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex align-items-center justify-content-center gap-1 text-muted small">
                                            <Calendar size={14} /> {o.validUntil}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <Badge
                                            bg={o.status === 'Active' ? 'success' : o.status === 'Expired' ? 'secondary' : 'info'}
                                            className="rounded-pill fw-normal px-3 py-1 shadow-sm"
                                        >
                                            {o.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="btn-icon-soft text-warning border shadow-none"
                                                onClick={() => handleEdit(o)}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="btn-icon-soft text-danger border shadow-none"
                                                onClick={() => handleDelete(o.id, o.title)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted small">
                                        No active offers found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <EditOfferModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                offer={selectedOffer}
                onSave={handleSaveOffer}
            />
        </div>
    );
};

export default Offers;
