import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Image } from 'react-bootstrap';
import { Save, X, Upload, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddVendor = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        storeName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        description: '',
        status: 'Pending'
    });
    const [logoPreview, setLogoPreview] = useState(null);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
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

    return (
        <div className="p-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4">
                <h4 className="fw-bold mb-0 text-nowrap">Register New Vendor</h4>
                <div className="d-flex justify-content-end flex-grow-1 w-100 w-sm-auto">
                    <Button variant="light" onClick={() => navigate('/admin/vendors')} className="d-flex align-items-center gap-2 shadow-sm justify-content-center">
                        <X size={18} /> Cancel
                    </Button>
                </div>
            </div>

            <Row>
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Store Information</h6>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Store Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. Fresh Farms"
                                            name="storeName"
                                            value={formData.storeName}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Owner Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. John Doe"
                                            name="ownerName"
                                            value={formData.ownerName}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email Address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="name@company.com"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Phone Number</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            placeholder="+1 234 567 890"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Business Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Full street address..."
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Description / About</Form.Label>
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
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Store Logo</h6>
                            <div className="text-center mb-3 p-4 border border-dashed rounded bg-light position-relative">
                                {logoPreview ? (
                                    <div className="position-relative">
                                        <Image src={logoPreview} fluid rounded style={{ maxHeight: '150px' }} />
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="position-absolute top-0 end-0 m-2 rounded-circle p-1"
                                            onClick={() => setLogoPreview(null)}
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-muted">
                                        <Store className="mb-2" size={32} />
                                        <p className="small mb-0">Upload Logo</p>
                                    </div>
                                )}
                                <Form.Control
                                    type="file"
                                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                    onChange={handleLogoChange}
                                    accept="image/*"
                                    disabled={!!logoPreview}
                                />
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Initial Status</h6>
                            <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                <option value="Pending">Pending (Requires Approval)</option>
                                <option value="Active">Active (Auto-Approve)</option>
                                <option value="Insetive">Inactive</option>
                            </Form.Select>
                            <Button variant="primary" className="w-100 mt-4 d-flex align-items-center justify-content-center gap-2">
                                <Save size={18} /> Register Vendor
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddVendor;
