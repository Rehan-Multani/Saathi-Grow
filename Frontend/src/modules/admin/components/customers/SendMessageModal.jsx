import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Send, Mail, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SendMessageModal = ({ show, onHide, customer, type, onSubmit }) => {
    const { t } = useTranslation();
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulating sending message
        console.log(`Sending ${type} to ${customer.email}:`, { subject, message });
        if (onSubmit) onSubmit();
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered className="send-message-modal">
            <Modal.Header closeButton className="border-0 pb-0 px-4">
                <Modal.Title className="fw-black d-flex align-items-center gap-2 uppercase tracking-tight text-[#0c831f]">
                    {type === 'Email' ? <Mail className="text-[#0c831f]" size={24} /> : <Send className="text-[#0c831f]" size={24} />}
                    {t('customers.all.message_modal.title', { type: type === 'Email' ? t('customers.all.actions.send_email') : t('customers.all.actions.send_message'), name: customer?.name })}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4 px-4">
                <Form onSubmit={handleSubmit}>
                    <div className="d-flex align-items-center gap-2 mb-4 p-2 bg-light rounded border">
                        <div className="bg-white rounded-circle p-2 shadow-sm">
                            <User size={20} className="text-[#0c831f]" />
                        </div>
                        <div>
                            <div className="fw-black small">{customer?.name}</div>
                            <div className="text-muted text-xs font-bold">{type === 'Email' ? customer?.email : customer?.phone}</div>
                        </div>
                    </div>

                    {type === 'Email' && (
                        <Form.Group className="mb-3">
                            <Form.Label className="xs font-black text-muted uppercase tracking-widest mb-1">{t('customers.all.message_modal.subject_label')}</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={t('customers.all.message_modal.subject_placeholder')}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="bg-light border-0 py-2 shadow-none font-bold"
                                required
                            />
                        </Form.Group>
                    )}

                    <Form.Group className="mb-0">
                        <Form.Label className="xs font-black text-muted uppercase tracking-widest mb-1">{t('customers.all.message_modal.message_label')}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            placeholder={t('customers.all.message_modal.message_placeholder', { type: type.toLowerCase() })}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-light border-0 shadow-none font-bold"
                            required
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 border shadow-none fw-black uppercase xs tracking-tighter text-muted">
                            {t('customers.all.message_modal.cancel')}
                        </Button>
                        <Button variant={type === 'Email' ? 'info' : 'success'} type="submit" className="px-4 py-2 fw-black uppercase tracking-widest d-flex align-items-center gap-2 shadow-sm text-white border-0">
                            <Send size={18} /> {t('customers.all.message_modal.send_btn', { type: type })}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default SendMessageModal;
