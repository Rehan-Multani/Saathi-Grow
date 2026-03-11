import React, { useState } from 'react';
import { Card, Table, Button, Form, Badge } from 'react-bootstrap';
import { Star, Download, TrendingUp, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import VendorPerformanceModal from './VendorPerformanceModal';

const VENDOR_DATA = [
    { id: 'VEN-2023001', name: 'Fresh Farms & Co.', products: 45, sales: '₹15,430', rating: 4.8, status: 'Active' },
    { id: 'VEN-2023002', name: 'Organic Spices Ltd.', products: 120, sales: '₹8,200', rating: 4.2, status: 'Active' },
    { id: 'VEN-2023005', name: 'City Snacks Wholesale', products: 8, sales: '₹1,500', rating: 3.5, status: 'Probation' },
];

const VendorReports = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;

    const handleShowDetails = (vendor) => {
        setSelectedVendor(vendor);
        setShowModal(true);
    };

    const filteredVendors = VENDOR_DATA.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalFiltered = filteredVendors.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const paginatedVendors = filteredVendors.slice((page - 1) * limit, page * limit);

    // Reset pagination when search changes
    React.useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    return (
        <div className="p-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <h4 className="fw-bold mb-0 text-nowrap">Vendor Performance Reports</h4>
                <div className="flex-grow-1 w-100 w-sm-auto d-flex justify-content-end">
                    <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2 shadow-sm">
                        <Download size={16} /> <span className="d-none d-sm-inline">Export Report</span>
                        <span className="d-inline d-sm-none">Export</span>
                    </Button>
                </div>
            </div>

            {/* Vendor Stats Table */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-0 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <h6 className="mb-0 fw-bold">Top Performing Vendors</h6>
                    <div className="d-flex align-items-center gap-2 w-sm-auto border rounded px-2 bg-light" style={{ width: '250px' }}>
                        <Users size={16} className="text-muted" />
                        <Form.Control
                            size="sm"
                            type="search"
                            placeholder="Search Vendor..."
                            className="border-0 bg-transparent shadow-none"
                            style={{ width: '100%' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Vendor Name</th>
                                <th className="border-0 py-3">Products Listed</th>
                                <th className="border-0 py-3">Total Sales</th>
                                <th className="border-0 py-3">Rating</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedVendors.map((vendor, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">{vendor.name}</div>
                                        <div className="small text-muted">{vendor.id}</div>
                                    </td>
                                    <td>
                                        <Badge bg="light" text="dark" className="border fw-normal">
                                            {vendor.products} Items
                                        </Badge>
                                    </td>
                                    <td className="fw-bold text-success">{vendor.sales}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-1 text-warning fw-bold">
                                            <Star size={14} fill="currentColor" /> {vendor.rating}
                                        </div>
                                    </td>
                                    <td>
                                        <Badge
                                            bg={vendor.status === 'Active' ? 'success' : 'warning'}
                                            className="rounded-pill fw-normal px-3"
                                        >
                                            {vendor.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={() => handleShowDetails(vendor)}
                                        >
                                            Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>

                {/* Pagination Controls */}
                {totalFiltered > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            Showing <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> to <span className="fw-semibold text-dark">{Math.min(page * limit, totalFiltered)}</span> of <span className="fw-semibold text-dark">{totalFiltered}</span> vendors
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Button
                                variant="light"
                                className={`d-flex align-items-center justify-content-center p-2 rounded border shadow-sm ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={16} />
                            </Button>

                            <div className="d-flex align-items-center gap-1">
                                {(() => {
                                    return [...Array(totalPages)].map((_, i) => {
                                        const p = i + 1;
                                        if (p === 1 || p === totalPages || Math.abs(page - p) <= 1) {
                                            return (
                                                <Button
                                                    key={p}
                                                    variant={page === p ? 'primary' : 'light'}
                                                    className={`rounded shadow-sm ${page === p ? 'fw-bold' : 'text-secondary border'}`}
                                                    style={{ width: '36px', height: '36px', padding: 0 }}
                                                    onClick={() => setPage(p)}
                                                >
                                                    {p}
                                                </Button>
                                            );
                                        } else if (p === page - 2 || p === page + 2) {
                                            return <span key={p} className="text-muted px-1">...</span>;
                                        }
                                        return null;
                                    });
                                })()}
                            </div>

                            <Button
                                variant="light"
                                className={`d-flex align-items-center justify-content-center p-2 rounded border shadow-sm ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <VendorPerformanceModal
                show={showModal}
                onHide={() => setShowModal(false)}
                vendor={selectedVendor}
            />
        </div>
    );
};

export default VendorReports;
