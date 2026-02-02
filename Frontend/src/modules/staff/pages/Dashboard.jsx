import React from 'react';
import { Card, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import { ShoppingCart, Package, ListChecks, Bell, Clock, RefreshCcw, CheckCircle } from 'lucide-react';

const StaffDashboard = () => {
    return (
        <div>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Staff Dashboard</h4>
                    <p className="text-muted mb-0">Shift: Morning (9:00 AM - 5:00 PM)</p>
                </div>
                <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm align-self-start align-self-sm-auto">
                    <Clock size={18} className="text-primary" />
                    <span className="fw-bold text-dark">04:30 PM</span>
                </div>
            </div>

            <Row className="g-4 mb-4">
                <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm h-100 bg-primary text-white">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h6 className="opacity-75 mb-1">Orders To Pack</h6>
                                    <h2 className="mb-0 fw-bold">12</h2>
                                </div>
                                <div className="bg-white bg-opacity-25 p-3 rounded-circle">
                                    <ShoppingCart size={24} />
                                </div>
                            </div>
                            <small className="opacity-75">4 High Priority</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h6 className="text-muted mb-1">Pending Returns</h6>
                                    <h2 className="mb-0 fw-bold text-dark">5</h2>
                                </div>
                                <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                                    <RefreshCcw size={24} />
                                </div>
                            </div>
                            <small className="text-muted">Requires approval</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h6 className="text-muted mb-1">Low Stock Alerts</h6>
                                    <h2 className="mb-0 fw-bold text-dark">8</h2>
                                </div>
                                <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger">
                                    <Package size={24} />
                                </div>
                            </div>
                            <small className="text-muted">Check inventory</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} md={3}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h6 className="text-muted mb-1">Completed Today</h6>
                                    <h2 className="mb-0 fw-bold text-success">35</h2>
                                </div>
                                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                                    <CheckCircle size={24} />
                                </div>
                            </div>
                            <small className="text-muted">Orders processed</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                {/* Task Board */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm bg-light">
                        <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold mb-0">My Task Board</h6>
                            <Badge bg="primary">3 Pending</Badge>
                        </Card.Header>
                        <Card.Body className="p-3">
                            <Row className="g-3">
                                <Col xs={12} md={4}>
                                    <div className="bg-white p-3 rounded shadow-sm border h-100">
                                        <h6 className="fw-bold text-muted small text-uppercase mb-3 border-bottom pb-2">To Do</h6>
                                        <div className="p-2 bg-light rounded mb-2 border-start border-4 border-warning">
                                            <p className="mb-1 fw-bold small">Verify Stock: Dairy Aisle</p>
                                            <small className="text-muted text-xs">Due: 5:00 PM</small>
                                        </div>
                                        <div className="p-2 bg-light rounded mb-2 border-start border-4 border-primary">
                                            <p className="mb-1 fw-bold small">Pack Order #ORD-8992</p>
                                            <small className="text-muted text-xs">Urgent Delivery</small>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="bg-white p-3 rounded shadow-sm border h-100">
                                        <h6 className="fw-bold text-muted small text-uppercase mb-3 border-bottom pb-2">In Progress</h6>
                                        <div className="p-2 bg-light rounded mb-2 border-start border-4 border-info">
                                            <p className="mb-1 fw-bold small">Restock Shelf B2</p>
                                            <small className="text-muted text-xs">Started 10m ago</small>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="bg-white p-3 rounded shadow-sm border h-100">
                                        <h6 className="fw-bold text-muted small text-uppercase mb-3 border-bottom pb-2">Done</h6>
                                        <div className="p-2 bg-light opacity-75 rounded mb-2">
                                            <p className="mb-1 small text-decoration-line-through">Lunch Break</p>
                                        </div>
                                        <div className="p-2 bg-light opacity-75 rounded mb-2">
                                            <p className="mb-1 small text-decoration-line-through">Process Return #RET-002</p>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Notifications & Shift Summary */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white border-0 py-3">
                            <h6 className="fw-bold mb-0">Shift Performance</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between small mb-1">
                                    <span>Task Completion</span>
                                    <span className="fw-bold">85%</span>
                                </div>
                                <ProgressBar variant="success" now={85} className="height-2" style={{ height: '6px' }} />
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between small mb-1">
                                    <span>Accuracy Rate</span>
                                    <span className="fw-bold">98%</span>
                                </div>
                                <ProgressBar variant="info" now={98} className="height-2" style={{ height: '6px' }} />
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3">
                            <h6 className="fw-bold mb-0">Announcements</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="list-group list-group-flush">
                                <div className="list-group-item border-0 px-4 py-3">
                                    <div className="d-flex gap-3">
                                        <div className="bg-light p-2 rounded-circle text-primary h-100">
                                            <Bell size={18} />
                                        </div>
                                        <div>
                                            <h6 className="mb-1 fw-bold small">Store Meeting</h6>
                                            <p className="text-muted text-xs mb-0">Brief meeting at 2:00 PM regarding holiday hours.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="list-group-item border-0 px-4 py-3">
                                    <div className="d-flex gap-3">
                                        <div className="bg-light p-2 rounded-circle text-warning h-100">
                                            <Package size={18} />
                                        </div>
                                        <div>
                                            <h6 className="mb-1 fw-bold small">New Shipment</h6>
                                            <p className="text-muted text-xs mb-0">Big delivery arriving at back dock at 4:00 PM.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StaffDashboard;
