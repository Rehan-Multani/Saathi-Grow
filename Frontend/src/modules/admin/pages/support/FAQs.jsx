import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Accordion, Badge } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, HelpCircle } from 'lucide-react';
import { showDeleteConfirmation, showSuccessAlert } from '../../../../common/utils/alertUtils';

import FAQModal from '../../components/support/FAQModal';

const FAQS_MOCK = [
    { id: 1, question: 'What is the refund policy?', answer: 'Customers can request a refund within 30 days of purchase upon returning the item.', category: 'Orders', status: 'Published' },
    { id: 2, question: 'How do I change my delivery address?', answer: 'You can update your delivery address in your profile settings or during checkout.', category: 'Account', status: 'Published' },
    { id: 3, question: 'Do you offer same-day delivery?', answer: 'Yes, we offer same-day delivery in select areas for orders placed before 2 PM.', category: 'Shipping', status: 'Published' },
];

const FAQs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedFAQ, setSelectedFAQ] = useState(null);

    const filtered = FAQS_MOCK.filter(f =>
        f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setSelectedFAQ(null);
        setShowModal(true);
    };

    const handleEdit = (faq) => {
        setSelectedFAQ(faq);
        setShowModal(true);
    };

    const handleSave = async (faqData) => {
        console.log('Saving FAQ:', faqData);
        const title = selectedFAQ ? 'FAQ Updated!' : 'FAQ Added!';
        const message = selectedFAQ ? 'The FAQ has been successfully updated.' : 'New FAQ has been added successfully.';
        await showSuccessAlert(title, message);
    };

    const handleDelete = async (id) => {
        const result = await showDeleteConfirmation('Delete FAQ', 'Are you sure you want to delete this FAQ? It will be removed from the help center.');
        if (result.isConfirmed) {
            // API call would go here
            await showSuccessAlert('Deleted!', 'FAQ has been deleted.');
        }
    };

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <h5 className="mb-0 fw-bold text-nowrap">Help Center / FAQs</h5>
                    <div className="d-flex flex-column flex-sm-row gap-2 flex-grow-1 justify-content-sm-end">
                        <InputGroup className="w-100" style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0 text-muted"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Questions..."
                                className="border-start-0 ps-0 shadow-none font-small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Button
                            variant="primary"
                            className="d-flex align-items-center justify-content-center gap-2 shadow-sm"
                            onClick={handleAdd}
                        >
                            <Plus size={18} /> Add New FAQ
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-2 p-md-3">
                    <Accordion defaultActiveKey="0" className="faq-accordion">
                        {filtered.length > 0 ? filtered.map((faq, idx) => (
                            <Accordion.Item eventKey={idx.toString()} key={faq.id} className="border-0 border-bottom mb-2">
                                <Accordion.Header>
                                    <div className="d-flex justify-content-between w-100 me-3 align-items-center">
                                        <div className="d-flex align-items-center gap-2 gap-md-3">
                                            <div className="bg-light p-2 rounded-circle text-primary d-none d-sm-flex">
                                                <HelpCircle size={18} />
                                            </div>
                                            <span className="fw-bold text-dark small-md">{faq.question}</span>
                                            <Badge bg="light" text="secondary" className="border fw-normal d-none d-md-inline-block">
                                                {faq.category}
                                            </Badge>
                                        </div>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body className="pt-0 pb-3 ps-2 ps-md-5">
                                    <div className="text-muted small mb-3 lh-lg">{faq.answer}</div>
                                    <div className="d-flex justify-content-end gap-2 border-top pt-3">
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="btn-icon-soft text-primary d-flex align-items-center gap-1 px-3"
                                            onClick={() => handleEdit(faq)}
                                        >
                                            <Edit size={14} /> Edit
                                        </Button>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="btn-icon-soft text-danger d-flex align-items-center gap-1 px-3"
                                            onClick={() => handleDelete(faq.id)}
                                        >
                                            <Trash2 size={14} /> Delete
                                        </Button>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        )) : (
                            <div className="py-5 text-center text-muted">
                                No FAQs found matching your search.
                            </div>
                        )}
                    </Accordion>
                </Card.Body>
            </Card>

            <FAQModal
                show={showModal}
                onHide={() => setShowModal(false)}
                faq={selectedFAQ}
                onSave={handleSave}
            />
        </div>
    );
};

export default FAQs;
