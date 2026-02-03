import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, Filter, ExternalLink, X } from 'lucide-react';

const VENDOR_PRODUCTS_MOCK = [
    { id: 'VP-101', vendor: 'Fresh Farms Ltd', product: 'Organic Bananas', category: 'Groceries', price: '₹4.50', stock: 120, status: 'Active' },
    { id: 'VP-102', vendor: 'Fresh Farms Ltd', product: 'Strawberries', category: 'Groceries', price: '₹6.00', stock: 50, status: 'Active' },
    { id: 'VP-103', vendor: 'Tech World', product: 'Wireless Mouse', category: 'Electronics', price: '₹25.00', stock: 10, status: 'Low Stock' },
    { id: 'VP-104', vendor: 'Urban Styles', product: 'Cotton T-Shirt', category: 'Clothing', price: '₹15.00', stock: 0, status: 'Out of Stock' },
];

const VendorProducts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');

    const uniqueCategories = [...new Set(VENDOR_PRODUCTS_MOCK.map(p => p.category))];
    const uniqueVendors = [...new Set(VENDOR_PRODUCTS_MOCK.map(p => p.vendor))];

    const filtered = VENDOR_PRODUCTS_MOCK.filter(p => {
        const matchesSearch = p.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
        const matchesVendor = selectedVendor ? p.vendor === selectedVendor : true;

        return matchesSearch && matchesCategory && matchesVendor;
    });

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedVendor('');
        setShowFilterMenu(false);
    };

    return (
        <div className="p-2 p-md-4">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="py-3 py-md-4">
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary d-none d-md-flex">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <h4 className="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
                                    Vendor Inventory
                                    <Badge bg="primary" pill className="fs-xs fw-normal py-1 px-2">{filtered.length}</Badge>
                                </h4>
                                <p className="text-muted small mb-0 d-none d-sm-block">Manage and track inventory received from all verified vendors.</p>
                            </div>
                        </div>

                        <div className="d-flex flex-column flex-md-row gap-2 gap-md-3 w-100 w-lg-auto align-items-stretch align-items-md-center">
                            <div className="flex-grow-1" style={{ maxWidth: '450px' }}>
                                <InputGroup className="shadow-none border-0 overflow-hidden rounded-3">
                                    <InputGroup.Text className="bg-light border-0 text-muted ps-3"><Search size={18} /></InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search products by name, ID or vendor..."
                                        className="bg-light border-0 ps-1 py-2 shadow-none font-small"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </div>

                            <div className="position-relative">
                                <Button
                                    variant={selectedCategory || selectedVendor ? "primary" : "outline-secondary"}
                                    className="d-flex align-items-center justify-content-center gap-2 h-100 w-100"
                                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                                >
                                    <Filter size={18} />
                                    <span>Filter</span>
                                    {(selectedCategory || selectedVendor) && (
                                        <Badge bg="white" text="primary" pill className="ms-1">!</Badge>
                                    )}
                                </Button>

                                {showFilterMenu && (
                                    <div className="position-absolute end-0 mt-2 bg-white shadow-xl border rounded-lg p-3 z-3 animate-in fade-in slide-in-from-top-2 duration-200" style={{ width: '280px', zIndex: 1050 }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0 fw-bold">Filter Products</h6>
                                            <Button variant="link" className="p-0 text-muted" onClick={() => setShowFilterMenu(false)}>
                                                <X size={18} />
                                            </Button>
                                        </div>

                                        <div className="mb-3">
                                            <Form.Label className="small fw-bold text-muted text-uppercase">By Category</Form.Label>
                                            <Form.Select
                                                size="sm"
                                                className="bg-light border-0"
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                            >
                                                <option value="">All Categories</option>
                                                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </Form.Select>
                                        </div>

                                        <div className="mb-3">
                                            <Form.Label className="small fw-bold text-muted text-uppercase">By Vendor</Form.Label>
                                            <Form.Select
                                                size="sm"
                                                className="bg-light border-0"
                                                value={selectedVendor}
                                                onChange={(e) => setSelectedVendor(e.target.value)}
                                            >
                                                <option value="">All Vendors</option>
                                                {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
                                            </Form.Select>
                                        </div>

                                        {(selectedCategory || selectedVendor) && (
                                            <Button
                                                variant="link"
                                                className="w-100 p-0 text-danger small text-decoration-none"
                                                onClick={clearFilters}
                                            >
                                                Clear All Filters
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm overflow-hidden">
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
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((p, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 py-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light rounded p-2 text-primary d-none d-sm-block">
                                                <ShoppingBag size={20} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{p.product}</div>
                                                <div className="small text-muted">{p.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg="info" className="bg-opacity-10 text-info fw-medium px-2 py-1 border border-info border-opacity-25">
                                            {p.vendor}
                                        </Badge>
                                    </td>
                                    <td><span className="text-secondary small fw-medium">{p.category}</span></td>
                                    <td className="fw-bold text-dark">{p.price}</td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <span className={`fw-bold ${p.stock <= 10 ? 'text-danger' : 'text-dark'}`}>{p.stock}</span>
                                            <span className="text-muted" style={{ fontSize: '10px' }}>In Hand</span>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={
                                            p.status === 'Active' ? 'success' :
                                                p.status === 'Low Stock' ? 'warning' : 'danger'
                                        } className="rounded-pill fw-normal px-3 py-1">
                                            {p.status}
                                        </Badge>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        No products found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

// Helper Icon for table
const ShoppingBag = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
);

export default VendorProducts;
