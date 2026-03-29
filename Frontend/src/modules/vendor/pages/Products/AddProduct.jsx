import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Card, Button, InputGroup, Image, Spinner, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { RefreshCw, Save, Upload, X, Sparkles, Plus, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import ImageCropperModal from '../../../../common/components/ImageCropperModal';
import { useVendor } from '../../contexts/VendorContext';
import { getCategories } from '../../../admin/api/categoryApi';
import { getSubCategories } from '../../../admin/api/subcategoryApi';
import { getBrands } from '../../../admin/api/brandApi';
import { addVendorProduct, getVendorAISuggestions } from '../../api/vendorProductApi';
import { toast } from 'react-toastify';

const AddProduct = () => {
    const navigate = useNavigate();
    const { vendor, fetchProducts } = useVendor();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState({ description: false, tags: false });

    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        subCategory: '',
        brandName: '',
        basePrice: '',
        mrp: '',
        isVeg: true,
        unitType: 'pcs',
        unitValue: 1,
        physicalLocation: '',
        description: '',
        sku: '',
        tags: [],
        stock: 0,
        lowStockThreshold: 10,
        status: 'Active',
        isSaathiGrow: false
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [tagInput, setTagInput] = useState('');

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, subCategoriesData, brandsData] = await Promise.all([
                    getCategories(vendor.token),
                    getSubCategories(vendor.token),
                    getBrands(vendor.token)
                ]);
                setCategories(categoriesData.filter(c => c.status === 'Active'));
                setSubCategories(subCategoriesData.filter(sc => sc.status === 'Active'));
                setBrands(brandsData.filter(b => b.status === 'Active'));
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load initial data');
            } finally {
                setInitialLoading(false);
            }
        };

        if (vendor?.token) {
            fetchData();
        }
    }, [vendor.token]);



    useEffect(() => {
        if (formData.category) {
            const matches = brands.filter(b => {
                const brandCat = (b.category || '').toLowerCase().trim();
                const selectedCat = (formData.category || '').toLowerCase().trim();
                return brandCat === selectedCat;
            });
            setFilteredBrands(matches);

            const filteredSub = subCategories.filter(sc =>
                (sc.categoryName || '').toLowerCase().trim() === (formData.category || '').toLowerCase().trim() ||
                (sc.category?.name || '').toLowerCase().trim() === (formData.category || '').toLowerCase().trim()
            );
            setFilteredSubCategories(filteredSub);

            if (formData.brandName && !matches.find(m => m.name === formData.brandName)) {
                setFormData(prev => ({ ...prev, brandName: '' }));
            }
            if (formData.subCategory && !filteredSub.find(sc => sc.name === formData.subCategory)) {
                setFormData(prev => ({ ...prev, subCategory: '' }));
            }
        } else {
            setFilteredBrands([]);
            setFilteredSubCategories([]);
            setFormData(prev => ({ ...prev, brandName: '', subCategory: '' }));
        }
    }, [formData.category, brands, subCategories]);

    const generateSKU = () => {
        const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PROD';
        const namePart = formData.name ? formData.name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X') : 'XXX';
        const uid = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `V-${prefix}-${namePart}-${uid}`;
    };

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
        const res = await fetch(croppedImage);
        const blob = await res.blob();
        setImageFile(new File([blob], 'product.jpg', { type: 'image/jpeg' }));
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + galleryFiles.length > 10) {
            return toast.warning('Maximum 10 gallery images allowed');
        }
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setGalleryPreviews(prev => [...prev, ...newPreviews]);
        setGalleryFiles(prev => [...prev, ...files]);
    };

    const removeGalleryImage = (index) => {
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
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
            const data = await getVendorAISuggestions(vendor.token, formData.name, type);
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

        // Brand is only required if brands exist for the selected category
        const isBrandRequired = formData.category && filteredBrands.length > 0;

        if (!formData.name || !formData.category || (isBrandRequired && !formData.brandName) || !formData.basePrice || !formData.sku) {
            return toast.error('Please fill all required fields');
        }
        setLoading(true);
        try {
            const data = new FormData();

            Object.keys(formData).forEach(key => {
                if (key === 'tags') {
                    data.append(key, formData.tags.join(','));
                } else {
                    data.append(key, formData[key]);
                }
            });

            if (imageFile) data.append('image', imageFile);
            if (galleryFiles.length > 0) {
                galleryFiles.forEach(file => data.append('gallery', file));
            }

            await addVendorProduct(vendor.token, data);
            await fetchProducts();
            toast.success('Product created successfully!');
            navigate('/vendor/products');
        } catch (error) {
            toast.error(error.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="success" />
            </div>
        );
    }

    return (
        <div className="p-3 bg-white min-vh-100 overflow-x-hidden">
            <div className="flex items-center gap-3 mb-4">
                <button onClick={() => navigate('/vendor/products')} className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden">
                    <ArrowLeft size={18} className="text-gray-600" />
                </button>
                <h4 className="mb-0 fw-bold">Add New Product</h4>
            </div>

            <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="mb-3 fw-bold">General Information</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold text-gray-600">Product Name <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. Fresh Mangoes (1kg)"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="text-xs"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <Form.Label className="mb-0 small fw-semibold text-gray-600">Description <span className="text-danger">*</span></Form.Label>
                                        <OverlayTrigger overlay={<Tooltip>Generate with AI</Tooltip>}>
                                            <Button
                                                variant="link"
                                                className="p-0 text-success d-flex align-items-center gap-1 text-decoration-none"
                                                onClick={() => handleAISuggestion('description')}
                                                disabled={aiLoading.description}
                                            >
                                                {aiLoading.description ? <Spinner animation="border" size="sm" /> : <Sparkles size={14} />}
                                                <small className="font-bold">AI Write</small>
                                            </Button>
                                        </OverlayTrigger>
                                    </div>
                                    <Form.Control
                                        as="textarea" rows={4}
                                        placeholder="Enter detailed product description..."
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        className="text-xs"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <Form.Label className="mb-0 small fw-semibold text-gray-600">Tags (for better search)</Form.Label>
                                        <OverlayTrigger overlay={<Tooltip>Suggest tags with AI</Tooltip>}>
                                            <Button
                                                variant="link"
                                                className="p-0 text-success d-flex align-items-center gap-1 text-decoration-none"
                                                onClick={() => handleAISuggestion('tags')}
                                                disabled={aiLoading.tags}
                                            >
                                                {aiLoading.tags ? <Spinner animation="border" size="sm" /> : <Sparkles size={14} />}
                                                <small className="font-bold">AI Tags</small>
                                            </Button>
                                        </OverlayTrigger>
                                    </div>
                                    <div className="d-flex flex-wrap gap-2 mb-2">
                                        {formData.tags.map((tag, index) => (
                                            <span key={index} className="badge rounded-pill bg-light text-dark border d-flex align-items-center gap-2 px-3 py-2 text-[10px]">
                                                {tag}
                                                <X size={12} className="cursor-pointer text-muted hover-danger" onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))} />
                                            </span>
                                        ))}
                                    </div>
                                    <InputGroup size="sm">
                                        <Form.Control
                                            type="text"
                                            placeholder="Type tag and press Enter..."
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                            className="text-xs"
                                        />
                                        <Button variant="outline-secondary" onClick={(e) => { e.preventDefault(); addTag(); }}>Add</Button>
                                    </InputGroup>
                                </Form.Group>

                                <h6 className="mb-3 fw-bold mt-4">Pricing & Units</h6>
                                <Row className="align-items-end g-2">
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-semibold text-gray-600">Selling Price (₹) <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0.00"
                                                name="basePrice"
                                                value={formData.basePrice}
                                                onChange={handleChange}
                                                required
                                                className="text-xs fw-bold"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-semibold text-gray-600">MRP (₹)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0.00"
                                                name="mrp"
                                                value={formData.mrp}
                                                onChange={handleChange}
                                                className="text-xs text-muted"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-semibold text-gray-600">Unit Type</Form.Label>
                                            <Form.Select name="unitType" value={formData.unitType} onChange={handleChange} className="text-xs">
                                                <option value="pcs">Pcs</option>
                                                <option value="kg">Kg</option>
                                                <option value="gm">Gm</option>
                                                <option value="ml">Ml</option>
                                                <option value="ltr">Ltr</option>
                                                <option value="pkt">Pkt</option>
                                                <option value="box">Box</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-semibold text-gray-600">Current Stock <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={handleChange}
                                                required
                                                min="0"
                                                className="text-xs fw-bold"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-semibold text-gray-600">Low Stock Alert at</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="10"
                                                name="lowStockThreshold"
                                                value={formData.lowStockThreshold}
                                                onChange={handleChange}
                                                min="0"
                                                className="text-xs"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-semibold text-gray-600 mb-1">{t('products.form.food_type', { defaultValue: 'Dietary Type' })}</Form.Label>
                                            <div className="d-flex p-1 bg-gray-50 border border-gray-100 rounded-lg gap-1">
                                                <button
                                                    type="button"
                                                    className={`flex-fill d-flex align-items-center justify-content-center gap-1.5 py-1.5 rounded-md border-0 transition-all font-bold text-[9px] ${formData.isVeg ? 'bg-green-600 text-white shadow-sm' : 'bg-transparent text-green-700 hover:bg-green-50'}`}
                                                    onClick={() => setFormData(prev => ({ ...prev, isVeg: true }))}
                                                >
                                                    <div className={`rounded-circle ${formData.isVeg ? 'bg-white' : 'bg-green-600'}`} style={{ width: '6px', height: '6px' }}></div>
                                                    {t('products.dietary.veg', { defaultValue: 'VEG' })}
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`flex-fill d-flex align-items-center justify-content-center gap-1.5 py-1.5 rounded-md border-0 transition-all font-bold text-[9px] ${!formData.isVeg ? 'bg-red-600 text-white shadow-sm' : 'bg-transparent text-red-700 hover:bg-red-50'}`}
                                                    onClick={() => setFormData(prev => ({ ...prev, isVeg: false }))}
                                                >
                                                    <div className={`rounded-circle ${!formData.isVeg ? 'bg-white' : 'bg-red-600'}`} style={{ width: '6px', height: '6px' }}></div>
                                                    {t('products.dietary.non_veg', { defaultValue: 'NON-VEG' })}
                                                </button>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="g-2">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-semibold text-gray-600">Physical Location (Shelf/Rack)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. Rack 2, Section D"
                                                name="physicalLocation"
                                                value={formData.physicalLocation}
                                                onChange={handleChange}
                                                className="text-xs"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-semibold text-gray-600">Unit Amount (e.g. 500 for 500g)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="1"
                                                name="unitValue"
                                                value={formData.unitValue}
                                                onChange={handleChange}
                                                className="text-xs"
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
                                <h6 className="mb-3 fw-bold">Classification</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold text-gray-600">Category <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="category" value={formData.category} onChange={handleChange} required className="text-xs">
                                        <option value="">Select Category...</option>
                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold text-gray-600">Subcategory</Form.Label>
                                    <Form.Select
                                        name="subCategory"
                                        value={formData.subCategory}
                                        onChange={handleChange}
                                        disabled={!formData.category}
                                        className="text-xs"
                                    >
                                        <option value="">Select Subcategory...</option>
                                        {filteredSubCategories.map(sc => <option key={sc._id} value={sc.name}>{sc.name}</option>)}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold text-gray-600">
                                        Brand Name {formData.category && filteredBrands.length > 0 && <span className="text-danger">*</span>}
                                    </Form.Label>
                                    <Form.Select
                                        name="brandName"
                                        value={formData.brandName}
                                        onChange={handleChange}
                                        required={formData.category && filteredBrands.length > 0}
                                        disabled={!formData.category || (formData.category && filteredBrands.length === 0)}
                                        className="text-xs"
                                    >
                                        <option value="">{formData.category && filteredBrands.length === 0 ? 'No Brands Available' : 'Select Brand...'}</option>
                                        {filteredBrands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                    </Form.Select>
                                    {formData.category && filteredBrands.length === 0 && (
                                        <div className="text-[10px] text-muted mt-1 italic font-medium flex items-center gap-1">
                                            <AlertCircle size={10} className="text-amber-500" />
                                            <span>No brands found in "{formData.category}". You can skip this for now.</span>
                                        </div>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold text-gray-600">SKU (Auto-Generated) <span className="text-danger">*</span></Form.Label>
                                    <InputGroup size="sm">
                                        <Form.Control
                                            readOnly
                                            value={formData.sku}
                                            className="bg-light text-xs font-mono"
                                            required
                                        />
                                        <Button variant="outline-secondary" onClick={handleRefreshSKU} title="Regenerate SKU">
                                            <RefreshCw size={14} />
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                {formData.sku && (
                                    <div className="text-center mt-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Product QR</div>
                                        <div className="d-inline-block p-1 bg-white">
                                            <QRCodeSVG value={formData.sku} size={130} level="H" />
                                        </div>
                                        <div className="text-[10px] mt-2 text-gray-400 font-mono italic">{formData.sku}</div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="mb-3 fw-bold">Images</h6>
                                <div className="text-center mb-3 p-4 border-2 border-dashed rounded-xl bg-gray-50 position-relative group hover:border-[#0c831f] transition-all">
                                    {imagePreview ? (
                                        <div className="position-relative">
                                            <Image src={imagePreview} alt="Preview" fluid rounded className="max-h-40" />
                                            <Button variant="danger" size="sm" className="position-absolute top-0 end-0 m-2 rounded-circle p-1 opacity-0 group-hover:opacity-100 transition-all shadow-md" onClick={() => { setImagePreview(null); setImageFile(null); }}>
                                                <X size={14} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 py-4">
                                            <Upload className="mb-2 mx-auto" size={24} />
                                            <p className="text-[10px] font-bold uppercase tracking-tight">Main Product Image</p>
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

                                <Form.Label className="small fw-bold text-gray-600 mb-2">Gallery (Up to 10)</Form.Label>
                                <div className="d-flex flex-wrap gap-2">
                                    {galleryPreviews.map((preview, index) => (
                                        <div key={index} className="position-relative" style={{ width: '60px', height: '60px' }}>
                                            <Image src={preview} alt={`Gallery ${index}`} thumbnail className="w-100 h-100 object-cover rounded-md" />
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="position-absolute top-0 end-0 rounded-circle p-0 d-flex align-items-center justify-center shadow-sm"
                                                style={{ width: '18px', height: '18px', marginTop: '-6px', marginRight: '-6px' }}
                                                onClick={() => removeGalleryImage(index)}
                                            >
                                                <X size={10} />
                                            </Button>
                                        </div>
                                    ))}
                                    {galleryFiles.length < 10 && (
                                        <div
                                            className="border-2 border-dashed rounded-md d-flex flex-column align-items-center justify-center cursor-pointer hover:bg-gray-100 text-gray-400 transition-all shadow-sm"
                                            style={{ width: '60px', height: '60px' }}
                                            onClick={() => document.getElementById('gallery-input').click()}
                                        >
                                            <Plus size={20} />
                                        </div>
                                    )}
                                </div>
                                <Form.Control
                                    id="gallery-input"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="d-none"
                                    onChange={handleGalleryChange}
                                />
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

                <div className="d-flex justify-content-end gap-3 mb-10 pt-4 border-t border-gray-100">
                    <Button variant="light" size="sm" className="px-5 py-2 font-bold text-gray-600 rounded-lg" onClick={() => navigate('/vendor/products')}>Discard</Button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-2 bg-[#0c831f] hover:bg-[#0a6b19] text-white rounded-lg font-bold shadow-sm transition-all flex items-center gap-2"
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} />}
                        Save Product
                    </button>
                </div>
            </Form>
        </div>
    );
};

export default AddProduct;

