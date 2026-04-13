import React, { useState, useEffect } from 'react';
import { Shield, FileText, ExternalLink, ChevronLeft, ArrowRight, Loader2, BookOpen, ScrollText, Inbox } from 'lucide-react';
import { getPoliciesList, getPolicyContent } from '../../../common/utils/legalUtils';

const LegalSupport = ({ role = 'Staff' }) => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPolicy, setSelectedPolicy] = useState(null);

    useEffect(() => {
        const fetchList = async () => {
            const list = await getPoliciesList(role);
            setPolicies(list);
            setLoading(false);
        };
        fetchList();
    }, [role]);

    const handleView = async (slug) => {
        setLoading(true);
        const data = await getPolicyContent(slug, role);
        setSelectedPolicy(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 animate-in fade-in duration-500 font-black">
                <div className="w-16 h-16 bg-blue-50 rounded-[1.8rem] flex items-center justify-center mb-6 border border-blue-100 shadow-sm">
                    <Loader2 size={24} className="text-blue-600 animate-spin" />
                </div>
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic font-black">Syncing...</h3>
            </div>
        );
    }

    if (selectedPolicy) {
        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-500 text-left px-1 font-black">
                <button 
                    onClick={() => setSelectedPolicy(null)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 hover:border-blue-200 transition-all font-black italic shadow-sm leading-none"
                >
                    <ChevronLeft size={16} /> Back to List
                </button>

                <div className="bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden p-8 lg:p-14 text-left font-black">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 pb-10 border-b border-slate-50 text-left font-black">
                        <div className="space-y-4 text-left font-black italic font-black">
                             <div className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 italic w-fit leading-none font-black text-left">
                                <ScrollText size={14} /> Official Doc
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight font-black text-left">{selectedPolicy.title}</h2>
                        </div>
                        <div className="text-right shrink-0 font-black">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 leading-none italic font-black text-right">Updated</p>
                            <p className="text-[11px] font-black text-slate-950 uppercase leading-none italic font-mono font-black text-right">{new Date(selectedPolicy.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none text-left font-black font-black">
                        <div className="text-slate-700 font-bold leading-relaxed text-[13px] italic whitespace-pre-wrap font-black text-left font-black">
                            {selectedPolicy.content}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-left px-1 font-black">
            <div className="space-y-2 text-left font-black">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none font-black text-left font-black font-black">Rules & Protocols</h1>
                <div className="flex items-center gap-3 font-black text-left">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 italic leading-none font-black text-left font-black font-black">
                        <Shield size={12} className="shrink-0" /> Policy Hub
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5 font-black text-left font-black font-black">Store conduct and terms</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left font-black">
                {policies.length > 0 ? policies.map(p => (
                    <div 
                        key={p._id} 
                        className="group bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all cursor-pointer flex flex-col justify-between min-h-[280px] font-black font-black"
                        onClick={() => handleView(p.slug)}
                    >
                        <div className="text-left font-black italic font-black">
                            <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-slate-950 group-hover:text-white transition-all duration-500 shadow-inner font-black text-left">
                                <BookOpen size={30} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-4 leading-tight font-black text-left font-black">{p.title}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-2 italic font-black text-left font-black font-black">Official policy for {p.title.toLowerCase()} operations.</p>
                        </div>
                        
                        <div className="mt-10 flex items-center justify-between border-t border-slate-50 pt-8 text-left font-black">
                             <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] italic font-black text-left font-black font-black">Open Doc</span>
                             <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:translate-x-2 transition-transform border border-blue-100 shadow-sm font-black text-left">
                                <ArrowRight size={18} />
                             </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-32 text-center mx-auto text-left font-black">
                        <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 text-slate-200 shadow-inner font-black text-center">
                            <Inbox size={40} />
                        </div>
                        <h3 className="font-black text-[10px] text-slate-300 uppercase tracking-[0.4em] italic font-black text-center font-black font-black">No Docs</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LegalSupport;
