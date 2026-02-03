import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { Save, X, Archive, MapPin, Maximize2 } from 'lucide-react';
import Swal from 'sweetalert2';

const EditWarehouseModal = ({ show, onHide, warehouse, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: '',
        stockLevel: '',
        status: 'Active'
    });

    useEffect(() => {
        if (warehouse) {
            setFormData({
                name: warehouse.name || '',
                location: warehouse.location || '',
                capacity: warehouse.capacity || '',
                stockLevel: warehouse.stockLevel || '',
                status: warehouse.status || 'Active'
            });
        }
    }, [warehouse, show]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...warehouse, ...formData });
        onHide();
        Swal.fire({
            title: 'Success!',
            text: 'Warehouse details updated successfully.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    };

    if (!show) return null;

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="border-0">
            <Modal.Header closeButton className="border-0 bg-light p-4">
                <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
                    <Archive className="text-amber-600" size={24} /> Edit Warehouse Configuration
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    <Row className="g-4">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Warehouse Name</Form.Label>
                                <InputGroup className="border rounded bg-light">
                                    <InputGroup.Text className="bg-transparent border-0"><Archive size={18} /></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="border-0 bg-transparent shadow-none py-2"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Physical Location</Form.Label>
                                <InputGroup className="border rounded bg-light">
                                    <InputGroup.Text className="bg-transparent border-0"><MapPin size={18} /></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        className="border-0 bg-transparent shadow-none py-2"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Total Capacity</Form.Label>
                                <InputGroup className="border rounded bg-light">
                                    <InputGroup.Text className="bg-transparent border-0"><Maximize2 size={18} /></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        name="capacity"
                                        placeholder="e.g. 5,000 sqft"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        required
                                        className="border-0 bg-transparent shadow-none py-2"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">Current Stock Occupancy (%)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="stockLevel"
                                    placeholder="e.g. 75%"
                                    value={formData.stockLevel}
                                    onChange={handleChange}
                                    required
                                    className="py-2 border-light-subtle shadow-none bg-light"
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
                                    <option value="Active">Operational (Active)</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Inactive">Closed (Inactive)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex gap-2 mt-5 pt-2">
                        <Button variant="light" onClick={onHide} className="flex-grow-1 py-2 border shadow-none d-flex align-items-center justify-content-center">
                            <X size={18} className="me-2" /> Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="flex-grow-1 py-2 shadow-sm fw-bold d-flex align-items-center justify-content-center">
                            <Save size={18} className="me-2" /> Update Configuration
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditWarehouseModal;
