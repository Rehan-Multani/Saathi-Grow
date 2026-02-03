import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { Save, Ticket } from 'lucide-react';

const PromoCodeEditModal = ({ show, onHide, promoCode, onSave }) => {
    const [formData, setFormData] = useState({
        code: '',
        type: 'Percentage',
        value: '',
        minOrder: '',
        usageLimit: '',
        status: 'Active'
    });

    useEffect(() => {
        if (promoCode) {
            setFormData({
                code: promoCode.code || '',
                type: promoCode.type || 'Percentage',
                value: promoCode.value?.replace(/[^0-9.]/g, '') || '',
                minOrder: promoCode.minOrder?.replace(/[^0-9.]/g, '') || '',
                usageLimit: promoCode.usage?.split('/')[1] || '',
                status: promoCode.status || 'Active'
            });
        }
    }, [promoCode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Format the values back for the list display
        const displayValue = formData.type === 'Percentage' ? `${formData.value}%` :
            formData.type === 'Fixed' ? `₹${formData.value}` : 'N/A';

        const displayMinOrder = `₹${formData.minOrder || '0'}`;
        const currentUsage = promoCode?.usage?.split('/')[0] || '0';
        const displayUsage = `${currentUsage}/${formData.usageLimit || '∞'}`;

        onSave({
            ...promoCode,
            ...formData,
            value: displayValue,
            minOrder: displayMinOrder,
            usage: displayUsage
        });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold text-dark">Edit Promo Code</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4 px-4">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Promo Code</Form.Label>
                        <InputGroup>
                            <InputGroup.Text className="bg-light border-gray-200"><Ticket size={18} /></InputGroup.Text>
                            <Form.Control
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className="font-monospace text-uppercase py-2 border-gray-200 shadow-none"
                                required
                            />
                        </InputGroup>
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted text-uppercase">Discount Type</Form.Label>
                                <Form.Select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="py-2 border-gray-200 shadow-none"
                                >
                                    <option value="Percentage">Percentage (%)</option>
                                    <option value="Fixed">Fixed Amount (₹)</option>
                                    <option value="Free Shipping">Free Shipping</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted text-uppercase">Discount Value</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleChange}
                                    disabled={formData.type === 'Free Shipping'}
                                    className="py-2 border-gray-200 shadow-none"
                                    required={formData.type !== 'Free Shipping'}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted text-uppercase">Min Order (₹)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="minOrder"
                                    value={formData.minOrder}
                                    onChange={handleChange}
                                    className="py-2 border-gray-200 shadow-none"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted text-uppercase">Usage Limit</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="usageLimit"
                                    value={formData.usageLimit}
                                    onChange={handleChange}
                                    className="py-2 border-gray-200 shadow-none"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Status</Form.Label>
                        <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="py-2 border-gray-200 shadow-none"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Expired">Expired</option>
                        </Form.Select>
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 border text-muted fw-bold">
                            Discard
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 d-flex align-items-center gap-2 fw-bold shadow-sm">
                            <Save size={18} /> Update Code
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default PromoCodeEditModal;
