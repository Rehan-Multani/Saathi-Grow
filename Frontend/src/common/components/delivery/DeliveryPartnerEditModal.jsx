import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Save, User, Phone, Mail, MapPin } from 'lucide-react';

const DeliveryPartnerEditModal = ({ show, onHide, partner, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        vehicleType: 'Bike',
        phone: '',
        authStatus: 'Active'
    });

    useEffect(() => {
        if (partner) {
            setFormData({
                name: partner.name || '',
                vehicleType: partner.vehicleType || 'Bike',
                phone: partner.phone || '',
                authStatus: partner.authStatus || 'Active'
            });
        }
    }, [partner]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name') {
            const cleanedValue = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData(prev => ({ ...prev, [name]: cleanedValue }));
        } else if (name === 'phone') {
            const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: cleanedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...partner, ...formData });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered className="delivery-partner-edit-modal border-0" contentClassName="rounded-3xl border-0 shadow-2xl overflow-hidden">
            <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
                <Modal.Title className="fw-black d-flex align-items-center gap-3 uppercase tracking-tight text-primary">
                    <User className="text-primary" size={28} /> Edit Partner Profile
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4 px-4 pb-4">
                <Form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <Form.Label className="small fw-black text-muted uppercase tracking-widest mb-2 opacity-75">Partner Name / Full Legal Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-light-subtle border-light-subtle py-3 shadow-none rounded-2xl font-black text-sm"
                            placeholder="e.g. Rahul Sharma"
                            required
                        />
                    </div>

                    <Row className="g-4 mb-4">
                        <Col md={6}>
                            <Form.Label className="small fw-black text-muted uppercase tracking-widest mb-2 opacity-75">Vehicle Type</Form.Label>
                            <Form.Select
                                name="vehicleType"
                                value={formData.vehicleType}
                                onChange={handleChange}
                                className="bg-light-subtle border-light-subtle py-3 shadow-none rounded-2xl font-black text-sm cursor-not-allowed opacity-75"
                                disabled
                            >
                                <option value="Bike">Motorcycle</option>
                                <option value="EV">Electric Vehicle</option>
                                <option value="Cycle">Cycle</option>
                            </Form.Select>
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-black text-muted uppercase tracking-widest mb-2 opacity-75">Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                maxLength={10}
                                className="bg-light-subtle border-light-subtle py-3 shadow-none rounded-2xl font-black text-sm"
                                placeholder="10-digit mobile number"
                                required
                            />
                        </Col>
                    </Row>

                    <Col md={12} className="mb-4">
                        <Form.Label className="small fw-black text-muted uppercase tracking-widest mb-2 opacity-75">Authorization Status</Form.Label>
                        <Form.Select
                            name="authStatus"
                            value={formData.authStatus}
                            onChange={handleChange}
                            className="bg-light-subtle border-light-subtle py-3 shadow-none rounded-2xl font-black text-sm cursor-pointer"
                        >
                            <option value="Active">Active / Approved</option>
                            <option value="Suspended">Suspended / Blocked</option>
                            <option value="Unverified">Unverified (Waiting)</option>
                        </Form.Select>
                    </Col>

                    <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-bold uppercase tracking-wider text-xs border-0 bg-gray-100 rounded-xl">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-black d-flex align-items-center gap-2 shadow-lg shadow-blue-500/20 rounded-xl uppercase tracking-wider text-xs border-0">
                            <Save size={18} /> Update Data
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default DeliveryPartnerEditModal;
