import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Save, Store, User, Phone, Mail, MapPin } from 'lucide-react';

const VendorEditModal = ({ show, onHide, vendor, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        owner: '',
        email: '',
        phone: '',
        address: '',
        status: 'Active'
    });

    useEffect(() => {
        if (vendor) {
            setFormData({
                name: vendor.name || '',
                owner: vendor.owner || '',
                email: vendor.email || '',
                phone: vendor.phone || '',
                address: vendor.address || '',
                status: vendor.status || 'Active'
            });
        }
    }, [vendor]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...vendor, ...formData });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="vendor-edit-modal">
            <Modal.Header closeButton className="border-0 pb-0 px-4">
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <Store className="text-primary" size={24} /> Edit Vendor Profile
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4 px-4">
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3 mb-3">
                        <Col md={6}>
                            <Form.Label className="small fw-bold text-muted uppercase">Store Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="bg-light border-0 py-2 shadow-none"
                                required
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-bold text-muted uppercase">Owner Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="owner"
                                value={formData.owner}
                                onChange={handleChange}
                                className="bg-light border-0 py-2 shadow-none"
                                required
                            />
                        </Col>
                    </Row>

                    <Row className="g-3 mb-3">
                        <Col md={6}>
                            <Form.Label className="small fw-bold text-muted uppercase">Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="bg-light border-0 py-2 shadow-none"
                                required
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-bold text-muted uppercase">Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="bg-light border-0 py-2 shadow-none"
                                required
                            />
                        </Col>
                    </Row>

                    <Row className="g-3 mb-3">
                        <Col md={12}>
                            <Form.Label className="small fw-bold text-muted uppercase">Store Address</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="bg-light border-0 shadow-none"
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
                                <option value="Pending">Pending</option>
                                <option value="Blocked">Blocked</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-medium border shadow-none">
                            Discard
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-medium d-flex align-items-center gap-2 shadow-sm">
                            <Save size={18} /> Update Vendor
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default VendorEditModal;
