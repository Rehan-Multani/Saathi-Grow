import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Mail, Phone, MapPin, Store, Package, ShieldCheck, Globe, Info, User, ExternalLink, Activity, ArrowUpRight } from 'lucide-react';

const VendorDetailsModal = ({ show, onHide, vendor }) => {
    const { t } = useTranslation('admin_vendors');
    const navigate = useNavigate();

    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        }
    }, [show]);

    if (!show || !vendor) return null;

    const handleViewProducts = () => {
        onHide();
        navigate('/admin/vendors/products');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-inner" onClick={onHide} />

            <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300 border border-slate-100">

                {/* Header Section */}
                <div className="flex justify-between items-center p-8 border-b border-slate-50 bg-slate-50/20 shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden shrink-0 group hover:border-blue-300 hover:scale-105 transition-all duration-500">
                            {vendor.logo ? (
                                <img src={vendor.logo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Store size={32} className="text-slate-200" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 leading-none uppercase tracking-tight">{vendor.storeName}</h3>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">
                                <span>Vendor ID: #{vendor._id.slice(-8)}</span>
                                <span className={`flex items-center gap-1 ${vendor.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                     • {vendor.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-3 text-slate-300 hover:text-slate-900 hover:bg-white rounded-2xl transition-all border-none bg-transparent"><X size={24} /></button>
                </div>

                {/* Body Content */}
                <div className="p-10 overflow-y-auto scrollbar-thin space-y-10 grow">
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-5">
                        <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50 space-y-2 group hover:bg-blue-100/50 transition-colors">
                            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest opacity-60">Products</div>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{vendor.products || 0} <span className="text-xs font-bold text-slate-400 opacity-60">Items</span></div>
                        </div>
                        <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-110/50 space-y-2 group hover:bg-emerald-100/50 transition-colors">
                            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest opacity-60">Earnings</div>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight leading-none">₹0 <span className="text-xs font-bold text-slate-400 opacity-60">INR</span></div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <Activity size={14} className="text-blue-500" /> Business Details
                            </h4>
                            <div className="space-y-6">
                                <div className="flex items-center gap-5 group">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-blue-500 group-hover:border-blue-100 transition-all shadow-inner shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none mb-1.5 opacity-60">Email Address</span>
                                        <span className="text-xs font-bold text-slate-800 lowercase tracking-tight block truncate opacity-90">{vendor.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 group">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-blue-500 group-hover:border-blue-100 transition-all shadow-inner shrink-0">
                                        <Phone size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none mb-1.5 opacity-60">Phone Number</span>
                                        <span className="text-xs font-bold text-slate-800 tracking-tight block truncate opacity-90">{vendor.phone}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-5 group">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-blue-500 group-hover:border-blue-100 transition-all shadow-inner shrink-0 mt-1">
                                        <MapPin size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none mb-2 opacity-60">Shop Location</span>
                                        <span className="text-xs font-bold text-slate-800 tracking-tight block opacity-90 leading-relaxed uppercase">{vendor.address?.street || vendor.address}{vendor.address?.city ? `, ${vendor.address.city}` : ''}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {vendor.description && (
                            <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 italic">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 leading-none">About Company</h4>
                                <p className="text-[11px] text-slate-600 leading-relaxed font-bold opacity-80 tracking-tight">"{vendor.description}"</p>
                            </div>
                        )}

                        <div className="bg-slate-900 rounded-[2rem] p-6 flex items-center justify-between group overflow-hidden relative shadow-xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
                            <div className="flex items-center gap-5 relative">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-bold text-white border border-white/10 shadow-lg shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all uppercase">
                                    {vendor.ownerName?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 leading-none">Store Owner</div>
                                    <div className="font-bold text-sm text-white uppercase tracking-tight truncate opacity-90">{vendor.ownerName}</div>
                                </div>
                            </div>
                            <div className="px-4 py-1.5 bg-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest border border-white/5 whitespace-nowrap text-white/80 scale-95 group-hover:scale-100 transition-all shadow-inner">Partner</div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="p-8 border-t border-slate-50 bg-slate-50/10 flex justify-end gap-4 shrink-0">
                    <button onClick={onHide} className="px-8 py-3.5 bg-white border border-slate-200 text-slate-500 rounded-[1.25rem] text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm">Close</button>
                    <button
                        onClick={handleViewProducts}
                        className="px-10 py-3.5 bg-slate-900 text-white rounded-[1.25rem] text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center gap-3 border-none"
                    >
                        View Products
                        <ArrowUpRight size={18} />
                    </button>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default VendorDetailsModal;
