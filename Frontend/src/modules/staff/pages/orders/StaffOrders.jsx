import React, { useState } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup, Dropdown } from 'react-bootstrap';
import { Search, Filter, Eye, Box, Truck, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
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
    const [statusFilter, setStatusFilter] = useState('All');

    const handleStatusUpdate = (id, newStatus) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    };

    const handleMarkAllPacked = () => {
        const processingOrders = orders.filter(o => o.status === 'Processing');

        if (processingOrders.length === 0) {
            Swal.fire({
                title: 'No Orders to Pack',
                text: 'There are no orders currently in "Processing" status to mark as ready.',
                icon: 'info',
                confirmButtonColor: '#0d6efd'
            });
            return;
        }

        Swal.fire({
            title: `Mark ${processingOrders.length} Orders as Ready?`,
            text: "This will update all currently processing orders to 'Packed' status.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, Mark All Ready'
        }).then((result) => {
            if (result.isConfirmed) {
                setOrders(orders.map(o => o.status === 'Processing' ? { ...o, status: 'Packed' } : o));
                Swal.fire('Updated!', `${processingOrders.length} orders have been marked as Ready.`, 'success');
            }
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return 'warning';
            case 'Processing': return 'info';
            case 'Packed': return 'primary'; // Ready
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

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            <OrderDetailsModal show={showModal} onHide={() => setShowModal(false)} order={selectedOrder} />
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <h4 className="fw-bold mb-0">Active Orders Queue</h4>
                <Button
                    variant="primary"
                    size="sm"
                    className="d-flex align-items-center gap-2 align-self-start align-self-sm-auto shadow-sm"
                    onClick={handleMarkAllPacked}
                >
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
                                placeholder="Search Order ID or Customer..."
                                className="bg-light border-start-0 shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Dropdown align="end" onSelect={(key) => setStatusFilter(key)}>
                            <Dropdown.Toggle variant="outline-light" className="text-dark border d-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto shadow-none">
                                <Filter size={16} /> {statusFilter === 'All' ? 'Filter Status' : statusFilter === 'Packed' ? 'Ready (Packed)' : statusFilter}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey="All" active={statusFilter === 'All'}>All Orders</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item eventKey="Pending" active={statusFilter === 'Pending'}>Pending</Dropdown.Item>
                                <Dropdown.Item eventKey="Processing" active={statusFilter === 'Processing'}>Processing</Dropdown.Item>
                                <Dropdown.Item eventKey="Packed" active={statusFilter === 'Packed'}>Ready (Packed)</Dropdown.Item>
                                <Dropdown.Item eventKey="Shipped" active={statusFilter === 'Shipped'}>Shipped</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
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
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
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
                                                {order.status === 'Packed' ? 'Ready' : order.status}
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        No active orders found matching the filter.
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

export default StaffOrders;
