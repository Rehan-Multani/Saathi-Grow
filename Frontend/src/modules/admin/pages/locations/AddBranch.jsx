import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Spinner, Image } from 'react-bootstrap';
import { Save, X, ArrowLeft, Upload, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createBranch } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import GoogleMapsInput from '../../components/common/GoogleMapsInput';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

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
        },
        isActive: true
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
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: val }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: val }));
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

            await createBranch(adminUser.token, data);
            toast.success('Branch created successfully');
            navigate('/admin/locations/branches');
        } catch (error) {
            toast.error(error.message || 'Failed to create branch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="p-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle p-2 shadow-sm border bg-white"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={16} />
                    </Button>
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <h4 className="fw-bold mb-0 text-nowrap">Add New Branch</h4>
                            <PageInfoTooltip info={pageInfoData.addBranch} />
                        </div>
                        <p className="text-muted small mb-0 uppercase tracking-widest opacity-60">Register Locations</p>
                    </div>
                </div>
                <div className="d-flex justify-content-end flex-grow-1 w-100 w-sm-auto gap-2">
                    <Button variant="light" onClick={() => navigate('/admin/locations/branches')} className="d-flex align-items-center gap-2 shadow-sm justify-content-center px-4">
                        <X size={18} /> Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading} className="d-flex align-items-center gap-2 shadow-sm justify-content-center px-4">
                        {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} />}
                        {loading ? 'Saving...' : 'Save Branch'}
                    </Button>
                </div>
            </div>

            <Row>
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4 p-md-5">
                            <h6 className="fw-bold mb-4 text-primary border-bottom pb-2">Branch Information</h6>
                            <Row>
                                <Col md={8}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Branch Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. Main Store - Downtown"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="py-2.5 shadow-none border-light-subtle bg-light-subtle"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Branch Code <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="BNH001"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            required
                                            className="py-2.5 shadow-none border-light-subtle bg-light-subtle text-uppercase font-monospace"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Branch Phone <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="tel"
                                            placeholder="9876543210"
                                            name="phone"
                                            value={formData.phone}
                                            maxLength={10}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setFormData(prev => ({ ...prev, phone: val }));
                                            }}
                                            pattern="^[6-9]\d{9}$"
                                            required
                                            className="py-2.5 shadow-none border-light-subtle bg-light-subtle font-monospace"
                                        />
                                        <Form.Control.Feedback type="invalid">Enter a valid 10-digit mobile number.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Branch Email <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="branch@sathigro.com"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                            required
                                            className="py-2.5 shadow-none border-light-subtle bg-light-subtle"
                                        />
                                        <Form.Control.Feedback type="invalid">Please provide a valid business email.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <h6 className="fw-bold mb-3 mt-4 text-primary border-bottom pb-2">Location Details</h6>
                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Street Address (Search on Map) <span className="text-danger">*</span></Form.Label>
                                        <GoogleMapsInput
                                            onLocationSelect={handleLocationSelect}
                                            placeholder="Search for branch location..."
                                        />
                                        <div className="mt-3">
                                            <Form.Control
                                                type="text"
                                                name="address.street"
                                                value={formData.address.street}
                                                onChange={handleChange}
                                                placeholder="123 Market St"
                                                required
                                                className="py-2.5 shadow-none border-light-subtle bg-light-subtle"
                                            />
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">City <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="address.city"
                                            value={formData.address.city}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                setFormData(prev => ({
                                                    ...prev,
                                                    address: { ...prev.address, city: val }
                                                }));
                                            }}
                                            pattern="^[a-zA-Z\s]+$"
                                            placeholder="City"
                                            required
                                            className="py-2.5 shadow-none border-light-subtle bg-light-subtle"
                                        />
                                        <Form.Control.Feedback type="invalid">City name should only contain alphabets.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">State <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="address.state"
                                            value={formData.address.state}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                setFormData(prev => ({
                                                    ...prev,
                                                    address: { ...prev.address, state: val }
                                                }));
                                            }}
                                            pattern="^[a-zA-Z\s]+$"
                                            placeholder="State"
                                            required
                                            className="py-2.5 shadow-none border-light-subtle bg-light-subtle"
                                        />
                                        <Form.Control.Feedback type="invalid">State name should only contain alphabets.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Zip Code <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="address.zipCode"
                                            value={formData.address.zipCode}
                                            maxLength={6}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setFormData(prev => ({
                                                    ...prev,
                                                    address: { ...prev.address, zipCode: val }
                                                }));
                                            }}
                                            pattern="^\d{6}$"
                                            placeholder="000000"
                                            required
                                            className="py-2.5 shadow-none border-light-subtle bg-light-subtle font-monospace"
                                        />
                                        <Form.Control.Feedback type="invalid">Enter a valid 6-digit zip code.</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                            <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">Branch Logo</h6>
                            <div className="text-center mb-3 p-4 border border-dashed rounded bg-light position-relative" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {logoPreview ? (
                                    <div className="position-relative w-100">
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
                                        <p className="small mb-0">Drag and drop or click to upload logo</p>
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
                            <h6 className="fw-bold mb-3 text-primary border-bottom pb-2">Branch Settings</h6>
                            <Form.Group className="mb-3 d-flex align-items-center justify-content-between">
                                <Form.Label className="small fw-bold mb-0">Branch Status</Form.Label>
                                <Form.Check
                                    type="switch"
                                    id="branch-status-switch"
                                    label={formData.isActive ? "Active" : "Inactive"}
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <p className="small text-muted mb-0">Inactive branches won't be visible in the user app and can't process orders.</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Form>
    );
};

export default AddBranch;
