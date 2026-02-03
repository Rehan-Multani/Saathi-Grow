import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, Plus, Image as ImageIcon, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import SliderEditModal from '../../components/offers/SliderEditModal';

const INITIAL_SLIDERS = [
    { id: '1', title: 'Main Hero Slider', location: 'Home Page - Top', slides: 3, status: 'Active', mockImages: ['https://via.placeholder.com/1920x600', 'https://via.placeholder.com/1920x600', 'https://via.placeholder.com/1920x600'] },
    { id: '2', title: 'Seasonal Promotions', location: 'Home Page - Middle', slides: 2, status: 'Active', mockImages: ['https://via.placeholder.com/1920x600', 'https://via.placeholder.com/1920x600'] },
    { id: '3', title: 'Category Highlight', location: 'Category Page', slides: 1, status: 'Inactive', mockImages: ['https://via.placeholder.com/1920x600'] },
];

const Sliders = () => {
    const [sliders, setSliders] = useState(INITIAL_SLIDERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSlider, setSelectedSlider] = useState(null);

    const filtered = sliders.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id, title) => {
        Swal.fire({
            title: 'Delete Slider?',
            text: `Are you sure you want to remove "${title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                setSliders(sliders.filter(s => s.id !== id));
                Swal.fire('Deleted!', 'Slider has been removed.', 'success');
            }
        });
    };

    const handleEdit = (slider) => {
        setSelectedSlider(slider);
        setShowEditModal(true);
    };

    const handleSave = (updatedSlider) => {
        setSliders(sliders.map(s => s.id === updatedSlider.id ? updatedSlider : s));
        Swal.fire({
            title: 'Updated!',
            text: 'Slider details have been updated successfully.',
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
                            <ImageIcon size={20} />
                        </div>
                        <h5 className="mb-0 fw-bold">App Sliders</h5>
                    </div>

                    <div className="d-flex flex-column flex-md-row gap-2 flex-grow-1 justify-content-md-end">
                        <InputGroup className="w-100" style={{ maxWidth: '350px' }}>
                            <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search by name or location..."
                                className="border-start-0 ps-0 shadow-none py-2"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Link to="/admin/sliders/add" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm py-2">
                            <Plus size={18} /> <span>Add New Slider</span>
                        </Link>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                            <tr>
                                <th className="ps-4 border-0 py-3">Slider Name</th>
                                <th className="border-0 py-3">Location</th>
                                <th className="border-0 py-3 text-center">Slides Count</th>
                                <th className="border-0 py-3 text-center">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((s) => (
                                <tr key={s.id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light p-2 rounded text-primary border">
                                                <ImageIcon size={20} />
                                            </div>
                                            <span className="fw-bold text-dark">{s.title}</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary">{s.location}</td>
                                    <td className="text-center">
                                        <Badge bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 fw-medium px-3">
                                            {s.slides} Images
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Badge bg={s.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill fw-normal px-3 py-1 shadow-sm">
                                            {s.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="btn-icon-soft text-primary border d-flex align-items-center gap-2 px-3 shadow-none mt-1"
                                                onClick={() => handleEdit(s)}
                                            >
                                                <Edit size={16} /> <span className="d-none d-sm-inline">Manage/Edit</span>
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="btn-icon-soft text-danger border shadow-none mt-1"
                                                onClick={() => handleDelete(s.id, s.title)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted small">
                                        No sliders found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <SliderEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                slider={selectedSlider}
                onSave={handleSave}
            />
        </div>
    );
};

export default Sliders;
