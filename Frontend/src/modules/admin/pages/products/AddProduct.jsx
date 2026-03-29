import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Card, Button, InputGroup, Image, Spinner, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { RefreshCw, Save, Upload, X, Sparkles, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import ImageCropperModal from '../../../../common/components/ImageCropperModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getCategories } from '../../api/categoryApi';
import { getSubCategories } from '../../api/subcategoryApi';
import { getBrands } from '../../api/brandApi';
import { getBranches } from '../../api/branchApi';
import { getVendors } from '../../api/vendorApi';
import { createProduct, getAISuggestions } from '../../api/productApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const AddProduct = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState({ description: false, tags: false });

    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState([]);

    const [branches, setBranches] = useState([]);
    const [vendors, setVendors] = useState([]);

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
        isAllBranches: true,
        specificBranches: [],
        sku: '',
        tags: [],
        status: 'Active',
        vendor: '',
        isSaathiGrow: false,
        stock: '',
        lowStockThreshold: 10
    });

    const [branchStocks, setBranchStocks] = useState([]); // Array of { branchId, name, stock, lowStockThreshold }

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [tagInput, setTagInput] = useState('');
    const isVendorProduct = Boolean(formData.vendor);

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, subCategoriesData, brandsData, branchesData, vendorsData] = await Promise.all([
                    getCategories(adminUser.token),
                    getSubCategories(adminUser.token),
                    getBrands(adminUser.token),
                    getBranches(adminUser.token),
                    getVendors(adminUser.token)
                ]);
                setCategories(categoriesData.filter(c => c.status === 'Active'));
                setSubCategories(subCategoriesData.filter(sc => sc.status === 'Active'));
                setBrands(brandsData.filter(b => b.status === 'Active'));
                setBranches(branchesData.filter(b => b.isActive));
                setVendors(vendorsData.filter(v => v.status === 'Active'));

                // We don't initialize branchStocks here anymore, let user select
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error(t('common.error'));
            } finally {
                setInitialLoading(false);
            }
        };

        if (adminUser?.token) {
            fetchData();
        }
    }, [adminUser.token, t]);

    useEffect(() => {
        if (formData.vendor) {
            setBranchStocks([]);
            setFormData(prev => ({
                ...prev,
                specificBranches: []
            }));
        }
    }, [formData.vendor]);

    const handleBranchToggle = (branch) => {
        const isSelected = branchStocks.some(bs => bs.branchId === branch._id);
        if (isSelected) {
            setBranchStocks(prev => prev.filter(bs => bs.branchId !== branch._id));
            setFormData(prev => ({
                ...prev,
                specificBranches: prev.specificBranches.filter(id => id !== branch._id)
            }));
        } else {
            setBranchStocks(prev => [...prev, {
                branchId: branch._id,
                name: branch.name,
                stock: 0,
                lowStockThreshold: 10
            }]);
            setFormData(prev => ({
                ...prev,
                specificBranches: [...prev.specificBranches, branch._id]
            }));
        }
    };

    // Handle Branch Stock change
    const handleBranchStockChange = (branchId, field, value) => {
        setBranchStocks(prev => prev.map(bs =>
            bs.branchId === branchId ? { ...bs, [field]: Number(value) } : bs
        ));
    };

    // Filter Brands & SubCategories when category changes
    useEffect(() => {
        if (formData.category) {
            // Filter Brands
            const brandMatches = brands.filter(b => b.category === formData.category);
            setFilteredBrands(brandMatches);
            if (!brandMatches.find(m => m.name === formData.brandName)) {
                setFormData(prev => ({ ...prev, brandName: '' }));
            }

            // Filter SubCategories
            const subCatMatches = subCategories.filter(sc => sc.categoryName === formData.category || sc.category?.name === formData.category);
            setFilteredSubCategories(subCatMatches);
            if (!subCatMatches.find(m => m.name === formData.subCategory)) {
                setFormData(prev => ({ ...prev, subCategory: '' }));
            }
        } else {
            setFilteredBrands([]);
            setFilteredSubCategories([]);
            setFormData(prev => ({ ...prev, brandName: '', subCategory: '' }));
        }
    }, [formData.category, brands, subCategories, formData.brandName, formData.subCategory]);

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
    }, [formData.name, formData.category, formData.sku]);

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

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + galleryFiles.length > 10) {
            return toast.warning(t('products.gallery_limit_warning', { defaultValue: 'Maximum 10 gallery images allowed' }));
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
            [name]: type === 'checkbox'
                ? checked
                : (['basePrice', 'mrp', 'unitValue', 'stock', 'lowStockThreshold'].includes(name)
                    ? (value === '' ? '' : Number(value))
                    : value)
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
            return toast.warning(t('products.alerts.name_required'));
        }

        setAiLoading(prev => ({ ...prev, [type]: true }));
        try {
            const data = await getAISuggestions(adminUser.token, formData.name, type);
            if (type === 'description') {
                setFormData(prev => ({ ...prev, description: data.suggestion }));
                toast.success(t('products.alerts.description_gen'));
            } else if (type === 'tags') {
                const newTags = data.suggestion.split(',').map(t => t.trim()).filter(t => t);
                setFormData(prev => ({
                    ...prev,
                    tags: [...new Set([...prev.tags, ...newTags])]
                }));
                toast.success(t('products.alerts.tags_gen'));
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
            return toast.error(t('products.alerts.fill_required'));
        }

        if (!isVendorProduct && branchStocks.length === 0) {
            return toast.error(t('products.alerts.select_branch'));
        }

        setLoading(true);
        try {
            const data = new FormData();

            // Fixed handling of isAllBranches based on user request
            const isAll = !isVendorProduct && formData.specificBranches.length === branches.length;

            Object.keys(formData).forEach(key => {
                if (key === 'tags') {
                    data.append(key, formData.tags.join(','));
                } else if (key === 'specificBranches') {
                    data.append(key, formData.specificBranches.join(','));
                } else if (key === 'isAllBranches') {
                    data.append(key, isAll);
                } else {
                    data.append(key, formData[key]);
                }
            });

            // Append branch stocks as stringified JSON (only for branch products)
            if (!isVendorProduct) {
                data.append('branchStocks', JSON.stringify(branchStocks));
            } else {
                data.append('branchStocks', JSON.stringify([]));
                data.append('specificBranches', '');
                data.append('isAllBranches', false);
            }

            if (imageFile) {
                data.append('image', imageFile);
            }

            if (galleryFiles.length > 0) {
                galleryFiles.forEach(file => {
                    data.append('gallery', file);
                });
            }

            await createProduct(adminUser.token, data);
            toast.success(t('products.alerts.create_success'));
            navigate('/admin/products');
        } catch (error) {
            toast.error(error.message || t('products.alerts.create_failed'));
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
            <div className="d-flex align-items-center gap-2 mb-4">
                <h4 className="mb-0 fw-bold">{t('products.add_title')}</h4>
                <PageInfoTooltip info={pageInfoData.addProduct} />
            </div>

            <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="mb-3 fw-bold">{t('products.sections.general')}</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('products.form.name')} <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder={t('products.form.placeholder.name')}
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <Form.Label className="mb-0">{t('products.form.description')} <span className="text-danger">*</span></Form.Label>
                                        <OverlayTrigger overlay={<Tooltip>{t('products.alerts.ai_suggest_title', { defaultValue: 'Generate with AI' })}</Tooltip>}>
                                            <Button
                                                variant="link"
                                                className="p-0 text-primary d-flex align-items-center gap-1 text-decoration-none"
                                                onClick={() => handleAISuggestion('description')}
                                                disabled={aiLoading.description}
                                            >
                                                {aiLoading.description ? <Spinner animation="border" size="sm" /> : <Sparkles size={16} />}
                                                <small>{t('products.edit_modal.ai_write')}</small>
                                            </Button>
                                        </OverlayTrigger>
                                    </div>
                                    <Form.Control
                                        as="textarea" rows={4}
                                        placeholder={t('products.form.placeholder.description')}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <Form.Label className="mb-0">{t('products.form.tags')}</Form.Label>
                                        <OverlayTrigger overlay={<Tooltip>{t('products.alerts.ai_suggest_tags', { defaultValue: 'Suggest tags with AI' })}</Tooltip>}>
                                            <Button
                                                variant="link"
                                                className="p-0 text-primary d-flex align-items-center gap-1 text-decoration-none"
                                                onClick={() => handleAISuggestion('tags')}
                                                disabled={aiLoading.tags}
                                            >
                                                {aiLoading.tags ? <Spinner animation="border" size="sm" /> : <Sparkles size={16} />}
                                                <small>{t('products.edit_modal.ai_tags')}</small>
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
                                            placeholder={t('products.form.placeholder.tag_input')}
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                        />
                                        <Button variant="outline-secondary" onClick={(e) => { e.preventDefault(); addTag(); }}>{t('common.add')}</Button>
                                    </InputGroup>
                                </Form.Group>

                                <h6 className="mb-3 fw-bold mt-4">{t('products.sections.pricing')}</h6>
                                <Row className="align-items-end">
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('products.form.base_price')} <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder={t('products.form.placeholder.price')}
                                                name="basePrice"
                                                value={formData.basePrice}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('products.form.mrp')}</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder={t('products.form.placeholder.price')}
                                                name="mrp"
                                                value={formData.mrp}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('products.form.unit_type')}</Form.Label>
                                            <Form.Select name="unitType" value={formData.unitType} onChange={handleChange}>
                                                <option value="pcs">Pcs</option>
                                                <option value="kg">Kg</option>
                                                <option value="gm">Gm</option>
                                                <option value="ml">Ml</option>
                                                <option value="ltr">Ltr</option>
                                                <option value="pkt">Pkt</option>
                                                <option value="box">Box</option>
                                                <option value="100g">100g</option>
                                                <option value="250g">250g</option>
                                                <option value="500g">500g</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <Form.Label className="mb-0">{t('products.form.food_type')}</Form.Label>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant={formData.isVeg ? "success" : "outline-success"}
                                                    size="sm"
                                                    className="flex-fill py-2 fw-bold text-[10px]"
                                                    onClick={() => setFormData(prev => ({ ...prev, isVeg: true }))}
                                                >
                                                    {t('products.dietary.veg')}
                                                </Button>
                                                <Button
                                                    variant={!formData.isVeg ? "danger" : "outline-danger"}
                                                    size="sm"
                                                    className="flex-fill py-2 fw-bold text-[10px]"
                                                    onClick={() => setFormData(prev => ({ ...prev, isVeg: false }))}
                                                >
                                                    {t('products.dietary.non_veg')}
                                                </Button>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('products.form.physical_location')}</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder={t('products.form.placeholder.location')}
                                                name="physicalLocation"
                                                value={formData.physicalLocation}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{t('products.form.unit_amount')}</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder={t('products.form.placeholder.unit')}
                                                name="unitValue"
                                                value={formData.unitValue}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {!isVendorProduct ? (
                                    <>
                                        <h6 className="mb-3 fw-bold mt-4 text-primary">{t('products.sections.branch_availability')}</h6>
                                        <p className="text-muted small mb-3">{t('products.sections.branch_availability_help', { defaultValue: 'Select branches where this product will be available and set initial stock.' })}</p>

                                        <div className="p-3 bg-light rounded border mb-4">
                                            <Form.Label className="fw-bold mb-3">{t('products.form.available_in')}</Form.Label>
                                            <div className="d-flex flex-wrap gap-3">
                                                {branches.map(branch => {
                                                    const isSelected = branchStocks.some(bs => bs.branchId === branch._id);
                                                    return (
                                                        <Form.Check
                                                            key={branch._id}
                                                            type="checkbox"
                                                            id={`branch-${branch._id}`}
                                                            label={branch.name}
                                                            checked={isSelected}
                                                            onChange={() => handleBranchToggle(branch)}
                                                            className="fw-medium custom-checkbox"
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {branchStocks.length > 0 ? (
                                            branchStocks.map((branch, index) => (
                                                <div key={branch.branchId} className="p-3 rounded mb-3 bg-white border shadow-sm border-start border-4 border-primary">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="fw-bold text-dark">{branch.name}</span>
                                                        <Badge bg="primary" className="fw-normal">{t('products.status.active')}</Badge>
                                                    </div>
                                                    <Row>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-2">
                                                                <Form.Label className="small fw-bold">{t('products.form.initial_stock_concentration')}</Form.Label>
                                                                <Form.Control
                                                                    type="number"
                                                                    placeholder="0"
                                                                    value={branch.stock}
                                                                    min="0"
                                                                    onChange={(e) => handleBranchStockChange(branch.branchId, 'stock', e.target.value)}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-2">
                                                                <Form.Label className="small fw-bold">{t('products.form.low_stock_warning')}</Form.Label>
                                                                <Form.Control
                                                                    type="number"
                                                                    placeholder={t('products.form.placeholder.low_stock')}
                                                                    value={branch.lowStockThreshold}
                                                                    min="0"
                                                                    onChange={(e) => handleBranchStockChange(branch.branchId, 'lowStockThreshold', e.target.value)}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 border border-dashed rounded bg-light">
                                                <p className="text-muted mb-0 small">{t('products.alerts.no_branches_selected', { defaultValue: 'No branches selected. Please select at least one branch to set stock.' })}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <h6 className="mb-3 fw-bold mt-4 text-primary">{t('products.sections.vendor_inventory')}</h6>
                                        <p className="text-muted small mb-3">{t('products.sections.vendor_inventory_help', { defaultValue: 'Set initial stock for the vendor-managed product.' })}</p>
                                        <div className="p-3 rounded mb-3 bg-white border shadow-sm border-start border-4 border-purple-500">
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small fw-bold">{t('products.form.initial_stock')}</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="0"
                                                            name="stock"
                                                            value={formData.stock}
                                                            min="0"
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="small fw-bold">{t('products.form.low_stock_warning')}</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder={t('products.form.placeholder.low_stock')}
                                                            name="lowStockThreshold"
                                                            value={formData.lowStockThreshold}
                                                            min="0"
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="mb-3 fw-bold">{t('products.sections.organization')}</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('products.form.category')} <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                                        <option value="">{t('products.form.placeholder.category')}</option>
                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>{t('products.form.subcategory', { defaultValue: 'Subcategory' })}</Form.Label>
                                    <Form.Select 
                                        name="subCategory" 
                                        value={formData.subCategory} 
                                        onChange={handleChange} 
                                        disabled={!formData.category}
                                    >
                                        <option value="">{t('products.form.placeholder.subcategory', { defaultValue: 'Select Subcategory' })}</option>
                                        {filteredSubCategories.map(sc => <option key={sc._id} value={sc.name}>{sc.name}</option>)}
                                    </Form.Select>
                                    {!formData.category && <Form.Text className="text-muted">{t('products.form.placeholder.subcat_no_cat', { defaultValue: 'Select a category first' })}</Form.Text>}
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>{t('products.form.brand')} <span className="text-danger">*</span></Form.Label>
                                    <Form.Select name="brandName" value={formData.brandName} onChange={handleChange} required disabled={!formData.category}>
                                        <option value="">{t('products.form.placeholder.brand')}</option>
                                        {filteredBrands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                    </Form.Select>
                                    {!formData.category && <Form.Text className="text-muted">{t('products.form.placeholder.brand_no_cat')}</Form.Text>}
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>{t('products.form.assign_vendor')}</Form.Label>
                                    <Form.Select name="vendor" value={formData.vendor} onChange={handleChange}>
                                        <option value="">{t('products.edit_modal.admin_inhouse')}</option>
                                        {vendors.map(v => <option key={v._id} value={v._id}>{v.storeName}</option>)}
                                    </Form.Select>
                                    <Form.Text className="text-muted small italic">{t('products.form.vendor_help')}</Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4 p-3 bg-blue-50/30 border border-blue-100 rounded-xl">
                                    <Form.Check
                                        type="checkbox"
                                        id="isSaathiGrow"
                                        name="isSaathiGrow"
                                        label={
                                            <div className="ms-3">
                                                <div className="text-xs font-black text-blue-800 uppercase tracking-wider d-flex align-items-center gap-2">
                                                    <Sparkles size={12} className="text-blue-600" />
                                                    {t('products.form.saathi_priority')}
                                                </div>
                                                <div className="text-[10px] text-blue-600/70 font-medium">{t('products.form.saathi_priority_desc')}</div>
                                            </div>
                                        }
                                        checked={formData.isSaathiGrow}
                                        onChange={handleChange}
                                        className="d-flex align-items-start"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>{t('products.form.sku')} <span className="text-danger">*</span></Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            readOnly
                                            value={formData.sku}
                                            className="bg-light"
                                            required
                                        />
                                        <Button variant="outline-secondary" onClick={handleRefreshSKU} title={t('products.alerts.regenerate_sku', { defaultValue: 'Regenerate SKU' })}>
                                            <RefreshCw size={18} />
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                {formData.sku && (
                                    <div className="text-center mt-3 p-3 bg-white border rounded shadow-sm">
                                        <div className="small fw-bold text-muted mb-2 uppercase">{t('products.form.qr_preview')}</div>
                                        <div className="d-inline-block p-2 border rounded bg-white">
                                            <QRCodeSVG
                                                value={formData.sku}
                                                size={150}
                                                level="H"
                                                includeMargin={true}
                                                imageSettings={{
                                                    src: "/favicon.ico",
                                                    x: undefined,
                                                    y: undefined,
                                                    height: 24,
                                                    width: 24,
                                                    excavate: true,
                                                }}
                                            />
                                        </div>
                                        <div className="text-xs mt-2 text-muted font-monospace">{formData.sku}</div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="mb-3 fw-bold">{t('products.sections.image')}</h6>
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
                                            <p className="small mb-0">{t('products.edit_modal.update_image')}</p>
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

                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body>
                                <h6 className="mb-3 fw-bold">{t('products.sections.gallery')}</h6>
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {galleryPreviews.map((preview, index) => (
                                        <div key={index} className="position-relative" style={{ width: '80px', height: '80px' }}>
                                            <Image src={preview} alt={`Gallery ${index}`} thumbnail className="w-100 h-100 object-fit-cover" />
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="position-absolute top-0 end-0 rounded-circle p-0 d-flex align-items-center justify-center shadow-sm"
                                                style={{ width: '20px', height: '20px', marginTop: '-8px', marginRight: '-8px' }}
                                                onClick={() => removeGalleryImage(index)}
                                            >
                                                <X size={12} />
                                            </Button>
                                        </div>
                                    ))}
                                    {galleryFiles.length < 10 && (
                                        <div
                                            className="border border-dashed rounded d-flex flex-column align-items-center justify-center cursor-pointer hover-bg-light transition-all text-muted"
                                            style={{ width: '80px', height: '80px' }}
                                            onClick={() => document.getElementById('gallery-input').click()}
                                        >
                                            <Plus size={24} />
                                            <span style={{ fontSize: '10px' }}>{t('common.add')}</span>
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
                                <p className="text-muted small mb-0 mt-2">{t('products.form.gallery_help')}</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <div className="d-flex justify-content-end gap-3 mb-5">
                    <Button variant="light" className="px-4 fw-bold" onClick={() => navigate('/admin/products')}>{t('common.cancel')}</Button>
                    <Button variant="primary" type="submit" className="px-4 fw-bold d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} />}
                        <span>{t('common.save')}</span>
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default AddProduct;
