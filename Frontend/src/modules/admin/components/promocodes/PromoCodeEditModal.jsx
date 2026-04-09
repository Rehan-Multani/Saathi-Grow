import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { Save, Ticket } from 'lucide-react';
import { toast } from 'react-toastify';

const PromoCodeEditModal = ({ show, onHide, promoCode, onSave }) => {
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'Percentage',
        discountValue: '',
        minOrderValue: '',
        maxDiscountAmount: '',
        usageLimitTotal: '',
        usageLimitPerUser: '',
        isActive: true,
        validFrom: '',
        validUntil: '',
        description: ''
    });

    useEffect(() => {
        if (promoCode) {
            setFormData({
                _id: promoCode._id,
                code: promoCode.code || '',
                discountType: promoCode.discountType || 'Percentage',
                discountValue: promoCode.discountValue || '',
                minOrderValue: promoCode.minOrderValue || '0',
                maxDiscountAmount: promoCode.maxDiscountAmount || '0',
                usageLimitTotal: promoCode.usageLimitTotal || '0',
                usageLimitPerUser: promoCode.usageLimitPerUser || '1',
                isActive: promoCode.isActive ?? true,
                validFrom: promoCode.validFrom ? new Date(promoCode.validFrom).toISOString().split('T')[0] : '',
                validUntil: promoCode.validUntil ? new Date(promoCode.validUntil).toISOString().split('T')[0] : '',
                description: promoCode.description || ''
            });
        }
    }, [promoCode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? (name === 'isActive' ? checked : value) : value 
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (parseFloat(formData.discountValue) < 0 || parseFloat(formData.minOrderValue) < 0) {
            toast.error('Discount and order values cannot be negative');
            return;
        }

        onSave({
            ...formData,
            discountValue: formData.discountType === 'FreeShipping' ? 0 : parseFloat(formData.discountValue),
            minOrderValue: parseFloat(formData.minOrderValue),
            maxDiscountAmount: parseFloat(formData.maxDiscountAmount),
            usageLimitTotal: parseInt(formData.usageLimitTotal),
            usageLimitPerUser: parseInt(formData.usageLimitPerUser)
        });
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
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
                                    name="discountType"
                                    value={formData.discountType}
                                    onChange={handleChange}
                                    className="py-2 border-gray-200 shadow-none"
                                >
                                    <option value="Percentage">Percentage (%)</option>
                                    <option value="Fixed">Fixed Amount (₹)</option>
                                    <option value="FreeShipping">Free Shipping</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted text-uppercase">Discount Value</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="discountValue"
                                    value={formData.discountValue}
                                    onChange={handleChange}
                                    disabled={formData.discountType === 'FreeShipping'}
                                    className="py-2 border-gray-200 shadow-none"
                                    required={formData.discountType !== 'FreeShipping'}
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
                                    name="minOrderValue"
                                    value={formData.minOrderValue}
                                    onFocus={(e) => { if (formData.minOrderValue === 0 || formData.minOrderValue === "0") setFormData(prev => ({ ...prev, minOrderValue: "" })) }}
                                    onBlur={(e) => { if (formData.minOrderValue === "" || formData.minOrderValue === null) setFormData(prev => ({ ...prev, minOrderValue: "0" })) }}
                                    onChange={handleChange}
                                    className="py-2 border-gray-200 shadow-none"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted text-uppercase">Max Discount (₹)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="maxDiscountAmount"
                                    value={formData.maxDiscountAmount}
                                    disabled={formData.discountType !== 'Percentage'}
                                    onFocus={(e) => { if (formData.maxDiscountAmount === 0 || formData.maxDiscountAmount === "0") setFormData(prev => ({ ...prev, maxDiscountAmount: "" })) }}
                                    onBlur={(e) => { if (formData.maxDiscountAmount === "" || formData.maxDiscountAmount === null) setFormData(prev => ({ ...prev, maxDiscountAmount: "0" })) }}
                                    onChange={handleChange}
                                    className="py-2 border-gray-200 shadow-none"
                                />
                                <Form.Text className="text-muted small">Only for % discounts</Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted text-uppercase">Total Usage Limit</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="usageLimitTotal"
                                    value={formData.usageLimitTotal}
                                    onFocus={(e) => { if (formData.usageLimitTotal === 0 || formData.usageLimitTotal === "0") setFormData(prev => ({ ...prev, usageLimitTotal: "" })) }}
                                    onBlur={(e) => { if (formData.usageLimitTotal === "" || formData.usageLimitTotal === null) setFormData(prev => ({ ...prev, usageLimitTotal: "0" })) }}
                                    onChange={handleChange}
                                    className="py-2 border-gray-200 shadow-none"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted text-uppercase">Limit Per User</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="usageLimitPerUser"
                                    value={formData.usageLimitPerUser}
                                    onChange={handleChange}
                                    className="py-2 border-gray-200 shadow-none"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted text-uppercase">Valid From</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="validFrom"
                                    value={formData.validFrom}
                                    onChange={handleChange}
                                    className="py-2 border-gray-200 shadow-none"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted text-uppercase">Valid Until</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="validUntil"
                                    value={formData.validUntil}
                                    onChange={handleChange}
                                    className="py-2 border-gray-200 shadow-none"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3 d-flex align-items-center gap-3 bg-light p-3 rounded-3 border">
                                <Form.Label className="small fw-bold text-muted text-uppercase mb-0">Code Status</Form.Label>
                                <Form.Check 
                                    type="switch"
                                    id="promo-active-switch"
                                    label={formData.isActive ? "Active" : "Inactive"}
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="fw-bold text-primary"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Description</Form.Label>
                        <Form.Control 
                            as="textarea"
                            rows={2}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="py-2 border-gray-200 shadow-none"
                        />
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
