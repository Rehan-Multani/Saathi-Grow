import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { Save, X, ArrowUpRight, CheckCircle, Package, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as complaintApi from '../../api/complaintApi';
import { toast } from 'react-toastify';

const TicketEditModal = ({ show, onHide, ticket, onEscalate, onRefresh }) => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const token = adminUser?.token;

    const [adminNotes, setAdminNotes] = useState('');
    const [processRefund, setProcessRefund] = useState(ticket?.storeRecommendedRefund || false);
    const [refundAmount, setRefundAmount] = useState(ticket?.order?.totalAmount || 0);

    const [isProcessing, setIsProcessing] = useState(false);

    if (!ticket) return null;

    const handleAction = async (action) => {
        try {
            setIsProcessing(true);
            if (action === 'ESCALATE') {
                await onEscalate(ticket.ticketId, adminNotes);
            } else if (action === 'CLOSE') {
                const res = await complaintApi.closeTicket(token, ticket.ticketId, processRefund, refundAmount);
                if (res.success) {
                    toast.success(processRefund ? t('support.tickets.modal.alerts.refund_success') : t('support.tickets.modal.alerts.close_success'));
                    onRefresh();
                }
            }
            onHide();
        } catch (error) {
            toast.error(t('support.tickets.modal.alerts.action_failed'));
        } finally {
            setIsProcessing(false);
            setAdminNotes('');
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" className="premium-modal">
            <Modal.Header closeButton className="border-0 bg-light/50">
                <Modal.Title className="fw-black text-[#0c831f] uppercase tracking-tight">
                    {t('support.tickets.modal.title', { id: ticket.ticketId })}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-4">
                <Row className="g-4">
                    {/* Left Column: Info */}
                    <Col md={7}>
                        <div className="mb-4">
                            <label className="xs font-black text-muted uppercase tracking-widest mb-2 d-block">{t('support.tickets.modal.context_label')}</label>
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
                            <label className="xs font-black text-muted uppercase tracking-widest mb-2 d-block">{t('support.tickets.modal.order_user_info')}</label>
                            <div className="d-flex gap-3">
                                <div className="flex-grow-1 bg-light/50 p-2 rounded border">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <Package size={14} className="text-[#0c831f]" />
                                        <span className="xs font-black uppercase">{t('support.tickets.modal.order_id', { id: ticket.order?.orderId?.slice(-6) })}</span>
                                    </div>
                                    <div className="xs text-muted">{t('support.tickets.modal.amount')}: ₹{ticket.order?.totalAmount}</div>
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
                                <label className="xs font-black text-muted uppercase tracking-widest mb-2 d-block">{t('support.tickets.modal.resolution_progress')}</label>
                                <div className="border-start border-2 border-success ms-2 ps-3 space-y-3">
                                    {ticket.resolutionThread.map((msg, idx) => (
                                        <div key={idx} className="mb-2">
                                            <Badge bg="light" text="dark" className="xs border mb-1 uppercase">{msg.role || msg.senderModel}</Badge>
                                            <div className="small fw-bold">{msg.message}</div>
                                            <div className="xs text-muted">By {msg.senderName}</div>
                                        </div>
                                    ))}
                                    {ticket.storeRecommendedRefund && !ticket.refundProcessed && (
                                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 xs fw-black uppercase">
                                            ⚠️ {t('support.tickets.modal.store_recommendation_msg')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Col>

                    {/* Right Column: Actions */}
                    <Col md={5} className="border-start ps-4">
                        <div className="mb-4">
                            <label className="xs font-black text-muted uppercase tracking-widest mb-2 d-block">{t('support.tickets.modal.admin_notes_label')}</label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                className="bg-light border-0 small font-bold"
                                placeholder={t('support.tickets.modal.admin_notes_placeholder')}
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
                                    <ArrowUpRight size={18} /> {t('support.tickets.modal.escalate_btn')}
                                </Button>
                            )}

                            {['STORE_RESPONDED', 'RESOLVED', 'OVERDUE'].includes(ticket.status) && (
                                <div className="bg-light p-3 rounded-3 border mb-3">
                                    <label className="xs font-black text-muted uppercase tracking-widest mb-3 d-block">{t('support.tickets.modal.resolution_action')}</label>
                                    
                                    {ticket.order && !ticket.refundProcessed && (
                                        <div className="mb-3">
                                            <Form.Check 
                                                type="checkbox"
                                                id="refund-check"
                                                label={<span className="small fw-black text-success uppercase">{t('support.tickets.modal.process_refund')}</span>}
                                                checked={processRefund}
                                                onChange={(e) => setProcessRefund(e.target.checked)}
                                                className="mb-2"
                                            />
                                            {processRefund && (
                                                <InputGroup size="sm">
                                                    <InputGroup.Text className="bg-white">₹</InputGroup.Text>
                                                    <Form.Control 
                                                        type="number"
                                                        value={refundAmount}
                                                        onFocus={(e) => { if (refundAmount === 0 || refundAmount === "0") setRefundAmount("") }}
                                                        onBlur={(e) => { if (refundAmount === "" || refundAmount === null) setRefundAmount(0) }}
                                                        onChange={(e) => setRefundAmount(e.target.value)}
                                                        className="fw-bold"
                                                    />
                                                </InputGroup>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        variant="success"
                                        className="w-100 fw-black uppercase tracking-widest py-2 d-flex align-items-center justify-content-center gap-2 border-0 shadow-sm"
                                        onClick={() => handleAction('CLOSE')}
                                        disabled={isProcessing}
                                    >
                                        <CheckCircle size={18} /> {processRefund ? t('support.tickets.modal.refund_close_btn') : t('support.tickets.modal.close_btn')}
                                    </Button>
                                </div>
                            )}

                            <Button variant="light" onClick={onHide} className="fw-black uppercase xs tracking-tighter text-muted mt-2">
                                {t('support.tickets.modal.keep_pending')}
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default TicketEditModal;

