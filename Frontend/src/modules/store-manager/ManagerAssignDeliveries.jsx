import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Badge, Dropdown, Spinner, Row, Col, InputGroup } from 'react-bootstrap';
import { Clock, MapPin, UserCheck, RefreshCw, Search, UserX, Zap, Truck } from 'lucide-react';
import {
  getUnassignedOrders,
  getAvailablePartners,
  assignOrder,
  unassignOrder,
  autoAssignOrder,
  getActiveTracking
} from '../../common/api/adminDeliveryApi';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const ManagerAssignDeliveries = () => {
  const { managerUser } = useStoreManagerAuth();
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [viewType, setViewType] = useState('unassigned'); // 'unassigned' or 'assigned'
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, driversData] = await Promise.all([
        getUnassignedOrders(),
        getAvailablePartners()
      ]);

      if (viewType === 'assigned') {
        const activeTrackingData = await getActiveTracking();
        setOrders(activeTrackingData);
      } else {
        setOrders(ordersData);
      }

      setDrivers(driversData);
    } catch (error) {
      toast.error('Failed to sync dispatch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewType]);

  const handleManualAssign = async (orderId, driverId) => {
    try {
      setAssigningId(orderId);
      await assignOrder(orderId, driverId);
      toast.success('Rider assigned successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigningId(null);
    }
  };

  const handleAutoAssign = async (orderId) => {
    try {
      setAssigningId(orderId);
      await autoAssignOrder(orderId);
      toast.success('Auto-assigned to nearest rider');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Auto-assign failed');
    } finally {
      setAssigningId(null);
    }
  };

  const handleUnassign = async (orderId) => {
    const result = await Swal.fire({
      title: 'Unassign Rider?',
      text: "This will remove the current rider and return the order to the unassigned pool.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Unassign'
    });

    if (result.isConfirmed) {
      try {
        setAssigningId(orderId);
        await unassignOrder(orderId);
        toast.success('Rider removed from order');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to unassign');
      } finally {
        setAssigningId(null);
      }
    }
  };

  const filtered = orders.filter(o =>
    (o.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Dispatch Center</h4>
          <p className="text-muted small">Managing live orders for branch: <strong>{managerUser?.branchId?.name}</strong></p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant={viewType === 'unassigned' ? 'primary' : 'outline-primary'}
            size="sm"
            className="px-3 rounded-pill"
            onClick={() => setViewType('unassigned')}
          >
            Pending Dispatch ({viewType === 'unassigned' ? filtered.length : '...'})
          </Button>
          <Button
            variant={viewType === 'assigned' ? 'primary' : 'outline-primary'}
            size="sm"
            className="px-3 rounded-pill"
            onClick={() => setViewType('assigned')}
          >
            Live Tracking
          </Button>
          <Button variant="light" size="sm" onClick={fetchData} disabled={loading} className="rounded-circle shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-xl overflow-hidden mb-4">
        <Card.Header className="bg-white py-3 border-0">
          <InputGroup className="max-w-md shadow-none">
            <InputGroup.Text className="bg-light border-0"><Search size={18} className="text-muted" /></InputGroup.Text>
            <Form.Control
              placeholder="Search by Order ID or customer..."
              className="bg-light border-0 shadow-none ps-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover responsive className="mb-0 align-middle">
              <thead className="bg-light text-slate-500 small text-uppercase fw-bold">
                <tr>
                  <th className="ps-4 border-0 py-3">Order Details</th>
                  <th className="border-0 py-3">Customer</th>
                  <th className="border-0 py-3">Destination</th>
                  <th className="border-0 py-3">Status/Timing</th>
                  <th className="border-0 py-3 text-end pe-4">Operations</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">No orders requiring dispatch at this moment.</td></tr>
                ) : filtered.map((item) => (
                  <tr key={item._id} className="border-bottom">
                    <td className="ps-4">
                      <div className="fw-bold text-slate-700">{item.orderId}</div>
                      <div className="d-flex align-items-center gap-1 text-primary small fw-medium">
                        <Badge bg="primary-subtle" className="text-primary font-bold">?{item.totalAmount}</Badge>
                      </div>
                    </td>
                    <td>
                      <div className="fw-medium text-slate-700">{item.user?.name || 'Customer'}</div>
                      <div className="small text-slate-400">{item.user?.phone}</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 text-slate-600 small">
                        <MapPin size={14} className="text-slate-300" />
                        <span className="text-truncate d-inline-block" style={{ maxWidth: '180px' }}>
                          {item.shippingAddress?.street || 'N/A'}, {item.shippingAddress?.city}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <div className="d-flex align-items-center gap-2 text-warning fw-bold small">
                          <Clock size={14} /> {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <Badge bg={item.status === 'out_for_delivery' ? 'primary' : 'info-subtle'} className={item.status === 'out_for_delivery' ? '' : 'text-info'}>
                          {item.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      {viewType === 'unassigned' ? (
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            className="d-flex align-items-center gap-2 shadow-sm rounded-pill px-3"
                            onClick={() => handleAutoAssign(item._id)}
                            disabled={assigningId === item._id}
                          >
                            <Zap size={14} /> Auto
                          </Button>
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              size="sm"
                              variant="primary"
                              className="d-flex align-items-center gap-2 shadow-sm rounded-pill px-3"
                              disabled={assigningId === item._id}
                            >
                              {assigningId === item._id ? <Spinner animation="border" size="sm" /> : <UserCheck size={16} />}
                              Manual
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="border-0 shadow-lg rounded-xl p-2" style={{ maxHeight: '300px', overflowY: 'auto', minWidth: '220px' }}>
                              <Dropdown.Header className="text-uppercase small fw-bold text-slate-400">Available Riders</Dropdown.Header>
                              {drivers.length > 0 ? drivers.map((d) => (
                                <Dropdown.Item
                                  key={d._id}
                                  onClick={() => handleManualAssign(item._id, d._id)}
                                  className="rounded-lg py-2"
                                >
                                  <div className="fw-bold text-slate-700">{d.name}</div>
                                  <div className="small text-slate-500 d-flex align-items-center gap-1">
                                    <Truck size={12} /> {d.vehicleType} ? {d.phone}
                                  </div>
                                </Dropdown.Item>
                              )) : <Dropdown.Item disabled className="small text-muted text-center py-3">No online riders found</Dropdown.Item>}
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="d-flex align-items-center gap-2 ms-auto rounded-pill px-3 shadow-none"
                          onClick={() => handleUnassign(item._id)}
                          disabled={assigningId === item._id}
                        >
                          <UserX size={16} /> Unassign
                        </Button>
                      )}
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

export default ManagerAssignDeliveries;
