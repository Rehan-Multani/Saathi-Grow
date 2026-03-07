import React, { useState } from 'react';
import { Headset, MessageCircle, HelpCircle, Phone, Mail, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const HelpPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            q: "How do I track my order?",
            a: "You can track your order in real-time by going to 'My Orders' section in your profile. Once an order is placed, you'll see a 'Track Order' button with the delivery partner's details."
        },
        {
            q: "What is sathiGro Wallet?",
            a: "sathiGro Wallet is a secure digital wallet where you can store money for faster checkouts. All refunds are credited instantly to your wallet."
        },
        {
            q: "What are the delivery hours?",
            a: "We operate from 6:00 AM to 11:00 PM every day, including weekends and public holidays, to ensure you get your essentials whenever you need them."
        },
        {
            q: "Is there a minimum order value?",
            a: "No, there is no minimum order value. However, orders below ₹99 may incur a nominal delivery fee unless you are a Saathi Plus member."
        }
    ];

    const handleChat = () => {
        // Mock WhatsApp integration or live chat
        window.open("https://wa.me/911234567890?text=Hello sathiGro Support, I need help with my order.", "_blank");
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:from-[#141414] dark:to-[#141414] md:bg-white md:bg-none dark:bg-none dark:bg-black md:dark:bg-black transition-colors duration-300 pb-20 md:p-10">
            <div className="max-w-2xl md:max-w-5xl mx-auto md:px-0">
                {/* Header - Dashboard Style */}
                <div className="flex items-center gap-3 px-4 py-6 md:px-0 md:py-0 md:mb-12 bg-white md:bg-transparent dark:bg-black md:dark:bg-black md:border-none sticky top-0 md:relative z-40">
                    <button
                        onClick={() => {
                            const from = location.state?.from || '/';
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
                <div className="mx-6 md:mx-0 mb-6 md:mb-16 bg-[#0c831f] rounded-[24px] md:rounded-[40px] p-6 md:p-12 text-white shadow-xl shadow-green-500/20 relative overflow-hidden group">
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
                                href="tel:+911234567890"
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
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="group bg-white md:bg-white dark:bg-[#121212] dark:md:bg-[#141414] md:border md:border-gray-100 dark:md:border-white/10 md:rounded-[28px] md:shadow-sm overflow-hidden md:border-b-0 transition-all md:hover:shadow-md md:hover:border-[#0c831f]/20"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full py-3 px-6 md:py-6 md:px-8 flex items-center justify-between hover:bg-gray-50/30 transition-all outline-none"
                                >
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full md:rounded-2xl flex items-center justify-center md:border border-gray-100 dark:border-white/10 shadow-sm md:shadow-none transition-all ${openFaq === i ? 'bg-[#0c831f] text-white border-[#0c831f] scale-110' : 'bg-gray-50/50 md:bg-gray-50/50 dark:bg-white/5 text-gray-400'}`}>
                                            <HelpCircle size={20} className="md:w-6 md:h-6" />
                                        </div>
                                        <span className={`text-[13px] md:text-[16px] font-black text-left tracking-tight leading-snug transition-colors ${openFaq === i ? 'text-[#0c831f]' : 'text-gray-900 dark:text-gray-100'}`}>{faq.q}</span>
                                    </div>
                                    {openFaq === i ? <ChevronUp size={20} strokeWidth={3} className="text-[#0c831f]" /> : <ChevronDown size={20} strokeWidth={2.5} className="text-gray-300 group-hover:text-[#0c831f] transition-all" />}
                                </button>

                                {openFaq === i && (
                                    <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="pl-14 md:pl-18 pr-0">
                                            <p className="text-[12px] md:text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed font-bold bg-gray-50/50 md:bg-gray-50/50 dark:bg-white/5 p-5 md:p-6 rounded-[24px] md:rounded-[28px] border border-gray-100/80 dark:border-white/5 shadow-inner">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Email Support - Redesigned for Desktop */}
                <div className="mx-6 md:mx-0 mb-10 p-6 md:p-12 bg-white md:bg-white dark:bg-[#0c831f]/5 rounded-[32px] md:rounded-[40px] border border-dashed border-[#0c831f]/30 text-center group active:scale-95 transition-all duration-500 hover:shadow-xl md:hover:border-[#0c831f]">
                    <div className="w-14 h-14 md:w-24 md:h-24 bg-green-50 dark:bg-[#0c831f]/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-8 group-hover:scale-110 transition-transform shadow-inner">
                        <Mail size={24} className="text-[#0c831f] md:w-10 md:h-10" />
                    </div>
                    <h4 className="text-[14px] md:text-3xl font-black text-gray-900 dark:text-gray-100 mb-2 md:mb-4 tracking-tight">Need more personal help?</h4>
                    <p className="text-[10px] md:text-[13px] text-gray-500 mb-6 md:mb-10 font-bold uppercase tracking-[0.2em] opacity-80">Drop us a line at support@sathiGro.com</p>
                    <a
                        href="mailto:support@sathiGro.com?subject=Support Request - sathiGro"
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

