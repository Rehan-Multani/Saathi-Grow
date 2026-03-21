import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Table, Button, Form, ProgressBar, Badge, InputGroup, Spinner } from 'react-bootstrap';
import { Download, AlertTriangle, Search, Filter, X, ShoppingBag, ChevronLeft, ChevronRight, Store, Truck } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getInventoryReports, exportInventoryCSV } from '../../api/reportApi';
import { getBranches } from '../../api/branchApi';
import { getVendors } from '../../api/vendorApi';
import { getCategories } from '../../api/categoryApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const InventoryReports = () => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSource, setSelectedSource] = useState({ id: '', type: '' });
    const [stockStatus, setStockStatus] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    
    // Data States
    const [inventory, setInventory] = useState([]);
    const [summary, setSummary] = useState({ totalProducts: 0, lowStockCount: 0, outOfStockCount: 0 });
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    
    // Filter Options
    const [branches, setBranches] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [categories, setCategories] = useState([]);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Unified Source Options
    const sourceOptions = useMemo(() => {
        const branchOptions = branches.map(b => ({ id: b._id, name: b.name, type: 'branch', icon: <Store size={14} className="me-2" /> }));
        const vendorOptions = vendors.map(v => ({ id: v._id, name: v.storeName, type: 'vendor', icon: <Truck size={14} className="me-2" /> }));
        return [...branchOptions, ...vendorOptions];
    }, [branches, vendors]);

    const fetchDropdownData = useCallback(async () => {
        if (!adminUser?.token) return;
        try {
            const [branchData, vendorData, categoryData] = await Promise.all([
                getBranches(adminUser.token),
                getVendors(adminUser.token),
                getCategories(adminUser.token, { hasProducts: true })
            ]);
            setBranches(branchData || []);
            setVendors(vendorData || []);
            // Map categories to handle possible different data structures
            const cats = Array.isArray(categoryData) ? categoryData : (categoryData.categories || []);
            setCategories(cats.map(c => typeof c === 'string' ? c : c.name) || []);
        } catch (error) {
            console.error('Failed to fetch dropdown options:', error);
        }
    }, [adminUser]);

    const fetchInventory = useCallback(async (isSilent = false) => {
        if (!adminUser?.token) return;
        if (!isSilent) setLoading(true);
        try {
            const params = {
                page,
                limit,
                search: searchTerm,
                category: selectedCategory,
                status: stockStatus,
                branchId: selectedSource.type === 'branch' ? selectedSource.id : '',
                vendorId: selectedSource.type === 'vendor' ? selectedSource.id : ''
            };
            const res = await getInventoryReports(adminUser.token, params);
            if (res.success) {
                setInventory(res.inventory || []);
                setSummary(res.summary || { totalProducts: 0, lowStockCount: 0, outOfStockCount: 0 });
                setTotalPages(res.pagination?.totalPages || 1);
                setTotalItems(res.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Fetch Inventory Error:', error);
        } finally {
            setLoading(false);
        }
    }, [adminUser, page, searchTerm, selectedCategory, selectedSource, stockStatus]);

    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    // Reset pagination when filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedCategory, selectedSource, stockStatus]);

    const handleExport = async () => {
        if (!adminUser?.token) return;
        setExporting(true);
        try {
            const params = {
                search: searchTerm,
                category: selectedCategory,
                status: stockStatus,
                branchId: selectedSource.type === 'branch' ? selectedSource.id : '',
                vendorId: selectedSource.type === 'vendor' ? selectedSource.id : ''
            };
            const blob = await exportInventoryCSV(adminUser.token, params);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(t('stock.reports.inventory.alerts.export_success'));
        } catch (error) {
            console.error('Export failed:', error);
            toast.error(t('stock.reports.inventory.alerts.export_error'));
        } finally {
            setExporting(false);
        }
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedSource({ id: '', type: '' });
        setStockStatus('');
        setShowFilterMenu(false);
    };

    const getStatusVariant = (status) => {
        switch(status) {
            case 'In Stock': return 'success';
            case 'Low Stock': return 'warning';
            case 'Out of Stock': return 'danger';
            default: return 'secondary';
        }
    };

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary d-none d-md-flex">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <h4 className="fw-bold mb-1 text-dark">{t('stock.reports.inventory.title')}</h4>
                            <PageInfoTooltip data={pageInfoData.inventoryReports} />
                        </div>
                        <p className="text-muted small mb-0 d-none d-sm-block">{t('stock.reports.inventory.subtitle')}</p>
                    </div>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-lg-auto text-nowrap">
                    <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className={`d-flex align-items-center gap-2 shadow-sm flex-grow-1 flex-sm-grow-0 justify-content-center px-3 ${stockStatus === 'Out of Stock' ? 'active shadow-none bg-danger text-white' : ''}`}
                        onClick={() => setStockStatus(stockStatus === 'Out of Stock' ? '' : 'Out of Stock')}
                    >
                        <X size={16} /> <span>{t('stock.reports.inventory.out_of_stock_btn', { count: summary.outOfStockCount })}</span>
                    </Button>
                    <Button 
                        variant="outline-warning" 
                        size="sm" 
                        className={`d-flex align-items-center gap-2 shadow-sm flex-grow-1 flex-sm-grow-0 justify-content-center px-3 ${stockStatus === 'Low Stock' ? 'active shadow-none bg-warning text-dark' : ''}`}
                        onClick={() => setStockStatus(stockStatus === 'Low Stock' ? '' : 'Low Stock')}
                    >
                        <AlertTriangle size={16} /> <span>{t('stock.reports.inventory.low_stock_btn', { count: summary.lowStockCount })}</span>
                    </Button>
                    <Button 
                        variant="primary" 
                        size="sm" 
                        className="d-flex align-items-center gap-2 shadow-sm flex-grow-1 flex-sm-grow-0 justify-content-center px-4"
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        {exporting ? <Spinner animation="border" size="sm" /> : <Download size={16} />}
                        <span>{exporting ? t('stock.reports.inventory.exporting') : t('stock.reports.inventory.export_report')}</span>
                    </Button>
                </div>
            </div>

            {/* Inventory Table */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-0">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <h6 className="mb-0 fw-bold">{t('stock.reports.inventory.table_title')}</h6>
                        <div className="d-flex flex-column flex-sm-row gap-3 w-100 w-md-auto align-items-stretch">
                            <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                                <InputGroup className="bg-light rounded-3 overflow-hidden border-0">
                                    <InputGroup.Text className="bg-light border-0 text-muted ps-3">
                                        <Search size={18} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder={t('stock.reports.inventory.search_placeholder')}
                                        className="bg-light border-0 ps-1 py-2 shadow-none font-small"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </div>

                            <div className="position-relative">
                                <Button
                                    size="sm"
                                    variant={selectedCategory || selectedSource.id || stockStatus ? "primary" : "outline-secondary"}
                                    className="d-flex align-items-center justify-content-center gap-2 h-100 px-3 shadow-none border no-hover-effect"
                                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                                >
                                    <Filter size={18} />
                                    <span>{t('stock.reports.inventory.filter')}</span>
                                    {(selectedCategory || selectedSource.id || stockStatus) && (
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
                                            <h6 className="mb-0 fw-bold small text-uppercase text-muted letter-spacing-wider">{t('stock.reports.inventory.filter_menu.title')}</h6>
                                            <Button variant="link" className="p-0 text-muted" onClick={() => setShowFilterMenu(false)}>
                                                <X size={18} />
                                            </Button>
                                        </div>

                                        <div className="mb-3">
                                            <Form.Label className="small fw-bold text-muted text-uppercase mb-1">{t('stock.reports.inventory.filter_menu.category_label')}</Form.Label>
                                            <Form.Select
                                                size="sm"
                                                className="bg-light border-0 py-2 shadow-none"
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                            >
                                                <option value="">{t('stock.reports.inventory.filter_menu.all_categories')}</option>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </Form.Select>
                                        </div>

                                        <div className="mb-3">
                                            <Form.Label className="small fw-bold text-muted text-uppercase mb-1">{t('stock.reports.inventory.filter_menu.source_label')}</Form.Label>
                                            <Form.Select
                                                size="sm"
                                                className="bg-light border-0 py-2 shadow-none"
                                                value={`${selectedSource.id}|${selectedSource.type}`}
                                                onChange={(e) => {
                                                    const [id, type] = e.target.value.split('|');
                                                    setSelectedSource({ id: id || '', type: type || '' });
                                                }}
                                            >
                                                <option value="|">{t('stock.reports.inventory.filter_menu.all_sources')}</option>
                                                <optgroup label={t('stock.reports.inventory.filter_menu.branches_group')}>
                                                    {sourceOptions.filter(s => s.type === 'branch').map(s => (
                                                        <option key={s.id} value={`${s.id}|${s.type}`}>🏪 {s.name}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label={t('stock.reports.inventory.filter_menu.vendors_group')}>
                                                    {sourceOptions.filter(s => s.type === 'vendor').map(s => (
                                                        <option key={s.id} value={`${s.id}|${s.type}`}>🚚 {s.name}</option>
                                                    ))}
                                                </optgroup>
                                            </Form.Select>
                                        </div>

                                        <div className="mb-3">
                                            <Form.Label className="small fw-bold text-muted text-uppercase mb-1">{t('stock.reports.inventory.filter_menu.status_label')}</Form.Label>
                                            <Form.Select
                                                size="sm"
                                                className="bg-light border-0 py-2 shadow-none"
                                                value={stockStatus}
                                                onChange={(e) => setStockStatus(e.target.value)}
                                            >
                                                <option value="">{t('stock.reports.inventory.filter_menu.all_items')}</option>
                                                <option value="In Stock">{t('stock.reports.inventory.filter_menu.in_stock')}</option>
                                                <option value="Low Stock">{t('stock.reports.inventory.filter_menu.low_stock_only')}</option>
                                                <option value="Out of Stock">{t('stock.reports.inventory.filter_menu.out_of_stock')}</option>
                                            </Form.Select>
                                        </div>

                                        {(selectedCategory || selectedSource.id || stockStatus) && (
                                            <Button
                                                variant="link"
                                                className="w-100 p-0 text-danger small text-decoration-none border-top pt-2 mt-2"
                                                onClick={clearFilters}
                                            >
                                                {t('stock.reports.inventory.filter_menu.clear_filters')}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0 position-relative" style={{ minHeight: '200px' }}>
                    {loading && (
                        <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 10 }}>
                            <Spinner animation="border" variant="primary" />
                        </div>
                    )}
                    <Table hover responsive className={`mb-0 align-middle ${loading ? 'opacity-50' : ''}`}>
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">{t('stock.reports.inventory.table.product')}</th>
                                <th className="border-0 py-3">{t('stock.reports.inventory.table.vendor_source')}</th>
                                <th className="border-0 py-3">{t('stock.reports.inventory.table.category')}</th>
                                <th className="border-0 py-3" style={{ width: '200px' }}>{t('stock.reports.inventory.table.stock_level')}</th>
                                <th className="border-0 py-3 text-center">{t('stock.reports.inventory.table.reorder_point')}</th>
                                <th className="border-0 py-3 text-end pe-4">{t('stock.reports.inventory.table.status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.length > 0 ? inventory.map((item, idx) => (
                                <tr key={item.id || idx}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">{item.name}</div>
                                        <div className="small text-muted">{item.sku}</div>
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
                                                now={Math.min(parseInt(item.stock), 100)}
                                                max={100}
                                                variant={item.status === 'Low Stock' ? 'warning' : item.status === 'Out of Stock' ? 'danger' : 'success'}
                                                style={{ height: '6px', width: '100px' }}
                                                className="rounded-pill shadow-none"
                                            />
                                            <span className="small fw-bold">{item.stock} {item.unitType}</span>
                                        </div>
                                    </td>
                                    <td className="text-center text-muted small">{item.reorderLevel} {t('stock.reports.inventory.table.units')}</td>
                                    <td className="text-end pe-4">
                                        <Badge
                                            bg={getStatusVariant(item.status)}
                                            className="rounded-pill fw-normal px-3 py-1 shadow-sm"
                                        >
                                            {t(`stock.reports.inventory.statuses.${item.status?.toLowerCase().replace(/\s+/g, '_')}`)}
                                        </Badge>
                                    </td>
                                </tr>
                            )) : !loading && (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        {t('stock.reports.inventory.table.no_data')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>

                {/* Pagination Controls */}
                {totalItems > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            {t('stock.reports.inventory.pagination.showing')} <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> {t('stock.reports.inventory.pagination.to')} <span className="fw-semibold text-dark">{Math.min(page * limit, totalItems)}</span> {t('stock.reports.inventory.pagination.of')} <span className="fw-semibold text-dark">{totalItems}</span> {t('stock.reports.inventory.pagination.products')}
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
                                    const pages = [];
                                    const maxVisible = 5;
                                    let start = Math.max(1, page - 2);
                                    let end = Math.min(totalPages, start + maxVisible - 1);
                                    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

                                    for (let p = start; p <= end; p++) {
                                        pages.push(
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
                                    }
                                    return pages;
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
        </div>
    );
};

export default InventoryReports;
