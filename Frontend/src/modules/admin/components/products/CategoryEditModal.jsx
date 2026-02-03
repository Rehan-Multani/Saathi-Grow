import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Image as BSImage } from 'react-bootstrap';
import { Save, X, Upload, Palette, Image as ImageIcon } from 'lucide-react';

const PRESET_COLORS = [
    '#FEE2E2', '#FEF3C7', '#D1FAE5', '#DBEAFE',
    '#E0E7FF', '#F3E8FF', '#FAE8FF', '#F1F5F9',
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#ffffff', '#000000'
];

const CategoryEditModal = ({ show, onHide, category, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        parent: 'None',
        status: 'Active',
        description: '',
        bgColor: '#DBEAFE'
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                slug: category.slug || '',
                parent: category.parent || 'None',
                status: category.status || 'Active',
                description: category.description || '',
                bgColor: category.bgColor || '#DBEAFE'
            });
            setImagePreview(category.image || null);
        }
    }, [category]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...category, ...formData, image: imagePreview });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="category-edit-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold px-2">Edit Category</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4">
                <Form onSubmit={handleSubmit} className="px-2">
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
                                    required
                                />
                            </div>

                            <Row className="g-3 mb-3">
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted uppercase tracking-wider">Parent Category</Form.Label>
                                    <Form.Select
                                        name="parent"
                                        value={formData.parent}
                                        onChange={handleChange}
                                        className="bg-light border-0 py-2 shadow-none"
                                    >
                                        <option value="None">None (Top Level)</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Clothing">Clothing</option>
                                        <option value="Groceries">Groceries</option>
                                    </Form.Select>
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted uppercase tracking-wider">Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="bg-light border-0 py-2 shadow-none"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </Form.Select>
                                </Col>
                            </Row>

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
                                />
                            </div>
                        </Col>

                        <Col md={5} className="border-start">
                            <h6 className="small fw-bold text-muted uppercase tracking-wider mb-3">Image & Appearance</h6>

                            <div
                                className="text-center mb-3 p-3 border border-dashed rounded-xl bg-light position-relative overflow-hidden"
                                style={{ minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {imagePreview ? (
                                    <div className="position-relative w-100">
                                        <div
                                            className="rounded-xl overflow-hidden mx-auto d-flex align-items-center justify-content-center border"
                                            style={{
                                                width: '120px',
                                                height: '120px',
                                                backgroundColor: formData.bgColor,
                                                padding: '10px',
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
                                            variant="danger"
                                            size="sm"
                                            className="position-absolute top-0 end-0 m-0 rounded-circle shadow p-1"
                                            onClick={() => setImagePreview(null)}
                                            style={{ transform: 'translate(5px, -5px)', zIndex: 5 }}
                                        >
                                            <X size={12} />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-muted py-2">
                                        <Upload className="text-primary opacity-50 mb-2" size={24} />
                                        <p className="small mb-0">Change Image</p>
                                    </div>
                                )}
                                <Form.Control
                                    type="file"
                                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
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
                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.2)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                    />
                                ))}
                                <Form.Control
                                    type="color"
                                    name="bgColor"
                                    value={formData.bgColor}
                                    onChange={handleChange}
                                    className="p-0 border-0 ms-1"
                                    style={{ width: '24px', height: '24px', cursor: 'pointer', background: 'transparent' }}
                                />
                            </div>

                            <div className="p-2 rounded border bg-light">
                                <p className="text-[10px] text-muted fw-bold uppercase mb-2 tracking-widest">Live Preview</p>
                                <div className="d-flex align-items-center gap-2">
                                    <div
                                        className="rounded-circle shadow-sm"
                                        style={{
                                            width: '40px',
                                            height: '40px',
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
                                            <ImageIcon size={18} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="text-truncate fw-bold small">
                                        {formData.name || 'Category'}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-medium shadow-none border">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-medium d-flex align-items-center gap-2 shadow-sm">
                            <Save size={18} /> Update Category
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CategoryEditModal;
