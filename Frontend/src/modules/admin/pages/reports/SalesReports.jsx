import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { Download, Calendar, IndianRupee, TrendingUp, ShoppingBag, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getSalesReports, exportSalesCSV } from '../../api/reportApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const SalesReports = () => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const [page, setPage] = useState(1);
    const [period, setPeriod] = useState('last_30_days');
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [data, setData] = useState({
        stats: {
            totalRevenue: 0,
            revenueGrowth: 0,
            totalOrders: 0,
            ordersGrowth: 0,
            avgOrderValue: 0,
            periodSales: 0
        },
        orders: [],
        pagination: {
            total: 0,
            totalPages: 1
        }
    });

    const limit = 10;

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getSalesReports(adminUser.token, {
                page,
                limit,
                period
            });
            if (res.success) {
                setData(res);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            toast.error(error.message || t('stock.reports.sales.alerts.load_error'));
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, period, t]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handlePeriodChange = (e) => {
        setPeriod(e.target.value);
        setPage(1);
    };

    const handleExport = async () => {
        if (!adminUser?.token) return;
        setExporting(true);
        try {
            const blob = await exportSalesCSV(adminUser.token, { period });
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Sales_Report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(t('stock.reports.sales.alerts.export_success'));
        } catch (error) {
            console.error('Export failed:', error);
            toast.error(t('stock.reports.sales.alerts.export_error'));
        } finally {
            setExporting(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    return (
        <div className="p-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <h4 className="fw-bold mb-0 text-nowrap">{t('stock.reports.sales.title')}</h4>
                <div className="d-flex gap-2 flex-grow-1 w-100 w-sm-auto justify-content-between justify-content-sm-end">
                    <Form.Select 
                        size="sm" 
                        style={{ width: '140px' }} 
                        className="shadow-none"
                        value={period}
                        onChange={handlePeriodChange}
                    >
                        <option value="last_30_days">{t('stock.reports.sales.period.last_30_days')}</option>
                        <option value="this_month">{t('stock.reports.sales.period.this_month')}</option>
                        <option value="last_month">{t('stock.reports.sales.period.last_month')}</option>
                        <option value="this_year">{t('stock.reports.sales.period.this_year')}</option>
                    </Form.Select>
                    <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="d-flex align-items-center gap-2 shadow-sm"
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        {exporting ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            <Download size={16} />
                        )}
                        <span className="d-none d-sm-inline">{exporting ? t('stock.reports.sales.exporting') : t('stock.reports.sales.export_csv')}</span>
                        <span className="d-inline d-sm-none">{t('stock.reports.sales.export_short')}</span>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <Row className="g-3 mb-4">
                <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="bg-success bg-opacity-10 p-2 rounded text-success">
                                    <IndianRupee size={20} />
                                </div>
                                <span className="text-muted small text-uppercase fw-bold">{t('stock.reports.sales.stats.total_revenue')}</span>
                            </div>
                            <h4 className="fw-bold mb-0">{formatCurrency(data.stats.totalRevenue)}</h4>
                            <small className={data.stats.revenueGrowth >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                {data.stats.revenueGrowth >= 0 ? '+' : ''}{data.stats.revenueGrowth}% {t('stock.reports.sales.stats.growth_suffix')}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="bg-primary bg-opacity-10 p-2 rounded text-primary">
                                    <ShoppingBag size={20} />
                                </div>
                                <span className="text-muted small text-uppercase fw-bold">{t('stock.reports.sales.stats.total_orders')}</span>
                            </div>
                            <h4 className="fw-bold mb-0">{data.stats.totalOrders}</h4>
                            <small className={data.stats.ordersGrowth >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                {data.stats.ordersGrowth >= 0 ? '+' : ''}{data.stats.ordersGrowth}% {t('stock.reports.sales.stats.growth_suffix')}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="bg-warning bg-opacity-10 p-2 rounded text-warning">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="text-muted small text-uppercase fw-bold">{t('stock.reports.sales.stats.avg_order_value')}</span>
                            </div>
                            <h4 className="fw-bold mb-0">{formatCurrency(data.stats.avgOrderValue)}</h4>
                            <small className="text-muted">{t('stock.reports.sales.stats.standard_avg')}</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="bg-info bg-opacity-10 p-2 rounded text-info">
                                    <Calendar size={20} />
                                </div>
                                <span className="text-muted small text-uppercase fw-bold">{t('stock.reports.sales.stats.period_sales')}</span>
                            </div>
                            <h4 className="fw-bold mb-0">{formatCurrency(data.stats.periodSales)}</h4>
                            <small className="text-muted">{t('stock.reports.sales.stats.currently_viewing', { period: t(`stock.reports.sales.period.${period}`) })}</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Sales Table */}
            <Card className="border-0 shadow-sm min-vh-50">
                <Card.Header className="bg-white py-3 border-0">
                    <h6 className="mb-0 fw-bold">{t('stock.reports.sales.table.title')}</h6>
                </Card.Header>
                <Card.Body className="p-0 position-relative">
                    {loading && (
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75 z-index-10">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    )}
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">{t('stock.reports.sales.table.order_id')}</th>
                                <th className="border-0 py-3">{t('stock.reports.sales.table.date')}</th>
                                <th className="border-0 py-3">{t('stock.reports.sales.table.customer')}</th>
                                <th className="border-0 py-3">{t('stock.reports.sales.table.items')}</th>
                                <th className="border-0 py-3">{t('stock.reports.sales.table.payment')}</th>
                                <th className="border-0 py-3">{t('stock.reports.sales.table.status')}</th>
                                <th className="border-0 py-3 text-end pe-4">{t('stock.reports.sales.table.amount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && data.orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <AlertCircle size={40} className="text-muted opacity-25 mb-2" />
                                        <p className="text-muted small mb-0">{t('stock.reports.sales.table.no_transactions')}</p>
                                    </td>
                                </tr>
                            ) : (
                                data.orders.map((order, idx) => (
                                    <tr key={idx}>
                                        <td className="ps-4 fw-bold text-primary">{order.id}</td>
                                        <td className="text-muted small">{order.date}</td>
                                        <td>{order.customer}</td>
                                        <td>{t('stock.reports.sales.table.items_count', { count: order.items })}</td>
                                        <td>
                                            <span className="text-xs fw-medium px-2 py-1 bg-gray-100 rounded text-gray-600">
                                                {t(`dashboard.payment_methods.${order.payment?.toLowerCase()}`)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge bg-${
                                                order.status === 'Delivered' || order.status === 'Completed' ? 'success' : 
                                                order.status === 'Refunded' || order.status === 'Cancelled' || order.status === 'Returned' ? 'danger' : 
                                                'warning'
                                            } rounded-pill fw-normal px-3`}>
                                                {t(`dashboard.order_status.${order.status?.toLowerCase().replace(/\s+/g, '_')}`)}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4 fw-bold">{formatCurrency(order.total)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>

                {/* Pagination Controls */}
                {data.pagination.total > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            {t('stock.reports.sales.pagination.showing')} <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> {t('stock.reports.sales.pagination.to')} <span className="fw-semibold text-dark">{Math.min(page * limit, data.pagination.total)}</span> {t('stock.reports.sales.pagination.of')} <span className="fw-semibold text-dark">{data.pagination.total}</span> {t('stock.reports.sales.pagination.orders')}
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
                                    const totalPages = data.pagination.totalPages;
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
                                className={`d-flex align-items-center justify-content-center p-2 rounded border shadow-sm ${page === data.pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                                disabled={page === data.pagination.totalPages}
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

export default SalesReports;
