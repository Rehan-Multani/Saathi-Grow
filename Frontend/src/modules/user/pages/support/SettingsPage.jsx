import React, { useState, useEffect } from 'react';
import { Shield, ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPoliciesList } from '../../../../common/utils/legalUtils';

const SettingsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [policies, setPolicies] = useState([]);
    const [loadingPolicies, setLoadingPolicies] = useState(true);

    useEffect(() => {
        const fetchPolicies = async () => {
            const data = await getPoliciesList('User');
            setPolicies(data);
            setLoadingPolicies(false);
        };
        fetchPolicies();
    }, []);

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-black transition-colors duration-300 pb-24 md:p-8">
            <div className="max-w-2xl md:max-w-3xl mx-auto">
                {/* Header - Minimalist & Professional */}
                <div className="flex items-center gap-3 px-4 py-6 md:px-0 md:py-0 md:mb-8 bg-white md:bg-transparent dark:bg-black sticky top-0 md:relative z-40">
                    <button
                        onClick={() => navigate(location.state?.from || '/', { state: { openMenu: true } })}
                        className="p-1.5 bg-gray-50 dark:bg-white/5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-[8px] md:text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">Legal Documents</h1>
                        <p className="hidden md:block text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Policies & Compliance</p>
                    </div>
                </div>

                {/* Legal Section */}
                <div className="px-4 md:px-0 mt-0 md:mt-0">
                    <div className="grid grid-cols-1 gap-2.5">
                        {loadingPolicies ? (
                            <div className="p-12 text-center bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-white/5">
                                <div className="w-6 h-6 border-2 border-[#0c831f] border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        ) : policies.length > 0 ? (
                            policies.map((p) => (
                                <button
                                    key={p._id}
                                    onClick={() => navigate(`/legal/${p.slug}`)}
                                    className="w-full text-left group"
                                >
                                    <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-xl md:rounded-2xl p-2.5 md:p-3.5 flex items-center justify-between shadow-sm hover:border-[#0c831f]/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 dark:bg-[#0c831f]/10 border border-green-100 dark:border-white/5 transition-transform group-hover:scale-105">
                                                <Shield size={14} className="text-[#0c831f]" />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] md:text-[12px] font-black text-gray-800 dark:text-gray-100 tracking-tight uppercase leading-none">{p.title}</h4>
                                                <p className="text-[8px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">Legal Policy</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={12} className="text-gray-300 group-hover:text-[#0c831f] transition-all" />
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-10 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-white/50 rounded-2xl border border-dashed border-gray-200">
                                No legal documents listed
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
