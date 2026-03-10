import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { Save, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createBranch } from '../../api/branchApi';
import { getAllStaff } from '../../api/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import GoogleMapsInput from '../../components/common/GoogleMapsInput';

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
            zipCode: '',
            location: {
                type: 'Point',
                coordinates: [0, 0]
            }
        }
    });

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `.pac-container { z-index: 10000 !important; }`;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

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

    const handleLocationSelect = (locData) => {
        setFormData(prev => ({
            ...prev,
            address: {
                street: locData.street || locData.fullAddress,
                city: locData.city,
                state: locData.state,
                zipCode: locData.zipCode,
                location: {
                    type: 'Point',
                    coordinates: [locData.lng, locData.lat]
                }
            }
        }));
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
        <Form onSubmit={handleSubmit}>
            <Row className="g-0">
                <Col xs={12}>
                    <Card className="border-0 shadow-sm overflow-hidden mb-4">
                        <Card.Header className="bg-gradient-to-r from-blue-50 to-white py-4 px-4 border-b border-gray-100 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-3">
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="rounded-circle p-2 shadow-sm border bg-white hover:bg-gray-50 transition-colors"
                                    onClick={() => navigate(-1)}
                                >
                                    <ArrowLeft size={16} />
                                </Button>
                                <div>
                                    <h6 className="mb-0 fw-black text-gray-900 uppercase tracking-tight">Add New Branch</h6>
                                    <p className="text-gray-400 text-[10px] fw-bold uppercase tracking-widest mt-1 opacity-60">Register and Configure Retail Locations</p>
                                </div>
                            </div>
                            <Button variant="light" onClick={() => navigate('/admin/locations/branches')} className="d-flex align-items-center gap-2 shadow-sm px-4 fw-bold">
                                <X size={18} /> Cancel
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-4 p-md-5">
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
                                        <Form.Label className="small fw-bold">Street Address (Search on Map)</Form.Label>
                                        <GoogleMapsInput
                                            onLocationSelect={handleLocationSelect}
                                            placeholder="Search for branch location..."
                                        />
                                        <div className="mt-2">
                                            <Form.Control
                                                type="text"
                                                name="address.street"
                                                value={formData.address.street}
                                                onChange={handleChange}
                                                placeholder="123 Market St"
                                                className="py-2 shadow-none border-light-subtle bg-light-subtle"
                                            />
                                        </div>
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

                            <div className="d-flex justify-content-center mt-4">
                                <Button type="submit" variant="primary" className="px-5 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold shadow-sm" disabled={loading}>
                                    {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} />} Save Branch Details
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Form>
    );
};

export default AddBranch;
