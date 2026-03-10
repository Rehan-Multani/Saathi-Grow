import React, { useState, useEffect } from 'react';
import { Card, Table, Form, InputGroup, Badge, Spinner, Button } from 'react-bootstrap';
import { Search, MapPin, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const BranchStock = () => {
    const { adminUser } = useAdminAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        const fetchBranchWiseStock = async () => {
            try {
                const data = await getProducts(adminUser.token, { limit: 200 });
                setProducts(data.products || []);
            } catch (error) {
                console.error('Error fetching stock:', error);
                toast.error('Failed to load branch-wise stock');
            } finally {
                setLoading(false);
            }
        };

        if (adminUser?.token) fetchBranchWiseStock();
    }, [adminUser]);

    // Flatten products into branch-wise list
    const branchStockList = products.reduce((acc, product) => {
        if (product.branchStocks && product.branchStocks.length > 0) {
            product.branchStocks.forEach(bs => {
                acc.push({
                    productId: product._id,
                    productName: product.name,
                    image: product.image,
                    sku: product.sku,
                    isVendor: !!product.vendor,
                    vendorName: product.vendor?.storeName || '',
                    branchName: bs.branchId?.name || 'Unknown',
                    branchCode: bs.branchId?.branchCode || '',
                    location: bs.branchId?.address || 'N/A',
                    stock: bs.stock,
                    threshold: bs.lowStockThreshold,
                    status: bs.stock === 0 ? 'Out of Stock' : bs.stock <= bs.lowStockThreshold ? 'Low Stock' : 'In Stock'
                });
            });
        }
        return acc;
    }, []);

    const filtered = branchStockList.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const paginatedItems = filtered.slice((page - 1) * limit, page * limit);

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <h5 className="mb-0 fw-bold">Branch-wise Stock</h5>
                    <InputGroup style={{ maxWidth: '300px' }}>
                        <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                        <Form.Control
                            placeholder="Search Branch or Product..."
                            className="border-start-0 ps-0 shadow-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Branch</th>
                                <th className="border-0 py-3">Product</th>
                                <th className="border-0 py-3 text-center">Current Stock</th>
                                <th className="border-0 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" size="sm" />
                                        <span className="ms-2">Loading stock data...</span>
                                    </td>
                                </tr>
                            ) : paginatedItems.length > 0 ? paginatedItems.map((row, idx) => (
                                <tr key={`${row.productId}-${idx}`}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <MapPin size={16} className="text-primary" />
                                            <div>
                                                <div className="fw-medium text-dark">{row.branchName}</div>
                                                <div className="small text-muted">{row.branchCode}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-secondary font-bold overflow-hidden border border-gray-100">
                                                {row.image ? <img src={row.image} alt="" className="w-full h-full object-contain p-0.5" /> : row.productName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-medium text-dark">{row.productName}</div>
                                                <div className="small text-muted font-monospace">{row.sku}</div>
                                                {row.isVendor && (
                                                    <div className="small text-purple-600 fw-bold">🏪 {row.vendorName}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className={`fw-bold ${row.stock <= row.threshold ? 'text-danger' : 'text-dark'}`}>
                                            {row.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <Badge bg={
                                            row.status === 'In Stock' ? 'success' :
                                                row.status === 'Low Stock' ? 'warning' : 'danger'
                                        } className="rounded-pill fw-normal px-3">
                                            {row.status}
                                        </Badge>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">No stock data found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>

                {/* Pagination Controls */}
                {!loading && totalFiltered > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            Showing <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> to <span className="fw-semibold text-dark">{Math.min(page * limit, totalFiltered)}</span> of <span className="fw-semibold text-dark">{totalFiltered}</span> items
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
                                {[...Array(totalPages)].map((_, i) => {
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
                                })}
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
        </div>
    );
};

export default BranchStock;
