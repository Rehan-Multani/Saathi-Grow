import React, { useState } from 'react';
import { Card, Table, Button, Form, Row, Col } from 'react-bootstrap';
import { Download, Monitor, Store, ShoppingCart, User } from 'lucide-react';

const POS_DATA = [
    { id: 'TXN-9001', branch: 'Main Store - Downtown', cashier: 'Sarah C.', items: 4, total: '₹56.00', time: '10:30 AM', itemsList: 'Milk, Bread, Eggs, Cheese' },
    { id: 'TXN-9002', branch: 'West Mall Kiosk', cashier: 'John C.', items: 1, total: '₹12.00', time: '10:45 AM', itemsList: 'Magazines' },
    { id: 'TXN-9003', branch: 'Main Store - Downtown', cashier: 'Sarah C.', items: 8, total: '₹145.50', time: '11:00 AM', itemsList: 'Vegetables, Meat, Snacks...' },
];

const POSAnalytics = () => {
    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">POS Analytics</h4>
                <div className="d-flex gap-2">
                    <Form.Select size="sm" style={{ width: '200px' }}>
                        <option>All Branches</option>
                        <option>Main Store - Downtown</option>
                        <option>West Mall Kiosk</option>
                    </Form.Select>
                    <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2">
                        <Download size={16} /> Report
                    </Button>
                </div>
            </div>

            {/* Live Stats */}
            <Row className="g-3 mb-4">
                <Col md={4}>
                    <Card className="border-0 shadow-sm bg-success text-white">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Monitor size={20} />
                                <span className="small text-uppercase fw-bold">Active Terminals</span>
                            </div>
                            <h3 className="fw-bold mb-0">12 / 15</h3>
                            <div className="small mt-1 text-white-50">Online Now</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-2 text-muted">
                                <ShoppingCart size={20} />
                                <span className="small text-uppercase fw-bold">Today's Transactions</span>
                            </div>
                            <h3 className="fw-bold mb-0">342</h3>
                            <div className="small mt-1 text-success fw-bold">Avg ₹35.00 / txn</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-2 text-muted">
                                <Store size={20} />
                                <span className="small text-uppercase fw-bold">Best Performing Branch</span>
                            </div>
                            <h5 className="fw-bold mb-0 text-primary">Main Store - Downtown</h5>
                            <div className="small mt-1 text-muted">₹4,200 sales today</div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Live Transactions Feed */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                        <span className="spinner-grow spinner-grow-sm text-success" role="status" aria-hidden="true"></span>
                        Live Transaction Feed
                    </h6>
                    <Button variant="link" size="sm" className="text-muted text-decoration-none">View All History</Button>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Txn ID</th>
                                <th className="border-0 py-3">Time</th>
                                <th className="border-0 py-3">Branch</th>
                                <th className="border-0 py-3">Cashier</th>
                                <th className="border-0 py-3">Items</th>
                                <th className="border-0 py-3 text-end pe-4">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {POS_DATA.map((txn, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold font-monospace">{txn.id}</td>
                                    <td className="text-muted small">{txn.time}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <Store size={14} className="text-secondary" /> {txn.branch}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-1 text-muted small">
                                            <User size={14} /> {txn.cashier}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-truncate" style={{ maxWidth: '200px' }} title={txn.itemsList}>
                                            <span className="fw-bold me-1">{txn.items} x</span> <span className="text-muted small">{txn.itemsList}</span>
                                        </div>
                                    </td>
                                    <td className="text-end pe-4 fw-bold">{txn.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default POSAnalytics;
