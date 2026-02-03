import React from 'react';
import { Card, Table, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { Download, IndianRupee, Wallet, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const EARNINGS_DATA = [
    { id: 'PAY-1001', vendor: 'Fresh Farms & Co.', period: 'Oct 2023', sales: '₹15,000', comm: '₹1,500', payout: '₹13,500', status: 'Paid' },
    { id: 'PAY-1002', vendor: 'Organic Spices Ltd.', period: 'Oct 2023', sales: '₹5,000', comm: '₹500', payout: '₹4,500', status: 'Pending' },
    { id: 'PAY-1003', vendor: 'City Snacks Wholesale', period: 'Oct 2023', sales: '₹2,000', comm: '₹200', payout: '₹1,800', status: 'Paid' },
];

const VendorEarnings = () => {
    const navigate = useNavigate();

    const handleExport = () => {
        // CSV Generation Logic
        const headers = ['Payout ID', 'Vendor', 'Period', 'Gross Sales', 'Commission', 'Net Payout', 'Status'];
        const csvRows = EARNINGS_DATA.map(row => [
            row.id,
            `"${row.vendor}"`,
            row.period,
            `"${row.sales}"`,
            `"${row.comm}"`,
            `"${row.payout}"`,
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
            link.setAttribute('download', `vendor_statement_${new Date().toISOString().split('T')[0]}.csv`);
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
                    <div className="flex-grow-1 flex-sm-grow-0" style={{ minWidth: '180px' }}>
                        <Form.Select
                            size="sm"
                            className="shadow-none border-0 bg-light px-3 py-2 w-100"
                            style={{ height: '40px' }}
                        >
                            <option>All Vendors</option>
                            <option>Pending Payouts</option>
                            <option>Completed Payouts</option>
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
                                <h3 className="fw-bold mb-0">₹2,45,600</h3>
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
                                <h3 className="fw-bold mb-0 text-dark">₹12,450</h3>
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
                                <h3 className="fw-bold mb-0">₹35,800</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Payout Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <Card.Header className="bg-white py-3 border-0">
                    <h6 className="mb-0 fw-bold">Recent Payout Settlements</h6>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase font-weight-bold">
                            <tr>
                                <th className="ps-4 border-0 py-3">Payout ID</th>
                                <th className="border-0 py-3">Vendor</th>
                                <th className="border-0 py-3">Period</th>
                                <th className="border-0 py-3">Gross Sales</th>
                                <th className="border-0 py-3 text-danger">Comm. (10%)</th>
                                <th className="border-0 py-3 fw-bold text-success">Net Payout</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {EARNINGS_DATA.map((p, idx) => (
                                <tr key={idx} className="cursor-pointer">
                                    <td className="ps-4 fw-bold font-monospace text-secondary" onClick={() => navigate(`${p.id}`)}>{p.id}</td>
                                    <td className="fw-medium text-dark" onClick={() => navigate(`${p.id}`)}>{p.vendor}</td>
                                    <td><div className="bg-light border rounded px-2 py-1 small d-inline-block text-secondary">{p.period}</div></td>
                                    <td>{p.sales}</td>
                                    <td className="text-danger">-{p.comm}</td>
                                    <td className="fw-bold text-success">{p.payout}</td>
                                    <td>
                                        <Badge
                                            bg={p.status === 'Paid' ? 'success' : 'warning'}
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
                                            onClick={() => navigate(`${p.id}`)}
                                        >
                                            Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default VendorEarnings;
