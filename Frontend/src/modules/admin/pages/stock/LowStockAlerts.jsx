import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Form, InputGroup, Badge, Spinner, Button, ProgressBar, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Package, ChevronLeft, ChevronRight, AlertTriangle, RefreshCcw, Filter, ExternalLink } from 'lucide-react';
import { getLowStockAlerts, getProductById } from '../../api/productApi';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import RestockModal from '../../components/products/RestockModal';

const LowStockAlerts = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [alerts, setAlerts] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [severityFilter, setSeverityFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
    
    // Restock Modal State
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [restockingProduct, setRestockingProduct] = useState(null);
    const [fullProductLoading, setFullProductLoading] = useState(false);

    const limit = 10;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchBranches = useCallback(async () => {
        try {
            const data = await getBranches(adminUser.token);
            setBranches(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    }, [adminUser.token]);

    const fetchAlerts = useCallback(async () => {
        if (!adminUser?.token) return;
        
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: debouncedSearch,
                severity: severityFilter,
                branchId: branchFilter
            };
            const response = await getLowStockAlerts(adminUser.token, params);
            if (response.success) {
                setAlerts(response.data || []);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Error fetching low stock:', error);
            toast.error(t('stock.low_stock.loading_failed', { defaultValue: 'Failed to load inventory alerts' }));
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, debouncedSearch, severityFilter, branchFilter, t]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    useEffect(() => {
        if (adminUser?.token && adminUser.role === 'Admin') {
            fetchBranches();
        }
    }, [adminUser, fetchBranches]);

    const handleRestockClick = (alertItem) => {
        if (alertItem.isVendor) {
            toast.info(t('stock.low_stock.vendor_restriction'));
            return;
        }

        navigate('/admin/stock/adjustments/add', { 
            state: { 
                productId: alertItem.productId, 
                sku: alertItem.sku,
                branchId: alertItem.branchId
            } 
        });
    };

    return (
        <div className="p-4 space-y-4">
            {/* Action Header */}
            <Card className="border-0 shadow-sm mb-4 overflow-hidden rounded-xl">
                <div className="bg-rose-50 border-b border-rose-100 p-4 flex flex-col md:flex-row align-items-center justify-content-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-rose-500 text-white p-3 rounded-2xl shadow-lg shadow-rose-200">
                            <AlertTriangle size={28} />
                        </div>
                        <div>
                            <h4 className="fw-bold text-rose-900 mb-0">
                                {loading ? t('stock.low_stock.scanning') : t('stock.low_stock.critical_shortages', { count: pagination.total })}
                            </h4>
                            <p className="text-rose-600/70 text-xs fw-bold uppercase tracking-wider mb-0 mt-1">{t('stock.low_stock.high_priority')}</p>
                        </div>
                    </div>
                    <Button 
                        variant="white" 
                        size="sm" 
                        className="shadow-sm border-0 text-rose-600 fw-black uppercase tracking-tighter px-4 py-2 flex items-center gap-2 hover:bg-rose-100 transition-all rounded-lg"
                        onClick={() => fetchAlerts()}
                        disabled={loading}
                    >
                        <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                        {t('stock.low_stock.sync_data')}
                    </Button>
                </div>
            </Card>

            {/* Smart Filters */}
            <Card className="border-0 shadow-sm mb-4 bg-white rounded-xl">
                <Card.Body className="p-3">
                    <Row className="g-3">
                        <Col lg={5} md={6}>
                            <InputGroup className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1 focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-100 transition-all shadow-sm">
                                <Search className="text-gray-400 mt-2" size={16} />
                                <Form.Control
                                    placeholder={t('stock.low_stock.search_placeholder')}
                                    className="bg-transparent border-none shadow-none text-xs font-bold py-2 ms-2"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        
                        <Col lg={3} md={3}>
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1 transition-all">
                                <Filter size={14} className="text-gray-400 shrink-0" />
                                <Form.Select 
                                    className="bg-transparent border-none shadow-none text-[10px] font-black uppercase tracking-widest text-gray-600 py-2"
                                    value={severityFilter}
                                    onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="">{t('stock.low_stock.severity_all')}</option>
                                    <option value="Critical" className="text-rose-600">{t('stock.low_stock.severity_critical')}</option>
                                    <option value="Warning" className="text-amber-600">{t('stock.low_stock.severity_warning')}</option>
                                </Form.Select>
                            </div>
                        </Col>

                        {adminUser.role === 'Admin' && (
                            <Col lg={4} md={3}>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1 transition-all">
                                    <MapPin size={14} className="text-gray-400 shrink-0" />
                                    <Form.Select 
                                        className="bg-transparent border-none shadow-none text-[10px] font-black uppercase tracking-widest text-gray-600 py-2"
                                        value={branchFilter}
                                        onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
                                    >
                                        <option value="">{t('stock.low_stock.infrastructure_global')}</option>
                                        {branches.map(b => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                        <option value="vendor">{t('stock.low_stock.vendor_managed_only')}</option>
                                    </Form.Select>
                                </div>
                            </Col>
                        )}
                    </Row>
                </Card.Body>
            </Card>

            {/* Analysis Table */}
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                <Card.Body className="p-0">
                    <div className="overflow-x-auto">
                        <Table hover className="mb-0 text-xs">
                            <thead className="bg-gray-50/80 border-b border-gray-100">
                                <tr>
                                    <th className="ps-4 py-3">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t('stock.low_stock.table.item')}</span>
                                    </th>
                                    <th className="py-3">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t('stock.low_stock.table.deployment')}</span>
                                    </th>
                                    <th className="py-3">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t('stock.low_stock.table.health')}</span>
                                    </th>
                                    <th className="py-3">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t('stock.low_stock.table.severity')}</span>
                                    </th>
                                    <th className="pe-4 py-3 text-right">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t('stock.low_stock.table.command')}</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(limit).fill(0).map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan="5" className="py-10 text-center">
                                                <Spinner animation="border" size="sm" className="text-rose-200" />
                                            </td>
                                        </tr>
                                    ))
                                ) : alerts.length > 0 ? alerts.map((item, idx) => (
                                    <tr key={`${item.productId}-${idx}`} className="hover:bg-rose-50/30 transition-colors group">
                                        <td className="ps-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0 group-hover:border-rose-200 transition-colors">
                                                    {item.image ? (
                                                        <img src={item.image} alt="" className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <Package size={16} className="text-gray-200" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-black text-gray-900 text-[11px] truncate leading-tight uppercase">{item.productName}</div>
                                                    <div className="text-[10px] text-gray-600 font-mono font-bold tracking-tight mt-0.5">{item.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <Badge className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter border ${item.isVendor ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                    {item.isVendor ? t('stock.low_stock.external_partner') : t('stock.low_stock.branch_store')}
                                                </Badge>
                                                <div className="text-[11px] font-bold text-gray-700 truncate">{item.isVendor ? item.storeName : item.branchName}</div>
                                            </div>
                                        </td>
                                        <td className="py-3" style={{ minWidth: '180px' }}>
                                            <div className="flex justify-between mb-1.5 px-0.5">
                                                <span className={`text-[10px] font-black uppercase ${item.stock <= 0 ? 'text-rose-700' : 'text-amber-700'}`}>
                                                    {t('stock.low_stock.units_left', { count: item.stock })}
                                                </span>
                                                <span className="text-[9px] text-gray-600 font-black">{t('stock.low_stock.threshold')}: {item.threshold}</span>
                                            </div>
                                            <ProgressBar
                                                now={item.threshold > 0 ? Math.min(100, (item.stock / (item.threshold * 2)) * 100) : 100}
                                                variant={item.stock <= 0 ? 'danger' : 'warning'}
                                                className="h-1 bg-gray-100 border-none rounded-full"
                                            />
                                        </td>
                                        <td className="py-3">
                                            <Badge className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                                item.severity === 'Critical' 
                                                    ? 'bg-rose-600 text-white' 
                                                    : 'bg-amber-400 text-white'
                                            }`}>
                                                {item.severity === 'Critical' ? t('stock.low_stock.severity_critical') : t('stock.low_stock.severity_warning')}
                                            </Badge>
                                        </td>
                                        <td className="pe-4 py-3 text-right">
                                            {item.isVendor ? (
                                                <Badge bg="light" className="text-gray-600 border border-gray-300 py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">
                                                    {t('stock.low_stock.vendor_managed')}
                                                </Badge>
                                            ) : (
                                                <Button 
                                                    variant="dark" 
                                                    size="sm" 
                                                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gray-200 hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                                                    onClick={() => handleRestockClick(item)}
                                                    disabled={fullProductLoading}
                                                >
                                                    {fullProductLoading ? <Spinner animation="border" size="sm" /> : <RefreshCcw size={12} />}
                                                    {t('stock.low_stock.restock')}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center">
                                            <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-xl shadow-emerald-50">
                                                <Package className="text-emerald-500" size={32} />
                                            </div>
                                            <h4 className="font-black text-gray-800 text-lg uppercase tracking-tight">{t('stock.low_stock.system_healthy')}</h4>
                                            <p className="text-[12px] text-gray-400 font-medium px-10">{t('stock.low_stock.no_alerts')}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>

                {/* Intelligent Pagination */}
                {!loading && pagination.total > 0 && (
                    <div className="bg-white border-t border-gray-50 px-6 py-4 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                            {t('stock.low_stock.analyzed_records', { range: `${((page - 1) * limit) + 1}-${Math.min(page * limit, pagination.total)}`, total: pagination.total })}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-20 transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="px-4">
                                <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{t('stock.low_stock.page_of', { current: page, total: pagination.totalPages })}</span>
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page >= pagination.totalPages}
                                className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-20 transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Restock Modal Integration */}
            {restockingProduct && (
                <RestockModal
                    show={showRestockModal}
                    onHide={() => {
                        setShowRestockModal(false);
                        setRestockingProduct(null);
                    }}
                    product={restockingProduct}
                    onRestockSuccess={() => {
                        setShowRestockModal(false);
                        setRestockingProduct(null);
                        fetchAlerts(); // Refresh list
                        toast.success(t('stock.low_stock.restock_success'));
                    }}
                />
            )}
        </div>
    );
};

export default LowStockAlerts;
