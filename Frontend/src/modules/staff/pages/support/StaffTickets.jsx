import React, { useState } from 'react';
import { Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import { MessageSquare, Send } from 'lucide-react';

const MOCK_TICKETS = [
    { id: 'TKT-202', customer: 'Rahul S.', subject: 'Order not received', status: 'Open', priority: 'High', lastUpdate: '10 mins ago' },
    { id: 'TKT-205', customer: 'Meera K.', subject: 'Refund delay', status: 'Open', priority: 'Medium', lastUpdate: '1 hour ago' },
];

const StaffTickets = () => {
    const [tickets, setTickets] = useState(MOCK_TICKETS);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyText, setReplyText] = useState('');

    const handleReplyClick = (tkt) => {
        setSelectedTicket(tkt);
        setReplyText('');
        setShowReplyModal(true);
    };

    const sendReply = () => {
        alert(`Reply sent to ${selectedTicket.customer}: ${replyText}`);
        setTickets(tickets.filter(t => t.id !== selectedTicket.id)); // Remove from open list for demo
        setShowReplyModal(false);
    };

    return (
        <div>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <h4 className="fw-bold mb-0">Daily Support Tickets</h4>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3 border-0">Ticket ID</th>
                                <th className="py-3 border-0">Customer</th>
                                <th className="py-3 border-0">Subject</th>
                                <th className="py-3 border-0">Priority</th>
                                <th className="py-3 border-0">Status</th>
                                <th className="py-3 border-0 text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((tkt) => (
                                <tr key={tkt.id}>
                                    <td className="ps-4 fw-bold text-muted">{tkt.id}</td>
                                    <td>{tkt.customer}</td>
                                    <td>
                                        <div className="fw-medium">{tkt.subject}</div>
                                        <small className="text-muted">{tkt.lastUpdate}</small>
                                    </td>
                                    <td>
                                        <Badge bg={tkt.priority === 'High' ? 'danger' : 'info'} pill>
                                            {tkt.priority}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg="success" className="bg-opacity-10 text-success fw-normal px-2 border border-success">
                                            {tkt.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleReplyClick(tkt)}
                                        >
                                            Reply
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title className="h6 fw-bold">Reply to Support Ticket</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3 p-3 bg-light rounded text-muted small">
                        <strong>Subject:</strong> {selectedTicket?.subject}
                        <br />
                        Customer is waiting for an update regarding their recent order status.
                    </div>
                    <Form.Group>
                        <Form.Label className="small fw-bold">Your Response</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="Type your reply here..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowReplyModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={sendReply} className="d-flex align-items-center gap-2">
                        <Send size={16} /> Send Reply
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default StaffTickets;
