import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Image } from 'react-bootstrap';
import { Save, X, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddSlider = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('Home Page - Top');
    const [status, setStatus] = useState('Active');
    const [images, setImages] = useState([]);

    const handleImageUpload = (e) => {
        if (e.target.files) {
            const fileArray = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
            setImages((prevImages) => prevImages.concat(fileArray));
        }
    };

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Add New Slider</h4>
                <Button variant="light" onClick={() => navigate('/admin/sliders')}>
                    <X size={18} className="me-2" /> Cancel
                </Button>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Slider Configuration</h6>
                            <Form.Group className="mb-3">
                                <Form.Label>Slider Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. Main Hero Slider"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Display Location</Form.Label>
                                        <Form.Select value={location} onChange={(e) => setLocation(e.target.value)}>
                                            <option>Home Page - Top</option>
                                            <option>Home Page - Middle</option>
                                            <option>Category Page Header</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Status</Form.Label>
                                        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <h6 className="fw-bold mt-4 mb-3">Slider Images</h6>
                            <div className="d-flex flex-wrap gap-3 mb-3">
                                {images.map((img, index) => (
                                    <div key={index} className="position-relative border rounded overflow-hidden" style={{ width: '100px', height: '60px' }}>
                                        <Image src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                                <div className="border border-dashed rounded d-flex justify-content-center align-items-center bg-light" style={{ width: '100px', height: '60px' }}>
                                    <label className="w-100 h-100 d-flex justify-content-center align-items-center cursor-pointer">
                                        <Upload size={20} className="text-secondary" />
                                        <input type="file" multiple className="d-none" onChange={handleImageUpload} accept="image/*" />
                                    </label>
                                </div>
                            </div>
                            <Form.Text className="text-muted">
                                Upload multiple images. Drag and drop functionality coming soon.
                            </Form.Text>

                            <Button variant="primary" className="w-100 mt-4 d-flex align-items-center justify-content-center gap-2 py-2">
                                <Save size={18} /> Save Slider
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddSlider;
