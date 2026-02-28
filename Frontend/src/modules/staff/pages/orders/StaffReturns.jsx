import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { RefreshCcw, Check, X, AlertCircle } from 'lucide-react';
import { getReturnRequests, handleReturnRequest } from '../../../admin/api/orderApi';
import Swal from 'sweetalert2';

const StaffReturns = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const data = await getReturnRequests();
            setReturns(data);
        } catch (error) {
            console.error('Failed to fetch returns:', error);
            Swal.fire('Error', 'Could not load return requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    const processReturn = async (id, action) => {
        try {
            await handleReturnRequest(id, action);
            Swal.fire('Success', `Return ${action.toLowerCase()} successfully`, 'success');
            fetchReturns();
            setShowRejectModal(false);
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || `Failed to ${action.toLowerCase()} return`, 'error');
        }
    };

    const handleApprove = (id, amount) => {
        if (amount > 1000) {
            Swal.fire('Limit Exceeded', 'Amount exceeds staff approval limit (₹1000). Please escalate to Admin.', 'warning');
            return;
        }
        processReturn(id, 'Approved');
    };

    const handleRejectClick = (ret) => {
        setSelectedReturn(ret);
        setShowRejectModal(true);
    };

    const confirmReject = () => {
        processReturn(selectedReturn._id, 'Rejected');
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
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                                        Loading return requests...
                                    </td>
                                </tr>
                            ) : returns.length > 0 ? (
                                returns.map((ret) => (
                                    <tr key={ret._id}>
                                        <td className="ps-4 fw-bold text-primary">{ret._id.substring(ret._id.length - 6).toUpperCase()}</td>
                                        <td>{ret.orderId}</td>
                                        <td>{ret.user?.name || 'Customer'}</td>
                                        <td>
                                            <Badge bg="light" text="dark" className="border fw-normal">
                                                {ret.returnRequest?.reason || 'No specific reason provided'}
                                            </Badge>
                                        </td>
                                        <td className="fw-bold">₹{ret.totalAmount}</td>
                                        <td>
                                            <Badge
                                                bg={ret.returnRequest?.status === 'Approved' ? 'success' : ret.returnRequest?.status === 'Rejected' ? 'danger' : 'warning'}
                                                className="rounded-pill px-3 fw-normal uppercase"
                                            >
                                                {ret.returnRequest?.status || 'Pending'}
                                            </Badge>
                                        </td>
                                        <td className="text-end pe-4">
                                            {ret.returnRequest?.status === 'Pending' && (
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        className="d-flex align-items-center gap-1"
                                                        onClick={() => handleApprove(ret._id, ret.totalAmount)}
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">No pending return requests found.</td>
                                </tr>
                            )}
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
