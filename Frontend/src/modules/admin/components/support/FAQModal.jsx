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
            <Modal.Header closeButton className="border-0 pb-0 shadow-none">
                <Modal.Title className="fw-black text-[#0c831f] uppercase tracking-tight text-lg">
                    {faq ? t('support.faqs.modal.title_edit', { defaultValue: 'Edit FAQ' }) : t('support.faqs.modal.title_add', { defaultValue: 'Add New FAQ' })}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="py-4">
                    <div className="d-flex flex-column gap-4">
                        <Form.Group>
                            <Form.Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('support.faqs.modal.question_label', { defaultValue: 'Question' })}</Form.Label>
                            <Form.Control
                                type="text"
                                className="bg-light border-0 py-2.5 font-bold shadow-none text-sm placeholder:italic"
                                placeholder={t('support.faqs.modal.question_placeholder', { defaultValue: 'Enter the question...' })}
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('support.faqs.modal.answer_label', { defaultValue: 'Answer' })}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                className="bg-light border-0 py-2.5 font-bold shadow-none text-sm placeholder:italic"
                                placeholder={t('support.faqs.modal.answer_placeholder', { defaultValue: 'Provide a detailed answer...' })}
                                value={formData.answer}
                                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Row className="g-3">
                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('support.faqs.modal.category_label', { defaultValue: 'Category' })}</Form.Label>
                                    <Form.Select
                                        className="bg-light border-0 py-2.5 shadow-none font-bold text-sm"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="General">{t('support.faqs.modal.categories.general', { defaultValue: 'General' })}</option>
                                        <option value="Orders">{t('support.faqs.modal.categories.orders', { defaultValue: 'Orders' })}</option>
                                        <option value="Shipping">{t('support.faqs.modal.categories.shipping', { defaultValue: 'Shipping' })}</option>
                                        <option value="Account">{t('support.faqs.modal.categories.account', { defaultValue: 'Account' })}</option>
                                        <option value="Payment">{t('support.faqs.modal.categories.payment', { defaultValue: 'Payment' })}</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('support.faqs.modal.status_label', { defaultValue: 'Status' })}</Form.Label>
                                    <Form.Select
                                        className="bg-light border-0 py-2.5 shadow-none font-bold text-sm"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Published">{t('support.faqs.modal.statuses.published', { defaultValue: 'Published' })}</option>
                                        <option value="Draft">{t('support.faqs.modal.statuses.draft', { defaultValue: 'Draft' })}</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0 pb-4 justify-content-end gap-2 px-4 mt-2">
                    <Button variant="light" onClick={onHide} className="px-4 border-0 bg-gray-50 text-gray-500 hover:bg-gray-100 font-black uppercase text-[10px] tracking-wider py-2.5 rounded-xl">
                        {t('support.faqs.modal.cancel', { defaultValue: 'Cancel' })}
                    </Button>
                    <Button variant="primary" type="submit" className="px-5 d-flex align-items-center gap-2 shadow-lg shadow-blue-500/30 font-black uppercase tracking-wider border-0 text-[10px] py-2.5 rounded-xl">
                        <Save size={16} strokeWidth={3} /> {faq ? t('support.faqs.modal.update_btn', { defaultValue: 'Update' }) : t('support.faqs.modal.save_btn', { defaultValue: 'Save FAQ' })}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default FAQModal;
