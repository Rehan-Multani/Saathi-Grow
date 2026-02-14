import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Image as BSImage, Spinner } from 'react-bootstrap';
import { Save, X, Upload, Palette, Image as ImageIcon, Camera } from 'lucide-react';
import { toast } from 'react-toastify';

const PRESET_COLORS = [
    '#FEE2E2', '#FEF3C7', '#D1FAE5', '#DBEAFE',
    '#E0E7FF', '#F3E8FF', '#FAE8FF', '#F1F5F9',
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#ffffff', '#000000'
];

const CategoryEditModal = ({ show, onHide, category, onSave }) => {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        status: 'Active',
        description: '',
        bgColor: '#DBEAFE'
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                slug: category.slug || '',
                status: category.status || 'Active',
                description: category.description || '',
                bgColor: category.bgColor || '#DBEAFE'
            });
            setImagePreview(category.image || null);
            setImageFile(null);
        }
    }, [category]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                return toast.error('Image size should be less than 2MB');
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleColorSelect = (color) => {
        setFormData(prev => ({ ...prev, bgColor: color }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('slug', formData.slug);
            data.append('status', formData.status);
            data.append('description', formData.description);
            data.append('bgColor', formData.bgColor);

            if (imageFile) {
                data.append('image', imageFile);
            }

            await onSave(data);
        } catch (error) {
            // Error handling is usually done in the parent component's handleSave
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="category-edit-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold px-2 text-dark">Update Category</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4 px-4 pb-4">
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={7}>
                            <div className="mb-3">
                                <Form.Label className="small fw-bold text-muted uppercase tracking-wider">Category Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2 shadow-none"
                                    placeholder="e.g. Electronics"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="mb-3">
                                <Form.Label className="small fw-bold text-muted uppercase tracking-wider">Slug</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2 font-monospace shadow-none"
                                    placeholder="electronics-item"
                                    disabled={loading}
                                />
                                <Form.Text className="text-muted small">Unique identifier for SEO.</Form.Text>
                            </div>

                            <div className="mb-3">
                                <Form.Label className="small fw-bold text-muted uppercase tracking-wider">Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2 shadow-none"
                                    disabled={loading}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </Form.Select>
                            </div>

                            <div className="mb-0">
                                <Form.Label className="small fw-bold text-muted uppercase tracking-wider">Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2 shadow-none"
                                    placeholder="Category description..."
                                    disabled={loading}
                                />
                            </div>
                        </Col>

                        <Col md={5} className="border-start">
                            <h6 className="small fw-bold text-muted uppercase tracking-wider mb-3">Appearance</h6>

                            <div
                                className="text-center mb-3 p-3 border border-dashed rounded-xl bg-light position-relative overflow-hidden shadow-inner"
                                style={{ minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {imagePreview ? (
                                    <div className="position-relative">
                                        <div
                                            className="rounded-xl overflow-hidden mx-auto d-flex align-items-center justify-content-center border-white border-2 shadow-sm"
                                            style={{
                                                width: '120px',
                                                height: '120px',
                                                backgroundColor: formData.bgColor,
                                                padding: '12px',
                                                transition: 'background-color 0.3s ease'
                                            }}
                                        >
                                            <BSImage
                                                src={imagePreview}
                                                fluid
                                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                            />
                                        </div>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="position-absolute bottom-0 end-0 rounded-circle shadow p-2"
                                            onClick={() => fileInputRef.current.click()}
                                            disabled={loading}
                                            style={{ transform: 'translate(5px, 5px)' }}
                                        >
                                            <Camera size={14} />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-muted py-2 cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                        <Upload className="text-primary opacity-50 mb-2 mx-auto" size={28} />
                                        <p className="small mb-0 fw-bold">Add Category Image</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="d-none"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                />
                            </div>

                            <Form.Label className="small fw-bold text-muted d-block mb-2">Background Color</Form.Label>
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {PRESET_COLORS.map((color) => (
                                    <div
                                        key={color}
                                        onClick={() => handleColorSelect(color)}
                                        className="rounded-circle cursor-pointer border"
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            backgroundColor: color,
                                            boxShadow: formData.bgColor === color ? `0 0 0 1px white, 0 0 0 3px ${color}` : 'none',
                                            transition: 'transform 0.2s ease',
                                        }}
                                        title={color}
                                    />
                                ))}
                                <Form.Control
                                    type="color"
                                    name="bgColor"
                                    value={formData.bgColor}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="p-0 border-0 ms-1"
                                    style={{ width: '24px', height: '24px', cursor: 'pointer', background: 'transparent' }}
                                />
                            </div>

                            <div className="p-3 rounded-xl border bg-light shadow-inner">
                                <p className="text-[10px] text-muted fw-bold uppercase mb-2 tracking-widest text-center">Live Preview Card</p>
                                <div className="d-flex align-items-center gap-3 justify-content-center">
                                    <div
                                        className="rounded-xl shadow-sm border-white border-2"
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            backgroundColor: formData.bgColor,
                                            padding: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {imagePreview ? (
                                            <BSImage src={imagePreview} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <ImageIcon size={20} className="text-muted opacity-30" />
                                        )}
                                    </div>
                                    <div className="text-truncate fw-bold small" style={{ maxWidth: '100px' }}>
                                        {formData.name || 'Category'}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-medium shadow-none border" disabled={loading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-medium d-flex align-items-center gap-2 shadow-sm" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} />}
                            {loading ? 'Saving...' : 'Update Category'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CategoryEditModal;
