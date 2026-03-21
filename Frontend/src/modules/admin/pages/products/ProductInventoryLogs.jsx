import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Table, Badge, Spinner, Button } from 'react-bootstrap';
import { History, ArrowUpRight, ArrowDownRight, User, Package, ChevronLeft, ChevronRight, Store, ArrowLeft } from 'lucide-react';
import { getInventoryLogs, getProductById } from '../../api/productApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStaffAuth } from '../../../staff/context/StaffAuthContext';
import { useStoreManagerAuth } from '../../../store-manager/context/StoreManagerAuthContext';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const ProductInventoryLogs = () => {
    const { id } = useParams();
    const adminContext = useAdminAuth();
    const staffContext = useStaffAuth();
    const managerContext = useStoreManagerAuth();

    const adminUser = adminContext?.adminUser || staffContext?.staffUser || managerContext?.managerUser || null;
    
    const [product, setProduct] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const limit = 15;

    const fetchProduct = useCallback(async () => {
        try {
            const data = await getProductById(adminUser.token, id);
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product details');
        }
    }, [adminUser.token, id]);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getInventoryLogs(adminUser.token, id, { page, limit });
            // API now returns { logs, total, page, pages }
            if (data.logs) {
                setLogs(data.logs);
                setTotalLogs(data.total);
                setTotalPages(data.pages);
            } else {
                // Fallback if API hasn't been updated or returns plain array
                setLogs(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Failed to load inventory history');
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, id, page]);

    useEffect(() => {
        if (adminUser?.token && id) {
            fetchProduct();
            fetchLogs();
        }
    }, [adminUser.token, id, page, fetchProduct, fetchLogs]);

    const getBadgeVariant = (type) => {
        switch (type) {
            case 'Addition': return 'success';
            case 'Sale': return 'primary';
            case 'Deduction': return 'danger';
            case 'Damage': return 'warning';
            case 'Return': return 'info';
            case 'Audit': return 'secondary';
            default: return 'light';
        }
    };

    return (
        <div className="p-4">
            {/* Header section */}
            <div className="mb-4">
                <Link to="/admin/products" className="text-decoration-none text-muted mb-3 d-inline-flex align-items-center gap-1 hover:text-primary transition-colors">
                    <ArrowLeft size={16} /> Back to Products
                </Link>
                <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="d-flex align-items-center gap-3">
                        <div className="p-3 bg-primary bg-opacity-10 rounded-3 text-primary">
                            <History size={28} />
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h3 className="fw-bold text-dark mb-1">Inventory History</h3>
                                <PageInfoTooltip info={pageInfoData.productInventoryLogs} />
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted small">Tracking movements for</span>
                                {product ? (
                                    <Badge bg="light" text="dark" className="border shadow-sm">
                                        {product.name} ({product.sku})
                                    </Badge>
                                ) : (
                                    <Spinner animation="border" size="sm" variant="secondary" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            {product && (
                <div className="row g-4 mb-4">
                    <div className="col-md-3">
                        <Card className="border-0 shadow-sm rounded-4">
                            <Card.Body className="p-4">
                                <div className="text-muted small text-uppercase fw-bold mb-2">Current Total Stock</div>
                                <div className="h2 fw-black text-primary mb-0">
                                    {product.vendor ? (product.stock || 0) : (product.branchStocks?.reduce((acc, curr) => acc + curr.stock, 0) || 0)}
                                    <span className="fs-6 text-muted fw-normal ms-2">{product.unitType || 'Units'}</span>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            )}

            {/* History Table */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="bg-white px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Stock Movement Log</h5>
                    <Badge bg="blue-50" text="primary" className="border border-blue-100 rounded-pill px-3 py-2">
                        Total Records: {totalLogs}
                    </Badge>
                </div>
                
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr className="text-muted small text-uppercase tracking-wider">
                                    <th className="px-4 py-3 border-0">Date & Time</th>
                                    <th className="border-0">Location</th>
                                    <th className="border-0 text-center">Type</th>
                                    <th className="border-0">Movement</th>
                                    <th className="border-0">Stock Balance</th>
                                    <th className="border-0">Performed By</th>
                                    <th className="border-0 pe-4">Reference/Reason</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="mt-3 text-muted">Retrieving inventory logs...</p>
                                        </td>
                                    </tr>
                                ) : logs.length > 0 ? (
                                    logs.map((log) => (
                                        <tr key={log._id} className="hover-bg-blue-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="small fw-bold text-dark">{format(new Date(log.createdAt), 'MMM dd, yyyy')}</div>
                                                <div className="text-xs text-muted font-monospace">{format(new Date(log.createdAt), 'HH:mm:ss')}</div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    {log.vendorId ? (
                                                        <div className="d-flex flex-column">
                                                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] fw-bold uppercase">
                                                                <Store size={9} className="me-1" /> Vendor Store
                                                            </span>
                                                            <span className="small fw-medium mt-1">{log.vendorId.storeName}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex flex-column">
                                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] fw-bold uppercase">
                                                                <Package size={9} className="me-1" /> Branch
                                                            </span>
                                                            <span className="small fw-medium mt-1">{log.branchId?.name || 'Main Office'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <Badge bg={getBadgeVariant(log.type)} className="text-uppercase py-1.5 px-3 rounded-pill" style={{ fontSize: '10px', minWidth: '80px' }}>
                                                    {log.type}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className={`d-flex align-items-center gap-1 fw-bold ${log.changeAmount >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {log.changeAmount >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                    {Math.abs(log.changeAmount)}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="text-muted small">{log.previousStock}</span>
                                                    <span className="text-gray-300">→</span>
                                                    <span className="fw-bold text-dark">{log.newStock}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2 small text-truncate">
                                                    <div className="w-6 h-6 rounded-circle bg-light d-flex align-items-center justify-content-center text-primary border border-primary border-opacity-10">
                                                        <User size={12} />
                                                    </div>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-medium">
                                                            {log.admin?.name || (log.vendorId ? log.vendorId.storeName : 'System Auto')}
                                                        </span>
                                                        {log.admin?.email ? (
                                                            <span className="text-xs text-muted truncate max-w-[120px]">{log.admin.email}</span>
                                                        ) : log.vendorId ? (
                                                            <span className="text-xs text-purple-600 fw-bold uppercase" style={{ fontSize: '9px' }}>Vendor Partner</span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="pe-4">
                                                <div className="small text-muted py-1 bg-light px-2 rounded border border-light" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                                                    {log.reason || 'No detailed reason provided.'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="p-4 bg-light rounded-circle d-inline-flex mb-3">
                                                <History size={40} className="text-gray-300" />
                                            </div>
                                            <h5 className="text-muted mb-1">No transaction history found</h5>
                                            <p className="text-secondary small">Inventary movements will appear here.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>

                {/* Pagination footer */}
                {!loading && totalLogs > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            Showing <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> to <span className="fw-semibold text-dark">{Math.min(page * limit, totalLogs)}</span> of <span className="fw-semibold text-dark">{totalLogs}</span> entries
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Button 
                                variant="light" 
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <div className="d-flex align-items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(page - p) <= 1)
                                    .map((p, idx, arr) => (
                                        <React.Fragment key={p}>
                                            {idx > 0 && arr[idx-1] !== p - 1 && <span className="text-muted">...</span>}
                                            <Button 
                                                variant={page === p ? "primary" : "light"}
                                                size="sm"
                                                onClick={() => setPage(p)}
                                            >
                                                {p}
                                            </Button>
                                        </React.Fragment>
                                    ))
                                }
                            </div>
                            <Button 
                                variant="light" 
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <style dangerouslySetInnerHTML={{ __html: `
                .hover-bg-blue-50:hover {
                    background-color: #f8fbff !important;
                }
                .fw-black { font-weight: 900; }
            `}} />
        </div>
    );
};

export default ProductInventoryLogs;
