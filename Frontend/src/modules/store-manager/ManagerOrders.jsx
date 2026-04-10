import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup, Dropdown, Spinner } from 'react-bootstrap';
import { Search, Filter, Eye, Box, Truck, CheckCircle, RefreshCcw, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';
import OrderDetailsModal from '../../common/components/orders/OrderDetailsModal';
import { getAllOrdersAdmin, updateOrderStatus } from '../../common/api/orderApi';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';

const ManagerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { managerUser } = useStoreManagerAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrdersAdmin({ limit: 1000 });
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      Swal.fire('Error', 'Could not load branch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
      fetchOrders();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Update failed', 'error');
    }
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
      case 'returned': return 'dark';
      default: return 'secondary';
    }
  };

  const filteredOrders = Array.isArray(orders)
    ? orders.filter(order => {
      const orderId = order.orderId || order._id;
      const customerName = order.user?.name || 'Guest';
      return (orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === 'All' || order.status === statusFilter);
    })
    : [];

  return (
    <div className="p-4">
      <OrderDetailsModal show={showModal} onHide={() => setShowModal(false)} order={selectedOrder} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Branch Orders Management</h4>
          <p className="text-muted small">Managing orders for: <strong>{managerUser?.branchId?.name || 'Assigned Branch'}</strong></p>
        </div>
        <Button variant="outline-primary" size="sm" onClick={fetchOrders} disabled={loading}>
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
        <Card.Header className="bg-white py-3 border-0">
          <div className="d-flex flex-column flex-md-row gap-3">
            <InputGroup className="flex-grow-1">
              <InputGroup.Text className="bg-light border-0"><Search size={18} /></InputGroup.Text>
              <Form.Control
                placeholder="Search by Order ID or Customer..."
                className="bg-light border-0 shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Dropdown onSelect={(k) => setStatusFilter(k)}>
              <Dropdown.Toggle variant="light" className="border-0 shadow-none d-flex align-items-center gap-2">
                <Filter size={18} /> {statusFilter === 'All' ? 'All Status' : statusFilter.toUpperCase()}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="All">All Status</Dropdown.Item>
                <Dropdown.Item eventKey="pending">Pending</Dropdown.Item>
                <Dropdown.Item eventKey="confirmed">Confirmed</Dropdown.Item>
                <Dropdown.Item eventKey="preparing">Preparing</Dropdown.Item>
                <Dropdown.Item eventKey="ready_for_pickup">Ready for Pickup</Dropdown.Item>
                <Dropdown.Item eventKey="out_for_delivery">Out for Delivery</Dropdown.Item>
                <Dropdown.Item eventKey="delivered">Delivered</Dropdown.Item>
                <Dropdown.Item eventKey="cancelled">Cancelled</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="bg-light text-muted small uppercase">
                <tr>
                  <th className="ps-4">Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-5"><Spinner animation="border" size="sm" /></td></tr>
                ) : filteredOrders.map(order => (
                  <tr key={order._id}>
                    <td className="ps-4 fw-bold text-primary">{order.orderId}</td>
                    <td>
                      <div className="fw-semibold">{order.user?.name || 'Guest'}</div>
                      <div className="text-muted x-small">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>{order.items?.length || 0}</td>
                    <td className="fw-bold">?{order.totalAmount}</td>
                    <td>
                      <Badge bg={getStatusBadge(order.status)} className="rounded-pill px-3">
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
                            <Dropdown.Item onClick={() => { setSelectedOrder(order); setShowModal(true); }} className="d-flex align-items-center gap-2">
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
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ManagerOrders;
