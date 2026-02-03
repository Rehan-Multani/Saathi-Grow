import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Save, User, Phone, Mail, MapPin } from 'lucide-react';

const DeliveryPartnerEditModal = ({ show, onHide, partner, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'Agency',
        phone: '',
        status: 'Active',
        rating: 0
    });

    useEffect(() => {
        if (partner) {
            setFormData({
                name: partner.name || '',
                type: partner.type || 'Agency',
                phone: partner.phone || '',
                status: partner.status || 'Active',
                rating: partner.rating || 0
            });
        }
    }, [partner]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...partner, ...formData });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered className="delivery-partner-edit-modal">
            <Modal.Header closeButton className="border-0 pb-0 px-4">
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <User className="text-primary" size={24} /> Edit Delivery Partner
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4 px-4">
                <Form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <Form.Label className="small fw-bold text-muted uppercase">Partner Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-light border-0 py-2 shadow-none"
                            placeholder="e.g. FastTrack Logistics"
                            required
                        />
                    </div>

                    <Row className="g-3 mb-3">
                        <Col md={6}>
                            <Form.Label className="small fw-bold text-muted uppercase">Partner Type</Form.Label>
                            <Form.Select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="bg-light border-0 py-2 shadow-none"
                            >
                                <option value="Agency">Agency</option>
                                <option value="Individual">Individual</option>
                            </Form.Select>
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-bold text-muted uppercase">Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="bg-light border-0 py-2 shadow-none"
                                placeholder="+1 555-0000"
                                required
                            />
                        </Col>
                    </Row>

                    <Row className="g-3 mb-3">
                        <Col md={6}>
                            <Form.Label className="small fw-bold text-muted uppercase">Status</Form.Label>
                            <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="bg-light border-0 py-2 shadow-none"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </Form.Select>
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-bold text-muted uppercase">Avg Rating</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                name="rating"
                                value={formData.rating}
                                onChange={handleChange}
                                className="bg-light border-0 py-2 shadow-none"
                            />
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-medium border shadow-none">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-medium d-flex align-items-center gap-2 shadow-sm">
                            <Save size={18} /> Save Changes
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default DeliveryPartnerEditModal;
