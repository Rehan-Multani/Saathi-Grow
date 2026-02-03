import React, { useState } from 'react';
import { Card, Button, Form, Row, Col, Table, Badge } from 'react-bootstrap';
import { Download, Calendar, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const CHART_DATA = [
    { name: 'Mon', revenue: 2400 },
    { name: 'Tue', revenue: 1398 },
    { name: 'Wed', revenue: 9800 },
    { name: 'Thu', revenue: 3908 },
    { name: 'Fri', revenue: 4800 },
    { name: 'Sat', revenue: 3800 },
    { name: 'Sun', revenue: 4300 },
];

const REVENUE_DATA = [
    { date: '2023-11-01', orders: 156, gross: '₹4,500.00', refunds: '₹120.00', net: '₹4,380.00' },
    { date: '2023-10-31', orders: 142, gross: '₹3,890.00', refunds: '₹0.00', net: '₹3,890.00' },
    { date: '2023-10-30', orders: 160, gross: '₹4,800.00', refunds: '₹50.00', net: '₹4,750.00' },
];

const RevenueAnalytics = () => {
    return (
        <div className="p-2 p-md-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary d-none d-md-flex">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-1 text-dark text-nowrap">Revenue Analytics</h4>
                        <p className="text-muted small mb-0 d-none d-sm-block">Track your financial performance and growth metrics.</p>
                    </div>
                </div>

                <div className="d-flex gap-2 flex-grow-1 w-100 w-sm-auto justify-content-between justify-content-sm-end">
                    <Form.Select size="sm" style={{ width: '140px' }} className="shadow-none border-0 bg-light">
                        <option>Current Week</option>
                        <option>Current Month</option>
                        <option>Last Month</option>
                        <option>Year to Date</option>
                    </Form.Select>
                    <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2 shadow-sm px-3">
                        <Download size={16} /> <span className="d-none d-sm-inline text-nowrap">Export Data</span>
                        <span className="d-inline d-sm-none">Export</span>
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <Row className="g-3 mb-4">
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm bg-primary text-white overflow-hidden position-relative" style={{ minHeight: '120px' }}>
                        <Card.Body className="z-1">
                            <div className="text-white-50 small text-uppercase fw-bold mb-2">Total Net Sales</div>
                            <h3 className="fw-bold mb-0">₹42,593.00</h3>
                            <div className="small mt-2 d-flex align-items-center gap-1 text-white-50">
                                <ArrowUpRight size={14} className="text-white" /> <span className="text-white">+12.5%</span> vs last week
                            </div>
                        </Card.Body>
                        <TrendingUp size={80} className="position-absolute end-0 bottom-0 opacity-10 mb-n3 me-n2" />
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100 border-start border-danger border-4">
                        <Card.Body>
                            <div className="text-muted small text-uppercase fw-bold mb-2">Total Refunds</div>
                            <h3 className="fw-bold mb-0 text-danger">₹1,240.00</h3>
                            <div className="small mt-2 text-muted d-flex align-items-center gap-1">
                                <TrendingDown size={14} className="text-success" /> <span className="text-success">-5%</span> improvement
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100 border-start border-warning border-4">
                        <Card.Body>
                            <div className="text-muted small text-uppercase fw-bold mb-2">Vendor Payouts</div>
                            <h3 className="fw-bold mb-0 text-dark">₹28,400.00</h3>
                            <div className="small mt-2 text-muted">Paid out this month</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm h-100 border-start border-success border-4">
                        <Card.Body>
                            <div className="text-muted small text-uppercase fw-bold mb-2">Net Profit</div>
                            <h3 className="fw-bold mb-0 text-success">₹12,953.00</h3>
                            <div className="small mt-2 text-muted d-flex align-items-center gap-1">
                                <TrendingUp size={14} className="text-success" /> <span className="text-success">+8.2%</span> margin
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Visual Analytics Chart */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="mb-0 fw-bold">Revenue Growth Overview</h6>
                        <small className="text-muted">Net sales performance over the past 7 days</small>
                    </div>
                    <Badge bg="success" className="bg-opacity-10 text-success fw-normal px-2">Live Update</Badge>
                </Card.Header>
                <Card.Body className="pt-0">
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <AreaChart
                                data={CHART_DATA}
                                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0c831f" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0c831f" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                        fontSize: '14px'
                                    }}
                                    formatter={(value) => [`₹${value}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0c831f"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card.Body>
            </Card>

            {/* Detailed Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
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
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="bg-light p-2 rounded-circle text-primary">
                                                <Calendar size={14} />
                                            </div>
                                            <span className="small fw-medium">{day.date}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge bg-light text-dark fw-normal border">{day.orders}</span>
                                    </td>
                                    <td><span className="small fw-medium">{day.gross}</span></td>
                                    <td><span className="small fw-medium text-danger">{day.refunds}</span></td>
                                    <td className="text-end pe-4 fw-bold text-primary">{day.net}</td>
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
