import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { Plus, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllInventoryLogs } from '../../api/productApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const StockAdjustments = () => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
    const [page, setPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        const fetchLogs = async () => {
            if (!adminUser?.token) return;
            try {
                setLoading(true);
                const data = await getAllInventoryLogs(adminUser.token, { page, limit });
                if (data.logs) {
                    setLogs(data.logs);
                    setPagination(data.pagination);
                } else {
                    // Logic for old API if needed, but we updated it
                    setLogs(data);
                }
            } catch (error) {
                console.error('Error fetching logs:', error);
                toast.error(t('stock.adjustments.error_load'));
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [adminUser, page]);

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <h5 className="mb-0 fw-bold">{t('stock.adjustments.title')}</h5>
                    <Link to="/admin/stock/adjustments/add" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 responsive-btn">
                        <Plus size={18} /> {t('stock.adjustments.new_adjustment')}
                    </Link>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">{t('stock.adjustments.table.id')}</th>
                                <th className="border-0 py-3">{t('stock.adjustments.table.date')}</th>
                                <th className="border-0 py-3">{t('stock.adjustments.table.product')}</th>
                                <th className="border-0 py-3">{t('stock.adjustments.table.branch')}</th>
                                <th className="border-0 py-3">{t('stock.adjustments.table.type')}</th>
                                <th className="border-0 py-3">{t('stock.adjustments.table.changed')}</th>
                                <th className="border-0 py-3">{t('stock.adjustments.table.quantity')}</th>
                                <th className="border-0 py-3">{t('stock.adjustments.table.reason')}</th>
                                <th className="border-0 py-3 text-end pe-4">{t('stock.adjustments.table.user')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" size="sm" />
                                        <span className="ms-2">{t('stock.adjustments.loading')}</span>
                                    </td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log, idx) => (
                                    <tr key={log._id}>
                                        <td className="ps-4">
                                            <span className="text-muted small">#{log._id.slice(-6).toUpperCase()}</span>
                                        </td>
                                        <td className="text-muted small">
                                            {new Date(log.createdAt).toLocaleDateString('en-GB')}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-light overflow-hidden border">
                                                    {log.product?.image ? <img src={log.product.image} className="w-full h-full object-contain p-0.5" alt="" /> : <span className="flex items-center justify-center h-full text-[10px]">{log.product?.name?.charAt(0)}</span>}
                                                </div>
                                                <div className="fw-bold text-dark">{log.product?.name || t('stock.adjustments.unknown_product')}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg="light" className="text-secondary fw-normal border">
                                                {log.vendorId ? (
                                                    <span className="text-purple-600">📦 {log.vendorId.storeName}</span>
                                                ) : (
                                                    log.branchId?.name || t('common.global')
                                                )}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={(log.type === 'Addition' || log.type === 'Return') ? 'success' : 'danger'} className="rounded-pill px-3 fw-normal bg-opacity-10 text-reset border">
                                                {(log.type === 'Addition' || log.type === 'Return') ? <ArrowUpRight size={14} className="text-success me-1" /> : <ArrowDownRight size={14} className="text-danger me-1" />}
                                                {t(`stock.adjustments.types.${log.type?.toLowerCase() || 'adjustment'}`)}
                                            </Badge>
                                        </td>
                                        <td className={`fw-bold ${(log.type === 'Addition' || log.type === 'Return') ? 'text-success' : 'text-danger'}`}>
                                            {(log.type === 'Addition' || log.type === 'Return') ? '+' : ''}{log.changeAmount}
                                        </td>
                                        <td className="fw-bold">{log.newStock}</td>
                                        <td className="small text-muted">{log.reason}</td>
                                        <td className="text-end pe-4">
                                            <div className="small fw-medium text-dark">{log.admin?.name || t('stock.adjustments.system_user')}</div>
                                            <div className="small text-muted" style={{ fontSize: '10px' }}>{log.admin?.email}</div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-5 text-muted">{t('stock.adjustments.no_logs')}</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>

                {/* Pagination Controls */}
                {!loading && pagination.total > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            {t('stock.adjustments.pagination.showing')} <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> {t('stock.adjustments.pagination.to')} <span className="fw-semibold text-dark">{Math.min(page * limit, pagination.total)}</span> {t('stock.adjustments.pagination.of')} <span className="fw-semibold text-dark">{pagination.total}</span> {t('stock.adjustments.pagination.adjustments')}
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
                                {[...Array(pagination.totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    if (p === 1 || p === pagination.totalPages || Math.abs(page - p) <= 1) {
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
                                className={`d-flex align-items-center justify-content-center p-2 rounded border shadow-sm ${page === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
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

export default StockAdjustments;
