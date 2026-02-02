import React, { useState } from 'react';
import { Card, Button, Form, Row, Col, Table } from 'react-bootstrap';
import { Download, Calendar, IndianRupee, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

const REVENUE_DATA = [
    { date: '2023-11-01', orders: 156, gross: '₹4,500.00', refunds: '₹120.00', net: '₹4,380.00' },
    { date: '2023-10-31', orders: 142, gross: '₹3,890.00', refunds: '₹0.00', net: '₹3,890.00' },
    { date: '2023-10-30', orders: 160, gross: '₹4,800.00', refunds: '₹50.00', net: '₹4,750.00' },
];

const RevenueAnalytics = () => {
    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Revenue Analytics</h4>
                <div className="d-flex gap-2">
                    <Form.Select size="sm" style={{ width: '150px' }}>
                        <option>Current Week</option>
                        <option>Current Month</option>
                        <option>Last Month</option>
                        <option>Year to Date</option>
                    </Form.Select>
                    <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2">
                        <Download size={16} /> Export
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <Row className="g-3 mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm bg-primary text-white h-100">
                        <Card.Body>
                            <div className="text-white-50 small text-uppercase fw-bold mb-2">Total Net Sales</div>
                            <h3 className="fw-bold mb-0">₹42,593.00</h3>
                            <div className="small mt-2 d-flex align-items-center gap-1">
                                <ArrowUpRight size={14} /> +12.5% vs last week
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="text-muted small text-uppercase fw-bold mb-2">Total Refunds</div>
                            <h3 className="fw-bold mb-0 text-danger">₹1,240.00</h3>
                            <div className="small mt-2 text-muted d-flex align-items-center gap-1">
                                <TrendingDown size={14} className="text-success" /> -5% vs last week
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="text-muted small text-uppercase fw-bold mb-2">Vendor Payouts</div>
                            <h3 className="fw-bold mb-0">₹28,400.00</h3>
                            <div className="small mt-2 text-muted">Paid out this month</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="text-muted small text-uppercase fw-bold mb-2">Net Profit</div>
                            <h3 className="fw-bold mb-0 text-success">₹12,953.00</h3>
                            <div className="small mt-2 text-muted d-flex align-items-center gap-1">
                                <TrendingUp size={14} className="text-success" /> +8.2% margin
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Graph Placeholder */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white py-3 border-0">
                    <h6 className="mb-0 fw-bold">Revenue Growth Chart</h6>
                </Card.Header>
                <Card.Body className="d-flex align-items-center justify-content-center" style={{ height: '300px', backgroundColor: '#f9fafb' }}>
                    <div className="text-center text-muted">
                        <TrendingUp size={48} className="mb-3 opacity-25" />
                        <p>Chart visualization would go here using a library like Recharts or Chart.js</p>
                    </div>
                </Card.Body>
            </Card>

            {/* Detailed Table */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-0">
                    <h6 className="mb-0 fw-bold">Daily Breakdown</h6>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Date</th>
                                <th className="border-0 py-3">Completed Orders</th>
                                <th className="border-0 py-3">Gross Sales</th>
                                <th className="border-0 py-3 text-danger">Refunds</th>
                                <th className="border-0 py-3 text-end pe-4 fw-bold">Net Sales</th>
                            </tr>
                        </thead>
                        <tbody>
                            {REVENUE_DATA.map((day, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 d-flex align-items-center gap-2">
                                        <Calendar size={16} className="text-muted" /> {day.date}
                                    </td>
                                    <td>{day.orders}</td>
                                    <td>{day.gross}</td>
                                    <td className="text-danger">{day.refunds}</td>
                                    <td className="text-end pe-4 fw-bold">{day.net}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default RevenueAnalytics;
