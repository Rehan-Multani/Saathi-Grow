import React, { useEffect } from 'react';
import { X, Store, Award, Package, IndianRupee, TrendingUp, Calendar, User, Phone, Mail, ChevronRight, Activity, ArrowUpRight, BarChart3, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const VendorPerformanceModal = ({ show, onHide, vendor }) => {
    const { t } = useTranslation('admin_vendors');
    
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
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500" onClick={onHide}></div>
            
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-slate-100 relative">
                
                {/* Header with Background Pattern */}
                <div className="relative p-10 bg-slate-50/10 shrink-0 border-b border-slate-50">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none" />
                    <div className="relative flex justify-between items-start">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center text-blue-600 shadow-xl shadow-slate-200/50 group-hover:scale-105 transition-all duration-500 shrink-0">
                                <Store size={36} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-tight leading-none mb-3">{vendor.vendorName}</h1>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 border-none">Analysis Hub</span>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic leading-none opacity-60">ID: #{vendor.id?.slice(-8)}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onHide} className="p-3 text-slate-300 hover:text-slate-900 hover:bg-white rounded-2xl transition-all border-none bg-transparent">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Body - Scrollable Content */}
                <div className="p-10 overflow-y-auto scrollbar-thin grow">
                    {/* Performance Stat Clusters */}
                    <div className="grid grid-cols-2 gap-6 mb-12">
                        <div className="p-8 bg-gradient-to-br from-emerald-50/50 to-white rounded-[2rem] border border-emerald-110/30 flex flex-col justify-between group hover:border-emerald-200 transition-all shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest leading-none">Gross Sales</span>
                                <div className="p-3 bg-white text-emerald-500 rounded-2xl shadow-sm border border-emerald-50 group-hover:scale-110 transition-transform">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                            <div>
                                 <div className="text-3xl font-black text-slate-900 tracking-tighter leading-none italic font-sans">₹{vendor.totalSales?.toLocaleString()}</div>
                                 <p className="text-[10px] font-bold text-emerald-600/40 uppercase tracking-widest mt-2">Lifetime Revenue</p>
                            </div>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-blue-50/50 to-white rounded-[2rem] border border-blue-110/30 flex flex-col justify-between group hover:border-blue-200 transition-all shadow-sm">
                             <div className="flex justify-between items-start mb-6">
                                <span className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest leading-none">Catalog Size</span>
                                <div className="p-3 bg-white text-blue-500 rounded-2xl shadow-sm border border-blue-50 group-hover:scale-110 transition-transform">
                                    <Package size={24} />
                                </div>
                            </div>
                            <div>
                                 <div className="text-3xl font-black text-slate-900 tracking-tighter leading-none italic font-sans">{vendor.productsListed} <span className="text-sm font-bold text-slate-300 uppercase tracking-widest opacity-60">SKUs</span></div>
                                 <p className="text-[10px] font-bold text-blue-600/40 uppercase tracking-widest mt-2">Inventory Depth</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* Profile Analysis Section */}
                        <section className="relative">
                            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                                    <BarChart3 size={16} />
                                </div>
                                <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest leading-none">Entity Metadata</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {[
                                    { icon: <User size={16} />, label: 'Principal Associate', value: vendor.owner },
                                    { icon: <Calendar size={16} />, label: 'Registry Entry', value: vendor.memberSince },
                                    { icon: <Phone size={16} />, label: 'Contact Interface', value: vendor.contact },
                                    { icon: <Clock size={16} />, label: 'Order Frequency', value: `${vendor.orderCount} Closed Orders` }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:bg-white group-hover:border-blue-100/50 transition-all shadow-inner shrink-0">
                                            {item.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block leading-none mb-1.5 opacity-60 italic">{item.label}</span>
                                            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight block truncate opacity-90">{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Status Identity Card */}
                        <div className={`p-6 rounded-[2rem] border overflow-hidden relative group cursor-default transition-all duration-500 ${vendor.status === 'Active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-xl shadow-emerald-50/50' : 'bg-amber-50 border-amber-100 text-amber-700 shadow-xl shadow-amber-50/50'}`}>
                           <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
                           <div className="relative flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all shrink-0 ${vendor.status === 'Active' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-amber-500 text-white shadow-amber-200'}`}>
                                    <Award size={24} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1 leading-none italic">Partner Reliability</div>
                                    <div className="text-xs font-bold uppercase tracking-tight leading-relaxed">This partner is currently {vendor.status} with a verified integrity score.</div>
                                </div>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-10 border-t border-slate-50 bg-slate-50/20 flex justify-end gap-4 shrink-0">
                    <button 
                        onClick={onHide} 
                        className="px-10 py-4 bg-white border border-slate-200 text-slate-500 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        Close
                    </button>
                    <button 
                         onClick={() => window.location.reload()}
                         className="px-12 py-4 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-2xl shadow-blue-100 flex items-center gap-3 border-none"
                    >
                        <Activity size={18} /> Refresh Analysis
                    </button>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { width: 4px; border-radius: 10px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default VendorPerformanceModal;
