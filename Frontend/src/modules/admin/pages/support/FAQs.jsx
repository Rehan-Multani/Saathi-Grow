import React, { useState } from 'react';
import { Card, Table, Button, Form, InputGroup, Accordion } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, HelpCircle } from 'lucide-react';

const FAQS_MOCK = [
    { id: 1, question: 'What is the refund policy?', answer: 'Customers can request a refund within 30 days of purchase upon returning the item.', category: 'Orders', status: 'Published' },
    { id: 2, question: 'How do I change my delivery address?', answer: 'You can update your delivery address in your profile settings or during checkout.', category: 'Account', status: 'Published' },
    { id: 3, question: 'Do you offer same-day delivery?', answer: 'Yes, we offer same-day delivery in select areas for orders placed before 2 PM.', category: 'Shipping', status: 'Published' },
];

const FAQs = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = FAQS_MOCK.filter(f =>
        f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                    <h5 className="mb-0 fw-bold">Help Center / FAQs</h5>
                    <div className="d-flex flex-column flex-sm-row gap-2 w-100 justify-content-sm-end">
                        <InputGroup className="w-100" style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-white border-end-0"><Search size={18} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Questions..."
                                className="border-start-0 ps-0 shadow-none font-small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Button variant="primary" className="d-flex align-items-center justify-content-center gap-2 responsive-btn shadow-sm">
                            <Plus size={18} /> Add New FAQ
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Accordion defaultActiveKey="0">
                        {filtered.map((faq, idx) => (
                            <Accordion.Item eventKey={idx.toString()} key={faq.id} className="border-0 border-bottom mb-2">
                                <Accordion.Header>
                                    <div className="d-flex justify-content-between w-100 me-3 align-items-center">
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="fw-bold">{faq.question}</span>
                                            <span className="badge bg-light text-secondary border fw-normal">{faq.category}</span>
                                        </div>
                                        {/* Status Badge (Ideally should be on the right, but Accordion header structure is rigid) */}
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body className="pt-0 pb-3">
                                    <p className="mb-2 text-muted">{faq.answer}</p>
                                    <div className="d-flex justify-content-end gap-2 mt-2">
                                        <Button variant="light" size="sm" className="btn-icon-soft text-primary"><Edit size={16} /> Edit</Button>
                                        <Button variant="light" size="sm" className="btn-icon-soft text-danger"><Trash2 size={16} /> Delete</Button>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </Card.Body>
            </Card>
        </div>
    );
};

export default FAQs;
