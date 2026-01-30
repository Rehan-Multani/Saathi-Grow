import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, InputGroup, Image } from 'react-bootstrap';
import { Upload, X, Save, RefreshCw } from 'lucide-react';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        description: '',
        sku: '' // Will be auto-generated
    });

    const [imagePreview, setImagePreview] = useState(null);

    // Categories mapping for SKU prefix
    const CATEGORIES = [
        { id: '1', name: 'Electronics', prefix: 'ELEC' },
        { id: '2', name: 'Groceries', prefix: 'GROC' },
        { id: '3', name: 'Clothing', prefix: 'CLOTH' },
        { id: '4', name: 'Home & Kitchen', prefix: 'HOME' },
    ];

    // SKU Generation Logic: [PREFIX]-[NAME_EXTRACT]-[UID]
    const generateSKU = () => {
        const cat = CATEGORIES.find(c => c.name === formData.category);
        const prefix = cat ? cat.prefix : 'GEN';

        const namePart = formData.name
            ? formData.name.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, 'X')
            : 'PROD';

        const uid = Math.random().toString(36).substring(2, 7).toUpperCase();

        return `${prefix}-${namePart}-${uid}`;
    };

    // Auto-update SKU when Name or Category changes (if SKU is empty or previously auto-generated)
    useEffect(() => {
        if (formData.name && formData.category) {
            setFormData(prev => ({ ...prev, sku: generateSKU() }));
        }
    }, [formData.name, formData.category]);

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

    const handleRefreshSKU = () => {
        setFormData({ ...formData, sku: generateSKU() });
    };

    return (
        <div className="p-3">
            <h4 className="mb-4 fw-bold">Add New Product</h4>

            <Form>
                <Row className="g-4">
                    {/* Left Column: Basic Info */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="mb-3 fw-bold">General Information</h6>
                                <Row className="mb-3">
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Product Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. Wireless Headphones"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control
                                                as="textarea" rows={4}
                                                placeholder="Enter product description..."
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h6 className="mb-3 fw-bold mt-4">Pricing & Inventory</h6>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Base Price ($)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0.00"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Stock Quantity</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Column: Category, Image, SKU */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="mb-3 fw-bold">Organization</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select name="category" value={formData.category} onChange={handleChange}>
                                        <option value="">Select Category...</option>
                                        {CATEGORIES.map(c =>
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        )}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>SKU (Auto-Generated)</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            readOnly
                                            value={formData.sku}
                                            className="bg-light"
                                        />
                                        <Button variant="outline-secondary" onClick={handleRefreshSKU} title="Regenerate SKU">
                                            <RefreshCw size={18} />
                                        </Button>
                                    </InputGroup>
                                    <Form.Text className="text-muted small">
                                        Format: [CAT]-[NAME]-[UID]
                                    </Form.Text>
                                </Form.Group>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="mb-3 fw-bold">Product Image</h6>
                                <div className="text-center mb-3 p-4 border border-dashed rounded bg-light position-relative">
                                    {imagePreview ? (
                                        <div className="position-relative">
                                            <Image src={imagePreview} alt="Preview" fluid rounded style={{ maxHeight: '200px' }} />
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
                                            <p className="small mb-0">Click to upload image</p>
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
                    </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2 mb-5">
                    <Button variant="light" size="lg">Cancel</Button>
                    <Button variant="primary" size="lg" className="d-flex align-items-center gap-2 px-4">
                        <Save size={20} /> Save Product
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default AddProduct;
