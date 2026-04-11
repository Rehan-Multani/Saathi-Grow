import React, { useState } from 'react';
import { Send, Mail, User, Store, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { contactVendor } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const ContactVendorModal = ({ show, onHide, vendor, onSubmit }) => {
    const { t } = useTranslation('admin_vendors');
    const { adminUser } = useAdminAuth();
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await contactVendor(adminUser.token, vendor._id, { subject, message });
            toast.success(t('form.edit_success'));
            if (onSubmit) onSubmit();
            setSubject('');
            setMessage('');
            onHide();
        } catch (error) {
            toast.error(error.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onHide} />
            
            <form onSubmit={handleSubmit} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-slate-100 flex flex-col">
                
                {/* Header Section */}
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-blue-600 group hover:rotate-6 transition-transform">
                            <Mail size={24} />
                        </div>
                        <div>
                             <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{t('form.contact.title')}</h3>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('form.contact.send')}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onHide} className="p-3 text-slate-300 hover:text-slate-900 hover:bg-white rounded-2xl transition-all border-none bg-transparent">
                        <X size={24} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-10 space-y-8 grow">
                    {/* Store Info */}
                    <div className="bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-100 flex items-center gap-4 shadow-inner">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                            {vendor?.logo ? <img src={vendor.logo} className="w-full h-full object-cover rounded-2xl" /> : <Store size={22} className="text-slate-200" />}
                        </div>
                        <div className="min-w-0">
                            <div className="text-[11px] font-bold text-slate-900 uppercase tracking-tight truncate leading-none mb-1.5">{vendor?.storeName}</div>
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none opacity-60">{t('details.profile.owner')}:</span>
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter leading-none italic">{vendor?.ownerName}</span>
                             </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 leading-none">{t('form.contact.subject')}</label>
                            <input
                                type="text"
                                placeholder="..."
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-[1.25rem] py-3.5 px-5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500/50 focus:bg-white transition-all shadow-inner"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 leading-none">{t('form.contact.message')}</label>
                            <textarea
                                rows={6}
                                placeholder="..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] py-4 px-5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500/50 focus:bg-white transition-all shadow-inner resize-none tracking-tight leading-relaxed italic"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="p-8 border-t border-slate-50 bg-slate-50/10 flex justify-end gap-4 shrink-0">
                    <button type="button" onClick={onHide} className="px-8 py-3.5 bg-white border border-slate-200 text-slate-500 rounded-[1.25rem] text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm">{t('form.cancel')}</button>
                    <button
                        type="submit"
                        disabled={sending}
                        className="px-10 py-3.5 bg-blue-600 text-white rounded-[1.25rem] text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-100 flex items-center gap-3 border-none"
                    >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {t('form.contact.send')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactVendorModal;
