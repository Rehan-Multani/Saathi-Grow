import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, Form, InputGroup, Spinner, Badge } from 'react-bootstrap';
import { Search, Plus, Edit, Trash2, HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';

import FAQModal from '../../components/support/FAQModal';
import { fetchFAQs, createFAQ, updateFAQ, deleteFAQ } from '../../api/faqApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

const FAQItem = ({ faq, isActive, onToggle, handleEdit, handleDelete, t }) => {
    return (
        <div className={`mb-3 overflow-hidden rounded-2xl border transition-all duration-500 ${isActive ? 'bg-blue-50/50 border-blue-200/50 shadow-md shadow-blue-500/5' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
            <button
                onClick={onToggle}
                className="w-100 d-flex justify-content-between align-items-center p-4 border-0 bg-transparent text-start"
            >
                <div className="d-flex align-items-center gap-3">
                    <div className={`p-2.5 rounded-xl transition-all duration-500 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-gray-50 text-blue-600'}`}>
                        <HelpCircle size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-[15px] tracking-tight leading-tight transition-all duration-300 ${isActive ? 'font-black text-blue-800' : 'font-bold text-gray-700'}`}>
                            {faq.question}
                        </span>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="bg-blue-100 text-blue-600 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-none border-0">
                                {faq.category}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">#{faq._id?.toString().slice(-6)}</span>
                        </div>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isActive ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={`p-1 rounded-full ${isActive ? 'text-blue-600' : 'text-gray-300'}`}
                >
                    <ChevronDown size={20} strokeWidth={2.5} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="px-4 pb-4">
                            <div className="bg-white/80 p-4 rounded-2xl border border-blue-100/30 text-gray-700 text-[14px] font-medium leading-relaxed mb-4 shadow-sm">
                                {faq.answer}
                            </div>
                            <div className="d-flex justify-content-end gap-2 px-1">
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="bg-gray-50 hover:bg-white hover:text-blue-600 border border-gray-100 rounded-xl text-[12px] font-black px-4 py-2 transition-all flex items-center gap-2 shadow-sm"
                                    onClick={(e) => { e.stopPropagation(); handleEdit(faq); }}
                                >
                                    <Edit size={14} /> {t('common.edit', { defaultValue: 'Edit' })}
                                </Button>
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="bg-red-50 hover:bg-white hover:text-red-600 border border-red-50 rounded-xl text-[12px] font-black px-4 py-2 transition-all text-red-500 flex items-center gap-2 shadow-sm"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(faq._id); }}
                                >
                                    <Trash2 size={14} /> {t('common.delete', { defaultValue: 'Delete' })}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQs = () => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const token = adminUser?.token;
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedFAQ, setSelectedFAQ] = useState(null);
    const [activeKey, setActiveKey] = useState(null);

    const loadFAQs = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await fetchFAQs(token);
            setFaqs(data);
        } catch (err) {
            showErrorAlert(t('common.error', { defaultValue: 'Error' }), err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFAQs();
    }, [token]);

    const filtered = useMemo(() => {
        const trimmed = searchTerm.trim().toLowerCase();
        if (!trimmed) return faqs;
        return faqs.filter(f =>
            f.question.toLowerCase().includes(trimmed) ||
            f.answer.toLowerCase().includes(trimmed) ||
            f.category?.toLowerCase().includes(trimmed)
        );
    }, [searchTerm, faqs]);

    const handleSave = async (faqData) => {
        try {
            if (selectedFAQ) {
                await updateFAQ(token, selectedFAQ._id, faqData);
            } else {
                await createFAQ(token, faqData);
            }
            setShowModal(false);
            loadFAQs();
            showSuccessAlert(t('common.success', { defaultValue: 'Success' }), t('support.faqs.save_success', { defaultValue: 'FAQ saved successfully' }));
        } catch (err) {
            showErrorAlert(t('common.error', { defaultValue: 'Error' }), err.message);
        }
    };

    const handleDelete = async (id) => {
        const result = await showDeleteConfirmation(
            t('support.faqs.delete_title', { defaultValue: 'Delete FAQ' }), 
            t('support.faqs.delete_msg', { defaultValue: 'Are you sure you want to delete this FAQ?' })
        );
        if (result.isConfirmed) {
            try {
                await deleteFAQ(token, id);
                loadFAQs();
                showSuccessAlert(t('common.deleted', { defaultValue: 'Deleted' }), t('support.faqs.delete_success', { defaultValue: 'FAQ deleted successfully' }));
            } catch (err) {
                showErrorAlert(t('common.error', { defaultValue: 'Error' }), err.message);
            }
        }
    };

    return (
        <div className="p-3 animate-page-entry">
            <Card className="border-0 shadow-sm mb-4 bg-white rounded-3xl overflow-hidden">
                <Card.Body className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 p-4">
                    <div>
                        <h5 className="mb-0 fw-black text-dark tracking-tight">{t('support.faqs.title', { defaultValue: 'Help Center / FAQs' })}</h5>
                        <p className="text-muted small mb-0 mt-1 italic opacity-75">{t('support.faqs.subtitle', { defaultValue: 'Common questions and platform mechanics.' })}</p>
                    </div>
                    <div className="d-flex flex-column flex-sm-row gap-2 flex-grow-1 justify-content-sm-end">
                        <InputGroup className="w-100 shadow-sm rounded-2xl overflow-hidden" style={{ maxWidth: '300px' }}>
                            <InputGroup.Text className="bg-gray-50 border-0 text-muted"><Search size={16} /></InputGroup.Text>
                            <Form.Control
                                placeholder={t('support.faqs.search_placeholder', { defaultValue: 'Search Questions...' })}
                                className="bg-gray-50 border-0 ps-0 shadow-none text-xs font-bold py-2.5"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Button
                            variant="primary"
                            className="d-flex align-items-center justify-content-center gap-2 shadow-lg shadow-blue-500/20 rounded-2xl px-4 text-xs font-black uppercase tracking-wider"
                            onClick={() => { setSelectedFAQ(null); setShowModal(true); }}
                        >
                            <Plus size={16} strokeWidth={3} /> {t('support.faqs.add_new', { defaultValue: 'Add New FAQ' })}
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden min-vh-50">
                <Card.Body className="p-2 p-md-4">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <div className="faqs-container">
                            {filtered.length > 0 ? filtered.map((faq) => (
                                <FAQItem
                                    key={faq._id}
                                    faq={faq}
                                    isActive={activeKey === faq._id}
                                    onToggle={() => setActiveKey(activeKey === faq._id ? null : faq._id)}
                                    handleEdit={setSelectedFAQ}
                                    handleDelete={handleDelete}
                                    t={t}
                                />
                            )) : (
                                <div className="py-12 text-center">
                                    <Search size={40} className="text-gray-100 mb-3 mx-auto" strokeWidth={1} />
                                    <p className="text-gray-400 font-bold small uppercase tracking-widest">{t('support.faqs.no_results', { defaultValue: 'No Results Found' })}</p>
                                    <p className="text-gray-300 text-[11px] italic mt-1">{t('support.faqs.try_different', { defaultValue: 'Try a different search term.' })}</p>
                                </div>
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>

            <FAQModal
                show={showModal || !!selectedFAQ}
                onHide={() => { setShowModal(false); setSelectedFAQ(null); }}
                faq={selectedFAQ}
                onSave={handleSave}
            />
        </div>
    );
};

export default FAQs;
