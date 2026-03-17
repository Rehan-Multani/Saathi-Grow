import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup, Dropdown, Spinner } from 'react-bootstrap';
import { Search, Filter, Eye, Box, Truck, CheckCircle, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import OrderDetailsModal from '../../../admin/components/orders/OrderDetailsModal';
import { getAllOrdersAdmin, updateOrderStatus } from '../../../admin/api/orderApi';
import { useStaffAuth } from '../../context/StaffAuthContext';

const StaffOrders = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialStatus = queryParams.get('status');

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatus || 'All');
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getAllOrdersAdmin({ limit: 1000 });
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            Swal.fire('Error', 'Could not load orders queue', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateOrderStatus(id, newStatus);
            Swal.fire({
                title: 'Success!',
                text: `Order status updated to ${newStatus}`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            fetchOrders(); // Refresh list
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Update failed', 'error');
        }
    };

    const handleMarkAllPacked = () => {
        const processingOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'preparing');

        if (processingOrders.length === 0) {
            Swal.fire({
                title: 'No Orders to Pack',
                text: 'There are no active orders currently ready for packing.',
                icon: 'info',
            });
            return;
        }

        Swal.fire({
            title: `Mark ${processingOrders.length} Orders as Packed?`,
            text: "This will update all preparing/confirmed orders to 'Packed' status.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#198754',
            confirmButtonText: 'Yes, Mark All'
        }).then((result) => {
            if (result.isConfirmed) {
                // In real app, we might need a bulk update endpoint, but let's do sequential for now if needed or just inform user
                Swal.fire('Tip', 'Bulk update is coming soon. Please update individually for now.', 'info');
            }
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'confirmed': return 'info';
            case 'preparing': return 'info';
            case 'ready_for_pickup': return 'primary';
            case 'out_for_delivery': return 'primary';
            case 'delivered': return 'success';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const filteredOrders = orders.filter(order => {
        const orderId = order.orderId || order._id;
        const customerName = order.user?.name || 'Guest';
        const matchesSearch =
            orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customerName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                                <Filter size={16} /> {statusFilter === 'All' ? 'Filter Status' : statusFilter.replace(/_/g, ' ').toUpperCase()}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey="All" active={statusFilter === 'All'}>All Orders</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item eventKey="pending" active={statusFilter === 'pending'}>Pending</Dropdown.Item>
                                <Dropdown.Item eventKey="confirmed" active={statusFilter === 'confirmed'}>Confirmed</Dropdown.Item>
                                <Dropdown.Item eventKey="preparing" active={statusFilter === 'preparing'}>Preparing</Dropdown.Item>
                                <Dropdown.Item eventKey="ready_for_pickup" active={statusFilter === 'ready_for_pickup'}>Ready for Pickup</Dropdown.Item>
                                <Dropdown.Item eventKey="out_for_delivery" active={statusFilter === 'out_for_delivery'}>Out for Delivery</Dropdown.Item>
                                <Dropdown.Item eventKey="delivered" active={statusFilter === 'delivered'}>Delivered (Historic)</Dropdown.Item>
                                <Dropdown.Item eventKey="cancelled" active={statusFilter === 'cancelled'}>Cancelled</Dropdown.Item>
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
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : paginatedOrders.length > 0 ? (
                                paginatedOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td className="ps-4 fw-bold">{order.orderId}</td>
                                        <td>
                                            <div>{order.user?.name || 'Guest'}</div>
                                            <small className="text-muted">{new Date(order.createdAt).toLocaleString()}</small>
                                        </td>
                                        <td>
                                            <Badge bg="light" text="dark" className="border">
                                                {order.items?.length || 0} Items
                                            </Badge>
                                        </td>
                                        <td className="fw-bold">₹{order.totalAmount}</td>
                                        <td>
                                            <Badge bg={getStatusBadge(order.status)} className="rounded-pill px-3 fw-normal uppercase">
                                                {order.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="light" size="sm" className="btn-icon-soft border-0 shadow-sm d-flex align-items-center gap-1">
                                                        Manage
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu className="shadow-sm border-0">
                                                        <Dropdown.Item onClick={() => handleViewOrder(order)} className="d-flex align-items-center gap-2">
                                                            <Eye size={16} /> View Details
                                                        </Dropdown.Item>
                                                        {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'returned' && (
                                                            <>
                                                                <Dropdown.Divider />
                                                                {['pending', 'confirmed'].includes(order.status) && (
                                                                    <Dropdown.Item onClick={() => handleStatusUpdate(order._id, 'preparing')}>Mark Preparing</Dropdown.Item>
                                                                )}
                                                                {order.status === 'preparing' && (
                                                                    <Dropdown.Item onClick={() => handleStatusUpdate(order._id, 'ready_for_pickup')}>Ready for Pickup</Dropdown.Item>
                                                                )}
                                                                <Dropdown.Divider />
                                                                <Dropdown.Item className="text-danger" onClick={() => handleStatusUpdate(order._id, 'cancelled')}>Cancel Order</Dropdown.Item>
                                                            </>
                                                        )}
                                                    </Dropdown.Menu>
                                                </Dropdown>
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
                {filteredOrders.length > 0 && (
                    <Card.Footer className="bg-white border-top-0 py-3 px-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted small">
                                Showing <span className="fw-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredOrders.length)}</span> to <span className="fw-bold">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="fw-bold">{filteredOrders.length}</span> orders
                            </div>
                            <div className="d-flex gap-2">
                                <Button 
                                    variant="light" 
                                    size="sm" 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="border shadow-sm px-3"
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "primary" : "light"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={`border shadow-sm px-3 ${currentPage === page ? 'text-white' : ''}`}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button 
                                    variant="light" 
                                    size="sm" 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="border shadow-sm px-3"
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </Card.Footer>
                )}
            </Card>
        </div>
    );
};

export default StaffOrders;
