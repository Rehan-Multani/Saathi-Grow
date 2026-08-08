import React, { useState, useEffect } from 'react';
import { 
    X, Shield, User, Smartphone, BadgeCheck, AlertCircle, Save, Loader2, Info, RefreshCw, FileText, ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DeliveryPartnerEditModal = ({ show, onHide, partner, onSave }) => {
    const { t } = useTranslation('admin_delivery');
    const [authStatus, setAuthStatus] = useState('Active');
    const [maxActiveOrders, setMaxActiveOrders] = useState(10);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (partner) {
            setAuthStatus(partner.authStatus || 'Active');
            setMaxActiveOrders(partner.maxActiveOrders || 10);
        }
    }, [partner]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({ ...partner, authStatus, maxActiveOrders: Number(maxActiveOrders) });
            onHide();
        } catch (error) {
            console.error("Update failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (!show || !partner) return null;

    const documents = [
        { label: 'Aadhar Card', url: partner.aadharImage },
        { label: 'Driving License', url: partner.licenseImage },
        { label: 'RC Card', url: partner.rcImage },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                onClick={onHide}
            />

            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{t('edit_partner.title')}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 italic">Account Security & Status</p>
                        </div>
                    </div>
                    <button 
                        onClick={onHide} 
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">
                    {/* Rider Preview */}
                    <div className="flex items-center gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 ring-4 ring-white shadow-inner">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1 overflow-hidden shadow-sm shrink-0">
                            {partner.profileImage ? (
                                <img src={partner.profileImage} className="w-full h-full object-cover rounded-xl" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200 font-bold text-xl">{partner.name.charAt(0)}</div>
                            )}
                        </div>
                        <div>
                            <span className="text-sm font-bold text-slate-900 tracking-tight uppercase leading-none">{partner.name}</span>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{partner.vehicleType}</span>
                                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                <span className="text-[10px] text-slate-400 font-bold tracking-tight">{partner.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Submitted Documents */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                            <FileText size={12} /> Submitted Documents
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {documents.map((doc) => (
                                <div key={doc.label} className="space-y-1.5">
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">{doc.label}</span>
                                    {doc.url ? (
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block relative group rounded-xl overflow-hidden border border-slate-200 hover:border-blue-400 transition-all bg-slate-50"
                                        >
                                            <img src={doc.url} alt={doc.label} className="w-full h-24 object-cover" />
                                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center">
                                                <ExternalLink size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="h-24 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[8px] font-bold text-slate-300 uppercase tracking-widest text-center px-1">
                                            Not uploaded
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status Toggle Area */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1">
                            {t('edit_partner.auth_status')}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { status: 'Active', icon: <BadgeCheck size={16} />, color: 'emerald' },
                                { status: 'Suspended', icon: <AlertCircle size={16} />, color: 'rose' },
                                { status: 'Unverified', icon: <RefreshCw size={16} />, color: 'amber' }
                            ].map((item) => (
                                <button
                                    key={item.status}
                                    type="button"
                                    onClick={() => setAuthStatus(item.status)}
                                    className={`py-4 px-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border flex flex-col items-center gap-2.5 ${
                                        authStatus === item.status
                                        ? `bg-${item.color}-600 text-white border-${item.color}-600 shadow-lg shadow-${item.color}-100`
                                        : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 shadow-sm'
                                    }`}
                                >
                                    <div className={authStatus === item.status ? 'text-white' : `text-${item.color}-500`}>
                                        {item.icon}
                                    </div>
                                    {t(`edit_partner.status_${item.status.toLowerCase()}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="maxActiveOrders" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                            Active Parcel Capacity
                        </label>
                        <input id="maxActiveOrders" type="number" min="1" max="50" required value={maxActiveOrders}
                            onChange={(event) => setMaxActiveOrders(event.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500" />
                        <p className="text-[10px] text-slate-400">Maximum parcels this rider may manage at the same time.</p>
                    </div>

                    <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
                        <Info className="text-blue-500 mt-0.5 shrink-0" size={16} />
                        <p className="text-[10px] text-blue-700 font-medium leading-relaxed italic">
                            Changing account status takes effect immediately. Suspended riders cannot login or receive assignments.
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-4 pt-6 border-t border-slate-50">
                        <button 
                            type="button" 
                            onClick={onHide} 
                            disabled={loading}
                            className="flex-1 py-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                        >
                            {t('edit_partner.discard', 'Cancel')}
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 border-none"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {t('edit_partner.update_btn')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeliveryPartnerEditModal;
