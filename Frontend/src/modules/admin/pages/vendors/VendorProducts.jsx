import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Spinner, Image } from 'react-bootstrap';
import { Search, Filter, ExternalLink, X, ShoppingBag } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { getVendors } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const VendorProducts = () => {
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, vendorsData] = await Promise.all([
                    getProducts(adminUser.token),
                    getVendors(adminUser.token)
                ]);
                // Filter to only show products linked to vendors
                const vendorProds = productsData.filter(p => p.vendor);
                setProducts(vendorProds);
                setVendors(vendorsData);
            } catch (error) {
                toast.error('Failed to fetch product data');
            } finally {
                setLoading(false);
            }
        };

        if (adminUser?.token) {
            fetchData();
        }
    }, [adminUser.token]);

    const uniqueCategories = [...new Set(products.map(p => p.category))];

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.vendor?.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
        const matchesVendor = selectedVendor ? p.vendor?._id === selectedVendor : true;

        return matchesSearch && matchesCategory && matchesVendor;
    });

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedVendor('');
        setShowFilterMenu(false);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

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
                                <InputGroup className="shadow-none border border-light overflow-hidden rounded-3">
                                    <InputGroup.Text className="bg-light border-0 text-muted ps-3"><Search size={18} /></InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search products, SKU or vendor..."
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
                                                {vendors.map(v => <option key={v._id} value={v._id}>{v.storeName}</option>)}
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
                                <th className="border-0 py-3 text-center">Unit</th>
                                <th className="border-0 py-3">Price</th>
                                <th className="border-0 py-3">Stock</th>
                                <th className="border-0 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((p, idx) => {
                                const totalStock = p.branchStocks?.reduce((acc, curr) => acc + curr.stock, 0) || 0;
                                return (
                                    <tr key={idx}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-light rounded p-1 text-primary d-none d-sm-block overflow-hidden" style={{ width: '40px', height: '40px' }}>
                                                    {p.image ? (
                                                        <Image src={p.image} fluid />
                                                    ) : (
                                                        <ShoppingBag size={20} className="m-2" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{p.name}</div>
                                                    <div className="small text-muted font-monospace" style={{ fontSize: '11px' }}>{p.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                {p.vendor?.logo && <Image src={p.vendor.logo} roundedCircle width={20} height={20} />}
                                                <span className="fw-medium text-primary" style={{ fontSize: '13px' }}>{p.vendor?.storeName || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td><span className="text-secondary small fw-medium">{p.category}</span></td>
                                        <td className="text-center"><Badge bg="light" text="dark" className="border fw-normal uppercase">{p.unitType}</Badge></td>
                                        <td className="fw-bold text-dark">₹{p.basePrice}</td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span className={`fw-bold ${totalStock <= 10 ? 'text-danger' : 'text-dark'}`}>{totalStock}</span>
                                                <span className="text-muted" style={{ fontSize: '10px' }}>Total Items</span>
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
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        <div className="mb-2"><ShoppingBag size={48} className="text-light" /></div>
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

export default VendorProducts;
