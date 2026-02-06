import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Card, Button, InputGroup, Image } from 'react-bootstrap';
import { RefreshCw, Save, Upload, X } from 'lucide-react';
import ImageCropperModal from '../../../../common/components/ImageCropperModal';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        brand: '',
        price: '',
        stock: '',
        location: '',
        description: '',
        branchMode: 'All',
        selectedBranches: [],
        sku: '', // Will be auto-generated
        tags: []
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [tagInput, setTagInput] = useState('');

    // Categories mapping for SKU prefix
    const CATEGORIES = [
        { id: '1', name: 'Electronics', prefix: 'ELEC' },
        { id: '2', name: 'Groceries', prefix: 'GROC' },
        { id: '3', name: 'Clothing', prefix: 'CLOTH' },
        { id: '4', name: 'Home & Kitchen', prefix: 'HOME' },
    ];

    // Branch Mock Data
    const BRANCHES = [
        { id: '1', name: 'Main Branch' },
        { id: '2', name: 'Downtown Store' },
        { id: '3', name: 'Warehouse A' },
        { id: '4', name: 'North City Outlet' },
    ];

    // Brands Mock Data
    const BRANDS = [
        { id: '1', name: 'Samsung' },
        { id: '2', name: 'Nike' },
        { id: '3', name: 'Apple' },
        { id: '4', name: 'Sony' },
        { id: '5', name: 'Adidas' },
        { id: '6', name: 'Puma' },
        { id: '7', name: 'Nestle' },
        { id: '8', name: 'Amul' },
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
                setTempImage(reader.result);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImage) => {
        setImagePreview(croppedImage);
        setShowCropper(false);
        setTempImage(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRefreshSKU = () => {
        setFormData({ ...formData, sku: generateSKU() });
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    const handleAddTagButton = (e) => {
        e.preventDefault();
        addTag();
    };

    const addTag = () => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !formData.tags.includes(trimmedTag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, trimmedTag]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
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
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Tags</Form.Label>
                                            <div className="d-flex flex-wrap gap-2 mb-2">
                                                {formData.tags.map((tag, index) => (
                                                    <span key={index} className="badge rounded-pill bg-light text-dark border d-flex align-items-center gap-2 px-3 py-2">
                                                        {tag}
                                                        <X
                                                            size={14}
                                                            className="cursor-pointer text-muted hover-danger"
                                                            onClick={() => handleRemoveTag(tag)}
                                                        />
                                                    </span>
                                                ))}
                                            </div>
                                            <InputGroup>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Type tag and press Enter..."
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={handleAddTag}
                                                />
                                                <Button variant="outline-secondary" onClick={handleAddTagButton}>
                                                    Add
                                                </Button>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h6 className="mb-3 fw-bold mt-4">Pricing & Inventory</h6>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Base Price (₹)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0.00"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
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
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Physical Location</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. L1-F1"
                                                name="location"
                                                value={formData.location}
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
                                    <Form.Label>Brand Name</Form.Label>
                                    <Form.Select name="brand" value={formData.brand} onChange={handleChange}>
                                        <option value="">Select Brand...</option>
                                        {BRANDS.map(b =>
                                            <option key={b.id} value={b.name}>{b.name}</option>
                                        )}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Available at Branches</Form.Label>
                                    <div className="d-flex gap-3 mb-2">
                                        <Form.Check
                                            type="radio"
                                            label="All Branches"
                                            name="branchMode"
                                            id="branchModeAll"
                                            checked={formData.branchMode === 'All'}
                                            onChange={() => setFormData({ ...formData, branchMode: 'All' })}
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Specific"
                                            name="branchMode"
                                            id="branchModeSpecific"
                                            checked={formData.branchMode === 'Specific'}
                                            onChange={() => setFormData({ ...formData, branchMode: 'Specific' })}
                                        />
                                    </div>

                                    {formData.branchMode === 'Specific' && (
                                        <div className="border rounded p-2 bg-light custom-scrollbar" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                            {BRANCHES.map(b => (
                                                <Form.Check
                                                    key={b.id}
                                                    type="checkbox"
                                                    label={b.name}
                                                    className="mb-1"
                                                    checked={formData.selectedBranches.includes(b.id)}
                                                    onChange={(e) => {
                                                        const newSelection = e.target.checked
                                                            ? [...formData.selectedBranches, b.id]
                                                            : formData.selectedBranches.filter(id => id !== b.id);
                                                        setFormData({ ...formData, selectedBranches: newSelection });
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
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
                                <ImageCropperModal
                                    show={showCropper}
                                    imageSrc={tempImage}
                                    onCancel={() => { setShowCropper(false); setTempImage(null); }}
                                    onCropComplete={handleCropComplete}
                                    aspect={1} // Square crop for products
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mb-3 mb-sm-5 mt-4 mt-sm-0">
                    <Button variant="light" size="lg" className="px-4 responsive-btn">Cancel</Button>
                    <Button variant="primary" size="lg" className="d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm responsive-btn">
                        <Save size={20} /> Save Product
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default AddProduct;
