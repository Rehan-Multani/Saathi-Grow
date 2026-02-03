import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Save, X } from 'lucide-react';

const TicketEditModal = ({ show, onHide, ticket, onSave }) => {
    const [formData, setFormData] = useState({
        subject: '',
        priority: '',
        status: '',
        user: ''
    });

    useEffect(() => {
        if (ticket) {
            setFormData({
                subject: ticket.subject || '',
                priority: ticket.priority || 'Low',
                status: ticket.status || 'Open',
                user: ticket.user || ''
            });
        }
    }, [ticket]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...ticket, ...formData });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold fs-5">Edit Support Ticket</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="py-3">
                    <div className="d-flex flex-column gap-3">
                        <Form.Group>
                            <Form.Label className="small fw-bold text-muted text-uppercase mb-1">Subject</Form.Label>
                            <Form.Control
                                type="text"
                                className="bg-light border-0 py-2 small"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Row className="g-2">
                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted text-uppercase mb-1">Priority</Form.Label>
                                    <Form.Select
                                        className="bg-light border-0 py-2 shadow-none small"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted text-uppercase mb-1">Status</Form.Label>
                                    <Form.Select
                                        className="bg-light border-0 py-2 shadow-none small"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Closed">Closed</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0 pb-4">
                    <Button variant="light" onClick={onHide} className="px-4">
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" className="px-4 d-flex align-items-center gap-2 shadow-sm">
                        <Save size={18} /> Update Ticket
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default TicketEditModal;
