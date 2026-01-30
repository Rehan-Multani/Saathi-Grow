import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, Filter, ExternalLink } from 'lucide-react';

const VENDOR_PRODUCTS_MOCK = [
    { id: 'VP-101', vendor: 'Fresh Farms Ltd', product: 'Organic Bananas', category: 'Groceries', price: '$4.50', stock: 120, status: 'Active' },
    { id: 'VP-102', vendor: 'Fresh Farms Ltd', product: 'Strawberries', category: 'Groceries', price: '$6.00', stock: 50, status: 'Active' },
    { id: 'VP-103', vendor: 'Tech World', product: 'Wireless Mouse', category: 'Electronics', price: '$25.00', stock: 10, status: 'Low Stock' },
    { id: 'VP-104', vendor: 'Urban Styles', product: 'Cotton T-Shirt', category: 'Clothing', price: '$15.00', stock: 0, status: 'Out of Stock' },
];

const VendorProducts = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = VENDOR_PRODUCTS_MOCK.filter(p =>
        p.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <h5 className="mb-0 fw-bold">Vendor Products</h5>
                    <div className="d-flex gap-2 w-100 justify-content-md-end">
                        <InputGroup style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Vendor or Product..."
                                className="border-start-0 ps-0 shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Button variant="outline-secondary" className="d-flex align-items-center gap-2">
                            <Filter size={18} /> Filters
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Product Info</th>
                                <th className="border-0 py-3">Vendor</th>
                                <th className="border-0 py-3">Category</th>
                                <th className="border-0 py-3">Price</th>
                                <th className="border-0 py-3">Stock</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <span className="fw-bold text-dark">{p.product}</span>
                                        <div className="small text-muted">{p.id}</div>
                                    </td>
                                    <td className="text-primary fw-medium">{p.vendor}</td>
                                    <td className="text-secondary">{p.category}</td>
                                    <td className="fw-bold">{p.price}</td>
                                    <td>
                                        <span className={p.stock === 0 ? 'text-danger fw-bold' : ''}>{p.stock}</span>
                                    </td>
                                    <td>
                                        <Badge bg={
                                            p.status === 'Active' ? 'success' :
                                                p.status === 'Low Stock' ? 'warning' : 'danger'
                                        } className="rounded-pill fw-normal px-3">
                                            {p.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button size="sm" variant="light" className="text-primary btn-icon-soft">
                                            <ExternalLink size={16} />
                                        </Button>
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

export default VendorProducts;
