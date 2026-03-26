import React, { useState, useEffect } from 'react';
import { Headset, MessageCircle, HelpCircle, Phone, Mail, ArrowLeft, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPublicSettings } from '../../api/publicSettingApi';
import { fetchPublicFAQs } from '../../api/supportApi';

const HelpPage = () => {
    const navigate = useNavigate();
    const routerLocation = useLocation();
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
                console.error('Error loading help center data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleChat = () => {
        window.open(`https://wa.me/${settings.whatsappNumber}?text=Hello sathiGro Support, I need help with my order.`, "_blank");
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:from-[#141414] dark:to-[#141414] md:bg-white md:bg-none dark:bg-none dark:bg-black md:dark:bg-black transition-colors duration-300 pb-20 md:p-10">
            <div className="max-w-2xl md:max-w-5xl mx-auto md:px-0">
                {/* Header - Sticky & Blurred */}
                <div className="flex items-center gap-3 px-4 py-8 md:px-0 md:py-0 md:mb-12 border-b border-gray-100 dark:border-white/5 md:border-none bg-white/80 dark:bg-black/80 backdrop-blur-lg sticky top-0 md:relative z-50 transition-colors">
                    <button
                        onClick={() => {
                            const from = routerLocation.state?.from || '/';
                            const noMenuPages = ['/settings', '/profile'];
                            const shouldOpenMenu = !noMenuPages.includes(from);
                            navigate(from, { state: { openMenu: shouldOpenMenu } });
                        }}
                        className="p-2 bg-gray-50 dark:bg-white/5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400 md:w-6 md:h-6" />
                    </button>
                    <div>
                        <h1 className="text-[18px] md:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Help & Support</h1>
                        <p className="hidden md:block text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">We're here to help you 24/7</p>
                    </div>
                </div>

                {/* Main Contact Section - Premium Banner */}
                <div className="mx-6 md:mx-0 mt-8 mb-6 md:mb-16 bg-[#0c831f] rounded-[24px] md:rounded-[40px] p-6 md:p-12 text-white shadow-xl shadow-green-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 md:p-20 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Headset size={120} className="hidden md:block" />
                        <Headset size={80} className="md:hidden" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-4 md:gap-6 text-left">
                            <div className="w-12 h-12 md:w-20 md:h-20 bg-white/20 rounded-2xl md:rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                                <Headset size={24} className="md:w-10 md:h-10" />
                            </div>
                            <div>
                                <h2 className="text-[16px] md:text-3xl font-black leading-tight tracking-tight uppercase md:normal-case">Customer Success</h2>
                                <p className="text-[10px] md:text-sm opacity-90 font-bold uppercase tracking-[0.2em] mt-1">Experience smooth shopping 24/7</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:gap-6 md:w-auto w-full">
                            <a
                                href={`tel:${settings.supportPhone}`}
                                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-3 md:py-4 md:px-8 rounded-xl md:rounded-2xl transition-all border border-white/20 font-black text-[10px] md:text-xs active:scale-95 uppercase tracking-widest whitespace-nowrap"
                            >
                                <Phone size={16} strokeWidth={3} /> Call Us
                            </a>
                            <button
                                onClick={handleChat}
                                className="flex items-center justify-center gap-2 bg-white text-[#0c831f] py-3 md:py-4 md:px-8 rounded-xl md:rounded-2xl transition-all hover:brightness-110 font-black text-[10px] md:text-xs shadow-xl active:scale-95 uppercase tracking-widest whitespace-nowrap"
                            >
                                <MessageCircle size={16} strokeWidth={3} /> Live Chat
                            </button>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="px-0 md:px-0 mb-12">
                    <h3 className="!text-[10px] md:text-[11px] font-black text-gray-400/80 mb-2 md:mb-8 px-6 md:px-0 tracking-[0.2em] uppercase">Answers to common questions</h3>
                    <div className="flex flex-col gap-0 md:gap-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white md:rounded-[28px] border border-gray-100 dark:bg-black dark:border-white/10 shadow-sm">
                                <Loader className="animate-spin text-[#0c831f] mb-4" size={32} />
                                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Loading FAQs...</p>
                            </div>
                        ) : faqs.length > 0 ? faqs.map((faq) => (
                            <div
                                key={faq._id}
                                className="group bg-white md:bg-white dark:bg-[#121212] dark:md:bg-[#141414] md:border md:border-gray-100 dark:md:border-white/10 md:rounded-[28px] md:shadow-sm overflow-hidden md:border-b-0 transition-all md:hover:shadow-md md:hover:border-[#0c831f]/20"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === faq._id ? null : faq._id)}
                                    className="w-full py-3 px-6 md:py-6 md:px-8 flex items-center justify-between hover:bg-gray-50/30 transition-all outline-none"
                                >
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full md:rounded-2xl flex items-center justify-center md:border border-gray-100 dark:border-white/10 shadow-sm md:shadow-none transition-all ${openFaq === faq._id ? 'bg-[#0c831f] text-white border-[#0c831f] scale-110' : 'bg-gray-50/50 md:bg-gray-50/50 dark:bg-white/5 text-gray-400'}`}>
                                            <HelpCircle size={20} className="md:w-6 md:h-6" />
                                        </div>
                                        <span className={`text-[13px] md:text-[16px] font-black text-left tracking-tight leading-snug transition-colors ${openFaq === faq._id ? 'text-[#0c831f]' : 'text-gray-900 dark:text-gray-100'}`}>{faq.question}</span>
                                    </div>
                                    {openFaq === faq._id ? <ChevronUp size={20} strokeWidth={3} className="text-[#0c831f]" /> : <ChevronDown size={20} strokeWidth={2.5} className="text-gray-300 group-hover:text-[#0c831f] transition-all" />}
                                </button>
                                {openFaq === faq._id && (
                                    <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="pl-14 md:pl-18 pr-0">
                                            <p className="text-[12px] md:text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed font-bold bg-gray-50/50 md:bg-gray-50/50 dark:bg-white/5 p-5 md:p-6 rounded-[24px] md:rounded-[28px] border border-gray-100/80 dark:border-white/5 shadow-inner">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <p className="text-gray-400 font-bold uppercase tracking-widest">No FAQs found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Email Support - Redesigned for Desktop */}
                <div className="mx-6 md:mx-0 mb-10 p-6 md:p-12 bg-white md:bg-white dark:bg-[#0c831f]/5 rounded-[32px] md:rounded-[40px] border border-dashed border-[#0c831f]/30 text-center group active:scale-95 transition-all duration-500 hover:shadow-xl md:hover:border-[#0c831f]">
                    <div className="w-14 h-14 md:w-24 md:h-24 bg-green-50 dark:bg-[#0c831f]/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-8 group-hover:scale-110 transition-transform shadow-inner">
                        <Mail size={24} className="text-[#0c831f] md:w-10 md:h-10" />
                    </div>
                    <h4 className="text-[14px] md:text-3xl font-black text-gray-900 dark:text-gray-100 mb-2 md:mb-4 tracking-tight">Need more personal help?</h4>
                    <p className="text-[10px] md:text-[13px] text-gray-500 mb-6 md:mb-10 font-bold uppercase tracking-[0.2em] opacity-80">Drop us a line at {settings.supportEmail}</p>
                    <a
                        href={`mailto:${settings.supportEmail}?subject=Support Request - sathiGro`}
                        className="w-full md:w-auto md:px-16 md:py-5 inline-flex items-center justify-center bg-[#0c831f] text-white py-4 rounded-xl md:rounded-[20px] font-black text-[12px] md:text-sm shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all uppercase tracking-[0.2em] hover:bg-[#0a6b19]"
                    >
                        Send Inquiry
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;

