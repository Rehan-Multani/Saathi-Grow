import React, { useEffect } from 'react';
import { X, Mail, Phone, ShoppingBag, ShieldAlert, Wallet, Calendar, MapPin, CheckCircle, Ban, ArrowRight, User as UserIcon, Package, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CustomerDetailsModal = ({ show, onHide, customer, onSendMessage }) => {
    const { t } = useTranslation('admin_customers');

    useEffect(() => {
        if (show) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [show]);

    if (!show || !customer) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onHide}></div>

            {/* Modal Content */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 relative border border-slate-100 font-sans">
                
                {/* Close Button */}
                <button onClick={onHide} className="absolute top-4 right-4 p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all z-20">
                    <X size={18} strokeWidth={2.5} />
                </button>

                {/* Header */}
                <div className="p-6 border-b border-slate-50 bg-slate-50/20">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-3xl font-bold text-blue-600">
                                {customer.name?.charAt(0) || <UserIcon size={32} />}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-md ${customer.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                {customer.isActive ? <CheckCircle size={12} className="text-white" /> : <Ban size={12} className="text-white" />}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h5 className="text-xl font-bold text-slate-900 leading-none">{customer.name || t('all.anonymous')}</h5>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                                <Calendar size={12} /> 
                                <span>{t('modals.profile.joined')} {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-0.5">
                            <span className="text-lg font-bold text-slate-900">{customer.stats?.totalOrders || 0}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('modals.profile.stats.orders')}</span>
                        </div>
                        <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-50 flex flex-col items-center justify-center gap-0.5">
                            <span className="text-lg font-bold text-white">Γé╣{(customer.stats?.totalSpent || 0).toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">{t('modals.profile.stats.spend')}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-0.5">
                            <span className="text-lg font-bold text-slate-900">Γé╣{(customer.walletBalance || 0).toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('modals.profile.wallet_info')}</span>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                        <h6 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 ml-1">
                            <ShieldAlert size={14} /> {t('modals.profile.info')}
                        </h6>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500"><Mail size={16} /></div>
                                <div className="min-w-0">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase leading-none block mb-1">Email Address</span>
                                    <span className="text-xs font-semibold text-slate-700 truncate block">{customer.email || 'Not available'}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-500"><Phone size={16} /></div>
                                <div className="min-w-0">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase leading-none block mb-1">Phone Number</span>
                                    <span className="text-xs font-semibold text-slate-700 block">+91 {customer.phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="space-y-3">
                        <h6 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 ml-1">
                            <MapPin size={14} /> {t('modals.profile.addresses')}
                        </h6>
                        <div className="bg-slate-50/50 border border-slate-100 rounded-xl divide-y divide-slate-100">
                            {customer.addresses && customer.addresses.length > 0 ? (
                                customer.addresses.map((addr, idx) => (
                                    <div key={idx} className="p-4 flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                            <MapPin size={14} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-[10px] font-bold text-slate-800 uppercase">{addr.type || 'Address'}</span>
                                                {addr.isDefault && <span className="text-[8px] font-bold bg-slate-200 text-slate-600 px-1 py-0.5 rounded leading-none uppercase">Default</span>}
                                            </div>
                                            <p className="text-[11px] font-semibold text-slate-500 leading-normal">
                                                {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-[11px] font-semibold text-slate-400">{t('modals.profile.no_addresses')}</div>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="space-y-3">
                        <h6 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 ml-1">
                            <ShoppingBag size={14} /> {t('modals.profile.history')}
                        </h6>
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-sm">
                            {customer.recentOrders && customer.recentOrders.length > 0 ? (
                                customer.recentOrders.map((order) => (
                                    <div key={order._id} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                                                <Package size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-800">#{order.orderId}</span>
                                                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                                                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-slate-900 mb-0.5">Γé╣{order.totalAmount.toLocaleString()}</div>
                                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                                                order.status === 'delivered' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                                                order.status === 'cancelled' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center flex flex-col items-center gap-2">
                                    <ShoppingBag size={24} className="text-slate-200" />
                                    <span className="text-[11px] font-semibold text-slate-400">No orders yet</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => onSendMessage(customer, 'Email')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
                            <Mail size={14} /> Send Email
                        </button>
                        <button onClick={() => onSendMessage(customer, 'Message')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
                            <Send size={14} className="-rotate-12" /> Send Message
                        </button>
                    </div>
                    <button onClick={onHide} className="w-full sm:w-auto px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg active:scale-95">
                        Close
                    </button>
                </div>
                
                <style dangerouslySetInnerHTML={{ __html: `
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                `}} />
            </div>
        </div>
    );
};

export default CustomerDetailsModal;
