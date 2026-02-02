import React, { useState } from 'react';
import { Card, Table, Button, Form, ProgressBar, Badge } from 'react-bootstrap';
import { Download, Calendar, IndianRupee, Wallet, TrendingUp } from 'lucide-react';

const EARNINGS_DATA = [
    { id: 'PAY-1001', vendor: 'Fresh Farms & Co.', period: 'Oct 2023', sales: '₹15,000', comm: '₹1,500', payout: '₹13,500', status: 'Paid' },
    { id: 'PAY-1002', vendor: 'Organic Spices Ltd.', period: 'Oct 2023', sales: '₹5,000', comm: '₹500', payout: '₹4,500', status: 'Pending' },
    { id: 'PAY-1003', vendor: 'City Snacks Wholesale', period: 'Oct 2023', sales: '₹2,000', comm: '₹200', payout: '₹1,800', status: 'Paid' },
];

const VendorEarnings = () => {
    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Vendor Earnings & Payouts</h4>
                <div className="d-flex gap-2">
                    <Form.Select size="sm" style={{ width: '200px' }}>
                        <option>All Vendors</option>
                        <option>Pending Payouts</option>
                        <option>Completed Payouts</option>
                    </Form.Select>
                    <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2">
                        <Download size={16} /> Export Statement
                    </Button>
                </div>
            </div>

            {/* Overall Stats */}
            <div className="d-flex gap-4 mb-4">
                <Card className="border-0 shadow-sm flex-fill">
                    <Card.Body className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-3 text-primary">
                            <IndianRupee size={24} />
                        </div>
                        <div>
                            <div className="text-uppercase small fw-bold text-muted">Total Paid Out</div>
                            <h3 className="fw-bold mb-0">₹245,600</h3>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm flex-fill">
                    <Card.Body className="d-flex align-items-center gap-3">
                        <div className="bg-warning bg-opacity-10 rounded-circle p-3 text-warning">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <div className="text-uppercase small fw-bold text-muted">Pending Due</div>
                            <h3 className="fw-bold mb-0">₹12,450</h3>
                        </div>
                    </Card.Body>
                </Card>
                <Card className="border-0 shadow-sm flex-fill">
                    <Card.Body className="d-flex align-items-center gap-3">
                        <div className="bg-success bg-opacity-10 rounded-circle p-3 text-success">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <div className="text-uppercase small fw-bold text-muted">Commission Earned</div>
                            <h3 className="fw-bold mb-0">₹35,800</h3>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Payout Table */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-0">
                    <h6 className="mb-0 fw-bold">Recent Payout Settlements</h6>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Payout ID</th>
                                <th className="border-0 py-3">Vendor</th>
                                <th className="border-0 py-3">Period</th>
                                <th className="border-0 py-3">Sales</th>
                                <th className="border-0 py-3 text-danger">Comm. (10%)</th>
                                <th className="border-0 py-3 fw-bold text-success">Net Payout</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {EARNINGS_DATA.map((p, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold font-monospace text-secondary">{p.id}</td>
                                    <td>{p.vendor}</td>
                                    <td><div className="bg-light border rounded px-2 py-1 small d-inline-block text-secondary">{p.period}</div></td>
                                    <td>{p.sales}</td>
                                    <td className="text-danger">-{p.comm}</td>
                                    <td className="fw-bold text-success">{p.payout}</td>
                                    <td>
                                        <Badge
                                            bg={p.status === 'Paid' ? 'success' : 'warning'}
                                            className="rounded-pill fw-normal px-3"
                                        >
                                            {p.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button variant="link" size="sm">Details</Button>
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
