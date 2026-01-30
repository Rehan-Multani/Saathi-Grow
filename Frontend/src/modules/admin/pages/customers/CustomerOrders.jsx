import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { Search, Filter, Calendar } from 'lucide-react';

const CUSTOMER_ORDERS_MOCK = [
    { orderId: 'ORD-8801', customer: 'Alice Johnson', items: 'Milk, Bread, Eggs', amount: '$25.50', date: '2023-11-01', status: 'Delivered' },
    { orderId: 'ORD-8802', customer: 'Carol Williams', items: 'Detergent, Soap', amount: '$15.00', date: '2023-10-31', status: 'Processing' },
    { orderId: 'ORD-8803', customer: 'Alice Johnson', items: 'Vegetables Pack', amount: '$35.00', date: '2023-10-28', status: 'Delivered' },
    { orderId: 'ORD-8804', customer: 'Bob Smith', items: 'Electronics Gadget', amount: '$200.00', date: '2023-10-25', status: 'Cancelled' },
];

const CustomerOrders = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = CUSTOMER_ORDERS_MOCK.filter(o =>
        o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                        <h5 className="mb-0 fw-bold">Customer Orders History</h5>
                        <div className="d-flex gap-2">
                            <InputGroup style={{ maxWidth: '250px' }}>
                                <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Search Customer..."
                                    className="border-start-0 ps-0 shadow-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                            <Button variant="outline-secondary" className="d-flex align-items-center gap-2">
                                <Filter size={18} /> Filters
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 border-0 py-3">Order ID</th>
                                <th className="border-0 py-3">Customer</th>
                                <th className="border-0 py-3">Items Summary</th>
                                <th className="border-0 py-3">Date</th>
                                <th className="border-0 py-3">Amount</th>
                                <th className="border-0 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((o, idx) => (
                                <tr key={idx}>
                                    <td className="ps-4 fw-bold text-primary">{o.orderId}</td>
                                    <td className="fw-medium">{o.customer}</td>
                                    <td className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>{o.items}</td>
                                    <td className="text-muted small"><Calendar size={14} className="me-1 mb-1" />{o.date}</td>
                                    <td className="fw-bold">{o.amount}</td>
                                    <td>
                                        <span className={`badge rounded-pill fw-normal px-3 bg-${o.status === 'Delivered' ? 'success' :
                                                o.status === 'Cancelled' ? 'danger' : 'info'
                                            }`}>
                                            {o.status}
                                        </span>
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

export default CustomerOrders;
