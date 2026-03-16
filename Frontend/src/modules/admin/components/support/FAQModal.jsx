import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FAQModal = ({ show, onHide, faq, onSave }) => {
    const { t } = useTranslation();
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
        <Modal show={show} onHide={onHide} centered className="premium-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-black text-[#0c831f] uppercase tracking-tight">
                    {faq ? t('support.faqs.modal.title_edit') : t('support.faqs.modal.title_add')}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="py-3">
                    <div className="d-flex flex-column gap-3">
                        <Form.Group>
                            <Form.Label className="xs font-black text-muted uppercase tracking-widest mb-1">{t('support.faqs.modal.question_label')}</Form.Label>
                            <Form.Control
                                type="text"
                                className="bg-light border-0 py-2 font-bold"
                                placeholder={t('support.faqs.modal.question_placeholder')}
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="xs font-black text-muted uppercase tracking-widest mb-1">{t('support.faqs.modal.answer_label')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                className="bg-light border-0 py-2 font-bold"
                                placeholder={t('support.faqs.modal.answer_placeholder')}
                                value={formData.answer}
                                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Row className="g-2">
                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label className="xs font-black text-muted uppercase tracking-widest mb-1">{t('support.faqs.modal.category_label')}</Form.Label>
                                    <Form.Select
                                        className="bg-light border-0 py-2 shadow-none font-bold"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="General">{t('support.faqs.modal.categories.general')}</option>
                                        <option value="Orders">{t('support.faqs.modal.categories.orders')}</option>
                                        <option value="Shipping">{t('support.faqs.modal.categories.shipping')}</option>
                                        <option value="Account">{t('support.faqs.modal.categories.account')}</option>
                                        <option value="Payment">{t('support.faqs.modal.categories.payment')}</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label className="xs font-black text-muted uppercase tracking-widest mb-1">{t('support.faqs.modal.status_label')}</Form.Label>
                                    <Form.Select
                                        className="bg-light border-0 py-2 shadow-none font-bold"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Published">{t('support.faqs.modal.statuses.published')}</option>
                                        <option value="Draft">{t('support.faqs.modal.statuses.draft')}</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0 pb-4 justify-content-end gap-2">
                    <Button variant="light" onClick={onHide} className="px-4 border fw-black uppercase xs tracking-tighter text-muted">
                        {t('support.faqs.modal.cancel')}
                    </Button>
                    <Button variant="primary" type="submit" className="px-4 d-flex align-items-center gap-2 shadow-sm fw-black uppercase tracking-widest border-0">
                        <Save size={18} /> {faq ? t('support.faqs.modal.update_btn') : t('support.faqs.modal.save_btn')}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default FAQModal;
