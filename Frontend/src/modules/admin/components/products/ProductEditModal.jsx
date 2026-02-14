import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Image } from 'react-bootstrap';
import { Save, X, Camera } from 'lucide-react';
import { getCategories } from '../../api/categoryApi';
import { getBrands } from '../../api/brandApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const ProductEditModal = ({ show, onHide, product, onSave }) => {
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        brandName: '',
        category: '',
        basePrice: 0,
        stockQuantity: 0,
        sku: '',
        status: 'Active',
        physicalLocation: '',
        description: ''
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, brandsData] = await Promise.all([
                    getCategories(adminUser.token),
                    getBrands(adminUser.token)
                ]);
                setCategories(categoriesData);
                setBrands(brandsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        if (show && adminUser?.token) fetchData();
    }, [show, adminUser]);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                brandName: product.brandName || '',
                category: product.category || '',
                basePrice: product.basePrice || 0,
                stockQuantity: product.stockQuantity || 0,
                sku: product.sku || '',
                status: product.status || 'Active',
                physicalLocation: product.physicalLocation || '',
                description: product.description || ''
            });
            setImagePreview(product.image || null);
            setImageFile(null);
        }
    }, [product]);

    useEffect(() => {
        if (formData.category) {
            const matches = brands.filter(b => b.category === formData.category);
            setFilteredBrands(matches);
        } else {
            setFilteredBrands([]);
        }
    }, [formData.category, brands]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'basePrice' || name === 'stockQuantity' ? parseFloat(value) : value
        }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (imageFile) {
                data.append('image', imageFile);
            }
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

                                <Col md={4}>
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

                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-medium text-muted">Stock</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="stockQuantity"
                                            value={formData.stockQuantity}
                                            onChange={handleChange}
                                            className="bg-light border-0 py-2"
                                            required
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
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
                                        </Form.Select>
                                    </Form.Group>
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
                            </div>
                        </Col>
                    </Row>

                    <Form.Group className="mt-3">
                        <Form.Label className="small fw-medium text-muted">Description</Form.Label>
                        <Form.Control
                            as="textarea" rows={3}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="bg-light border-0 py-2"
                        />
                    </Form.Group>

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
            </Modal.Body>
        </Modal>
    );
};

export default ProductEditModal;
