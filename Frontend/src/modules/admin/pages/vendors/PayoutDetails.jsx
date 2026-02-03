import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Button, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import {
    Download,
    ArrowLeft,
    IndianRupee,
    Calendar,
    CheckCircle,
    FileText,
    CreditCard,
    Printer,
    User,
    Check
} from 'lucide-react';
import Swal from 'sweetalert2';

const PayoutDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data for a specific payout detail
    const payoutData = {
        id: id || 'PAY-8801',
        vendor: 'Fresh Farms Ltd',
        vendorId: 'VND-302',
        amount: '₹1,250.00',
        date: 'November 01, 2023',
        status: 'Paid',
        method: 'Bank Transfer (IMPS)',
        utr: 'UTR98324123849',
        bankDetails: {
            bank: 'HDFC Bank',
            account: '**** 5678',
            ifsc: 'HDFC0001234'
        },
        orders: [
            { id: '#ORD-9021', date: 'Oct 28', amount: '₹450', commission: '₹45', net: '₹405' },
            { id: '#ORD-9035', date: 'Oct 29', amount: '₹950', commission: '₹95', net: '₹845' },
        ]
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadCSV = () => {
        const headers = ['Order ID', 'Order Date', 'Subtotal', 'Commission', 'Net Payout'];
        const csvRows = payoutData.orders.map(o => [
            o.id,
            o.date,
            `"${o.amount}"`,
            `"${o.commission}"`,
            `"${o.net}"`
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');

        Swal.fire({
            title: 'Generating CSV',
            text: 'Preparing transaction breakdown...',
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
            link.download = `payout_breakdown_${payoutData.id}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            Swal.fire({
                title: 'Ready!',
                text: 'CSV breakdown has been downloaded.',
                icon: 'success',
                confirmButtonColor: '#0c831f'
            });
        });
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
                        <h4 className="fw-bold mb-1 text-dark">Payout Transaction</h4>
                        <p className="text-muted small mb-0">Invoice #{payoutData.id}</p>
                    </div>
                </div>
                <div className="d-flex gap-2 w-100 w-md-auto">
                    <Button
                        variant="outline-primary"
                        size="sm"
                        className="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0 justify-content-center px-3"
                        onClick={handleDownloadCSV}
                    >
                        <Download size={16} /> Download CSV
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        className="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0 justify-content-center px-4"
                        onClick={handlePrint}
                    >
                        <Printer size={16} /> Print Receipt
                    </Button>
                </div>
            </div>

            <Row className="g-4">
                {/* Left Column: Transaction Details */}
                <Col lg={8}>
                    {/* Status Highlights */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                                        <Check size={28} />
                                    </div>
                                    <div>
                                        <h3 className="fw-bold mb-0 text-dark">{payoutData.amount}</h3>
                                        <Badge bg="success" className="px-3 py-1 rounded-pill mt-1">Successfully Disbursed</Badge>
                                    </div>
                                </div>
                                <div className="text-end d-none d-sm-block">
                                    <div className="text-muted small mb-1">Settlement Date</div>
                                    <h6 className="fw-bold mb-0">{payoutData.date}</h6>
                                </div>
                            </div>

                            <hr />

                            <Row className="text-center g-3 py-2">
                                <Col xs={4}>
                                    <div className="text-muted small mb-1">Payment Method</div>
                                    <div className="fw-medium small">{payoutData.method}</div>
                                </Col>
                                <Col xs={4}>
                                    <div className="text-muted small mb-1">Bank Name</div>
                                    <div className="fw-medium small">{payoutData.bankDetails.bank}</div>
                                </Col>
                                <Col xs={4}>
                                    <div className="text-muted small mb-1">Reference ID</div>
                                    <div className="fw-bold small text-primary">{payoutData.utr}</div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Breakdown Table */}
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <Card.Header className="bg-white py-3 border-0 border-bottom">
                            <h6 className="mb-0 fw-bold">Settlement Breakdown</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                                    <tr>
                                        <th className="ps-4 border-0 py-3">Order ID</th>
                                        <th className="border-0 py-3">Order Date</th>
                                        <th className="border-0 py-3">Subtotal</th>
                                        <th className="border-0 py-3">Our Commission</th>
                                        <th className="border-0 py-3 text-end pe-4">Payout Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payoutData.orders.map((o, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-4 fw-medium text-primary">{o.id}</td>
                                            <td className="small text-muted">{o.date}</td>
                                            <td>{o.amount}</td>
                                            <td className="text-danger">-{o.commission}</td>
                                            <td className="text-end pe-4 fw-bold">{o.net}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-light-subtle">
                                        <td colSpan="4" className="ps-4 fw-bold py-3 text-end">Total Net Payable:</td>
                                        <td className="text-end pe-4 fw-bold text-success py-3" style={{ fontSize: '1.1rem' }}>{payoutData.amount}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column: Other Info */}
                <Col lg={4}>
                    {/* Vendor Info Card */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 fw-bold">Recipient Details</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="bg-light p-3 rounded-3">
                                    <User size={24} className="text-primary" />
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-1">{payoutData.vendor}</h6>
                                    <span className="text-muted small">Vendor ID: {payoutData.vendorId}</span>
                                </div>
                            </div>

                            <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 border-0 pb-2">
                                    <span className="text-muted small">Account ending in</span>
                                    <span className="fw-medium font-monospace">{payoutData.bankDetails.account}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 border-0 pb-2">
                                    <span className="text-muted small">IFSC Code</span>
                                    <span className="fw-medium font-monospace">{payoutData.bankDetails.ifsc}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 border-0">
                                    <span className="text-muted small">Transfer Type</span>
                                    <Badge bg="light" text="dark" className="border fw-normal">Online Transfer</Badge>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>

                    {/* Support Box */}
                    <Card className="border-0 shadow-sm bg-primary text-white">
                        <Card.Body className="p-4 text-center">
                            <div className="mb-3">
                                <FileText size={40} className="text-white-50" />
                            </div>
                            <h5 className="fw-bold">Need Help?</h5>
                            <p className="small text-white-50 mb-3">
                                If you have questions about this payout transaction, please contact our support team.
                            </p>
                            <Button variant="white" size="sm" className="w-100 bg-white text-primary fw-bold">
                                Raise a Query
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default PayoutDetails;
