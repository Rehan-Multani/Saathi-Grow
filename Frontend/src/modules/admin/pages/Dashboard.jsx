import React from 'react';
import { ShoppingCart, Package, Users, DollarSign, TrendingUp, TrendingDown, Activity, CreditCard } from 'lucide-react';
import { Card, Row, Col, Table, Badge, Button } from 'react-bootstrap';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, Cell
} from 'recharts';

// Mock Data for Charts
const revenueData = [
    { name: 'Jan', revenue: 4000, orders: 240 },
    { name: 'Feb', revenue: 3000, orders: 139 },
    { name: 'Mar', revenue: 2000, orders: 980 },
    { name: 'Apr', revenue: 2780, orders: 390 },
    { name: 'May', revenue: 1890, orders: 480 },
    { name: 'Jun', revenue: 2390, orders: 380 },
    { name: 'Jul', revenue: 3490, orders: 430 },
];

const categoryData = [
    { name: 'Electronics', value: 400 },
    { name: 'Groceries', value: 300 },
    { name: 'Clothing', value: 300 },
    { name: 'Home', value: 200 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, gradient }) => (
    <Card className="border-0 shadow-sm h-100 overflow-hidden text-white" style={{ background: gradient || color }}>
        <Card.Body className="position-relative">
            <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="bg-white bg-opacity-25 rounded-circle p-2 d-flex align-items-center justify-content-center">
                    <Icon size={24} className="text-white" />
                </div>
                <span className={`badge ${trend === 'up' ? 'bg-success' : 'bg-danger'} bg-opacity-75 rounded-pill`}>
                    {trend === 'up' ? <TrendingUp size={12} className="me-1" /> : <TrendingDown size={12} className="me-1" />}
                    {trendValue}
                </span>
            </div>
            <div>
                <h2 className="fw-bold mb-1">{value}</h2>
                <p className="mb-0 opacity-75 small text-uppercase fw-semibold ls-1">{title}</p>
            </div>

        </Card.Body>
    </Card>
);

const recentOrders = [
    { id: '#ORD-001', customer: 'Alex Johnson', product: 'Wireless Headset', amount: '$120.00', status: 'Delivered' },
    { id: '#ORD-002', customer: 'Sam Smith', product: 'Smart Watch', amount: '$250.00', status: 'Pending' },
    { id: '#ORD-003', customer: 'Maria Garcia', product: 'Organic Bananas', amount: '$15.50', status: 'Processing' },
    { id: '#ORD-004', customer: 'John Doe', product: 'Gaming Mouse', amount: '$45.00', status: 'Cancelled' },
];

const Dashboard = () => {
    return (
        <div className="p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1">Dashboard Overview</h3>
                    <p className="text-muted mb-0">Live analytics and performance metrics.</p>
                </div>
                <Button variant="primary" className="d-flex align-items-center gap-2 shadow-sm">
                    <Activity size={18} />
                    <span>Generate Report</span>
                </Button>
            </div>

            {/* Stats Row */}
            <Row className="g-4 mb-4">
                <Col xl={3} md={6}>
                    <StatCard
                        title="Total Revenue"
                        value="$54,230"
                        icon={DollarSign}
                        color="#3B82F6"
                        gradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                        trend="up"
                        trendValue="+12.5%"
                    />
                </Col>
                <Col xl={3} md={6}>
                    <StatCard
                        title="Total Orders"
                        value="1,890"
                        icon={ShoppingCart}
                        color="#10B981"
                        gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
                        trend="up"
                        trendValue="+8.2%"
                    />
                </Col>
                <Col xl={3} md={6}>
                    <StatCard
                        title="Total Products"
                        value="452"
                        icon={Package}
                        color="#F59E0B"
                        gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
                        trend="down"
                        trendValue="-2.4%"
                    />
                </Col>
                <Col xl={3} md={6}>
                    <StatCard
                        title="New Users"
                        value="340"
                        icon={Users}
                        color="#8B5CF6"
                        gradient="linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
                        trend="up"
                        trendValue="+18%"
                    />
                </Col>
            </Row>

            {/* Main Charts Row */}
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">Revenue Analytics</h5>
                            <select className="form-select form-select-sm w-auto border-0 bg-light">
                                <option>This Year</option>
                                <option>Last Year</option>
                            </select>
                        </Card.Header>
                        <Card.Body style={{ minHeight: '350px' }}>
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="fw-bold mb-0">Sales by Category</h5>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center" style={{ minHeight: '350px' }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Orders Section */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">Recent Transactions</h5>
                    <Button variant="link" className="text-decoration-none text-primary fw-semibold p-0">View All</Button>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0">Order ID</th>
                                <th className="border-0">Customer</th>
                                <th className="border-0">Product</th>
                                <th className="border-0">Amount</th>
                                <th className="border-0">Status</th>
                                <th className="border-0 text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-medium text-dark">{order.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light rounded-circle text-primary fw-bold d-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32, fontSize: 12 }}>
                                                {order.customer.charAt(0)}
                                            </div>
                                            {order.customer}
                                        </div>
                                    </td>
                                    <td className="text-muted">{order.product}</td>
                                    <td className="fw-bold">{order.amount}</td>
                                    <td>
                                        <Badge
                                            bg={
                                                order.status === 'Delivered' ? 'success' :
                                                    order.status === 'Pending' ? 'warning' :
                                                        order.status === 'Processing' ? 'info' : 'danger'
                                            }
                                            className="rounded-pill fw-normal px-3"
                                        >
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button variant="link" size="sm" className="text-muted p-0"><CreditCard size={16} /></Button>
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

export default Dashboard;
