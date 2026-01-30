import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Image } from 'react-bootstrap';
import { Save, X, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddBrand = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        status: 'Active',
        website: '',
        description: ''
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Add New Brand</h4>
                <Button variant="light" onClick={() => navigate('/admin/brands')}>
                    <X size={18} className="me-2" /> Cancel
                </Button>
            </div>

            <Row>
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Brand Details</h6>
                            <Form.Group className="mb-3">
                                <Form.Label>Brand Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. Nike"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Website (Optional)</Form.Label>
                                <Form.Control
                                    type="url"
                                    placeholder="https://example.com"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
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
                            <h6 className="fw-bold mb-3">Brand Logo</h6>
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
                                        <Upload className="mb-2" size={32} />
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
                            <h6 className="fw-bold mb-3">Status</h6>
                            <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </Form.Select>
                            <Button variant="primary" className="w-100 mt-4 d-flex align-items-center justify-content-center gap-2">
                                <Save size={18} /> Save Brand
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddBrand;
