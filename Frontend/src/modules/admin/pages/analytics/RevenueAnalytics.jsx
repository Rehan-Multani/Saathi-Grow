import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Form, Row, Col, Table, Badge, Spinner } from 'react-bootstrap';
import { Download, Calendar, TrendingUp, TrendingDown, ArrowUpRight, BarChart3, Wallet, CreditCard } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getRevenueAnalytics } from '../../api/reportApi';
import { toast } from 'react-toastify';

const RevenueAnalytics = () => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const [period, setPeriod] = useState('this_week');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const fetchAnalytics = useCallback(async () => {
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const res = await getRevenueAnalytics(adminUser.token, { period });
            if (res.success) {
                setData(res);
            }
        } catch (error) {
            console.error('Fetch Analytics Error:', error);
            toast.error(t('analytics.revenue.load_error', { defaultValue: 'Failed to load revenue analytics' }));
        } finally {
            setLoading(false);
        }
    }, [adminUser, period, t]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    if (loading && !data) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    const { summary, chartData, dailyBreakdown } = data || { 
        summary: { totalNetSales: 0, salesGrowth: 0, totalRefunds: 0, vendorPayouts: 0, netProfit: 0, profitGrowth: 0 },
        chartData: [],
        dailyBreakdown: []
    };

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary d-none d-md-flex">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1 text-dark text-nowrap">{t('analytics.revenue.title')}</h4>
                        <p className="text-muted small mb-0 d-none d-sm-block">{t('analytics.revenue.subtitle')}</p>
                    </div>
                </div>

                <div className="d-flex gap-2 flex-grow-1 w-100 w-sm-auto justify-content-between justify-content-sm-end">
                    <Form.Select 
                        size="sm" 
                        style={{ width: '160px' }} 
                        className="shadow-none border-0 bg-light fw-medium"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="this_week">{t('analytics.revenue.period.week')}</option>
                        <option value="this_month">{t('analytics.revenue.period.month')}</option>
                        <option value="last_month">{t('analytics.revenue.period.last_month')}</option>
                        <option value="year_to_date">{t('analytics.revenue.period.ytd')}</option>
                    </Form.Select>
                    <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2 shadow-sm px-3">
                        <Download size={16} /> <span className="d-none d-sm-inline text-nowrap">{t('analytics.revenue.export')}</span>
                        <span className="d-inline d-sm-none">{t('common.export', { defaultValue: 'Export' })}</span>
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <Row className="g-3 mb-4">
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm bg-primary text-white overflow-hidden position-relative" style={{ minHeight: '120px' }}>
                        <Card.Body className="z-1">
                            <div className="text-white-50 small text-uppercase fw-bold mb-2">{t('analytics.revenue.cards.net_sales')}</div>
                            <h3 className="fw-bold mb-0">{formatCurrency(summary.totalNetSales)}</h3>
                            <div className={`small mt-2 d-flex align-items-center gap-1 ${summary.salesGrowth >= 0 ? 'text-white' : 'text-white-50'}`}>
                                {summary.salesGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                <span>{Math.abs(summary.salesGrowth)}%</span> {t('common.vs_prev', { defaultValue: 'vs prev period' })}
                            </div>
                        </Card.Body>
                        <BarChart3 size={80} className="position-absolute end-0 bottom-0 opacity-10 mb-n3 me-n2" />
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100 border-start border-danger border-4">
                        <Card.Body>
                            <div className="text-muted small text-uppercase fw-bold mb-2">{t('analytics.revenue.cards.refunds')}</div>
                            <h3 className="fw-bold mb-0 text-danger">{formatCurrency(summary.totalRefunds)}</h3>
                            <div className="small mt-2 text-muted">{t('analytics.revenue.cards.refunds_desc', { defaultValue: 'Value of returned orders' })}</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100 border-start border-warning border-4">
                        <Card.Body>
                            <div className="text-muted small text-uppercase fw-bold mb-2">{t('analytics.revenue.cards.vendor_payouts')}</div>
                            <h3 className="fw-bold mb-0 text-dark">{formatCurrency(summary.vendorPayouts)}</h3>
                            <div className="small mt-2 text-muted d-flex align-items-center gap-1">
                                <Wallet size={14} className="text-warning" /> {t('analytics.revenue.cards.payouts_desc', { defaultValue: 'Settlements processed' })}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100 border-start border-success border-4">
                        <Card.Body>
                            <div className="text-muted small text-uppercase fw-bold mb-2">{t('analytics.revenue.cards.net_profit')}</div>
                            <h3 className="fw-bold mb-0 text-success">{formatCurrency(summary.netProfit)}</h3>
                            <div className={`small mt-2 d-flex align-items-center gap-1 ${summary.profitGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
                                {summary.profitGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                <span>{Math.abs(summary.profitGrowth)}%</span> {t('common.growth', { defaultValue: 'growth' })}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Visual Analytics Chart */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="mb-0 fw-bold">{t('analytics.revenue.chart_title', { defaultValue: 'Revenue Growth Overview' })}</h6>
                        <small className="text-muted">{t('analytics.revenue.chart_subtitle', { defaultValue: 'Net sales performance based on delivered orders' })}</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        {loading && <Spinner animation="border" size="sm" variant="primary" className="me-2" />}
                        <Badge bg="success" className="bg-opacity-10 text-success fw-normal px-2">{t('common.live_update', { defaultValue: 'Live Update' })}</Badge>
                    </div>
                </Card.Header>
                <Card.Body className="pt-0">
                    <div style={{ width: '100%', height: 350, minHeight: '350px' }}>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer minWidth={0} minHeight={0}>
                                <AreaChart
                                    data={chartData}
                                    margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0c831f" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#0c831f" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                            fontSize: '14px'
                                        }}
                                        formatter={(value) => [formatCurrency(value), t('common.revenue', { defaultValue: 'Revenue' })]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#0c831f"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted">
                                <TrendingUp size={48} className="mb-3 opacity-20" />
                                <p>{t('analytics.revenue.no_data', { defaultValue: 'No data available for the selected period' })}</p>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>

            {/* Detailed Table */}
            <Card className="border-0 shadow-sm overflow-hidden mb-4">
                <Card.Header className="bg-white py-3 border-0">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold">{t('analytics.revenue.table_title', { defaultValue: 'Daily Breakdown' })}</h6>
                        <Badge bg="light" text="dark" className="fw-normal border">
                           {t('analytics.revenue.last_days', { count: dailyBreakdown.length, defaultValue: `Last ${dailyBreakdown.length} Active Days` })}
                        </Badge>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">{t('analytics.revenue.table.date')}</th>
                                <th className="border-0 py-3 text-center">{t('analytics.revenue.table.orders')}</th>
                                <th className="border-0 py-3">{t('analytics.revenue.table.gross_sales')}</th>
                                <th className="border-0 py-3 text-danger">{t('analytics.revenue.cards.refunds')}</th>
                                <th className="border-0 py-3 text-end pe-4 fw-bold">{t('analytics.revenue.table.net_sales')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyBreakdown.length > 0 ? dailyBreakdown.map((day, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="bg-light p-2 rounded-circle text-primary">
                                                <Calendar size={14} />
                                            </div>
                                            <span className="small fw-medium">{day.date}</span>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge bg-light text-dark fw-normal border px-3">{day.orders}</span>
                                    </td>
                                    <td><span className="small fw-medium">{formatCurrency(day.gross)}</span></td>
                                    <td><span className="small fw-medium text-danger">{formatCurrency(day.refunds)}</span></td>
                                    <td className="text-end pe-4 fw-bold text-primary">{formatCurrency(day.net)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        No financial records found for this period.
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

export default RevenueAnalytics;
