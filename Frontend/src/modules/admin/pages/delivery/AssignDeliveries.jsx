import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Badge, Dropdown, Spinner, Row, Col, Modal } from 'react-bootstrap';
import { Clock, MapPin, UserCheck, RefreshCw, Zap, Calendar, Truck, AlertCircle, X, Shield, Map, Package } from 'lucide-react';
import {
    getOrdersBySlot,
    createDeliveryRun,
    getAllDeliveryRuns,
    cancelDeliveryRun,
    getAvailablePartners
} from '../../api/adminDeliveryApi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const BatchAssignBadge = ({ count, total }) => {
    if (count === 0) return null;
    return (
        <Badge bg="primary" className="ms-2 px-2 py-1 rounded-pill">
            {count} / {total} selected
        </Badge>
    );
};

const AssignDeliveries = () => {
    // Top-Level State
    const [viewType, setViewType] = useState('slots'); // 'slots' or 'runs'
    const [loading, setLoading] = useState(true);

    // Slots View State
    const [slotData, setSlotData] = useState({ immediate: { orders: [], count: 0 }, slots: [] });
    const [selectedOrders, setSelectedOrders] = useState([]); // Array of order IDs
    const [currentSlotContext, setCurrentSlotContext] = useState(null); // Which slot are we selecting from?

    // Runs View State
    const [activeRuns, setActiveRuns] = useState([]);

    // Assignment Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [loadingDrivers, setLoadingDrivers] = useState(false);
    const [assigningLoading, setAssigningLoading] = useState(false);
    const [optimizeRoute, setOptimizeRoute] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (viewType === 'slots') {
                const data = await getOrdersBySlot();
                setSlotData(data || { immediate: { orders: [], count: 0 }, slots: [] });
                setSelectedOrders([]); // Clear selection on refresh
                setCurrentSlotContext(null);
            } else {
                const data = await getAllDeliveryRuns();
                setActiveRuns(data || []);
            }
        } catch (error) {
            toast.error('Failed to sync delivery data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewType]);

    // Handle Checkbox Selection
    const handleSelectOrder = (orderId, slotContextId) => {
        if (currentSlotContext && currentSlotContext !== slotContextId && selectedOrders.length > 0) {
            toast.warning('You can only batch orders from the same time slot.');
            return;
        }

        setCurrentSlotContext(slotContextId);
        setSelectedOrders(prev => {
            if (prev.includes(orderId)) {
                const newSelection = prev.filter(id => id !== orderId);
                if (newSelection.length === 0) setCurrentSlotContext(null); // Reset context if empty
                return newSelection;
            }
            return [...prev, orderId];
        });
    };

    const handleSelectAllInSlot = (slotGroup, slotContextId) => {
        if (currentSlotContext && currentSlotContext !== slotContextId && selectedOrders.length > 0) {
            toast.warning('You can only batch orders from the same time slot.');
            return;
        }

        const orderIds = slotGroup.orders.map(o => o._id);
        const allSelected = orderIds.every(id => selectedOrders.includes(id));

        if (allSelected) {
            // Deselect all
            setSelectedOrders(prev => {
                const newSelection = prev.filter(id => !orderIds.includes(id));
                if (newSelection.length === 0) setCurrentSlotContext(null);
                return newSelection;
            });
        } else {
            // Select all
            setCurrentSlotContext(slotContextId);
            setSelectedOrders(prev => {
                const combined = [...new Set([...prev, ...orderIds])];
                return combined;
            });
        }
    };

    // Open Modal
    const handleOpenAssignModal = async () => {
        if (selectedOrders.length === 0) {
            toast.error('Please select at least one order to batch.');
            return;
        }
        setShowAssignModal(true);
        setLoadingDrivers(true);
        try {
            const drivers = await getAvailablePartners();
            setAvailableDrivers(drivers);
        } catch (error) {
            toast.error('Failed to load available drivers');
        } finally {
            setLoadingDrivers(false);
        }
    };

    // Confirm Batch Assignment
    const handleConfirmAssignment = async (driverId) => {
        try {
            setAssigningLoading(true);

            // Build payload
            const payload = {
                partnerId: driverId,
                slotId: currentSlotContext === 'immediate' ? null : currentSlotContext,
                slotDate: new Date().toISOString(), // Defaulting to today for now
                orderIds: selectedOrders,
                optimizeRoute: optimizeRoute
            };

            await createDeliveryRun(payload);
            toast.success(`Successfully batched ${selectedOrders.length} orders into a Delivery Run!`);
            setShowAssignModal(false);
            fetchData(); // Refresh slots
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create Delivery Run');
        } finally {
            setAssigningLoading(false);
        }
    };

    // Cancel Run
    const handleCancelRun = async (runId) => {
        const result = await Swal.fire({
            title: 'Cancel Delivery Run?',
            text: "This will unassign all pending orders in this batch and free the driver.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, Cancel Run'
        });

        if (result.isConfirmed) {
            try {
                await cancelDeliveryRun(runId);
                toast.success('Run cancelled successfully');
                fetchData();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to cancel run');
            }
        }
    };

    // ----- Render Helpers -----

    const renderOrderRow = (item, slotContextId) => {
        const isSelected = selectedOrders.includes(item._id);
        const isDisabled = currentSlotContext && currentSlotContext !== slotContextId && selectedOrders.length > 0;

        return (
            <tr key={item._id} className={isSelected ? 'bg-primary bg-opacity-10' : ''}>
                <td className="ps-4" style={{ width: '40px' }}>
                    <Form.Check
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => handleSelectOrder(item._id, slotContextId)}
                        className="cursor-pointer"
                    />
                </td>
                <td>
                    <div className="fw-bold text-dark">{item.orderId}</div>
                    <Badge bg={item.paymentMethod === 'online' ? 'success' : 'info'} className="fw-normal bg-opacity-25 text-dark">
                        {item.paymentMethod === 'online' ? 'Paid Online' : 'COD'}
                    </Badge>
                </td>
                <td>
                    <div className="fw-medium">{item.user?.name || 'Guest'}</div>
                    <div className="small text-muted">{item.user?.phone}</div>
                </td>
                <td>
                    <div className="d-flex align-items-center gap-2 text-dark small">
                        <MapPin size={14} className="text-secondary flex-shrink-0" />
                        <span className="text-truncate" style={{ maxWidth: '250px' }}>
                            {item.shippingAddress?.street}, {item.shippingAddress?.city}
                        </span>
                    </div>
                </td>
                <td className="text-end pe-4 fw-bold">₹{item.totalAmount}</td>
            </tr>
        );
    };

    const renderSlotGroup = (title, groupData, slotContextId, icon) => {
        if (!groupData || groupData.orders.length === 0) return null;

        const isSelectedGroup = currentSlotContext === slotContextId;
        const selectedCountInGroup = isSelectedGroup ? selectedOrders.length : 0;

        return (
            <Card className="border-0 shadow-sm mb-4 overflow-hidden" key={slotContextId}>
                <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        {icon}
                        <h6 className="mb-0 fw-bold">{title}</h6>
                        <Badge bg="light" text="dark" className="ms-2">{groupData.count} Pending</Badge>
                        <BatchAssignBadge count={selectedCountInGroup} total={groupData.orders.length} />
                    </div>
                    <div>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleSelectAllInSlot(groupData, slotContextId)}
                            disabled={currentSlotContext && currentSlotContext !== slotContextId && selectedOrders.length > 0}
                        >
                            Select All
                        </Button>
                        {isSelectedGroup && selectedOrders.length > 0 && (
                            <Button variant="primary" size="sm" onClick={handleOpenAssignModal} className="fw-bold px-3">
                                Batch Assign ({selectedOrders.length})
                            </Button>
                        )}
                    </div>
                </Card.Header>
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-light text-muted small">
                        <tr>
                            <th className="ps-4 border-0 py-3"></th>
                            <th className="border-0 py-3">Order Details</th>
                            <th className="border-0 py-3">Customer</th>
                            <th className="border-0 py-3">Delivery Address</th>
                            <th className="border-0 py-3 text-end pe-4">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupData.orders.map(order => renderOrderRow(order, slotContextId))}
                    </tbody>
                </Table>
            </Card>
        );
    };

    return (
        <div className="p-3">
            {/* Header */}
            <Row className="mb-4 align-items-center">
                <Col>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                    <Package size={20} className="text-primary" /> Delivery Batches
                                </h5>
                                <p className="text-muted small mb-0">Group orders by slots and assign to riders efficiently</p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    variant={viewType === 'slots' ? 'primary' : 'light'}
                                    size="sm"
                                    className="px-3"
                                    onClick={() => setViewType('slots')}
                                >
                                    Group by Slots
                                </Button>
                                <Button
                                    variant={viewType === 'runs' ? 'primary' : 'light'}
                                    size="sm"
                                    className="px-3"
                                    onClick={() => setViewType('runs')}
                                >
                                    Active Runs
                                </Button>
                                <Button variant="light" size="sm" onClick={fetchData} disabled={loading}>
                                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Main Content Area */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-3">Loading delivery data...</p>
                </div>
            ) : viewType === 'slots' ? (
                // --- SLOTS VIEW ---
                <div>
                    {(!slotData.immediate.orders.length && slotData.slots.every(s => s.orders.length === 0)) ? (
                        <div className="text-center py-5 text-muted bg-white rounded shadow-sm border border-light">
                            <CheckCircleIcon size={48} className="text-success opacity-50 mb-3" />
                            <h5>All Caught Up!</h5>
                            <p>There are no unassigned orders for today.</p>
                        </div>
                    ) : (
                        <>
                            {renderSlotGroup('Immediate / ASAP', slotData.immediate, 'immediate', <Zap size={18} className="text-warning" />)}

                            {slotData.slots.map(slotGroup => (
                                renderSlotGroup(
                                    `${slotGroup.slot.label} (${slotGroup.slot.startTime} - ${slotGroup.slot.endTime})`,
                                    slotGroup,
                                    slotGroup.slot._id,
                                    <Calendar size={18} className="text-info" />
                                )
                            ))}
                        </>
                    )}
                </div>
            ) : (
                // --- ACTIVE RUNS VIEW ---
                <Card className="border-0 shadow-sm">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Run ID</th>
                                <th className="border-0 py-3">Partner</th>
                                <th className="border-0 py-3">Slot Context</th>
                                <th className="border-0 py-3 text-center">Progress</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeRuns.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">No active delivery runs found.</td>
                                </tr>
                            ) : activeRuns.map(run => {
                                const { total, delivered, failed, pending } = run.summary;
                                const isComplete = ['completed', 'partial_complete'].includes(run.status);

                                return (
                                    <tr key={run._id} className={isComplete ? 'bg-light opacity-75' : ''}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-primary">{run.runId}</div>
                                            <Badge bg={run.status === 'assigned' ? 'warning' : isComplete ? 'success' : 'info'} className="text-uppercase" style={{ fontSize: '9px' }}>
                                                {run.status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="fw-bold">{run.deliveryPartner?.name || 'Unknown'}</div>
                                            <div className="small text-muted">{run.deliveryPartner?.phone}</div>
                                        </td>
                                        <td>
                                            {run.isImmediate ? (
                                                <Badge bg="warning" text="dark"><Zap size={10} className="me-1" /> Immediate</Badge>
                                            ) : (
                                                <Badge bg="info" className="bg-opacity-25 text-primary">
                                                    <Calendar size={10} className="me-1" />
                                                    {run.deliverySlot?.label || 'Scheduled'}
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-3 fw-medium small">
                                                <span className="text-success" title="Delivered">{delivered} <CheckCircleIcon size={14} /></span>
                                                <span className="text-danger" title="Failed">{failed} <X size={14} /></span>
                                                <span className="text-warning" title="Pending">{pending} <Clock size={14} /></span>
                                            </div>
                                            <div className="progress mt-1" style={{ height: '4px' }}>
                                                <div className="progress-bar bg-success" role="progressbar" style={{ width: `${(delivered / total) * 100}%` }}></div>
                                                <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${(failed / total) * 100}%` }}></div>
                                            </div>
                                        </td>
                                        <td className="text-end pe-4">
                                            {!isComplete && run.status !== 'cancelled' && (
                                                <Button size="sm" variant="outline-danger" onClick={() => handleCancelRun(run._id)}>
                                                    Cancel Run
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Card>
            )}

            {/* Create Batch Modal */}
            <Modal show={showAssignModal} onHide={() => !assigningLoading && setShowAssignModal(false)} centered backdrop="static">
                <Modal.Header closeButton={!assigningLoading} className="border-bottom-0 pb-0">
                    <Modal.Title className="fw-bold">Create Delivery Batch</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-4 bg-light p-3 rounded d-flex justify-content-between align-items-center border">
                        <div>
                            <span className="text-muted small">Orders Selected</span>
                            <h4 className="mb-0 fw-black text-primary">{selectedOrders.length}</h4>
                        </div>
                        <div className="text-end">
                            <span className="text-muted small">Batch Type</span>
                            <h6 className="mb-0">
                                {currentSlotContext === 'immediate' ? 'Immediate / ASAP' : 'Scheduled Slot'}
                            </h6>
                        </div>
                    </div>

                    <Form.Group className="mb-4">
                        <Form.Check
                            type="switch"
                            id="optimize-route-switch"
                            label={
                                <span>
                                    <strong>AI Route Optimization</strong> <Badge bg="success" className="ms-1" style={{ fontSize: '8px' }}>BETA</Badge>
                                    <div className="text-muted small" style={{ fontSize: '11px' }}>Automatically sort stops for fastest delivery time.</div>
                                </span>
                            }
                            checked={optimizeRoute}
                            onChange={(e) => setOptimizeRoute(e.target.checked)}
                            className="bg-success bg-opacity-10 p-3 rounded border border-success border-opacity-25"
                        />
                    </Form.Group>

                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                        <Truck size={16} /> Select Free Rider
                    </h6>

                    {loadingDrivers ? (
                        <div className="text-center py-4">
                            <Spinner animation="grow" size="sm" variant="primary" />
                            <div className="small text-muted mt-2">Finding nearby drivers...</div>
                        </div>
                    ) : availableDrivers.length === 0 ? (
                        <div className="text-center py-4 bg-light rounded text-muted">
                            <AlertCircle size={24} className="mb-2" />
                            <p className="mb-0 small">No free drivers currently online.</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            {availableDrivers.map(driver => (
                                <div
                                    key={driver._id}
                                    className="d-flex justify-content-between align-items-center p-3 border rounded hover-bg-light transition-all cursor-pointer"
                                    onClick={() => handleConfirmAssignment(driver._id)}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-primary" style={{ width: '40px', height: '40px' }}>
                                            {driver.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark">{driver.name}</div>
                                            <div className="small text-muted d-flex align-items-center gap-1">
                                                <Badge bg="secondary" className="fw-normal">{driver.vehicleType}</Badge>
                                                <span>{driver.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="primary" className="rounded-pill px-3" disabled={assigningLoading}>
                                        {assigningLoading ? 'Assigning...' : 'Assign Batch'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

// Helper Icon
const CheckCircleIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default AssignDeliveries;
