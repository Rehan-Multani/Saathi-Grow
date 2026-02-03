import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Image } from 'react-bootstrap';
import { Save, X, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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

    const handleSave = (e) => {
        e.preventDefault();

        if (!title.trim()) {
            Swal.fire('Error', 'Please enter a slider name.', 'error');
            return;
        }

        if (images.length === 0) {
            Swal.fire('Error', 'Please upload at least one image.', 'error');
            return;
        }

        // Mock saving logic
        Swal.fire({
            title: 'Saving...',
            text: 'Please wait while we create the slider.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        setTimeout(() => {
            Swal.fire({
                title: 'Success!',
                text: 'New slider has been created successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                navigate('/admin/sliders');
            });
        }, 1500);
    };

    return (
        <div className="p-3 p-md-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mb-4">
                <h4 className="fw-bold mb-0 text-nowrap">Add New Slider</h4>
                <div className="d-flex justify-content-end flex-grow-1 w-100 w-sm-auto">
                    <Button variant="light" onClick={() => navigate('/admin/sliders')} className="d-flex align-items-center gap-2 shadow-sm border px-4 py-2">
                        <X size={18} /> Cancel
                    </Button>
                </div>
            </div>

            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4 overflow-hidden">
                        <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                            <h6 className="fw-bold mb-0">Slider Details</h6>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSave}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Slider Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. Main Hero Slider"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="py-2.5 border-gray-200"
                                        required
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Display Location</Form.Label>
                                            <Form.Select
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="py-2.5 border-gray-200 shadow-none"
                                            >
                                                <option>Home Page - Top</option>
                                                <option>Home Page - Middle</option>
                                                <option>Category Page Header</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Status</Form.Label>
                                            <Form.Select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="py-2.5 border-gray-200 shadow-none"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="mt-2">
                                    <Form.Label className="small fw-bold text-muted text-uppercase d-block mb-3">Slider Images</Form.Label>
                                    <div className="d-flex flex-wrap gap-3 mb-3">
                                        {images.map((img, index) => (
                                            <div key={index} className="position-relative border rounded-3 overflow-hidden group shadow-sm" style={{ width: '120px', height: '80px' }}>
                                                <Image src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button
                                                    type="button"
                                                    className="position-absolute top-0 end-0 bg-danger text-white border-0 p-1 rounded-bl-lg transition-opacity"
                                                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="border-2 border-dashed rounded-3 d-flex flex-column justify-content-center align-items-center bg-light cursor-pointer hover-bg-gray-100 transition-colors" style={{ width: '120px', height: '80px' }}>
                                            <Upload size={24} className="text-muted mb-1" />
                                            <span className="small text-muted font-bold">Upload</span>
                                            <input type="file" multiple className="d-none" onChange={handleImageUpload} accept="image/*" />
                                        </label>
                                    </div>
                                    <Form.Text className="text-muted small">
                                        Recommended size: 1920x600px. Max size: 2MB per image.
                                    </Form.Text>
                                </div>

                                <hr className="my-4 border-gray-100" />

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100 d-flex align-items-center justify-content-center gap-2 py-2.5 fw-bold shadow-sm"
                                >
                                    <Save size={20} /> Save Slider Configuration
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddSlider;
