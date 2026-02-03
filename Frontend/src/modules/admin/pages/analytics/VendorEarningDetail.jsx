import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Button, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
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

const VendorEarningDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data for a specific vendor's payout detail
    const vendorData = {
        name: 'Fresh Farms & Co.',
        id: id || 'PAY-1001',
        period: 'October 2023',
        status: 'Paid',
        stats: {
            totalSales: '₹15,000.00',
            commission: '₹1,500.00',
            netPayout: '₹13,500.00',
            refunds: '₹450.00'
        },
        transactions: [
            { id: '#ORD-2001', date: '2023-10-25', items: 12, amount: '₹1,200', comm: '₹120', net: '₹1,080' },
            { id: '#ORD-2005', date: '2023-10-22', items: 8, amount: '₹850', comm: '₹85', net: '₹765' },
            { id: '#ORD-2010', date: '2023-10-18', items: 15, amount: '₹2,100', comm: '₹210', net: '₹1,890' },
            { id: '#ORD-2015', date: '2023-10-15', items: 5, amount: '₹450', comm: '₹45', net: '₹405' },
        ],
        settlement: {
            bank: 'HDFC Bank',
            account: '**** 5678',
            date: 'Oct 30, 2023',
            ref: 'UTR987234123'
        }
    };

    const handlePrint = () => {
        window.print();
    };

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
                        <h4 className="fw-bold mb-1 text-dark">{vendorData.name}</h4>
                        <p className="text-muted small mb-0">Payout Statement for {vendorData.period}</p>
                    </div>
                </div>
                <div className="d-flex gap-2 w-100 w-md-auto">
                    <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0 justify-content-center px-3 shadow-sm">
                        <Download size={16} /> Export PDF
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        className="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0 justify-content-center px-4 shadow-sm"
                        onClick={handlePrint}
                    >
                        <FileText size={16} /> Print Receipt
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <Row className="g-3 mb-4">
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="text-muted small text-uppercase fw-bold mb-2">Gross Sales</div>
                            <h3 className="fw-bold mb-0 text-dark">{vendorData.stats.totalSales}</h3>
                            <div className="small mt-2 text-success d-flex align-items-center gap-1">
                                <ArrowUpRight size={14} /> 40 items sold
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="text-muted small text-uppercase fw-bold mb-2">Commission (10%)</div>
                            <h3 className="fw-bold mb-0 text-danger">-{vendorData.stats.commission}</h3>
                            <div className="small mt-2 text-muted">Platform fee deducted</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100 bg-success text-white">
                        <Card.Body>
                            <div className="text-white-50 small text-uppercase fw-bold mb-2">Net Payout</div>
                            <h3 className="fw-bold mb-0">{vendorData.stats.netPayout}</h3>
                            <div className="small mt-2 d-flex align-items-center gap-1">
                                <Badge bg="white" text="success" className="fw-normal">Settled</Badge>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="text-muted small text-uppercase fw-bold mb-2">Refunds</div>
                            <h3 className="fw-bold mb-0 text-orange">{vendorData.stats.refunds}</h3>
                            <div className="small mt-2 text-muted">Adjusted in payout</div>
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
                                Order Wise Breakdown
                            </h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="ps-4 border-0 py-3">Order ID</th>
                                        <th className="border-0 py-3">Date</th>
                                        <th className="border-0 py-3 text-center">Items</th>
                                        <th className="border-0 py-3">Amount</th>
                                        <th className="border-0 py-3 text-end pe-4">Vendor Share</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendorData.transactions.map((tr, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-4 fw-bold text-primary">{tr.id}</td>
                                            <td className="small text-muted">{tr.date}</td>
                                            <td className="text-center">
                                                <Badge bg="light" text="dark" className="border fw-normal">{tr.items}</Badge>
                                            </td>
                                            <td>{tr.amount}</td>
                                            <td className="text-end pe-4 fw-bold">{tr.net}</td>
                                        </tr>
                                    ))}
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
                                <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm">
                                    {vendorData.status}
                                </Badge>
                                <div className="mt-2 small text-muted">Processed on {vendorData.settlement.date}</div>
                            </div>

                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                    <span className="text-muted small">Bank Name</span>
                                    <span className="fw-bold small">{vendorData.settlement.bank}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                    <span className="text-muted small">Account Number</span>
                                    <span className="fw-bold small font-monospace">{vendorData.settlement.account}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                    <span className="text-muted small">Reference No (UTR)</span>
                                    <span className="fw-bold small font-monospace text-primary">{vendorData.settlement.ref}</span>
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
                                <h6 className="mb-0 fw-bold">Performance Summary</h6>
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between small text-muted mb-1">
                                    <span>Sales Target</span>
                                    <span>85%</span>
                                </div>
                                <ProgressBar now={85} variant="primary" style={{ height: '6px' }} className="rounded-pill" />
                            </div>
                            <p className="small text-muted mb-0">
                                This vendor is performing <strong>15% better</strong> than the average in this category.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default VendorEarningDetail;
