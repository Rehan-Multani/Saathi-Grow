import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Send, Mail, User, Store } from 'lucide-react';

const ContactVendorModal = ({ show, onHide, vendor, onSubmit }) => {
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulating sending message
        console.log(`Contacting Vendor ${vendor.name}:`, { subject, message });
        if (onSubmit) onSubmit();
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered className="contact-vendor-modal">
            <Modal.Header closeButton className="border-0 pb-0 px-4">
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <Mail className="text-info" size={24} /> Contact Vendor
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-4 px-4">
                <Form onSubmit={handleSubmit}>
                    <div className="d-flex align-items-center gap-2 mb-4 p-2 bg-light rounded border">
                        <div className="bg-white rounded-circle p-2 shadow-sm text-primary">
                            <Store size={20} />
                        </div>
                        <div>
                            <div className="fw-bold small">{vendor?.name}</div>
                            <div className="text-muted text-xs">Owner: {vendor?.owner}</div>
                        </div>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted uppercase">Subject</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Reason for contacting..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="bg-light border-0 py-2 shadow-none"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-0">
                        <Form.Label className="small fw-bold text-muted uppercase">Message</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            placeholder={`Type your message to ${vendor?.owner || 'the vendor'}...`}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-light border-0 shadow-none"
                            required
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button variant="light" onClick={onHide} className="px-4 py-2 text-secondary fw-medium border shadow-none">
                            Back
                        </Button>
                        <Button variant="info" type="submit" className="px-4 py-2 fw-medium d-flex align-items-center gap-2 shadow-sm text-white">
                            <Send size={18} /> Send Message
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ContactVendorModal;
