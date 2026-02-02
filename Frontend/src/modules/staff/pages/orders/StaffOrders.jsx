import React, { useState } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { Search, Filter, Eye, Box, Truck, CheckCircle } from 'lucide-react';
import OrderDetailsModal from '../../../admin/components/orders/OrderDetailsModal';

const MOCK_ORDERS = [
    { id: 'ORD-001', customer: 'Rahul Sharma', items: 5, total: '₹450', status: 'Pending', date: '2 mins ago' },
    { id: 'ORD-002', customer: 'Priya Singh', items: 2, total: '₹120', status: 'Processing', date: '15 mins ago' },
    { id: 'ORD-003', customer: 'Amit Patel', items: 12, total: '₹1250', status: 'Pending', date: '1 hour ago' },
    { id: 'ORD-004', customer: 'Sneha Gupta', items: 8, total: '₹890', status: 'Packed', date: '2 hours ago' },
];

const StaffOrders = () => {
    const [orders, setOrders] = useState(MOCK_ORDERS);
    const [searchTerm, setSearchTerm] = useState('');

    const handleStatusUpdate = (id, newStatus) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return 'warning';
            case 'Processing': return 'info';
            case 'Packed': return 'primary';
            case 'Shipped': return 'success';
            default: return 'secondary';
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    return (
        <div>
            <OrderDetailsModal show={showModal} onHide={() => setShowModal(false)} order={selectedOrder} />
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <h4 className="fw-bold mb-0">Active Orders Queue</h4>
                <Button variant="primary" size="sm" className="d-flex align-items-center gap-2 align-self-start align-self-sm-auto">
                    <CheckCircle size={16} /> Mark All Packed
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-0">
                    <div className="d-flex flex-column flex-sm-row gap-2">
                        <InputGroup className="w-100 w-sm-auto">
                            <InputGroup.Text className="bg-light border-end-0">
                                <Search size={16} className="text-muted" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search Order ID..."
                                className="bg-light border-start-0 shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Button variant="outline-light" className="text-dark border d-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto">
                            <Filter size={16} /> Filter
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3 border-0">Order ID</th>
                                <th className="py-3 border-0">Customer</th>
                                <th className="py-3 border-0">Items</th>
                                <th className="py-3 border-0">Total</th>
                                <th className="py-3 border-0">Status</th>
                                <th className="py-3 border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="ps-4 fw-bold">{order.id}</td>
                                    <td>
                                        <div>{order.customer}</div>
                                        <small className="text-muted">{order.date}</small>
                                    </td>
                                    <td>
                                        <Badge bg="light" text="dark" className="border">
                                            {order.items} Items
                                        </Badge>
                                    </td>
                                    <td className="fw-bold">{order.total}</td>
                                    <td>
                                        <Badge bg={getStatusBadge(order.status)} className="rounded-pill px-3 fw-normal">
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            {order.status === 'Pending' && (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    title="Start Processing"
                                                    onClick={() => handleStatusUpdate(order.id, 'Processing')}
                                                >
                                                    <Box size={16} /> Process
                                                </Button>
                                            )}
                                            {order.status === 'Processing' && (
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    className="d-flex align-items-center gap-1"
                                                    onClick={() => handleStatusUpdate(order.id, 'Packed')}
                                                >
                                                    <CheckCircle size={16} /> Ready
                                                </Button>
                                            )}
                                            {order.status === 'Packed' && (
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    title="Mark Shipped"
                                                    onClick={() => handleStatusUpdate(order.id, 'Shipped')}
                                                >
                                                    <Truck size={16} /> Ship
                                                </Button>
                                            )}
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="btn-icon-soft"
                                                onClick={() => handleViewOrder(order)}
                                            >
                                                <Eye size={16} />
                                            </Button>
                                        </div>
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

export default StaffOrders;
