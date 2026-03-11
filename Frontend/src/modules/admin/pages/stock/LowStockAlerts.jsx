import React, { useState, useEffect } from 'react';
import { Card, Table, Button, ProgressBar, Spinner } from 'react-bootstrap';
import { AlertTriangle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { showSuccessAlert } from '../../../../common/utils/alertUtils';
import RestockModal from '../../components/products/RestockModal';
import { getProducts } from '../../api/productApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const LowStockAlerts = () => {
    const { adminUser } = useAdminAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts(adminUser.token, { limit: 200 });
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching low stock:', error);
            toast.error('Failed to load low stock alerts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminUser?.token) fetchProducts();
    }, [adminUser]);

    // Flatten into low stock alerts list
    const alertsList = products.reduce((acc, product) => {
        if (product.branchStocks && product.branchStocks.length > 0) {
            product.branchStocks.forEach(bs => {
                if (bs.stock <= bs.lowStockThreshold) {
                    acc.push({
                        product, // Original product object for the modal
                        id: product._id,
                        name: product.name,
                        sku: product.sku,
                        branchName: bs.branchId?.name || 'Unknown',
                        current: bs.stock,
                        minLevel: bs.lowStockThreshold,
                        status: bs.stock === 0 ? 'Critical' : 'Warning'
                    });
                }
            });
        }
        return acc;
    }, []);

    const handleRestockOpen = (alertItem) => {
        setSelectedProduct(alertItem.product);
        setShowRestockModal(true);
    };

    const handleRestockSuccess = (updatedProduct) => {
        setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
        showSuccessAlert('Inventory Updated!', 'Stock has been adjusted successfully.');
    };

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4 bg-danger bg-opacity-10 py-2">
                <Card.Body className="d-flex flex-column flex-sm-row align-items-center gap-3 text-center text-sm-start">
                    <div className="bg-danger text-white p-3 rounded-circle shadow-sm">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h5 className="fw-bold text-danger mb-1">
                            {loading ? 'Scanning Inventory...' : `Action Required: ${alertsList.length} Low Stock Alerts`}
                        </h5>
                        <p className="mb-0 text-muted small">These items are below their minimum stock levels in specific branches. Restock immediately to avoid losing sales.</p>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 py-3">
                    <h5 className="mb-0 fw-bold">Low Stock Reports</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Product Info</th>
                                <th className="border-0 py-3">Branch</th>
                                <th className="border-0 py-3">Stock Level</th>
                                <th className="border-0 py-3 text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" size="sm" />
                                        <span className="ms-2">Loading data...</span>
                                    </td>
                                </tr>
                            ) : alertsList.length > 0 ? alertsList.slice((page - 1) * limit, page * limit).map((item, idx) => (
                                <tr key={`${item.id}-${idx}`}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-secondary font-bold overflow-hidden border border-gray-100 flex-shrink-0">
                                                {item.product.image ? <img src={item.product.image} alt="" className="w-full h-full object-contain p-0.5" /> : item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{item.name}</div>
                                                <div className="small text-muted font-monospace">{item.sku}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-muted fw-medium">{item.branchName}</td>
                                    <td style={{ minWidth: '200px' }}>
                                        <div className="d-flex justify-content-between mb-1 small">
                                            <span className={`fw-bold ${item.current <= item.minLevel * 0.5 ? 'text-danger' : 'text-warning'}`}>
                                                {item.current} items left
                                            </span>
                                            <span className="text-muted small">Threshold: {item.minLevel}</span>
                                        </div>
                                        <ProgressBar
                                            now={item.minLevel > 0 ? Math.min(100, (item.current / (item.minLevel * 2)) * 100) : 100}
                                            variant={item.current <= item.minLevel * 0.5 ? 'danger' : 'warning'}
                                            style={{ height: '6px' }}
                                            className="bg-light"
                                        />
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            size="sm"
                                            variant="success"
                                            className="d-flex align-items-center justify-content-center gap-2 ms-auto responsive-btn shadow-sm text-nowrap px-3"
                                            onClick={() => handleRestockOpen(item)}
                                        >
                                            <RefreshCw size={14} /> <span>Restock</span>
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        All inventory levels are healthy!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>

                {!loading && alertsList.length > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            Showing <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> to <span className="fw-semibold text-dark">{Math.min(page * limit, alertsList.length)}</span> of <span className="fw-semibold text-dark">{alertsList.length}</span> alerts
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
                                    const totalPages = Math.ceil(alertsList.length / limit);
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
                                className={`d-flex align-items-center justify-content-center p-2 rounded border shadow-sm ${page === Math.ceil(alertsList.length / limit) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setPage(p => Math.min(Math.ceil(alertsList.length / limit), p + 1))}
                                disabled={page === Math.ceil(alertsList.length / limit)}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {selectedProduct && (
                <RestockModal
                    show={showRestockModal}
                    onHide={() => {
                        setShowRestockModal(false);
                        setSelectedProduct(null);
                    }}
                    product={selectedProduct}
                    onRestockSuccess={handleRestockSuccess}
                />
            )}
        </div>
    );
};

export default LowStockAlerts;
