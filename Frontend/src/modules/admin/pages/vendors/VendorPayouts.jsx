import React from 'react';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import { Download, DollarSign, CheckCircle, Clock } from 'lucide-react';

const PAYOUTS_MOCK = [
    { id: 'PAY-8801', vendor: 'Fresh Farms Ltd', amount: '$1,250.00', date: '2023-11-01', status: 'Paid', method: 'Bank Transfer' },
    { id: 'PAY-8802', vendor: 'Tech World', amount: '$3,400.00', date: '2023-10-25', status: 'Processing', method: 'PayPal' },
    { id: 'PAY-8803', vendor: 'Fresh Farms Ltd', amount: '$900.00', date: '2023-10-15', status: 'Paid', method: 'Bank Transfer' },
    { id: 'PAY-8804', vendor: 'Urban Styles', amount: '$450.00', date: '2023-10-10', status: 'Failed', method: 'Bank Transfer', error: 'Invalid Account' },
];

const VendorPayouts = () => {
    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Vendor Payouts</h5>
                    <Button variant="outline-primary" className="d-flex align-items-center gap-2">
                        <Download size={18} /> Export All
                    </Button>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Payout ID</th>
                                <th className="border-0 py-3">Vendor</th>
                                <th className="border-0 py-3">Amount</th>
                                <th className="border-0 py-3">Date</th>
                                <th className="border-0 py-3">Method</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PAYOUTS_MOCK.map((p, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 text-secondary text-monospace small">{p.id}</td>
                                    <td className="fw-medium text-dark">{p.vendor}</td>
                                    <td className="fw-bold">{p.amount}</td>
                                    <td className="text-muted small">{p.date}</td>
                                    <td>{p.method}</td>
                                    <td>
                                        <Badge bg={
                                            p.status === 'Paid' ? 'success' :
                                                p.status === 'Processing' ? 'info' : 'danger'
                                        } className="rounded-pill fw-normal px-3 d-inline-flex align-items-center gap-1">
                                            {p.status === 'Paid' && <CheckCircle size={12} />}
                                            {p.status === 'Processing' && <Clock size={12} />}
                                            {p.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button variant="link" size="sm" className="text-decoration-none">Details</Button>
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
