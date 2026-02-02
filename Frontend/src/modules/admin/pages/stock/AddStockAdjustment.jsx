import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { Save, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddStockAdjustment = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        product: '',
        type: 'Addition', // Addition, Deduction
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        reason: '',
        notes: ''
    });

    const PRODUCTS = [
        { id: '1', name: 'Wireless Mouse' },
        { id: '2', name: 'Keyboard' },
        { id: '3', name: 'USB Cable' },
        { id: '4', name: 'Monitor 24"' },
        { id: '5', name: 'Headphones' },
    ];

    const REASONS = [
        'New Stock Arrival',
        'Damaged Goods',
        'Inventory Correction',
        'Return',
        'Theft/Loss',
        'Other'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would normally submit the form data to the backend
        console.log('Adjustment Submitted:', formData);
        navigate('/admin/stock/adjustments');
    };

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2">
                    <Button variant="light" size="sm" onClick={() => navigate('/admin/stock/adjustments')} className="rounded-circle p-2">
                        <ArrowLeft size={18} />
                    </Button>
                    <h4 className="fw-bold mb-0">New Stock Adjustment</h4>
                </div>
                <Button variant="light" onClick={() => navigate('/admin/stock/adjustments')}>
                    <X size={18} className="me-2" /> Cancel
                </Button>
            </div>

            <Row>
                <Col lg={8} className="mx-auto">
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmit}>
                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Select Product <span className="text-danger">*</span></Form.Label>
                                            <Form.Select name="product" value={formData.product} onChange={handleChange} required>
                                                <option value="">Choose Product...</option>
                                                {PRODUCTS.map(p => (
                                                    <option key={p.id} value={p.name}>{p.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Adjustment Type <span className="text-danger">*</span></Form.Label>
                                            <Form.Select name="type" value={formData.type} onChange={handleChange}>
                                                <option value="Addition">Addition (+)</option>
                                                <option value="Deduction">Deduction (-)</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Quantity <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                placeholder="Enter quantity"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Reason <span className="text-danger">*</span></Form.Label>
                                            <Form.Select name="reason" value={formData.reason} onChange={handleChange} required>
                                                <option value="">Select Reason...</option>
                                                {REASONS.map((r, idx) => (
                                                    <option key={idx} value={r}>{r}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Date <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label>Notes (Optional)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Add any additional details here..."
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <div className="d-flex justify-content-end gap-2">
                                    <Button variant="light" size="lg" onClick={() => navigate('/admin/stock/adjustments')}>Cancel</Button>
                                    <Button variant="primary" size="lg" type="submit" className="d-flex align-items-center gap-2 px-4">
                                        <Save size={18} /> Save Adjustment
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddStockAdjustment;
