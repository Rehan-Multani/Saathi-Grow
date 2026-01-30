import React, { useState } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup, Row, Col, Dropdown } from 'react-bootstrap';
import { Search, Plus, MoreHorizontal, Edit, Trash2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PRODUCTS_MOCK = [
    { id: '1', name: 'Premium Wireless Headset', category: 'Electronics', price: 120.00, stock: 45, sku: 'ELEC-HEAD-001', status: 'Active' },
    { id: '2', name: 'Organic Bananas (1kg)', category: 'Groceries', price: 4.50, stock: 120, sku: 'GROC-BAN-002', status: 'Active' },
    { id: '3', name: 'Cotton T-Shirt', category: 'Clothing', price: 25.00, stock: 15, sku: 'CLOTH-TSHIRT-003', status: 'Low Stock' },
    { id: '4', name: 'Gaming Laptop', category: 'Electronics', price: 1250.00, stock: 0, sku: 'ELEC-LAP-004', status: 'Out of Stock' },
];

const ProductStatusBadge = ({ status }) => {
    const variants = {
        Active: 'success',
        'Low Stock': 'warning',
        'Out of Stock': 'danger',
        Draft: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'} className="px-3 rounded-pill fw-normal">{status}</Badge>;
};

const AllProducts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showQR, setShowQR] = useState(null);

    const filteredProducts = PRODUCTS_MOCK.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <h5 className="mb-0 fw-bold">Product Inventory</h5>
                    <div className="d-flex gap-2 w-100 justify-content-md-end">
                        <InputGroup style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Name, SKU..."
                                className="border-start-0 ps-0 shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Button variant="primary" className="d-flex align-items-center gap-2">
                            <Plus size={18} /> <span className="d-none d-sm-inline">Add Product</span>
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Product Name</th>
                                <th className="border-0 py-3">Category</th>
                                <th className="border-0 py-3">SKU</th>
                                <th className="border-0 py-3">Price</th>
                                <th className="border-0 py-3">Stock</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((p, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                                {/* Placeholder for image */}
                                                <span className="fw-bold text-muted">{p.name.charAt(0)}</span>
                                            </div>
                                            <div className="d-flex flex-column">
                                                <span className="fw-medium text-dark">{p.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-muted">{p.category}</td>
                                    <td className="small text-monospace">{p.sku}</td>
                                    <td className="fw-bold text-dark">${p.price.toFixed(2)}</td>
                                    <td>
                                        <span className={p.stock === 0 ? 'text-danger fw-bold' : ''}>{p.stock}</span>
                                    </td>
                                    <td><ProductStatusBadge status={p.status} /></td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button variant="light" size="sm" className="btn-icon-soft" title="View QR" onClick={() => setShowQR(showQR === p.id ? null : p.id)}>
                                                <QrCode size={16} />
                                            </Button>
                                            <Button variant="light" size="sm" className="btn-icon-soft text-primary" title="Edit">
                                                <Edit size={16} />
                                            </Button>
                                            <Button variant="light" size="sm" className="btn-icon-soft text-danger" title="Delete">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                        {showQR === p.id && (
                                            <div className="position-absolute bg-white shadow p-3 rounded border text-center" style={{ right: '40px', zIndex: 10 }}>
                                                <QRCodeSVG value={p.sku} size={100} />
                                                <div className="small mt-2 text-muted">{p.sku}</div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AllProducts;
