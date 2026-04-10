import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Image as BSImage } from 'react-bootstrap';
import { Save, X, Upload } from 'lucide-react';

const SliderEditModal = ({ show, onHide, slider, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        location: 'Home Page - Top',
        status: 'Active',
        images: []
    });

    useEffect(() => {
        if (slider) {
            setFormData({
                title: slider.title || '',
                location: slider.location || 'Home Page - Top',
                status: slider.status || 'Active',
                images: slider.mockImages || [] // In a real app, this would be image URLs
            });
        }
    }, [slider]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        if (e.target.files) {
            const fileArray = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
            setFormData(prev => ({ ...prev, images: prev.images.concat(fileArray) }));
        }
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...slider, ...formData, slides: formData.images.length });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="slider-edit-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold text-dark">Update Slider</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4 px-4">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Slider Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Main Hero Slider"
                            className="py-2.5 border-gray-200 shadow-none"
                            required
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-muted text-uppercase">Display Location</Form.Label>
                                <Form.Select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
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
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
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
                            {formData.images.map((img, index) => (
                                <div key={index} className="position-relative border rounded-3 overflow-hidden group shadow-sm" style={{ width: '120px', height: '80px' }}>
                                    <BSImage src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button
                                        type="button"
                                        className="position-absolute top-1 end-1 bg-danger text-white border-0 p-1 rounded-circle d-flex align-items-center justify-content-center transition-all"
                                        style={{ width: '20px', height: '20px', opacity: 0.9 }}
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        <X size={12} strokeWidth={3} />
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
                            Add or remove slides. Recommended size: 1920x600px.
                        </Form.Text>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-5 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-bold border shadow-none">
                            Discard
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2">
                            <Save size={18} /> Update Changes
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default SliderEditModal;
