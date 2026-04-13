import React, { useState, useEffect } from 'react';
import { Shield, FileText, ExternalLink, ArrowLeft, Loader2, Info } from 'lucide-react';
import { getPoliciesList, getPolicyContent } from '../../../common/utils/legalUtils';

const LegalPolicies = () => {
    const role = 'Store Manager';
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPolicy, setSelectedPolicy] = useState(null);

    useEffect(() => {
        const fetchList = async () => {
            try {
                setLoading(true);
                const list = await getPoliciesList(role);
                setPolicies(Array.isArray(list) ? list : []);
            } catch (error) {
                console.error("Failed to load policies", error);
            } finally {
                setLoading(false);
            }
        };
        fetchList();
    }, [role]);

    const handleView = async (slug) => {
        try {
            setLoading(true);
            const data = await getPolicyContent(slug, role);
            setSelectedPolicy(data);
        } catch (error) {
            console.error("Failed to load policy content", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !selectedPolicy) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] animate-pulse">
                <Loader2 className="animate-spin text-blue-600 mb-6" size={48} />
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Loading Policies...</p>
            </div>
        );
    }

    if (selectedPolicy) {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <button 
                    onClick={() => setSelectedPolicy(null)}
                    className="flex items-center gap-2.5 text-slate-500 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-all mb-4 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:shadow-lg active:scale-95"
                >
                    <ArrowLeft size={14} /> Back to Hub
                </button>
                
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                    <div className="p-10 lg:p-14 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{selectedPolicy.title}</h2>
                            <div className="flex items-center gap-3">
                                <span className="bg-blue-600 w-8 h-1 rounded-full"></span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Updated: {new Date(selectedPolicy.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
                            Manager Access Only
                        </div>
                    </div>
                    <div className="p-10 lg:p-20 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div className="text-slate-600 leading-relaxed text-base font-medium whitespace-pre-wrap selection:bg-blue-100 prose prose-slate">
                            {selectedPolicy.content}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Legal & Policies</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Important documents and rules for Store Management.</p>
                </div>
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm">
                    <Shield size={16} className="text-blue-600" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pt-0.5">Verified Documents</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {policies.length > 0 ? policies.map(p => (
                    <div 
                        key={p._id} 
                        onClick={() => handleView(p.slug)}
                        className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-500 transition-all cursor-pointer group active:scale-95 flex flex-col items-start text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-1 bg-blue-600/5 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <Info size={14} className="text-blue-300" />
                        </div>
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                            <FileText size={28} className="text-slate-400 group-hover:text-blue-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3 group-hover:text-blue-600 transition-colors">{p.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium mb-10">
                            Review our official {p.title.toLowerCase()} and usage guidelines for store staff.
                        </p>
                        <div className="mt-auto flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] pt-4 border-t border-slate-50 w-full group-hover:border-blue-100 transition-colors">
                            View Document <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                        <Shield size={64} className="text-slate-200 mb-6" />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">No Documents Assigned</p>
                    </div>
                )}
            </div>

            {/* Support section */}
            <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-600/20 transition-all duration-1000"></div>
                
                <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
                        <Shield size={36} />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-3 italic">Compliance Center</h4>
                        <p className="text-slate-400 text-base leading-relaxed font-medium max-w-3xl">
                            All managers must adhere to these policies to maintain operational standards. Failure to follow guidelines may result in restricted access or administrative action.
                        </p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
};

export default LegalPolicies;
