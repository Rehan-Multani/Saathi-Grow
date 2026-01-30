import React, { useState } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup, Dropdown } from 'react-bootstrap';
import { Search, Eye, Filter, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';

const RETURNS_MOCK = [
    { id: 'RET-5001', orderId: 'ORD-1005', customer: 'Charlie Day', product: 'Gaming Laptop', reason: 'Defective', status: 'Pending', date: '2023-10-29' },
    { id: 'RET-5002', orderId: 'ORD-1001', customer: 'John Doe', product: 'Wireless Mouse', reason: 'Changed Mind', status: 'Approved', date: '2023-10-28' },
    { id: 'RET-5003', orderId: 'ORD-0998', customer: 'Frank Reynolds', product: 'HDMI Cable', reason: 'Wrong Item Sent', status: 'Rejected', date: '2023-10-27' },
];

const ReturnStatusBadge = ({ status }) => {
    const variants = {
        Approved: 'success',
        Pending: 'warning',
        Rejected: 'danger',
        Completed: 'primary'
    };
    return <Badge bg={variants[status] || 'secondary'} className="px-3 rounded-pill fw-normal">{status}</Badge>;
};

const ReturnRequests = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRequests = RETURNS_MOCK.filter(req =>
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Return Requests</h5>
                    <InputGroup style={{ maxWidth: '300px' }}>
                        <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                        <Form.Control
                            placeholder="Search Return ID, Order, Customer..."
                            className="border-start-0 ps-0 shadow-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Return ID</th>
                                <th className="border-0 py-3">Order ID</th>
                                <th className="border-0 py-3">Customer</th>
                                <th className="border-0 py-3">Product</th>
                                <th className="border-0 py-3">Reason</th>
                                <th className="border-0 py-3">Request Date</th>
                                <th className="border-0 py-3 text-center">Status</th>
                                <th className="border-0 py-3 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map((req, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold text-danger">{req.id}</td>
                                    <td className="text-secondary">{req.orderId}</td>
                                    <td className="fw-medium">{req.customer}</td>
                                    <td>{req.product}</td>
                                    <td className="small text-muted">{req.reason}</td>
                                    <td className="small text-muted">{req.date}</td>
                                    <td className="text-center"><ReturnStatusBadge status={req.status} /></td>
                                    <td className="text-end pe-4">
                                        <Dropdown align="end">
                                            <Dropdown.Toggle variant="link" className="text-muted p-0 shadow-none no-caret">
                                                <MoreHorizontal size={20} />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="border-0 shadow-sm">
                                                <Dropdown.Item href="#"><Eye size={16} className="me-2 text-primary" /> View Details</Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item href="#" className="text-success"><CheckCircle size={16} className="me-2" /> Approve Return</Dropdown.Item>
                                                <Dropdown.Item href="#" className="text-danger"><XCircle size={16} className="me-2" /> Reject Return</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
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

export default ReturnRequests;
