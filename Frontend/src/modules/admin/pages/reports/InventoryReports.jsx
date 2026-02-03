import React, { useState } from 'react';
import { Card, Table, Button, Form, ProgressBar, Badge, InputGroup } from 'react-bootstrap';
import { Download, AlertTriangle, CheckCircle, Search, Filter, X, ShoppingBag } from 'lucide-react';

const INVENTORY_DATA = [
    { id: 'PROD-001', name: 'Fresh Apples (Kashmir)', category: 'Fruits', vendor: 'Fresh Farms Ltd', stock: 150, reorderLevel: 50, status: 'In Stock' },
    { id: 'PROD-002', name: 'Almond Milk 1L', category: 'Dairy', vendor: 'Heritage Dairy', stock: 12, reorderLevel: 20, status: 'Low Stock' },
    { id: 'PROD-003', name: 'Whole Wheat Bread', category: 'Bakery', vendor: 'Urban Styles', stock: 0, reorderLevel: 10, status: 'Out of Stock' },
    { id: 'PROD-004', name: 'Organic Honey 500g', category: 'Groceries', vendor: 'Fresh Farms Ltd', stock: 85, reorderLevel: 15, status: 'In Stock' },
];

const InventoryReports = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const uniqueCategories = [...new Set(INVENTORY_DATA.map(i => i.category))];
    const uniqueVendors = [...new Set(INVENTORY_DATA.map(i => i.vendor))];

    const filteredInventory = INVENTORY_DATA.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
        const matchesVendor = selectedVendor ? item.vendor === selectedVendor : true;
        return matchesSearch && matchesCategory && matchesVendor;
    });

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedVendor('');
        setShowFilterMenu(false);
    };

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary d-none d-md-flex">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1 text-dark">Inventory Reports</h4>
                        <p className="text-muted small mb-0 d-none d-sm-block">Monitor stock levels, reorder points, and vendor performance.</p>
                    </div>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-lg-auto">
                    <Button variant="outline-danger" size="sm" className="d-flex align-items-center gap-2 shadow-sm flex-grow-1 flex-sm-grow-0 justify-content-center px-3">
                        <AlertTriangle size={16} /> <span>Low Stock (14)</span>
                    </Button>
                    <Button variant="primary" size="sm" className="d-flex align-items-center gap-2 shadow-sm flex-grow-1 flex-sm-grow-0 justify-content-center px-4">
                        <Download size={16} /> <span>Export Report</span>
                    </Button>
                </div>
            </div>

            {/* Inventory Table */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-0">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <h6 className="mb-0 fw-bold">Current Stock Levels</h6>
                        <div className="d-flex flex-column flex-sm-row gap-3 w-100 w-md-auto align-items-stretch">
                            <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                                <InputGroup className="bg-light rounded-3 overflow-hidden border-0">
                                    <InputGroup.Text className="bg-light border-0 text-muted ps-3">
                                        <Search size={18} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search by product name or ID..."
                                        className="bg-light border-0 ps-1 py-2 shadow-none font-small"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </div>

                            <div className="position-relative">
                                <Button
                                    size="sm"
                                    variant={selectedCategory || selectedVendor ? "primary" : "outline-secondary"}
                                    className="d-flex align-items-center justify-content-center gap-2 h-100 px-3 shadow-none border no-hover-effect"
                                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                                >
                                    <Filter size={18} />
                                    <span>Filter</span>
                                    {(selectedCategory || selectedVendor) && (
                                        <Badge bg="white" text="primary" pill className="ms-1 small">!</Badge>
                                    )}
                                </Button>

                                {showFilterMenu && (
                                    <div className="position-absolute end-0 mt-2 bg-white shadow-xl border rounded-3 p-3 animate-in fade-in slide-in-from-top-2 duration-200"
                                        style={{
                                            width: '280px',
                                            zIndex: 1100,
                                            right: '0'
                                        }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0 fw-bold small text-uppercase text-muted letter-spacing-wider">Filter Reports</h6>
                                            <Button variant="link" className="p-0 text-muted" onClick={() => setShowFilterMenu(false)}>
                                                <X size={18} />
                                            </Button>
                                        </div>

                                        <div className="mb-3">
                                            <Form.Label className="small fw-bold text-muted text-uppercase mb-1">By Category</Form.Label>
                                            <Form.Select
                                                size="sm"
                                                className="bg-light border-0 py-2 shadow-none"
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                            >
                                                <option value="">All Categories</option>
                                                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </Form.Select>
                                        </div>

                                        <div className="mb-3">
                                            <Form.Label className="small fw-bold text-muted text-uppercase mb-1">By Vendor</Form.Label>
                                            <Form.Select
                                                size="sm"
                                                className="bg-light border-0 py-2 shadow-none"
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
                                                className="w-100 p-0 text-danger small text-decoration-none border-top pt-2 mt-2"
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
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Product</th>
                                <th className="border-0 py-3">Vendor</th>
                                <th className="border-0 py-3">Category</th>
                                <th className="border-0 py-3" style={{ width: '200px' }}>Stock Level</th>
                                <th className="border-0 py-3 text-center">Reorder Point</th>
                                <th className="border-0 py-3 text-end pe-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">{item.name}</div>
                                        <div className="small text-muted">{item.id}</div>
                                    </td>
                                    <td>
                                        <Badge bg="info" className="bg-opacity-10 text-info fw-medium border border-info border-opacity-25 px-2 py-1">
                                            {item.vendor}
                                        </Badge>
                                    </td>
                                    <td><span className="text-secondary small fw-medium">{item.category}</span></td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <ProgressBar
                                                now={item.stock}
                                                max={200}
                                                variant={item.stock < item.reorderLevel ? 'danger' : item.stock < item.reorderLevel * 2 ? 'warning' : 'success'}
                                                style={{ height: '6px', width: '100px' }}
                                                className="rounded-pill shadow-none"
                                            />
                                            <span className="small fw-bold">{item.stock}</span>
                                        </div>
                                    </td>
                                    <td className="text-center text-muted small">{item.reorderLevel} units</td>
                                    <td className="text-end pe-4">
                                        <Badge
                                            bg={item.status === 'In Stock' ? 'success' : item.status === 'Low Stock' ? 'warning' : 'danger'}
                                            className="rounded-pill fw-normal px-3 py-1 shadow-sm"
                                        >
                                            {item.status}
                                        </Badge>
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

export default InventoryReports;
