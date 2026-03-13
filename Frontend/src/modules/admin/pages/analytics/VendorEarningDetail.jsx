import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Button, Row, Col, Badge, ProgressBar, Spinner } from 'react-bootstrap';
import {
    Download,
    ArrowLeft,
    IndianRupee,
    Calendar,
    TrendingUp,
    CreditCard,
    FileText,
    ArrowUpRight,
    ShoppingBag
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAdminVendorPayoutDetail } from '../../api/reportApi';
import { toast } from 'react-toastify';

const VendorEarningDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!adminUser?.token || !id) return;
            setLoading(true);
            try {
                const res = await getAdminVendorPayoutDetail(adminUser.token, id);
                if (res.success) {
                    setData(res);
                }
            } catch (error) {
                console.error('Fetch Payout Detail Error:', error);
                toast.error('Failed to load payout details');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [adminUser, id]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!data || !data.payout) {
        return (
            <div className="p-4 text-center">
                <h4 className="text-muted">No payout details found.</h4>
                <Button variant="primary" onClick={() => navigate(-1)} className="mt-3">Go Back</Button>
            </div>
        );
    }

    const { payout, recentOrders, stats } = data;
    const vendor = payout.vendor || {};
    const bank = vendor.bankAccount || {};

    return (
        <div className="p-2 p-md-4">
            <style>
                {`
                    @media print {
                        .no-print, .btn, .breadcrumb, .sidebar, .navbar {
                            display: none !important;
                        }
                        .card {
                            border: 1px solid #eee !important;
                            box-shadow: none !important;
                        }
                        body {
                            background: white !important;
                            padding: 0 !important;
                        }
                        .p-md-4 {
                            padding: 0 !important;
                        }
                    }
                `}
            </style>
            
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 no-print">
                <div className="d-flex align-items-center gap-3">
                    <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle p-2 shadow-sm border"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h4 className="fw-bold mb-1 text-dark">{vendor.storeName || 'Vendor Detail'}</h4>
                        <p className="text-muted small mb-0">Payout Statement - {payout.payoutId}</p>
                    </div>
                </div>
                <div className="d-flex gap-2 w-100 w-md-auto">
                    <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0 justify-content-center px-3 shadow-sm" onClick={handlePrint}>
                        <FileText size={16} /> Print Receipt
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <Row className="g-3 mb-4">
                <Col xs={12} sm={6} lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="text-muted small text-uppercase fw-bold mb-2">Vendor Total Sales</div>
                            <h3 className="fw-bold mb-0 text-dark">{formatCurrency(stats.totalSales)}</h3>
                            <div className="small mt-2 text-success d-flex align-items-center gap-1">
                                <ArrowUpRight size={14} /> {stats.totalItems || 0} items sold in total
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={4}>
                    <Card className="border-0 shadow-sm h-100 text-white" style={{ background: 'linear-gradient(45deg, #10b981, #059669)' }}>
                        <Card.Body>
                            <div className="text-white-50 small text-uppercase fw-bold mb-2">Net Payout Amount</div>
                            <h3 className="fw-bold mb-0">{formatCurrency(payout.amount)}</h3>
                            <div className="small mt-2 d-flex align-items-center gap-1">
                                <Badge bg="white" text="success" className="fw-normal">{payout.status}</Badge>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={12} lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="text-muted small text-uppercase fw-bold mb-2">Platform Comm.</div>
                            <h3 className="fw-bold mb-0 text-danger">{formatCurrency(stats.totalComm)}</h3>
                            <div className="small mt-2 text-muted">Platform revenue from this vendor</div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                {/* Transaction List */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm overflow-hidden h-100">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                <ShoppingBag size={18} className="text-primary" />
                                Recent Delivered Orders
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="ps-4 border-0 py-3">Order ID</th>
                                        <th className="border-0 py-3">Date</th>
                                        <th className="border-0 py-3">Items</th>
                                        <th className="border-0 py-3">Order Type</th>
                                        <th className="border-0 py-3 text-end pe-4">Vendor Share</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length > 0 ? recentOrders.map((tr, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-4 fw-bold text-primary">{tr.orderId}</td>
                                            <td className="small text-muted">{tr.createdAt.split('T')[0]}</td>
                                            <td>
                                                <Badge bg="light" text="dark" className="border fw-normal">{tr.items?.length || 0}</Badge>
                                            </td>
                                            <td className="small">{tr.orderType || 'Standard'}</td>
                                            <td className="text-end pe-4 fw-bold">{formatCurrency(tr.vendorPayoutAmount)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted">No recent orders found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Settlement Info */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                <CreditCard size={18} className="text-primary" />
                                Settlement Details
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="bg-light p-3 rounded-3 mb-3 border border-dashed text-center">
                                <div className="text-muted small text-uppercase mb-1">Status</div>
                                <Badge bg={payout.status === 'Paid' ? 'success' : 'warning'} className="px-3 py-2 rounded-pill shadow-sm">
                                    {payout.status}
                                </Badge>
                                <div className="mt-2 small text-muted">Requested on {payout.createdAt.split('T')[0]}</div>
                            </div>

                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                    <span className="text-muted small">Vendor Bank</span>
                                    <span className="fw-bold small">{bank.bankName || 'Not Added'}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                    <span className="text-muted small">Account No</span>
                                    <span className="fw-bold small font-monospace">{bank.accountNumber || payout.upiId || 'N/A'}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                    <span className="text-muted small">Payment Method</span>
                                    <span className="fw-bold small">{payout.paymentMethod}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                    <span className="text-muted small">Reference No</span>
                                    <span className="fw-bold small font-monospace text-primary">{payout.referenceNumber || '-'}</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm bg-light">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="bg-white p-2 rounded shadow-sm">
                                    <TrendingUp size={20} className="text-primary" />
                                </div>
                                <h6 className="mb-0 fw-bold">Note / Instructions</h6>
                            </div>
                            <p className="small text-muted mb-0">
                                {payout.note || "No additional notes provided for this payout settlemet."}
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default VendorEarningDetail;
