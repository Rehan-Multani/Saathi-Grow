import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, Badge, Spinner } from 'react-bootstrap';
import { Star, Download, Users, ChevronLeft, ChevronRight, Search, Phone, User } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getVendorReports, exportVendorCSV } from '../../api/reportApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';
import VendorPerformanceModal from './VendorPerformanceModal';

const VendorReports = () => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalVendors, setTotalVendors] = useState(0);
    const limit = 10;

    const fetchVendors = useCallback(async () => {
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                search: searchTerm
            };
            const res = await getVendorReports(adminUser.token, params);
            if (res.success) {
                setVendors(res.vendors || []);
                setTotalPages(res.pagination?.totalPages || 1);
                setTotalVendors(res.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Fetch Vendor Reports Error:', error);
            toast.error(t('stock.reports.vendors.alerts.fetch_error'));
        } finally {
            setLoading(false);
        }
    }, [adminUser, page, searchTerm, t]);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    // Debounced search reset
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleExport = async () => {
        if (!adminUser?.token) return;
        setExporting(true);
        try {
            const params = { search: searchTerm };
            const blob = await exportVendorCSV(adminUser.token, params);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Vendor_Report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(t('stock.reports.vendors.alerts.export_success'));
        } catch (error) {
            console.error('Export failed:', error);
            toast.error(t('stock.reports.vendors.alerts.export_error'));
        } finally {
            setExporting(false);
        }
    };

    const handleShowDetails = (vendor) => {
        setSelectedVendor(vendor);
        setShowModal(true);
    };

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <h4 className="fw-bold mb-1">{t('stock.reports.vendors.title')}</h4>
                        <PageInfoTooltip data={pageInfoData.vendorReports} />
                    </div>
                    <p className="text-muted small mb-0">{t('stock.reports.vendors.subtitle')}</p>
                </div>
                <div className="d-flex gap-2">
                    <Button 
                        variant="primary" 
                        size="sm" 
                        className="d-flex align-items-center gap-2 shadow-sm px-4 py-2"
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        {exporting ? <Spinner animation="border" size="sm" /> : <Download size={16} />}
                        <span>{exporting ? t('stock.reports.vendors.exporting') : t('stock.reports.vendors.export_report')}</span>
                    </Button>
                </div>
            </div>

            {/* Vendor Stats Table */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-4 border-0">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-primary bg-opacity-10 p-2 rounded text-primary">
                                <Users size={20} />
                            </div>
                            <h6 className="mb-0 fw-bold">{t('stock.reports.vendors.table.title')}</h6>
                        </div>
                        <div className="d-flex align-items-center gap-2 border rounded-pill px-3 bg-light" style={{ width: '100%', maxWidth: '350px' }}>
                            <Search size={16} className="text-muted" />
                            <Form.Control
                                size="sm"
                                type="text"
                                placeholder={t('stock.reports.vendors.table.search_placeholder')}
                                className="border-0 bg-transparent shadow-none py-2"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0 position-relative">
                    {loading && (
                        <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 10 }}>
                            <Spinner animation="border" variant="primary" />
                        </div>
                    )}
                    <Table hover responsive className={`mb-0 align-middle ${loading ? 'opacity-50' : ''}`}>
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">{t('stock.reports.vendors.table.vendor_store')}</th>
                                <th className="border-0 py-3">{t('stock.reports.vendors.table.contact_details')}</th>
                                <th className="border-0 py-3 text-center">{t('stock.reports.vendors.table.products')}</th>
                                <th className="border-0 py-3">{t('stock.reports.vendors.table.total_sales')}</th>
                                <th className="border-0 py-3">{t('stock.reports.vendors.table.member_since')}</th>
                                <th className="border-0 py-3 text-center">{t('stock.reports.vendors.table.status')}</th>
                                <th className="border-0 py-3 text-end pe-4">{t('stock.reports.vendors.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.length > 0 ? vendors.map((vendor) => (
                                <tr key={vendor.id}>
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light rounded-circle p-2 text-primary fw-bold" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {vendor.vendorName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{vendor.vendorName}</div>
                                                <div className="small text-muted d-flex align-items-center gap-1">
                                                    <User size={12} /> {vendor.owner}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="small text-dark font-medium">{vendor.contact}</div>
                                        <div className="small text-muted" style={{ fontSize: '11px' }}>{vendor.email}</div>
                                    </td>
                                    <td className="text-center">
                                        <Badge bg="info" className="bg-opacity-10 text-info fw-normal border border-info border-opacity-25 px-3">
                                            {t('stock.reports.vendors.table.items_count', { count: vendor.productsListed })}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-success text-lg">₹{vendor.totalSales?.toLocaleString()}</div>
                                        <div className="text-muted" style={{ fontSize: '11px' }}>{t('stock.reports.vendors.table.orders_count', { count: vendor.orderCount })}</div>
                                    </td>
                                    <td>
                                        <div className="small text-dark">{vendor.memberSince}</div>
                                    </td>
                                    <td className="text-center">
                                        <Badge
                                            bg={vendor.status === 'Active' ? 'success' : vendor.status === 'Pending' ? 'warning' : 'danger'}
                                            className="rounded-pill fw-normal px-3 py-1 bg-opacity-75"
                                            style={{ minWidth: '80px' }}
                                        >
                                            {t(`stock.reports.vendors.statuses.${vendor.status?.toLowerCase()}`)}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="rounded-pill px-3"
                                            onClick={() => handleShowDetails(vendor)}
                                        >
                                            {t('stock.reports.vendors.table.view_stats')}
                                        </Button>
                                    </td>
                                </tr>
                            )) : !loading && (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        {t('stock.reports.vendors.table.no_data')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>

                {/* Pagination Controls */}
                {totalVendors > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            {t('stock.reports.vendors.pagination.showing')} <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> {t('stock.reports.vendors.pagination.to')} <span className="fw-semibold text-dark">{Math.min(page * limit, totalVendors)}</span> {t('stock.reports.vendors.pagination.of')} <span className="fw-semibold text-dark">{totalVendors}</span> {t('stock.reports.vendors.pagination.vendors')}
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

            <VendorPerformanceModal
                show={showModal}
                onHide={() => setShowModal(false)}
                vendor={selectedVendor}
            />
        </div>
    );
};

export default VendorReports;
