import React, { useEffect } from 'react';
import { X, Store, Award, Package, IndianRupee, TrendingUp, Calendar, User, Phone, Mail, ChevronRight, Activity, ArrowUpRight, BarChart3, Clock, Layout, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const VendorPerformanceModal = ({ show, onHide, vendor }) => {
    const { t } = useTranslation('admin_reports');
    
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

    if (!show || !vendor) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onHide}></div>
            
            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                            <Store size={28} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight leading-tight">{vendor.vendorName}</h3>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1 opacity-80">{t('vendor.modal.title')}</p>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-2.5 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-rose-500 border border-transparent hover:border-slate-100">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-10 max-h-[75vh] overflow-y-auto scrollbar-thin">
                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 gap-6 mb-10">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between shadow-sm transform hover:scale-[1.02] transition-transform">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Income</span>
                                <div className="p-2 bg-white text-emerald-600 rounded-lg shadow-sm border border-slate-100">
                                    <TrendingUp size={18} />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-800 tracking-tight">₹{vendor.totalSales?.toLocaleString()}</h4>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Life-time Earnings</div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between shadow-sm transform hover:scale-[1.02] transition-transform">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Products</span>
                                <div className="p-2 bg-white text-blue-600 rounded-lg shadow-sm border border-slate-100">
                                    <Package size={18} />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-800 tracking-tight">{vendor.productsListed || 0}</h4>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Items Listed</div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">{t('vendor.modal.close')} Info</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 opacity-70">Owner Name</p>
                                        <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{vendor.owner}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                        <Calendar size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 opacity-70">Joined Date</p>
                                        <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{vendor.memberSince}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                        <Phone size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 opacity-70">Contact Details</p>
                                        <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{vendor.contact}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                        <BarChart3 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 opacity-70">Total Success</p>
                                        <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{vendor.orderCount} Orders Done</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reliability Badge */}
                        <div className={`p-6 rounded-3xl border flex items-center gap-5 shadow-sm ${vendor.status === 'Active' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-amber-50/50 border-amber-100 text-amber-700'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${vendor.status === 'Active' ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-amber-600 text-white shadow-amber-100'}`}>
                                <Award size={24} />
                            </div>
                            <div className="min-w-0">
                                <h6 className="text-[11px] font-black uppercase tracking-widest mb-1 leading-none opacity-80">Vendor Reliability</h6>
                                <p className="text-xs font-bold leading-relaxed uppercase tracking-tight">Status is currently identified as {vendor.status} with verified records.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-8 bg-slate-50/30 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={onHide}
                        className="px-8 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-all shadow-sm"
                    >
                        {t('vendor.modal.close')}
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Update Numbers
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorPerformanceModal;
