import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddWarehouse = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: '',
        supervisor: '',
        status: 'Active'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Add New Warehouse</h4>
                <Button variant="light" onClick={() => navigate('/admin/locations/warehouses')}>
                    <X size={18} className="me-2" /> Cancel
                </Button>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Warehouse Details</h6>
                            <Form.Group className="mb-3">
                                <Form.Label>Warehouse Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. Central Distribution Center"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Capacity (sqft)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. 10,000"
                                            name="capacity"
                                            value={formData.capacity}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Supervisor Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. Mike Tyson"
                                            name="supervisor"
                                            value={formData.supervisor}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Location / Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Industrial Park, Zone A..."
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Status</Form.Label>
                                <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="Active">Active</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Full">Full Capacity</option>
                                </Form.Select>
                            </Form.Group>

                            <Button variant="primary" className="w-100 d-flex align-items-center justify-content-center gap-2 py-2">
                                <Save size={18} /> Save Warehouse
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddWarehouse;
