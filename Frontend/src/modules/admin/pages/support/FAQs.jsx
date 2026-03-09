import React, { useState, useMemo, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Accordion, Badge, Spinner } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, HelpCircle, ChevronRight } from 'lucide-react';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';

import FAQModal from '../../components/support/FAQModal';
import { fetchFAQs, createFAQ, updateFAQ, deleteFAQ } from '../../api/faqApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

const FAQs = () => {
    const { adminUser } = useAdminAuth();
    const token = adminUser?.token;
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedFAQ, setSelectedFAQ] = useState(null);
    const [activeKeys, setActiveKeys] = useState([]);

    const loadFAQs = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await fetchFAQs(token);
            setFaqs(data);
        } catch (err) {
            showErrorAlert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFAQs();
    }, [token]);

    const filtered = useMemo(() => faqs.filter(f =>
        f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm, faqs]);

    const handleAdd = () => {
        setSelectedFAQ(null);
        setShowModal(true);
    };

    const handleEdit = (faq) => {
        setSelectedFAQ(faq);
        setShowModal(true);
    };

    const handleSave = async (faqData) => {
        try {
            if (selectedFAQ) {
                await updateFAQ(token, selectedFAQ._id, faqData);
            } else {
                await createFAQ(token, faqData);
            }
            setShowModal(false);
            loadFAQs();
            const title = selectedFAQ ? 'FAQ Updated!' : 'FAQ Added!';
            const message = selectedFAQ ? 'The FAQ has been successfully updated.' : 'New FAQ has been added successfully.';
            await showSuccessAlert(title, message);
        } catch (err) {
            showErrorAlert('Error', err.message);
        }
    };

    const handleDelete = async (id) => {
        const result = await showDeleteConfirmation('Delete FAQ', 'Are you sure you want to delete this FAQ? It will be removed from the help center.');
        if (result.isConfirmed) {
            try {
                await deleteFAQ(token, id);
                loadFAQs();
                await showSuccessAlert('Deleted!', 'FAQ has been deleted.');
            } catch (err) {
                showErrorAlert('Error', err.message);
            }
        }
    };

    return (
        <div className="p-3">
            <Card className="border-0 shadow-sm mb-4 bg-white rounded-3xl overflow-hidden">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 p-4">
                    <div>
                        <h5 className="mb-0 fw-black text-dark tracking-tight">Help Center / FAQs</h5>
                        <p className="text-muted small mb-0 mt-1 italic opacity-75">Common questions and platform mechanics.</p>
                    </div>
                    <div className="d-flex flex-column flex-sm-row gap-2 flex-grow-1 justify-content-sm-end">
                        <InputGroup className="w-100 shadow-sm rounded-xl overflow-hidden" style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-gray-50 border-0 text-muted"><Search size={16} /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search Questions..."
                                className="bg-gray-50 border-0 ps-0 shadow-none text-xs font-bold py-2.5"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Button
                            variant="primary"
                            className="d-flex align-items-center justify-content-center gap-2 shadow-lg shadow-blue-500/20 rounded-xl px-4 text-xs font-black uppercase tracking-wider"
                            onClick={handleAdd}
                        >
                            <Plus size={16} strokeWidth={3} /> Add New FAQ
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                <Card.Body className="p-2 p-md-4">
                    <Accordion
                        flush
                        alwaysOpen
                        activeKey={activeKeys}
                        onSelect={(k) => setActiveKeys(k)}
                        className="faq-accordion-custom"
                    >
                        {filtered.length > 0 ? filtered.map((faq) => (
                            <Accordion.Item
                                eventKey={faq._id.toString()}
                                key={faq._id}
                                className="border-0 bg-white rounded-2xl mb-3 overflow-hidden border border-gray-100"
                            >
                                <Accordion.Header className="faq-custom-header">
                                    <div className="d-flex justify-content-between w-100 me-3 align-items-center py-1">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className={`p-2 rounded-xl transition-all ${activeKeys.includes(faq._id.toString()) ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-gray-50 text-blue-600'}`}>
                                                <HelpCircle size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[13px] tracking-tight transition-all ${activeKeys.includes(faq._id.toString()) ? 'fw-black text-blue-600' : 'fw-bold text-gray-700'}`}>
                                                    {faq.question}
                                                </span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge bg="blue-100" className="text-blue-600 text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-none border-0">
                                                        {faq.category}
                                                    </Badge>
                                                    <span className="text-[9px] text-gray-300 font-medium">#{faq._id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Accordion.Header>
                                <Accordion.Body className="pt-0 pb-4 px-4">
                                    <div className="text-gray-500 text-[13px] font-medium leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-4">
                                        {faq.answer}
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="bg-gray-50 hover:bg-white hover:text-blue-600 border border-gray-100 rounded-lg text-[11px] font-black px-4 py-1.5 transition-all flex items-center gap-1.5"
                                            onClick={(e) => { e.stopPropagation(); handleEdit(faq); }}
                                        >
                                            <Edit size={14} /> Edit
                                        </Button>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="bg-red-50 hover:bg-white hover:text-red-600 border border-red-50 rounded-lg text-[11px] font-black px-4 py-1.5 transition-all text-red-500/80 flex items-center gap-1.5"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(faq._id); }}
                                        >
                                            <Trash2 size={14} /> Delete
                                        </Button>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        )) : (
                            <div className="py-12 text-center">
                                <Search size={40} className="text-gray-200 mb-3 mx-auto" strokeWidth={1} />
                                <p className="text-gray-400 font-bold small uppercase tracking-widest">No matching mechanics found.</p>
                                <p className="text-gray-300 text-[11px] italic mt-1">Try a different search term or category.</p>
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
