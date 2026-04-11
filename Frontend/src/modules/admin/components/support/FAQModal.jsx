import React, { useState, useEffect } from 'react';
import { Save, X, HelpCircle, Layout, Tag, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FAQModal = ({ show, onHide, faq, onSave }) => {
    const { t } = useTranslation('admin_support');
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

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onHide}></div>

            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
                            <HelpCircle size={20} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                            {faq ? t('faqs.modal.edit_title') : t('faqs.modal.add_title')}
                        </h3>
                    </div>
                    <button onClick={onHide} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-rose-500 border border-transparent hover:border-slate-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="font-sans">
                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight ml-1 flex items-center gap-2">
                                <Tag size={12} className="text-blue-600" />
                                {t('faqs.modal.question')}
                            </label>
                            <input
                                type="text"
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                required
                                placeholder="Enter question..."
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-bold text-slate-700 shadow-sm uppercase tracking-tight"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight ml-1 flex items-center gap-2">
                                <Layout size={12} className="text-blue-600" />
                                {t('faqs.modal.answer')}
                            </label>
                            <textarea
                                rows={4}
                                value={formData.answer}
                                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                required
                                placeholder="Enter answer..."
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-bold text-slate-700 shadow-sm resize-none uppercase tracking-tight"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight ml-1 flex items-center gap-2">
                                    <Tag size={12} className="text-blue-600" />
                                    {t('faqs.modal.category')}
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm cursor-pointer uppercase appearance-none"
                                >
                                    <option value="General">General</option>
                                    <option value="Orders">Orders</option>
                                    <option value="Shipping">Shipping</option>
                                    <option value="Account">Account</option>
                                    <option value="Payment">Payment</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight ml-1 flex items-center gap-2">
                                    <Eye size={12} className="text-blue-600" />
                                    {t('faqs.modal.status')}
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-xs font-bold text-slate-700 shadow-sm cursor-pointer uppercase appearance-none"
                                >
                                    <option value="Published">{t('faqs.modal.active')}</option>
                                    <option value="Draft">{t('faqs.modal.inactive')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onHide}
                            className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight hover:text-rose-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-[0.98] flex items-center gap-2"
                        >
                            <Save size={16} />
                            {faq ? t('faqs.modal.update') : t('faqs.modal.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FAQModal;
