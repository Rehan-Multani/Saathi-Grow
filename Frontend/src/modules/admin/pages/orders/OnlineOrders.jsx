import React, { useState } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { Search, Eye, Truck, CreditCard } from 'lucide-react';

const ONLINE_ORDERS_MOCK = [
    { id: 'ORD-2001', customer: 'Sarah Connor', date: '2023-10-28', status: 'Processing', total: '₹150.00', items: 4, paymentValues: { method: 'Stripe', status: 'Paid' }, delivery: 'FedEx' },
    { id: 'ORD-2002', customer: 'Kyle Reese', date: '2023-10-28', status: 'Pending', total: '₹45.00', items: 1, paymentValues: { method: 'PayPal', status: 'Pending' }, delivery: 'Unassigned' },
    { id: 'ORD-2003', customer: 'Ellen Ripley', date: '2023-10-27', status: 'Delivered', total: '₹890.00', items: 12, paymentValues: { method: 'Credit Card', status: 'Paid' }, delivery: 'DHL Express' },
];

const OrderStatusBadge = ({ status }) => {
    const variants = {
        Delivered: 'success',
        Pending: 'warning',
        Processing: 'info',
        Cancelled: 'danger',
        Shipped: 'primary'
    };
    return <Badge bg={variants[status] || 'secondary'} className="px-3 rounded-pill fw-normal">{status}</Badge>;
};

const OnlineOrders = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = ONLINE_ORDERS_MOCK.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <h5 className="mb-0 fw-bold">Online Orders</h5>
                        <Badge bg="primary" pill>{filteredOrders.length}</Badge>
                    </div>
                    <InputGroup style={{ maxWidth: '250px' }}>
                        <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                        <Form.Control
                            placeholder="Search..."
                            className="border-start-0 ps-0 shadow-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Order ID</th>
                                <th className="border-0 py-3">Customer</th>
                                <th className="border-0 py-3">Date</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3">Payment</th>
                                <th className="border-0 py-3">Delivery</th>
                                <th className="border-0 py-3 text-end pe-4">Total</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold text-primary">{order.id}</td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <span className="fw-medium">{order.customer}</span>
                                            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Online Customer</span>
                                        </div>
                                    </td>
                                    <td className="text-muted small">{order.date}</td>
                                    <td><OrderStatusBadge status={order.status} /></td>
                                    <td>
                                        <div className="d-flex align-items-center gap-1">
                                            <CreditCard size={14} className="text-muted" />
                                            <span className="small">{order.paymentValues.method}</span>
                                            <Badge bg={order.paymentValues.status === 'Paid' ? 'success' : 'warning'} className="ms-1" style={{ fontSize: '0.6rem' }}>
                                                {order.paymentValues.status}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-1 text-muted small">
                                            <Truck size={14} />
                                            <span>{order.delivery}</span>
                                        </div>
                                    </td>
                                    <td className="text-end pe-4 fw-bold">{order.total}</td>
                                    <td className="text-end pe-4">
                                        <Button variant="link" className="p-0 text-dark"><Eye size={18} /></Button>
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

export default OnlineOrders;
