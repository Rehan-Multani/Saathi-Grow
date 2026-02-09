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
            q: "What is SaathiGro Wallet?",
            a: "SaathiGro Wallet is a secure digital wallet where you can store money for faster checkouts. All refunds are credited instantly to your wallet, and you can also use it to earn and redeem loyalty points."
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
        window.open("https://wa.me/911234567890?text=Hello SaathiGro Support, I need help with my order.", "_blank");
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] md:bg-white md:bg-none dark:bg-none dark:bg-black md:dark:bg-black transition-colors duration-300 pb-20">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="hidden md:flex items-center gap-3 mb-0 p-4 bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] md:bg-white md:bg-none dark:bg-none dark:bg-black md:dark:bg-black border-b border-gray-100 dark:border-white/5 md:border-none transition-colors">
                    <button
                        onClick={() => {
                            const from = location.state?.from || '/';
                            const noMenuPages = ['/settings', '/profile'];
                            const shouldOpenMenu = !noMenuPages.includes(from);
                            navigate(from, { state: { openMenu: shouldOpenMenu } });
                        }}
                        className="p-1.5 md:p-2 bg-white/50 dark:bg-[#141414] rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={16} className="md:w-6 md:h-6" />
                    </button>
                    <h1 className="!text-[16px] md:!text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Help & Support</h1>
                </div>

                {/* Main Contact Section */}
                <div className="mx-6 mb-8 mt-6 bg-[#0c831f] rounded-[24px] p-5 text-white shadow-xl shadow-green-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Headset size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4 text-left">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                <Headset size={20} />
                            </div>
                            <div>
                                <h2 className="!text-[14px] font-black leading-tight">Customer Care</h2>
                                <p className="!text-[9px] opacity-80 font-bold uppercase tracking-widest mt-0.5">Available 24/7 for you</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <a
                                href="tel:+911234567890"
                                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-2.5 rounded-xl transition-all border border-white/10 font-black !text-[10px] active:scale-95 uppercase tracking-wider"
                            >
                                <Phone size={14} strokeWidth={3} /> Call Support
                            </a>
                            <button
                                onClick={handleChat}
                                className="flex items-center justify-center gap-2 bg-white text-[#0c831f] py-2.5 rounded-xl transition-all hover:brightness-110 font-black !text-[10px] shadow-lg active:scale-95 uppercase tracking-wider"
                            >
                                <MessageCircle size={14} strokeWidth={3} /> Live Chat
                            </button>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="px-0 md:px-4 mb-8">
                    <h3 className="!text-[10px] md:!text-xs font-bold text-gray-400 mb-2 px-6 md:px-2 tracking-widest uppercase">Common Questions</h3>
                    <div className="flex flex-col gap-0 md:gap-3 bg-transparent md:bg-transparent">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="group bg-transparent md:bg-white dark:md:bg-[#141414] md:border md:border-gray-100 dark:md:border-white/5 md:rounded-2xl md:shadow-sm overflow-hidden border-b border-gray-100/50 dark:border-white/5 md:border-b-0"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full py-5 px-6 md:py-4 md:px-2 flex items-center justify-between hover:bg-gray-50/50 transition-all outline-none"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full md:rounded-xl flex items-center justify-center md:border border-gray-100 dark:border-white/10 shadow-sm md:shadow-none transition-all ${openFaq === i ? 'bg-[#0c831f] text-white border-[#0c831f]' : 'bg-gray-50/50 md:bg-gray-50 dark:bg-white/5 text-gray-400'}`}>
                                            <HelpCircle size={18} />
                                        </div>
                                        <span className={`text-[13px] md:text-[11px] font-black text-left tracking-tight leading-snug pr-4 transition-colors ${openFaq === i ? 'text-[#0c831f]' : 'text-gray-800 dark:text-gray-200'}`}>{faq.q}</span>
                                    </div>
                                    {openFaq === i ? <ChevronUp size={16} className="text-[#0c831f]" /> : <ChevronDown size={16} className="text-gray-300 group-hover:text-[#0c831f] transition-colors" />}
                                </button>

                                {openFaq === i && (
                                    <div className="px-6 pb-6 pt-0 animate-in fade-in slide-in-from-top-2 duration-300 md:px-2">
                                        <div className="pl-14 pr-0 md:pr-4">
                                            <p className="text-[11px] md:text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium bg-gray-50/50 md:bg-gray-50 dark:bg-white/5 p-4 rounded-2xl md:p-3 md:rounded-2xl border border-gray-100/50 md:border-gray-100 dark:border-white/5">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Email Support */}
                <div className="mx-6 mb-10 p-6 bg-white dark:bg-[#0c831f]/5 rounded-[24px] border border-dashed border-[#0c831f]/20 text-center group active:scale-95 transition-transform duration-300">
                    <div className="w-12 h-12 bg-green-50 dark:bg-[#0c831f]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Mail size={22} className="text-[#0c831f]" />
                    </div>
                    <h4 className="!text-[12px] font-black text-gray-900 dark:text-gray-100 mb-1 tracking-tight">Prefer Email?</h4>
                    <p className="!text-[9px] text-gray-500 mb-5 font-bold uppercase tracking-widest opacity-70">Reach out at support@saathigro.com</p>
                    <a
                        href="mailto:support@saathigro.com?subject=Support Request - SaathiGro"
                        className="w-full inline-flex items-center justify-center bg-[#0c831f] text-white py-3 rounded-xl font-black !text-[11px] shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all uppercase tracking-widest"
                    >
                        Compose Message
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;
