import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Save } from 'lucide-react';

const FAQModal = ({ show, onHide, faq, onSave }) => {
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: 'General',
        status: 'Published'
    });

    useEffect(() => {
        if (faq) {
            setFormData({
                question: faq.question || '',
                answer: faq.answer || '',
                category: faq.category || 'General',
                status: faq.status || 'Published'
            });
        } else {
            setFormData({
                question: '',
                answer: '',
                category: 'General',
                status: 'Published'
            });
        }
    }, [faq, show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...faq, ...formData });
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold fs-5">{faq ? 'Edit FAQ' : 'Add New FAQ'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="py-3">
                    <div className="d-flex flex-column gap-3">
                        <Form.Group>
                            <Form.Label className="small fw-bold text-muted text-uppercase mb-1">Question</Form.Label>
                            <Form.Control
                                type="text"
                                className="bg-light border-0 py-2"
                                placeholder="Enter the question"
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="small fw-bold text-muted text-uppercase mb-1">Answer</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                className="bg-light border-0 py-2"
                                placeholder="Enter the answer"
                                value={formData.answer}
                                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Row className="g-2">
                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted text-uppercase mb-1">Category</Form.Label>
                                    <Form.Select
                                        className="bg-light border-0 py-2 shadow-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="General">General</option>
                                        <option value="Orders">Orders</option>
                                        <option value="Shipping">Shipping</option>
                                        <option value="Account">Account</option>
                                        <option value="Payment">Payment</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted text-uppercase mb-1">Status</Form.Label>
                                    <Form.Select
                                        className="bg-light border-0 py-2 shadow-none"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Published">Published</option>
                                        <option value="Draft">Draft</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0 pb-4 justify-content-end gap-2">
                    <Button variant="light" onClick={onHide} className="px-4 border">
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" className="px-4 d-flex align-items-center gap-2 shadow-sm">
                        <Save size={18} /> {faq ? 'Update FAQ' : 'Save FAQ'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default FAQModal;
