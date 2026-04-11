import React, { useEffect } from 'react';
import { X, FileText, Download, Printer, Eye, Loader2, CheckCircle2, ShieldCheck, FileSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TaxDocModal = ({ show, onHide, doc }) => {
    const { t } = useTranslation('admin_analytics');
    
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

    if (!show || !doc) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onHide}></div>
            
            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                            <FileSearch size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight leading-tight">Tax Document</h3>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1 opacity-80">Reference: {doc.id}</p>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-2.5 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-rose-500 border border-transparent hover:border-slate-100">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-10">
                    {/* Visual Doc Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 mb-10 flex flex-col items-center justify-center text-center shadow-inner">
                        <div className="w-20 h-20 bg-white rounded-[1.5rem] border border-slate-100 flex items-center justify-center mb-4 shadow-sm">
                            <FileText size={40} className="text-slate-300" />
                        </div>
                        <h6 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-1">{doc.id}_STATEMENT.PDF</h6>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-60">Created on {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-8 gap-x-10">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block opacity-70">Month/Year</span>
                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight block">{doc.period}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block opacity-70">Current State</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border inline-block ${doc.status === 'Filed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {doc.status}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block opacity-70">Taxable Money</span>
                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight block">{doc.taxable}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block opacity-70">GST Collected</span>
                            <span className="text-xs font-black text-blue-600 uppercase tracking-tight block">{doc.gst}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-8 bg-slate-50/30 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={onHide}
                        className="px-8 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-all font-sans"
                    >
                        Close View
                    </button>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center gap-2"
                    >
                        <Download size={16} />
                        Get PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaxDocModal;
