import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Phone, Mail, MessageCircle, ArrowLeft, ChevronDown, ChevronUp, Bike, ShieldCheck, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PublicDeliverySupport = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);

    // Common Delivery FAQs
    const faqs = [
        {
            id: 1,
            question: "How do I become a SaathiGro Delivery Partner?",
            answer: "To register, go to the Delivery section in our app or click 'Register as Partner'. You'll need to submit your Aadhaar card, PAN card, a valid driving license, and bank account details. Once our team verifies your documents, your account will be activated."
        },
        {
            id: 2,
            question: "What are the eligibility requirements?",
            answer: "You must be at least 18 years old, possess a valid driving license, own a smartphone, and have a registered & roadworthy vehicle (two-wheeler/bicycle)."
        },
        {
            id: 3,
            question: "How and when do I get paid?",
            answer: "Payouts are processed weekly. All earnings for deliveries made from Monday to Sunday are calculated and credited directly to your registered bank account by the following Wednesday."
        },
        {
            id: 4,
            question: "Are there any registration or joining fees?",
            answer: "No, registration and onboarding on SaathiGro is absolutely free. We do not charge any joining fee or security deposit."
        },
        {
            id: 5,
            question: "Who do I contact in case of an issue during a delivery?",
            answer: "For real-time delivery support (e.g., customer unavailable, wrong location, payment issue), you can use the Live Support Chat option within the partner app or call our Delivery Partner Hotline."
        }
    ];

    const supportEmail = "delivery@Saathigro.com";
    const supportPhone = "+91 911 110 5006";
    const supportWhatsapp = "919111105006";

    const handleWhatsapp = () => {
        window.open(`https://wa.me/${supportWhatsapp}?text=Hello SaathiGro Delivery Support, I have a query about partnership.`, "_blank");
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
                        <h1 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Delivery Support Center</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Partner Onboarding & Operations Help</p>
                    </div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 p-6 rounded-2xl text-left">
                        <div className="w-10 h-10 bg-green-50 dark:bg-green-950/20 text-[#0c831f] rounded-xl flex items-center justify-center mb-4">
                            <Bike size={20} />
                        </div>
                        <h3 className="font-black text-sm text-gray-900 dark:text-white mb-1">Easy Onboarding</h3>
                        <p className="text-xs text-gray-500 font-medium">Verify your documents online and start delivering in less than 24 hours.</p>
                    </div>
                    <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 p-6 rounded-2xl text-left">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                            <Coins size={20} />
                        </div>
                        <h3 className="font-black text-sm text-gray-900 dark:text-white mb-1">Weekly Payouts</h3>
                        <p className="text-xs text-gray-500 font-medium">Get timely weekly payouts directly credited to your registered bank account.</p>
                    </div>
                    <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 p-6 rounded-2xl text-left">
                        <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/20 text-purple-500 rounded-xl flex items-center justify-center mb-4">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="font-black text-sm text-gray-900 dark:text-white mb-1">Dedicated Support</h3>
                        <p className="text-xs text-gray-500 font-medium">Dedicated support team to resolve issues during your active shifts.</p>
                    </div>
                </div>

                {/* Banner Contact Card */}
                <div className="bg-gradient-to-br from-gray-900 via-zinc-900 to-black rounded-3xl p-6 md:p-10 text-white shadow-xl mb-8 relative overflow-hidden group">
                    <div className="absolute right-0 bottom-0 translate-x-8 -translate-y-8 opacity-10 group-hover:scale-105 transition-transform pointer-events-none">
                        <Bike size={150} className="text-[#CCFF00]" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="text-left">
                            <span className="bg-[#CCFF00] text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider mb-3 inline-block">Partner Helpdesk</span>
                            <h2 className="text-xl md:text-3xl font-black tracking-tight mb-2">Delivery Partner Hotline</h2>
                            <p className="text-white/60 text-xs md:text-sm font-semibold max-w-md leading-relaxed">
                                Reach our dedicated support line for fast response regarding onboarding, technical errors, and payouts.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                            <a
                                href={`tel:${supportPhone}`}
                                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-3.5 px-6 rounded-xl transition-all border border-white/10 font-black text-[10px] uppercase tracking-widest active:scale-95 whitespace-nowrap text-white"
                            >
                                <Phone size={14} strokeWidth={3} /> Call Us
                            </a>
                            <button
                                onClick={handleWhatsapp}
                                className="flex items-center justify-center gap-2 bg-[#CCFF00] text-black hover:bg-[#b5e000] py-3.5 px-6 rounded-xl transition-all font-black text-[10px] shadow-lg active:scale-95 uppercase tracking-widest whitespace-nowrap"
                            >
                                <MessageCircle size={14} strokeWidth={3} /> WhatsApp
                            </button>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-10 text-left">
                    <h3 className="text-[10px] md:text-xs font-black text-gray-400/80 mb-4 tracking-[0.2em] uppercase">Onboarding & operational faqs</h3>
                    <div className="flex flex-col gap-3">
                        {faqs.map((faq) => (
                            <div
                                key={faq.id}
                                className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden transition-all hover:border-gray-200 dark:hover:border-white/10"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                                    className="w-full py-4 px-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all outline-none"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${openFaq === faq.id ? 'bg-[#CCFF00] text-black' : 'bg-slate-50 dark:bg-white/5 text-gray-400'}`}>
                                            <HelpCircle size={16} />
                                        </div>
                                        <span className={`text-xs md:text-sm font-black text-left tracking-tight ${openFaq === faq.id ? 'text-[#0c831f] dark:text-[#CCFF00]' : 'text-gray-900 dark:text-gray-200'}`}>
                                            {faq.question}
                                        </span>
                                    </div>
                                    {openFaq === faq.id ? (
                                        <ChevronUp size={16} strokeWidth={3} className="text-[#0c831f] dark:text-[#CCFF00]" />
                                    ) : (
                                        <ChevronDown size={16} strokeWidth={2.5} className="text-gray-300 dark:text-gray-600" />
                                    )}
                                </button>
                                <AnimatePresence>
                                    {openFaq === faq.id && (
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
                        ))}
                    </div>
                </div>

                {/* Email Support Card */}
                <div className="bg-white dark:bg-[#121212] border border-dashed border-gray-300 dark:border-white/10 rounded-3xl p-6 md:p-8 text-center transition-all hover:border-[#0c831f]">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={20} className="text-gray-500" />
                    </div>
                    <h4 className="text-sm md:text-lg font-black text-gray-900 dark:text-white mb-1 tracking-tight">Need document review or support?</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 mb-5 font-bold uppercase tracking-wider">
                        Send copies or queries to {supportEmail}
                    </p>
                    <a
                        href={`mailto:${supportEmail}?subject=Delivery Partner Query`}
                        className="inline-flex items-center justify-center bg-black hover:bg-gray-800 text-white py-3 px-8 rounded-xl font-black text-[10px] active:scale-95 uppercase tracking-widest transition-all"
                    >
                        Email Partner Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PublicDeliverySupport;
