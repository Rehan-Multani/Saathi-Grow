import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Table, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import {
    Download, IndianRupee, CheckCircle, Clock, Wallet,
    ChevronLeft, ChevronRight, XCircle, AlertCircle, Check, X, Filter
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getPayouts, approvePayoutRequest, rejectPayoutRequest } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const STATUS_BADGE = {
    Pending:    { bg: 'warning',  label: 'Pending Review' },
    Processing: { bg: 'info',     label: 'Processing' },
    Paid:       { bg: 'success',  label: 'Paid' },
    Rejected:   { bg: 'danger',   label: 'Rejected' },
    Failed:     { bg: 'secondary',label: 'Failed' },
};

const VendorPayouts = () => {
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(true);
    const [payouts, setPayouts] = useState([]);
    const [stats, setStats] = useState({ pending: 0, processing: 0, paid: 0, rejected: 0 });
    const [page, setPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('');
    const limit = 15;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    // Action modal state
    const [actionModal, setActionModal] = useState({ show: false, payout: null, type: null });
    const [refNum, setRefNum] = useState('');
    const [actionNote, setActionNote] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchPayouts = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page, limit, includeMeta: true, includeStats: true };
            if (filterStatus) params.status = filterStatus;

            const res = await getPayouts(adminUser.token, params, { paginated: true });
            setPayouts(Array.isArray(res.payouts) ? res.payouts : []);
            setPagination(res.pagination || { total: 0, totalPages: 1, page, limit });

            if (res.stats?.totals) {
                setStats({
                    pending:    res.stats.totals.pending    || 0,
                    processing: res.stats.totals.processing || 0,
                    paid:       res.stats.totals.paid       || 0,
                    rejected:   res.stats.totals.rejected   || 0,
                });
            }
        } catch (error) {
            toast.error('Failed to load payout requests');
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, filterStatus]);

    useEffect(() => {
        if (adminUser?.token) fetchPayouts();
    }, [fetchPayouts]);

    const openApproveModal = (payout) => {
        setRefNum('');
        setActionNote('');
        setActionModal({ show: true, payout, type: 'approve' });
    };

    const openRejectModal = (payout) => {
        setActionNote('');
        setActionModal({ show: true, payout, type: 'reject' });
    };

    const closeModal = () => setActionModal({ show: false, payout: null, type: null });

    const handleApprove = async () => {
        if (!refNum.trim()) {
            toast.warning('Please enter a reference/transaction number');
            return;
        }
        setActionLoading(true);
        try {
            await approvePayoutRequest(adminUser.token, actionModal.payout._id, refNum.trim(), actionNote.trim());
            toast.success(`✅ Payout of ₹${actionModal.payout.amount} approved and processed!`);
            closeModal();
            fetchPayouts();
        } catch (err) {
            toast.error(err.message || 'Failed to approve payout');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!actionNote.trim()) {
            toast.warning('Please provide a reason for rejection');
            return;
        }
        setActionLoading(true);
        try {
            await rejectPayoutRequest(adminUser.token, actionModal.payout._id, actionNote.trim());
            toast.info(`Payout request rejected.`);
            closeModal();
            fetchPayouts();
        } catch (err) {
            toast.error(err.message || 'Failed to reject payout');
        } finally {
            setActionLoading(false);
        }
    };

    const handleExport = () => {
        const headers = ['Payout ID', 'Vendor', 'Amount', 'UPI ID', 'Date', 'Status', 'Reference', 'Note'];
        const csvRows = payouts.map(p => [
            p._id,
            `"${p.vendor?.storeName || 'Unknown'}"`,
            p.amount,
            `"${p.upiId || p.paymentMethod}"`,
            new Date(p.payoutDate || p.createdAt).toLocaleDateString(),
            p.status,
            `"${p.referenceNumber}"`,
            `"${p.note || ''}"`,
        ].join(','));

        const blob = new Blob([[headers.join(','), ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vendor_payouts_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Exported successfully');
    };

    const pendingCount = payouts.filter(p => p.status === 'Pending').length;

    if (loading && payouts.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="success" />
            </div>
        );
    }

    return (
        <div className="p-2 p-md-4">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-success bg-opacity-10 p-3 rounded-3 text-success d-none d-md-flex">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                                Vendor Payouts
                                {pendingCount > 0 && (
                                    <Badge bg="warning" text="dark" className="ms-2 rounded-pill" style={{ fontSize: '0.7rem' }}>
                                        {pendingCount} Pending
                                    </Badge>
                                )}
                            </h4>
                            <PageInfoTooltip info={pageInfoData.vendorPayouts} />
                        </div>
                        <p className="text-muted small mb-0">Review and process vendor withdrawal requests.</p>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-secondary" size="sm" className="d-flex align-items-center gap-2"
                        onClick={handleExport}>
                        <Download size={16} /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <Row className="g-3 mb-4">
                <Col xs={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100 border-start border-warning border-4">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="bg-warning bg-opacity-10 rounded-circle p-3 text-warning">
                                <Clock size={22} />
                            </div>
                            <div>
                                <div className="text-uppercase small fw-bold text-muted mb-1">Pending</div>
                                <h4 className="fw-bold mb-0 text-warning">₹{stats.pending.toLocaleString()}</h4>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100 border-start border-info border-4">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="bg-info bg-opacity-10 rounded-circle p-3 text-info">
                                <IndianRupee size={22} />
                            </div>
                            <div>
                                <div className="text-uppercase small fw-bold text-muted mb-1">Processing</div>
                                <h4 className="fw-bold mb-0 text-info">₹{stats.processing.toLocaleString()}</h4>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100 border-start border-success border-4">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="bg-success bg-opacity-10 rounded-circle p-3 text-success">
                                <CheckCircle size={22} />
                            </div>
                            <div>
                                <div className="text-uppercase small fw-bold text-muted mb-1">Total Paid</div>
                                <h4 className="fw-bold mb-0">₹{stats.paid.toLocaleString()}</h4>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100 border-start border-danger border-4">
                        <Card.Body className="d-flex align-items-center gap-3">
                            <div className="bg-danger bg-opacity-10 rounded-circle p-3 text-danger">
                                <XCircle size={22} />
                            </div>
                            <div>
                                <div className="text-uppercase small fw-bold text-muted mb-1">Rejected</div>
                                <h4 className="fw-bold mb-0 text-danger">₹{stats.rejected.toLocaleString()}</h4>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Header className="bg-white py-3 border-0 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h6 className="mb-0 fw-bold text-dark">Withdrawal Requests</h6>
                    <div className="d-flex align-items-center gap-2">
                        <Filter size={14} className="text-muted" />
                        <Form.Select size="sm" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                            style={{ width: '160px' }}>
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Paid">Paid</option>
                            <option value="Rejected">Rejected</option>
                        </Form.Select>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Request ID</th>
                                <th className="border-0 py-3">Vendor</th>
                                <th className="border-0 py-3">Amount</th>
                                <th className="border-0 py-3">Payout Destination</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3">Reference</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-5"><Spinner size="sm" animation="border" variant="success" /></td></tr>
                            ) : payouts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        <Download size={40} className="text-light mb-3 d-block mx-auto" />
                                        <p className="mb-0">No payout records found.</p>
                                    </td>
                                </tr>
                            ) : payouts.map((p) => {
                                const badgeCfg = STATUS_BADGE[p.status] || STATUS_BADGE.Pending;
                                const isPending = p.status === 'Pending';
                                // Parse bank details from note if it's a Bank Transfer
                                const isBankTransfer = p.paymentMethod === 'Bank Transfer';
                                const displayDestination = p.upiId || p.paymentMethod || '—';
                                return (
                                    <tr key={p._id} className={isPending ? '' : ''} style={isPending ? { background: '#fffbeb' } : {}}>
                                        <td className="ps-4">
                                            <span className="fw-bold font-monospace text-primary" style={{ fontSize: '11px' }}>
                                                #{p._id.substring(p._id.length - 8).toUpperCase()}
                                            </span>
                                            <div className="text-muted" style={{ fontSize: '10px' }}>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                        </td>
                                        <td>
                                            <div className="fw-medium text-dark" style={{ fontSize: '13px' }}>{p.vendor?.storeName || 'Unknown'}</div>
                                            <div className="text-muted" style={{ fontSize: '10px' }}>{p.vendor?.ownerName}</div>
                                        </td>
                                        <td className="fw-bold text-dark">₹{p.amount?.toLocaleString()}</td>
                                        <td style={{ maxWidth: '180px' }}>
                                            <div className="d-flex align-items-start gap-1">
                                                <Badge bg={p.paymentMethod === 'UPI' ? 'info' : 'secondary'} className="fw-normal mt-1 flex-shrink-0" style={{ fontSize: '9px' }}>
                                                    {p.paymentMethod || 'UPI'}
                                                </Badge>
                                                <div>
                                                    <div className="font-monospace text-dark" style={{ fontSize: '11px', wordBreak: 'break-all' }}>{displayDestination}</div>
                                                    {p.note && isBankTransfer && (
                                                        <div className="text-muted" style={{ fontSize: '10px' }}>{p.note}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg={badgeCfg.bg} className="rounded-pill fw-normal px-2 py-1 shadow-sm" style={{ fontSize: '11px' }}>
                                                {badgeCfg.label}
                                            </Badge>
                                        </td>
                                        <td>
                                            {p.referenceNumber && p.referenceNumber !== '-' ? (
                                                <span className="font-monospace text-success" style={{ fontSize: '11px' }}>{p.referenceNumber}</span>
                                            ) : <span className="text-muted" style={{ fontSize: '11px' }}>—</span>}
                                        </td>
                                        <td className="text-end pe-4">
                                            {isPending ? (
                                                <div className="d-flex gap-1 justify-content-end">
                                                    <Button variant="success" size="sm" id={`approve-payout-${p._id}`}
                                                        className="d-flex align-items-center gap-1 px-2"
                                                        onClick={(e) => { e.stopPropagation(); openApproveModal(p); }}>
                                                        <Check size={13} /> Approve
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" id={`reject-payout-${p._id}`}
                                                        className="d-flex align-items-center gap-1 px-2"
                                                        onClick={(e) => { e.stopPropagation(); openRejectModal(p); }}>
                                                        <X size={13} /> Reject
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="light" size="sm"
                                                    className="text-primary px-2 border shadow-none"
                                                    onClick={() => navigate(`${p._id}`)}>
                                                    Details
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Card.Body>

                {/* Pagination */}
                {!loading && pagination.total > 0 && (
                    <div className="bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div className="text-secondary small">
                            Showing <span className="fw-semibold text-dark">{((page - 1) * limit) + 1}</span> to <span className="fw-semibold text-dark">{Math.min(page * limit, pagination.total)}</span> of <span className="fw-semibold text-dark">{pagination.total}</span> requests
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Button variant="light" className="p-2 rounded border shadow-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                <ChevronLeft size={16} />
                            </Button>
                            {[...Array(pagination.totalPages || 1)].map((_, i) => {
                                const p = i + 1;
                                if (p === 1 || p === pagination.totalPages || Math.abs(page - p) <= 1) {
                                    return (
                                        <Button key={p} variant={page === p ? 'primary' : 'light'}
                                            className={`rounded shadow-sm ${page === p ? 'fw-bold' : 'text-secondary border'}`}
                                            style={{ width: '36px', height: '36px', padding: 0 }}
                                            onClick={() => setPage(p)}>
                                            {p}
                                        </Button>
                                    );
                                } else if (p === page - 2 || p === page + 2) {
                                    return <span key={p} className="text-muted px-1">...</span>;
                                }
                                return null;
                            })}
                            <Button variant="light" className="p-2 rounded border shadow-sm" onClick={() => setPage(p => Math.min(pagination.totalPages || 1, p + 1))} disabled={page === pagination.totalPages}>
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* ── APPROVE MODAL ── */}
            <Modal show={actionModal.show && actionModal.type === 'approve'} onHide={closeModal} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2 text-success">
                        <CheckCircle size={20} /> Approve Withdrawal
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    {actionModal.payout && (
                        <div className="bg-light rounded-3 p-3 mb-3">
                            <div className="d-flex justify-content-between mb-1">
                                <span className="text-muted small">Vendor</span>
                                <span className="fw-medium small">{actionModal.payout.vendor?.storeName}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                                <span className="text-muted small">Amount</span>
                                <span className="fw-bold text-success">₹{actionModal.payout.amount?.toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted small">UPI ID</span>
                                <span className="font-monospace small">{actionModal.payout.upiId || 'N/A'}</span>
                            </div>
                        </div>
                    )}

                    <div className="alert alert-warning d-flex gap-2 py-2 small" style={{ fontSize: '12px' }}>
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                        <span>Approving will <strong>deduct ₹{actionModal.payout?.amount} from vendor's wallet balance</strong> and mark this request as Paid.</span>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small">Transaction / Reference Number <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            id="admin-payout-refnum"
                            type="text"
                            placeholder="Enter UTR / transaction ID"
                            value={refNum}
                            onChange={e => setRefNum(e.target.value)}
                            required
                        />
                        <Form.Text className="text-muted">This will be shared with the vendor for tracking.</Form.Text>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="fw-semibold small">Note (optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Any additional note..."
                            value={actionNote}
                            onChange={e => setActionNote(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={closeModal} disabled={actionLoading}>Cancel</Button>
                    <Button
                        id="admin-payout-approve-confirm"
                        variant="success"
                        onClick={handleApprove}
                        disabled={actionLoading || !refNum.trim()}
                        className="d-flex align-items-center gap-2 px-4"
                    >
                        {actionLoading ? <Spinner size="sm" animation="border" /> : <Check size={16} />}
                        Confirm &amp; Pay
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ── REJECT MODAL ── */}
            <Modal show={actionModal.show && actionModal.type === 'reject'} onHide={closeModal} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2 text-danger">
                        <XCircle size={20} /> Reject Request
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    {actionModal.payout && (
                        <div className="bg-light rounded-3 p-3 mb-3">
                            <div className="d-flex justify-content-between mb-1">
                                <span className="text-muted small">Vendor</span>
                                <span className="fw-medium small">{actionModal.payout.vendor?.storeName}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted small">Amount</span>
                                <span className="fw-bold">₹{actionModal.payout.amount?.toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    <Form.Group>
                        <Form.Label className="fw-semibold small">Rejection Reason <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            id="admin-payout-reject-reason"
                            as="textarea"
                            rows={3}
                            placeholder="Explain why this request is being rejected..."
                            value={actionNote}
                            onChange={e => setActionNote(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={closeModal} disabled={actionLoading}>Cancel</Button>
                    <Button
                        id="admin-payout-reject-confirm"
                        variant="danger"
                        onClick={handleReject}
                        disabled={actionLoading || !actionNote.trim()}
                        className="d-flex align-items-center gap-2 px-4"
                    >
                        {actionLoading ? <Spinner size="sm" animation="border" /> : <X size={16} />}
                        Confirm Rejection
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default VendorPayouts;
