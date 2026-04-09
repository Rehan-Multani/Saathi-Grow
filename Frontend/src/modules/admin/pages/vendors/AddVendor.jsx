import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Row, Col, Image, Spinner } from 'react-bootstrap';
import { Save, X, Upload, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createVendor } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import GoogleMapsInput from '../../components/common/GoogleMapsInput';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const AddVendor = () => {
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        storeName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            location: {
                type: 'Point',
                coordinates: [0, 0] // [lng, lat]
            }
        },
        description: '',
        status: 'Pending',
        password: ''
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `.pac-container { z-index: 10000 !important; }`;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
        if (!formData.storeName || !formData.ownerName || !formData.email || !formData.phone || !formData.address) {
            return toast.warning('Please fill all required fields');
        }

        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'address') {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            });
            if (logoFile) {
                data.append('logo', logoFile);
            }

            await createVendor(adminUser.token, data);
            toast.success('Vendor registered successfully!');
            navigate('/admin/vendors');
        } catch (error) {
            toast.error(error.message || 'Failed to register vendor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-3">
            <Form onSubmit={handleSubmit}>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4">
                    <div className="d-flex align-items-center gap-2">
                        <h4 className="fw-bold mb-0 text-nowrap">Register New Vendor</h4>
                        <PageInfoTooltip info={pageInfoData.addVendor} />
                    </div>
                    <div className="d-flex justify-content-end flex-grow-1 w-100 w-sm-auto gap-2">
                        <Button variant="light" onClick={() => navigate('/admin/vendors')} className="d-flex align-items-center gap-2 shadow-sm justify-content-center">
                            <X size={18} /> Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading} className="d-flex align-items-center gap-2 shadow-sm justify-content-center px-4">
                            {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} />}
                            {loading ? 'Registering...' : 'Register Vendor'}
                        </Button>
                    </div>
                </div>

                <Row>
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body className="p-4">
                                <h6 className="fw-bold mb-4 border-bottom pb-2 text-primary">Store Information</h6>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Store Name <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. Fresh Farms"
                                                name="storeName"
                                                value={formData.storeName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Owner Name <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. John Doe"
                                                name="ownerName"
                                                value={formData.ownerName}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                    setFormData({ ...formData, ownerName: val });
                                                }}
                                                pattern="^[a-zA-Z\s]+$"
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">Owner name should only contain alphabets.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Email Address <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="name@company.com"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Phone Number <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="tel"
                                                placeholder="9876543210"
                                                name="phone"
                                                value={formData.phone}
                                                maxLength={10}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    setFormData({ ...formData, phone: val });
                                                }}
                                                pattern="^[6-9]\d{9}$"
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">Enter a valid 10-digit mobile number.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">Business Address (Search on Map) <span className="text-danger">*</span></Form.Label>
                                    <GoogleMapsInput
                                        onLocationSelect={handleLocationSelect}
                                        placeholder="Search for store location..."
                                    />
                                    <div className="mt-3">
                                        <Row className="g-3">
                                            <Col md={12}>
                                                <Form.Label className="small fw-bold text-muted">Street Address</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="123 Business Way"
                                                    value={formData.address.street}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        address: { ...formData.address, street: e.target.value }
                                                    })}
                                                    required
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <Form.Label className="small fw-bold text-muted">City</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="City"
                                                    value={formData.address.city}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                        setFormData({
                                                            ...formData,
                                                            address: { ...formData.address, city: val }
                                                        });
                                                    }}
                                                    pattern="^[a-zA-Z\s]+$"
                                                    required
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <Form.Label className="small fw-bold text-muted">State</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="State"
                                                    value={formData.address.state}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                        setFormData({
                                                            ...formData,
                                                            address: { ...formData.address, state: val }
                                                        });
                                                    }}
                                                    pattern="^[a-zA-Z\s]+$"
                                                    required
                                                />
                                            </Col>
                                            <Col md={4}>
                                                <Form.Label className="small fw-bold text-muted">Zip Code</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="000000"
                                                    value={formData.address.zipCode}
                                                    maxLength={6}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        setFormData({
                                                            ...formData,
                                                            address: { ...formData.address, zipCode: val }
                                                        });
                                                    }}
                                                    pattern="^\d{6}$"
                                                    required
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-0">
                                    <Form.Label className="small fw-bold">Description / About</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="Tell us about the vendor..."
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body className="p-4">
                                <h6 className="fw-bold mb-3 text-primary">Store Logo</h6>
                                <div className="text-center mb-3 p-4 border border-dashed rounded bg-light position-relative">
                                    {logoPreview ? (
                                        <div className="position-relative">
                                            <Image src={logoPreview} fluid rounded style={{ maxHeight: '150px' }} />
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="position-absolute top-0 end-0 m-2 rounded-circle p-1"
                                                onClick={() => { setLogoPreview(null); setLogoFile(null); }}
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-muted py-4">
                                            <Store className="mb-2 opacity-25" size={48} />
                                            <p className="small mb-0">Drag and drop or click to upload</p>
                                        </div>
                                    )}
                                    <Form.Control
                                        type="file"
                                        className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                        onChange={handleLogoChange}
                                        accept="image/*"
                                    />
                                </div>
                                <Form.Text className="text-muted small">Recommended size: 500x500px. Max: 2MB</Form.Text>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4">
                                <h6 className="fw-bold mb-3 text-primary">Vendor Settings</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Initial Status</Form.Label>
                                    <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="Pending">Pending (Requires Approval)</option>
                                        <option value="Active">Active (Auto-Approve)</option>
                                        <option value="Inactive">Inactive</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-0">
                                    <Form.Label className="small fw-bold">Set Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Min 6 characters"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <Form.Text className="text-muted small">Default if empty: 123456</Form.Text>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default AddVendor;
