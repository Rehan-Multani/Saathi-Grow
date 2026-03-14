import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import { Save, X, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPromoCode } from '../../api/promoCodeApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const CreatePromoCode = () => {
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'Percentage',
        discountValue: '',
        minOrderValue: '0',
        maxDiscountAmount: '0',
        usageLimitTotal: '0',
        usageLimitPerUser: '1',
        validFrom: '',
        validUntil: '',
        status: 'Active',
        isActive: true,
        description: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const generateCode = () => {
        const randomCode = 'SG' + Math.floor(1000 + Math.random() * 9000);
        setFormData({ ...formData, code: randomCode });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!adminUser?.token) return;

        try {
            setLoading(true);

            // Validation logic
            if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
                toast.error('Start date must be before expiry date');
                setLoading(false);
                return;
            }

            if (parseFloat(formData.discountValue) < 0 || parseFloat(formData.minOrderValue) < 0) {
                toast.error('Discount and order values cannot be negative');
                setLoading(false);
                return;
            }

            const dataToSave = {
                ...formData,
                discountValue: formData.discountType === 'FreeShipping' ? 0 : parseFloat(formData.discountValue || 0),
                minOrderValue: parseFloat(formData.minOrderValue || 0),
                maxDiscountAmount: parseFloat(formData.maxDiscountAmount || 0),
                usageLimitTotal: parseInt(formData.usageLimitTotal || 0),
                usageLimitPerUser: parseInt(formData.usageLimitPerUser || 1),
                isActive: formData.status === 'Active'
            };

            await createPromoCode(adminUser.token, dataToSave);
            toast.success('Promo code created successfully!');
            navigate('/admin/promocodes');
        } catch (error) {
            toast.error(error.message || 'Failed to create promo code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-3">
            <Form onSubmit={handleSubmit}>
                <Row className="g-0">
                    <Col xs={12}>
                        <Card className="border-0 shadow-sm overflow-hidden mb-4">
                            <Card.Header className="bg-gradient-to-r from-blue-50 to-white py-4 px-4 border-b border-gray-100 d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-0 fw-black text-gray-900 uppercase tracking-tight">Create New Promo Code</h6>
                                    <p className="text-gray-400 text-[10px] fw-bold uppercase tracking-widest mt-1 opacity-60">Generate and Configure Discount Assets</p>
                                </div>
                                <Button variant="light" onClick={() => navigate('/admin/promocodes')} className="d-flex align-items-center gap-2 shadow-sm px-4 fw-bold">
                                    <X size={18} /> Cancel
                                </Button>
                            </Card.Header>
                            <Card.Body className="p-4 p-md-5">
                                <h6 className="fw-bold mb-4 flex items-center gap-2 text-primary">
                                    <Ticket size={20} /> Code Configuration
                                </h6>
                                <Form.Group className="mb-3">
                                    <Form.Label>Promo Code</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><Ticket size={18} /></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. SUMMER20"
                                            name="code"
                                            required
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
                                            <Form.Select name="discountType" value={formData.discountType} onChange={handleChange}>
                                                <option value="Percentage">Percentage (%)</option>
                                                <option value="Fixed">Fixed Amount (₹)</option>
                                                <option value="FreeShipping">Free Shipping</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Discount Value</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="e.g. 10"
                                                name="discountValue"
                                                required={formData.discountType !== 'FreeShipping'}
                                                value={formData.discountValue}
                                                onChange={handleChange}
                                                disabled={formData.discountType === 'FreeShipping'}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Min Order Value (₹)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0.00"
                                                name="minOrderValue"
                                                value={formData.minOrderValue}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Max Discount Amount (₹)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0.00 (0 for no limit)"
                                                name="maxDiscountAmount"
                                                disabled={formData.discountType === 'Fixed' || formData.discountType === 'FreeShipping'}
                                                value={formData.maxDiscountAmount}
                                                onChange={handleChange}
                                            />
                                            <Form.Text className="text-muted small">Only for Percentage discounts</Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Total Usage Limit</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0 for unlimited"
                                                name="usageLimitTotal"
                                                value={formData.usageLimitTotal}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Usage Limit Per User</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Default 1"
                                                name="usageLimitPerUser"
                                                value={formData.usageLimitPerUser}
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
                                                required
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
                                                required
                                                value={formData.validUntil}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Brief details about this offer..."
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </Form.Select>
                                </Form.Group>

                                <Button 
                                    type="submit"
                                    variant="primary" 
                                    className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold"
                                    disabled={loading}
                                >
                                    {loading ? <Spinner size="sm" /> : <Save size={18} />} 
                                    {loading ? 'Saving...' : 'Save Promo Code'}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default CreatePromoCode;
