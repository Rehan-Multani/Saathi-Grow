import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, HelpCircle, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { showDeleteConfirmation, showSuccessAlert, showErrorAlert } from '../../../../common/utils/alertUtils';

import FAQModal from '../../components/support/FAQModal';
import { fetchFAQs, createFAQ, updateFAQ, deleteFAQ } from '../../api/faqApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

const FAQItem = ({ faq, isActive, onToggle, handleEdit, handleDelete, t }) => {
    return (
        <div className={`mb-4 overflow-hidden rounded-2xl border transition-all duration-300 ${isActive ? 'bg-blue-50/20 border-blue-200/50 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}>
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center p-5 text-left outline-none"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center shrink-0 border ${isActive ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        <HelpCircle size={18} />
                    </div>
                    <div className="flex flex-col min-w-0 pr-4">
                        <span className={`text-xs tracking-tight transition-all duration-300 uppercase ${isActive ? 'font-bold text-slate-900' : 'font-bold text-slate-600'}`}>
                            {faq.question}
                        </span>
                        <div className="flex items-center gap-3 mt-1.5 font-bold uppercase text-[9px]">
                            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                                {faq.category}
                            </span>
                        </div>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isActive ? 180 : 0 }}
                    className={`p-1 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-300'}`}
                >
                    <ChevronDown size={18} strokeWidth={3} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-5 pb-5 pt-0">
                            <div className="bg-white border border-slate-100 p-4 rounded-xl text-slate-500 text-[11px] font-bold leading-relaxed mb-4 uppercase opacity-90">
                                {faq.answer}
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEdit(faq); }}
                                    className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-tight px-3 py-1.5 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                                >
                                    <Edit size={14} /> {t('common.edit', { ns: 'common' })}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(faq._id); }}
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-bold uppercase tracking-tight px-3 py-1.5 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> {t('common.delete', { ns: 'common' })}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQs = () => {
    const { t } = useTranslation('admin_support');
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
            showErrorAlert(t('common.error', { ns: 'common' }), err.message);
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
            setSelectedFAQ(null);
            loadFAQs();
            showSuccessAlert(t('common.success', { ns: 'common' }), t('faqs.save_success'));
        } catch (err) {
            showErrorAlert(t('common.error', { ns: 'common' }), err.message);
        }
    };

    const handleDelete = async (id) => {
        const result = await showDeleteConfirmation(
            t('faqs.title'), 
            t('faqs.delete_confirm')
        );
        if (result.isConfirmed) {
            try {
                await deleteFAQ(token, id);
                loadFAQs();
                showSuccessAlert(t('common.deleted', { ns: 'common' }), t('faqs.delete_success'));
            } catch (err) {
                showErrorAlert(t('common.error', { ns: 'common' }), err.message);
            }
        }
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/30 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">{t('faqs.title')}</h1>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={t('faqs.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-xs font-bold text-slate-700 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => { setSelectedFAQ(null); setShowModal(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all shadow-blue-100 active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} /> {t('faqs.add_new')}
                    </button>
                    <button
                        onClick={loadFAQs}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-all shadow-sm active:scale-90"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Main Content List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        {filtered.length > 0 ? (
                            <div className="space-y-3">
                                {filtered.map((faq) => (
                                    <FAQItem
                                        key={faq._id}
                                        faq={faq}
                                        isActive={activeKey === faq._id}
                                        onToggle={() => setActiveKey(activeKey === faq._id ? null : faq._id)}
                                        handleEdit={(f) => { setSelectedFAQ(f); setShowModal(true); }}
                                        handleDelete={handleDelete}
                                        t={t}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <AlertCircle size={32} className="text-slate-200" />
                                </div>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t('faqs.no_matching')}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <FAQModal
                show={showModal}
                onHide={() => { setShowModal(false); setSelectedFAQ(null); }}
                faq={selectedFAQ}
                onSave={handleSave}
            />
        </div>
    );
};

export default FAQs;
