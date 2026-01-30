import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { Save, X, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreatePromoCode = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        code: '',
        type: 'Percentage',
        value: '',
        minOrder: '',
        maxDiscount: '',
        usageLimit: '',
        validFrom: '',
        validUntil: '',
        status: 'Active'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateCode = () => {
        const randomCode = 'PROMO' + Math.floor(1000 + Math.random() * 9000);
        setFormData({ ...formData, code: randomCode });
    };

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Create New Promo Code</h4>
                <Button variant="light" onClick={() => navigate('/admin/promocodes')}>
                    <X size={18} className="me-2" /> Cancel
                </Button>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Code Configuration</h6>
                            <Form.Group className="mb-3">
                                <Form.Label>Promo Code</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><Ticket size={18} /></InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. SUMMER20"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className="font-monospace text-uppercase"
                                    />
                                    <Button variant="outline-secondary" onClick={generateCode}>Generate</Button>
                                </InputGroup>
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Discount Type</Form.Label>
                                        <Form.Select name="type" value={formData.type} onChange={handleChange}>
                                            <option value="Percentage">Percentage (%)</option>
                                            <option value="Fixed">Fixed Amount ($)</option>
                                            <option value="Free Shipping">Free Shipping</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Discount Value</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="e.g. 10"
                                            name="value"
                                            value={formData.value}
                                            onChange={handleChange}
                                            disabled={formData.type === 'Free Shipping'}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Min Order Value</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0.00"
                                            name="minOrder"
                                            value={formData.minOrder}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Total Usage Limit</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="e.g. 100"
                                            name="usageLimit"
                                            value={formData.usageLimit}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

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
                                </Form.Select>
                            </Form.Group>

                            <Button variant="primary" className="w-100 d-flex align-items-center justify-content-center gap-2 py-2">
                                <Save size={18} /> Save Promo Code
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CreatePromoCode;
