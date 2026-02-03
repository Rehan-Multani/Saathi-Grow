import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddDeliveryPartner = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        type: 'Agency',
        email: '',
        phone: '',
        area: '',
        license: '',
        status: 'Active'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4">
                <h4 className="fw-bold mb-0 text-nowrap">Register Delivery Partner</h4>
                <div className="d-flex justify-content-end flex-grow-1 w-100 w-sm-auto">
                    <Button variant="light" onClick={() => navigate('/admin/delivery/partners')} className="d-flex align-items-center gap-2 shadow-sm justify-content-center">
                        <X size={18} /> Cancel
                    </Button>
                </div>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Partner Information</h6>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Partner Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. FastTrack Logistics"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Type</Form.Label>
                                        <Form.Select name="type" value={formData.type} onChange={handleChange}>
                                            <option value="Agency">Agency</option>
                                            <option value="Freelancer">Freelancer</option>
                                            <option value="Internal">Internal Fleet</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Official Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="contact@logistics.com"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Phone Number</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            placeholder="+1 555 0000"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Service Area / Zone</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. New York Metro Area"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>License / Registration ID</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. LOG-2023-NY-001"
                                    name="license"
                                    value={formData.license}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Status</Form.Label>
                                <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Pending Approval">Pending Approval</option>
                                </Form.Select>
                            </Form.Group>

                            <Button variant="primary" className="w-100 d-flex align-items-center justify-content-center gap-2 py-2">
                                <Save size={18} /> Register Partner
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddDeliveryPartner;
