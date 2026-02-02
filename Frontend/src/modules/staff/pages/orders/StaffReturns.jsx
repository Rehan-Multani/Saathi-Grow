import React, { useState } from 'react';
import { Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import { RefreshCcw, Check, X, AlertCircle } from 'lucide-react';

const MOCK_RETURNS = [
    { id: 'RET-001', orderId: 'ORD-8821', customer: 'Alice Cooper', reason: 'Damaged Item', amount: '₹150', status: 'Pending' },
    { id: 'RET-002', orderId: 'ORD-9912', customer: 'Bob Marley', reason: 'Wrong Product', amount: '₹1200', status: 'Pending' },
];

const StaffReturns = () => {
    const [returns, setReturns] = useState(MOCK_RETURNS);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);

    const handleApprove = (id, amount) => {
        // Simple mock limit check
        const numericAmount = parseInt(amount.replace('₹', ''));
        if (numericAmount > 1000) {
            alert('Amount exceeds staff approval limit (₹1000). Please escalate to Admin.');
            return;
        }
        setReturns(returns.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    };

    const handleRejectClick = (ret) => {
        setSelectedReturn(ret);
        setShowRejectModal(true);
    };

    const confirmReject = () => {
        setReturns(returns.map(r => r.id === selectedReturn.id ? { ...r, status: 'Rejected' } : r));
        setShowRejectModal(false);
    };

    return (
        <div>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                <h4 className="fw-bold mb-0">Return Requests</h4>
                <div className="bg-warning bg-opacity-10 px-3 py-2 rounded text-warning border border-warning small d-flex align-items-center gap-2 align-self-start align-self-sm-auto">
                    <AlertCircle size={16} />
                    <span>Staff Approval Limit: ₹1000</span>
                </div>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3 border-0">Return ID</th>
                                <th className="py-3 border-0">Order Ref</th>
                                <th className="py-3 border-0">Customer</th>
                                <th className="py-3 border-0">Reason</th>
                                <th className="py-3 border-0">Amount</th>
                                <th className="py-3 border-0">Status</th>
                                <th className="py-3 border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returns.map((ret) => (
                                <tr key={ret.id}>
                                    <td className="ps-4 fw-bold">{ret.id}</td>
                                    <td>{ret.orderId}</td>
                                    <td>{ret.customer}</td>
                                    <td>
                                        <Badge bg="light" text="dark" className="border fw-normal">
                                            {ret.reason}
                                        </Badge>
                                    </td>
                                    <td className="fw-bold">{ret.amount}</td>
                                    <td>
                                        <Badge
                                            bg={ret.status === 'Approved' ? 'success' : ret.status === 'Rejected' ? 'danger' : 'warning'}
                                            className="rounded-pill px-3 fw-normal"
                                        >
                                            {ret.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        {ret.status === 'Pending' && (
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    className="d-flex align-items-center gap-1"
                                                    onClick={() => handleApprove(ret.id, ret.amount)}
                                                >
                                                    <Check size={14} /> Approve
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="d-flex align-items-center gap-1"
                                                    onClick={() => handleRejectClick(ret)}
                                                >
                                                    <X size={14} /> Reject
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold h6">Reject Return Request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">Reason for Rejection</Form.Label>
                        <Form.Select>
                            <option>Item Condition Not Acceptable</option>
                            <option>Outside Return Window</option>
                            <option>Other</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group>
                        <Form.Control as="textarea" rows={3} placeholder="Add comments..." />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmReject}>Confirm Reject</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default StaffReturns;
