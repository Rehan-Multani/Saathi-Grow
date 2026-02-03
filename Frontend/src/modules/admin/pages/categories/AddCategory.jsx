import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Image as BSImage } from 'react-bootstrap';
import { Save, X, Upload, Palette, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRESET_COLORS = [
    '#FEE2E2', '#FEF3C7', '#D1FAE5', '#DBEAFE',
    '#E0E7FF', '#F3E8FF', '#FAE8FF', '#F1F5F9',
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#ffffff', '#000000'
];

const AddCategory = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        parent: '',
        status: 'Active',
        description: '',
        bgColor: '#DBEAFE'
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

    const handleColorSelect = (color) => {
        setFormData({ ...formData, bgColor: color });
    };

    const handleSave = () => {
        console.log('Saving Category:', { ...formData, image: imagePreview });
        // Simulating save
        navigate('/admin/categories');
    };

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Add Category</h4>
                <Button variant="light" onClick={() => navigate('/admin/categories')} className="shadow-sm border">
                    <X size={18} className="me-2" /> Cancel
                </Button>
            </div>

            <Row>
                <Col lg={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <span className="p-2 bg-primary bg-opacity-10 rounded text-primary"><Save size={18} /></span>
                                General Information
                            </h6>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-muted">Category Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. Men's Fashion"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2 shadow-none"
                                    required
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold text-muted">Parent Category</Form.Label>
                                        <Form.Select
                                            name="parent"
                                            value={formData.parent}
                                            onChange={handleChange}
                                            className="bg-light border-0 py-2 shadow-none"
                                        >
                                            <option value="">None (Top Level)</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Fashion">Fashion</option>
                                            <option value="Home">Home</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold text-muted">Slug (URL)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. mens-fashion"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            className="bg-light border-0 py-2 shadow-none font-monospace"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-0">
                                <Form.Label className="small fw-bold text-muted">Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief description of the category..."
                                    className="bg-light border-0 py-2 shadow-none"
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <span className="p-2 bg-indigo-50 rounded text-indigo-600"><Palette size={18} /></span>
                                Background Styling
                            </h6>

                            <div className="mb-4">
                                <Form.Label className="small fw-bold text-muted d-block mb-3">Choose Image Background Color</Form.Label>
                                <div className="d-flex flex-wrap gap-3 align-items-center mb-3">
                                    {PRESET_COLORS.map((color) => (
                                        <div
                                            key={color}
                                            onClick={() => handleColorSelect(color)}
                                            className="rounded-circle cursor-pointer position-relative shadow-sm transition-all hover:scale-110"
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                backgroundColor: color,
                                                boxShadow: formData.bgColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : 'inset 0 0 2px rgba(0,0,0,0.1)',
                                                border: '2px solid white',
                                            }}
                                            title={color}
                                        />
                                    ))}
                                    <div className="border-start ps-3">
                                        <Form.Control
                                            type="color"
                                            name="bgColor"
                                            value={formData.bgColor}
                                            onChange={handleChange}
                                            title="Custom Background Color"
                                            className="p-1 border shadow-sm"
                                            style={{ width: '40px', height: '40px', borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>
                                <p className="text-muted small">Select a color to be used as the background for your category image.</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                <span className="p-2 bg-green-50 rounded text-green-600"><ImageIcon size={18} /></span>
                                Category Image
                            </h6>

                            <div
                                className="text-center mb-4 p-4 border border-dashed rounded-xl bg-light position-relative overflow-hidden shadow-inner"
                                style={{ minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {imagePreview ? (
                                    <div className="position-relative w-100">
                                        <div
                                            className="rounded-xl overflow-hidden shadow-sm mx-auto d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '180px',
                                                height: '180px',
                                                backgroundColor: formData.bgColor,
                                                padding: '15px',
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
                                            style={{ transform: 'translate(10px, -10px)', zIndex: 5 }}
                                        >
                                            <X size={14} />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-muted py-4">
                                        <div className="bg-white rounded-circle shadow-sm p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                                            <Upload className="text-primary" size={32} />
                                        </div>
                                        <p className="small mb-1 fw-bold">Upload Category Image</p>
                                        <p className="text-[10px] text-uppercase tracking-wider">PNG, JPG or WebP</p>
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

                            <div className="p-3 rounded-xl border bg-light d-flex flex-column gap-2 mb-2">
                                <h6 className="small fw-bold text-muted mb-0 uppercase tracking-tighter">Live Preview</h6>
                                <div className="d-flex align-items-center gap-3">
                                    <div
                                        className="rounded-circle shadow-sm border-white border-2"
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
                                            <ImageIcon size={20} className="text-white opacity-50" />
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>
                                            {formData.name || 'Category Name'}
                                        </div>
                                        <div className="text-xs text-muted">
                                            Status: <span className={formData.status === 'Active' ? 'text-green-500' : 'text-red-500'}>{formData.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm overflow-hidden">
                        <Card.Body className="p-0">
                            <div className="p-3 border-bottom bg-light">
                                <h6 className="fw-bold mb-0 small uppercase tracking-wider text-muted font-mono">Publishing</h6>
                            </div>
                            <div className="p-3">
                                <Form.Label className="small fw-bold text-muted">Visibility Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2 shadow-none mb-4"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </Form.Select>
                                <Button
                                    variant="primary"
                                    onClick={handleSave}
                                    className="w-100 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                >
                                    <Save size={18} /> Save & Publish
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AddCategory;
