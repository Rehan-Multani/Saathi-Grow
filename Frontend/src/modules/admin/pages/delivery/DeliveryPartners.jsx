import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, Plus, Phone, Star, Truck, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import DeliveryPartnerEditModal from '../../components/delivery/DeliveryPartnerEditModal';
import Swal from 'sweetalert2';

const INITIAL_PARTNERS = [
    { id: 'DP-001', name: 'FastTrack Logistics', type: 'Agency', phone: '+1 555-0199', activeDrivers: 12, rating: 4.8, status: 'Active' },
    { id: 'DP-002', name: 'John Doe (Freelancer)', type: 'Individual', phone: '+1 555-0200', activeDrivers: 1, rating: 4.5, status: 'Active' },
    { id: 'DP-003', name: 'City Express', type: 'Agency', phone: '+1 555-0201', activeDrivers: 8, rating: 4.2, status: 'Inactive' },
];

const DeliveryPartners = () => {
    const [partners, setPartners] = useState(INITIAL_PARTNERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);

    const filtered = partners.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Delete Partner?',
            text: `Are you sure you want to remove ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                setPartners(partners.filter(p => p.id !== id));
                Swal.fire('Deleted!', 'Partner has been removed.', 'success');
            }
        });
    };

    const handleEdit = (partner) => {
        setSelectedPartner(partner);
        setShowEditModal(true);
    };

    const handleSave = (updatedPartner) => {
        setPartners(partners.map(p => p.id === updatedPartner.id ? updatedPartner : p));
        Swal.fire({
            title: 'Updated!',
            text: 'Partner details updated successfully.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
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
                                <th className="border-0 py-3">Rating</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((p) => (
                                <tr key={p.id}>
                                    <td className="ps-4 text-start">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light p-2 rounded text-primary">
                                                <Truck size={20} />
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/admin/delivery/partners/${p.id}`}
                                                    className="fw-bold text-dark text-decoration-none hover-primary transition-colors d-block"
                                                >
                                                    {p.name}
                                                </Link>
                                                <div className="small text-muted">{p.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><Badge bg="light" text="dark" className="border fw-normal px-3 py-1 shadow-none">{p.type}</Badge></td>
                                    <td>
                                        <div className="d-flex align-items-center justify-content-center gap-2 text-muted small">
                                            <Phone size={14} /> {p.phone}
                                        </div>
                                    </td>
                                    <td className="fw-medium">{p.activeDrivers} Drivers</td>
                                    <td>
                                        <div className="d-flex align-items-center justify-content-center gap-1 text-warning fw-bold">
                                            <Star size={14} fill="currentColor" /> {p.rating}
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={p.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3 py-1 shadow-sm">
                                            {p.status}
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
                                                onClick={() => handleDelete(p.id, p.name)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted small">
                                        No partners found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
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
