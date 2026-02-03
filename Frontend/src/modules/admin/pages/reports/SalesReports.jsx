import React, { useState } from 'react';
import { Card, Table, Row, Col, Form, Button } from 'react-bootstrap';
import { Download, Calendar, IndianRupee, TrendingUp, ShoppingBag } from 'lucide-react';

const SALES_DATA = [
    { id: 'ORD-5001', date: '2023-11-01', customer: 'John Doe', items: 3, total: '₹120.00', status: 'Completed', payment: 'Credit Card' },
    { id: 'ORD-5002', date: '2023-11-01', customer: 'Jane Smith', items: 1, total: '₹45.50', status: 'Completed', payment: 'PayPal' },
    { id: 'ORD-5003', date: '2023-10-31', customer: 'Michael Brown', items: 5, total: '₹210.00', status: 'Refunded', payment: 'Credit Card' },
    { id: 'ORD-5004', date: '2023-10-31', customer: 'Sarah Wilson', items: 2, total: '₹85.00', status: 'Completed', payment: 'COD' },
];

const SalesReports = () => {
    return (
        <div className="p-3">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <h4 className="fw-bold mb-0 text-nowrap">Sales Reports</h4>
                <div className="d-flex gap-2 flex-grow-1 w-100 w-sm-auto justify-content-between justify-content-sm-end">
                    <Form.Select size="sm" style={{ width: '140px' }} className="shadow-none">
                        <option>Last 30 Days</option>
                        <option>This Month</option>
                        <option>Last Month</option>
                        <option>This Year</option>
                    </Form.Select>
                    <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2 shadow-sm">
                        <Download size={16} /> <span className="d-none d-sm-inline">Export CSV</span>
                        <span className="d-inline d-sm-none">Export</span>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <Row className="g-3 mb-4">
                <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="bg-success bg-opacity-10 p-2 rounded text-success">
                                    <IndianRupee size={20} />
                                </div>
                                <span className="text-muted small text-uppercase fw-bold">Total Revenue</span>
                            </div>
                            <h4 className="fw-bold mb-0">₹12,450.00</h4>
                            <small className="text-success fw-bold">+15% from last month</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="bg-primary bg-opacity-10 p-2 rounded text-primary">
                                    <ShoppingBag size={20} />
                                </div>
                                <span className="text-muted small text-uppercase fw-bold">Total Orders</span>
                            </div>
                            <h4 className="fw-bold mb-0">1,240</h4>
                            <small className="text-success fw-bold">+8% from last month</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="bg-warning bg-opacity-10 p-2 rounded text-warning">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="text-muted small text-uppercase fw-bold">Avg Order Value</span>
                            </div>
                            <h4 className="fw-bold mb-0">₹48.50</h4>
                            <small className="text-danger fw-bold">-2% from last month</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="bg-info bg-opacity-10 p-2 rounded text-info">
                                    <Calendar size={20} />
                                </div>
                                <span className="text-muted small text-uppercase fw-bold">Period Sales</span>
                            </div>
                            <h4 className="fw-bold mb-0">₹3,200.00</h4>
                            <small className="text-muted">Currently viewing Nov</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Sales Table */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-0">
                    <h6 className="mb-0 fw-bold">Recent Transactions</h6>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Order ID</th>
                                <th className="border-0 py-3">Date</th>
                                <th className="border-0 py-3">Customer</th>
                                <th className="border-0 py-3">Items</th>
                                <th className="border-0 py-3">Payment</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {SALES_DATA.map((order, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold text-primary">{order.id}</td>
                                    <td className="text-muted small">{order.date}</td>
                                    <td>{order.customer}</td>
                                    <td>{order.items} Items</td>
                                    <td>{order.payment}</td>
                                    <td>
                                        <span className={`badge bg-${order.status === 'Completed' ? 'success' : order.status === 'Refunded' ? 'danger' : 'warning'} rounded-pill fw-normal px-3`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4 fw-bold">{order.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default SalesReports;
