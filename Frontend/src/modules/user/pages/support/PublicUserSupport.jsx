import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headset, MessageCircle, HelpCircle, Phone, Mail, ArrowLeft, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { getPublicSettings } from '../../api/publicSettingApi';
import { fetchPublicFAQs } from '../../api/supportApi';
import { motion, AnimatePresence } from 'framer-motion';

const PublicUserSupport = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);
    const [loading, setLoading] = useState(true);
    const [faqs, setFaqs] = useState([]);
    const [settings, setSettings] = useState({
        supportPhone: '+91 911 110 5005',
        whatsappNumber: '919111105005',
        supportEmail: 'support@sathigro.com'
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [settingsData, faqsData] = await Promise.all([
                    getPublicSettings(),
                    fetchPublicFAQs()
                ]);
                setSettings({
                    supportPhone: settingsData.supportPhone || '+91 911 110 5005',
                    whatsappNumber: settingsData.whatsappNumber || '919111105005',
                    supportEmail: settingsData.supportEmail || 'support@sathigro.com'
                });
                setFaqs(faqsData || []);
            } catch (error) {
                console.error('Error loading public user support data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleChat = () => {
        window.open(`https://wa.me/${settings.whatsappNumber}?text=Hello SaathiGro Support, I need help with my shopping.`, "_blank");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-300 pb-20 md:p-10">
            <div className="max-w-4xl mx-auto px-4 md:px-0">
                {/* Header */}
                <div className="flex items-center gap-4 py-6 md:py-0 md:mb-10 border-b border-gray-100 dark:border-white/5 md:border-none">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-sm active:scale-95"
                    >
                        <ArrowLeft size={18} className="text-gray-700 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Customer Support</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">We're here to assist you 24/7</p>
                    </div>
                </div>

                {/* Banner Contact Card */}
                <div className="bg-gradient-to-br from-[#0c831f] to-[#085a15] rounded-3xl p-6 md:p-10 text-white shadow-xl shadow-green-600/10 mb-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08),transparent)] pointer-events-none"></div>
                    <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 group-hover:scale-105 transition-transform pointer-events-none">
                        <Headset size={150} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="text-left">
                            <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider mb-3 inline-block">Direct Support Line</span>
                            <h2 className="text-xl md:text-3xl font-black tracking-tight mb-2">Need Instant Help?</h2>
                            <p className="text-white/80 text-xs md:text-sm font-semibold max-w-md leading-relaxed">
                                Get in touch with our representative instantly via phone call or WhatsApp messaging.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                            <a
                                href={`tel:${settings.supportPhone}`}
                                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-3.5 px-6 rounded-xl transition-all border border-white/10 font-black text-[10px] uppercase tracking-widest active:scale-95 whitespace-nowrap text-white"
                            >
                                <Phone size={14} strokeWidth={3} /> Call Support
                            </a>
                            <button
                                onClick={handleChat}
                                className="flex items-center justify-center gap-2 bg-white text-[#0c831f] py-3.5 px-6 rounded-xl transition-all hover:bg-gray-100 font-black text-[10px] shadow-lg active:scale-95 uppercase tracking-widest whitespace-nowrap"
                            >
                                <MessageCircle size={14} strokeWidth={3} /> WhatsApp
                            </button>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-10 text-left">
                    <h3 className="text-[10px] md:text-xs font-black text-gray-400/80 mb-4 tracking-[0.2em] uppercase">Frequently Asked Questions</h3>
                    <div className="flex flex-col gap-3">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                                <Loader className="animate-spin text-[#0c831f] mb-3" size={24} />
                                <p className="text-gray-400 font-bold text-[9px] uppercase tracking-widest">Loading FAQs...</p>
                            </div>
                        ) : faqs.length > 0 ? (
                            faqs.map((faq) => (
                                <div
                                    key={faq._id}
                                    className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden transition-all hover:border-[#0c831f]/20"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === faq._id ? null : faq._id)}
                                        className="w-full py-4 px-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all outline-none"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${openFaq === faq._id ? 'bg-[#0c831f] text-white' : 'bg-slate-50 dark:bg-white/5 text-gray-400'}`}>
                                                <HelpCircle size={16} />
                                            </div>
                                            <span className={`text-xs md:text-sm font-black text-left tracking-tight ${openFaq === faq._id ? 'text-[#0c831f]' : 'text-gray-900 dark:text-gray-200'}`}>
                                                {faq.question}
                                            </span>
                                        </div>
                                        {openFaq === faq._id ? (
                                            <ChevronUp size={16} strokeWidth={3} className="text-[#0c831f]" />
                                        ) : (
                                            <ChevronDown size={16} strokeWidth={2.5} className="text-gray-300 dark:text-gray-600" />
                                        )}
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === faq._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="px-6 pb-5 pt-1 border-t border-gray-50 dark:border-white/5">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white dark:bg-[#121212] rounded-3xl border border-gray-100 dark:border-white/5">
                                <HelpCircle size={32} className="text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No FAQs found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Email Support Card */}
                <div className="bg-white dark:bg-[#121212] border border-dashed border-[#0c831f]/30 rounded-3xl p-6 md:p-8 text-center transition-all hover:border-[#0c831f]">
                    <div className="w-12 h-12 bg-green-50 dark:bg-[#0c831f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={20} className="text-[#0c831f]" />
                    </div>
                    <h4 className="text-sm md:text-lg font-black text-gray-900 dark:text-white mb-1 tracking-tight">Need further email assistance?</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 mb-5 font-bold uppercase tracking-wider">
                        Send us a request at {settings.supportEmail}
                    </p>
                    <a
                        href={`mailto:${settings.supportEmail}?subject=Customer Support Request`}
                        className="inline-flex items-center justify-center bg-[#0c831f] text-white py-3 px-8 rounded-xl font-black text-[10px] shadow-lg shadow-green-500/10 hover:bg-[#096a19] active:scale-95 uppercase tracking-widest transition-all"
                    >
                        Compose Email
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PublicUserSupport;
