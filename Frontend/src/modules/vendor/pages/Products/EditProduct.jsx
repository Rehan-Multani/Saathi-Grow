import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Card, Button, InputGroup, Image, Spinner, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { RefreshCw, Save, Upload, X, Sparkles, Plus, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import ImageCropperModal from '../../../../common/components/ImageCropperModal';
import { useVendor } from '../../contexts/VendorContext';
import { getCategories } from '../../../admin/api/categoryApi';
import { getSubCategories } from '../../../admin/api/subcategoryApi';
import { getBrands } from '../../../admin/api/brandApi';
import { updateVendorProduct, getVendorAISuggestions } from '../../api/vendorProductApi';
import { toast } from 'react-toastify';

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { vendor, products, fetchProducts } = useVendor();

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
        status: '',
        isSaathiGrow: false,
        variants: []
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [tagInput, setTagInput] = useState('');

    // Load Product Data
    useEffect(() => {
        const product = products.find(p => p._id === productId);
        if (product) {
            setFormData({
                name: product.name || '',
                category: product.category || '',
                subCategory: product.subCategory || '',
                brandName: product.brandName || '',
                basePrice: product.basePrice || '',
                mrp: product.mrp || '',
                isVeg: product.isVeg !== undefined ? product.isVeg : true,
                unitType: product.unitType || 'pcs',
                unitValue: product.unitValue || 1,
                physicalLocation: product.physicalLocation || '',
                description: product.description || '',
                sku: product.sku || '',
                tags: product.tags || [],
                stock: product.stock || 0,
                lowStockThreshold: product.lowStockThreshold || 10,
                status: product.status || '',
                isSaathiGrow: product.isSaathiGrow || false,
                variants: product.variants || []
            });
            setImagePreview(product.image);
            setGalleryPreviews(product.gallery || []);
        }
    }, [productId, products]);

    // Fetch Initial Supporting Data
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
                toast.error('Failed to load supporting data');
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
        } else {
            setFilteredBrands([]);
            setFilteredSubCategories([]);
        }
    }, [formData.category, brands, subCategories]);

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
        if (files.length + galleryFiles.length + galleryPreviews.length > 10) {
            return toast.warning('Maximum 10 gallery images allowed');
        }
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setGalleryPreviews(prev => [...prev, ...newPreviews]);
        setGalleryFiles(prev => [...prev, ...files]);
    };

    const removeGalleryImage = (index) => {
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        // Need to be careful here if we are removing existing vs newly uploaded
        // For simplicity in edit, let's just reset the whole gallery if they change it
        // Or handle it properly by tracking indices. 
        // For this task, match admin behavior: gallery is replaced if new files added or items removed.
        const isNewFileIndex = index >= (formData.gallery?.length || 0);
        if (isNewFileIndex) {
            const actualIndex = index - (formData.gallery?.length || 0);
            setGalleryFiles(prev => prev.filter((_, i) => i !== actualIndex));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
        if (!formData.name) return toast.warning('Please enter a product name first');
        setAiLoading(prev => ({ ...prev, [type]: true }));
        try {
            const data = await getVendorAISuggestions(vendor.token, formData.name, type);
            if (type === 'description') {
                setFormData(prev => ({ ...prev, description: data.suggestion }));
            } else {
                const newTags = data.suggestion.split(',').map(t => t.trim()).filter(t => t);
                setFormData(prev => ({ ...prev, tags: [...new Set([...prev.tags, ...newTags])] }));
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setAiLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Brand is only required if brands exist for the selected category
        const isBrandRequired = formData.category && filteredBrands.length > 0;

        if (!formData.name || !formData.category || (isBrandRequired && !formData.brandName) || !formData.basePrice) {
            return toast.error('Please fill all required fields');
        }
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'tags') data.append(key, formData.tags.join(','));
                else if (key === 'variants') data.append(key, JSON.stringify(formData.variants));
                else data.append(key, formData[key]);
            });

            if (imageFile) data.append('image', imageFile);

            // Send existing gallery image URLs that were NOT removed
            const existingGallery = galleryPreviews.filter(p => typeof p === 'string' && p.startsWith('http'));
            data.append('existingGallery', JSON.stringify(existingGallery));

            // Send new gallery files
            if (galleryFiles.length > 0) {
                galleryFiles.forEach(file => data.append('gallery', file));
            }

            await updateVendorProduct(vendor.token, productId, data);
            await fetchProducts();
            toast.success('Product updated successfully!');
            navigate('/vendor/products');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" variant="success" /></div>;

    return (
        <div className="p-3 bg-white min-vh-100 overflow-x-hidden">
            <div className="flex items-center gap-3 mb-4">
                <button onClick={() => navigate('/vendor/products')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={18} className="text-gray-600" />
                </button>
                <h4 className="mb-0 fw-bold">Edit Product</h4>
            </div>

            <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="mb-3 fw-bold">General Information</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold text-gray-600">Product Name</Form.Label>
                                    <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required className="text-xs" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <Form.Label className="mb-0 small fw-semibold text-gray-600">Description</Form.Label>
                                        <Button variant="link" size="sm" onClick={() => handleAISuggestion('description')} disabled={aiLoading.description} className="text-success p-0 d-flex align-items-center gap-1">
                                            {aiLoading.description ? <Spinner size="sm" /> : <Sparkles size={14} />} AI Write
                                        </Button>
                                    </div>
                                    <Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleChange} required className="text-xs" />
                                </Form.Group>

                                <h6 className="mb-3 fw-bold mt-4">Pricing & Units</h6>
                                <Row className="align-items-end g-2">
                                    <Col md={3}><Form.Group className="mb-3"><Form.Label className="small">Price (₹)</Form.Label><Form.Control type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} required className="text-xs fw-bold" /></Form.Group></Col>
                                    <Col md={3}><Form.Group className="mb-3"><Form.Label className="small">MRP (₹)</Form.Label><Form.Control type="number" name="mrp" value={formData.mrp} onChange={handleChange} className="text-xs text-muted" /></Form.Group></Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small">Unit Type</Form.Label>
                                            <Form.Select name="unitType" value={formData.unitType} onChange={handleChange} className="text-xs">
                                                <option value="pcs">Pcs</option><option value="kg">Kg</option><option value="gm">Gm</option><option value="ml">Ml</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small">Stock</Form.Label>
                                            <Form.Control type="number" name="stock" value={formData.stock} onChange={handleChange} required className="text-xs fw-bold" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small">Alert At</Form.Label>
                                            <Form.Control type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} className="text-xs" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <div className="d-flex gap-1 mb-3">
                                            <Button variant={formData.isVeg ? "success" : "outline-success"} size="sm" className="flex-fill text-[9px] font-bold" onClick={() => setFormData({ ...formData, isVeg: true })}>VEG</Button>
                                            <Button variant={!formData.isVeg ? "danger" : "outline-danger"} size="sm" className="flex-fill text-[9px] font-bold" onClick={() => setFormData({ ...formData, isVeg: false })}>NON-VEG</Button>
                                        </div>
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
                                    <Form.Label className="small">Category</Form.Label>
                                    <Form.Select name="category" value={formData.category} onChange={handleChange} required className="text-xs">
                                        <option value="">Select...</option>
                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small">Subcategory</Form.Label>
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
                                        Brand {formData.category && filteredBrands.length > 0 && <span className="text-danger">*</span>}
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
                                            <span>No brands found in "{formData.category}". You can skip this.</span>
                                        </div>
                                    )}
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small">SKU</Form.Label>
                                    <Form.Control readOnly value={formData.sku} className="bg-light text-xs font-mono" />
                                </Form.Group>
                                {formData.sku && <div className="text-center mt-2 p-2 bg-white border rounded"><QRCodeSVG value={formData.sku} size={100} /></div>}
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="mb-3 fw-bold">Media</h6>
                                <div className="text-center mb-3 p-3 border-2 border-dashed rounded bg-gray-50 position-relative group mx-auto" style={{ maxWidth: '200px' }}>
                                    {imagePreview ? <Image src={imagePreview} fluid rounded className="max-h-32" /> : <Upload size={24} className="text-gray-300" />}
                                    <Form.Control type="file" className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                                </div>
                                <div className="d-flex flex-wrap gap-2 mt-3">
                                    {galleryPreviews.map((p, i) => (
                                        <div key={i} className="position-relative" style={{ width: '50px', height: '50px' }}>
                                            <Image src={p} thumbnail className="w-100 h-100 object-cover" />
                                            <Button variant="danger" size="sm" className="position-absolute top-0 end-0 p-0 rounded-circle" style={{ width: '16px', height: '16px', marginTop: '-5px', marginRight: '-5px' }} onClick={() => removeGalleryImage(i)}>
                                                <X size={10} />
                                            </Button>
                                        </div>
                                    ))}
                                    {galleryPreviews.length < 10 && <div className="border border-dashed rounded flex items-center justify-center cursor-pointer text-gray-300" style={{ width: '50px', height: '50px' }} onClick={() => document.getElementById('edit-gallery-input').click()}><Plus size={16} /></div>}
                                </div>
                                <Form.Control id="edit-gallery-input" type="file" multiple accept="image/*" className="d-none" onChange={handleGalleryChange} />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <div className="d-flex justify-content-end gap-3 pt-4 border-t">
                    <Button variant="light" size="sm" className="px-5 font-bold" onClick={() => navigate('/vendor/products')}>Discard</Button>
                    <button type="submit" disabled={loading} className="px-8 py-2 bg-[#0c831f] text-white rounded-lg font-bold shadow-sm flex items-center gap-2">
                        {loading ? <Spinner size="sm" /> : <Save size={18} />} Update Product
                    </button>
                </div>
            </Form>

            <ImageCropperModal show={showCropper} imageSrc={tempImage} onCancel={() => setShowCropper(false)} onCropComplete={handleCropComplete} aspect={1} />
        </div>
    );
};

export default EditProduct;

