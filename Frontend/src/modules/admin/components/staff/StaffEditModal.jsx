import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Save } from 'lucide-react';

const StaffEditModal = ({ show, onHide, staff, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        email: '',
        phone: '',
        status: 'Active'
    });

    useEffect(() => {
        if (staff) {
            setFormData({
                name: staff.name || '',
                role: staff.role || '',
                email: staff.email || '',
                phone: staff.phone || '',
                status: staff.status || 'Active'
            });
        }
    }, [staff]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...staff, ...formData });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered className="staff-edit-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">Edit Staff Member</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4">
                <Form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <Form.Label className="small fw-medium text-muted">Full Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-light border-0 py-2"
                            placeholder="Enter full name"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <Form.Label className="small fw-medium text-muted">Job Role</Form.Label>
                        <Form.Control
                            type="text"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="bg-light border-0 py-2"
                            placeholder="e.g. Store Manager"
                            required
                        />
                    </div>

                    <Row className="g-3 mb-3">
                        <Col md={6}>
                            <Form.Label className="small fw-medium text-muted">Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="bg-light border-0 py-2"
                                placeholder="name@sathigro.com"
                                required
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Label className="small fw-medium text-muted">Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="bg-light border-0 py-2"
                                placeholder="+1 555-0000"
                            />
                        </Col>
                    </Row>

                    <div className="mb-3">
                        <Form.Label className="small fw-medium text-muted">Status</Form.Label>
                        <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="bg-light border-0 py-2 shadow-none"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </Form.Select>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-medium">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-medium d-flex align-items-center gap-2">
                            <Save size={18} /> Update Staff
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default StaffEditModal;
