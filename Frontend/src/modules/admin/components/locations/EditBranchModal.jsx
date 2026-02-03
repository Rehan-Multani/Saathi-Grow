import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { Save, X } from 'lucide-react';
import Swal from 'sweetalert2';

const EditBranchModal = ({ show, onHide, branch, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        manager: '',
        status: 'Active'
    });

    useEffect(() => {
        if (branch) {
            setFormData({
                name: branch.name || '',
                address: branch.address || '',
                phone: branch.phone || '',
                manager: branch.manager || '',
                status: branch.status || 'Active'
            });
        }
    }, [branch, show]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...branch, ...formData });
        onHide();
        Swal.fire({
            title: 'Updated!',
            text: 'Branch details have been updated.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    };

    if (!show) return null;

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="border-0">
            <Modal.Header closeButton className="border-0 bg-light p-4">
                <Modal.Title className="fw-bold fs-5">Edit Branch Details</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Branch Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="py-2 border-light-subtle shadow-none bg-light"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Manager Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="manager"
                                    value={formData.manager}
                                    onChange={handleChange}
                                    required
                                    className="py-2 border-light-subtle shadow-none bg-light"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Contact Number</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="py-2 border-light-subtle shadow-none bg-light"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Full Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="border-light-subtle shadow-none bg-light"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Operational Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="py-2 border-light-subtle shadow-none bg-light"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Under Renovation">Under Renovation</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex gap-2 mt-4 pt-2">
                        <Button variant="light" onClick={onHide} className="flex-grow-1 py-2 border shadow-none d-flex align-items-center justify-content-center">
                            <X size={18} className="me-2" /> Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="flex-grow-1 py-2 shadow-sm fw-bold d-flex align-items-center justify-content-center">
                            <Save size={18} className="me-2" /> Save Changes
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditBranchModal;
