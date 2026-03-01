import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { Save, X, ArrowUpRight, CheckCircle, Package, User, MessageCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as complaintApi from '../../api/complaintApi';
import { toast } from 'react-toastify';

const TicketEditModal = ({ show, onHide, ticket, onEscalate, onRefresh }) => {
    const { adminUser } = useAdminAuth();
    const token = adminUser?.token;

    const [adminNotes, setAdminNotes] = useState('');

    const [isProcessing, setIsProcessing] = useState(false);

    if (!ticket) return null;

    const handleAction = async (action) => {
        try {
            setIsProcessing(true);
            if (action === 'ESCALATE') {
                await onEscalate(ticket.ticketId, adminNotes);
            } else if (action === 'CLOSE') {
                const res = await complaintApi.closeTicket(token, ticket.ticketId);
                if (res.success) {
                    toast.success('Ticket closed successfully');
                    onRefresh();
                }
            }
            onHide();
        } catch (error) {
            toast.error('Action failed');
        } finally {
            setIsProcessing(false);
            setAdminNotes('');
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="premium-modal">
            <Modal.Header closeButton className="border-0 bg-light/50">
                <Modal.Title className="fw-black text-[#0c831f] uppercase tracking-tight">
                    Ticket Details: {ticket.ticketId}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-4">
                <Row className="g-4">
                    {/* Left Column: Info */}
                    <Col md={7}>
                        <div className="mb-4">
                            <label className="xs font-black text-muted uppercase tracking-widest mb-2 d-block">Complaint Context</label>
                            <div className="bg-light p-3 rounded-3 border border-gray-100 mb-2">
                                <h6 className="fw-black mb-1">{ticket.category}</h6>
                                <p className="small text-muted mb-0">{ticket.description}</p>
                            </div>

                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <div className="d-flex gap-2 mb-3 overflow-auto pb-2">
                                    {ticket.attachments.map((img, idx) => (
                                        <a key={idx} href={img} target="_blank" rel="noreferrer" className="flex-shrink-0">
                                            <img
                                                src={img}
                                                alt="Evidence"
                                                className="rounded border border-gray-200 shadow-sm hover:opacity-80 transition-opacity"
                                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                            />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>


                        <div className="mb-4">
                            <label className="xs font-black text-muted uppercase tracking-widest mb-2 d-block">Order & User</label>
                            <div className="d-flex gap-3">
                                <div className="flex-grow-1 bg-light/50 p-2 rounded border">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <Package size={14} className="text-[#0c831f]" />
                                        <span className="xs font-black uppercase">Order #{ticket.order?.orderId?.slice(-6)}</span>
                                    </div>
                                    <div className="xs text-muted">Amount: ₹{ticket.order?.totalAmount}</div>
                                </div>
                                <div className="flex-grow-1 bg-light/50 p-2 rounded border">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <User size={14} className="text-[#0c831f]" />
                                        <span className="xs font-black uppercase">{ticket.user?.name}</span>
                                    </div>
                                    <div className="xs text-muted">{ticket.user?.phone}</div>
                                </div>
                            </div>
                        </div>

                        {ticket.resolutionThread?.length > 0 && (
                            <div>
                                <label className="xs font-black text-muted uppercase tracking-widest mb-2 d-block">Resolution Progress</label>
                                <div className="border-start border-2 border-success ms-2 ps-3 space-y-3">
                                    {ticket.resolutionThread.map((msg, idx) => (
                                        <div key={idx} className="mb-2">
                                            <Badge bg="light" text="dark" className="xs border mb-1 uppercase">{msg.role}</Badge>
                                            <div className="small fw-bold">{msg.message}</div>
                                            <div className="xs text-muted">By {msg.senderName}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Col>

                    {/* Right Column: Actions */}
                    <Col md={5} className="border-start ps-4">
                        <div className="mb-4">
                            <label className="xs font-black text-muted uppercase tracking-widest mb-2 d-block">Internal Admin Notes</label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                className="bg-light border-0 small font-bold"
                                placeholder="Add notes for the store or internal records..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                            />
                        </div>

                        <div className="d-grid gap-2">
                            {ticket.status === 'OPEN' && (
                                <Button
                                    variant="warning"
                                    className="fw-black uppercase tracking-widest py-2 d-flex align-items-center justify-content-center gap-2 border-0 shadow-sm"
                                    onClick={() => handleAction('ESCALATE')}
                                    disabled={isProcessing}
                                >
                                    <ArrowUpRight size={18} /> Escalate to Store
                                </Button>
                            )}

                            {['STORE_RESPONDED', 'RESOLVED'].includes(ticket.status) && (
                                <Button
                                    variant="success"
                                    className="fw-black uppercase tracking-widest py-2 d-flex align-items-center justify-content-center gap-2 border-0 shadow-sm"
                                    onClick={() => handleAction('CLOSE')}
                                    disabled={isProcessing}
                                >
                                    <CheckCircle size={18} /> Close Ticket
                                </Button>
                            )}

                            <Button variant="light" onClick={onHide} className="fw-black uppercase xs tracking-tighter text-muted mt-2">
                                Keep Pending
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default TicketEditModal;

