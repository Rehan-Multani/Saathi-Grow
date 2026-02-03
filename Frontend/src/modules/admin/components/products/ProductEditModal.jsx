import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Save, X } from 'lucide-react';

const ProductEditModal = ({ show, onHide, product, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: '',
        price: 0,
        stock: 0,
        sku: '',
        status: 'Active',
        location: ''
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                brand: product.brand || '',
                category: product.category || '',
                price: product.price || 0,
                stock: product.stock || 0,
                sku: product.sku || '',
                status: product.status || 'Active',
                location: product.location || ''
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...product, ...formData });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="product-edit-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">Edit Product</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4">
                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Group controlId="productName">
                                <Form.Label className="small fw-medium text-muted">Product Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2"
                                    placeholder="Enter product name"
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="productBrand">
                                <Form.Label className="small fw-medium text-muted">Brand</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2"
                                    placeholder="Brand name"
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="productCategory">
                                <Form.Label className="small fw-medium text-muted">Category</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2"
                                    placeholder="Category"
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group controlId="productPrice">
                                <Form.Label className="small fw-medium text-muted">Price (₹)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2"
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group controlId="productStock">
                                <Form.Label className="small fw-medium text-muted">Stock Quantity</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2"
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group controlId="productStatus">
                                <Form.Label className="small fw-medium text-muted">Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2 shadow-none"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Low Stock">Low Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                    <option value="Draft">Draft</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="productSku">
                                <Form.Label className="small fw-medium text-muted">SKU Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2"
                                    placeholder="SKU-XXXX"
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="productLocation">
                                <Form.Label className="small fw-medium text-muted">Storage Location</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="bg-light border-0 py-2"
                                    placeholder="e.g. Rack A1"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-medium">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 py-2 fw-medium d-flex align-items-center gap-2">
                            <Save size={18} /> Update Product
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ProductEditModal;
