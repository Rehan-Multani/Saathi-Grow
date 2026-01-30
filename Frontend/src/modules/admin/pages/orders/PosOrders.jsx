import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Table, Badge } from 'react-bootstrap';
import { ShoppingCart, Search, Plus, Trash2 } from 'lucide-react';

const PRODUCT_DATABASE = [
    { sku: 'PRD-001', name: 'Wireless Mouse', price: 25.00, stock: 45 },
    { sku: 'PRD-002', name: 'Mechanical Keyboard', price: 120.00, stock: 12 },
    { sku: 'PRD-003', name: 'USB-C Monitor', price: 350.00, stock: 8 },
    { sku: 'PRD-004', name: 'Laptop Stand', price: 45.50, stock: 30 },
];

const PosOrders = () => {
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleAddToCart = (product) => {
        const existing = cart.find(item => item.sku === product.sku);
        if (existing) {
            setCart(cart.map(item => item.sku === product.sku ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const handleRemoveFromCart = (sku) => {
        setCart(cart.filter(item => item.sku !== sku));
    };

    const calculateTotal = () => {
        return cart.reduce((acc, item) => acc + (item.price * item.qty), 0).toFixed(2);
    };

    return (
        <div className="p-3 h-100">
            <Row className="h-100 g-3">
                {/* Left: Product Catalog */}
                <Col lg={8} className="d-flex flex-column">
                    <Card className="border-0 shadow-sm flex-grow-1 overflow-hidden">
                        <Card.Header className="bg-white border-0 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">Select Products</h5>
                                <div className="position-relative">
                                    <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                                    <Form.Control
                                        placeholder="Search Product..."
                                        className="ps-5 rounded-pill bg-light border-0"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body className="bg-light p-3 overflow-auto" style={{ maxHeight: '75vh' }}>
                            <Row className="g-3">
                                {PRODUCT_DATABASE.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((product, idx) => (
                                    <Col md={4} sm={6} key={idx}>
                                        <Card className="border-0 shadow-sm h-100 product-card cursor-pointer" onClick={() => handleAddToCart(product)}>
                                            <div className="aspect-ratio-16-9 bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center p-4">
                                                <Package size={48} className="text-secondary opacity-50" />
                                            </div>
                                            <Card.Body>
                                                <h6 className="fw-bold text-dark mb-1">{product.name}</h6>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="text-primary fw-bold">${product.price}</span>
                                                    <Badge bg="light" text="dark" className="border">Stock: {product.stock}</Badge>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right: Cart / Billing Section */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100 d-flex flex-column">
                        <Card.Header className="bg-primary text-white py-3">
                            <div className="d-flex align-items-center gap-2">
                                <ShoppingCart size={20} />
                                <h5 className="mb-0 fw-bold">Current Bill</h5>
                            </div>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column flex-grow-1 p-0">
                            <div className="flex-grow-1 overflow-auto p-3">
                                {cart.length === 0 ? (
                                    <div className="text-center text-muted py-5">
                                        <ShoppingCart size={48} className="mb-3 opacity-25" />
                                        <p>Cart is empty. Add items to start billing.</p>
                                    </div>
                                ) : (
                                    <Table borderless size="sm" className="align-middle">
                                        <tbody>
                                            {cart.map((item, i) => (
                                                <tr key={i} className="border-bottom">
                                                    <td>
                                                        <div className="fw-medium small">{item.name}</div>
                                                        <div className="text-muted small">${item.price} x {item.qty}</div>
                                                    </td>
                                                    <td className="text-end fw-bold">
                                                        ${(item.price * item.qty).toFixed(2)}
                                                    </td>
                                                    <td className="text-end" style={{ width: '30px' }}>
                                                        <Button variant="link" className="text-danger p-0" onClick={() => handleRemoveFromCart(item.sku)}>
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </div>

                            {/* Bill Footer */}
                            <div className="bg-light p-3 border-top">
                                <div className="d-flex justify-content-between mb-2 small text-muted">
                                    <span>Subtotal</span>
                                    <span>${calculateTotal()}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2 small text-muted">
                                    <span>Tax (10%)</span>
                                    <span>${(calculateTotal() * 0.1).toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3 fw-bold fs-5 text-dark">
                                    <span>Total</span>
                                    <span>${(calculateTotal() * 1.1).toFixed(2)}</span>
                                </div>
                                <Button variant="success" className="w-100 py-2 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2" disabled={cart.length === 0}>
                                    Complete Order
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

// Start Quick fix for missing icon import
import { Package } from 'lucide-react';
// End Quick fix

export default PosOrders;
