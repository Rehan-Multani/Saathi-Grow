import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Form, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { Download, IndianRupee, Wallet, TrendingUp, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAdminVendorEarnings } from '../../api/reportApi';
import { toast } from 'react-toastify';

const VendorEarnings = () => {
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All Vendors');
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchEarnings = useCallback(async () => {
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const res = await getAdminVendorEarnings(adminUser.token, {
                page,
                limit,
                status: statusFilter
            });
            if (res.success) {
                setData(res);
            }
        } catch (error) {
            console.error('Fetch Vendor Earnings Error:', error);
            toast.error('Failed to load vendor earnings');
        } finally {
            setLoading(false);
        }
    }, [adminUser, page, statusFilter]);

    useEffect(() => {
        fetchEarnings();
    }, [fetchEarnings]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const handleExport = () => {
        if (!data?.payouts || data.payouts.length === 0) {
            toast.info('No data to export');
            return;
        }

        const headers = ['Payout ID', 'Vendor', 'Date', 'Amount', 'Method', 'Reference', 'Status'];
        const csvRows = data.payouts.map(row => [
            row.payoutId,
            `"${row.vendor}"`,
            row.date,
            row.amount,
            row.method,
            `"${row.reference || '-'}"`,
            row.status
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');

        Swal.fire({
            title: 'Generating CSV',
            text: 'Preparing your vendor statement...',
            icon: 'info',
            timer: 1200,
            showConfirmButton: false,
            timerProgressBar: true,
            didOpen: () => Swal.showLoading()
        }).then(() => {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `vendor_payouts_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            Swal.fire({
                title: 'Success!',
                text: 'Vendor CSV statement has been downloaded.',
                icon: 'success',
                confirmButtonColor: '#0c831f'
            });
        });
    };

    if (loading && !data) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    const { stats, payouts, pagination } = data || { 
        stats: { totalPaidOut: 0, pendingDue: 0, commissionEarned: 0 },
        payouts: [],
        pagination: { total: 0, totalPages: 1 }
    };

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary d-none d-md-flex">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1 text-dark text-nowrap">Vendor Earnings</h4>
                        <p className="text-muted small mb-0 d-none d-sm-block">Manage vendor payouts, commissions, and settlement history.</p>
                    </div>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto align-items-stretch align-items-sm-center justify-content-md-end">
                    <div className="flex-grow-1 flex-sm-grow-0" style={{ minWidth: '200px' }}>
                        <Form.Select
                            size="sm"
                            className="shadow-sm border bg-white px-3 py-2 w-100 fw-medium text-dark"
                            style={{ height: '40px', cursor: 'pointer' }}
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="All Vendors">All Vendors</option>
                            <option value="Pending Payouts">Pending Payouts</option>
                            <option value="Completed Payouts">Completed Payouts</option>
                        </Form.Select>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        className="d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm text-nowrap"
                        style={{ height: '40px' }}
                        onClick={handleExport}
                    >
                        <Download size={16} /> Export Statement
                    </Button>
                </div>
            </div>

            {/* Overall Stats */}
            <Row className="g-3 mb-4">
                <Col xs={12} sm={6} md={4}>
                    <Card className="border-0 shadow-sm h-100 border-start border-primary border-4">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-3 text-primary">
                                <IndianRupee size={24} />
                            </div>
                            <div>
                                <div className="text-uppercase small fw-bold text-muted mb-1">Total Paid Out</div>
                                <h3 className="fw-bold mb-0">{formatCurrency(stats.totalPaidOut)}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={4}>
                    <Card className="border-0 shadow-sm h-100 border-start border-warning border-4">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="bg-warning bg-opacity-10 rounded-circle p-3 text-warning">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <div className="text-uppercase small fw-bold text-muted mb-1">Pending Due</div>
                                <h3 className="fw-bold mb-0 text-dark">{formatCurrency(stats.pendingDue)}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} md={4}>
                    <Card className="border-0 shadow-sm h-100 border-start border-success border-4">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="bg-success bg-opacity-10 rounded-circle p-3 text-success">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <div className="text-uppercase small fw-bold text-muted mb-1">Commission Earned</div>
                                <h3 className="fw-bold mb-0">{formatCurrency(stats.commissionEarned)}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Payout Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">Recent Payout Settlements</h6>
                    {loading && <Spinner animation="border" size="sm" variant="primary" />}
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                            <tr>
                                <th className="ps-4 border-0 py-3">Payout ID</th>
                                <th className="border-0 py-3">Vendor</th>
                                <th className="border-0 py-3">Requested Date</th>
                                <th className="border-0 py-3">Method</th>
                                <th className="border-0 py-3">Net Payout</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.length > 0 ? payouts.map((p, idx) => (
                                <tr key={idx} className="cursor-pointer">
                                    <td className="ps-4 fw-bold font-monospace text-secondary">
                                        <div className="d-flex align-items-center gap-1">
                                            <Hash size={14} className="text-muted" />
                                            {p.payoutId}
                                        </div>
                                    </td>
                                    <td className="fw-medium text-dark">{p.vendor}</td>
                                    <td>
                                        <div className="bg-light border rounded px-2 py-1 small d-inline-block text-secondary">
                                            {p.date}
                                        </div>
                                    </td>
                                    <td className="small">{p.method}</td>
                                    <td className="fw-bold text-success">{formatCurrency(p.amount)}</td>
                                    <td>
                                        <Badge
                                            bg={p.status === 'Paid' ? 'success' : p.status === 'Pending' ? 'warning' : 'danger'}
                                            className="rounded-pill fw-normal px-3 py-1 shadow-sm"
                                        >
                                            {p.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="btn-icon-soft text-primary px-3 shadow-none overflow-hidden"
                                            onClick={() => navigate(`/admin/analytics/earnings/${p.id}`)}
                                        >
                                            Details
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        No payout records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>

                {/* Pagination Controls */}
                {pagination.total > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            Showing <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> to <span className="fw-semibold text-dark">{Math.min(page * limit, pagination.total)}</span> of <span className="fw-semibold text-dark">{pagination.total}</span> payouts
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
                                    return [...Array(pagination.totalPages)].map((_, i) => {
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
                                    });
                                })()}
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

export default VendorEarnings;
