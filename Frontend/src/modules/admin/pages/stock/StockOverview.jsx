import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Spinner, Form, Badge, Table, Button, Dropdown } from 'react-bootstrap';
import {
    Package,
    AlertTriangle,
    Home,
    Activity,
    BarChart3,
    LayoutGrid,
    MoreVertical,
    ArrowRight,
    Search,
    RefreshCw,
    MapPin,
    AlertCircle
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell
} from 'recharts';
import { getInventoryStats } from '../../api/productApi';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const StockOverview = () => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const navigate = useNavigate();
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [branches, setBranches] = useState([]);
const [selectedBranch, setSelectedBranch] = useState('all');
const [data, setData] = useState({
    stats: { totalStock: 0, inventoryValue: 0, lowStockCount: 0, outOfStockCount: 0 },
    categoryDistribution: [],
    branchHealth: [],
    criticalItems: []
});

const isAdmin = adminUser.role === 'Admin';

const fetchOverviewData = useCallback(async (isRefresh = false) => {
    if (!adminUser?.token) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
        const [statsData, branchData] = await Promise.all([
            getInventoryStats(adminUser.token, selectedBranch === 'all' ? null : selectedBranch),
            isAdmin ? getBranches(adminUser.token) : Promise.resolve([])
        ]);

        setData(statsData);
        if (isAdmin) setBranches(branchData);
    } catch (error) {
        console.error('Inventory Stats Error:', error);
        toast.error(t('stock.overview.error_sync'));
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
}, [adminUser.token, selectedBranch, isAdmin]);

useEffect(() => {
    fetchOverviewData();
}, [fetchOverviewData]);

const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(val);
};

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted fw-medium animate-pulse">{t('stock.overview.syncing')}</p>
            </div>
        );
    }

return (
    <div className="p-3">
        {/* Command Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div>
                <h4 className="fw-bold text-dark mb-1">{t('stock.overview.title')}</h4>
                <p className="text-muted small mb-0 d-flex align-items-center gap-2">
                    <Activity size={14} className="text-success" />
                    {isAdmin ? t('stock.overview.live_status_all') : t('stock.overview.live_status_branch')}
                </p>
            </div>

            <div className="d-flex align-items-center gap-2">
                {isAdmin && (
                    <Form.Select
                        className="shadow-sm border-0 font-small fw-bold bg-white"
                        style={{ width: '220px' }}
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                        <option value="all">🌐 {t('stock.overview.global_all_branches')}</option>
                        {branches.map(b => (
                            <option key={b._id} value={b._id}>📍 {b.name}</option>
                        ))}
                    </Form.Select>
                )}
                <Button
                    variant="light"
                    size="sm"
                    className="btn-icon-soft shadow-sm bg-white border-0"
                    onClick={() => fetchOverviewData(true)}
                    disabled={refreshing}
                >
                    <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
                </Button>
            </div>
        </div>

        {/* KPI Section */}
        <Row className="g-3 mb-4">
            <Col lg={3} md={6}>
                <Card
                    className="border-0 shadow-sm h-100 overflow-hidden cursor-pointer hover-shadow-lg transition-all"
                    onClick={() => navigate('/admin/stock/branches')}
                >
                    <div className="p-3 d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-primary-soft p-2 text-primary">
                            <Package size={24} />
                        </div>
                        <div>
                            <div className="text-muted small fw-bold text-uppercase">{t('stock.overview.total_stock_units')}</div>
                            <h3 className="fw-bold mb-0">{data.stats.totalStock?.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="bg-primary bg-opacity-10 px-3 py-1 small text-primary fw-medium">
                        {t('stock.overview.global_assets')}
                    </div>
                </Card>
            </Col>
            <Col lg={3} md={6}>
                <Card className="border-0 shadow-sm h-100 overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <div className="p-3 d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-white bg-opacity-20 p-2">
                            <RefreshCw size={24} />
                        </div>
                        <div>
                            <div className="small fw-bold text-uppercase opacity-75">{t('stock.overview.inventory_worth')}</div>
                            <h3 className="fw-bold mb-0">{formatCurrency(data.stats.inventoryValue || 0)}</h3>
                        </div>
                    </div>
                    <div className="bg-black bg-opacity-10 px-3 py-1 small fw-medium">
                        {t('stock.overview.market_value')}
                    </div>
                </Card>
            </Col>
            <Col lg={3} md={6}>
                <Card
                    className="border-0 shadow-sm h-100 overflow-hidden cursor-pointer hover-shadow-lg transition-all"
                    onClick={() => navigate('/admin/stock/alerts')}
                >
                    <div className="p-3 d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-warning-soft p-2 text-warning">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <div className="text-muted small fw-bold text-uppercase">{t('stock.overview.under_threshold')}</div>
                            <h3 className="fw-bold mb-0 text-warning">{data.stats.lowStockCount}</h3>
                        </div>
                    </div>
                    <div className="bg-warning bg-opacity-10 px-3 py-1 small text-warning fw-medium">
                        {t('stock.overview.needs_fast_restock')}
                    </div>
                </Card>
            </Col>
            <Col lg={3} md={6}>
                <Card
                    className="border-0 shadow-sm h-100 overflow-hidden cursor-pointer hover-shadow-lg transition-all"
                    onClick={() => navigate('/admin/stock/alerts')}
                >
                    <div className="p-3 d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-danger-soft p-2 text-danger">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <div className="text-muted small fw-bold text-uppercase">{t('stock.overview.zero_stock')}</div>
                            <h3 className="fw-bold mb-0 text-danger">{data.stats.outOfStockCount}</h3>
                        </div>
                    </div>
                    <div className="bg-danger bg-opacity-10 px-3 py-1 small text-danger fw-medium">
                        {t('stock.overview.unavailable_items')}
                    </div>
                </Card>
            </Col>
        </Row>

        {/* Branch Health Heatmap (Admin Only) */}
        {isAdmin && selectedBranch === 'all' && (
            <div className="mb-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <LayoutGrid size={18} className="text-primary" />
                    {t('stock.overview.regional_health_heatmap')}
                </h6>
                <Row className="g-3">
                    {data.branchHealth.map((branch, idx) => (
                        <Col key={idx} lg={3} md={4} sm={6}>
                            <Card className="border-0 shadow-sm hover-up transition-3d h-100">
                                <Card.Body className="p-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <div className="fw-bold text-dark">{branch.name}</div>
                                        <Badge bg={branch.healthScore > 80 ? 'success' : branch.healthScore > 50 ? 'warning' : 'danger'} className="rounded-pill px-2">
                                            {Math.round(branch.healthScore)}%
                                        </Badge>
                                    </div>
                                    <div className="small text-muted mb-3 italic">{branch.code}</div>

                                    <div className="d-flex flex-column gap-2">
                                        <div className="d-flex justify-content-between small">
                                            <span>{t('stock.overview.total_items')}</span>
                                            <span className="fw-bold">{branch.totalProducts}</span>
                                        </div>
                                        <div className="d-flex justify-content-between small">
                                            <span>{t('stock.overview.low_out_of_stock')}</span>
                                            <span className={`fw-bold ${branch.lowStock > 0 ? 'text-danger' : 'text-success'}`}>
                                                {branch.lowStock + branch.outOfStock}
                                            </span>
                                        </div>
                                    </div>
                                </Card.Body>
                                <Card.Footer className="bg-light border-0 py-2 text-center clickable shadow-none cursor-pointer" onClick={() => navigate('/admin/stock/branches')}>
                                    <span className="small fw-bold text-primary d-flex align-items-center justify-content-center gap-1">
                                        {t('stock.overview.manage_branch')} <ArrowRight size={14} />
                                    </span>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        )}

        <Row className="g-4">
            {/* Critical restock list */}
            <Col lg={7}>
                <Card className="border-0 shadow-sm h-100">
                    <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0">{t('stock.overview.urgent_restock_list')}</h6>
                        <Button variant="link" size="sm" className="p-0 text-decoration-none small" onClick={() => navigate('/admin/stock/alerts')}>
                            {t('stock.overview.view_all_alerts')}
                        </Button>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <Table responsive borderless hover className="align-middle mb-0">
                            <thead className="bg-light text-muted small text-uppercase">
                                <tr>
                                    <th className="ps-4">{t('stock.overview.table.product')}</th>
                                    {selectedBranch === 'all' && <th>{t('stock.overview.table.branch')}</th>}
                                    <th className="text-center">{t('stock.overview.table.current')}</th>
                                    <th>{t('stock.overview.table.status')}</th>
                                    <th className="pe-4 text-end">{t('stock.overview.table.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.criticalItems.length > 0 ? data.criticalItems.map((item, idx) => (
                                    <tr key={idx} className="border-bottom border-light">
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="w-10 h-10 bg-light rounded overflow-hidden border">
                                                    {item.image ? <img src={item.image} alt="" className="w-100 h-100 object-fit-contain" /> : <Package size={16} className="text-muted m-2" />}
                                                </div>
                                                <div>
                                                    <div className="fw-medium small text-dark">{item.name}</div>
                                                    <div className="text-muted extra-small">{item.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {selectedBranch === 'all' && (
                                            <td className="small text-muted">
                                                <MapPin size={12} className="me-1" /> {item.branchName}
                                            </td>
                                        )}
                                        <td className="text-center">
                                            <span className={`fw-bold ${item.stock <= 0 ? 'text-danger' : 'text-warning'}`}>{item.stock}</span>
                                        </td>
                                        <td>
                                            <Badge bg={item.stock <= 0 ? 'danger-soft' : 'warning-soft'} className={item.stock <= 0 ? 'text-danger px-2' : 'text-warning px-2'}>
                                                {item.stock <= 0 ? t('stock.overview.status.empty') : t('stock.overview.status.low')}
                                            </Badge>
                                        </td>
                                        <td className="pe-4 text-end">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="btn-icon-soft"
                                                onClick={() => navigate('/admin/stock/adjustments/add', { state: { productId: item._id, sku: item.sku } })}
                                            >
                                                <RefreshCw size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted small">
                                            🎉 {t('stock.overview.all_systems_clear')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Col>

            {/* Categories distribution */}
            <Col lg={5}>
                <Card className="border-0 shadow-sm h-100">
                    <Card.Header className="bg-white border-0 py-3">
                        <h6 className="fw-bold mb-0">{t('stock.overview.stock_density_category')}</h6>
                    </Card.Header>
                    <Card.Body>
                        <div style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data.categoryDistribution}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        tick={{ fontSize: 10, fontWeight: 'bold' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8f9fa' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="stock" radius={[0, 4, 4, 0]} barSize={20}>
                                        {data.categoryDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </div>
    );
};

export default StockOverview;
