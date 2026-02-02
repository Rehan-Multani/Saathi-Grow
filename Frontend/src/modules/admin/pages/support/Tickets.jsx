import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, Plus, MessageCircle, MoreHorizontal, Edit, Trash2, Info } from 'lucide-react';

const TICKETS_MOCK = [
    { id: '#T-1001', subject: 'Refund Request for Order #123', user: 'John Doe', priority: 'High', status: 'Open', date: '2 hours ago' },
    { id: '#T-1002', subject: 'Delivery delayed', user: 'Jane Smith', priority: 'Medium', status: 'In Progress', date: 'Yesterday' },
    { id: '#T-1003', subject: 'Account Login Issue', user: 'Mark Wilson', priority: 'Low', status: 'Closed', date: '3 days ago' },
];

const SupportTickets = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = TICKETS_MOCK.filter(t =>
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <h5 className="mb-0 fw-bold">Support Tickets</h5>
                    <div className="d-flex flex-column flex-sm-row gap-2 w-100 justify-content-sm-end">
                        <InputGroup className="w-100" style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Tickets..."
                                className="border-start-0 ps-0 shadow-none font-small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Button variant="primary" className="d-flex align-items-center justify-content-center gap-2 responsive-btn shadow-sm">
                            <Plus size={18} />
                            <span className="d-none d-sm-inline">Create Ticket</span>
                            <span className="d-inline d-sm-none">Create</span>
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Ticket ID</th>
                                <th className="border-0 py-3">Subject</th>
                                <th className="border-0 py-3">User</th>
                                <th className="border-0 py-3">Priority</th>
                                <th className="border-0 py-3">Status</th>
                                <th className="border-0 py-3">Date</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((t, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold text-primary">{t.id}</td>
                                    <td>{t.subject}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-secondary small fw-bold" style={{ width: '28px', height: '28px' }}>
                                                {t.user.charAt(0)}
                                            </div>
                                            {t.user}
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={t.priority === 'High' ? 'danger' : t.priority === 'Medium' ? 'warning' : 'info'} className="fw-normal">
                                            {t.priority}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg={t.status === 'Open' ? 'primary' : t.status === 'Closed' ? 'secondary' : 'warning'} className="rounded-pill fw-normal px-3">
                                            {t.status}
                                        </Badge>
                                    </td>
                                    <td className="text-muted small">{t.date}</td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button variant="light" size="sm" className="btn-icon-soft text-info">
                                                <Info size={16} />
                                            </Button>
                                            <Button variant="light" size="sm" className="btn-icon-soft text-primary">
                                                <Edit size={16} />
                                            </Button>
                                            <Button variant="light" size="sm" className="btn-icon-soft text-danger">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
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

export default SupportTickets;
