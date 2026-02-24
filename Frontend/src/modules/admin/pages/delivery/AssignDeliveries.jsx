import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Badge, Dropdown, Spinner, Row, Col, InputGroup } from 'react-bootstrap';
import { Clock, MapPin, UserCheck, RefreshCw, Search, UserX, Zap } from 'lucide-react';
import {
    getUnassignedOrders,
    getAvailablePartners,
    assignOrder,
    unassignOrder,
    autoAssignOrder,
    getActiveTracking,
    getDeliveryPartners
} from '../../api/adminDeliveryApi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const AssignDeliveries = () => {
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

            // If viewing assigned, use the dedicated tracking API
            if (viewType === 'assigned') {
                const activeTrackingData = await getActiveTracking();
                setOrders(activeTrackingData);
            } else {
                setOrders(ordersData);
            }

            setDrivers(driversData);
        } catch (error) {
            toast.error('Failed to sync delivery data');
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
            toast.success('Driver assigned successfully');
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
            toast.success('Auto-assigned to nearest driver');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Auto-assign failed');
        } finally {
            setAssigningId(null);
        }
    };

    const handleUnassign = async (orderId) => {
        const result = await Swal.fire({
            title: 'Unassign Driver?',
            text: "This will remove the current driver and return the order to the pending pool.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, Unassign'
        });

        if (result.isConfirmed) {
            try {
                setAssigningId(orderId);
                await unassignOrder(orderId);
                toast.success('Driver removed from order');
                fetchData();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to unassign');
            } finally {
                setAssigningId(null);
            }
        }
    };

    const filtered = orders.filter(o =>
    ((o.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-3">
            <Row className="mb-4 align-items-center">
                <Col>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-0 fw-bold">Dispatch Center</h5>
                                <p className="text-muted small mb-0">Manage order assignments and logistics</p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    variant={viewType === 'unassigned' ? 'primary' : 'light'}
                                    size="sm"
                                    className="px-3"
                                    onClick={() => setViewType('unassigned')}
                                >
                                    Unassigned ({viewType === 'unassigned' ? filtered.length : '...'})
                                </Button>
                                <Button
                                    variant={viewType === 'assigned' ? 'primary' : 'light'}
                                    size="sm"
                                    className="px-3"
                                    onClick={() => setViewType('assigned')}
                                >
                                    Assigned
                                </Button>
                                <Button variant="light" size="sm" onClick={fetchData} disabled={loading}>
                                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-0">
                    <div className="p-3 border-bottom">
                        <InputGroup style={{ maxWidth: '400px' }}>
                            <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search orders..."
                                className="border-start-0 ps-0 shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </div>

                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Order ID</th>
                                <th className="border-0 py-3">Customer</th>
                                <th className="border-0 py-3">Delivery Address</th>
                                <th className="border-0 py-3">Timing</th>
                                <th className="border-0 py-3 text-end pe-4">Assignment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" size="sm" />
                                        <p className="small text-muted mt-2">Updating dispatch list...</p>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">No {viewType} orders found at the moment.</td>
                                </tr>
                            ) : filtered.map((item) => (
                                <tr key={item._id}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">{item.orderId}</div>
                                        <Badge bg="info" className="fw-normal bg-opacity-10 text-info">₹{item.totalAmount}</Badge>
                                    </td>
                                    <td>
                                        <div className="fw-medium">{item.user?.name || 'Guest'}</div>
                                        <div className="small text-muted">{item.user?.phone}</div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2 text-dark small">
                                            <MapPin size={14} className="text-secondary" />
                                            <span className="text-truncate" style={{ maxWidth: '200px' }}>{item.shippingAddress?.street}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2 text-warning fw-medium small">
                                            <Clock size={14} /> {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="text-end pe-4">
                                        {viewType === 'unassigned' ? (
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="soft-success"
                                                    className="d-flex align-items-center gap-2"
                                                    onClick={() => handleAutoAssign(item._id)}
                                                    disabled={assigningId === item._id}
                                                >
                                                    <Zap size={14} /> Auto
                                                </Button>
                                                <Dropdown align="end">
                                                    <Dropdown.Toggle size="sm" variant="outline-primary" className="d-flex align-items-center gap-2" disabled={assigningId === item._id}>
                                                        {assigningId === item._id ? <Spinner animation="border" size="sm" /> : <UserCheck size={16} />}
                                                        Manual
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu className="shadow-sm p-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                                        <Dropdown.Header>Nearby Online Drivers</Dropdown.Header>
                                                        {drivers.length > 0 ? drivers.map((d) => (
                                                            <Dropdown.Item
                                                                key={d._id}
                                                                onClick={() => handleManualAssign(item._id, d._id)}
                                                                className="rounded small py-2"
                                                            >
                                                                <div className="fw-bold">{d.name}</div>
                                                                <div className="small text-muted">{d.vehicleType} • {d.phone}</div>
                                                            </Dropdown.Item>
                                                        )) : <Dropdown.Item disabled>No free drivers online</Dropdown.Item>}
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                className="d-flex align-items-center gap-2 ms-auto"
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
                </Card.Body>
            </Card>
        </div>
    );
};

export default AssignDeliveries;
