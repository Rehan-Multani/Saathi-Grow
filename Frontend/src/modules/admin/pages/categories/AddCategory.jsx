import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Image } from 'react-bootstrap';
import {
    Save, X, Upload,
    Shirt, Smartphone, Home, Watch, Coffee, Utensils, Book, Car, Plane, Music,
    Globe, Heart, Smile, Star, Zap, Award, Gift, ShoppingBag, Tag, Camera,
    Monitor, Headphones, Speaker, Battery, Wifi, Map, Sun, Moon, Cloud, Umbrella
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AVAILABLE_ICONS = {
    Shirt, Smartphone, Home, Watch, Coffee, Utensils, Book, Car, Plane, Music,
    Globe, Heart, Smile, Star, Zap, Award, Gift, ShoppingBag, Tag, Camera,
    Monitor, Headphones, Speaker, Battery, Wifi, Map, Sun, Moon, Cloud, Umbrella
};

const PRESET_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
    '#64748B', '#0EA5E9'
];

const AddCategory = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        parent: '',
        status: 'Active',
        description: '',
        icon: 'ShoppingBag',
        color: '#3B82F6'
    });
    const [imagePreview, setImagePreview] = useState(null);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleIconSelect = (iconName) => {
        setFormData({ ...formData, icon: iconName });
    };

    const handleColorSelect = (color) => {
        setFormData({ ...formData, color: color });
    };

    const handleSave = () => {
        console.log('Saving Category:', formData);
        alert('Category Data with Icon & Color: ' + JSON.stringify(formData, null, 2));
    };

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Add Category</h4>
                <Button variant="light" onClick={() => navigate('/admin/categories')}>
                    <X size={18} className="me-2" /> Cancel
                </Button>
            </div>

            <Row>
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">General Information</h6>
                            <Form.Group className="mb-3">
                                <Form.Label>Category Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. Men's Fashion"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Parent Category</Form.Label>
                                        <Form.Select name="parent" value={formData.parent} onChange={handleChange}>
                                            <option value="">None (Top Level)</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Fashion">Fashion</option>
                                            <option value="Home">Home</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Slug (URL)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. mens-fashion"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

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

                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Category Appearance</h6>
                            <Form.Label className="d-block mb-3">Select Icon</Form.Label>
                            <div className="d-flex flex-wrap gap-2 mb-4 p-3 bg-light rounded border">
                                {Object.keys(AVAILABLE_ICONS).map((iconName) => {
                                    const IconComponent = AVAILABLE_ICONS[iconName];
                                    const isSelected = formData.icon === iconName;
                                    return (
                                        <div
                                            key={iconName}
                                            onClick={() => handleIconSelect(iconName)}
                                            className={`p-2 rounded cursor-pointer transition-all d-flex align-items-center justify-content-center ${isSelected ? 'bg-white shadow-sm ring-2 ring-primary border-primary' : 'hover:bg-white hover:shadow-sm'}`}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                border: isSelected ? `2px solid ${formData.color}` : '1px solid transparent',
                                                cursor: 'pointer'
                                            }}
                                            title={iconName}
                                        >
                                            <IconComponent
                                                size={20}
                                                color={isSelected ? formData.color : '#64748b'}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            <Form.Label className="d-block mb-3">Select Color</Form.Label>
                            <div className="d-flex flex-wrap gap-3 align-items-center">
                                {PRESET_COLORS.map((color) => (
                                    <div
                                        key={color}
                                        onClick={() => handleColorSelect(color)}
                                        className="rounded-circle cursor-pointer position-relative"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            backgroundColor: color,
                                            boxShadow: formData.color === color ? '0 0 0 3px white, 0 0 0 5px ' + color : 'none',
                                            border: '2px solid white',
                                            cursor: 'pointer'
                                        }}
                                        title={color}
                                    />
                                ))}
                                <div className="border-start ps-3 ms-2">
                                    <Form.Control
                                        type="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        title="Custom Color"
                                        className="p-1"
                                        style={{ width: '40px', height: '40px' }}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 p-3 rounded bg-light d-flex align-items-center gap-3 border">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle text-white shadow-sm"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        backgroundColor: formData.color
                                    }}
                                >
                                    {React.createElement(AVAILABLE_ICONS[formData.icon] || AVAILABLE_ICONS.ShoppingBag, { size: 24 })}
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-1" style={{ color: formData.color }}>preview: {formData.name || 'Category Name'}</h6>
                                    <p className="small text-muted mb-0">This is how the category will appear.</p>
                                </div>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Category Image</h6>
                            <div className="text-center mb-3 p-4 border border-dashed rounded bg-light position-relative">
                                {imagePreview ? (
                                    <div className="position-relative">
                                        <Image src={imagePreview} fluid rounded style={{ maxHeight: '200px' }} />
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="position-absolute top-0 end-0 m-2 rounded-circle p-1"
                                            onClick={() => setImagePreview(null)}
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-muted">
                                        <Upload className="mb-2" size={32} />
                                        <p className="small mb-0">Upload Image</p>
                                    </div>
                                )}
                                <Form.Control
                                    type="file"
                                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    disabled={!!imagePreview}
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
                            <Button variant="primary" onClick={handleSave} className="w-100 mt-4 d-flex align-items-center justify-content-center gap-2">
                                <Save size={18} /> Save Category
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddCategory;
