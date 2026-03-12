import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Image } from 'react-bootstrap';
import { Save, X, Camera, Plus, Sparkles, Store } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getCategories } from '../../api/categoryApi';
import { getBrands } from '../../api/brandApi';
import { getBranches } from '../../api/branchApi';
import { getVendors } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStaffAuth } from '../../../staff/context/StaffAuthContext';
import { useStoreManagerAuth } from '../../../store-manager/context/StoreManagerAuthContext';
import { getAISuggestions } from '../../api/productApi';
import { toast } from 'react-toastify';

const ProductEditModal = ({ show, onHide, product, onSave }) => {
    // Component for editing product details and inventory
    const adminContext = useAdminAuth();
    const staffContext = useStaffAuth();
    const managerContext = useStoreManagerAuth();

    const adminUser = adminContext?.adminUser || staffContext?.staffUser || managerContext?.managerUser || null;
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState([]);
    const [branches, setBranches] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [branchStocks, setBranchStocks] = useState([]);
    const [aiLoading, setAiLoading] = useState({ description: false, tags: false });
    const [tagInput, setTagInput] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        brandName: '',
        category: '',
        basePrice: 0,
        mrp: 0,
        isVeg: true,
        sku: '',
        status: 'Active',
        physicalLocation: '',
        unitType: 'pcs',
        unitValue: 1,
        description: '',
        tags: [],
        isSaathiGrow: false,
        stock: 0,
        lowStockThreshold: 10
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [existingGallery, setExistingGallery] = useState([]);
    const isVendorProduct = Boolean(formData.vendor);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, brandsData, branchesData, vendorsData] = await Promise.all([
                    getCategories(adminUser.token),
                    getBrands(adminUser.token),
                    getBranches(adminUser.token),
                    getVendors(adminUser.token)
                ]);
                setCategories(categoriesData.filter(c => c.status === 'Active'));
                setBrands(brandsData.filter(b => b.status === 'Active'));
                setBranches(branchesData.filter(b => b.isActive));
                setVendors(vendorsData.filter(v => v.status === 'Active'));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        if (show && adminUser?.token) fetchData();
    }, [show, adminUser]);

    useEffect(() => {
        if (product && branches.length > 0) {
            setFormData({
                name: product.name || '',
                brandName: product.brandName || '',
                category: product.category || '',
                basePrice: product.basePrice || 0,
                mrp: product.mrp || 0,
                isVeg: product.isVeg !== undefined ? product.isVeg : true,
                sku: product.sku || '',
                status: product.status || 'Active',
                physicalLocation: product.physicalLocation || '',
                unitType: product.unitType || 'pcs',
                unitValue: product.unitValue || 1,
                description: product.description || '',
                tags: product.tags || [],
                isSaathiGrow: product.isSaathiGrow || false,
                stock: product.stock || 0,
                lowStockThreshold: product.lowStockThreshold || 10
            });

            // Map existing stocks by branchId for quick lookup
            const activeStocks = [];
            if (product.branchStocks) {
                product.branchStocks.forEach(bs => {
                    const bid = bs.branchId?._id || bs.branchId;
                    activeStocks.push({
                        branchId: bid,
                        name: bs.branchId?.name || branches.find(b => b._id === bid)?.name || 'Unknown',
                        stock: bs.stock,
                        lowStockThreshold: bs.lowStockThreshold
                    });
                });
            }

            setBranchStocks(activeStocks);
            setImagePreview(product.image || null);
            setImageFile(null);
            setExistingGallery(product.gallery || []);
            setGalleryPreviews(product.gallery || []);
            setGalleryFiles([]);
        } else if (product) {
            // Initial load before branches are fetched
            setFormData({
                name: product.name || '',
                brandName: product.brandName || '',
                category: product.category || '',
                basePrice: product.basePrice || 0,
                sku: product.sku || '',
                status: product.status || 'Active',
                physicalLocation: product.physicalLocation || '',
                unitType: product.unitType || 'pcs',
                description: product.description || ''
            });
            setImagePreview(product.image || null);
        }
    }, [product, branches]);

    const handleBranchToggle = (branch) => {
        const isSelected = branchStocks.some(bs => bs.branchId === branch._id);
        if (isSelected) {
            setBranchStocks(prev => prev.filter(bs => bs.branchId !== branch._id));
        } else {
            setBranchStocks(prev => [...prev, {
                branchId: branch._id,
                name: branch.name,
                stock: 0,
                lowStockThreshold: 10
            }]);
        }
    };

    // Handle Branch Stock change
    const handleBranchStockChange = (branchId, field, value) => {
        setBranchStocks(prev => prev.map(bs =>
            bs.branchId === branchId ? { ...bs, [field]: Number(value) } : bs
        ));
    };

    useEffect(() => {
        if (formData.category && brands.length > 0) {
            const matches = brands.filter(b => b.category === formData.category);
            setFilteredBrands(matches);

            // Optional: reset brand if it doesn't match new category, 
            // but in Edit we might want to keep it if it's already set correctly
            if (formData.brandName && !matches.find(m => m.name === formData.brandName)) {
                // Only reset if we are intentionally changing category
                // This might trigger on initial load if brands aren't loaded yet, so check brands.length > 0
            }
        } else {
            setFilteredBrands([]);
        }
    }, [formData.category, brands]);
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
        if (name === 'vendor' && value) {
            setBranchStocks([]);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setGalleryPreviews(prev => [...prev, ...newPreviews]);
        setGalleryFiles(prev => [...prev, ...files]);
    };

    const removeGalleryImage = (index, isExisting) => {
        if (isExisting) {
            setExistingGallery(prev => prev.filter((_, i) => i !== index));
            setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        } else {
            const fileIndex = index - existingGallery.length;
            setGalleryFiles(prev => prev.filter((_, i) => i !== fileIndex));
            setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!product.vendor && branchStocks.length === 0) {
            return toast.error('Product must be available in at least one branch');
        }

        setLoading(true);
        try {
            const data = new FormData();

            const selectedBranchIds = branchStocks.map(bs => bs.branchId);
            const isAll = !isVendorProduct && selectedBranchIds.length === branches.length;

            Object.keys(formData).forEach(key => {
                if (key === 'tags') {
                    data.append(key, formData.tags.join(','));
                } else {
                    data.append(key, formData[key]);
                }
            });

            // Add branch selection info
            if (!isVendorProduct) {
                data.append('specificBranches', selectedBranchIds.join(','));
                data.append('isAllBranches', isAll);
                data.append('branchStocks', JSON.stringify(branchStocks));
            } else {
                data.append('specificBranches', '');
                data.append('isAllBranches', false);
                data.append('branchStocks', JSON.stringify([]));
            }

            if (imageFile) {
                data.append('image', imageFile);
            }

            if (galleryFiles.length > 0) {
                galleryFiles.forEach(file => {
                    data.append('gallery', file);
                });
            }

            // If we want to keep some existing gallery images and remove others, 
            // we should probably send the remaining existing gallery URLs as well.
            // For now, the backend logic replaces the gallery if new ones are sent.
            // Let's adjust backend to handle this better if needed, but for now 
            // we'll assume replacing with new set if provided.
            await onSave(data);
        } catch (error) {
            // Error handled in parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="product-edit-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">Edit Product</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4">
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={8}>
                            <Row className="g-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="small fw-medium text-muted">Product Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="bg-light border-0 py-2"
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-medium text-muted">Category</Form.Label>
                                        <Form.Select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="bg-light border-0 py-2"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-medium text-muted">Brand</Form.Label>
                                        <Form.Select
                                            name="brandName"
                                            value={formData.brandName}
                                            onChange={handleChange}
                                            className="bg-light border-0 py-2"
                                            required
                                            disabled={!formData.category}
                                        >
                                            <option value="">Select Brand</option>
                                            {filteredBrands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-medium text-muted">Assign Vendor (Optional)</Form.Label>
                                        <Form.Select
                                            name="vendor"
                                            value={formData.vendor}
                                            onChange={handleChange}
                                            className="bg-light border-0 py-2"
                                        >
                                            <option value="">Admin / In-house</option>
                                            {vendors.map(v => (
                                                <option key={v._id} value={v._id}>{v.storeName}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small fw-medium text-muted">Price (₹)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="basePrice"
                                            value={formData.basePrice}
                                            onChange={handleChange}
                                            className="bg-light border-0 py-2"
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small fw-medium text-muted">MRP (₹)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="mrp"
                                            value={formData.mrp}
                                            onChange={handleChange}
                                            className="bg-light border-0 py-2"
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-medium text-muted">Food Type</Form.Label>
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant={formData.isVeg ? "success" : "outline-success"}
                                                size="sm"
                                                className="flex-fill py-2 fw-bold text-[10px]"
                                                onClick={() => setFormData(prev => ({ ...prev, isVeg: true }))}
                                            >
                                                VEG
                                            </Button>
                                            <Button
                                                variant={!formData.isVeg ? "danger" : "outline-danger"}
                                                size="sm"
                                                className="flex-fill py-2 fw-bold text-[10px]"
                                                onClick={() => setFormData(prev => ({ ...prev, isVeg: false }))}
                                            >
                                                NON-VEG
                                            </Button>
                                        </div>
                                    </Form.Group>
                                </Col>

                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small fw-medium text-muted">Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="unitValue"
                                            value={formData.unitValue}
                                            onChange={handleChange}
                                            className="bg-light border-0 py-2 shadow-none"
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-medium text-muted">Unit Type</Form.Label>
                                        <Form.Select
                                            name="unitType"
                                            value={formData.unitType}
                                            onChange={handleChange}
                                            className="bg-light border-0 py-2 shadow-none"
                                        >
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

                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-medium text-muted">Status</Form.Label>
                                        <Form.Select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="bg-light border-0 py-2 shadow-none"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Draft">Draft</option>
                                            <option value="Out of Stock">Out of Stock</option>
                                            <option value="Low Stock">Low Stock</option>
                                            <option value="Pending Approval">Pending Approval</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={12}>
                                    <Form.Group className="mb-2 p-3 bg-blue-50/30 border border-blue-100 rounded-xl">
                                        <Form.Check
                                            type="checkbox"
                                            id="edit-isSaathiGrow"
                                            name="isSaathiGrow"
                                            label={
                                                <div className="ms-3">
                                                    <div className="text-xs font-black text-blue-800 uppercase tracking-wider d-flex align-items-center gap-2">
                                                        <Sparkles size={12} className="text-blue-600" />
                                                        Saathi Grow Priority Product
                                                    </div>
                                                    <div className="text-[10px] text-blue-600/70 font-medium">Prioritize this product in user listings</div>
                                                </div>
                                            }
                                            checked={formData.isSaathiGrow}
                                            onChange={handleChange}
                                            className="d-flex align-items-start"
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-medium text-muted">Physical Location</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="physicalLocation"
                                            value={formData.physicalLocation}
                                            onChange={handleChange}
                                            className="bg-light border-0 py-2 shadow-none"
                                            placeholder="e.g. Aisle 4, Shelf B"
                                        />
                                    </Form.Group>
                                </Col>

                                 <Col md={12}>
                                    <h6 className="mt-3 mb-3 fw-bold border-bottom pb-2 text-primary">Inventory Management</h6>

                                    {product?.vendor ? (
                                        <div className="p-3 bg-purple-50/30 border border-purple-100 rounded-xl mb-3">
                                            <div className="text-xs font-black text-purple-800 uppercase tracking-wider mb-3 d-flex align-items-center gap-2">
                                                <Store size={14} className="text-purple-600" />
                                                Vendor Direct Stock
                                            </div>
                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-medium text-muted">Total Stock</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="stock"
                                                            value={formData.stock}
                                                            onChange={handleChange}
                                                            className="bg-white border-purple-100 py-2"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-medium text-muted">Low Stock Threshold</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            name="lowStockThreshold"
                                                            value={formData.lowStockThreshold}
                                                            onChange={handleChange}
                                                            className="bg-white border-purple-100 py-2"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-2 bg-light rounded border mb-3">
                                                <Form.Label className="small fw-bold mb-2">Available In:</Form.Label>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {branches.map(branch => {
                                                        const isSelected = branchStocks.some(bs => bs.branchId === branch._id);
                                                        return (
                                                            <Form.Check
                                                                key={branch._id}
                                                                type="checkbox"
                                                                id={`edit-branch-${branch._id}`}
                                                                label={<span className="small">{branch.name}</span>}
                                                                checked={isSelected}
                                                                onChange={() => handleBranchToggle(branch)}
                                                                className="fw-medium"
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '10px' }}>
                                                {branchStocks.length > 0 ? (
                                                    branchStocks.map((branch) => (
                                                        <div key={branch.branchId} className="p-2 border rounded mb-2 bg-white border-start border-3 border-primary shadow-sm">
                                                            <Row className="align-items-center g-2">
                                                                <Col xs={4}>
                                                                    <div className="small fw-bold text-truncate" title={branch.name}>{branch.name}</div>
                                                                </Col>
                                                                <Col xs={4}>
                                                                    <Form.Group>
                                                                        <Form.Label className="text-[10px] text-muted mb-0 uppercase fw-bold">Current Stock</Form.Label>
                                                                        <Form.Control
                                                                            size="sm"
                                                                            type="number"
                                                                            value={branch.stock}
                                                                            onChange={(e) => handleBranchStockChange(branch.branchId, 'stock', e.target.value)}
                                                                            className="bg-light border-0 shadow-none"
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col xs={4}>
                                                                    <Form.Group>
                                                                        <Form.Label className="text-[10px] text-muted mb-0 uppercase fw-bold">Low Threshold</Form.Label>
                                                                        <Form.Control
                                                                            size="sm"
                                                                            type="number"
                                                                            value={branch.lowStockThreshold}
                                                                            onChange={(e) => handleBranchStockChange(branch.branchId, 'lowStockThreshold', e.target.value)}
                                                                            className="bg-light border-0 shadow-none"
                                                                        />
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-3 border border-dashed rounded bg-light">
                                                        <p className="text-muted mb-0 small">No branches selected.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </Col>
                            </Row>
                        </Col>

                        <Col md={4} className="border-start">
                            <Form.Label className="small fw-medium text-muted">Product Image</Form.Label>
                            <div className="text-center p-3 border border-dashed rounded bg-light position-relative">
                                {imagePreview ? (
                                    <div className="position-relative">
                                        <Image src={imagePreview} fluid rounded style={{ maxHeight: '150px' }} />
                                        <label className="position-absolute bottom-0 end-0 bg-primary text-white p-1 rounded-circle cursor-pointer shadow-sm translate-x-1/2 translate-y-1/2">
                                            <Camera size={14} />
                                            <input type="file" className="d-none" onChange={handleImageChange} accept="image/*" />
                                        </label>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer py-4 d-block">
                                        <Camera size={30} className="text-muted mb-2" />
                                        <div className="small text-muted">Update Image</div>
                                        <input type="file" className="d-none" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                )}
                            </div>

                            <div className="mt-4">
                                <Form.Group>
                                    <Form.Label className="small fw-medium text-muted">SKU Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="sku"
                                        value={formData.sku}
                                        className="bg-light border-0 py-2 font-monospace"
                                        readOnly
                                    />
                                </Form.Group>

                                <div className="text-center mt-3 p-3 bg-white border rounded shadow-sm">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Product QR</div>
                                    <div className="d-inline-block p-2 border rounded bg-white">
                                        {product?.qrCode ? (
                                            <img src={product.qrCode} alt="Product QR" style={{ width: '120px', height: '120px' }} />
                                        ) : (
                                            <QRCodeSVG value={formData.sku} size={120} level="H" />
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <Form.Label className="small fw-medium text-muted">Gallery Images</Form.Label>
                                    <div className="d-flex flex-wrap gap-2 mb-2">
                                        {galleryPreviews.map((preview, index) => (
                                            <div key={index} className="position-relative" style={{ width: '60px', height: '60px' }}>
                                                <Image src={preview} thumbnail className="w-100 h-100 object-fit-cover" />
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="position-absolute top-0 end-0 rounded-circle p-0 d-flex align-items-center justify-center"
                                                    style={{ width: '18px', height: '18px', marginTop: '-5px', marginRight: '-5px' }}
                                                    onClick={() => removeGalleryImage(index, index < existingGallery.length)}
                                                >
                                                    <X size={10} />
                                                </Button>
                                            </div>
                                        ))}
                                        <label
                                            className="border border-dashed rounded d-flex align-items-center justify-center cursor-pointer hover-bg-light text-muted"
                                            style={{ width: '60px', height: '60px' }}
                                        >
                                            <Plus size={20} />
                                            <input type="file" multiple className="d-none" onChange={handleGalleryChange} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row className="g-3 mt-1">
                        <Col md={12}>
                            <Form.Group>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <Form.Label className="small fw-medium text-muted mb-0">Description</Form.Label>
                                    <Button
                                        variant="link"
                                        className="p-0 text-primary d-flex align-items-center gap-1 text-decoration-none"
                                        onClick={() => handleAISuggestion('description')}
                                        disabled={aiLoading.description}
                                    >
                                        {aiLoading.description ? <Spinner animation="border" size="sm" /> : <Sparkles size={14} />}
                                        <span style={{ fontSize: '11px' }}>AI Write</span>
                                    </Button>
                                </div>
                                <Form.Control
                                    as="textarea" rows={3}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <Form.Label className="small fw-medium text-muted mb-0">Tags</Form.Label>
                                    <Button
                                        variant="link"
                                        className="p-0 text-primary d-flex align-items-center gap-1 text-decoration-none"
                                        onClick={() => handleAISuggestion('tags')}
                                        disabled={aiLoading.tags}
                                    >
                                        {aiLoading.tags ? <Spinner animation="border" size="sm" /> : <Sparkles size={14} />}
                                        <span style={{ fontSize: '11px' }}>AI Tags</span>
                                    </Button>
                                </div>
                                <div className="d-flex flex-wrap gap-1 mb-2">
                                    {formData.tags?.map((tag, index) => (
                                        <span key={index} className="badge rounded-pill bg-white text-dark border px-2 py-1 d-flex align-items-center gap-1">
                                            {tag}
                                            <X size={10} className="cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))} />
                                        </span>
                                    ))}
                                </div>
                                <div className="input-group input-group-sm">
                                    <input
                                        type="text"
                                        className="form-control bg-light border-0 shadow-none"
                                        placeholder="Add tag..."
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                    />
                                    <button className="btn btn-outline-secondary border-0" type="button" onClick={() => addTag()}>Add</button>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-medium" disabled={loading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-medium d-flex align-items-center gap-2" disabled={loading}>
                            {loading ? <Spinner animation="border" size="sm" /> : <Save size={18} />}
                            Update Product
                        </Button>
                    </div>
                </Form>
            </Modal.Body >
        </Modal >
    );
};
export default ProductEditModal;
