import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Card, Button, InputGroup, Image, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { RefreshCw, Save, Upload, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageCropperModal from '../../../../common/components/ImageCropperModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getCategories } from '../../api/categoryApi';
import { getBrands } from '../../api/brandApi';
import { createProduct, getAISuggestions } from '../../api/productApi';
import { toast } from 'react-toastify';

const AddProduct = () => {
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState({ description: false, tags: false });

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        brandName: '',
        basePrice: '',
        stockQuantity: '',
        physicalLocation: '',
        description: '',
        isAllBranches: true,
        specificBranches: [],
        sku: '',
        tags: [],
        status: 'Active'
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [tagInput, setTagInput] = useState('');

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, brandsData] = await Promise.all([
                    getCategories(adminUser.token),
                    getBrands(adminUser.token)
                ]);
                setCategories(categoriesData.filter(c => c.status === 'Active'));
                setBrands(brandsData.filter(b => b.status === 'Active'));
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load categories and brands');
            } finally {
                setInitialLoading(false);
            }
        };

        if (adminUser?.token) {
            fetchData();
        }
    }, [adminUser]);

    // Filter Brands when category changes
    useEffect(() => {
        if (formData.category) {
            const matches = brands.filter(b => b.category === formData.category);
            setFilteredBrands(matches);
            // Reset brand if it's not in the new matches
            if (!matches.find(m => m.name === formData.brandName)) {
                setFormData(prev => ({ ...prev, brandName: '' }));
            }
        } else {
            setFilteredBrands([]);
            setFormData(prev => ({ ...prev, brandName: '' }));
        }
    }, [formData.category, brands]);

    // SKU Generation Logic
    const generateSKU = () => {
        const prefix = formData.category
            ? formData.category.substring(0, 3).toUpperCase()
            : 'PROD';
        const namePart = formData.name
            ? formData.name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X')
            : 'XXX';
        const uid = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `${prefix}-${namePart}-${uid}`;
    };

    // Auto-update SKU
    useEffect(() => {
        if (formData.name && formData.category && !formData.sku) {
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

    const handleCropComplete = async (croppedImage) => {
        setImagePreview(croppedImage);
        setShowCropper(false);
        setTempImage(null);

        // Convert to file for submission
        const res = await fetch(croppedImage);
        const blob = await res.blob();
        setImageFile(new File([blob], 'product.jpg', { type: 'image/jpeg' }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRefreshSKU = () => {
        setFormData({ ...formData, sku: generateSKU() });
    };

    const addTag = (newTag) => {
        const trimmedTag = (newTag || tagInput).trim();
        if (trimmedTag && !formData.tags.includes(trimmedTag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, trimmedTag]
            }));
            if (!newTag) setTagInput('');
        }
    };

    const handleAISuggestion = async (type) => {
        if (!formData.name) {
            return toast.warning('Please enter a product name first');
        }

        setAiLoading(prev => ({ ...prev, [type]: true }));
        try {
            const data = await getAISuggestions(adminUser.token, formData.name, type);
            if (type === 'description') {
                setFormData(prev => ({ ...prev, description: data.suggestion }));
                toast.success('Description generated!');
            } else if (type === 'tags') {
                const newTags = data.suggestion.split(',').map(t => t.trim()).filter(t => t);
                setFormData(prev => ({
                    ...prev,
                    tags: [...new Set([...prev.tags, ...newTags])]
                }));
                toast.success('Tags generated!');
            }
        } catch (error) {
            toast.error(error.message || `Failed to generate ${type}`);
        } finally {
            setAiLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.category || !formData.brandName || !formData.basePrice || !formData.sku) {
            return toast.error('Please fill all required fields');
        }

        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'tags') {
                    data.append(key, formData.tags.join(','));
                } else if (key === 'specificBranches') {
                    data.append(key, formData.specificBranches.join(','));
                } else {
                    data.append(key, formData[key]);
                }
            });

            if (imageFile) {
                data.append('image', imageFile);
            }

            await createProduct(adminUser.token, data);
            toast.success('Product created successfully!');
            navigate('/admin/products');
        } catch (error) {
            toast.error(error.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className="p-3">
            <h4 className="mb-4 fw-bold">Add New Product</h4>

            <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="mb-3 fw-bold">General Information</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label>Product Name <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. Wireless Headphones"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <Form.Label className="mb-0">Description <span className="text-danger">*</span></Form.Label>
                                        <OverlayTrigger overlay={<Tooltip>Generate with AI</Tooltip>}>
                                            <Button
                                                variant="link"
                                                className="p-0 text-primary d-flex align-items-center gap-1 text-decoration-none"
                                                onClick={() => handleAISuggestion('description')}
                                                disabled={aiLoading.description}
                                            >
                                                {aiLoading.description ? <Spinner animation="border" size="sm" /> : <Sparkles size={16} />}
                                                <small>AI Write</small>
                                            </Button>
                                        </OverlayTrigger>
                                    </div>
                                    <Form.Control
                                        as="textarea" rows={4}
                                        placeholder="Enter product description..."
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <Form.Label className="mb-0">Tags</Form.Label>
                                        <OverlayTrigger overlay={<Tooltip>Suggest tags with AI</Tooltip>}>
                                            <Button
                                                variant="link"
                                                className="p-0 text-primary d-flex align-items-center gap-1 text-decoration-none"
                                                onClick={() => handleAISuggestion('tags')}
                                                disabled={aiLoading.tags}
                                            >
                                                {aiLoading.tags ? <Spinner animation="border" size="sm" /> : <Sparkles size={16} />}
                                                <small>AI Tags</small>
                                            </Button>
                                        </OverlayTrigger>
                                    </div>
                                    <div className="d-flex flex-wrap gap-2 mb-2">
                                        {formData.tags.map((tag, index) => (
                                            <span key={index} className="badge rounded-pill bg-light text-dark border d-flex align-items-center gap-2 px-3 py-2">
                                                {tag}
                                                <X size={14} className="cursor-pointer text-muted hover-danger" onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))} />
                                            </span>
                                        ))}
                                    </div>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            placeholder="Type tag and press Enter..."
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                        />
                                        <Button variant="outline-secondary" onClick={(e) => { e.preventDefault(); addTag(); }}>Add</Button>
                                    </InputGroup>
                                </Form.Group>

                                <h6 className="mb-3 fw-bold mt-4">Pricing & Inventory</h6>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Base Price (₹) <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0.00"
                                                name="basePrice"
                                                value={formData.basePrice}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Stock Quantity <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0"
                                                name="stockQuantity"
                                                value={formData.stockQuantity}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Physical Location</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. L1-F1"
                                                name="physicalLocation"
                                                value={formData.physicalLocation}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="mb-3 fw-bold">Organization</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                                        <option value="">Select Category...</option>
                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Brand Name <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="brandName" value={formData.brandName} onChange={handleChange} required disabled={!formData.category}>
                                        <option value="">Select Brand...</option>
                                        {filteredBrands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                    </Form.Select>
                                    {!formData.category && <Form.Text className="text-muted">Select a category first</Form.Text>}
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>SKU (Auto-Generated) <span className="text-danger">*</span></Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            readOnly
                                            value={formData.sku}
                                            className="bg-light"
                                            required
                                        />
                                        <Button variant="outline-secondary" onClick={handleRefreshSKU} title="Regenerate SKU">
                                            <RefreshCw size={18} />
                                        </Button>
                                    </InputGroup>
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
                                            <Button variant="danger" size="sm" className="position-absolute top-0 end-0 m-2 rounded-circle p-1" onClick={() => { setImagePreview(null); setImageFile(null); }}>
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
                                    aspect={1}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2 mb-5">
                    <Button variant="light" size="lg" className="px-4" onClick={() => navigate('/admin/products')}>Cancel</Button>
                    <Button variant="primary" size="lg" type="submit" className="px-4" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" className="me-2" /> : <Save size={20} className="me-2" />}
                        Save Product
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default AddProduct;
