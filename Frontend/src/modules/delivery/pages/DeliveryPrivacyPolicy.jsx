import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Loader, Bike } from 'lucide-react';
import { getPolicyContent } from '../../../common/utils/legalUtils';
import { motion } from 'framer-motion';

const DeliveryPrivacyPolicy = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [policy, setPolicy] = useState(null);

    useEffect(() => {
        const fetchPolicy = async () => {
            setLoading(true);
            try {
                const data = await getPolicyContent('delivery-privacy-policy', 'Delivery Partner');
                setPolicy(data);
            } catch (err) {
                console.error('Error fetching delivery privacy policy:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-300 pb-16">
            {/* Top Premium Hero Section */}
            <div className="bg-gradient-to-br from-gray-900 via-zinc-900 to-black text-white py-16 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none"></div>
                <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-left">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-xs font-black uppercase tracking-wider mb-6 transition-all active:scale-95 text-white"
                        >
                            <ChevronLeft size={14} /> Back
                        </button>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-white">
                            Rider <span className="text-[#CCFF00]">Privacy Policy</span>
                        </h1>
                        <p className="text-white/60 text-xs md:text-sm font-semibold max-w-lg leading-relaxed">
                            Learn how SaathiGro protects your location, personal data, and earnings information to ensure a transparent partnership.
                        </p>
                    </div>
                    <div className="hidden md:flex w-24 h-24 bg-white/5 rounded-3xl border border-white/10 items-center justify-center backdrop-blur-md">
                        <Bike size={48} className="text-[#CCFF00]" />
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto px-4 mt-8">
                <div className="bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-6 md:p-10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader size={40} className="animate-spin text-[#CCFF00] mb-4" />
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Loading document...</span>
                        </div>
                    ) : policy ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="prose dark:prose-invert max-w-none text-left"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 dark:border-white/5 pb-6 mb-8 gap-4">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
                                        {policy.title}
                                    </h2>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                                        Audience: Delivery Partner
                                    </p>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/5 self-start md:self-auto">
                                    Last Updated: {new Date(policy.updatedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                </div>
                            </div>

                            <div
                                className="legal-content text-gray-700 dark:text-gray-300 leading-relaxed space-y-5 text-sm md:text-base font-medium"
                                style={{ whiteSpace: 'pre-wrap' }}
                            >
                                {policy.content}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center py-20">
                            <Shield size={48} className="text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Policy Not Found</h3>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider max-w-xs mx-auto">
                                The requested policy could not be loaded. Please check again later.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Embedded styles for markdown content rendering */}
            <style>{`
                .legal-content h1 { font-size: 1.5rem; font-weight: 900; color: #CCFF00; margin-top: 2rem; margin-bottom: 1rem; }
                .legal-content h2 { font-size: 1.25rem; font-weight: 800; color: currentColor; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                .legal-content p { margin-bottom: 1rem; }
                .legal-content b, .legal-content strong { color: currentColor; font-weight: 700; opacity: 0.9; }
            `}</style>
        </div>
    );
};

export default DeliveryPrivacyPolicy;
