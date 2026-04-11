import React, { useState } from 'react';
import { Save, X, ArrowUpRight, CheckCircle, Package, User, Image as ImageIcon, MessageSquare, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as complaintApi from '../../api/complaintApi';
import { toast } from 'react-toastify';

const TicketEditModal = ({ show, onHide, ticket, onEscalate, onRefresh }) => {
    const { t } = useTranslation('admin_support');
    const { adminUser } = useAdminAuth();
    const token = adminUser?.token;

    const [adminNotes, setAdminNotes] = useState('');
    const [processRefund, setProcessRefund] = useState(ticket?.storeRecommendedRefund || false);
    const [refundAmount, setRefundAmount] = useState(ticket?.order?.totalAmount || 0);

    const [isProcessing, setIsProcessing] = useState(false);

    if (!show || !ticket) return null;

    const handleAction = async (action) => {
        try {
            setIsProcessing(true);
            if (action === 'ESCALATE') {
                await onEscalate(ticket.ticketId, adminNotes);
            } else if (action === 'CLOSE') {
                const res = await complaintApi.closeTicket(token, ticket.ticketId, processRefund, refundAmount);
                if (res.success) {
                    toast.success(t('tickets.modal.update_success'));
                    onRefresh();
                }
            }
            onHide();
        } catch (error) {
            toast.error(t('common.error', { ns: 'common' }));
        } finally {
            setIsProcessing(false);
            setAdminNotes('');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onHide}></div>

            <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{t('tickets.modal.title')}</h3>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight mt-0.5">#{ticket.ticketId}</p>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-rose-500 border border-transparent hover:border-slate-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto scrollbar-thin">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Info Section */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* Issue Details */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-2">
                                    <AlertCircle size={14} className="text-blue-600" />
                                    {t('tickets.modal.info_section')}
                                </label>
                                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                                    <h6 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight mb-2 border-b border-slate-200 pb-1.5">{ticket.category}</h6>
                                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase">{ticket.description}</p>
                                </div>

                                {ticket.attachments && ticket.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {ticket.attachments.map((img, idx) => (
                                            <a key={idx} href={img} target="_blank" rel="noreferrer" className="group">
                                                <img
                                                    src={img}
                                                    alt="Evidence"
                                                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm group-hover:border-blue-500 transition-all shadow-sm"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Order & Customer */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-2">
                                    <Package size={14} className="text-blue-600" />
                                    {t('tickets.modal.order_section')}
                                </label>
                                <div className="grid grid-cols-2 gap-3 font-bold">
                                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl border border-slate-200 text-blue-600">
                                            <Package size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[10px] text-slate-900 uppercase tracking-tight truncate">#{ticket.order?.orderId?.slice(-8).toUpperCase()}</div>
                                            <div className="text-[9px] text-slate-400 uppercase">₹{ticket.order?.totalAmount}</div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl border border-slate-200 text-blue-600">
                                            <User size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[10px] text-slate-900 uppercase tracking-tight truncate">{ticket.user?.name}</div>
                                            <div className="text-[9px] text-slate-400 uppercase">{ticket.user?.phone}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Conversation */}
                            {ticket.resolutionThread && ticket.resolutionThread.length > 0 && (
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{t('tickets.modal.user_comment')}</label>
                                    <div className="space-y-3">
                                        {ticket.resolutionThread.map((msg, idx) => (
                                            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tight bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{msg.role || msg.senderModel}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{msg.senderName}</span>
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase">{msg.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Section */}
                        <div className="lg:col-span-5 border-l border-slate-100 pl-4 lg:pl-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{t('tickets.modal.admin_can_resolve')}</label>
                                    <textarea
                                        rows={4}
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder={t('tickets.modal.resolution_placeholder')}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-bold text-slate-700 shadow-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {ticket.status === 'OPEN' && (
                                        <button
                                            disabled={isProcessing}
                                            onClick={() => handleAction('ESCALATE')}
                                            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-tight flex items-center justify-center gap-2 shadow-sm shadow-amber-100 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            <ArrowUpRight size={16} /> {t('tickets.modal.escalate_btn')}
                                        </button>
                                    )}

                                    {['STORE_RESPONDED', 'RESOLVED', 'OVERDUE', 'OPEN'].includes(ticket.status) && (
                                        <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 shadow-sm space-y-4">
                                            {ticket.order && !ticket.refundProcessed && (
                                                <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-blue-100">
                                                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                                                        <input
                                                            type="checkbox"
                                                            checked={processRefund}
                                                            onChange={(e) => setProcessRefund(e.target.checked)}
                                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-[10px] text-slate-700 uppercase tracking-tight font-bold">Process Refund</span>
                                                    </label>
                                                    
                                                    {processRefund && (
                                                        <input
                                                            type="number"
                                                            value={refundAmount}
                                                            onChange={(e) => setRefundAmount(e.target.value)}
                                                            className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg outline-none text-[10px] font-bold text-blue-600 text-right"
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            <button
                                                disabled={isProcessing}
                                                onClick={() => handleAction('CLOSE')}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <CheckCircle size={18} /> {t('tickets.modal.resolve_btn')}
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        onClick={onHide}
                                        className="w-full py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight hover:text-rose-500"
                                    >
                                        {t('tickets.modal.close')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketEditModal;
