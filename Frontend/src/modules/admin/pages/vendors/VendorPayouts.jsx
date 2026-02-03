import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import { Download, IndianRupee, CheckCircle, Clock, Wallet } from 'lucide-react';
import Swal from 'sweetalert2';

const PAYOUTS_MOCK = [
    { id: 'PAY-8801', vendor: 'Fresh Farms Ltd', amount: '₹1,250.00', date: '2023-11-01', status: 'Paid', method: 'Bank Transfer', utr: 'UTR983241' },
    { id: 'PAY-8802', vendor: 'Tech World', amount: '₹3,400.00', date: '2023-10-25', status: 'Processing', method: 'PayPal', utr: '-' },
    { id: 'PAY-8803', vendor: 'Fresh Farms Ltd', amount: '₹900.00', date: '2023-10-15', status: 'Paid', method: 'Bank Transfer', utr: 'UTR772134' },
    { id: 'PAY-8804', vendor: 'Urban Styles', amount: '₹450.00', date: '2023-10-10', status: 'Failed', method: 'Bank Transfer', utr: '-', error: 'Invalid Account' },
];

const VendorPayouts = () => {
    const navigate = useNavigate();

    const handleExport = () => {
        const headers = ['Payout ID', 'Vendor', 'Amount', 'Date', 'Method', 'Reference No.', 'Status'];
        const csvRows = PAYOUTS_MOCK.map(p => [
            p.id,
            `"${p.vendor}"`,
            `"${p.amount}"`,
            p.date,
            `"${p.method}"`,
            `"${p.utr}"`,
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
                <Button
                    variant="outline-primary"
                    size="sm"
                    className="d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm py-2"
                    onClick={handleExport}
                >
                    <Download size={16} /> Export History
                </Button>
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
                                <h3 className="fw-bold mb-0">₹1,85,900</h3>
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
                                <h3 className="fw-bold mb-0 text-info">₹12,400</h3>
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
                                <h3 className="fw-bold mb-0">₹45,200</h3>
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
                            {PAYOUTS_MOCK.map((p, idx) => (
                                <tr key={idx} className="cursor-pointer" onClick={() => navigate(`${p.id}`)}>
                                    <td className="ps-4">
                                        <span className="fw-bold font-monospace text-primary">{p.id}</span>
                                    </td>
                                    <td>
                                        <div className="fw-medium text-dark">{p.vendor}</div>
                                        <div className="small text-muted d-none d-sm-block">{p.method}</div>
                                    </td>
                                    <td className="fw-bold text-dark">{p.amount}</td>
                                    <td className="text-muted small">{p.date}</td>
                                    <td className="small font-monospace">
                                        {p.utr === '-' ? (
                                            <span className="text-muted italic opacity-50">Pending</span>
                                        ) : (
                                            <span className="bg-light border px-2 py-0.5 rounded text-secondary">{p.utr}</span>
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
                                                navigate(`${p.id}`);
                                            }}
                                        >
                                            View Details
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

export default VendorPayouts;
