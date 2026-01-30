import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Image } from 'react-bootstrap';
import { Save, X, Upload, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddBanner = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [status, setStatus] = useState('Active');
    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Add Promotional Banner</h4>
                <Button variant="light" onClick={() => navigate('/admin/banners')}>
                    <X size={18} className="me-2" /> Cancel
                </Button>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Banner Configuration</h6>
                            <Row>
                                <Col md={8}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Banner Title (Internal Use)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. Black Friday Sale"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Status</Form.Label>
                                        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Target Link (Optional)</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light"><LinkIcon size={18} /></span>
                                    <Form.Control
                                        type="text"
                                        placeholder="/categories/electronics"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                    />
                                </div>
                                <Form.Text className="text-muted">Where should the user go when clicking this banner?</Form.Text>
                            </Form.Group>

                            <h6 className="fw-bold mt-4 mb-3">Banner Image</h6>
                            <div className="text-center mb-3 p-4 border border-dashed rounded bg-light position-relative">
                                {preview ? (
                                    <div className="position-relative">
                                        <Image src={preview} fluid rounded style={{ maxHeight: '200px' }} />
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="position-absolute top-0 end-0 m-2 rounded-circle p-1"
                                            onClick={() => setPreview(null)}
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-muted">
                                        <Upload className="mb-2" size={32} />
                                        <p className="small mb-0">Upload Banner Image</p>
                                    </div>
                                )}
                                <Form.Control
                                    type="file"
                                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    disabled={!!preview}
                                />
                            </div>

                            <Button variant="primary" className="w-100 mt-4 d-flex align-items-center justify-content-center gap-2 py-2">
                                <Save size={18} /> Publish Banner
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddBanner;
