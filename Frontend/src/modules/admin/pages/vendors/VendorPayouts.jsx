import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { Download, IndianRupee, CheckCircle, Clock, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { getPayouts } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const VendorPayouts = () => {
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(true);
    const [payouts, setPayouts] = useState([]);
    const [allPayouts, setAllPayouts] = useState([]);
    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                setLoading(true);
                const { payouts: payoutList, pagination: paginationData } = await getPayouts(
                    adminUser.token,
                    { page, limit },
                    { paginated: true }
                );
                setPayouts(Array.isArray(payoutList) ? payoutList : []);
                setPagination(paginationData || { total: 0, totalPages: 1, page, limit });
            } catch (error) {
                toast.error('Failed to load payout logs');
            } finally {
                setLoading(false);
            }
        };

        if (adminUser?.token) {
            fetchPayouts();
        }
    }, [adminUser.token, page]);

    useEffect(() => {
        const fetchPayoutStatsData = async () => {
            try {
                const data = await getPayouts(adminUser.token);
                setAllPayouts(Array.isArray(data) ? data : []);
            } catch (error) {
                // Keep table functional even if stats fetch fails
                setAllPayouts([]);
            }
        };

        if (adminUser?.token) {
            fetchPayoutStatsData();
        }
    }, [adminUser.token]);

    const stats = {
        total: allPayouts.reduce((acc, curr) => acc + (curr.status === 'Paid' ? curr.amount : 0), 0),
        processing: allPayouts.reduce((acc, curr) => acc + (curr.status === 'Processing' ? curr.amount : 0), 0),
        settledMonth: allPayouts.reduce((acc, curr) => {
            const date = new Date(curr.payoutDate);
            const now = new Date();
            if (curr.status === 'Paid' && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                return acc + curr.amount;
            }
            return acc;
        }, 0)
    };

    const handleExport = () => {
        const headers = ['Payout ID', 'Vendor', 'Amount', 'Date', 'Method', 'Reference No.', 'Status'];
        const csvRows = allPayouts.map(p => [
            p._id,
            `"${p.vendor?.storeName || 'Unknown'}"`,
            p.amount,
            new Date(p.payoutDate).toLocaleDateString(),
            `"${p.paymentMethod}"`,
            `"${p.referenceNumber}"`,
            p.status
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');

        Swal.fire({
            title: 'Exporting History',
            text: 'Downloading payout logs...',
            icon: 'info',
            timer: 1000,
            showConfirmButton: false,
            timerProgressBar: true,
            didOpen: () => Swal.showLoading()
        }).then(() => {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `payout_history_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            Swal.fire({
                title: 'Exported!',
                text: 'Payout history downloaded successfully.',
                icon: 'success',
                confirmButtonColor: '#0c831f'
            });
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="success" />
            </div>
        );
    }

    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-success bg-opacity-10 p-3 rounded-3 text-success d-none d-md-flex">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1 text-dark">Payout History</h4>
                        <p className="text-muted small mb-0">Track all financial transfers to your vendors.</p>
                    </div>
                </div>

            </div>

            {/* Quick Stats */}
            <Row className="g-3 mb-4">
                <Col xs={12} sm={6} lg={4}>
                    <Card className="border-0 shadow-sm h-100 border-start border-primary border-4">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-3 text-primary">
                                <IndianRupee size={24} />
                            </div>
                            <div>
                                <div className="text-uppercase small fw-bold text-muted mb-1">Total Disbursed</div>
                                <h3 className="fw-bold mb-0">₹{stats.total.toLocaleString()}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={4}>
                    <Card className="border-0 shadow-sm h-100 border-start border-info border-4">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="bg-info bg-opacity-10 rounded-circle p-3 text-info">
                                <Clock size={24} />
                            </div>
                            <div>
                                <div className="text-uppercase small fw-bold text-muted mb-1">In Processing</div>
                                <h3 className="fw-bold mb-0 text-info">₹{stats.processing.toLocaleString()}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} lg={4}>
                    <Card className="border-0 shadow-sm h-100 border-start border-success border-4">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="bg-success bg-opacity-10 rounded-circle p-3 text-success">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <div className="text-uppercase small fw-bold text-muted mb-1">Settled This Month</div>
                                <h3 className="fw-bold mb-0">₹{stats.settledMonth.toLocaleString()}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Header className="bg-white py-3 border-0">
                    <h6 className="mb-0 fw-bold text-dark">Recent Disbursements</h6>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                            <tr>
                                <th className="ps-4 border-0 py-3">Payout ID</th>
                                <th className="border-0 py-3">Vendor Name</th>
                                <th className="border-0 py-3">Amount</th>
                                <th className="border-0 py-3">Date</th>
                                <th className="border-0 py-3">Reference No.</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.length > 0 ? payouts.map((p, idx) => (
                                <tr key={idx} className="cursor-pointer" onClick={() => navigate(`${p._id}`)}>
                                    <td className="ps-4">
                                        <span className="fw-bold font-monospace text-primary text-xs">#{p._id.substring(p._id.length - 8)}</span>
                                    </td>
                                    <td>
                                        <div className="fw-medium text-dark">{p.vendor?.storeName || 'Unknown'}</div>
                                        <div className="small text-muted d-none d-sm-block" style={{ fontSize: '10px' }}>{p.paymentMethod}</div>
                                    </td>
                                    <td className="fw-bold text-dark">₹{p.amount}</td>
                                    <td className="text-muted small">{new Date(p.payoutDate).toLocaleDateString()}</td>
                                    <td className="small font-monospace">
                                        {p.referenceNumber === '-' ? (
                                            <span className="text-muted italic opacity-50">Pending</span>
                                        ) : (
                                            <span className="bg-light border px-2 py-0.5 rounded text-secondary">{p.referenceNumber}</span>
                                        )}
                                    </td>
                                    <td>
                                        <Badge bg={
                                            p.status === 'Paid' ? 'success' :
                                                p.status === 'Processing' ? 'info' : 'danger'
                                        } className="rounded-pill fw-normal px-3 py-1 shadow-sm">
                                            {p.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="btn-icon-soft text-primary px-3 border shadow-none"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`${p._id}`);
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        <Download size={48} className="text-light mb-3" />
                                        <p className="mb-0">No payout records found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
                {!loading && pagination.total > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            Showing <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> to <span className="fw-semibold text-dark">{Math.min(page * limit, pagination.total)}</span> of <span className="fw-semibold text-dark">{pagination.total}</span> payouts
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Button
                                variant="light"
                                className={`d-flex align-items-center justify-content-center p-2 rounded border shadow-sm ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={16} />
                            </Button>

                            <div className="d-flex align-items-center gap-1">
                                {[...Array(pagination.totalPages || 1)].map((_, i) => {
                                    const p = i + 1;
                                    const isFirstPage = p === 1;
                                    const isLastPage = p === pagination.totalPages;
                                    const isNearCurrent = Math.abs(page - p) <= 1;

                                    if (isFirstPage || isLastPage || isNearCurrent) {
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
                                onClick={() => setPage((p) => Math.min(pagination.totalPages || 1, p + 1))}
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

export default VendorPayouts;
