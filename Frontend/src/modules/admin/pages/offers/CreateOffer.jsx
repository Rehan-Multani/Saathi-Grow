import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Image } from 'react-bootstrap';
import { Save, X, Percent, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateOffer = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        code: '',
        discountAmount: '',
        discountType: 'Percentage',
        minPurchase: '',
        validFrom: '',
        validUntil: '',
        status: 'Active'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Create Special Offer</h4>
                <Button variant="light" onClick={() => navigate('/admin/offers')}>
                    <X size={18} className="me-2" /> Cancel
                </Button>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Offer Details</h6>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Offer Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. Summer Sale"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Promo Code (Optional)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. SUMMER20"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Discount Type</Form.Label>
                                        <Form.Select name="discountType" value={formData.discountType} onChange={handleChange}>
                                            <option value="Percentage">Percentage (%)</option>
                                            <option value="Fixed">Fixed Amount (₹)</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Discount Value</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="e.g. 20"
                                            name="discountAmount"
                                            value={formData.discountAmount}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Minimum Purchase Amount (Optional)</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="0.00"
                                    name="minPurchase"
                                    value={formData.minPurchase}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <h6 className="fw-bold mt-4 mb-3">Validity Period</h6>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Valid From</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="validFrom"
                                            value={formData.validFrom}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Valid Until</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="validUntil"
                                            value={formData.validUntil}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4">
                                <Form.Label>Status</Form.Label>
                                <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Expired">Expired</option>
                                </Form.Select>
                            </Form.Group>

                            <Button variant="primary" className="w-100 d-flex align-items-center justify-content-center gap-2 py-2">
                                <Save size={18} /> Create Offer
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CreateOffer;
