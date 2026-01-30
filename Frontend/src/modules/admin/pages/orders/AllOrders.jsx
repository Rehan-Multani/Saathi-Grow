import React, { useState } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { Search, Eye, Filter, Download } from 'lucide-react';

const MOCK_ORDERS = [
    { id: 'ORD-1001', customer: 'John Doe', date: '2023-10-25', status: 'Delivered', total: '$120.00', items: 3, payment: 'Paid' },
    { id: 'ORD-1002', customer: 'Jane Smith', date: '2023-10-26', status: 'Pending', total: '$85.50', items: 1, payment: 'Pending' },
    { id: 'ORD-1003', customer: 'Bob Wilson', date: '2023-10-26', status: 'Processing', total: '$210.00', items: 5, payment: 'Paid' },
    { id: 'ORD-1004', customer: 'Alice Brown', date: '2023-10-27', status: 'Cancelled', total: '$45.00', items: 2, payment: 'Refunded' },
    { id: 'ORD-1005', customer: 'Charlie Day', date: '2023-10-27', status: 'Delivered', total: '$340.00', items: 8, payment: 'Paid' },
];

const OrderStatusBadge = ({ status }) => {
    const variants = {
        Delivered: 'success',
        Pending: 'warning',
        Processing: 'info',
        Cancelled: 'danger',
    };
    return <Badge bg={variants[status] || 'secondary'} className="px-3 rounded-pill fw-normal">{status}</Badge>;
};

const AllOrders = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = MOCK_ORDERS.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            {/* Action Toolbar */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <InputGroup style={{ maxWidth: '300px' }}>
                        <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                        <Form.Control
                            placeholder="Search by Order ID or Customer..."
                            className="border-start-0 ps-0 box-shadow-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>

                    <div className="d-flex gap-2">
                        <Button variant="outline-secondary" className="d-flex align-items-center gap-2">
                            <Filter size={18} /> Filter
                        </Button>
                        <Button variant="outline-primary" className="d-flex align-items-center gap-2">
                            <Download size={18} /> Export
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Orders Table */}
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
                                <th className="border-0 py-3">Items</th>
                                <th className="border-0 py-3 text-end pe-4">Total</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold text-primary">{order.id}</td>
                                    <td className="fw-medium">{order.customer}</td>
                                    <td className="text-muted small">{order.date}</td>
                                    <td><OrderStatusBadge status={order.status} /></td>
                                    <td>
                                        <span className={`small fw-bold ${order.payment === 'Paid' ? 'text-success' : 'text-warning'}`}>
                                            {order.payment}
                                        </span>
                                    </td>
                                    <td>{order.items}</td>
                                    <td className="text-end pe-4 fw-bold">{order.total}</td>
                                    <td className="text-end pe-4">
                                        <Button variant="link" className="p-0 text-secondary"><Eye size={18} /></Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center py-5 text-muted">
                                        No orders found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AllOrders;
