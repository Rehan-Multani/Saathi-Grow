import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { Save, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createBranch } from '../../api/branchApi';
import { getAllStaff } from '../../api/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const AddBranch = () => {
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        phone: '',
        email: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createBranch(adminUser.token, formData);
            toast.success('Branch created successfully');
            navigate('/admin/locations/branches');
        } catch (error) {
            toast.error(error.message || 'Failed to create branch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle p-2 shadow-sm border"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <h4 className="fw-bold mb-0 text-nowrap">Add New Branch</h4>
                </div>
                <div className="d-flex justify-content-end flex-grow-1 w-100 w-sm-auto">
                    <Button variant="light" onClick={() => navigate('/admin/locations/branches')} className="d-flex align-items-center gap-2 shadow-sm px-4">
                        <X size={18} /> Cancel
                    </Button>
                </div>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmit}>
                                <h6 className="fw-bold mb-4 text-primary">Branch Information</h6>
                                <Row>
                                    <Col md={8}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Branch Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. Main Store - Downtown"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="py-2 shadow-none border-light-subtle bg-light-subtle"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Branch Code</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="BNH001"
                                                name="code"
                                                value={formData.code}
                                                onChange={handleChange}
                                                required
                                                className="py-2 shadow-none border-light-subtle bg-light-subtle text-uppercase"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Branch Phone</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                placeholder="+91 00000 00000"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="py-2 shadow-none border-light-subtle bg-light-subtle"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">Branch Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="branch@sathigro.com"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="py-2 shadow-none border-light-subtle bg-light-subtle"
                                    />
                                </Form.Group>

                                <h6 className="fw-bold mb-3 mt-4 text-primary">Location Details</h6>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Street Address</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address.street"
                                                value={formData.address.street}
                                                onChange={handleChange}
                                                placeholder="123 Market St"
                                                className="py-2 shadow-none border-light-subtle bg-light-subtle"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">City</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address.city"
                                                value={formData.address.city}
                                                onChange={handleChange}
                                                placeholder="City"
                                                className="py-2 shadow-none border-light-subtle bg-light-subtle"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">State</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address.state"
                                                value={formData.address.state}
                                                onChange={handleChange}
                                                placeholder="State"
                                                className="py-2 shadow-none border-light-subtle bg-light-subtle"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Zip Code</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address.zipCode"
                                                value={formData.address.zipCode}
                                                onChange={handleChange}
                                                placeholder="000000"
                                                className="py-2 shadow-none border-light-subtle bg-light-subtle"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button type="submit" variant="primary" className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold shadow-sm mt-4" disabled={loading}>
                                    {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} />} Save Branch Details
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddBranch;
