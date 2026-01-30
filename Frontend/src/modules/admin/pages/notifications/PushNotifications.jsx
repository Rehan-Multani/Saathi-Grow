import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Badge, Table } from 'react-bootstrap';
import { Send, Bell, Smartphone, User, Clock, CheckCircle } from 'lucide-react';

const NOTIFICATIONS_HISTORY = [
    { title: 'Big Summer Sale!', body: 'Get 50% off on all electronics today.', audience: 'All Users', sentAt: '2023-11-01 10:00 AM', status: 'Sent' },
    { title: 'Your Order is Out for Delivery', body: 'Order #12345 will reach you soon.', audience: 'User: John Doe', sentAt: '2023-11-01 02:30 PM', status: 'Delivered' },
    { title: 'New Arrival Alert', body: 'Check out the new iPhone 15 Pro.', audience: 'Prospective Buyers', sentAt: '2023-10-30 09:00 AM', status: 'Failed' },
];

const PushNotifications = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('All Users');

    const handleSend = () => {
        alert(`Sending notification to ${target}: ${title}`);
        setTitle('');
        setMessage('');
    };

    return (
        <div className="p-3">
            <Row className="g-4 mb-4">
                {/* Create Notification Panel */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-primary text-white py-3">
                            <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                <Send size={18} /> Send New Notification
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Target Audience</Form.Label>
                                <Form.Select value={target} onChange={(e) => setTarget(e.target.value)}>
                                    <option>All Users</option>
                                    <option>Specific User (By ID)</option>
                                    <option>Active in Last 30 Days</option>
                                    <option>Cart Abandoners</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. Flash Sale Live Now!"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Message Body</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Enter your message here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </Form.Group>

                            <Button variant="primary" className="w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleSend}>
                                <Bell size={18} /> Send Notification
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Preview Panel */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100 bg-light">
                        <Card.Body className="d-flex align-items-center justify-content-center">
                            <div className="bg-white rounded-4 shadow p-3" style={{ width: '280px', minHeight: '400px', border: '1px solid #ddd' }}>
                                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                    <span className="small fw-bold text-muted">SathiGro</span>
                                    <span className="small text-muted">Now</span>
                                </div>
                                <div className="d-flex gap-2">
                                    <div className="bg-primary rounded p-2 text-white" style={{ height: '32px', width: '32px' }}>
                                        <Bell size={16} />
                                    </div>
                                    <div>
                                        <h6 className="mb-1 fw-bold small text-dark">{title || 'Notification Title'}</h6>
                                        <p className="mb-0 small text-muted" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                                            {message || 'This is how your notification message will appear on the user\'s device lock screen.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Stats Panel */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="fw-bold mb-3">Quick Stats</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Total Sent (This Month)</span>
                                <span className="fw-bold">12,500</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Open Rate</span>
                                <span className="fw-bold text-success">18.5%</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Failed Delivery</span>
                                <span className="fw-bold text-danger">1.2%</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* History Table */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 py-3">
                    <h5 className="mb-0 fw-bold">Notification History</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Content</th>
                                <th className="border-0 py-3">Audience</th>
                                <th className="border-0 py-3">Sent At</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {NOTIFICATIONS_HISTORY.map((n, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">{n.title}</div>
                                        <div className="small text-muted text-truncate" style={{ maxWidth: '250px' }}>{n.body}</div>
                                    </td>
                                    <td>
                                        <Badge bg="light" text="dark" className="border fw-normal d-inline-flex align-items-center gap-1">
                                            <User size={12} /> {n.audience}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-1 text-muted small">
                                            <Clock size={14} /> {n.sentAt}
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={n.status === 'Sent' || n.status === 'Delivered' ? 'success' : 'danger'} className="rounded-pill fw-normal px-3">
                                            {n.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button variant="link" size="sm" className="text-decoration-none">Resend</Button>
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

export default PushNotifications;
