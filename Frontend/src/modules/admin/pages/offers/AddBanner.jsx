import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Image } from 'react-bootstrap';
import { Save, X, Upload, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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

    const handleSave = (e) => {
        e.preventDefault();

        if (!title.trim()) {
            Swal.fire('Error', 'Please enter a banner title.', 'error');
            return;
        }

        if (!preview) {
            Swal.fire('Error', 'Please upload a banner image.', 'error');
            return;
        }

        Swal.fire({
            title: 'Publishing...',
            text: 'Creating your promotional banner.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        // Mock saving
        setTimeout(() => {
            Swal.fire({
                title: 'Published!',
                text: 'New banner has been successfully added.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                navigate('/admin/banners');
            });
        }, 1500);
    };

    return (
        <div className="p-3 p-md-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4">
                <h4 className="fw-bold mb-0 text-nowrap">Add Promotional Banner</h4>
                <div className="d-flex justify-content-end flex-grow-1 w-100 w-sm-auto">
                    <Button variant="light" onClick={() => navigate('/admin/banners')} className="d-flex align-items-center gap-2 shadow-sm border px-4 py-2">
                        <X size={18} /> Cancel
                    </Button>
                </div>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4 overflow-hidden">
                        <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                            <h6 className="fw-bold mb-0">Banner Details</h6>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSave}>
                                <Row>
                                    <Col md={8}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Banner Title (Internal Use)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. Black Friday Sale"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="py-2.5 border-gray-200"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Status</Form.Label>
                                            <Form.Select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="py-2.5 border-gray-200 shadow-none px-3"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Target Link (Optional)</Form.Label>
                                    <div className="input-group shadow-none">
                                        <span className="input-group-text bg-light border-gray-200 text-muted"><LinkIcon size={18} /></span>
                                        <Form.Control
                                            type="text"
                                            placeholder="/categories/electronics"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            className="py-2.5 border-gray-200 shadow-none border-start-0"
                                        />
                                    </div>
                                    <Form.Text className="text-muted small">Specify where users land when clicking this banner.</Form.Text>
                                </Form.Group>

                                <div className="mt-2">
                                    <Form.Label className="small fw-bold text-muted text-uppercase d-block mb-3">Banner Image</Form.Label>
                                    <div className="text-center mb-1 p-4 border-2 border-dashed rounded-3 bg-light position-relative" style={{ minHeight: '180px' }}>
                                        {preview ? (
                                            <div className="position-relative">
                                                <Image src={preview} fluid rounded className="shadow-sm" style={{ maxHeight: '250px' }} />
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="position-absolute top-0 end-0 m-2 rounded-circle p-1 shadow-sm d-flex align-items-center justify-content-center"
                                                    style={{ width: '28px', height: '28px' }}
                                                    onClick={() => setPreview(null)}
                                                >
                                                    <X size={18} />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="py-4 text-muted">
                                                <Upload className="mb-3 opacity-30" size={48} />
                                                <p className="fw-bold mb-1">Click or drag to upload</p>
                                                <p className="small mb-0 opacity-70">Supports JPG, PNG (Max 2MB)</p>
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
                                    <Form.Text className="text-muted small">Recommended size: 1200x400px (3:1 Aspect Ratio).</Form.Text>
                                </div>

                                <hr className="my-4 border-gray-100" />

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100 d-flex align-items-center justify-content-center gap-2 py-2.5 fw-bold shadow-sm"
                                >
                                    <Save size={20} /> Publish & Save Banner
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddBanner;
