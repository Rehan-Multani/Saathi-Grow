import React, { useState, useEffect } from 'react';
import { Send, Mail, User, X, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../../modules/admin/context/AdminAuthContext';
import { useStaffAuth } from '../../../modules/staff/context/StaffAuthContext';
import { useStoreManagerAuth } from '../../../modules/store-manager/context/StoreManagerAuthContext';
import * as customerApi from '../../api/customerManagementApi';
import { toast } from 'react-toastify';

const SendMessageModal = ({ show, onHide, customer, type, onSubmit }) => {
    const { t } = useTranslation('admin_customers');
    const adminContext = useAdminAuth();
    const staffContext = useStaffAuth();
    const managerContext = useStoreManagerAuth();
    const user = adminContext?.adminUser || staffContext?.staffUser || managerContext?.managerUser || null;

    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (type === 'Email') {
                await customerApi.sendEmailToCustomer(user.token, customer._id, {
                    subject,
                    message
                });
                toast.success(t('all.alerts.sent_success', { type: 'Email' }));
            } else {
                await customerApi.sendMessageToCustomer(user.token, customer._id, {
                    title: title || 'Message from Admin',
                    body: message
                });
                toast.success(t('all.alerts.sent_success', { type: 'Message' }));
            }
            if (onSubmit) onSubmit();
            onHide();
            setMessage('');
            setSubject('');
            setTitle('');
        } catch (error) {
            toast.error(error.message || t('all.errors.update_failed'));
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[1070] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onHide}></div>

            {/* Modal Content */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 relative border border-slate-100 font-sans">
                
                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${type === 'Email' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'} border border-slate-100`}>
                            {type === 'Email' ? <Mail size={20} strokeWidth={2.5} /> : <Send size={20} strokeWidth={2.5} className="-rotate-12" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-tight">{t('modals.message.title', { type })}</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Contact Customer</p>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-all">
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Recipient */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-slate-400">
                            <User size={18} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 leading-none mb-1">{customer?.name}</div>
                            <div className="text-[10px] font-medium text-slate-400 truncate">{type === 'Email' ? customer?.email : customer?.phone}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {type === 'Email' ? (
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1">{t('modals.message.subject')}</label>
                                <input
                                    type="text"
                                    placeholder="Enter subject..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500/50 focus:bg-white transition-all text-sm font-medium"
                                    required
                                />
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 ml-1">Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500/50 focus:bg-white transition-all text-sm font-medium"
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 ml-1">{t('modals.message.body')}</label>
                            <textarea
                                rows={5}
                                placeholder={t('modals.message.placeholder')}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white transition-all text-sm font-medium ${type === 'Email' ? 'focus:border-blue-500/50' : 'focus:border-emerald-500/50'}`}
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md ${type === 'Email' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-50' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-50'}`}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {loading ? t('modals.message.sending') : t('modals.message.send')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SendMessageModal;
