import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MapPin, Phone, Store, Mail, Globe, Hash, Edit, Shield, Info, CheckCircle2 } from 'lucide-react';

const BranchDetailsModal = ({ show, onHide, branch, onEdit }) => {
    const { t } = useTranslation('admin_locations');

    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [show]);

    if (!show || !branch) return null;

    const fullAddress = branch.address ?
        `${branch.address.street || ''}, ${branch.address.city || ''}, ${branch.address.state || ''} ${branch.address.zipCode || ''}` :
        '---';

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onHide}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col animate-in zoom-in duration-300 font-sans border border-slate-200">

                {/* Header */}
                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-blue-100">
                            {branch.logo ? (
                                <img src={branch.logo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Store size={22} />
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight italic">{branch.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono italic">ID: {branch.code}</span>
                                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${branch.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {branch.isActive ? t('status.active') : t('status.inactive')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onHide}
                        className="p-2.5 rounded-xl bg-white text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100 active:scale-95"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] scrollbar-thin text-start bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 ring-4 ring-white shadow-inner">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <MapPin size={10} className="text-blue-500" /> {t('form.address')}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 leading-relaxed italic pr-4">{fullAddress}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <Phone size={10} className="text-blue-500" /> {t('form.phone')}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 font-mono italic">{branch.phone}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 md:border-l md:border-slate-200 md:pl-8">
                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <Mail size={10} className="text-blue-500" /> {t('form.email')}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 italic lowercase truncate">{branch.email || '---'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <Hash size={10} className="text-blue-500" /> {t('form.branch_code')}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 font-mono tracking-widest uppercase italic">{branch.code}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden group shadow-2xl">
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-2">
                                <Shield size={16} className="text-blue-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{t('form.operational_status')}</span>
                            </div>
                            <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={18} className="text-emerald-400" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                    {branch.isActive ? t('form.status_description') : 'This location is currently decommissioned and will not appear in node searches.'}
                                </p>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/20 transition-all duration-700" />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/30">
                    <button
                        onClick={onHide}
                        className="flex-1 py-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 rounded-2xl transition-all active:scale-95"
                    >
                        {t('form.discard')}
                    </button>
                    <button
                        className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 border-none active:scale-95"
                        onClick={() => {
                            onHide();
                            onEdit(branch);
                        }}
                    >
                        <Edit size={16} /> {t('form.submit_edit')}
                    </button>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { height: 4px; width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default BranchDetailsModal;
