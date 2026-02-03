import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Image as BSImage } from 'react-bootstrap';
import { Save, X, Upload, Link as LinkIcon } from 'lucide-react';

const BannerEditModal = ({ show, onHide, banner, onSave }) => {
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        link: '',
        status: 'Active',
        image: null,
        preview: null
    });

    useEffect(() => {
        if (banner) {
            setFormData({
                id: banner.id,
                title: banner.title || '',
                link: banner.link || '',
                status: banner.status || 'Active',
                image: banner.image,
                preview: banner.image
            });
        }
    }, [banner]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result, preview: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...banner,
            title: formData.title,
            link: formData.link,
            status: formData.status,
            image: formData.preview
        });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered className="banner-edit-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold text-dark">Edit Banner</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4 px-4">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Banner Title</Form.Label>
                        <Form.Control
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Black Friday Sale"
                            className="py-2.5 border-gray-200 shadow-none"
                            required
                        />
                    </Form.Group>

                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-muted text-uppercase">Target Link</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-gray-200 text-muted">
                                        <LinkIcon size={16} />
                                    </span>
                                    <Form.Control
                                        type="text"
                                        name="link"
                                        value={formData.link}
                                        onChange={handleChange}
                                        placeholder="/categories/electronics"
                                        className="py-2.5 border-gray-200 shadow-none border-start-0"
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-muted text-uppercase">Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="py-2.5 border-gray-200 shadow-none px-3"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold text-muted text-uppercase d-block mb-3">Banner Image</Form.Label>
                        <div className="text-center mb-3 p-3 border border-dashed rounded-3 bg-light position-relative" style={{ minHeight: '120px' }}>
                            {formData.preview ? (
                                <div className="position-relative">
                                    <BSImage src={formData.preview} fluid rounded className="shadow-sm" style={{ maxHeight: '150px' }} />
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="position-absolute top-0 end-0 m-1 rounded-circle p-1 shadow-sm d-flex align-items-center justify-content-center"
                                        style={{ width: '24px', height: '24px' }}
                                        onClick={() => setFormData(prev => ({ ...prev, preview: null }))}
                                    >
                                        <X size={14} />
                                    </Button>
                                </div>
                            ) : (
                                <div className="py-3 text-muted">
                                    <Upload className="mb-2 opacity-50" size={32} />
                                    <p className="small mb-0 fw-medium">Upload New Banner</p>
                                </div>
                            )}
                            <Form.Control
                                type="file"
                                className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                onChange={handleImageChange}
                                accept="image/*"
                                disabled={!!formData.preview}
                            />
                        </div>
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-bold border shadow-none">
                            Discard
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2">
                            <Save size={18} /> Update Banner
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default BannerEditModal;
